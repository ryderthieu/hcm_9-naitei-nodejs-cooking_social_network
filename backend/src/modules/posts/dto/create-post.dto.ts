import { IsInt, IsOptional, IsArray, IsEnum, IsString } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  caption?: string;

  @IsInt()
  recipeId: number;

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @IsArray()
  @IsOptional()
  @IsEnum(MediaType, { each: true })
  mediaTypes?: MediaType[];
}
