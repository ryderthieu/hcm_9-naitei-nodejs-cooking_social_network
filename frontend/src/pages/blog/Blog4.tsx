import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import sl1 from "../../assets/blog/sl1.jpg";
import sl2 from "../../assets/blog/sl2.jpg";
import sl3 from "../../assets/blog/sl3.jpg";
import sl4 from "../../assets/blog/sl4.jpg";
import salad from "../../assets/blog/salad.jpg";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

const Blog4 = () => {
  return (
    <div className="px-[300px] py-[30px]">
      <h1 className="font-bold text-center text-[28px]">
        Cách làm salad tôm bơ nướng healthy <br /> chỉ với bếp ga đơn mini
      </h1>
      <div className="flex justify-center items-center gap-10 mt-[25px]">
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full"
            src={DEFAULT_AVATAR_URL}
            alt=""
          />
          <p className="text-[16px] font-bold">Ngô Thị Lễ Hội</p>
        </div>
        <div className="text-[16px] text-[rgba(0,0,0,0.6)] border-l-2 border-gray-200 pl-8 font-medium">
          Ngày 15 tháng 3 năm 2025
        </div>
      </div>
      <p className="my-4 text-[16px] text-center text-[rgba(0,0,0,0.6)]">
        Đồ ăn nhẹ, salad, món chính
      </p>
      <img
        className="mb-[30px] h-[350px] w-full object-cover rounded-3xl"
        src={salad}
        alt=""
      />
      <div className="flex">
        <div className="w-[70%]">
          <h3 className="text-[20px] font-semibold mb-1">Pha nước sốt</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Cho vào chén 3 thìa canh dầu olive, 2 thìa canh giấm táo, 1 thìa
            canh nước tương, 1 thìa canh mật ong và 1 ít tiêu rồi trộn đều lên.
          </p>
          <img
            src={sl1}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6 mb-1">
            Chuẩn bị các nguyên liệu
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Rau xà lách và rau mầm rửa sạch để ráo.
            <br />
            Cà chua bi cắt đôi, bơ cắt hạt lựu, ớt chuông cắt sợi, nấm đùi gà
            cắt lát.
            <br />
            Tôm làm sạch, bỏ đầu, lột vỏ, ướp một ít gia vị nếu muốn.
          </p>
          <img
            src={sl2}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">
            Nướng các nguyên liệu
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Dùng 1 cái rây, cho cà chua, nấm và ớt chuông vào, nướng trên lửa
            bếp ga.
            <br />
            Sau đó cho tôm vào rây và tiếp tục nướng cháy cạnh.
          </p>
          <img
            src={sl3}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Trộn salad</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Đầu tiên là xếp rau xà lách lên đĩa, sau đó đến cà chua, ớt chuông,
            nấm và bơ.
            <br />
            Bơ sẽ được dùng để làm topping, sau đó chang nước sốt lên.
            <br />
            Thêm 1 ít phô mai nếu muốn. Cuối cùng là rắc 1 ít rau mầm lên trên
            cho đẹp mắt.
          </p>
          <img
            src={sl4}
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

export default Blog4;
