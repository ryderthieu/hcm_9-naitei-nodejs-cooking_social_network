import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsArray,
  ValidateNested,
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
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image?: string;
}

class ImageDto {
  @IsString()
  imageUrl: string;
}

class UtensilDto {
  @IsString()
  utensil: string;
}

class CategoryDto {
  @IsOptional() mealType?: string;
  @IsOptional() cuisine?: string;
  @IsOptional() occasions?: string;
  @IsOptional() dietaryPreferences?: string;
  @IsOptional() mainIngredients?: string;
  @IsOptional() cookingMethod?: string;
  @IsOptional() timeBased?: string;
  @IsOptional() difficultyLevel?: string;
}

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  time?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  ingredients?: IngredientDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps?: StepDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UtensilDto)
  utensils?: UtensilDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryDto)
  categories?: CategoryDto;
}
