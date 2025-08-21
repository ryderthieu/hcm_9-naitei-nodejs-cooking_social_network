import arrowRightImage from "../../../assets/home/Polygon 3.png";
import React from "react";

interface ArrowRightProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  size?: number;
}

const ArrowRight: React.FC<ArrowRightProps> = ({
  className,
  size = 20,
  ...props
}) => {
  return (
    <img
      src={arrowRightImage}
      alt="Arrow Right"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
};

export default ArrowRight;
