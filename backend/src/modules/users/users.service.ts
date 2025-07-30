import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  MultipleUsersResponseDto,
  SingleUserResponseDto,
  DeleteUserResponseDto,
} from '../../common/dto/user-responses.dto';
import { PasswordValidator } from '../../common/utils/password-validator.util';
import { User } from '.prisma/client/default';

const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  username: true,
  gender: true,
  birthday: true,
  bio: true,
  slug: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      followers: true,
      following: true,
      authoredRecipes: true,
      authoredPosts: true,
    },
  },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private createUserResponseDto(user: any): UserResponseDto {
    return new UserResponseDto(user);
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    name?: string,
  ): Promise<MultipleUsersResponseDto> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (name) {
      whereClause.OR = [
        {
          firstName: {
            contains: name,
          },
        },
        {
          lastName: {
            contains: name,
          },
        },
        {
          username: {
            contains: name,
          },
        },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT_FIELDS,
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    const userDtos = users.map((user) => this.createUserResponseDto(user));

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return new MultipleUsersResponseDto(userDtos, {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    });
  }

  async getUserByUsername(username: string): Promise<SingleUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userDto = this.createUserResponseDto(user);
    return new SingleUserResponseDto(userDto);
  }

  async getCurrentUser(currentUser: User): Promise<SingleUserResponseDto> {
    const userDto = this.createUserResponseDto(currentUser);
    return new SingleUserResponseDto(userDto);
  }

  async updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<SingleUserResponseDto> {
    if (updateUserDto.password) {
      if (!updateUserDto.confirmPassword) {
        throw new BadRequestException(
          'Confirm password is required when updating password',
        );
      }

      if (updateUserDto.password !== updateUserDto.confirmPassword) {
        throw new BadRequestException(
          'Password and confirm password do not match',
        );
      }

      const passwordValidation = PasswordValidator.validatePasswordStrength(
        updateUserDto.password,
      );
      if (!passwordValidation.isValid) {
        throw new BadRequestException(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        );
      }
    }

    if (updateUserDto.username) {
      await this.validateUniqueUsername(updateUserDto.username, user.id);
    }

    try {
      const updateData = await this.prepareUpdateData(updateUserDto);

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: USER_SELECT_FIELDS,
      });

      const userDto = this.createUserResponseDto(updatedUser);
      return new SingleUserResponseDto(userDto);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  private async validateUniqueUsername(
    username: string,
    excludeUserId: number,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        username,
        NOT: { id: excludeUserId },
      },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
  }

  private async prepareUpdateData(updateUserDto: UpdateUserDto): Promise<any> {
    const updateData: any = { ...updateUserDto };

    delete updateData.confirmPassword;

    if (updateUserDto.username) {
      updateData.slug = updateUserDto.username
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
    }

    if (updateUserDto.birthday) {
      updateData.birthday = new Date(updateUserDto.birthday);
    }

    if (updateUserDto.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    return updateData;
  }

  async deleteUser(user: User): Promise<DeleteUserResponseDto> {
    try {
      await this.prisma.user.delete({
        where: { id: user.id },
      });

      return new DeleteUserResponseDto('User deleted successfully');
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
