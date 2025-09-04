import { Model, Optional } from 'sequelize';

// Interfaces para RolesLookup
interface RolesLookupAttributes {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

interface RolesLookupCreationAttributes extends Optional<RolesLookupAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Interface para el modelo RolesLookupInstance - AGREGAR
export interface RolesLookupInstance extends Model<RolesLookupAttributes, RolesLookupCreationAttributes>, RolesLookupAttributes {}

// Interfaces para User - EXPORTAR estas interfaces
export interface UserAttributes {
    id?: string;
    name?: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
    role: string;
    active?: boolean;
    authenticated?: boolean;
    resetPasswordToken?: string | null;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'name' | 'active' | 'authenticated' | 'resetPasswordToken'> {}

// Interface para el modelo UserInstance
export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}