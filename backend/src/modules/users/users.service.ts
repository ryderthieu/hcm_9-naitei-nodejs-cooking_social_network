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
      savedPosts: true,
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

  async getUserByUsername(
    username: string,
    currentUser?: User,
  ): Promise<SingleUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userDto = this.createUserResponseDto(user);

    if (currentUser && currentUser.id && currentUser.id !== user.id) {
      const followStatus = await this.checkFollowStatus(currentUser, username);
      userDto.isFollowing = followStatus.isFollowing;
    } else {
      userDto.isFollowing = false;
    }
    return new SingleUserResponseDto(userDto);
  }

  async getCurrentUser(currentUser: User): Promise<SingleUserResponseDto> {
    const userWithCount = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: USER_SELECT_FIELDS,
    });

    if (!userWithCount) {
      throw new NotFoundException('User not found');
    }

    const userDto = this.createUserResponseDto(userWithCount);
    return new SingleUserResponseDto(userDto);
  }

  async updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<SingleUserResponseDto> {
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existed = await this.prisma.user.findFirst({
        where: { email: updateUserDto.email, NOT: { id: user.id } },
      });
      if (existed) {
        throw new ConflictException('Email already exists');
      }
    }
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

  async followUser(
    currentUser: User,
    username: string,
  ): Promise<{ message: string }> {
    const targetUser = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.id === currentUser.id) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existingFollow = await this.prisma.relationship.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    await this.prisma.relationship.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    return { message: `Successfully followed ${targetUser.username}` };
  }

  async unfollowUser(
    currentUser: User,
    username: string,
  ): Promise<{ message: string }> {
    const targetUser = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.id === currentUser.id) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    const existingFollow = await this.prisma.relationship.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('Not following this user');
    }

    await this.prisma.relationship.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    return { message: `Successfully unfollowed ${targetUser.username}` };
  }

  async getFollowers(
    username: string,
    page: number = 1,
    limit: number = 10,
    name?: string,
  ): Promise<MultipleUsersResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {
      followingId: user.id,
    };

    if (name) {
      whereClause.follower = {
        OR: [
          { firstName: { contains: name } },
          { lastName: { contains: name } },
          { username: { contains: name } },
        ],
      };
    }

    const [relationships, total] = await Promise.all([
      this.prisma.relationship.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          follower: {
            select: USER_SELECT_FIELDS,
          },
        },
      }),
      this.prisma.relationship.count({ where: whereClause }),
    ]);

    const followers = relationships.map((rel) => rel.follower);
    const userDtos = followers.map((follower) =>
      this.createUserResponseDto(follower),
    );

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

  async getFollowings(
    username: string,
    page: number = 1,
    limit: number = 10,
    name?: string,
  ): Promise<MultipleUsersResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {
      followerId: user.id,
    };

    if (name) {
      whereClause.following = {
        OR: [
          { firstName: { contains: name } },
          { lastName: { contains: name } },
          { username: { contains: name } },
        ],
      };
    }

    const [relationships, total] = await Promise.all([
      this.prisma.relationship.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          following: {
            select: USER_SELECT_FIELDS,
          },
        },
      }),
      this.prisma.relationship.count({ where: whereClause }),
    ]);

    const following = relationships.map((rel) => rel.following);
    const userDtos = following.map((followedUser) =>
      this.createUserResponseDto(followedUser),
    );

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

  async checkFollowStatus(
    currentUser: User | null,
    targetUsername: string,
  ): Promise<{ isFollowing: boolean }> {
    if (!currentUser || !currentUser.id) {
      return { isFollowing: false };
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const relationship = await this.prisma.relationship.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });
    return { isFollowing: !!relationship };
  }
}
