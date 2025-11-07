

export interface ShoppingListItem {
  text: string;
  checked: boolean;
  category?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
}

export interface Deal {
  productName: string;
  salePrice: string | null;
  regularPrice?: string | null;
  store: 'Walmart' | 'Albertsons' | string;
  validUntil?: string;
  imageUrl?: string;
}

export interface RecipeIngredient {
    name: string;
    quantity: string;
    walmartPrice: string;
    albertsonsPrice: string;
    cheaperStore: 'Walmart' | 'Albertsons' | 'Tie' | 'N/A';
}

export interface Recipe {
    recipeName: string;
    servings: number;
    healthNotes: string[];
    instructions: string[];
    ingredients: RecipeIngredient[];
}

export enum AppTab {
    Deals,
    ShoppingList,
    Health,
    News,
    Subscription,
    Profile
}

export interface NewsArticle {
    title: string;
    source: string;
    summary: string;
    url: string;
    imageUrl?: string;
}
