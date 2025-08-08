import { IsArray, IsInt, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class AddMembersDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Member IDs list cannot be empty' })
  @IsInt({ each: true, message: 'Each member ID must be an integer' })
  @Type(() => Number)
  memberIds: number[];
}
