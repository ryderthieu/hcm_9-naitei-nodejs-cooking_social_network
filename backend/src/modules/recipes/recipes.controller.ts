import {
  Body,
  Controller,
  Post,
  Put,
  UseGuards,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dtos/create-recipe.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateRecipeDto } from './dtos/update-recipe.dto';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';
import { QueryRecipesDto } from './dtos/query-recipes.dto';
import { CreateRatingDto } from './dtos/create-rating.dto';
import { UpdateRatingDto } from './dtos/update-rating.dto';
import { QueryRatingDto } from './dtos/query-ratings.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body('recipe') createRecipeDto: CreateRecipeDto,
    @CurrentUser('user') user: User,
  ) {
    return this.recipesService.create(createRecipeDto, user);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: number,
    @Body('recipe') updateRecipeDto: UpdateRecipeDto,
    @CurrentUser('user') user: User,
  ) {
    return this.recipesService.update(id, updateRecipeDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: number, @CurrentUser('user') user: User) {
    return this.recipesService.delete(id, user);
  }

  @Get()
  @OptionalAuth()
  async getRecipes(
    @Query() query: QueryRecipesDto,
    @CurrentUser('user') user?: User,
  ) {
    return this.recipesService.getRecipes(query, user);
  }

  @Get(':id')
  @OptionalAuth()
  async getRecipeById(
    @Param('id') id: number,
    @CurrentUser('user') user?: User,
  ) {
    return this.recipesService.getRecipeById(id, user);
  }

  @Post(':id/rating')
  @UseGuards(AuthGuard('jwt'))
  async createRating(
    @Param('id') id: number,
    @Body('rating') createRatingDto: CreateRatingDto,
    @CurrentUser('user') user: User,
  ) {
    return this.recipesService.createRating(createRatingDto, user, id);
  }

  @Put(':id/rating/:ratingId')
  @UseGuards(AuthGuard('jwt'))
  async updateRating(
    @Param('ratingId') ratingId: number,
    @Body('rating') updateRatingDto: UpdateRatingDto,
    @CurrentUser('user') user: User,
    @Param('id') recipeId: number,
  ) {
    return this.recipesService.updateRating(
      ratingId,
      updateRatingDto,
      user,
      recipeId,
    );
  }

  @Delete(':id/rating/:ratingId')
  @UseGuards(AuthGuard('jwt'))
  async deleteRating(
    @Param('ratingId') ratingId: number,
    @CurrentUser('user') user: User,
  ) {
    return this.recipesService.deleteRating(ratingId, user);
  }

  @Get(':id/rating')
  async getRatings(
    @Query() query: QueryRatingDto,
    @Param('id') recipeId: number,
  ) {
    return this.recipesService.getRatings(query, recipeId);
  }
}
