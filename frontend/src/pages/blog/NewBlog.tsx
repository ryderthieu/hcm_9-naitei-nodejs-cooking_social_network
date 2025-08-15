import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import blog1 from "../../assets/Blog/blog1.png";
import blog2 from "../../assets/Blog/blog2.png";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

const NewBlog = () => {
  return (
    <div className="px-[300px] py-[30px]">
      <h1 className="font-bold text-center text-[28px]">
        Phong phú khẩu vị riêng của người Huế
      </h1>
      <div className="flex justify-center items-center gap-10 mt-[20px]">
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full"
            src={DEFAULT_AVATAR_URL}
            alt=""
          />
          <p className="text-[16px] font-bold">Huỳnh Văn Thiệu</p>
        </div>
        <div className="text-[16px] text-[rgba(0,0,0,0.6)] border-l-2 border-gray-200 pl-8 font-medium">
          Ngày 15 tháng 3 năm 2022
        </div>
      </div>
      <p className="my-4 text-[16px] text-center text-[rgba(0,0,0,0.6)]">
        Nét Văn Hóa Ẩm Thực Của Người Huế
      </p>
      <img
        className="mb-[30px] h-[350px] w-full object-cover rounded-3xl"
        src={blog1}
        alt=""
      />
      <div className="flex">
        <div className="w-[70%]">
          <h3 className="text-[20px] font-semibold mb-4">
            Người Huế thích vị ngọt thanh, vị đường vừa phải.
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Người Huế quen ăn cay, nhưng không phải đơn thuần là thích ăn ớt
            trái; khẩu vị cay của người Huế có vị cay của trái ớt và vị ớt đã
            qua các hình thức chế biến, có những vị cay cay, nồng nồng của tiêu,
            tỏi, gừng, riềng, sả, nghệ…cũng đã qua một vài hình thái chế biến
            như xay mịn, giã nhỏ, vắt lấy nước…dầm nước muối, nước mắm. Người
            Huế thích chế biến món ăn để có hương vị lạ hơn một chút, có lúc có
            vị giòn, có lúc là vị đắng, vị chát, vị bùi…để ăn ngon hơn, dù thức
            ăn đó là món rất bình thường, dân dã hay là thịt cá, cao lương mỹ
            vị. Nói chung là người Huế có “tật” chế biến. .
          </p>
          <h3 className="text-[20px] font-semibold mb-4">
            Người Huế thích những món ăn “thấm tháp”, có vị mặn hơn phía Nam,
            phía Bắc, nhưng không mặn theo kiểu Bắc Trung Bộ.
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            “Thấm tháp” cũng mặn, nhưng là vị mặn có đường, được kho rim, kho
            xăm xắp, được hon, hấp, chiên, xào rất thấm. Người Huế thích ăn chè,
            thích vị ngọt của mứt, bánh, kẹo, nhưng phải ngọt thanh, vị đường
            vừa phải. Người Huế hay dị ứng với kiểu “chặt to kho mặn”, thức ăn
            phải nhỏ, để gia vị thấm đều trên các bề mặt; món ăn để nguyên con
            (gà, vịt, bồ câu hầm…) phải hầm rục, dọn ra cũng nhỏ nhỏ, “thanh
            tao”, ăn vừa miệng. Khẩu vị của người Huế gần giống khẩu vị chung
            của miền Trung, nhưng đã qua quá trình điều chỉnh theo kiểu cách của
            vùng đất kinh kỳ.
          </p>
          <img className="mb-4 mx-auto" src={blog2} alt="" />
          <h3 className="text-[20px] font-semibold mb-4">
            Tại Nét Huế gần như mỗi món ăn lại kèm theo 1 loại nước chấm khác
            nhau.
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Không ngại phức tạp, không ngại mất công, chúng tôi luôn cố gắng
            mang đầy đủ nhất khẩu vị của của ẩm thực Huế đến với thực khách Hà
            Thành. Mỗi món ăn mang một hồn riêng, khẩu vị riêng bởi chính sự
            khác biệt của gia giảm đi kèm. Nó không chỉ là ẩm thực, là kinh
            nghiệm tích lũy trong khẩu vị ăn uống của người Huế trải qua hàng
            trăm năm từ thời vua chúa đến hiện tại mà còn là nét văn hóa ẩm thực
            đáng trân quý là lưu giữ. 
          </p>
          <div className="bg-[rgba(255,151,0,0.1)] text-center p-6 rounded-lg mt-4 font-medium text-[22px] italic my-[20px] ">
            “Hương vị Cố đô – Tinh hoa ẩm thực Huế, đậm đà bản sắc, tinh tế từng
            món ăn!”
          </div>
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

export default NewBlog;
