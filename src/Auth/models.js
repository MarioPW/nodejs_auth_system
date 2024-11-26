import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const roles = [
    'ADMIN',
    'USER',
    'GUEST'
]

const RolesLookup = sequelize.define('RolesLookup', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

export const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, maxLength: 25 },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    role: {  type: DataTypes.UUID,  references: { model: RolesLookup, key: 'name' }, allowNull: false, defaultValue: 'USER' },
    active: { type: DataTypes.BOOLEAN, defaultValue: false },
    authenticated: { type: DataTypes.BOOLEAN, defaultValue: false },
    resetPasswordToken: { type: DataTypes.STRING, nullable: true }
})

User.belongsTo(RolesLookup, { foreignKey: 'role', as: 'roleName' });

export const insertRoles = async () => {
    try {
        await RolesLookup.bulkCreate(
            roles.map(role => ({ name: role })),
            { ignoreDuplicates: true }
        );
        console.log('Roles insertados correctamente');
    } catch (error) {
        console.error('Error al insertar roles:', error);
    }
};