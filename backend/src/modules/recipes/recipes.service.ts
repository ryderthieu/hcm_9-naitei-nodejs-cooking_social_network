import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dtos/create-recipe.dto';
import { User } from '@prisma/client';
import { UpdateRecipeDto } from './dtos/update-recipe.dto';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { QueryRecipesDto } from './dtos/query-recipes.dto';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';
import { QueryRatingDto } from './dtos/query-ratings.dto';
import slugify from 'slugify';
import {
  PAGE_DEFAULT,
  LIMIT_DEFAULT,
} from 'src/common/constants/pagination.constants';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(createRecipeDto: CreateRecipeDto, currentUser: User) {
    const {
      title,
      description,
      time,
      ingredients,
      steps,
      images,
      utensils,
      categories,
    } = createRecipeDto;

    const slug = slugify(title, { lower: true, strict: true });

    const createdRecipe = await this.prisma.recipe.create({
      data: {
        authorId: currentUser.id,
        title,
        description,
        time,
        slug,

        ingredients: {
          create: (ingredients ?? []).map((ingredient) => ({
            ingredient: { connect: { id: ingredient.ingredientId } },
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
        },

        steps: {
          create: (steps ?? []).map((step) => ({
            description: step.description,
            image: step.image,
          })),
        },

        images: {
          create: (images ?? []).map((image) => ({
            imageUrl: image.imageUrl,
          })),
        },

        utensils: {
          create: (utensils ?? []).map((utensil) => ({
            utensil: utensil.utensil,
          })),
        },

        categories: categories
          ? {
              create: {
                mealType: categories?.mealType
                  ? (categories.mealType as any)
                  : null,
                cuisine: categories?.cuisine
                  ? (categories.cuisine as any)
                  : null,
                occasions: categories?.occasions
                  ? (categories.occasions as any)
                  : null,
                dietaryPreferences: categories?.dietaryPreferences
                  ? (categories.dietaryPreferences as any)
                  : null,
                mainIngredients: categories?.mainIngredients
                  ? (categories.mainIngredients as any)
                  : null,
                cookingMethod: categories?.cookingMethod
                  ? (categories.cookingMethod as any)
                  : null,
                timeBased: categories?.timeBased
                  ? (categories.timeBased as any)
                  : null,
                difficultyLevel: categories?.difficultyLevel
                  ? (categories.difficultyLevel as any)
                  : null,
              },
            }
          : undefined,
      },
      include: {
        ingredients: true,
        steps: true,
        images: true,
        utensils: true,
        categories: true,
      },
    });

    return {
      recipe: createdRecipe,
    };
  }

  async update(
    id: number,
    updateRecipeDto: UpdateRecipeDto,
    currentUser: User,
  ) {
    const {
      title,
      description,
      time,
      ingredients,
      steps,
      images,
      utensils,
      categories,
    } = updateRecipeDto;

    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (existingRecipe.authorId !== currentUser.id) {
      throw new ForbiddenException('You are not allowed to update this recipe');
    }

    const slug = title
      ? slugify(title, { lower: true, strict: true })
      : undefined;

    const updatedRecipe = await this.prisma.recipe.update({
      where: { id },
      data: {
        title,
        description,
        time,
        slug,

        ingredients: {
          deleteMany: {},
          create: ingredients?.map((ingredient) => ({
            ingredient: {
              connect: { id: ingredient.ingredientId },
            },
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          })),
        },

        steps: {
          deleteMany: {},
          create: steps?.map((step) => ({
            description: step.description,
            image: step.image,
          })),
        },

        images: {
          deleteMany: {},
          create: images?.map((image) => ({
            imageUrl: image.imageUrl,
          })),
        },

        utensils: {
          deleteMany: {},
          create: utensils?.map((utensil) => ({
            utensil: utensil.utensil,
          })),
        },

        categories: categories
          ? {
              upsert: {
                update: {
                  mealType: (categories.mealType as any) ?? null,
                  cuisine: (categories.cuisine as any) ?? null,
                  occasions: (categories.occasions as any) ?? null,
                  dietaryPreferences:
                    (categories.dietaryPreferences as any) ?? null,
                  mainIngredients: (categories.mainIngredients as any) ?? null,
                  cookingMethod: (categories.cookingMethod as any) ?? null,
                  timeBased: (categories.timeBased as any) ?? null,
                  difficultyLevel: (categories.difficultyLevel as any) ?? null,
                },
                create: {
                  mealType: (categories.mealType as any) ?? null,
                  cuisine: (categories.cuisine as any) ?? null,
                  occasions: (categories.occasions as any) ?? null,
                  dietaryPreferences:
                    (categories.dietaryPreferences as any) ?? null,
                  mainIngredients: (categories.mainIngredients as any) ?? null,
                  cookingMethod: (categories.cookingMethod as any) ?? null,
                  timeBased: (categories.timeBased as any) ?? null,
                  difficultyLevel: (categories.difficultyLevel as any) ?? null,
                },
              },
            }
          : undefined,
      },
      include: {
        ingredients: true,
        steps: true,
        images: true,
        utensils: true,
        categories: true,
      },
    });

    return {
      recipe: updatedRecipe,
    };
  }

  async delete(id: number, currentUser: User) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.authorId !== currentUser.id) {
      throw new ForbiddenException('You are not allowed to delete this recipe');
    }

    const deletedRecipe = await this.prisma.recipe.delete({
      where: { id },
      include: {
        ingredients: true,
        steps: true,
        images: true,
        utensils: true,
        categories: true,
      },
    });

    return {
      message: 'Recipe deleted successfully',
      recipe: deletedRecipe,
    };
  }

  async getRecipes(query: QueryRecipesDto, currentUser?: User) {
    const {
      name,
      username,
      mealType,
      cuisine,
      occasions,
      dietaryPreferences,
      mainIngredient,
      cookingMethod,
      timeBased,
      level,
      savedBy,
      limit = LIMIT_DEFAULT,
      page = PAGE_DEFAULT,
    } = query;

    const filters: any[] = [];

    if (name) {
      const nameLower = name.toLowerCase();

      const nameSlug = nameLower
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      filters.push({
        OR: [
          {
            title: {
              contains: nameLower,
            },
          },
          {
            description: {
              contains: nameLower,
            },
          },
          {
            slug: {
              contains: nameSlug,
            },
          },
        ],
      });
    }

    const categoryFilter: any = {};
    if (mealType) categoryFilter.mealType = mealType;
    if (cuisine) categoryFilter.cuisine = cuisine;
    if (occasions) categoryFilter.occasions = occasions;
    if (dietaryPreferences)
      categoryFilter.dietaryPreferences = dietaryPreferences;
    if (mainIngredient) categoryFilter.mainIngredients = mainIngredient;
    if (cookingMethod) categoryFilter.cookingMethod = cookingMethod;
    if (timeBased) categoryFilter.timeBased = timeBased;
    if (level) categoryFilter.difficultyLevel = level;

    if (Object.keys(categoryFilter).length > 0) {
      filters.push({
        categories: categoryFilter,
      });
    }

    if (savedBy) {
      filters.push({
        savedByUsers: {
          some: {
            id: Number(savedBy),
          },
        },
      });
    }

    if (username) {
      filters.push({
        author: {
          username: username,
        },
      });
    }

    const where = filters.length > 0 ? { AND: filters } : {};

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: true,
          savedByUsers: true,
          author: true,
          images: true,
        },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      recipes,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getRecipeById(id: number, currentUser?: User) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        steps: true,
        images: true,
        utensils: true,
        categories: true,
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        savedByUsers: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const isSavedByCurrentUser = currentUser
      ? recipe.savedByUsers.some((user) => user.user.id === currentUser.id)
      : false;

    return {
      ...recipe,
      isSavedByCurrentUser,
    };
  }

  async createRating(
    createRatingDto: CreateRatingDto,
    currentUser: User,
    recipeId: number,
  ) {
    const { rating, comment } = createRatingDto;

    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const existingRating = await this.prisma.recipeRating.findFirst({
      where: { recipeId, userId: currentUser.id },
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this recipe');
    }

    const newRating = await this.prisma.recipeRating.create({
      data: {
        rating,
        comment,
        recipe: {
          connect: { id: recipeId },
        },
        user: {
          connect: { id: currentUser.id },
        },
      },
      include: {
        recipe: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        user: true,
      },
    });

    return {
      rating: newRating,
    };
  }

  async updateRating(
    ratingId: number,
    updateRatingDto: UpdateRatingDto,
    currentUser: User,
    recipeId: number,
  ) {
    const existingRating = await this.prisma.recipeRating.findUnique({
      where: { id: ratingId },
    });

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    if (existingRating.userId !== currentUser.id) {
      throw new ForbiddenException('You are not allowed to update this rating');
    }

    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (recipe.id !== existingRating.recipeId) {
      throw new BadRequestException('Rating does not belong to this recipe');
    }

    const updatedRating = await this.prisma.recipeRating.update({
      where: { id: ratingId },
      data: {
        ...updateRatingDto,
      },
      include: {
        recipe: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return {
      rating: updatedRating,
    };
  }

  async deleteRating(ratingId: number, currentUser: User) {
    const existingRating = await this.prisma.recipeRating.findUnique({
      where: { id: ratingId },
    });

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    if (existingRating.userId !== currentUser.id) {
      throw new ForbiddenException('You are not allowed to delete this rating');
    }

    const deletedRating = await this.prisma.recipeRating.delete({
      where: { id: ratingId },
      include: {
        recipe: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Rating deleted successfully',
      rating: deletedRating,
    };
  }

  async getRatings(query: QueryRatingDto, recipeId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const { rating, limit = LIMIT_DEFAULT, page = PAGE_DEFAULT } = query;

    const where: any = {
      recipeId: recipeId,
    };

    if (rating) {
      where.rating = {
        gte: rating,
      };
    }

    const [ratings, total] = await Promise.all([
      this.prisma.recipeRating.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recipe: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.recipeRating.count({ where }),
    ]);

    return {
      ratings,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findUserReviewForRecipe(recipeId: number, userId: number) {
    const review = await this.prisma.recipeRating.findFirst({
      where: { recipeId: recipeId, userId: userId },
      include: { user: true },
    });
    return review;
  }
}
