import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import sn1 from "../../assets/blog/sn1.jpg";
import sn2 from "../../assets/blog/sn2.jpg";
import sn3 from "../../assets/blog/sn3.jpg";
import sn4 from "../../assets/blog/sn4.jpg";
import sn5 from "../../assets/blog/sn5.jpg";
import sn6 from "../../assets/blog/sn6.jpg";
import rc from "../../assets/blog/rc.jpg";
import { DEFAULT_AVATAR_URL } from "../../constants/constants";

const Blog3 = () => {
  return (
    <div className="px-[300px] py-[30px]">
      <h1 className="font-bold text-center text-[28px]">
        Cách làm bánh sinh nhật rau câu trái cây dễ làm, <br /> không cần máy
        đánh trứng
      </h1>
      <div className="flex justify-center items-center gap-10 mt-[25px]">
        <div className="flex items-center gap-4">
          <img
            className="w-12 h-12 rounded-full"
            src={DEFAULT_AVATAR_URL}
            alt=""
          />
          <p className="text-[16px] font-bold">Lê Đặng Hoàng Huy</p>
        </div>
        <div className="text-[16px] text-[rgba(0,0,0,0.6)] border-l-2 border-gray-200 pl-8 font-medium">
          Ngày 20 tháng 3 năm 2025
        </div>
      </div>
      <p className="my-4 text-[16px] text-center text-[rgba(0,0,0,0.6)]">
        Bánh ngọt, dessert, pudding
      </p>
      <img
        className="mb-[30px] h-[350px] w-full object-cover rounded-3xl"
        src={rc}
        alt=""
      />
      <div className="flex">
        <div className="w-[70%]">
          <h3 className="text-[20px] font-semibold mb-1">Làm đáy bánh</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-4 leading-7 text-justify">
            Trước tiên, bạn hãy đun chảy 40gr bơ nhạt. Bạn hãy cắt một đoạn giấy
            nến để lót vào thành khuôn.
            <br />
            Bạn cho bánh quy bơ vào túi zip, dùng cây cán bột để cán nhuyễn bánh
            quy. Tiếp đến, bạn cho vào túi 10gr đường và 40gr bơ nhạt đã đun
            chảy vào, trộn đều.
            <br />
            Sau đó, bạn trút bánh quy cán nhuyễn vào khuôn bánh, dùng cây cán
            bột nén chặt mặt bánh rồi đem để khuôn bánh trong tủ đông hoặc ngăn
            đá tủ lạnh trong 30 phút.
          </p>
          <img
            src={sn1}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6 mb-1">Cắt trái cây</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Bạn cắt đôi quả thanh long, dùng dụng cụ múc kem để múc phần thịt
            của quả thanh long thành các viên tròn khoảng 25mm.
            <br />
            Tiếp đến, bạn sẽ cho phần thanh long ruột đỏ dư vào một cái rây,
            dùng muỗng tán nhuyễn.
          </p>
          <img
            src={sn2}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Làm cheese ball</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Trước hết, bạn sẽ cho 10gr bột gelatin và 50gr nước lọc vào chén
            nhỏ, khuấy đều và để 5 - 10 phút cho gelatin nở. Sau đó, bạn đem
            gelatin đi đun cách thủy hoặc cho vào lò vi sóng quay 10 giây cho
            gelatin tan chảy.
            <br />
            Bạn chuẩn bị một cái tô lớn, cho vào tô 250gr cream cheese, dùng
            phới trộn tán mịn. Tiếp đến, cho 50gr đường vào, trộn đều cho đường
            tan rồi cho thêm 5ml tinh chất vani và 10ml nước cốt chanh vào.
            <br />
            Cho tiếp 65gr sữa chua không đường rồi trộn đều. Tiếp theo, bạn cho
            gelatin đã đun chảy vào, khuấy đều. Bạn chia 250gr heavy cream thành
            2 phần rồi cho lần lượt vào tô, trộn đều hỗn hợp.
            <br />
            Sau đó, bạn lấy khoảng 230gr hỗn hợp trên cho vào khuôn làm thạch
            viên, cho khuôn vào ngăn đông trong 1 - 2 giờ.
            <br />
            Bạn đong tiếp 230gr hỗn hợp kem, cho thêm 25gr thanh long đã tán
            nhuyễn vào, trộn đều để tạo màu rồi cho hỗn hợp vào 1 cái khuôn làm
            thạch viên khác, bảo quản trong ngăn đông 1 - 2 giờ.
          </p>
          <img
            src={sn3}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">
            Làm lớp thạch trong suốt
          </h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Phần hỗn hợp kem cheese còn lại ở bước trên thì bạn sẽ cho vào khuôn
            bánh, dàn đều rồi cho vào ngăn mát tủ lạnh trong lúc chờ làm các
            bước tiếp theo.
            <br />
            Bạn cho 32gr bột gelatin vào tô, cho thêm 160gr nước lọc vào, khuấy
            đều rồi để yên 5 - 10 phút cho gelatin nở.
            <br />
            Sau đó, bạn đun sôi nước rồi rót 320gr nước sôi vào tô, vừa rót vừa
            khuấy đều để gelatin tan đều. Tiếp đến, bạn cho 105gr đường và 20gr
            nước cốt chanh vào, khuấy cho đường tan hết.
          </p>
          <img
            src={sn4}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Đổ khuôn</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Bạn chuẩn bị một cái khay rồi cho một ít nước nóng vào khay, sau đó
            đặt khuôn làm thạch viên vào ngâm trong 10 giây để dễ dàng tách
            khuôn cheese ball.
            <br />
            Tiếp đến, bạn lấy khuôn bánh ra, xếp các viên cheese ball và trái
            cây tươi xen kẽ nhau, sau đó múc hỗn hợp thạch trong suốt còn ấm rót
            vào, ngập xăm xắp nguyên liệu rồi cho khuôn bánh vào ngăn mát 3
            phút.
            <br />
            Sau đó, bạn xếp thêm 1 lớp các viên cheese ball và trái cây tươi rồi
            rưới hỗn hợp thạch thứ 2 lên trên, cho vào ngăn mát thêm 3 phút nữa.
            <br />
            Sau cùng, bạn cho hết phần viên cheese ball và trái cây tươi còn lại
            lên trên, rướt hết phần thạch trong suốt vào.
            <br />
            Bạn cho bánh vào ngăn mát, bảo quản trong 3 - 4 giờ cho bánh đông
            lại là có thể tách khuôn và thưởng thức.
          </p>
          <img
            src={sn5}
            className="h-[300px] w-full object-cover rounded-2xl"
            alt=""
          />
          <h3 className="text-[20px] font-semibold mt-6">Thành phẩm</h3>
          <p className="text-[rgba(0,0,0,0.6)] mb-3 leading-7 text-justify">
            Công thức bánh sinh nhật rau câu này sẽ có một màu đỏ tím đẹp mắt.
            Lớp thạch núng nính kết hợp với lớp kem cheese mằn mặn beo béo và
            lớp bánh quy béo bùi vô cùng ngon.
          </p>
          <img
            src={sn6}
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

export default Blog3;
