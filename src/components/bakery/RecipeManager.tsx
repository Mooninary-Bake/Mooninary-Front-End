import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useBakery } from "@/lib/use-bakery";
import {
  CatalogIngredient,
  IngredientUnit,
  Recipe,
  formatVND,
  lineCost,
  recipeBaseCost,
} from "@/lib/recipes";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash, PencilSimple, Flask, Package } from "@phosphor-icons/react";

const slug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `id-${Date.now()}`;

const UNITS: IngredientUnit[] = ["g", "ml", "pcs", "bundle"];

export const RecipeManager = () => {
  const {
    ingredients,
    catalog,
    recipes,
    upsertIngredient,
    updateIngredientCost,
    deleteIngredient,
    addRecipe,
    updateRecipe,
    deleteRecipe,
  } = useBakery();

  return (
    <div className="space-y-8">
      <IngredientCatalogSection
        ingredients={ingredients}
        recipes={recipes}
        upsertIngredient={upsertIngredient}
        updateIngredientCost={updateIngredientCost}
        deleteIngredient={deleteIngredient}
      />
      <RecipeListSection
        recipes={recipes}
        ingredients={ingredients}
        catalog={catalog}
        addRecipe={addRecipe}
        updateRecipe={updateRecipe}
        deleteRecipe={deleteRecipe}
      />
    </div>
  );
};

/* ----------------------------- Ingredients ----------------------------- */

const IngredientCatalogSection = ({
  ingredients,
  recipes,
  upsertIngredient,
  updateIngredientCost,
  deleteIngredient,
}: {
  ingredients: CatalogIngredient[];
  recipes: Recipe[];
  upsertIngredient: (i: CatalogIngredient) => void;
  updateIngredientCost: (id: string, cost: number) => void;
  deleteIngredient: (id: string) => boolean;
}) => {
  const [editing, setEditing] = useState<CatalogIngredient | null>(null);
  const [open, setOpen] = useState(false);

  const usageCounts = useMemo(() => {
    const m = new Map<string, number>();
    recipes.forEach((r) =>
      r.groups.forEach((g) =>
        g.items.forEach((it) =>
          m.set(it.ingredientId, (m.get(it.ingredientId) ?? 0) + 1)
        )
      )
    );
    return m;
  }, [recipes]);

  const startNew = () => {
    setEditing({ id: "", name: "", unit: "g", unitCost: 0 });
    setOpen(true);
  };
  const startEdit = (ing: CatalogIngredient) => {
    setEditing(ing);
    setOpen(true);
  };

  return (
    <Card className="border-border/60 shadow-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            Ingredient Catalog
          </CardTitle>
          <CardDescription>
            Edit unit costs here — every recipe recalculates automatically.
          </CardDescription>
        </div>
        <Button onClick={startNew} size="sm" className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> New Ingredient
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Unit Cost (₫)</TableHead>
              <TableHead>Used in</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ing) => (
              <TableRow
                key={ing.id}
                className="transition-colors hover:bg-accent/40"
              >
                <TableCell className="font-medium">{ing.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {ing.unit}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={ing.unitCost}
                    onChange={(e) =>
                      updateIngredientCost(ing.id, Number(e.target.value))
                    }
                    aria-label={`Unit cost for ${ing.name}`}
                    className="ml-auto h-8 w-28 text-right tabular-nums"
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {usageCounts.get(ing.id) ?? 0} recipe(s)
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(ing)}
                      aria-label={`Edit ${ing.name}`}
                    >
                      <PencilSimple className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        const ok = deleteIngredient(ing.id);
                        if (!ok)
                          toast({
                            title: "Cannot delete",
                            description:
                              "This ingredient is used in one or more recipes.",
                            variant: "destructive",
                          });
                        else
                          toast({ title: "Ingredient removed" });
                      }}
                      aria-label={`Delete ${ing.name}`}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <IngredientDialog
        open={open}
        onOpenChange={setOpen}
        existingIds={new Set(ingredients.map((i) => i.id))}
        initial={editing}
        onSave={(ing) => {
          upsertIngredient(ing);
          toast({ title: "Saved", description: ing.name });
          setOpen(false);
        }}
      />
    </Card>
  );
};

