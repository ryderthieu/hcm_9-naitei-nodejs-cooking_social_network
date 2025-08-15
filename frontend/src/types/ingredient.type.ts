export interface QueryIngredientsDto {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface CreateIngredientDto {
  name: string;
  slug?: string;
  unit?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  image?: string;
  authorId?: number;
}

export interface UpdateIngredientDto {
  name?: string;
  slug?: string;
  unit?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  image?: string;
  authorId?: number;
}
