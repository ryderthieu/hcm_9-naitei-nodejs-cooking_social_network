import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class FilterPostsDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  following?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  savedBy?: boolean;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;
}
