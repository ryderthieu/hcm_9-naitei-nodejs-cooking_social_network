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
import {
  LIMIT_DEFAULT,
  OrderBy,
  PAGE_DEFAULT,
  SortBy,
} from 'src/common/constants/pagination.constants';

type PostWithIncludes = Post & {
  recipe: Pick<Recipe, 'id' | 'title' | 'slug'>;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'username'>;
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
      username: string;
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
    saves_count?: number;
    slug: string | null;
    created_at: Date;
    updated_at: Date;
    liked_by_me?: boolean;
    saved_by_me?: boolean;
    following_author?: boolean;
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
  constructor(private readonly prisma: PrismaService) { }

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
              username: true,
            },
          },
        },
      });

      return this.mapPostToResponse(post, undefined, undefined, undefined, 0);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Unexpected error while creating post',
      );
    }
  }

  async getPostById(postId: number, currentUser?: User): Promise<PostResponse> {
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
            username: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    let likedByMe: boolean | undefined = undefined;
    let followingAuthor: boolean | undefined = undefined;
    let savedByMe: boolean | undefined = undefined;

    if (currentUser) {
      const [liked, following, saved] = await Promise.all([
        this.prisma.postLike.findUnique({
          where: { postId_userId: { postId: post.id, userId: currentUser.id } },
          select: { postId: true },
        }),
        this.prisma.relationship.findUnique({
          where: { followerId_followingId: { followerId: currentUser.id, followingId: post.authorId } },
          select: { followingId: true },
        }),
        this.prisma.userSavedPost.findUnique({
          where: { userId_postId: { userId: currentUser.id, postId: post.id } },
          select: { postId: true },
        }),
      ]);

      likedByMe = Boolean(liked);
      followingAuthor = Boolean(following);
      savedByMe = Boolean(saved);
    }

    const savesCount = await this.prisma.userSavedPost.count({
      where: { postId: post.id },
    });

    return this.mapPostToResponse(post, likedByMe, followingAuthor, savedByMe, savesCount);
  }

  private mapPostToResponse(post: PostWithIncludes, likedByMe?: boolean, followingAuthor?: boolean, savedByMe?: boolean, savesCount?: number): PostResponse {
    const result: PostResponse['post'] = {
      id: post.id,
      author: {
        id: post.author.id,
        first_name: post.author.firstName,
        last_name: post.author.lastName,
        avatar: post.author.avatar,
        username: post.author.username,
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
      saves_count: savesCount ?? 0,
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

    if (typeof likedByMe !== 'undefined') {
      result.liked_by_me = likedByMe;
    }
    if (typeof followingAuthor !== 'undefined') {
      result.following_author = followingAuthor;
    }
    if (typeof savedByMe !== 'undefined') {
      result.saved_by_me = savedByMe;
    }
    return { post: result };
  }

  async getPosts(
    query: FilterPostsDto,
    currentUser?: User,
  ): Promise<MultiplePostResponse> {
    const userId = currentUser?.id;

    const {
      keyword,
      following = false,
      savedBy = false,
      sortBy = SortBy.NEWEST,
      page = PAGE_DEFAULT,
      limit = LIMIT_DEFAULT,
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
        orderBy: {
          createdAt: sortBy === SortBy.NEWEST ? OrderBy.DESC : OrderBy.ASC,
        },
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

    let likedMap: Record<number, boolean> = {};
    let followingMap: Record<number, boolean> = {};
    let savedMap: Record<number, boolean> = {};

    if (userId && posts.length > 0) {
      const likes = await this.prisma.postLike.findMany({
        where: { userId, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      likedMap = likes.reduce((acc, l) => {
        acc[l.postId] = true;
        return acc;
      }, {} as Record<number, boolean>);

      const authorIds = [...new Set(posts.map((p) => p.authorId))];
      const following = await this.prisma.relationship.findMany({
        where: { followerId: userId, followingId: { in: authorIds } },
        select: { followingId: true },
      });
      const followingIds = new Set(following.map((f) => f.followingId));

      posts.forEach((post) => {
        followingMap[post.id] = followingIds.has(post.authorId);
      });

      const saved = await this.prisma.userSavedPost.findMany({
        where: { userId, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      savedMap = saved.reduce((acc, s) => {
        acc[s.postId] = true;
        return acc;
      }, {} as Record<number, boolean>);
    }

    const savesCountMap: Record<number, number> = {};
    if (posts.length > 0) {
      const savesCounts = await this.prisma.userSavedPost.groupBy({
        by: ['postId'],
        where: { postId: { in: posts.map((p) => p.id) } },
        _count: { postId: true },
      });
      savesCounts.forEach((count) => {
        savesCountMap[count.postId] = count._count.postId;
      });
    }

    return {
      posts: posts.map((post) =>
        this.mapPostToResponse(
          post,
          likedMap[post.id],
          followingMap[post.id],
          savedMap[post.id],
          savesCountMap[post.id] ?? 0
        ).post
      ),
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

    if (updatePostdto.media) {
      await this.prisma.postMedia.deleteMany({
        where: { postId },
      });

      if (updatePostdto.media.length > 0) {
        await this.prisma.postMedia.createMany({
          data: updatePostdto.media.map(media => ({
            postId,
            url: media.url,
            type: media.type,
          })),
        });
      }
    }

    const updateData: any = {
      caption: updatePostdto.caption ?? post.caption,
    };

    if (updatePostdto.recipeId !== undefined && updatePostdto.recipeId !== null) {
      updateData.recipeId = updatePostdto.recipeId;
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        media: true,
        recipe: { select: { id: true, title: true, slug: true } },
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true, username: true },
        },
      },
    });

    return this.mapPostToResponse(updated, undefined, undefined, undefined, 0);
  }

  async deletePost(
    userId: number,
    postId: number,
  ): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Access denied');

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

  async sharePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    try {
      await this.prisma.postShare.create({ data: { postId, userId } });
      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: { sharesCount: { increment: 1 } },
      });
      return { message: 'Post shared', sharesCount: updatedPost.sharesCount };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const updatedPost = await this.prisma.post.update({
          where: { id: postId },
          data: { sharesCount: { increment: 1 } },
        });
        return { message: 'Post shared', sharesCount: updatedPost.sharesCount };
      }
      throw error;
    }
  }

  async savePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const alreadySaved = await this.prisma.userSavedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (alreadySaved)
      throw new BadRequestException('You have already saved this post');

    await this.prisma.userSavedPost.create({ data: { userId, postId } });

    return { message: 'Post saved' };
  }

  async unsavePost(userId: number, postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const alreadySaved = await this.prisma.userSavedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!alreadySaved)
      throw new BadRequestException('You have not saved this post');

    await this.prisma.userSavedPost.delete({
      where: { userId_postId: { userId, postId } },
    });

    return { message: 'Post unsaved' };
  }
}
