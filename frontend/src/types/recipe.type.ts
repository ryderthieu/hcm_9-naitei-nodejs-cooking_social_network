export interface IngredientDto {
  ingredientId: number;
  quantity?: number;
  unit?: string;
}

export interface StepDto {
  description: string;
  image?: string;
}

export interface ImageDto {
  imageUrl: string;
}

export interface UtensilDto {
  utensil: string;
}

export interface CategoryDto {
  mealType?: string;
  cuisine?: string;
  occasions?: string;
  dietaryPreferences?: string;
  mainIngredients?: string;
  cookingMethod?: string;
  timeBased?: string;
  difficultyLevel?: string;
}

export interface CreateRecipeDto {
  authorId: number;
  title: string;
  slug?: string;
  description?: string;
  time?: number;
  ingredients: IngredientDto[];
  steps: StepDto[];
  images: ImageDto[];
  utensils: UtensilDto[];
  categories?: CategoryDto;
}

export interface UpdateRecipeDto {
  title?: string;
  description?: string;
  time?: number;
  ingredients?: IngredientDto[];
  steps?: StepDto[];
  images?: ImageDto[];
  utensils?: UtensilDto[];
  categories?: CategoryDto;
}

export interface QueryRecipesDto {
  name?: string;
  mealType?: string;
  cuisine?: string;
  occasions?: string;
  dietaryPreferences?: string;
  mainIngredient?: string;
  cookingMethod?: string;
  timeBased?: string;
  level?: string;
  savedBy?: string;
  limit?: number;
  page?: number;
}

export interface RatingDto {
  id: number;
  recipeId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  user: {
    userId: number;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface CreateRatingDto {
  rating: number;
  comment?: string;
}

export interface UpdateRatingDto {
  rating?: number;
  comment?: string;
}

export interface QueryRatingDto {
  rating?: number;
  limit?: number;
  page?: number;
}

export interface RecipeListItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type IngredientListItem = {
  id: number;
  name: string;
  unit?: string;
};

export type FormIngredient = {
  id: string;
  name: string;
  amount: string;
  unit: string;
  ingredientId: number | null;
};

export type FormStep = {
  id: string;
  summary: string;
  detail: string;
  time: string;
  images: string[];
};
