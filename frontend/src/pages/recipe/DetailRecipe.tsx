import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import RatingSection from "../../components/sections/Recipe/RecipeDetail/RatingSection";
import RecipeHeader from "../../components/sections/Recipe/RecipeDetail/RecipeHeader";
import RecipeImageSection from "../../components/sections/Recipe/RecipeDetail/RecipeImageSection";
import NutritionPanel from "../../components/sections/Recipe/RecipeDetail/NutritionPanel";
import IngredientsSection from "../../components/sections/Recipe/RecipeDetail/IngredientSection";
import InstructionsSection from "../../components/sections/Recipe/RecipeDetail/InstructionSection";
import { recipesService } from "../../services/recipe.service";
import { calculateNutrition } from "../../utils/recipeUtils";
import { useAuth } from "../../contexts/AuthContext";

interface RecipeDetailProps {
  className?: string;
}

export default function RecipeDetail({ className }: RecipeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [servings, setServings] = useState(1);
  const [calculatedNutrition, setCalculatedNutrition] = useState<any>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (!id) {
          setError("Recipe ID not found");
          return;
        }
        const recipeData = await recipesService.getRecipeById(Number(id));
        console.log("Recipe API data:", recipeData);
        setRecipe(recipeData);

        setError(null);

        setServings(recipeData?.servings || 1);
      } catch (err) {
        setError("Failed to load recipe");
        console.error("Error fetching recipe:", err);
      }
    };

    fetchRecipe();
  }, [id]);

  useEffect(() => {
    if (recipe?.ingredients?.length > 0) {
      try {
        const baseNutrition = calculateNutrition(recipe.ingredients);
        const servingRatio = servings / (recipe.servings || 1);

        const adjustedNutrition = {
          calories: Math.round(baseNutrition.calories * servingRatio * 10) / 10,
          protein: Math.round(baseNutrition.protein * servingRatio * 10) / 10,
          fat: Math.round(baseNutrition.fat * servingRatio * 10) / 10,
          carbs: Math.round(baseNutrition.carbs * servingRatio * 10) / 10,
          cholesterol:
            Math.round(baseNutrition.cholesterol * servingRatio * 10) / 10,
        };

        setCalculatedNutrition(adjustedNutrition);
      } catch (error) {
        console.error("Error calculating nutrition:", error);
        setCalculatedNutrition(null);
      }
    } else {
      setCalculatedNutrition(null);
    }
  }, [recipe, servings]);

  if (error || !recipe) {
    return (
      <div className="max-w-7xl mx-auto bg-white px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Recipe not found"}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto bg-white ${className || ""}`}>
      <RecipeHeader recipe={recipe} />

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <RecipeImageSection recipe={recipe} />
        <NutritionPanel calculatedNutrition={calculatedNutrition} />
      </div>

      <p className="text-gray-600 mb-8 text-base leading-relaxed">
        {recipe?.description || "No description available."}
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <IngredientsSection
            recipe={recipe}
            servings={servings}
            setServings={setServings}
          />
          <InstructionsSection recipe={recipe} />
          <RatingSection recipeId={recipe.id} />
        </div>
      </div>
    </div>
  );
}
