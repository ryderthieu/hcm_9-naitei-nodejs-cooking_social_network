import yummy from "../../../assets/home/yummy.png";

const Banner2 = () => {
  return (
    <div className="relative w-full h-[350px] md:h-[400px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffef77] via-[#ffc038] to-[#E97C23]"></div>
      <div className="relative h-full max-w-6xl mx-auto px-6 flex items-center">
        <div className="w-full md:w-2/3 mr-4 h-[60%] text-white flex flex-col justify-start">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-[0.02em]">
            <span className="text-green-900">Sẻ một chút hương</span>
            <div className="h-2"></div>
            <span className="text-amber-700">Chia ngàn vị ngọt</span>
          </h2>
          <p className=" text-sm md:text-base opacity-90 max-w-lg mb-4">
            Mỗi công thức là một câu chuyện, mỗi món ăn là một kỷ niệm. Hãy cùng
            Oshisha chia sẻ bí quyết nấu nướng và lan tỏa niềm vui của những bữa
            ăn ngon đến mọi người.
          </p>

          <button className="max-w-[250px] bg-green-950 hover:bg-[#0c320c] transition-all text-white py-3 px-8 rounded-full font-medium transform hover:-translate-y-1 duration-300">
            TÌM HIỂU THÊM
          </button>
        </div>

        <div className="flex absolute -right-10 flex-col ">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="font-chango font-bold text-[90px] text-white/30"
            >
              OSHISHA
            </div>
          ))}
        </div>

        <div className="hidden md:block absolute right-20 top-1/2 transform -translate-y-1/2">
          <img
            src={yummy}
            alt="Yummy food"
            className="w-[420px] h-[420px] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Banner2;
