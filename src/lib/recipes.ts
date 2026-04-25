// Mooninary recipe + ingredient catalog
// Ingredients reference a central price catalog so users can edit unit costs in one place.

export type IngredientUnit = "g" | "ml" | "pcs" | "bundle";

export type CatalogIngredient = {
  id: string;
  name: string;
  unit: IngredientUnit;
  unitCost: number; // VND per unit (or per "bundle" for flat-cost items)
};

export type RecipeIngredient = {
  ingredientId: string;
  qty: number;
};

export type IngredientGroup = {
  name: string;
  items: RecipeIngredient[];
};

export type Recipe = {
  id: string;
  name: string;
  baseYield: number;
  yieldUnit: string;
  overhead: number;
  groups: IngredientGroup[];
};

// ========== Ingredient Catalog ==========
// Flat-cost bundles (e.g. "Vanilla / Salt") are modeled as unit "bundle" with qty 1.
export const INITIAL_INGREDIENTS: CatalogIngredient[] = [
  // Sweeteners & liquids
  { id: "sugar", name: "Sugar", unit: "g", unitCost: 25 },
  { id: "salt", name: "Salt", unit: "g", unitCost: 50 },
  { id: "lemon-juice", name: "Lemon juice", unit: "ml", unitCost: 100 },
  { id: "water", name: "Water", unit: "ml", unitCost: 0 },
  { id: "vanilla", name: "Vanilla extract", unit: "ml", unitCost: 400 },
  { id: "oil", name: "Cooking oil", unit: "g", unitCost: 30 },

  // Dairy & eggs
  { id: "egg", name: "Egg (whole)", unit: "pcs", unitCost: 2500 },
  { id: "yolk", name: "Egg yolk", unit: "pcs", unitCost: 2500 },
  { id: "milk", name: "Milk", unit: "ml", unitCost: 42 },
  { id: "whip-cream", name: "Whipping cream", unit: "ml", unitCost: 162 },
  { id: "butter", name: "Unsalted butter", unit: "g", unitCost: 325 },
  { id: "cream-cheese", name: "Cream cheese", unit: "g", unitCost: 260 },

  // Dry
  { id: "flour", name: "AP flour", unit: "g", unitCost: 22 },
  { id: "cocoa", name: "Cocoa powder", unit: "g", unitCost: 150 },
  { id: "cornstarch", name: "Cornstarch", unit: "g", unitCost: 60 },
  { id: "gelatine", name: "Gelatine", unit: "g", unitCost: 400 },
  { id: "almond-powder", name: "Almond powder", unit: "g", unitCost: 420 },
  { id: "oreo", name: "Oreo cookies", unit: "g", unitCost: 135 },

  // Fruit
  { id: "canned-peach", name: "Canned peaches", unit: "g", unitCost: 84 },
  { id: "peach-syrup", name: "Peach syrup (from can)", unit: "ml", unitCost: 0 },

  // Bundles (flat cost)
  { id: "bundle-extracts-salt", name: "Extracts / Salt bundle", unit: "bundle", unitCost: 5000 },
  { id: "bundle-oil-milk", name: "Oil / Milk bundle (gateau)", unit: "bundle", unitCost: 1500 },
  { id: "bundle-vanilla-salt-choux", name: "Vanilla / Salt bundle (choux)", unit: "bundle", unitCost: 3000 },
];

