import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType, Post, Recipe, PostMedia, User } from '@prisma/client';

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

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(userId: number, dto: CreatePostDto): Promise<PostResponse> {
    try {
      const recipe = await this.prisma.recipe.findUnique({
        where: { id: dto.recipeId },
      });

      if (!recipe) {
        throw new NotFoundException(`Recipe ID ${dto.recipeId} not found`);
      }

      const mediaData: { url: string; type: MediaType }[] =
        dto.mediaUrls?.map((url, index) => ({
          url,
          type: dto.mediaTypes?.[index] ?? MediaType.IMAGE,
        })) ?? [];

      const post = await this.prisma.post.create({
        data: {
          authorId: userId,
          caption: dto.caption || '',
          recipeId: dto.recipeId,
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
}
