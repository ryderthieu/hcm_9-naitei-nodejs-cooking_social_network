import { IsArray, IsOptional, IsString, IsNotEmpty, ArrayMinSize, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Members list cannot be empty' })
  @IsInt({ each: true, message: 'Member ID must be an integer' })
  @Type(() => Number)
  members: number[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
