import dotenv from 'dotenv';
dotenv.config();

import { sequelize, testConnection } from './database';
import { insertRoles } from './Auth/models';
import app from './app';

import { testGmailConnection } from './Utils/testGmailConnection';

async function startServer(): Promise<void> {
  try {
    await testConnection();
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    await insertRoles();

    // // Ejecutar test
    // testGmailConnection().then(() => {
    //   console.log('\n🎉 Test completed');
    //   process.exit(0);
    // }).catch(error => {
    //   console.error('\n💥 Test failed with error:', error);
    //   process.exit(1);
    // });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server Running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();