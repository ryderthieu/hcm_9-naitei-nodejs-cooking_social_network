export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SNACK = "SNACK",
  DESSERT = "DESSERT",
}

export enum Cuisine {
  VIETNAMESE = "VIETNAMESE",
  JAPANESE = "JAPANESE",
  KOREAN = "KOREAN",
  CHINESE = "CHINESE",
  THAI = "THAI",
  INDIAN = "INDIAN",
  EUROPEAN = "EUROPEAN",
  AMERICAN = "AMERICAN",
  MEXICAN = "MEXICAN",
}

export enum Occasions {
  PARTY = "PARTY",
  BIRTHDAY = "BIRTHDAY",
  HOLIDAY = "HOLIDAY",
  VEGETARIAN_DAY = "VEGETARIAN_DAY",
  WEATHER_BASED_FOOD = "WEATHER_BASED_FOOD",
}

export enum DietaryPreferences {
  VEGETARIAN = "VEGETARIAN",
  VEGAN = "VEGAN",
  KETO_LOW_CARB = "KETO_LOW_CARB",
  FUNCTIONAL_FOOD = "FUNCTIONAL_FOOD",
  GLUTEN_FREE = "GLUTEN_FREE",
  WEIGHT_LOSS = "WEIGHT_LOSS",
}

export enum MainIngredients {
  CHICKEN = "CHICKEN",
  BEEF = "BEEF",
  PORK = "PORK",
  SEAFOOD = "SEAFOOD",
  EGG = "EGG",
  VEGETABLES = "VEGETABLES",
  TOFU = "TOFU",
}

export enum CookingMethod {
  FRY = "FRY",
  GRILL = "GRILL",
  STEAM = "STEAM",
  STIR_FRY = "STIR_FRY",
  BOIL = "BOIL",
  SIMMER = "SIMMER",
  SOUP = "SOUP",
}

export enum TimeBased {
  UNDER_15_MIN = "UNDER_15_MIN",
  MIN_15_TO_30 = "MIN_15_TO_30",
  OVER_1_HOUR = "OVER_1_HOUR",
}

export enum DifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export const MealTypeMap: Record<MealType, string> = {
  [MealType.BREAKFAST]: "Bữa sáng",
  [MealType.LUNCH]: "Bữa trưa",
  [MealType.DINNER]: "Bữa tối",
  [MealType.SNACK]: "Ăn vặt",
  [MealType.DESSERT]: "Tráng miệng",
};

export const CuisineMap: Record<Cuisine, string> = {
  [Cuisine.VIETNAMESE]: "Việt Nam",
  [Cuisine.JAPANESE]: "Nhật Bản",
  [Cuisine.KOREAN]: "Hàn Quốc",
  [Cuisine.CHINESE]: "Trung Quốc",
  [Cuisine.THAI]: "Thái Lan",
  [Cuisine.INDIAN]: "Ấn Độ",
  [Cuisine.EUROPEAN]: "Châu Âu",
  [Cuisine.AMERICAN]: "Mỹ",
  [Cuisine.MEXICAN]: "Mexico",
};

export const OccasionsMap: Record<Occasions, string> = {
  [Occasions.PARTY]: "Tiệc tùng",
  [Occasions.BIRTHDAY]: "Sinh nhật",
  [Occasions.HOLIDAY]: "Lễ tết",
  [Occasions.VEGETARIAN_DAY]: "Ngày chay",
  [Occasions.WEATHER_BASED_FOOD]: "Theo thời tiết",
};

export const DietaryPreferencesMap: Record<DietaryPreferences, string> = {
  [DietaryPreferences.VEGETARIAN]: "Chay",
  [DietaryPreferences.VEGAN]: "Thuần chay",
  [DietaryPreferences.KETO_LOW_CARB]: "Keto/Ít carb",
  [DietaryPreferences.FUNCTIONAL_FOOD]: "Thực phẩm chức năng",
  [DietaryPreferences.GLUTEN_FREE]: "Không gluten",
  [DietaryPreferences.WEIGHT_LOSS]: "Giảm cân",
};

export const MainIngredientsMap: Record<MainIngredients, string> = {
  [MainIngredients.CHICKEN]: "Gà",
  [MainIngredients.BEEF]: "Bò",
  [MainIngredients.PORK]: "Heo",
  [MainIngredients.SEAFOOD]: "Hải sản",
  [MainIngredients.EGG]: "Trứng",
  [MainIngredients.VEGETABLES]: "Rau củ",
  [MainIngredients.TOFU]: "Đậu hũ",
};

export const CookingMethodMap: Record<CookingMethod, string> = {
  [CookingMethod.FRY]: "Chiên",
  [CookingMethod.GRILL]: "Nướng",
  [CookingMethod.STEAM]: "Hấp",
  [CookingMethod.STIR_FRY]: "Xào",
  [CookingMethod.BOIL]: "Luộc",
  [CookingMethod.SIMMER]: "Hầm",
  [CookingMethod.SOUP]: "Canh",
};

export const TimeBasedMap: Record<TimeBased, string> = {
  [TimeBased.UNDER_15_MIN]: "Dưới 15 phút",
  [TimeBased.MIN_15_TO_30]: "15-30 phút",
  [TimeBased.OVER_1_HOUR]: "Trên 1 giờ",
};

export const DifficultyLevelMap: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: "Dễ",
  [DifficultyLevel.MEDIUM]: "Trung bình",
  [DifficultyLevel.HARD]: "Khó",
};

export const getRecipeCategories = () => {
  return [
    {
      key: "mealType",
      name: "Bữa ăn",
      items: Object.values(MealType).map((value) => ({
        _id: value,
        name: MealTypeMap[value as MealType],
      })),
    },
    {
      key: "cuisine",
      name: "Ẩm thực",
      items: Object.values(Cuisine).map((value) => ({
        _id: value,
        name: CuisineMap[value as Cuisine],
      })),
    },
    {
      key: "occasions",
      name: "Dịp đặc biệt",
      items: Object.values(Occasions).map((value) => ({
        _id: value,
        name: OccasionsMap[value as Occasions],
      })),
    },
    {
      key: "dietaryPreferences",
      name: "Chế độ ăn",
      items: Object.values(DietaryPreferences).map((value) => ({
        _id: value,
        name: DietaryPreferencesMap[value as DietaryPreferences],
      })),
    },
    {
      key: "mainIngredients",
      name: "Nguyên liệu chính",
      items: Object.values(MainIngredients).map((value) => ({
        _id: value,
        name: MainIngredientsMap[value as MainIngredients],
      })),
    },
    {
      key: "cookingMethod",
      name: "Phương pháp nấu",
      items: Object.values(CookingMethod).map((value) => ({
        _id: value,
        name: CookingMethodMap[value as CookingMethod],
      })),
    },
    {
      key: "timeBased",
      name: "Thời gian nấu",
      items: Object.values(TimeBased).map((value) => ({
        _id: value,
        name: TimeBasedMap[value as TimeBased],
      })),
    },
    {
      key: "difficultyLevel",
      name: "Độ khó",
      items: Object.values(DifficultyLevel).map((value) => ({
        _id: value,
        name: DifficultyLevelMap[value as DifficultyLevel],
      })),
    },
  ];
};
