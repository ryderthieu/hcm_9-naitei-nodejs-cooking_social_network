import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { CLOUDINARY_FOLDER } from 'src/common/constants/cloudinary.constant';

@Injectable()
export class CloudinaryService {
  async uploadFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: CLOUDINARY_FOLDER,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              url: result?.secure_url,
              publicId: result?.public_id,
              height: result?.height,
              width: result?.width,
              format: result?.format,
              resourceType: result?.resource_type,
            });
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    });

    return Promise.all(uploadPromises);
  }

  async deleteFiles(urls: string[]) {
    if (!urls || urls.length === 0) {
      throw new BadRequestException('No URLs provided');
    }

    let deleted: string[] = [];

    for (const url of urls) {
      const { publicId, resourceType } = this.parseCloudinaryUrl(url);
      const res = await cloudinary.api.delete_resources([publicId], {
        resource_type: resourceType as any,
      });

      if (res.deleted && res.deleted[publicId] === 'deleted') {
        deleted.push(url);
      }
    }

    if (deleted.length === 0) {
      throw new BadRequestException('No files deleted');
    }

    return { deleted: deleted, count: deleted.length };
  }

  private parseCloudinaryUrl(url: string): {
    publicId: string;
    resourceType: string;
  } {
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('/upload/');
    if (parts.length < 2)
      throw new BadRequestException('Invalid Cloudinary URL: ' + url);

    const preUpload = parts[0];
    let resourceType = 'image';
    if (preUpload.endsWith('/video')) resourceType = 'video';
    else if (preUpload.endsWith('/raw')) resourceType = 'raw';

    let pathAfterUpload = parts[1];
    const pathParts = pathAfterUpload.split('/');
    if (pathParts[0].startsWith('v')) pathParts.shift();

    const publicIdWithExt = pathParts.join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    return { publicId, resourceType };
  }
}
