import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  async sendMail(mail: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    await this.transporter.sendMail({
      from: env.EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  }
}

export const emailService = new EmailService();
