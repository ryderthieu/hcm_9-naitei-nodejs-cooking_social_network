import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import blog9 from "../../assets/blog/blog9.png";
import blog4 from "../../assets/blog/blog4.png";
import blog5 from "../../assets/blog/blog5.png";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

const TrendingBlog = () => {
  return (
    <div className="px-[300px] py-[30px]">
      <h1 className="font-bold text-center text-[28px]">
        Gỏi cuốn kèm nước chấm tương đen
      </h1>
      <div className="flex justify-center items-center gap-10 my-4">
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full"
            src={DEFAULT_AVATAR_URL}
            alt=""
          />
          <p className="text-[16px] font-bold">Trịnh Thị Phương Quỳnh</p>
        </div>
        <div className="text-[16px] text-[rgba(0,0,0,0.6)] border-l-2 border-gray-200 pl-8 font-medium">
          Ngày 15 tháng 3 năm 2022
        </div>
      </div>
      <p className="mb-4 text-[16px] text-center text-[rgba(0,0,0,0.6)]">
        Ẩm thực Việt Nam
      </p>
      <img
        className="mb-[30px] h-[350px] w-full object-cover rounded-3xl"
        src={blog9}
        alt=""
      />
      <div className="flex">
        <div className="w-[70%]">
          <h3 className="text-[20px] font-semibold mb-4">
            Phần nước chấm gỏi cuốn từ bơ đậu phộng với vị ngọt vừa hòa quyện
            cùng vị béo tự nhiên của đậu phộng và vị thơm của bơ.
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Năm 2021 đã đến, đầu tiên mình xin chúc các bạn độc giả theo dõi
            trang Mykitchies một năm nhiều sức khỏe, nhiều niềm vui, công việc
            luôn suôn sẻ và gặp nhiều may mắn. Năm nay mình được đón giao thừa
            và Noel ở nhà mới (mình mới chuyển chỗ ở tháng 12 vừa rồi). Năm nay
            nhà nước cấm tụ tập trên 5 người và giờ giới nghiêm từ 21h đến 5h
            sáng ngày hôm sau, và cũng không cho dân bắn pháo nên cũng hơi buồn
            tẹo (thực ra là buồn vãi nồi). Chiều chủ nhật âm u, ở nhà u uất vì
            chả biết làm gì mà cũng chả muốn làm gì nên kiếm cái món gì trong
            đống ảnh đồ ăn hay chụp để viết bài.
          </p>
          <div className="flex gap-4 mb-4 justify-center">
            <img className="w-[49%] h-[49%]" src={blog4} alt="" />
            <img className="w-[49%] h-[49%]" src={blog5} alt="" />
          </div>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Bài mở màn năm mới thực ra không có gì đặc biệt, chủ yếu trong bài
            viết mình muốn chia sẻ một vài ý tưởng hay ho mà mình đã học lỏm
            được về món gỏi cuốn mà chắc ai đó sẽ cần, đặc biệt dành cho những
            bạn du học xa nhà có điều kiện hơi thiếu thốn về nguyên liệu. Gỏi
            cuốn là món ăn khá healthy vì nhiều rau, ăn thanh, lại nhẹ bụng, dễ
            chuẩn bị và nguyên liệu bổ rẻ dễ tìm kiếm, chủ yếu là vét tủ có gì
            ăn nấy. Mình từng hướng dẫn cho 1 bạn du học sinh mới sang làm món
            này để mời bạn bè nước ngoài của bạn ấy, và ai cũng hạnh phúc với
            thành phẩm 😀
            <br /> Ngoài nước chấm cơ bản là nước mắm tỏi ớt chua ngọt, bên mình
            còn có nước chấm tương đen kết hợp với bơ đậu phộng (peanut butter)
            vì tìm tương hột như ở nhà hơi khó khăn và tương này rất phù hợp với
            người nước ngoài ngại mùi nước mắm hoặc ăn chay 😀 Công thức nước
            chấm có vô vàn, dưới đây là 1 kiểu mình hay làm.
          </p>
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

export default TrendingBlog;
