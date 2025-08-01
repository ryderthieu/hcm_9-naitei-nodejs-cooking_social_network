import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType, Post, Recipe, PostMedia, User } from '@prisma/client';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostsDto } from './dto/filter-posts.dto';

type PostWithIncludes = Post & {
  recipe: Pick<Recipe, 'id' | 'title' | 'slug'>;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  media: PostMedia[];
};

type PostResponse = {
  post: {
    id: number;
    author: {
      id: number;
      first_name: string;
      last_name: string;
      avatar: string | null;
    };
    caption: string;
    recipe: {
      id: number;
      title: string;
      slug: string | null;
    };
    media?: {
      url: string;
      type: MediaType;
    }[];
    likes_count: number;
    comments_count: number;
    shares_count: number;
    slug: string | null;
    created_at: Date;
    updated_at: Date;
  };
};

type MultiplePostResponse = {
  posts: PostResponse['post'][];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(
    userId: number,
    createPostDto: CreatePostDto,
  ): Promise<PostResponse> {
    try {
      const recipe = await this.prisma.recipe.findUnique({
        where: { id: createPostDto.recipeId },
      });

      if (!recipe) {
        throw new NotFoundException(
          `Recipe ID ${createPostDto.recipeId} not found`,
        );
      }

      const mediaData: { url: string; type: MediaType }[] =
        createPostDto.mediaUrls?.map((url, index) => ({
          url,
          type: createPostDto.mediaTypes?.[index] ?? MediaType.IMAGE,
        })) ?? [];

      const post = await this.prisma.post.create({
        data: {
          authorId: userId,
          caption: createPostDto.caption || '',
          recipeId: createPostDto.recipeId,
          ...(mediaData.length > 0 && {
            media: {
              create: mediaData,
            },
          }),
        },
        include: {
          media: true,
          recipe: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return this.mapPostToResponse(post);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Unexpected error while creating post',
      );
    }
  }

  async getPostById(postId: number): Promise<PostResponse> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: true,
        recipe: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return this.mapPostToResponse(post);
  }

  private mapPostToResponse(post: PostWithIncludes): PostResponse {
    const result: PostResponse['post'] = {
      id: post.id,
      author: {
        id: post.author.id,
        first_name: post.author.firstName,
        last_name: post.author.lastName,
        avatar: post.author.avatar,
      },
      caption: post.caption ?? '',
      recipe: {
        id: post.recipe.id,
        title: post.recipe.title,
        slug: post.recipe.slug,
      },
      likes_count: post.likesCount,
      comments_count: post.commentsCount,
      shares_count: post.sharesCount,
      slug: post.slug,
      created_at: post.createdAt,
      updated_at: post.updatedAt,
    };

    if (post.media.length > 0) {
      result.media = post.media.map((m) => ({
        url: m.url,
        type: m.type,
      }));
    }

    return { post: result };
  }

  async getPosts(query: FilterPostsDto): Promise<MultiplePostResponse>;
  async getPosts(
    userId: number,
    query: FilterPostsDto,
  ): Promise<MultiplePostResponse>;
  async getPosts(
    userIdOrQuery: number | FilterPostsDto,
    maybeQuery?: FilterPostsDto,
  ): Promise<MultiplePostResponse> {
    const userId = typeof userIdOrQuery === 'number' ? userIdOrQuery : null;
    const query =
      typeof userIdOrQuery === 'number' ? maybeQuery! : userIdOrQuery;

    const {
      keyword,
      following = false,
      savedBy = false,
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (keyword) {
      where.caption = { contains: keyword };
    }

    if (following && userId) {
      const followingIds = await this.prisma.relationship.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      where.authorId = { in: followingIds.map((f) => f.followingId) };
    }

    if (savedBy && userId) {
      const saved = await this.prisma.userSavedPost.findMany({
        where: { userId },
        select: { postId: true },
      });
      where.id = { in: saved.map((s) => s.postId) };
    }

    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortBy === 'newest' ? 'desc' : 'asc' },
        include: {
          media: true,
          recipe: { select: { id: true, title: true, slug: true } },
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              gender: true,
              birthday: true,
              bio: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return {
      posts: posts.map((post) => this.mapPostToResponse(post).post),
      meta: { total, page, limit },
    };
  }

  async updatePost(
    userId: number,
    postId: number,
    updatePostdto: UpdatePostDto,
  ): Promise<PostResponse> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        caption: updatePostdto.caption ?? post.caption,
      },
      include: {
        media: true,
        recipe: { select: { id: true, title: true, slug: true } },
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    return this.mapPostToResponse(updated);
  }

  async deletePost(
    userId: number,
    postId: number,
  ): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.postLike.deleteMany({ where: { postId } });
    await this.prisma.userSavedPost.deleteMany({ where: { postId } });
    await this.prisma.postComment.deleteMany({ where: { postId } });
    await this.prisma.postMedia.deleteMany({ where: { postId } });

    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post deleted successfully' };
  }

  async likePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const exists = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (exists) throw new BadRequestException('You already liked this post');

    await this.prisma.postLike.create({ data: { postId, userId } });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });
    return { message: 'Post liked' };
  }

  async unlikePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const exists = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });
    if (!exists) throw new BadRequestException('You have not liked this post');

    await this.prisma.postLike.delete({
      where: { postId_userId: { postId, userId } },
    });
    await this.prisma.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    });
    return { message: 'Post unliked' };
  }
}