const IngredientDialog = ({
  open,
  onOpenChange,
  initial,
  existingIds,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: CatalogIngredient | null;
  existingIds: Set<string>;
  onSave: (i: CatalogIngredient) => void;
}) => {
  const isNew = !initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState<IngredientUnit>(initial?.unit ?? "g");
  const [cost, setCost] = useState<number>(initial?.unitCost ?? 0);

  // Reset state when initial changes
  useMemo(() => {
    setName(initial?.name ?? "");
    setUnit(initial?.unit ?? "g");
    setCost(initial?.unitCost ?? 0);
  }, [initial]);

  const submit = () => {
    if (!name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const id = initial?.id || slug(name);
    if (isNew && existingIds.has(id)) {
      toast({
        title: "Duplicate ingredient",
        description: `"${name}" already exists.`,
        variant: "destructive",
      });
      return;
    }
    onSave({ id, name: name.trim(), unit, unitCost: Math.max(0, cost) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Add Ingredient" : `Edit "${initial?.name}"`}
          </DialogTitle>
          <DialogDescription>
            Used as a building block for recipes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ing-name">Name</Label>
            <Input
              id="ing-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Strawberry purée"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ing-unit">Unit</Label>
              <Select
                value={unit}
                onValueChange={(v) => setUnit(v as IngredientUnit)}
              >
                <SelectTrigger id="ing-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ing-cost">Unit cost (₫)</Label>
              <Input
                id="ing-cost"
                type="number"
                min={0}
                step="any"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: use unit <code className="font-mono">bundle</code> for flat
            costs like "Vanilla / Salt = 5,000 ₫".
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ------------------------------- Recipes ------------------------------- */

const RecipeListSection = ({
  recipes,
  ingredients,
  catalog,
  addRecipe,
  updateRecipe,
  deleteRecipe,
}: {
  recipes: Recipe[];
  ingredients: CatalogIngredient[];
  catalog: Record<string, CatalogIngredient>;
  addRecipe: (r: Recipe) => void;
  updateRecipe: (r: Recipe) => void;
  deleteRecipe: (id: string) => void;
}) => {
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [open, setOpen] = useState(false);

  const startNew = () => {
    setEditing({
      id: "",
      name: "",
      baseYield: 1,
      yieldUnit: "cake",
      overhead: 0,
      groups: [{ name: "Main", items: [] }],
    });
    setOpen(true);
  };

  return (
    <Card className="border-border/60 shadow-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flask className="h-5 w-5 text-primary" />
            Recipes
          </CardTitle>
          <CardDescription>
            Build recipes from catalog ingredients. Costs auto-calculate.
          </CardDescription>
        </div>
        <Button onClick={startNew} size="sm" className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> New Recipe
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {recipes.map((r) => {
            const cost = recipeBaseCost(r, catalog);
            return (
              <AccordionItem key={r.id} value={r.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-1 items-center justify-between pr-4 gap-3">
                    <div className="text-left">
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Yield {r.baseYield} {r.yieldUnit} · Overhead{" "}
                        {formatVND(r.overhead)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums text-primary">
                        {formatVND(cost)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        ingredient cost
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {r.groups.map((g) => (
                      <div key={g.name} className="rounded-md border border-border/60 p-3">
                        <div className="mb-2 flex justify-between text-sm font-semibold">
                          <span>{g.name}</span>
                          <span className="tabular-nums text-muted-foreground">
                            {formatVND(
                              g.items.reduce(
                                (s, it) => s + lineCost(it, catalog),
                                0
                              )
                            )}
                          </span>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {g.items.map((it, idx) => {
                            const ing = catalog[it.ingredientId];
                            if (!ing) return null;
                            return (
                              <li
                                key={idx}
                                className="flex justify-between text-muted-foreground"
                              >
                                <span>
                                  {ing.name} ·{" "}
                                  <span className="tabular-nums">
                                    {it.qty} {ing.unit === "bundle" ? "×" : ing.unit}
                                  </span>
                                </span>
                                <span className="tabular-nums">
                                  {formatVND(lineCost(it, catalog))}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(r);
                          setOpen(true);
                        }}
                      >
                        <PencilSimple className="mr-1.5 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          deleteRecipe(r.id);
                          toast({ title: "Recipe deleted" });
                        }}
                      >
                        <Trash className="mr-1.5 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>

      <RecipeDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        ingredients={ingredients}
        catalog={catalog}
        existingIds={new Set(recipes.map((r) => r.id))}
        onSave={(r, isNew) => {
          if (isNew) addRecipe(r);
          else updateRecipe(r);
          toast({ title: isNew ? "Recipe added" : "Recipe updated" });
          setOpen(false);
        }}
      />
    </Card>
  );
};

const RecipeDialog = ({
  open,
  onOpenChange,
  initial,
  ingredients,
  catalog,
  existingIds,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Recipe | null;
  ingredients: CatalogIngredient[];
  catalog: Record<string, CatalogIngredient>;
  existingIds: Set<string>;
  onSave: (r: Recipe, isNew: boolean) => void;
}) => {
  const isNew = !initial?.id;
  const [draft, setDraft] = useState<Recipe>(
    initial ?? {
      id: "",
      name: "",
      baseYield: 1,
      yieldUnit: "cake",
      overhead: 0,
      groups: [{ name: "Main", items: [] }],
    }
  );

  useMemo(() => {
    if (initial) setDraft(structuredClone(initial));
  }, [initial]);

  const updateGroup = (gi: number, patch: Partial<Recipe["groups"][number]>) =>
    setDraft((d) => {
      const groups = [...d.groups];
      groups[gi] = { ...groups[gi], ...patch };
      return { ...d, groups };
    });

  const addItem = (gi: number) =>
    setDraft((d) => {
      const groups = [...d.groups];
      groups[gi] = {
        ...groups[gi],
        items: [
          ...groups[gi].items,
          { ingredientId: ingredients[0]?.id ?? "", qty: 0 },
        ],
      };
      return { ...d, groups };
    });

  const updateItem = (
    gi: number,
    ii: number,
    patch: Partial<{ ingredientId: string; qty: number }>
  ) =>
    setDraft((d) => {
      const groups = [...d.groups];
      const items = [...groups[gi].items];
      items[ii] = { ...items[ii], ...patch };
      groups[gi] = { ...groups[gi], items };
      return { ...d, groups };
    });

  const removeItem = (gi: number, ii: number) =>
    setDraft((d) => {
      const groups = [...d.groups];
      groups[gi] = {
        ...groups[gi],
        items: groups[gi].items.filter((_, i) => i !== ii),
      };
      return { ...d, groups };
    });

  const addGroup = () =>
    setDraft((d) => ({
      ...d,
      groups: [...d.groups, { name: `Group ${d.groups.length + 1}`, items: [] }],
    }));

  const removeGroup = (gi: number) =>
    setDraft((d) => ({
      ...d,
      groups: d.groups.filter((_, i) => i !== gi),
    }));

  const totalCost = recipeBaseCost(draft, catalog);

  const submit = () => {
    if (!draft.name.trim()) {
      toast({ title: "Recipe name required", variant: "destructive" });
      return;
    }
    if (draft.baseYield <= 0) {
      toast({ title: "Base yield must be positive", variant: "destructive" });
      return;
    }
    const id = draft.id || slug(draft.name);
    if (isNew && existingIds.has(id)) {
      toast({ title: "Recipe ID conflict", variant: "destructive" });
      return;
    }
    onSave({ ...draft, id, name: draft.name.trim() }, isNew);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "New Recipe" : `Edit "${initial?.name}"`}</DialogTitle>
          <DialogDescription>
            Group ingredients by stage. Costs are computed from the catalog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="r-name">Name</Label>
              <Input
                id="r-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Matcha Roll Cake"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-yield">Base yield</Label>
              <Input
                id="r-yield"
                type="number"
                min={1}
                value={draft.baseYield}
                onChange={(e) =>
                  setDraft({ ...draft, baseYield: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-unit">Yield unit</Label>
              <Input
                id="r-unit"
                value={draft.yieldUnit}
                onChange={(e) =>
                  setDraft({ ...draft, yieldUnit: e.target.value })
                }
                placeholder="cake, pcs, g..."
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="r-overhead">Overhead per batch (₫)</Label>
              <Input
                id="r-overhead"
                type="number"
                min={0}
                value={draft.overhead}
                onChange={(e) =>
                  setDraft({ ...draft, overhead: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            {draft.groups.map((g, gi) => (
              <div key={gi} className="rounded-md border border-border/60 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={g.name}
                    onChange={(e) => updateGroup(gi, { name: e.target.value })}
                    className="h-8 font-semibold"
                    aria-label="Group name"
                  />
                  {draft.groups.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeGroup(gi)}
                      aria-label="Remove group"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {g.items.map((it, ii) => {
                    const ing = catalog[it.ingredientId];
                    return (
                      <div
                        key={ii}
                        className="grid grid-cols-[1fr_90px_auto_auto] items-center gap-2"
                      >
                        <Select
                          value={it.ingredientId}
                          onValueChange={(v) =>
                            updateItem(gi, ii, { ingredientId: v })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Ingredient" />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredients.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id}>
                                {opt.name} ({opt.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(gi, ii, { qty: Number(e.target.value) })
                          }
                          className="h-9 text-right tabular-nums"
                          aria-label="Quantity"
                        />
                        <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">
                          {formatVND(lineCost(it, catalog))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(gi, ii)}
                          aria-label="Remove ingredient"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(gi)}
                    className="w-full"
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Add ingredient
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addGroup}>
              <Plus className="mr-1.5 h-4 w-4" /> Add group
            </Button>
          </div>

          <div className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Ingredient total</span>
            <span className="font-semibold tabular-nums text-primary">
              {formatVND(totalCost)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save Recipe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
