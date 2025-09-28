import dotenv from 'dotenv';
dotenv.config();

import { sequelize, testConnection } from './database';
import { insertRoles } from './Auth/models';
import app from './app';

import { SMTPTester, testSMTPConnection } from './Utils/testSMTPConnection';

async function testCurrentSMTPConfiguration(): Promise<boolean> {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_EMAIL_PASSWORD;
  const host = process.env.SMTP_HOST;
  
  if (!email || !password || !host) {
    console.log('❌ Missing SMTP configuration in environment variables');
    return false;
  }
  
  // const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  // const secure = process.env.SMTP_SECURE === 'true';
  
  // console.log(`🧪 Testing SMTP: ${host}:${port} (secure: ${secure})`);
  
  // const tester = new SMTPTester();
  // const result = await tester.quickTest(host, port, secure);
  
  // return result.success;
  return testSMTPConnection();
}

async function startServer(): Promise<void> {
  try {
    await testConnection();
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    await insertRoles();

    // Test sólo la configuración actual
    testCurrentSMTPConfiguration().then(success => {
      console.log(success ? '✅ SMTP ready' : '❌ SMTP configuration issues');
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Server Running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();