import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import blog8 from "../../assets/blog/blog8.png";
import blog3 from "../../assets/blog/blog3.png";
import blog6 from "../../assets/blog/blog6.png";
import blog7 from "../../assets/blog/blog7.png";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

const HighlightedBlog = () => {
  return (
    <div className="px-[300px] py-[30px]">
      <h1 className="font-bold text-center text-[28px]">
        Yuzu Cheesecake – bánh kem <br /> phô mai vị chanh yuzu
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
          Ngày 15 tháng 3 năm 2022
        </div>
      </div>
      <p className="my-4 text-[16px] text-center text-[rgba(0,0,0,0.6)]">
        Bánh ngọt, dessert, pudding
      </p>
      <img
        className="mb-[30px] h-[350px] w-full object-cover rounded-3xl"
        src={blog8}
        alt=""
      />
      <div className="flex">
        <div className="w-[70%]">
          <h3 className="text-[20px] font-semibold mb-4">
            Yuzu là dòng chanh xuất xứ xa xưa từ Trung Quốc, nhưng nó lại rất
            phổ biến và là gia vị yêu thích của Nhật Bản.
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Chanh yuzu có thể được sử dụng lúc còn xanh hoặc đã chín vàng, quả
            có vỏ hơi sần sùi, nhỏ hơn quả bi-da một chút. Chanh yuzu có vị
            chua, nhưng không quá gắt, có hậu vị hơi thơm giống họ quýt và bưởi,
            tinh dầu trong quả yuzu tạo ra mùi hương đặc biệt, thường được dùng
            trong ẩm thực ví dụ như làm sốt, đồ uống, bánh trái, trà và sản xuất
            nước hoa…
          </p>
          <div className="flex gap-4 mb-4 justify-between">
            <img className="w-[48%] h-[50%]" src={blog6} alt="" />
            <img className="w-[48%] h-[50%]" src={blog3} alt="" />
          </div>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Yuzu trên thị trường khá đắt và hơi hiếm, do nhu cầu sử dụng cao
            nhưng nguồn cung lại chưa đủ. Cây yuzu thường được trồng ở Đông Á và
            khó canh tác ở những vùng đất khác, cần khá nhiều năm để cây ra quả.
            Hơn nữa nước trong yuzu khá ít, để không làm hư hại trái yuzu người
            ta phải thu hoạch quả bằng tay mà giá nhân công không hề rẻ, do đó
            giá thành yuzu bị đội lên rất nhiều. Cách dễ tìm hơn là bạn có thể
            tìm mua nước cốt yuzu đóng chai, và nếu pha trà làm bánh thì mua hũ
            mứt yuzu (yuzu honey) (chắc ở châu Âu đây là cách duy nhất), dù nó
            vẫn đắt so với các hũ mứt quả khác.
          </p>
          <img
            className="mx-auto mb-4 h-[250px] w-full object-cover rounded-3xl"
            src={blog7}
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

export default HighlightedBlog;
