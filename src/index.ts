import dotenv from 'dotenv';
dotenv.config();

import { sequelize, testConnection } from './config/database';
import { insertRoles } from './Auth/models';
import app from './app';

import { testSMTPConnection } from './Utils/testSMTPConnection';

async function testCurrentSMTPConfiguration(): Promise<boolean> {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_EMAIL_PASSWORD;
  const host = process.env.SMTP_HOST;
  
  if (!email || !password || !host) {
    console.log('❌ Missing SMTP configuration in environment variables');
    return false;
  }
  return testSMTPConnection();
}

async function startServer(): Promise<void> {
  try {
    await testConnection();
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    await insertRoles();

    // Test only the current configuration
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