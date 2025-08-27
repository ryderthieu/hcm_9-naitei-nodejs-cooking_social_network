import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateNotificationDto {
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  receiver: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  url?: string;
}
