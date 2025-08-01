import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(
    email: string,
    otp: string,
    firstName: string,
    expiresIn: number,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Cooking Social Network - Reset Password',
      template: 'otp-reset-password',
      context: {
        firstName,
        otp,
        expiresIn,
      },
    });
  }
}
