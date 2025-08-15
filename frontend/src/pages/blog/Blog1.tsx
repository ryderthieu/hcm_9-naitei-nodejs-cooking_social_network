import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import b1 from "../../assets/blog/b1.jpg";
import b2 from "../../assets/blog/b2.jpg";
import b3 from "../../assets/blog/b3.jpg";
import b4 from "../../assets/blog/b4.jpg";
import b5 from "../../assets/blog/b5.jpg";
import b6 from "../../assets/blog/b6.jpg";
import b7 from "../../assets/blog/b7.jpg";
import banh from "../../assets/blog/banh.jpg";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

const Blog1 = () => {
  return (
    <div className="px-[300px] py-[30px]">
      <h1 className="font-bold text-center text-[28px]">
        Cách làm bánh sừng bò (bánh croissant) <br /> thơm béo đúng chuẩn
      </h1>
      <div className="flex justify-center items-center gap-10 mt-[25px]">
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full"
            src={DEFAULT_AVATAR_URL}
            alt=""
          />
          <p className="text-[16px] font-bold">Trần Đỗ Phương Nhi</p>
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
        src={banh}
        alt=""
      />
      <div className="flex">
        <div className="w-[70%]">
          <h3 className="text-[20px] font-semibold mb-1">Nhào bột, nghỉ bột</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Pha sữa tươi với nước cốt chanh. Khuấy đều và để yên 10 - 15 phút
            cho sữa lên men và kết tủa. Dùng sữa này làm, bánh sẽ có độ xốp mềm
            ẩm và hương vị ngon hơn so với sữa thông thường.
            <br />
            Hòa tan men với 1 muỗng cà phê đường cùng với 6 muỗng canh nước ấm.
            Để khoảng 5 - 10 phút cho men nở.
            <br />
            Sau đó cho 1/2 lượng bột mì, phần đường trắng còn lại, bơ đun chảy,
            sữa tươi lên men, muối, 1 lòng đỏ trứng gà vào, trộn đều cho các
            nguyên liệu hòa quyện vào nhau.
            <br />
            Cho 1/2 lượng bột mì còn lại vào, nhào 10 - 15 phút cho bột thành
            hỗn hợp mềm, mịn.
            <br />
            Khối bột sau khi nhào xong sẽ dẻo và có độ đàn hồi tốt, ấn thử ngón
            tay lên mặt khối bột sẽ thấy phồng trở lại. Sau đó cho bột nghỉ
            khoảng 1 tiếng.
          </p>
          <img
            src={b1}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6 mb-1">
            Cán bơ lạt, ủ bột lần 1
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Cho bơ lạt vào túi zip cán cho nát đều. Sau đó để ngăn mát tủ lạnh
            30 phút.
            <br />
            Khi bột nghỉ đủ thời gian, bạn lấy bột ra, cán mỏng, cho vào ngăn
            mát tủ lạnh ủ khoảng 15 phút.
          </p>
          <img
            src={b2}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">
            Cán bột, gấp và ủ lần 2
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Sau 30 phút, lấy bơ lạt ra, dùng dao cắt xung quanh và bóc túi ni
            lông ra.
            <br />
            Lấy bột ra, cán mỏng. Đặt bơ lạt vào 1 bên hỗn hợp bột đã cán, gấp
            làm 3, bím xung quanh viền cho kín. Đặt vào tủ lạnh ủ thêm 30 phút.
          </p>
          <img
            src={b3}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">
            Cán bột, gấp và ủ lần 3
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Sau 30 phút, bạn lấy bột ra, cán theo chiều dài và gấp đôi lại. Bọc
            kín bột bánh bằng màng bọc thực phẩm, ủ lạnh thêm 30 phút nữa.
            <br />
            Sau đó, lấy bột ra, cán mỏng tiếp, rồi bọc kín bỏ lại vào ngăn mát
            tủ lạnh, ủ 6 - 7 tiếng.
          </p>
          <img
            src={b4}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Tạo hình</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Bột sau 6 - 7 tiếng, lấy ra để lên mặt phẳng có sẵn bột áo. Cán bột
            mỏng khoảng 3mm, rồi dùng dao cắt bột thành 12 miếng hình tam giác.
            <br />
            Quết bột áo lên trên. Cuộn từ phần đáy tam giác lên đỉnh, uốn hơi
            cong 2 đầu.
          </p>
          <img
            src={b5}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Nướng bánh</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Xếp bánh lên khay nướng có lót sẵn giấy nến. Nướng bánh ở nhiệt độ
            150 - 170 độ C.
            <br />
            7 phút đầu, nướng bánh ở 170 độ C, sau đó chỉnh lò xuống 150 độ C.
            <br />
            Tổng thời gian nướng bánh là 15 - 20 phút với chế độ 2 lửa (trên và
            dưới).
          </p>
          <img
            src={b6}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Thành phẩm</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Chiếc bánh sừng bò đã hoàn thành. Bánh xốp, mềm mịn, thơm, xé thành
            từng lớp mỏng và béo vị bơ. Các bạn có thể dùng không hoặc chấm với
            sữa đặc cho tăng thêm bị béo ngậy nhé!
          </p>
          <img
            src={b7}
            className="h-[300px] w-full object-cover rounded-2xl mb-4"
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

export default Blog1;
