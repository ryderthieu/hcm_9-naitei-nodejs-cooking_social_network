import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class GetNotificationsDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  page?: number;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  limit?: number;
}
