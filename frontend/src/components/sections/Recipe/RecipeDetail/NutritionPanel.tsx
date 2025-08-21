interface NutritionData {
  calories?: number;
  fat?: number;
  protein?: number;
  carbs?: number;
  cholesterol?: number;
}

interface NutritionPanelProps {
  calculatedNutrition?: NutritionData;
}

export default function NutritionPanel({
  calculatedNutrition,
}: NutritionPanelProps) {
  console.log("NutritionPanel - calculatedNutrition:", calculatedNutrition);
  console.log("NutritionPanel - type:", typeof calculatedNutrition);
  console.log("NutritionPanel - is truthy:", !!calculatedNutrition);

  const defaultNutrition = [
    {
      label: "Calories",
      value: "270.9 kcal",
      highlight: true,
      category: "main",
    },
    { label: "Chất béo", value: "10.7 g", category: "main" },
    { label: "Protein", value: "7.9 g", category: "main" },
    { label: "Carbohydrate", value: "35.3 g", category: "main" },
    { label: "Cholesterol", value: "37.4 mg", category: "main" },
  ];

  const formatNutrientValue = (
    value: number | undefined,
    unit: string
  ): string => {
    console.log(
      `Formatting value: ${value}, unit: ${unit}, type: ${typeof value}`
    );

    if (value === undefined || value === null || isNaN(value)) {
      console.log(`Invalid value detected, returning 0 ${unit}`);
      return `0 ${unit}`;
    }

    const rounded = Math.round(value * 10) / 10;
    const formatted =
      rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    console.log(`Formatted result: ${formatted} ${unit}`);
    return `${formatted} ${unit}`;
  };
  const nutritionData =
    calculatedNutrition &&
    typeof calculatedNutrition === "object" &&
    Object.keys(calculatedNutrition).length > 0
      ? [
          {
            label: "Calories",
            value: formatNutrientValue(calculatedNutrition.calories, "kcal"),
            highlight: true,
            category: "main",
          },
          {
            label: "Chất béo",
            value: formatNutrientValue(calculatedNutrition.fat, "g"),
            category: "main",
          },
          {
            label: "Protein",
            value: formatNutrientValue(calculatedNutrition.protein, "g"),
            category: "main",
          },
          {
            label: "Carbohydrate",
            value: formatNutrientValue(calculatedNutrition.carbs, "g"),
            category: "main",
          },
          {
            label: "Cholesterol",
            value: formatNutrientValue(calculatedNutrition.cholesterol, "mg"),
            category: "main",
          },
        ]
      : defaultNutrition;

  console.log("Final nutritionData:", nutritionData);

  const mainNutrients = nutritionData.filter(
    (item) => item.category === "main"
  );

  return (
    <div className="lg:w-1/3">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-800">
            Bảng dinh dưỡng
          </h3>
        </div>

        <div className="text-sm space-y-3 mb-4">
          {mainNutrients.map((item, index) => (
            <div
              key={index}
              className="flex justify-between py-2 border-b border-gray-200 last:border-b-0"
            >
              <span className="text-gray-600">{item.label}</span>
              <span
                className={`${
                  item.highlight
                    ? "font-bold text-orange-600"
                    : "font-medium text-gray-800"
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4 italic">
          {calculatedNutrition
            ? "*Thông tin dinh dưỡng được tính toán từ các thành phần nguyên liệu có trong công thức."
            : "*Chưa thể tính toán thông tin dinh dưỡng."}
        </p>
      </div>
    </div>
  );
}
