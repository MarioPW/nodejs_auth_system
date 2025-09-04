import dotenv from 'dotenv';

// Cargar variables de entorno de prueba
dotenv.config({ path: '.env.test' });

// Mock completo de Sequelize y la base de datos
jest.mock('../src/database', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(undefined),
    sync: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    define: jest.fn().mockImplementation((modelName) => {
      // Mock para cada modelo
      return {
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        belongsTo: jest.fn().mockReturnThis(),
        hasMany: jest.fn().mockReturnThis(),
        // Para relaciones
        association: jest.fn(),
        // Para operaciones de bulk
        bulkCreate: jest.fn(),
        // Para transacciones
        transaction: jest.fn().mockReturnValue({
          commit: jest.fn().mockResolvedValue(undefined),
          rollback: jest.fn().mockResolvedValue(undefined),
        }),
      };
    }),
  };

  return {
    sequelize: mockSequelize,
    // Si exportas otros elementos de database.ts, agrégalos aquí
  };
});

// Mock específico para los modelos
jest.mock('../src/Auth/models', () => {
  const mockUser = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  };

  return {
    User: mockUser,
    // Agrega otros modelos si los tienes
  };
});