import { Model } from 'sequelize';

declare global {
  namespace Express {
    interface User extends Model {
      id: string;
      name: string;
      email: string;
      password: string;
      role: string;
      active: boolean;
      authenticated: boolean;
      resetPasswordToken: string | null;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}