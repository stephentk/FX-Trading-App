import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configure Gmail SMTP
    this.transporter = nodemailer.createTransport({
   host: 'smtp.gmail.com',
  port: 587,
  secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendOtp(to: string, otpCode: string) {
    try {
      const mailOptions = {
        from: `"FX Trading App" <${this.configService.get<string>('EMAIL_USER')}>`,
        to,
        subject: 'Your OTP Code',
        html: `
          <div style="background-color:#1E40AF; padding:20px; color:white; font-family:Arial, sans-serif; border-radius:8px;">
            <h2 style="color:white;">FX Trading App OTP Verification</h2>
            <p style="color:white; font-size:16px;">Hello,</p>
            <p style="color:white; font-size:16px;">Your One-Time Password (OTP) code is:</p>
            <p style="color:#60A5FA; font-size:24px; font-weight:bold; letter-spacing:2px;">${otpCode}</p>
            <p style="color:white; font-size:14px;">Do not share it with anyone.</p>
            <hr style="border:1px solid #60A5FA;"/>
            <p style="color:white; font-size:12px;">Thank you for using FX Trading App!</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
