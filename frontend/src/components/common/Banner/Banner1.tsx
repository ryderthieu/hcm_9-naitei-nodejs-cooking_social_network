import sushi from "../../../assets/home/sushi.png";

const Banner1 = () => {
  return (
    <div className="relative w-full h-[350px] md:h-[400px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr to-[#FFE10160] via-[#fabb32] from-[#da4b4b]"></div>
      <div className="relative h-full max-w-6xl mx-auto px-6 flex items-center">
        <div className="w-full md:w-2/3 mr-4 h-[60%] text-white flex flex-col justify-start">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-wide">
            Khám phá công thức ngon
            <div className="h-2"></div>
            <span className="text-yellow-200">chia sẻ niềm vui nấu nướng</span>
          </h2>
          <p className="text-sm md:text-base opacity-90 max-w-2xl mb-8 ">
            Nơi mỗi bữa ăn là một hành trình sáng tạo và gắn kết yêu thương.{" "}
            <br />
            Cùng{" "}
            <span className="underline text-[17px] text-pink-200 font-bold">
              Oshisha
            </span>{" "}
            lan tỏa tình yêu ẩm thực và cảm hứng ăn ngon mỗi ngày.
          </p>

          <button className="max-w-[250px] bg-pink-500 hover:bg-pink-600 transition-all text-white py-3 px-8 rounded-full font-medium duration-300 hover:-translate-y-1 ease-in">
            TÌM HIỂU THÊM
          </button>
        </div>

        <div className="font-chango font-bold text-[180px] absolute -top-5 left-1/2 right-0 text-white/40 rotate-[35deg]">
          OSHISHA
        </div>

        <div className="hidden md:block absolute right-10 top-1/2 transform -translate-y-1/2">
          <img
            src={sushi}
            alt="Cute sushi character"
            className="w-[400px] h-[400px] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner1;
