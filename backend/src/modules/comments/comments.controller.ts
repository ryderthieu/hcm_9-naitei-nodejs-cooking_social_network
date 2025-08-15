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
import { CommentsService } from './comments.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FilterCommentsDto } from './dto/filter-comments.dto';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('comment') createCommentDto: CreateCommentDto,
    @CurrentUser('user') user: User,
  ) {
    return this.commentsService.createComment(
      user.id,
      postId,
      createCommentDto,
    );
  }

  @Put(':commentId')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body('comment') updateCommentDto: UpdateCommentDto,
    @CurrentUser('user') user: User,
  ) {
    return this.commentsService.updateComment(
      user.id,
      postId,
      commentId,
      updateCommentDto,
    );
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async delete(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.commentsService.deleteComment(user.id, postId, commentId);
  }

  @Get(':commentId')
  @OptionalAuth()
  async getCommentById(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser('user') user?: User,
  ) {
    return this.commentsService.getCommentById(postId, commentId, user);
  }

  @Get()
  @OptionalAuth()
  async getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() filter: FilterCommentsDto,
    @CurrentUser('user') user?: User,
  ) {
    return this.commentsService.getComments(postId, filter, user);
  }

  @Get(':commentId/replies')
  @OptionalAuth()
  async getReplies(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Query() filter: FilterCommentsDto,
    @CurrentUser('user') user?: User,
  ) {
    return this.commentsService.getReplies(postId, commentId, filter, user);
  }

  @Post(':commentId/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async like(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.commentsService.likeComment(user.id, postId, commentId);
  }

  @Delete(':commentId/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  async unlike(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.commentsService.unlikeComment(user.id, postId, commentId);
  }
}
