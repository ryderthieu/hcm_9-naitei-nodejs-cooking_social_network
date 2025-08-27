import { IsOptional, Min, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { MessageType } from '@prisma/client';

export class GetMessagesQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  senderId?: number;

  @IsOptional()
  @IsString()
  type?: MessageType;
}
