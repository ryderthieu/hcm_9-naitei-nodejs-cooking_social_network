import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@CurrentUser('user') user: User, @Body('post') dto: CreatePostDto) {
    return this.postsService.createPost(user.id, dto);
  }

  @Get(':postId')
  @OptionalAuth()
  async getById(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPostById(postId);
  }
}
