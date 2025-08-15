import { post, get, put, del } from "./api.service";
import type {
  QueryIngredientsDto,
  CreateIngredientDto,
  UpdateIngredientDto,
} from "../types/ingredient.type";

export const ingredientService = {
  async getIngredients(query?: QueryIngredientsDto) {
    try {
      const response = await get(
        "/ingredients",
        query ? { params: query } : undefined
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createIngredient(createIngredientDto: CreateIngredientDto) {
    try {
      const response = await post("/ingredients", {
        ingredient: createIngredientDto,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateIngredient(id: number, updateIngredientDto: UpdateIngredientDto) {
    try {
      const response = await put(`/ingredients/${id}`, {
        ingredient: updateIngredientDto,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteIngredient(id: number) {
    try {
      const response = await del(`/ingredients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
