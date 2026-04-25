import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CatalogIngredient,
  Recipe,
  formatVND,
  recipeBaseCost,
} from "@/lib/recipes";
import { Coins, Tag, TrendUp } from "@phosphor-icons/react";

interface Props {
  recipe: Recipe;
  catalog: Record<string, CatalogIngredient>;
}

export const PricingAnalytics = ({ recipe, catalog }: Props) => {
  const [margin, setMargin] = useState<number>(50);

  const { baseCost, totalCost, recommendedPrice, profit } = useMemo(() => {
    const baseCost = recipeBaseCost(recipe, catalog);
    const totalCost = baseCost + recipe.overhead;
    const m = Math.min(Math.max(margin, 1), 99) / 100;
    const recommendedPrice = totalCost / (1 - m);
    const profit = recommendedPrice - totalCost;
    return { baseCost, totalCost, recommendedPrice, profit };
  }, [recipe, catalog, margin]);

  const perUnitCost = totalCost / recipe.baseYield;
  const perUnitPrice = recommendedPrice / recipe.baseYield;
  const perUnitProfit = profit / recipe.baseYield;

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Target Profit Margin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="margin">Margin</Label>
            <span className="text-3xl font-bold tabular-nums text-primary">
              {margin}%
            </span>
          </div>
          <Slider
            id="margin"
            min={10}
            max={80}
            step={1}
            value={[margin]}
            onValueChange={(v) => setMargin(v[0])}
            aria-label="Target profit margin"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10%</span>
            <span>45%</span>
            <span>80%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-border/60 shadow-card">
          <div className="bg-gradient-slate px-5 py-4 text-neutral-foreground">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
              <Coins className="h-3.5 w-3.5" />
              Total Unit Cost
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {formatVND(totalCost)}
            </div>
            <div className="mt-0.5 text-xs opacity-80">
              per batch · {formatVND(perUnitCost)} / {recipe.yieldUnit}
            </div>
          </div>
          <CardContent className="space-y-1.5 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingredients</span>
              <span className="font-medium tabular-nums">
                {formatVND(baseCost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overhead</span>
              <span className="font-medium tabular-nums">
                {formatVND(recipe.overhead)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 shadow-card">
          <div className="bg-gradient-amber px-5 py-4 text-primary-foreground">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
              <Tag className="h-3.5 w-3.5" />
              Recommended Price
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {formatVND(recommendedPrice)}
            </div>
            <div className="mt-0.5 text-xs opacity-90">
              per batch · {formatVND(perUnitPrice)} / {recipe.yieldUnit}
            </div>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Sell at this price to hit your{" "}
            <span className="font-semibold text-foreground">{margin}%</span>{" "}
            margin target.
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 shadow-card">
          <div className="bg-gradient-emerald px-5 py-4 text-profit-foreground">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
              <TrendUp className="h-3.5 w-3.5" />
              Gross Profit / Unit
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {formatVND(perUnitProfit)}
            </div>
            <div className="mt-0.5 text-xs opacity-90">
              per batch · {formatVND(profit)}
            </div>
          </div>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            That's{" "}
            <span className="font-semibold text-profit">
              {((profit / recommendedPrice) * 100).toFixed(1)}%
            </span>{" "}
            of revenue.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
