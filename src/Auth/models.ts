import { DataTypes } from 'sequelize';
import { sequelize } from '../database';

import { RolesLookupInstance, UserInstance } from '../types/modelTypes';

// Definition of available roles from .env
const roles = process.env.APP_ROLES
    ? process.env.APP_ROLES.split(',').map(role => role.trim())
    : ['ADMIN', 'USER', 'GUEST']; // Default values

// Definition of RolesLookup - FIXED with the correct type
const RolesLookup = sequelize.define<RolesLookupInstance>(
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

// Definition of User with the correct type
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

// Relationship between User and RolesLookup
User.belongsTo(RolesLookup, {
    foreignKey: 'role',
    targetKey: 'name',
    as: 'roleName'
});

// Function to insert roles - ALREADY PERFECT, just a small type adjustment
export const insertRoles = async (): Promise<void> => {
    try {
        console.log('🔍 Checking required roles...');

        // Verify that exactly the roles you need exist
        const requiredRoles = roles; // Your "roles" array
        const existingRoles = await RolesLookup.findAll({
            attributes: ['name']
        });

        const existingRoleNames = existingRoles.map(role => role.name);
        const missingRoles = requiredRoles.filter(role => !existingRoleNames.includes(role));

        if (missingRoles.length === 0) {
            console.log(`✅ All required roles found in database correctly (${existingRoleNames.length} roles)`);
            return;
        }

        console.log(`🌱 Inserting ${missingRoles.length} missing roles: ${missingRoles.join(', ')}`);

        // Insert only the missing roles
        await RolesLookup.bulkCreate(
            missingRoles.map(role => ({ name: role })),
            { ignoreDuplicates: true }
        );

        console.log('✅ Roles inserted successfully');
    } catch (error) {
        console.error('Error inserting roles:', error);
        throw error;
    }
};