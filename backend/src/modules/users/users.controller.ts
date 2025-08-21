import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  SingleUserResponseDto,
  MultipleUsersResponseDto,
  DeleteUserResponseDto,
} from '../../common/dto/user-responses.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_LIMIT,
    @Query('name') name?: string,
  ): Promise<MultipleUsersResponseDto> {
    return this.usersService.getUsers(page, limit, name);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @CurrentUser('user') user: User,
  ): Promise<SingleUserResponseDto> {
    return this.usersService.getCurrentUser(user);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @CurrentUser('user') user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SingleUserResponseDto> {
    return this.usersService.updateUser(user, updateUserDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@CurrentUser('user') user: User): Promise<DeleteUserResponseDto> {
    return this.usersService.deleteUser(user);
  }

  @Get(':username')
  @UseGuards(OptionalAuthGuard)
  async getUserByUsername(
    @Param('username') username: string,
    @CurrentUser('user') currentUser?: User,
  ): Promise<SingleUserResponseDto> {
    return this.usersService.getUserByUsername(username, currentUser);
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @CurrentUser('user') currentUser: User,
    @Param('username') username: string,
  ): Promise<{ message: string }> {
    return this.usersService.followUser(currentUser, username);
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @CurrentUser('user') currentUser: User,
    @Param('username') username: string,
  ): Promise<{ message: string }> {
    return this.usersService.unfollowUser(currentUser, username);
  }

  @Get(':username/followers')
  @UseGuards(OptionalAuthGuard)
  async getFollowers(
    @Param('username') username: string,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_LIMIT,
    @Query('name') name?: string,
  ): Promise<MultipleUsersResponseDto> {
    return this.usersService.getFollowers(username, page, limit, name);
  }

  @Get(':username/followings')
  @UseGuards(OptionalAuthGuard)
  async getFollowing(
    @Param('username') username: string,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = DEFAULT_PAGE,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number = DEFAULT_LIMIT,
    @Query('name') name?: string,
  ): Promise<MultipleUsersResponseDto> {
    return this.usersService.getFollowings(username, page, limit, name);
  }

  @Get(':username/follow-status')
  @UseGuards(OptionalAuthGuard)
  async checkFollowStatus(
    @CurrentUser('user') currentUser: User | null,
    @Param('username') username: string,
  ): Promise<{ isFollowing: boolean }> {
    return this.usersService.checkFollowStatus(currentUser, username);
  }
}
