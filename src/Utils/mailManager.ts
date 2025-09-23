// src/services/MailManager.ts
import nodemailer from "nodemailer";
import { Logger } from "./logger";

interface EmailTemplate {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface TransporterConfig {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

const transporterConfig: TransporterConfig = {
  service: process.env.TRANSPORTER_SERVICE,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_EMAIL_PASSWORD?.replace(/\s/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
};

const manualTransporterConfig: TransporterConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_EMAIL_PASSWORD?.replace(/\s/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
};
// Validate configuration at startup
if (!process.env.SMTP_EMAIL || !process.env.SMTP_EMAIL_PASSWORD) {
  Logger.error('Email credentials are missing', null, {
    hasMainEmail: !!process.env.SMTP_EMAIL,
    hasMainPassword: !!process.env.SMTP_EMAIL_PASSWORD,
  });
} else {
  Logger.info('Email configuration loaded', {
    email: process.env.SMTP_EMAIL,
    passwordLength: process.env.SMTP_EMAIL_PASSWORD.length,
  });
}

const transporter = nodemailer.createTransport(
  process.env.TRANSPORTER_SERVICE ? transporterConfig : manualTransporterConfig
);

export class MailManager {
  static sendMail = async (emailTemplate: EmailTemplate): Promise<nodemailer.SentMessageInfo> => {
    const { to, subject, text, html } = emailTemplate;
    const startTime = Date.now();

    // Log the email sending attempt
    Logger.email(`Attempting to send email`, to, subject, {
      to,
      subject,
      textLength: text.length,
      htmlLength: html.length,
    });

    // Validate credentials
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_EMAIL_PASSWORD) {
      const error = new Error('Email credentials are not configured');
      Logger.error('Email sending failed: Missing credentials', error);
      throw error;
    }

    try {
      // Verify connection
      Logger.debug('Verifying SMTP connection...');
      await transporter.verify();
      Logger.debug('SMTP connection verified successfully');

      // Send email
      const result = await transporter.sendMail({
        from: `"Your App Name" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        text,
        html,
      });

      const duration = Date.now() - startTime;
      Logger.email(`Email sent successfully in ${duration}ms`, to, subject, {
        messageId: result.messageId,
        duration,
        response: result.response,
      });

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      Logger.error(`Email sending failed after ${duration}ms`, error, {
        to,
        subject,
        duration,
        errorCode: error.code,
        errorResponse: error.response,
      });

      // Attempt manual configuration as a backup
      if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
        Logger.warn('Attempting fallback with manual SMTP configuration...');

        try {
          const manualTransporter = nodemailer.createTransport(manualTransporterConfig);
          await manualTransporter.verify();
          Logger.debug('Manual SMTP connection verified');

          const result = await manualTransporter.sendMail({
            from: `"Your App Name" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            text,
            html,
          });

          const totalDuration = Date.now() - startTime;
          Logger.email(`Email sent with fallback configuration in ${totalDuration}ms`, to, subject, {
            messageId: result.messageId,
            duration: totalDuration,
            usedFallback: true,
          });

          return result;
        } catch (manualError: any) {
          const totalDuration = Date.now() - startTime;
          Logger.error(`Both email configurations failed after ${totalDuration}ms`, manualError, {
            to,
            subject,
            duration: totalDuration,
            primaryError: error.message,
            fallbackError: manualError.message,
          });
          throw new Error(`Failed to send email: ${error.message}`);
        }
      }

      throw error;
    }
  }

  static testConnection = async (): Promise<boolean> => {
    Logger.info('Testing email SMTP connection...');

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_EMAIL_PASSWORD) {
      Logger.error('Cannot test connection: Email credentials missing');
      return false;
    }

    try {
      await transporter.verify();
      Logger.info('SMTP connection test successful', {
        email: process.env.SMTP_EMAIL,
        service: process.env.TRANSPORTER_SERVICE,
      });
      return true;
    } catch (error: any) {
      Logger.warn('Primary SMTP configuration failed, testing manual config...', {
        error: error.message,
      });

      try {
        const manualTransporter = nodemailer.createTransport(manualTransporterConfig);
        await manualTransporter.verify();
        Logger.info('Manual SMTP configuration test successful');
        return true;
      } catch (manualError: any) {
        Logger.error('All SMTP configurations failed', manualError, {
          primaryError: error.message,
          manualError: manualError.message,
          troubleshooting: [
            'Check 2-Factor Authentication is enabled',
            'Generate new App Password',
            'Verify .env variables are correct',
          ],
        });
        return false;
      }
    }
  }

  // Method to send system emails (without detailed logs)
  static sendSystemEmail = async (emailTemplate: EmailTemplate): Promise<boolean> => {
    try {
      await this.sendMail(emailTemplate);
      return true;
    } catch (error) {
      // Already logged in sendMail, just return false
      return false;
    }
  }
}