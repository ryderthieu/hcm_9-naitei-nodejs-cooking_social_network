import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dtos/create-ingredient.dto';
import slugify from 'slugify';
import { User } from '@prisma/client';
import { UpdateIngredientDto } from './dtos/update-ingredient.dto';
import {
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common/exceptions';
import { QueryIngredientsDto } from './dtos/query-ingredients.dto';
import {
  PAGE_DEFAULT,
  LIMIT_DEFAULT,
} from 'src/common/constants/pagination.constants';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(currentUser: User, createIngredientDto: CreateIngredientDto) {
    const slug = slugify(createIngredientDto.name, {
      lower: true,
      strict: true,
    });

    const persistedIngredient = await this.prisma.ingredient.findUnique({
      where: { slug },
    });

    if (persistedIngredient) {
      throw new BadRequestException('Ingredient with this slug already exists');
    }

    const ingredient = await this.prisma.ingredient.create({
      data: {
        ...createIngredientDto,
        slug,
      },
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
    });

    return {
      ingredient: ingredient,
    };
  }

  async update(
    id: number,
    currentUser: User,
    updateIngredientDto: UpdateIngredientDto,
  ) {
    let { slug, name } = updateIngredientDto;

    if ((!slug || slug.trim() === '') && name) {
      slug = slugify(name, { lower: true, strict: true });
    }

    if (slug) {
      const duplicate = await this.prisma.ingredient.findFirst({
        where: {
          slug,
          NOT: [{ id }],
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          'Slug already exists for another ingredient',
        );
      }
    }

    const updatedData = {
      ...updateIngredientDto,
      slug,
    };

    const updatedIngredient = await this.prisma.ingredient.update({
      where: { id },
      data: updatedData,
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
    });

    return {
      ingredient: updatedIngredient,
    };
  }

  async delete(id: number, currentUser: User) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!ingredient) {
      throw new BadRequestException('Ingredient not found');
    }

    if (ingredient.authorId !== currentUser.id) {
      throw new UnauthorizedException(
        'You are not authorized to delete this ingredient',
      );
    }

    const deletedIngredient = await this.prisma.ingredient.delete({
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
      },
    });

    return {
      message: 'Ingredient deleted successfully',
      ingredient: deletedIngredient,
    };
  }

  async findAll(currentUser?: User, query?: QueryIngredientsDto) {
    const { keyword, page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = query ?? {};

    const where = keyword
      ? {
          name: {
            contains: keyword,
          },
        }
      : {};

    const [ingredients, total] = await this.prisma.$transaction([
      this.prisma.ingredient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.ingredient.count({ where }),
    ]);

    return {
      ingredients,
      meta: {
        total,
        page,
        limit,
      },
    };
  }
}
