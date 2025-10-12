import { DataTypes } from 'sequelize';
import { sequelize } from '../database';
import { RolesLookupInstance, UserInstance } from '../types/modelTypes';

const roles = process.env.APP_ROLES
    ? process.env.APP_ROLES.split(',').map(role => role.trim())
    : ['ADMIN', 'USER', 'GUEST'];

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
            allowNull: true, // Nullable for OAuth users
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
        },
        // ⬇️ FIELDS FOR OAuth2
        googleId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        githubId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        microsoftId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        facebookId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        profilePicture: {
            type: DataTypes.STRING,
            allowNull: true
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        // Primary provider used for registration
        primaryProvider: {
            type: DataTypes.ENUM('local', 'google', 'github', 'microsoft', 'facebook'),
            defaultValue: 'local'
        }
    }
);

User.belongsTo(RolesLookup, {
    foreignKey: 'role',
    targetKey: 'name',
    as: 'roleName'
});

export const insertRoles = async (): Promise<void> => {
    try {
        console.log('🔍 Checking required roles...');

        const requiredRoles = roles;
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