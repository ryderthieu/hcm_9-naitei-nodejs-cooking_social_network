import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FilterCommentsDto } from './dto/filter-comments.dto';
import {
  LIMIT_DEFAULT,
  OrderBy,
  PAGE_DEFAULT,
  SortBy,
} from 'src/common/constants/pagination.constants';
import { PostComment, User } from '@prisma/client';

type PostCommentWithUser = PostComment & {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
};

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const parentCommentId = createCommentDto.replyOf ?? null;

    if (parentCommentId) {
      const parentComment = await this.prisma.postComment.findUnique({
        where: { id: parentCommentId },
      });
      if (!parentComment || parentComment.postId !== postId) {
        throw new BadRequestException('Invalid parent comment');
      }
    }

    const comment = await this.prisma.postComment.create({
      data: {
        postId,
        userId,
        comment: createCommentDto.comment,
        replyOf: parentCommentId,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    if (parentCommentId) {
      await this.prisma.postComment.update({
        where: { id: parentCommentId },
        data: { repliesCount: { increment: 1 } },
      });
    }

    return { comment: this.mapComment(comment) };
  }

  async updateComment(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      include: { user: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.postId !== postId)
      throw new BadRequestException('Invalid post');
    if (comment.userId !== userId)
      throw new ForbiddenException('Access denied');

    const updated = await this.prisma.postComment.update({
      where: { id: commentId },
      data: { comment: updateCommentDto.comment },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    return { comment: this.mapComment(updated) };
  }

  async deleteComment(userId: number, postId: number, commentId: number) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, userId: true, replyOf: true },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.postId !== postId)
      throw new BadRequestException('Invalid post');
    if (comment.userId !== userId)
      throw new ForbiddenException('Access denied');

    await this.prisma.postComment.delete({ where: { id: commentId } });

    const updatedCommentsCount = await this.prisma.postComment.count({
      where: { postId },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { commentsCount: updatedCommentsCount },
    });

    if (comment.replyOf) {
      const parent = await this.prisma.postComment.findUnique({
        where: { id: comment.replyOf },
        select: { repliesCount: true },
      });
      if (parent && parent.repliesCount > 0) {
        await this.prisma.postComment.update({
          where: { id: comment.replyOf },
          data: { repliesCount: { decrement: 1 } },
        });
      }
    }

    return { message: 'Comment deleted successfully' };
  }

  async getCommentById(postId: number, commentId: number) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.postId !== postId)
      throw new BadRequestException('Invalid post');

    return { comment: this.mapComment(comment) };
  }

  async getComments(postId: number, query: FilterCommentsDto) {
    const sortBy = query.sortBy ?? SortBy.NEWEST;
    const page = query.page ?? PAGE_DEFAULT;
    const limit = query.limit ?? LIMIT_DEFAULT;
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      this.prisma.postComment.count({ where: { postId } }),
      this.prisma.postComment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: {
          createdAt: sortBy === SortBy.NEWEST ? OrderBy.DESC : OrderBy.ASC,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
    ]);

    return {
      comments: comments.map(this.mapComment),
      meta: { total, page, limit },
    };
  }

  async getReplies(
    postId: number,
    parentCommentId: number,
    query: FilterCommentsDto,
  ) {
    const parentComment = await this.prisma.postComment.findUnique({
      where: { id: parentCommentId },
    });
    if (!parentComment || parentComment.postId !== postId) {
      throw new BadRequestException('Invalid comment');
    }

    const sortBy = query.sortBy ?? SortBy.NEWEST;
    const page = query.page ?? PAGE_DEFAULT;
    const limit = query.limit ?? LIMIT_DEFAULT;
    const skip = (page - 1) * limit;

    const [total, replies] = await Promise.all([
      this.prisma.postComment.count({ where: { replyOf: parentCommentId } }),
      this.prisma.postComment.findMany({
        where: { replyOf: parentCommentId },
        skip,
        take: limit,
        orderBy: {
          createdAt: sortBy === SortBy.NEWEST ? OrderBy.DESC : OrderBy.ASC,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
    ]);

    return {
      replies: replies.map(this.mapComment),
      meta: { total, page, limit },
    };
  }

  private mapComment(comment: PostCommentWithUser) {
    return {
      id: comment.id,
      post_id: comment.postId,
      reply_of: comment.replyOf,
      replies_count: comment.repliesCount,
      user: {
        id: comment.user.id,
        first_name: comment.user.firstName,
        last_name: comment.user.lastName,
        avatar: comment.user.avatar,
      },
      comment: comment.comment,
      created_at: comment.createdAt,
    };
  }
}
