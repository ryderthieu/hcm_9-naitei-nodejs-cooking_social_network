import { useState, useEffect } from "react";
import type { FC } from "react";
import vthieuAvatar from "../../../assets/founders-avatars/Thieu.png";
import pnhiAvatar from "../../../assets/founders-avatars/Nhi.png";
import lhoiAvatar from "../../../assets/founders-avatars/Hoi.jpg";
import hhuyAvatar from "../../../assets/founders-avatars/Huy.jpg";
import { Link } from "react-router-dom";
import CarouselPlugin from "../../../components/sections/Home/CarouselHero";
import AllBlogs from "../../../components/sections/Recipe/BlogSection";
import { FaPinterest, FaFacebook, FaInstagramSquare } from "react-icons/fa";
import { ArrowRight, Users, BookOpen, Eye } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "../../../constants/constants";

interface TeamMember {
  name: string;
  role: string;
  desc: string;
  img: string;
}

interface Testimonial {
  name: string;
  avatar: string;
  content: string;
}

function useCountUp(to: number, duration: number = 2000): string {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let start = 0;
    const increment = to / (duration / 16);
    
    const handle = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(handle);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(handle);
  }, [to, duration]);

  return count.toLocaleString();
}

const teamMembers: TeamMember[] = [
  {
    name: "Huỳnh Văn Thiệu",
    role: "Sáng lập",
    desc: "Chuyên gia ẩm thực và công nghệ, đam mê kết nối cộng đồng qua ẩm thực.",
    img: vthieuAvatar,
  },
  {
    name: "Trần Đỗ Phương Nhi",
    role: "Đồng sáng lập",
    desc: "Chuyên gia truyền thông và marketing, mang đến những ý tưởng sáng tạo cho Oshisha.",
    img: pnhiAvatar,
  },
  {
    name: "Ngô Thị Lễ Hội",
    role: "Đồng sáng lập",
    desc: "Kỹ sư phần mềm với kinh nghiệm phát triển ứng dụng, đảm bảo nền tảng hoạt động mượt mà.",
    img: lhoiAvatar,
  },
  {
    name: "Lê Đặng Hoàng Huy",
    role: "Đồng sáng lập",
    desc: "Chuyên gia ẩm thực và công nghệ, food reviewer",
    img: hhuyAvatar,
  },
];

const testimonials: Testimonial[] = [
  {
    name: "Thiện Nhi",
    avatar: DEFAULT_AVATAR_URL,
    content:
      "Oshisha giúp mình học nấu nhiều món mới và kết nối với bạn bè có cùng đam mê.",
  },
  {
    name: "Nhật Trường",
    avatar: DEFAULT_AVATAR_URL,
    content:
      "Thiết kế đẹp, dễ sử dụng và có rất nhiều công thức món ăn độc đáo.",
  },
  {
    name: "Anh Thơ",
    avatar: DEFAULT_AVATAR_URL,
    content:
      "Mỗi ngày đều có cảm hứng mới để vào bếp nhờ Oshisha. Thật tuyệt vời!",
  },
  {
    name: "Quang Khải",
    avatar: DEFAULT_AVATAR_URL,
    content:
      "Oshisha giúp mình học nấu nhiều món mới và kết nối với bạn bè có cùng đam mê.",
  },
];

