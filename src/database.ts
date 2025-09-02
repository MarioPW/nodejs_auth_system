import { Sequelize } from 'sequelize';
import { Dialect } from 'sequelize';

// Validar que la variable de entorno exista
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', // Especificar el dialecto explícitamente
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Función para probar la conexión
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Tipos para la configuración de la base de datos
export interface DatabaseConfig {
  url: string;
  dialect: Dialect;
  logging: boolean | ((sql: string, timing?: number) => void);
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
}