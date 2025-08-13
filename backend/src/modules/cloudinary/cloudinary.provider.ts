import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from 'src/common/constants/cloudinary.constant';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: CLOUDINARY_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  },
};
