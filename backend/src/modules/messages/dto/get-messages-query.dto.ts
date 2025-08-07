import { IsOptional, IsNumberString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMessagesQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Min(1)
  limit?: number;
}
