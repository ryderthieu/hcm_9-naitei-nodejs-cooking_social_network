import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  MAX_FILE_SIZE,
  MAX_FILES,
} from 'src/common/constants/cloudinary.constant';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    return this.cloudinaryService.uploadFiles(files);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async delete(@Body('urls') urls: string[]) {
    return this.cloudinaryService.deleteFiles(urls);
  }
}
