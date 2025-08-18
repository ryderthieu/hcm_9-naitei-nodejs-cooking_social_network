import blog1 from "../../../assets/blog/blog1.png";
import blog2 from "../../../assets/blog/blog2.png";
import blog from "../../../assets/blog/blog3.png";

const DEFAULT_AVATAR_URL =
  "https://res.cloudinary.com/dfaq5hbmx/image/upload/v1749033098/general/bseoimm2ya0utf2duyyu.png";

const featuredRecipes = [
  {
    name: "Bài viết phổ biến",
    author: "Trịnh Thị Phương Quỳnh",
    desc: "Khám phá những bài viết phổ biến nhất trong cộng đồng nấu ăn của chúng ta. Từ công thức đơn giản đến mẹo nấu ăn hữu ích, bạn sẽ tìm thấy nhiều thông tin thú vị.",
    date: "2023-10-01",
    path: "/blog/bai-viet-pho-bien",
    image: blog1,
    ava: DEFAULT_AVATAR_URL,
  },
  {
    name: "Bài viết mới nhất",
    author: "Huỳnh Văn Thiệu",
    desc: "Cập nhật những bài viết mới nhất từ cộng đồng nấu ăn. Tìm hiểu các công thức mới, mẹo nấu ăn và xu hướng ẩm thực hiện đại.",
    path: "/blog/bai-viet-moi",
    image: blog,
    ava: DEFAULT_AVATAR_URL,
    date: "2023-10-05",
  },
  {
    name: "Bài viết nổi bật",
    author: "Trần Đỗ Phương Nhi",
    desc: "Khám phá những bài viết nổi bật trong cộng đồng nấu ăn. Những công thức độc đáo và mẹo nấu ăn sáng tạo đang chờ đón bạn.",
    path: "/blog/bai-viet-noi-bat",
    image: blog2,
    ava: DEFAULT_AVATAR_URL,
    date: "2023-10-10",
  },
];

const Blogs = () => {
  return (
    <div className="space-y-4">
      {featuredRecipes.map((recipe, index) => (
        <a href={recipe.path} key={index} className="block">
          <div className="flex gap-5 pb-6 border-b border-gray-100">
            <div className="flex-shrink-0">
              <img
                src={recipe.image}
                className="w-[240px] h-[180px] object-cover rounded-lg"
                alt={recipe.name}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-xl text-gray-800 mb-2">
                {recipe.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {recipe.desc}
              </p>
              <div className="flex items-center">
                {recipe.ava && (
                  <img
                    src={recipe.ava}
                    alt={recipe.author}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                )}
                <span className="text-sm font-medium text-gray-700 mr-4">
                  {recipe.author}
                </span>
                <span className="text-sm text-gray-500 border-l border-gray-200 pl-4">
                  {recipe.date}
                </span>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};

export default Blogs;
