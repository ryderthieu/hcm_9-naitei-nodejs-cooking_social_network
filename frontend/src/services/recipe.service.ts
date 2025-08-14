import { post } from "./api.service";
import type { CreateRecipeDto } from "../types/recipe.type";

export const recipeService = {
  createRecipe: async (data: CreateRecipeDto) => {
    const response = await post("/recipes", data);
    return response.data;
  },
};
