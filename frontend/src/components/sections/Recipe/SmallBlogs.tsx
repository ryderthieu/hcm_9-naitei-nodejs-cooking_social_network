import banh from "../../../assets/blog/banh.jpg";
import botoi from "../../../assets/blog/botoi.jpg";
import rc from "../../../assets/blog/rc.jpg";
import salad from "../../../assets/blog/salad.jpg";
import { Link } from "react-router-dom";

const featuredRecipes = [
  {
    name: "Cách làm bánh sừng bò (bánh croissant) thơm béo đúng chuẩn",
    author: "Trần Đỗ Phương Nhi",
    path: "/blog/1",
    image: banh,
  },
  {
    name: "Cách làm bánh mì bơ tỏi - Garlic Bread thơm ngon giòn rụm cho bữa ăn sáng",
    author: "Huỳnh Văn Thiệu",
    path: "/blog/2",
    image: botoi,
  },
  {
    name: "Cách làm bánh sinh nhật rau câu trái cây dễ làm, không cần máy đánh trứng",
    author: "Lê Đặng Hoàng Huy",
    path: "/blog/3",
    image: rc,
  },
  {
    name: "Cách làm salad tôm bơ nướng healthy chỉ với bếp ga đơn mini",
    author: "Ngô Thị Lễ Hội",
    path: "/blog/4",
    image: salad,
  },
];

const SmallBlogs = () => {
  return (
    <div className="space-y-4">
      {featuredRecipes.map((recipe, index) => (
        <Link to={recipe.path} key={index} className="flex gap-3 pb-4">
          <img
            src={recipe.image}
            className="w-[80px] h-[80px] object-cover rounded-md flex-shrink-0"
            alt={recipe.name}
          />
          <div>
            <h4 className="font-medium text-sm line-clamp-2 text-gray-800">
              {recipe.name}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{recipe.author}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SmallBlogs;
