import arrowLeftImage from "../../../assets/home/Polygon 2.png";
import React, { type ImgHTMLAttributes } from "react";

interface ArrowLeftProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  size?: number;
}

const ArrowLeft: React.FC<ArrowLeftProps> = ({
  className,
  size = 24,
  ...props
}) => {
  return (
    <img
      src={arrowLeftImage}
      alt="Arrow Left"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
};

export default ArrowLeft;
