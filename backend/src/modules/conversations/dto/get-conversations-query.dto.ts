import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PAGE_DEFAULT, LIMIT_DEFAULT } from '../../../common/constants/pagination.constants';

export class GetConversationsQueryDto {
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be greater than 0' })
  @Type(() => Number)
  page?: number = PAGE_DEFAULT;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than 0' })
  @Type(() => Number)
  limit?: number = LIMIT_DEFAULT;

  @IsOptional()
  @IsString()
  search?: string;
}
