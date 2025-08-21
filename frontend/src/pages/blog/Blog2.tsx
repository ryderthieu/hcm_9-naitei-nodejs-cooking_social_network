import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import bt1 from "../../assets/blog/bt1.jpg";
import bt2 from "../../assets/blog/bt2.jpg";
import bt3 from "../../assets/blog/bt3.jpg";
import botoi from "../../assets/blog/botoi.jpg";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

const Blog2 = () => {
  return (
    <div className="px-[300px] py-[30px]">
      <h1 className="font-bold text-center text-[28px]">
        Cách làm bánh mì bơ tỏi - Garlic Bread <br /> thơm ngon giòn rụm cho bữa
        ăn sáng
      </h1>
      <div className="flex justify-center items-center gap-10 mt-[25px]">
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full"
            src={DEFAULT_AVATAR_URL}
            alt=""
          />
          <p className="text-[16px] font-bold">Huỳnh Văn Thiệu</p>
        </div>
        <div className="text-[16px] text-[rgba(0,0,0,0.6)] border-l-2 border-gray-200 pl-8 font-medium">
          Ngày 15 tháng 3 năm 2025
        </div>
      </div>
      <p className="my-4 text-[16px] text-center text-[rgba(0,0,0,0.6)]">
        Bánh ngọt, dessert, pudding
      </p>
      <img
        className="mb-[30px] h-[350px] w-full object-cover rounded-3xl"
        src={botoi}
        alt=""
      />
      <div className="flex">
        <div className="w-[70%]">
          <h3 className="text-[20px] font-semibold mb-1">Làm hỗn hợp bơ tỏi</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Đầu tiên, bạn để bơ lạt ngoài nhiệt độ phòng cho mềm. Sau đó, bạn
            trộn đều bơ cùng với tỏi bằng máy xay thịt.
          </p>
          <img
            src={bt1}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6 mb-1">
            Quét bơ, nướng bánh
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Làm nóng lò nướng trước ở nhiệt độ 180 độ C trong 10 phút. Bạn cắt
            bánh mì thành các lát xéo vừa ăn.
            <br />
            Tiếp theo, bạn phết hỗn hợp bơ tỏi lên mặt bánh mì đã cắt xéo, rắc
            thêm lá oregano khô. Sau đó, bạn cho bánh vào lò và nướng bánh ở 180
            độ C đến khi bánh vàng đều là được.
          </p>
          <img
            src={bt2}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Thành phẩm</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Bánh mì bơ tỏi vừa nướng chín có mùi thơm nức mũi. Từng miếng bánh
            vàng ươm, cắn vào giòn rụm cùng vị bùi thơm của hỗn hợp bơ tỏi và lá
            oregano, đảm bảo nếm thử là mê tít.
          </p>
          <img
            src={bt3}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
        </div>
        <div className="w-[30%] flex flex-col items-center gap-4">
          <h3 className="font-semibold my-2">Chia sẻ với</h3>
          <FaFacebookF className="w-8 h-8 my-2 cursor-pointer" />
          <FaTwitter className="w-8 h-8 my-2 cursor-pointer" />
          <FaInstagram className="w-8 h-8 my-2 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default Blog2;
