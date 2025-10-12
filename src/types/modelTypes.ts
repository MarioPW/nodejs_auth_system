// src/types/modelTypes.ts
import { Model, Optional } from 'sequelize';

// ============================================
// USER TYPES
// ============================================

export interface UserAttributes {
    id: string;
    name: string | null;
    email: string;
    password: string | null; // Optional for OAuth users
    role: string;
    active: boolean;
    authenticated: boolean;
    resetPasswordToken: string | null;
    
    // OAuth fields
    googleId?: string | null;
    githubId?: string | null;
    microsoftId?: string | null;
    facebookId?: string | null;
    profilePicture?: string | null;
    emailVerified?: boolean;
    primaryProvider?: 'local' | 'google' | 'github' | 'microsoft' | 'facebook';
    
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<
    UserAttributes, 
    'id' | 'name' | 'password' | 'active' | 'authenticated' | 'resetPasswordToken' | 'googleId' | 'githubId' | 'microsoftId' | 'facebookId' | 'profilePicture' | 'emailVerified' | 'primaryProvider'
> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
    save(): Promise<this>;
}

// ============================================
// ROLES TYPES
// ============================================

export interface RolesLookupAttributes {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RolesLookupCreationAttributes extends Optional<RolesLookupAttributes, 'id'> {}

export interface RolesLookupInstance extends Model<RolesLookupAttributes, RolesLookupCreationAttributes>, RolesLookupAttributes {}

// ============================================
// OAUTH HELPER TYPES
// ============================================

export interface OAuthProfile {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    emailVerified?: boolean;
    provider: 'google' | 'github' | 'microsoft' | 'facebook';
}