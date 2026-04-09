import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as otpGenerator from 'otp-generator';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(private db: DatabaseService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async register(email: string, password: string) {
    try {
      console.log('--- Registering:', email);

      // Backend Regex Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
      const exemptEmails = ['ys5313944@gmail.com', 'yahiasaad1904@gmail.com'];

      if (!emailRegex.test(email)) {
        throw new BadRequestException('Invalid email format');
      }
      if (!exemptEmails.includes(email) && !passwordRegex.test(password)) {
        throw new BadRequestException('Password must be 8+ chars, have upper/lower/special characters');
      }

      const hash = await bcrypt.hash(password, 10);
      await this.db.pool.query(
        "INSERT INTO auth_users(email, password_hash) VALUES($1, $2)",
        [email, hash]
      );
      console.log('✅ User registered successfully');
      return { message: "User registered" };
    } catch (error) {
      console.error('❌ Register Error:', error.message);
      if (error.code === '23505') throw new HttpException('User already exists', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    console.log('--- Forgot Password:', email);
    const userResult = await this.db.pool.query("SELECT * FROM auth_users WHERE email=$1", [email]);
    if (userResult.rows.length === 0) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const expire = new Date(Date.now() + 10 * 60000); // 10 mins

    await this.db.pool.query("DELETE FROM auth_otp_codes WHERE email=$1", [email]);
    await this.db.pool.query(
      "INSERT INTO auth_otp_codes(email, otp, expires_at, last_sent) VALUES($1, $2, $3, NOW())",
      [email, otp, expire]
    );

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "VPN Password Reset Code",
        text: `Your password reset code is ${otp}. It expires in 10 minutes.`
      });
      console.log('✅ Reset Email Sent');
    } catch (e) {
      console.error('❌ Email Error:', e);
      throw new HttpException("Error sending reset email", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { message: "Reset code sent" };
  }

  async resetPassword(resetDto: any) {
    const { email, otp, newPassword } = resetDto;
    console.log('--- Resetting Password:', email);

    const otpResult = await this.db.pool.query(
      "SELECT * FROM auth_otp_codes WHERE email=$1 AND otp=$2",
      [email, otp]
    );

    if (otpResult.rows.length === 0) {
      throw new BadRequestException("Invalid reset code");
    }

    const record = otpResult.rows[0];
    if (new Date(record.expires_at) < new Date()) {
      throw new BadRequestException("Reset code expired");
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.db.pool.query("UPDATE auth_users SET password_hash=$1 WHERE email=$2", [hash, email]);
    await this.db.pool.query("DELETE FROM auth_otp_codes WHERE email=$1", [email]);

    console.log('✅ Password reset successfully');
    return { message: "Password updated" };
  }

  async changePassword(changeDto: any) {
    const { email, oldPassword, newPassword } = changeDto;
    console.log('--- Changing Password:', email);

    const userResult = await this.db.pool.query("SELECT * FROM auth_users WHERE email=$1", [email]);
    if (userResult.rows.length === 0) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const dbUser = userResult.rows[0];
    const valid = await bcrypt.compare(oldPassword, dbUser.password_hash);
    if (!valid) {
      throw new UnauthorizedException("Incorrect current password");
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.db.pool.query("UPDATE auth_users SET password_hash=$1 WHERE email=$2", [hash, email]);

    console.log('✅ Password changed successfully');
    return { message: "Password updated" };
  }

  async login(email: string, password: string, ip: string) {
    try {
      console.log('--- Login Attempt:', email);
      const userResult = await this.db.pool.query(
        "SELECT * FROM auth_users WHERE email=$1",
        [email]
      );

      if (userResult.rows.length === 0) {
        throw new UnauthorizedException("User not found");
      }

      const dbUser = userResult.rows[0];

      if (dbUser.lock_until && new Date(dbUser.lock_until) > new Date()) {
        throw new ForbiddenException("Account locked");
      }

      const valid = await bcrypt.compare(password, dbUser.password_hash);

      if (!valid) {
        const attempts = (dbUser.failed_attempts || 0) + 1;
        if (attempts >= 5) {
          await this.db.pool.query(
            "UPDATE auth_users SET failed_attempts=$1, lock_until=NOW()+INTERVAL '15 minutes' WHERE email=$2",
            [attempts, email]
          );
          throw new ForbiddenException("Account locked for 15 minutes");
        }
        await this.db.pool.query(
          "UPDATE auth_users SET failed_attempts=$1 WHERE email=$2",
          [attempts, email]
        );
        throw new UnauthorizedException("Wrong password");
      }

      await this.db.pool.query(
        "UPDATE auth_users SET failed_attempts=0, lock_until=NULL WHERE email=$1",
        [email]
      );

      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
      const expire = new Date(Date.now() + 2 * 60000);

      await this.db.pool.query("DELETE FROM auth_otp_codes WHERE email=$1", [email]);
      await this.db.pool.query(
        "INSERT INTO auth_otp_codes(email, otp, expires_at, last_sent) VALUES($1, $2, $3, NOW())",
        [email, otp, expire]
      );

      try {
        await this.transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your VPN Login Code",
          text: `Your OTP code is ${otp}`
        });
        console.log('✅ OTP Email Sent');
      } catch (e) {
        console.error('❌ Email Error DETAILED:', e);
        throw new HttpException("Error sending email: " + e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return { status: "OTP_SENT" };
    } catch (error) {
      console.error('❌ Login Error:', error.message);
      throw error;
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const result = await this.db.pool.query(
        "SELECT * FROM auth_otp_codes WHERE email=$1 AND otp=$2",
        [email, otp]
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedException("Invalid OTP");
      }

      const record = result.rows[0];
      if (new Date(record.expires_at) < new Date()) {
        throw new UnauthorizedException("OTP expired");
      }

      const token = jwt.sign(
        { user: email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: "7d" }
      );

      return { token };
    } catch (error) {
      console.error('❌ Verify Error:', error.message);
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {
      const record = await this.db.pool.query(
        "SELECT last_sent FROM auth_otp_codes WHERE email=$1",
        [email]
      );

      if (record.rows.length > 0) {
        const last = new Date(record.rows[0].last_sent);
        const now = new Date();
        if ((now.getTime() - last.getTime()) / 1000 < 30) {
          throw new HttpException("Wait before requesting new OTP", HttpStatus.TOO_MANY_REQUESTS);
        }
      }

      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
      const expire = new Date(Date.now() + 2 * 60000);

      await this.db.pool.query("DELETE FROM auth_otp_codes WHERE email=$1", [email]);
      await this.db.pool.query(
        "INSERT INTO auth_otp_codes(email, otp, expires_at, last_sent) VALUES($1, $2, $3, NOW())",
        [email, otp, expire]
      );

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your VPN Login Code",
        text: `Your new OTP code is ${otp}`
      });

      return { status: "OTP_RESENT" };
    } catch (error) {
      console.error('❌ Resend Error:', error.message);
      throw error;
    }
  }
}
