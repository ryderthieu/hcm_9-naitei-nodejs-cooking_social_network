import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsPositive,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ToggleReactionDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  conversationId: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  messageId: number;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u,
    {
      message: 'Reaction must be a valid emoji',
    },
  )
  reaction: string;
}
