import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new NotFoundException('Post not found');

    const isCommentOwner = comment.userId === userId;
    const isPostOwner = post.authorId === userId;

    if (!isCommentOwner && !isPostOwner) {
      throw new ForbiddenException('Access denied');
    }

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

  async getCommentById(postId: number, commentId: number, currentUser?: User) {
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

    const liked_by_me = await this.getLikedByMeMap(currentUser?.id, [comment.id]);
    return { comment: this.mapComment(comment, liked_by_me[comment.id]) };
  }

  async getComments(postId: number, query: FilterCommentsDto, currentUser?: User) {
    const sortBy = query.sortBy ?? SortBy.NEWEST;
    const page = query.page ?? PAGE_DEFAULT;
    const limit = query.limit ?? LIMIT_DEFAULT;
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      this.prisma.postComment.count({ where: { postId, replyOf: null } }),
      this.prisma.postComment.findMany({
        where: { postId, replyOf: null },
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

    const likedMap = await this.getLikedByMeMap(currentUser?.id, comments.map(c => c.id));
    return {
      comments: comments.map(c => this.mapComment(c, likedMap[c.id])),
      meta: { total, page, limit },
    };
  }

  async getReplies(
    postId: number,
    parentCommentId: number,
    query: FilterCommentsDto,
    currentUser?: User,
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

    const likedMap = await this.getLikedByMeMap(currentUser?.id, replies.map(r => r.id));
    return {
      replies: replies.map(r => this.mapComment(r, likedMap[r.id])),
      meta: { total, page, limit },
    };
  }

  async likeComment(userId: number, postId: number, commentId: number) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.postId !== postId)
      throw new BadRequestException('Invalid comment');

    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (existing) throw new BadRequestException('Already liked');

    try {
      await this.prisma.$transaction([
        this.prisma.commentLike.create({
          data: { userId, commentId },
        }),
        this.prisma.postComment.update({
          where: { id: commentId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
    } catch (error) {
      throw new InternalServerErrorException('Unable to like the comment. Try again later!');
    }

    return { message: 'Comment liked' };
  }

  async unlikeComment(userId: number, postId: number, commentId: number) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });
    if (!comment || comment.postId !== postId)
      throw new BadRequestException('Invalid comment');

    const existing = await this.prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (!existing)
      throw new BadRequestException('You have not liked this comment');

    try {
      await this.prisma.$transaction([
        this.prisma.commentLike.delete({
          where: { userId_commentId: { userId, commentId } },
        }),
        this.prisma.postComment.update({
          where: { id: commentId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
    } catch (error) {
      throw new InternalServerErrorException('Unable to unlike the comment. Try again later!');
    }

    return { message: 'Comment unliked' };
  }

  private mapComment(comment: PostCommentWithUser, likedByMe?: boolean) {
    const base = {
      id: comment.id,
      post_id: comment.postId,
      reply_of: comment.replyOf,
      replies_count: comment.repliesCount,
      likes_count: comment.likesCount,
      user: {
        id: comment.user.id,
        first_name: comment.user.firstName,
        last_name: comment.user.lastName,
        avatar: comment.user.avatar,
      },
      comment: comment.comment,
      created_at: comment.createdAt,
    };
    if (typeof likedByMe !== 'undefined') {
      return { ...base, liked_by_me: likedByMe };
    }
    return base;
  }

  private async getLikedByMeMap(userId: number | undefined, ids: number[]) {
    if (!userId || ids.length === 0) return {} as Record<number, boolean>;
    const likes = await this.prisma.commentLike.findMany({
      where: { userId, commentId: { in: ids } },
      select: { commentId: true },
    });
    return likes.reduce((acc, l) => {
      acc[l.commentId] = true;
      return acc;
    }, {} as Record<number, boolean>);
  }
}
