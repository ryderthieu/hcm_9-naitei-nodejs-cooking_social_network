import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';
import { FilterPostsDto } from './dto/filter-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @CurrentUser('user') user: User,
    @Body('post') createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(user.id, createPostDto);
  }

  @Get(':postId')
  @OptionalAuth()
  async getById(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user?: User,
  ) {
    return this.postsService.getPostById(postId, user);
  }

  @Get()
  @OptionalAuth()
  async getAll(
    @Query() filter: FilterPostsDto,
    @CurrentUser('user') user?: User,
  ) {
    return this.postsService.getPosts(filter, user);
  }

  @Put(':postId')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user: User,
    @Body('post') updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(user.id, postId, updatePostDto);
  }

  @Delete(':postId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async delete(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.postsService.deletePost(user.id, postId);
  }

  @Post(':postId/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async like(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.postsService.likePost(user.id, postId);
  }

  @Delete(':postId/unlike')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async unlike(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.postsService.unlikePost(user.id, postId);
  }

  @Post(':postId/share')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async share(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.postsService.sharePost(user.id, postId);
  }

  @Post(':postId/save')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async save(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.postsService.savePost(user.id, postId);
  }

  @Delete(':postId/save')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async unsave(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.postsService.unsavePost(user.id, postId);
  }
}
