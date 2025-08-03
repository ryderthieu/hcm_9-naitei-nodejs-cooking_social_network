import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class IngredientDto {
  @IsInt()
  ingredientId: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

class StepDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;
}

class ImageDto {
  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}

class UtensilDto {
  @IsNotEmpty()
  @IsString()
  utensil: string;
}

class CategoryDto {
  @IsOptional()
  mealType?: string;

  @IsOptional()
  cuisine?: string;

  @IsOptional()
  occasions?: string;

  @IsOptional()
  dietaryPreferences?: string;

  @IsOptional()
  mainIngredients?: string;

  @IsOptional()
  cookingMethod?: string;

  @IsOptional()
  timeBased?: string;

  @IsOptional()
  difficultyLevel?: string;
}

export class CreateRecipeDto {
  @IsInt()
  authorId: number;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  time?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: StepDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images: ImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UtensilDto)
  utensils: UtensilDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryDto)
  categories?: CategoryDto;
}
