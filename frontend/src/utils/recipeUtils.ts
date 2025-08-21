type Ingredient = {
  name?: string;
  quantity?: number | string;
  unit?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
    cholesterol?: number;
    energy?: number;
    lipid?: number;
    carbohydrates?: number;
    carbohydrate?: number;
  };
  ingredient?: {
    name?: string;
    nutrition?: {
      calories?: number;
      protein?: number;
      fat?: number;
      carbs?: number;
      cholesterol?: number;
      energy?: number;
      lipid?: number;
      carbohydrates?: number;
      carbohydrate?: number;
    };
    nutritionPer100g?: {
      calories?: number;
      protein?: number;
      fat?: number;
      carbs?: number;
      cholesterol?: number;
      energy?: number;
      lipid?: number;
      carbohydrates?: number;
      carbohydrate?: number;
    };
  };
};

export const calculateNutrition = (ingredients: Ingredient[]) => {
  if (!ingredients || ingredients.length === 0) {
    console.log("No ingredients provided for nutrition calculation");
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      cholesterol: 0,
    };
  }

  console.log("Calculating nutrition for ingredients:", ingredients);

  let totalNutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    cholesterol: 0,
  };

  ingredients.forEach((ingredient, index) => {
    console.log(`Processing ingredient ${index}:`, ingredient);

    let nutritionData = null;

    if (ingredient.nutrition) {
      nutritionData = ingredient.nutrition;
      console.log("Found nutrition in ingredient.nutrition:", nutritionData);
    } else if (ingredient.ingredient && ingredient.ingredient.nutrition) {
      nutritionData = ingredient.ingredient.nutrition;
      console.log(
        "Found nutrition in ingredient.ingredient.nutrition:",
        nutritionData
      );
    } else if (
      ingredient.ingredient &&
      ingredient.ingredient.nutritionPer100g
    ) {
      nutritionData = ingredient.ingredient.nutritionPer100g;
      console.log(
        "Found nutrition in ingredient.ingredient.nutritionPer100g:",
        nutritionData
      );
    }

    if (nutritionData) {
      const quantity =
        parseFloat(
          ingredient.quantity !== undefined ? String(ingredient.quantity) : "0"
        ) || 0;
      console.log(`Ingredient quantity: ${quantity}, unit: ${ingredient.unit}`);

      if (quantity > 0) {
        let multiplier = 1;

        if (ingredient.unit) {
          multiplier = convertQuantityToMultiplier(quantity, ingredient.unit);
        } else {
          multiplier = quantity / 100;
        }

        console.log(`Using multiplier: ${multiplier}`);

        const calories = nutritionData.calories || nutritionData.energy || 0;
        const protein = nutritionData.protein || 0;
        const fat = nutritionData.fat || nutritionData.lipid || 0;
        const carbs =
          nutritionData.carbs ||
          nutritionData.carbohydrates ||
          nutritionData.carbohydrate ||
          0;
        const cholesterol = nutritionData.cholesterol || 0;

        totalNutrition.calories += calories * multiplier;
        totalNutrition.protein += protein * multiplier;
        totalNutrition.fat += fat * multiplier;
        totalNutrition.carbs += carbs * multiplier;
        totalNutrition.cholesterol += cholesterol * multiplier;

        console.log(
          `Added nutrition for ${
            ingredient.name || ingredient.ingredient?.name || "unknown"
          }:`,
          {
            calories: calories * multiplier,
            protein: protein * multiplier,
            fat: fat * multiplier,
            carbs: carbs * multiplier,
            cholesterol: cholesterol * multiplier,
          }
        );
      }
    } else {
      console.warn(
        `No nutrition data found for ingredient:`,
        ingredient.name || ingredient.ingredient?.name || "unknown ingredient"
      );

      const ingredientName = (
        ingredient.name ||
        ingredient.ingredient?.name ||
        ""
      ).toLowerCase();
      const quantity =
        parseFloat(
          ingredient.quantity !== undefined ? String(ingredient.quantity) : "0"
        ) || 0;

      if (quantity > 0 && ingredientName) {
        const estimation = estimateNutritionFromName(
          ingredientName,
          quantity,
          ingredient.unit
        );
        if (estimation) {
          totalNutrition.calories += estimation.calories;
          totalNutrition.protein += estimation.protein;
          totalNutrition.fat += estimation.fat;
          totalNutrition.carbs += estimation.carbs;
          totalNutrition.cholesterol += estimation.cholesterol;
          console.log(
            `Used estimated nutrition for ${ingredientName}:`,
            estimation
          );
        }
      }
    }
  });

  (["calories", "protein", "fat", "carbs", "cholesterol"] as const).forEach(
    (key) => {
      totalNutrition[key] = Math.round(totalNutrition[key] * 10) / 10;
    }
  );

  console.log(
    "Calculated nutrition from backend ingredient data:",
    totalNutrition
  );
  return totalNutrition;
};