const AboutPage: FC = () => {
  const userCount = useCountUp(50000, 4000);
  const recipeCount = useCountUp(3000, 4000);
  const viewCount = useCountUp(100000, 4000);

  return (
    <div>
      <CarouselPlugin />
      <div className="mx-4 lg:mx-[110px]">
        <section className="py-6 mt-10">
          <div className="bg-[#F8F5F2] rounded-2xl p-6 md:p-8 ">
            <div className="md:flex md:items-center md:space-x-8">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h3 className="text-[22px] font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-8 inline-block bg-[#592500] text-[#592500] rounded-full mr-3"></div>
                  Giới thiệu về Oshisha
                </h3>
                <p className="text-gray-600 leading-8 mb-4 text-justify">
                  Oshisha là cộng đồng ẩm thực kết nối những người yêu nấu ăn
                  trên khắp Việt Nam. Chúng tôi cung cấp nền tảng để chia sẻ
                  công thức, kinh nghiệm và niềm đam mê với ẩm thực. <br /> Sứ
                  mệnh của chúng tôi là tạo ra một cộng đồng nơi mọi người có
                  thể chia sẻ niềm đam mê nấu ăn, học hỏi và lan tỏa yêu thương
                  qua từng món ăn.
                </p>
              </div>
              <div className="md:w-1/2 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-pink-500 mb-1">
                    {userCount}+
                  </div>
                  <p className="text-xs text-gray-500">Người dùng</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-pink-500 mb-1">
                    {recipeCount}+
                  </div>
                  <p className="text-xs text-gray-500">Công thức</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-pink-500 mb-1">
                    {viewCount}+
                  </div>
                  <p className="text-xs text-gray-500">Lượt xem</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-[20px] cursor-pointer">
          <div className="text-center mb-8">
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">
              Đội ngũ của chúng tôi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Gặp gỡ những con người đầy đam mê đứng sau Oshisha - những người
              luôn nỗ lực để mang đến trải nghiệm tuyệt vời nhất cho cộng đồng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-[10px]">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group"
              >
                <div className="p-6 mt-4 mb-4 relative">
                  <div className="relative mb-4 flex justify-center">
                    <div className="relative">
                      <img
                        src={member.img || DEFAULT_AVATAR_URL}
                        alt={member.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {member.name}
                    </h3>
                    <p className="text-[#F63C3C] font-semibold text-sm mb-3">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm leading-6 text-center mb-6">
                    {member.desc}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="cursor-pointer my-auto">
                      <FaFacebook className="w-7 h-7 text-blue-600 " />
                    </div>
                    <div className="cursor-pointer my-auto">
                      <FaInstagramSquare className="w-7 h-7 text-pink-600 " />
                    </div>
                    <div className="cursor-pointer my-auto">
                      <FaPinterest className="w-7 h-7 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <AllBlogs />

        <section className="mx-auto py-8">
          <div className="text-center mb-8">
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">
              Người dùng nói gì về Oshisha?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những phản hồi chân thực từ cộng đồng người dùng yêu thích Oshisha
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {testimonials.map((user, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="text-6xl text-orange-200 font-serif leading-none mb-4">
                    "
                  </div>
                  <p className="text-gray-600 text-base leading-7 mb-6 relative z-10">
                    {user.content}
                  </p>
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={user.avatar || DEFAULT_AVATAR_URL}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover border-3 border-orange-200 group-hover:border-orange-300 transition-colors duration-300"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900 transition-colors duration-300">
                        {user.name}
                      </h4>
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                           <svg
                           key={i}
                           className="h-4 w-4"
                           fill="currentColor"
                           viewBox="0 0 24 24"
                         >
                           <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                         </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto py-8 mb-8">
          <div
            className="rounded-2xl overflow-hidden relative bg-gradient-to-tr from-[#FFE101] from-0% via-[#FFAF01] via-50% to-[#F63C3C] to-100%"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="absolute top-1/2 -right-8 w-32 h-32 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="absolute -bottom-6 left-1/3 w-20 h-20 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            </div>
            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Tham gia cộng đồng Oshisha ngay hôm nay!
              </h2>
              <p className="text-white/90 text-base mb-8 max-w-2xl mx-auto">
                Khám phá thế giới ẩm thực đầy màu sắc và kết nối với hàng ngàn
                người yêu nấu ăn khác. Bắt đầu hành trình ẩm thực của bạn ngay
                bây giờ!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/" className="w-full sm:w-auto">
                  <button className="bg-white text-[#F63C3C] hover:bg-gray-50 font-bold px-8 py-4 rounded-full text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center group/btn">
                    Khám phá ngay
                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
                <Link to="/" className="w-full sm:w-auto">
                  <button className="border-2 border-white text-white hover:bg-white hover:text-[#F63C3C] font-semibold px-8 py-4 rounded-full text-base transition-all duration-300 transform hover:scale-105">
                    Tìm hiểu thêm
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;