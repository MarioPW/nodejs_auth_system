import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

const roles = [
    'ADMIN',
    'USER',
    'GUEST'
];

// Interfaces para RolesLookup
interface RolesLookupAttributes {
    id?: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface RolesLookupCreationAttributes extends Optional<RolesLookupAttributes, 'id'> {}

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

// Definición de RolesLookup
const RolesLookup = sequelize.define<Model<RolesLookupAttributes, RolesLookupCreationAttributes>>(
    'RolesLookup', 
    {
        id: { 
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4, 
            primaryKey: true 
        },
        name: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: true 
        },
        createdAt: { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW 
        },
        updatedAt: { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW 
        },
    }
);

// Definición de User con el tipo correcto
export const User = sequelize.define<UserInstance>(
    'User', 
    {
        id: { 
            type: DataTypes.UUID, 
            defaultValue: DataTypes.UUIDV4, 
            primaryKey: true 
        },
        name: { 
            type: DataTypes.STRING, 
            allowNull: true 
        },
        email: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        createdAt: { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW 
        },
        updatedAt: { 
            type: DataTypes.DATE, 
            defaultValue: DataTypes.NOW 
        },
        role: { 
            type: DataTypes.STRING,
            allowNull: false, 
            defaultValue: 'USER',
            references: {
                model: RolesLookup,
                key: 'name'
            }
        },
        active: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        },
        authenticated: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        },
        resetPasswordToken: { 
            type: DataTypes.STRING, 
            allowNull: true 
        }
    }
);

// Relación entre User y RolesLookup
User.belongsTo(RolesLookup, { 
    foreignKey: 'role', 
    targetKey: 'name',
    as: 'roleName' 
});

// Función para insertar roles
export const insertRoles = async (): Promise<void> => {
    try {
        await RolesLookup.bulkCreate(
            roles.map(role => ({ name: role })),
            { ignoreDuplicates: true }
        );
        console.log('Roles insertados correctamente');
    } catch (error) {
        console.error('Error al insertar roles:', error);
        throw error;
    }
};