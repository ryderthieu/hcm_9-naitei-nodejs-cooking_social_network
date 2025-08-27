import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '@prisma/client';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import {
  LIMIT_DEFAULT,
  PAGE_DEFAULT,
} from 'src/common/constants/pagination.constants';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(
    userId: number,
    createNotificationDto: CreateNotificationDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const receiver = await this.prisma.user.findUnique({
      where: {
        id: createNotificationDto.receiver,
      },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const notification = await this.prisma.notification.create({
      data: {
        sender: userId,
        receiver: receiver.id,
        content: createNotificationDto.content,
        url: createNotificationDto.url,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiverUser: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return { notification };
  }

  async getNotifications(
    currentUser: User,
    getNotificationsDto: GetNotificationsDto,
  ) {
    const { page = PAGE_DEFAULT, limit = LIMIT_DEFAULT } = getNotificationsDto;
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: {
          receiver: currentUser.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          senderUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { receiver: currentUser.id },
      }),
    ]);

    return {
      notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(currentUser: User, notificationId: number) {
    const notification = await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return { notification };
  }

  async markAllAsRead(currentUser: User) {
    const notifications = await this.prisma.notification.updateMany({
      where: {
        receiver: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { message: 'All notifications marked as read' };
  }

  async sendNotification(senderId: number, dto: CreateNotificationDto) {
    const { notification } = await this.createNotification(senderId, dto);
    this.notificationsGateway.server
      .to(`user_${dto.receiver}`)
      .emit('new_notification', { notification });
    return { notification };
  }
}