// ========== Recipes ==========
export const INITIAL_RECIPES: Recipe[] = [
  {
    id: "gatou-flan-base",
    name: "Gatou Flan Base (20cm)",
    baseYield: 1,
    yieldUnit: "cake",
    overhead: 68000,
    groups: [
      {
        name: "Caramel",
        items: [
          { ingredientId: "sugar", qty: 50 },
          { ingredientId: "lemon-juice", qty: 5 },
        ],
      },
      {
        name: "Flan Layer",
        items: [
          { ingredientId: "egg", qty: 3 },
          { ingredientId: "yolk", qty: 2 },
          { ingredientId: "sugar", qty: 70 },
          { ingredientId: "milk", qty: 400 },
          { ingredientId: "whip-cream", qty: 150 },
          { ingredientId: "gelatine", qty: 5 },
          { ingredientId: "bundle-extracts-salt", qty: 1 },
        ],
      },
      {
        name: "Gateau Layer",
        items: [
          { ingredientId: "flour", qty: 55 },
          { ingredientId: "cocoa", qty: 15 },
          { ingredientId: "bundle-oil-milk", qty: 1 },
          { ingredientId: "egg", qty: 3 },
          { ingredientId: "sugar", qty: 70 },
          { ingredientId: "bundle-extracts-salt", qty: 1 },
        ],
      },
    ],
  },
  {
    id: "gatou-flan-peach",
    name: "Gatou Flan w/ Peach (20cm)",
    baseYield: 1,
    yieldUnit: "cake",
    overhead: 68000,
    groups: [
      {
        name: "Caramel",
        items: [
          { ingredientId: "sugar", qty: 50 },
          { ingredientId: "lemon-juice", qty: 5 },
        ],
      },
      {
        name: "Flan Layer",
        items: [
          { ingredientId: "egg", qty: 3 },
          { ingredientId: "yolk", qty: 2 },
          { ingredientId: "sugar", qty: 70 },
          { ingredientId: "milk", qty: 400 },
          { ingredientId: "whip-cream", qty: 150 },
          { ingredientId: "gelatine", qty: 4 },
          { ingredientId: "bundle-extracts-salt", qty: 1 },
        ],
      },
      {
        name: "Gateau Layer",
        items: [
          { ingredientId: "flour", qty: 55 },
          { ingredientId: "cocoa", qty: 15 },
          { ingredientId: "bundle-oil-milk", qty: 1 },
          { ingredientId: "egg", qty: 3 },
          { ingredientId: "sugar", qty: 70 },
          { ingredientId: "bundle-extracts-salt", qty: 1 },
        ],
      },
      {
        name: "Peach Decoration",
        items: [{ ingredientId: "canned-peach", qty: 300 }],
      },
    ],
  },
  {
    id: "choux-custard",
    name: "Choux Custard Cream",
    baseYield: 20,
    yieldUnit: "pcs",
    overhead: 42000,
    groups: [
      {
        name: "Pastry Shell",
        items: [
          { ingredientId: "water", qty: 120 },
          { ingredientId: "butter", qty: 60 },
          { ingredientId: "flour", qty: 65 },
          { ingredientId: "egg", qty: 2 },
          { ingredientId: "sugar", qty: 2.5 },
          { ingredientId: "salt", qty: 2 },
        ],
      },
      {
        name: "Custard Cream (×2 batches)",
        items: [
          { ingredientId: "yolk", qty: 4 },
          { ingredientId: "sugar", qty: 80 },
          { ingredientId: "cornstarch", qty: 40 },
          { ingredientId: "milk", qty: 400 },
          { ingredientId: "butter", qty: 20 },
          { ingredientId: "bundle-vanilla-salt-choux", qty: 1 },
        ],
      },
    ],
  },
  {
    id: "choux-special",
    name: "Choux Special Cream",
    baseYield: 20,
    yieldUnit: "pcs",
    overhead: 42000,
    groups: [
      {
        name: "Pastry Shell",
        items: [
          { ingredientId: "water", qty: 120 },
          { ingredientId: "butter", qty: 60 },
          { ingredientId: "flour", qty: 65 },
          { ingredientId: "egg", qty: 2 },
          { ingredientId: "sugar", qty: 2.5 },
          { ingredientId: "salt", qty: 2 },
        ],
      },
      {
        name: "Base Custard (×2 batches)",
        items: [
          { ingredientId: "yolk", qty: 4 },
          { ingredientId: "sugar", qty: 80 },
          { ingredientId: "cornstarch", qty: 40 },
          { ingredientId: "milk", qty: 400 },
          { ingredientId: "butter", qty: 20 },
          { ingredientId: "bundle-vanilla-salt-choux", qty: 1 },
        ],
      },
      {
        name: "Special Cream Additions",
        items: [
          { ingredientId: "whip-cream", qty: 25 },
          { ingredientId: "cream-cheese", qty: 13 },
        ],
      },
    ],
  },
  {
    id: "almond-cookies",
    name: "Almond Cookies (~500g)",
    baseYield: 500,
    yieldUnit: "g",
    overhead: 35000,
    groups: [
      {
        name: "Dough",
        items: [
          { ingredientId: "butter", qty: 160 },
          { ingredientId: "sugar", qty: 90 },
          { ingredientId: "salt", qty: 2 },
          { ingredientId: "vanilla", qty: 5 },
          { ingredientId: "egg", qty: 1 },
          { ingredientId: "flour", qty: 150 },
          { ingredientId: "cornstarch", qty: 25 },
          { ingredientId: "almond-powder", qty: 25 },
        ],
      },
    ],
  },
  {
    id: "peach-cheesecake",
    name: "Peach Cheesecake (18cm)",
    baseYield: 1,
    yieldUnit: "cake",
    overhead: 60000,
    groups: [
      {
        name: "Crust Base",
        items: [
          { ingredientId: "oreo", qty: 120 },
          { ingredientId: "butter", qty: 40 },
        ],
      },
      {
        name: "Peach Cheese Cream",
        items: [
          { ingredientId: "gelatine", qty: 9 },
          { ingredientId: "water", qty: 30 },
          { ingredientId: "canned-peach", qty: 150 },
          { ingredientId: "peach-syrup", qty: 60 },
          { ingredientId: "cream-cheese", qty: 160 },
          { ingredientId: "sugar", qty: 40 },
          { ingredientId: "whip-cream", qty: 180 },
        ],
      },
      {
        name: "Decoration Layer",
        items: [
          { ingredientId: "peach-syrup", qty: 150 },
          { ingredientId: "gelatine", qty: 4 },
          { ingredientId: "canned-peach", qty: 300 },
          { ingredientId: "sugar", qty: 25 },
        ],
      },
    ],
  },
];

export const formatVND = (n: number): string =>
  `${Math.round(n).toLocaleString("en-US")} ₫`;

// ========== Helpers ==========
export const lineCost = (
  item: RecipeIngredient,
  catalog: Record<string, CatalogIngredient>
): number => {
  const ing = catalog[item.ingredientId];
  if (!ing) return 0;
  return ing.unitCost * item.qty;
};

export const recipeBaseCost = (
  recipe: Recipe,
  catalog: Record<string, CatalogIngredient>
): number =>
  recipe.groups.reduce(
    (sum, g) => sum + g.items.reduce((s, it) => s + lineCost(it, catalog), 0),
    0
  );

export const indexCatalog = (
  list: CatalogIngredient[]
): Record<string, CatalogIngredient> =>
  Object.fromEntries(list.map((i) => [i.id, i]));

export type SalesRecord = {
  id: string;
  date: string;
  recipeId: string;
  quantitySold: number;
  revenueReceived: number;
  period: "Week" | "Month";
};
