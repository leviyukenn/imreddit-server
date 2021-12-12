import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendUserConfirmation(user: User, token: string) {
    const frontendServerDomain = this.configService.get(
      'FRONTEND_LOCAL_DOMAIN',
    );
    const url = `${frontendServerDomain}/change-password/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to imreddit! Confirm your Email',
      template: './reset-password',
      context: {
        // ✏️ filling curly brackets with content
        // name: user.username,
        url,
      },
    });
  }
}
