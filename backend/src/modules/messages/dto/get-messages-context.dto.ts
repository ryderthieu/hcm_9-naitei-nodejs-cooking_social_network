import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class GetMessagesContextDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  before: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  after: number;
}
