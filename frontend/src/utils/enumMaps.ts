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
