import { Model, Optional } from 'sequelize';

// Interfaces for RolesLookup
interface RolesLookupAttributes {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

interface RolesLookupCreationAttributes extends Optional<RolesLookupAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Interface for the RolesLookupInstance model - ADD
export interface RolesLookupInstance extends Model<RolesLookupAttributes, RolesLookupCreationAttributes>, RolesLookupAttributes {}

// Interfaces for User - EXPORT these interfaces
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

// Interface for the UserInstance model
export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}