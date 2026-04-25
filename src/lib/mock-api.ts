import MockAdapter from 'axios-mock-adapter';
import { AxiosInstance } from 'axios';
import { INITIAL_INGREDIENTS, INITIAL_RECIPES, SalesRecord, CatalogIngredient, Recipe } from './recipes';

// Generate some initial sales mock data
const today = new Date();
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

const INITIAL_SALES: SalesRecord[] = [
  {
    id: "sale-1",
    date: today.toISOString().split('T')[0],
    recipeId: "gatou-flan-base",
    quantitySold: 2,
    revenueReceived: 600000,
    period: "Week",
  },
  {
    id: "sale-2",
    date: lastWeek.toISOString().split('T')[0],
    recipeId: "choux-special",
    quantitySold: 50,
    revenueReceived: 750000,
    period: "Month",
  },
  {
    id: "sale-3",
    date: lastWeek.toISOString().split('T')[0],
    recipeId: "peach-cheesecake",
    quantitySold: 1,
    revenueReceived: 450000,
    period: "Month",
  }
];

let mockIngredients = [...INITIAL_INGREDIENTS];
let mockRecipes = [...INITIAL_RECIPES];
let mockSales = [...INITIAL_SALES];

export const setupMockApi = (api: AxiosInstance) => {
  // Pass the axios instance to the mock adapter
  // delayResponse simulates network latency
  const mock = new MockAdapter(api, { delayResponse: 500 });

  // --- Ingredients ---
  mock.onGet('/ingredients').reply(() => [200, mockIngredients]);

  mock.onPost('/ingredients').reply((config) => {
    const newIng = JSON.parse(config.data) as CatalogIngredient;
    const existingIndex = mockIngredients.findIndex(i => i.id === newIng.id);
    if (existingIndex >= 0) {
      mockIngredients[existingIndex] = newIng;
    } else {
      mockIngredients.push(newIng);
    }
    return [200, newIng];
  });

  mock.onPut(/\/ingredients\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const { unitCost } = JSON.parse(config.data);
    mockIngredients = mockIngredients.map(i => i.id === id ? { ...i, unitCost } : i);
    return [200, { success: true }];
  });

  mock.onDelete(/\/ingredients\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const used = mockRecipes.some((r) =>
      r.groups.some((g) => g.items.some((i) => i.ingredientId === id))
    );
    if (used) return [400, { error: "Ingredient is in use" }];
    
    mockIngredients = mockIngredients.filter(i => i.id !== id);
    return [200, { success: true }];
  });

  // --- Recipes ---
  mock.onGet('/recipes').reply(() => [200, mockRecipes]);

  mock.onPost('/recipes').reply((config) => {
    const newRecipe = JSON.parse(config.data) as Recipe;
    mockRecipes.push(newRecipe);
    return [200, newRecipe];
  });

  mock.onPut(/\/recipes\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const updatedRecipe = JSON.parse(config.data) as Recipe;
    mockRecipes = mockRecipes.map(r => r.id === id ? updatedRecipe : r);
    return [200, updatedRecipe];
  });

  mock.onDelete(/\/recipes\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    mockRecipes = mockRecipes.filter(r => r.id !== id);
    return [200, { success: true }];
  });

  // --- Sales ---
  mock.onGet('/sales').reply(() => [200, mockSales]);

  mock.onPost('/sales').reply((config) => {
    const newSale = JSON.parse(config.data) as SalesRecord;
    mockSales.push(newSale);
    return [200, newSale];
  });

  mock.onDelete(/\/sales\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    mockSales = mockSales.filter(s => s.id !== id);
    return [200, { success: true }];
  });

  console.log('[Mock API] Initialized');
  return mock;
};
