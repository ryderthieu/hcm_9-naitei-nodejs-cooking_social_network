import { useParams } from "react-router-dom";
import RatingSection from "../../components/sections/Recipe/RecipeDetail/RatingSection";

const DetailRecipe = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <p>Recipe not found</p>;

  return (
    <div className="mt-6 mx-[110px]">
      <RatingSection recipeId={Number(id)} />
    </div>
  );
};

export default DetailRecipe;
