import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Get,
  Query,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dtos/create-ingredient.dto';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { User } from '@prisma/client';
import { UpdateIngredientDto } from './dtos/update-ingredient.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { OptionalAuth } from 'src/common/decorators/optional-auth.decorator';
import { QueryIngredientsDto } from './dtos/query-ingredients.dto';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(
    @CurrentUser('user') user: User,
    @Body('ingredient') createIngredientDto: CreateIngredientDto,
  ) {
    return this.ingredientsService.create(user, createIngredientDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body('ingredient') updateIngredientDto: UpdateIngredientDto,
    @CurrentUser('user') user: User,
  ) {
    return this.ingredientsService.update(id, user, updateIngredientDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: number, @CurrentUser('user') user: User) {
    return this.ingredientsService.delete(id, user);
  }

  @OptionalAuth()
  @Get()
  async findAll(
    @CurrentUser('user') user: User,
    @Query() query: QueryIngredientsDto,
  ) {
    return this.ingredientsService.findAll(user, query);
  }
}
