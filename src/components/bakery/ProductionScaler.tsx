import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CatalogIngredient, Recipe, formatVND, lineCost } from "@/lib/recipes";
import { ArrowsOut, Sparkle } from "@phosphor-icons/react";

interface Props {
  recipe: Recipe;
  catalog: Record<string, CatalogIngredient>;
}

export const ProductionScaler = ({ recipe, catalog }: Props) => {
  const [target, setTarget] = useState<number>(recipe.baseYield);

  const scale = useMemo(
    () => (target > 0 ? target / recipe.baseYield : 0),
    [target, recipe.baseYield]
  );

  const fmtQty = (n: number) => n.toFixed(1);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowsOut className="h-5 w-5 text-primary" />
            Target Yield
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="target-yield">
              How many {recipe.yieldUnit}(s) do you want to make?
            </Label>
            <Input
              id="target-yield"
              type="number"
              min={0}
              step="1"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Base recipe yields {recipe.baseYield} {recipe.yieldUnit}.
            </p>
          </div>
          <div className="rounded-lg bg-gradient-amber px-6 py-4 text-primary-foreground shadow-elevated">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
              <Sparkle className="h-3.5 w-3.5" />
              Scale Factor
            </div>
            <div className="mt-1 text-3xl font-bold tabular-nums">
              {scale.toFixed(2)}x
            </div>
            <div className="text-xs opacity-90">Batch multiplier</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recipe.groups.map((group) => {
          const groupCost = group.items.reduce(
            (s, it) => s + lineCost(it, catalog),
            0
          );
          return (
            <Card
              key={group.name}
              className="border-border/60 shadow-card transition-shadow hover:shadow-elevated"
            >
              <CardHeader className="pb-3">
                <div className="flex items-baseline justify-between gap-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {group.name}
                  </CardTitle>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {formatVND(groupCost * scale)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border/60">
                  {group.items.map((it, idx) => {
                    const ing = catalog[it.ingredientId];
                    if (!ing) return null;
                    const isBundle = ing.unit === "bundle";
                    return (
                      <li
                        key={`${it.ingredientId}-${idx}`}
                        className="flex items-center justify-between py-2 transition-colors hover:bg-accent/40 -mx-2 px-2 rounded gap-3"
                      >
                        <span className="text-sm text-foreground truncate">
                          {ing.name}
                        </span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {isBundle
                              ? `${(it.qty * scale).toFixed(2)}×`
                              : `${fmtQty(it.qty * scale)} ${ing.unit}`}
                          </span>
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {formatVND(lineCost(it, catalog) * scale)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
