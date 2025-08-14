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