const convertQuantityToMultiplier = (
  quantity: number,
  unit: string
): number => {
  const unitLower = unit.toLowerCase();

  const conversionFactors: { [key: string]: number } = {
    kg: quantity * 10,
    g: quantity / 100,
    gram: quantity / 100,

    ml: quantity / 100,
    l: quantity * 10,
    lít: quantity * 10,
    cup: quantity * 2.4,
    tách: quantity * 2.4,

    tbsp: quantity * 0.15,
    tsp: quantity * 0.05,
    "thìa canh": quantity * 0.15,
    "thìa cà phê": quantity * 0.05,

    quả: quantity * 1.5,
    củ: quantity * 1.0,
    trái: quantity * 1.5,
    lát: quantity * 0.1,
    miếng: quantity * 0.5,
    nhúm: quantity * 0.02,
    ít: quantity * 0.05,
  };

  return unitLower in conversionFactors
    ? conversionFactors[unitLower]
    : quantity / 100;
};

export const formatQuantity = (quantity: number, unit?: string): string => {
  if (!quantity) return "Theo ý thích";

  const formattedQuantity =
    quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
  return unit ? `${formattedQuantity} ${unit}` : formattedQuantity;
};

export const calculateIngredientQuantity = (
  originalQuantity: number,
  originalServings: number,
  newServings: number
): number => {
  if (!originalQuantity || !originalServings || !newServings)
    return originalQuantity;

  const ratio = newServings / originalServings;
  return originalQuantity * ratio;
};

const estimateNutritionFromName = (
  ingredientName: string,
  quantity: number,
  unit?: string
) => {
  const name = ingredientName.toLowerCase();
  let multiplier = convertQuantityToMultiplier(quantity, unit || "g");

  const nutritionEstimates = {
    rice: { calories: 130, protein: 2.7, fat: 0.3, carbs: 28, cholesterol: 0 },
    chicken: {
      calories: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0,
      cholesterol: 85,
    },
    beef: { calories: 250, protein: 26, fat: 15, carbs: 0, cholesterol: 90 },
    pork: { calories: 242, protein: 27, fat: 14, carbs: 0, cholesterol: 80 },
    egg: { calories: 155, protein: 13, fat: 11, carbs: 1.1, cholesterol: 372 },
    oil: { calories: 884, protein: 0, fat: 100, carbs: 0, cholesterol: 0 },
    sugar: { calories: 387, protein: 0, fat: 0, carbs: 100, cholesterol: 0 },
    flour: { calories: 364, protein: 10, fat: 1, carbs: 76, cholesterol: 0 },
    milk: { calories: 42, protein: 3.4, fat: 1, carbs: 5, cholesterol: 5 },
    potato: { calories: 77, protein: 2, fat: 0.1, carbs: 17, cholesterol: 0 },
    onion: { calories: 40, protein: 1.1, fat: 0.1, carbs: 9.3, cholesterol: 0 },
    garlic: {
      calories: 149,
      protein: 6.4,
      fat: 0.5,
      carbs: 33,
      cholesterol: 0,
    },
    tomato: {
      calories: 18,
      protein: 0.9,
      fat: 0.2,
      carbs: 3.9,
      cholesterol: 0,
    },
  };

  for (const [key, nutrition] of Object.entries(nutritionEstimates)) {
    if (name.includes(key)) {
      return {
        calories: nutrition.calories * multiplier,
        protein: nutrition.protein * multiplier,
        fat: nutrition.fat * multiplier,
        carbs: nutrition.carbs * multiplier,
        cholesterol: nutrition.cholesterol * multiplier,
      };
    }
  }

  return null;
};
