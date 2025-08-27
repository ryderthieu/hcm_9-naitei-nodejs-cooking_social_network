import { IsNumber, IsOptional } from 'class-validator';

export class GetNotificationsDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
