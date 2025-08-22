type Instruction = {
  step: string;
  description?: string;
  image?: string | string[];
};

type Recipe = {
  steps?: Instruction[];
};

interface InstructionsSectionProps {
  recipe: Recipe;
}

export default function InstructionsSection({
  recipe,
}: InstructionsSectionProps) {
  const getImageLayout = (imageCount: number) => {
    switch (imageCount) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2";
      case 4:
        return "grid-cols-2";
      default:
        return "grid-cols-1";
    }
  };

  const getImageStyle = (imageCount: number, index: number) => {
    if (imageCount === 3 && index === 2) {
      return "col-span-2 mx-auto max-w-md";
    }
    return "";
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Hướng dẫn cách làm
      </h2>

      {recipe?.steps && recipe.steps.length > 0 ? (
        <div className="space-y-8">
          {recipe.steps.map((instruction, index) => {
            const images = instruction?.image
              ? Array.isArray(instruction.image)
                ? instruction.image.slice(0, 4)
                : [instruction.image]
              : [];

            return (
              <div key={index} className="border-l-4 border-orange-400 pl-6">
                {" "}
                <h3 className="font-semibold mb-3 text-lg text-gray-800">
                  Bước {index + 1}: {instruction.step}
                </h3>
                <div className="text-gray-600 mb-4 leading-relaxed">
                  {instruction?.description ? (
                    instruction.description.split("\n").map(
                      (paragraph, pIndex) =>
                        paragraph.trim() && (
                          <p key={pIndex} className="mb-2 last:mb-0">
                            {paragraph.trim()}
                          </p>
                        )
                    )
                  ) : (
                    <p></p>
                  )}
                </div>
                {images.length > 0 && (
                  <div
                    className={`grid ${getImageLayout(images.length)} gap-4`}
                  >
                    {images.map((image, imgIndex) => (
                      <div
                        key={imgIndex}
                        className={`rounded-lg overflow-hidden shadow-md ${getImageStyle(
                          images.length,
                          imgIndex
                        )}`}
                      >
                        <img
                          src={image}
                          alt={`Bước ${index + 1} - Hình ${imgIndex + 1}`}
                          className="w-full h-[100px] object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-500">
          <p>Không có hướng dẫn nấu ăn cho công thức này.</p>
        </div>
      )}
    </div>
  );
}
