import { useState } from "react";
import { Storefront } from "@phosphor-icons/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ProductionScaler } from "@/components/bakery/ProductionScaler";
import { PricingAnalytics } from "@/components/bakery/PricingAnalytics";
import { SalesTracker } from "@/components/bakery/SalesTracker";
import { RecipeManager } from "@/components/bakery/RecipeManager";
import { useBakery } from "@/lib/use-bakery";

const Index = () => {
  const { recipes, catalog, sales, addSale, deleteSale } = useBakery();
  const [activeRecipeId, setActiveRecipeId] = useState<string>(recipes[0].id);

  const activeRecipe =
    recipes.find((r) => r.id === activeRecipeId) ?? recipes[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="container flex items-center gap-3 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-amber text-primary-foreground shadow-elevated">
            <Storefront className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Mooninary Bakery Operations
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Artisanal home bakery dashboard
            </p>
          </div>
        </div>
      </header>

      <main className="container space-y-6 py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5 sm:max-w-md sm:flex-1">
            <Label htmlFor="active-recipe" className="text-sm font-medium">
              Active Recipe
            </Label>
            <Select
              value={activeRecipeId}
              onValueChange={setActiveRecipeId}
            >
              <SelectTrigger id="active-recipe" className="bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs text-muted-foreground sm:text-right">
            Base yield ·{" "}
            <span className="font-medium text-foreground">
              {activeRecipe.baseYield} {activeRecipe.yieldUnit}
            </span>
          </div>
        </div>

        <Tabs defaultValue="scaler" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sm:w-auto sm:inline-flex">
            <TabsTrigger value="scaler">Production</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent
            value="scaler"
            className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-1"
          >
            <ProductionScaler recipe={activeRecipe} catalog={catalog} />
          </TabsContent>
          <TabsContent
            value="pricing"
            className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-1"
          >
            <PricingAnalytics recipe={activeRecipe} catalog={catalog} />
          </TabsContent>
          <TabsContent
            value="sales"
            className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-1"
          >
            <SalesTracker
              recipes={recipes}
              catalog={catalog}
              sales={sales}
              onAdd={addSale}
              onDelete={deleteSale}
            />
          </TabsContent>
          <TabsContent
            value="manage"
            className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-1"
          >
            <RecipeManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
