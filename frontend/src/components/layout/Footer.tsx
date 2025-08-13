const Footer = () => {
  return (
    <div className="bg-[#03051A]">
      <div className="grid grid-cols-4 text-white pb-8 px-[120px] mt-[50px]">
        <div>
          <div>
            <h1 className="font-bold text-[20px]">ĐỊA CHỈ</h1>
            <p className="text-[#FFFFFF] text-opacity-50">
              Khu phố 6, Linh Trung, Thủ Đức, HCM
            </p>
          </div>
          <div>
            <h1 className="font-bold text-[20px] pt-8">HOTLINE</h1>
            <p className="text-[#FFFFFF] text-opacity-50">0 8386 8386</p>
          </div>
          <div>
            <h1 className="font-bold text-[20px] pt-8">EMAIL</h1>
            <p className="text-[#FFFFFF] text-opacity-50">chat@oshisha.com</p>
          </div>
        </div>

        <div className="ml-[30px] mr-[60px]">
          <h1 className="text-[20px] font-bold">Các mục nổi bật</h1>
          <a href="/">
            <p className="pt-4 hover:text-white text-[#FFFFFF] text-opacity-50">
              Trang chủ
            </p>
          </a>
          <a href="/recipes">
            <p className="pt-4 hover:text-white text-[#FFFFFF] text-opacity-50">
              Công thức
            </p>
          </a>
          <a href="/explore/posts">
            <p className="pt-4 hover:text-white text-[#FFFFFF] text-opacity-50">
              Lướt tin
            </p>
          </a>
          <a href="/about">
            <p className="pt-4 hover:text-white text-[#FFFFFF] text-opacity-50">
              Về chúng tôi
            </p>
          </a>
        </div>

        <div>
          <h1 className="text-[20px] font-bold">Blog ẩm thực</h1>
          <a href="/blog/bai-viet-moi">
            <p className="pt-4 hover:text-white text-[#FFFFFF] text-opacity-50">
              Bài viết mới nhất
            </p>
          </a>
          <a href="/blog/bai-viet-noi-bat">
            <p className="pt-4 hover:text-white text-[#FFFFFF] text-opacity-50">
              Bài viết nổi bật
            </p>
          </a>
          <a href="/blog/bai-viet-pho-bien">
            <p className="pt-4 hover:text-white text-[#FFFFFF] text-opacity-50">
              Bài viết phổ biến
            </p>
          </a>
        </div>

        <div>
          <h1 className="text-[20px] font-bold">Hỗ trợ</h1>
          <a
            href="/support/huong-dan"
            className="block pt-4 text-[#FFFFFF] text-opacity-50 hover:text-white"
          >
            Hướng dẫn sử dụng
          </a>
          <a
            href="/support/dieu-kien"
            className="block pt-4 text-[#FFFFFF] text-opacity-50 hover:text-white"
          >
            Điều kiện & điều khoản
          </a>
          <a
            href="/support/cau-hoi"
            className="block pt-4 text-[#FFFFFF] text-opacity-50 hover:text-white"
          >
            Câu hỏi thường gặp
          </a>
          <a
            href="/support/lien-he"
            className="block pt-4 text-[#FFFFFF] text-opacity-50 hover:text-white"
          >
            Liên hệ
          </a>
        </div>
      </div>

      <div className="border-t border-[rgba(77,120,146,0.54)] text-white flex justify-between">
        <div className="font-semibold pr-[100px] text-[16px] py-8 px-[120px]">
          © Bản quyền 2025 thuộc về OSHISHA.vn
        </div>
      </div>
    </div>
  );
};

export default Footer;
