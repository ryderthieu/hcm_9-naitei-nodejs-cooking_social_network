import { UserResponseDto } from '../../modules/users/dto/user-response.dto';

export class SingleUserResponseDto {
  user: UserResponseDto;

  constructor(user: UserResponseDto) {
    this.user = user;
  }
}

export class PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  constructor(data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }) {
    Object.assign(this, data);
  }
}

export class MultipleUsersResponseDto {
  users: UserResponseDto[];
  pagination?: PaginationMetaDto;

  constructor(users: UserResponseDto[], paginationData?: any) {
    this.users = users;
    if (paginationData) {
      this.pagination = new PaginationMetaDto(paginationData);
    }
  }
}

export class DeleteUserResponseDto {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
