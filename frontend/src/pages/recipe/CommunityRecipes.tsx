import CarouselPlugin from "../../components/sections/Home/CarouselHero";
import AllBlogs from "../../components/sections/Recipe/BlogSection";
import RecipeGrid from "../../components/sections/Recipe/RecipeGrid";

const CommunityRecipes = () => {
  return (
    <div className="">
      <CarouselPlugin />
      <div className="mx-[124px] my-4">
        <AllBlogs />
        <RecipeGrid title="Công thức nổi bật" />
      </div>
    </div>
  );
};

export default CommunityRecipes;
