import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { PostsModule } from './modules/posts/posts.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { CommentsModule } from './modules/comments/comments.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmailModule,
    PostsModule,
    IngredientsModule,
    ConversationsModule,
    CommentsModule,
    RecipesModule,
    MessagesModule,
    CloudinaryModule,
    NotificationsModule,
  ],
})
export class AppModule {}
