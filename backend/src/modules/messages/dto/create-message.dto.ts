import { MessageType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsNumber()
  conversationId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsNumber()
  replyOf?: number;
}
