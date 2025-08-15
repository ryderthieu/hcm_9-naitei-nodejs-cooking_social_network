import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Banner1 from "../../common/Banner/Banner1";
import Banner2 from "../../common/Banner/Banner2";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "../../ui/carousel";

export default function CarouselPlugin() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  const banners = [<Banner1 />, <Banner2 />];

  return (
    <section className="relative overflow-hidden rounded-2xl mx-6 mt-6 px-[90px]">
      <Carousel
        plugins={[plugin.current]}
        className="w-full mx-auto"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index}>
              <div className="p-1">{banner}</div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
        <CarouselDots className="absolute bottom-[12%] left-[7%] transform" />
      </Carousel>
    </section>
  );
}
