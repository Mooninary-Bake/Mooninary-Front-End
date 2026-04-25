import { ReactNode, useMemo, useState, useEffect } from "react";
import {
  CatalogIngredient,
  Recipe,
  SalesRecord,
  indexCatalog,
} from "./recipes";
import { BakeryContext, BakeryCtx } from "./bakery-context";
import api from "./axios";

export const BakeryProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<CatalogIngredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/ingredients'),
      api.get('/recipes'),
      api.get('/sales')
    ]).then(([ingRes, recRes, salRes]) => {
      setIngredients(ingRes.data);
      setRecipes(recRes.data);
      setSales(salRes.data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch initial data", err);
      setLoading(false);
    });
  }, []);

  const catalog = useMemo(() => indexCatalog(ingredients), [ingredients]);

  const value: BakeryCtx = {
    ingredients,
    catalog,
    recipes,
    sales,
    upsertIngredient: (ing) => {
      api.post('/ingredients', ing).then(() => {
        setIngredients((prev) => {
          const i = prev.findIndex((x) => x.id === ing.id);
          if (i === -1) return [...prev, ing];
          const next = [...prev];
          next[i] = ing;
          return next;
        });
      }).catch(err => console.error(err));
    },
    updateIngredientCost: (id, unitCost) => {
      api.put(`/ingredients/${id}`, { unitCost }).then(() => {
        setIngredients((prev) =>
          prev.map((x) => (x.id === id ? { ...x, unitCost } : x))
        );
      }).catch(err => console.error(err));
    },
    deleteIngredient: (id) => {
      const used = recipes.some((r) =>
        r.groups.some((g) => g.items.some((i) => i.ingredientId === id))
      );
      if (used) return false;
      
      api.delete(`/ingredients/${id}`).then(() => {
        setIngredients((prev) => prev.filter((x) => x.id !== id));
      }).catch(err => console.error(err));
      return true;
    },
    addRecipe: (r) => {
      api.post('/recipes', r).then(() => {
        setRecipes((prev) => [...prev, r]);
      }).catch(err => console.error(err));
    },
    updateRecipe: (r) => {
      api.put(`/recipes/${r.id}`, r).then(() => {
        setRecipes((prev) => prev.map((x) => (x.id === r.id ? r : x)));
      }).catch(err => console.error(err));
    },
    deleteRecipe: (id) => {
      api.delete(`/recipes/${id}`).then(() => {
        setRecipes((prev) => prev.filter((x) => x.id !== id));
      }).catch(err => console.error(err));
    },
    addSale: (s) => {
      api.post('/sales', s).then(() => {
        setSales((prev) => [...prev, s]);
      }).catch(err => console.error(err));
    },
    deleteSale: (id) => {
      api.delete(`/sales/${id}`).then(() => {
        setSales((prev) => prev.filter((s) => s.id !== id));
      }).catch(err => console.error(err));
    },
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center text-muted-foreground gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p>Loading Bakery Data...</p>
      </div>
    );
  }

  return (
    <BakeryContext.Provider value={value}>{children}</BakeryContext.Provider>
  );
};
