import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetNotificationsDto } from './dto/get-notifications.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(
    @CurrentUser('user') currentUser: User,
    @Query() getNotificationsDto: GetNotificationsDto,
  ) {
    return this.notificationsService.getNotifications(
      currentUser,
      getNotificationsDto,
    );
  }

  @Post(':notificationId/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @CurrentUser() currentUser: User,
    @Param('notificationId') notificationId: number,
  ) {
    return this.notificationsService.markAsRead(currentUser, notificationId);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@CurrentUser() currentUser: User) {
    return this.notificationsService.markAllAsRead(currentUser);
  }
}
