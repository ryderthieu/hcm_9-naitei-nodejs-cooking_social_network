import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  comment: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  replyOf?: number;
}
