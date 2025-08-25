type Recipe = {
  image?: string[];
  name?: string;
};

interface RecipeImageSectionProps {
  recipe: Recipe;
}

export default function RecipeImageSection({
  recipe,
}: RecipeImageSectionProps) {
  return (
    <div className="lg:w-2/3">
      <div className="relative group">
        <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
          <img
            src={recipe?.image?.[0] || "/placeholder.svg?height=400&width=600"}
            alt={recipe?.name || "Recipe Image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
}
