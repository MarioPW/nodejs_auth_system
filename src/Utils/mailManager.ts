import nodemailer from "nodemailer";

// Interface para el email template
interface EmailTemplate {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Interface para la configuración del transporter
interface TransporterConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
}

const transporterConfig: TransporterConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_EMAIL_PASSWORD
  },
};

// Validar que las variables de entorno existan
if (!process.env.SMTP_EMAIL || !process.env.SMTP_EMAIL_PASSWORD) {
  console.warn('SMTP_EMAIL or SMTP_EMAIL_PASSWORD environment variables are not set. Email functionality may not work properly.');
}

const transporter = nodemailer.createTransport(transporterConfig);

export class MailManager {
  static sendMail = async (emailTemplate: EmailTemplate): Promise<nodemailer.SentMessageInfo> => {
    const { to, subject, text, html } = emailTemplate;
    
    // Validar que el transporter esté configurado correctamente
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_EMAIL_PASSWORD) {
      throw new Error('Email credentials are not configured');
    }

    console.log('Sending email to:', to);
    
    try {
      const result = await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        text,
        html,
      });
      
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}