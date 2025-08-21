import { get, post, put, del } from "./api.service";
import type {
  CreateRecipeDto,
  UpdateRecipeDto,
  QueryRecipesDto,
  CreateRatingDto,
  UpdateRatingDto,
  QueryRatingDto,
  RecipeListItem,
} from "../types/recipe.type";

export type { RecipeListItem };

export const recipesService = {
  async getRecipes(query?: QueryRecipesDto) {
    try {
      const response = await get(
        "/recipes",
        query ? { params: query } : undefined
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getRandomRecipes(query?: QueryRecipesDto) {
    try {
      const response = await get(
        "/recipes",
        query ? { params: query } : undefined
      );
      return response.data.slice(0, 6);
    } catch (error) {
      throw error;
    }
  },

  async getRecipesByUser(username: string) {
    try {
      const response = await get("/recipes", { params: { username } });
      return response.data.recipes;
    } catch (error) {
      throw error;
    }
  },

  async getRecipeById(id: number) {
    try {
      const response = await get(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createRecipe(createRecipeDto: CreateRecipeDto) {
    try {
      const response = await post("/recipes", createRecipeDto);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateRecipe(id: number, updateRecipeDto: UpdateRecipeDto) {
    try {
      const response = await put(`/recipes/${id}`, updateRecipeDto);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteRecipe(id: number) {
    try {
      const response = await del(`/recipes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createRating(recipeId: number, createRatingDto: CreateRatingDto) {
    try {
      const response = await post(
        `/recipes/${recipeId}/rating`,
        createRatingDto
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateRating(
    recipeId: number,
    ratingId: number,
    updateRatingDto: UpdateRatingDto
  ) {
    try {
      const response = await put(
        `/recipes/${recipeId}/rating/${ratingId}`,
        updateRatingDto
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteRating(ratingId: number, recipeId: number) {
    try {
      const response = await del(`/recipes/${recipeId}/rating/${ratingId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getRatings(recipeId: number, query?: QueryRatingDto) {
    try {
      const response = await get(
        `/recipes/${recipeId}/rating`,
        query ? { params: query } : undefined
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async findUserReviewForRecipe(recipeId: number) {
    try {
      const response = await get(`/recipes/${recipeId}/rating/me`);
      return response.data; // có thể null nếu chưa có review
    } catch (error) {
      throw error;
    }
  },
};
