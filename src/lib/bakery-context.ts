import { createContext } from "react";
import {
  CatalogIngredient,
  Recipe,
  SalesRecord,
} from "./recipes";

export type BakeryCtx = {
  ingredients: CatalogIngredient[];
  catalog: Record<string, CatalogIngredient>;
  recipes: Recipe[];
  sales: SalesRecord[];
  upsertIngredient: (ing: CatalogIngredient) => void;
  updateIngredientCost: (id: string, unitCost: number) => void;
  deleteIngredient: (id: string) => boolean;
  addRecipe: (r: Recipe) => void;
  updateRecipe: (r: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addSale: (s: SalesRecord) => void;
  deleteSale: (id: string) => void;
};

export const BakeryContext = createContext<BakeryCtx | null>(null);
