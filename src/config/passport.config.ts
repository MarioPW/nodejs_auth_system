// src/config/passport.config.ts
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { User } from '../Auth/models';
import { UserInstance } from '../types/modelTypes';


/**
 * Serializa el usuario en la sesión
 */
passport.serializeUser((user: Express.User, done) => {
    done(null, (user as UserInstance).id);
});

/**
 * Deserializa el usuario desde la sesión
 */
passport.deserializeUser<string>(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(user);
    } catch (error) {
        done(error, null);
    }
});

/**
 * Helper: Encuentra o crea usuario OAuth
 */
interface OAuthProfile {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    emailVerified?: boolean;
    provider: 'google' | 'github' | 'microsoft';
}

const findOrCreateOAuthUser = async (profile: OAuthProfile): Promise<UserInstance> => {
    const { id: providerId, email, name, picture, emailVerified, provider } = profile;
    
    // Campo dinámico del proveedor (googleId, githubId, microsoftId)
    const providerField = `${provider}Id`;
    
    // 1. Buscar por provider ID
    let user = await User.findOne({ 
        where: { [providerField]: providerId } 
    }) as UserInstance | null;
    
    if (user) {
        // Usuario encontrado, actualizar información
        if (picture) user.profilePicture = picture;
        if (name) user.name = name;
        if (emailVerified !== undefined) user.emailVerified = emailVerified;
        await user.save();
        return user;
    }
    
    // 2. Buscar por email (vincular cuenta existente)
    user = await User.findOne({ where: { email } }) as UserInstance | null;
    
    if (user) {
        // Vincular nuevo proveedor a cuenta existente
        (user as any)[providerField] = providerId;
        if (picture) user.profilePicture = picture;
        if (emailVerified !== undefined) user.emailVerified = emailVerified;
        await user.save();
        console.log(`Linked ${provider} to existing account: ${email}`);
        return user;
    }
    
    // 3. Crear nuevo usuario
    user = await User.create({
        email,
        name: name || email.split('@')[0],
        [providerField]: providerId,
        profilePicture: picture,
        emailVerified: emailVerified || false,
        primaryProvider: provider,
        role: 'USER',
        active: true,
        authenticated: true,
        password: null
    }) as UserInstance;
    
    console.log(`Created new ${provider} user: ${email}`);
    return user;
};

/**
 * GOOGLE OAuth Strategy
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.ROOT_DOMAIN}/auth/google/callback`,
                scope: ['profile', 'email']
            },
            async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
                try {
                    const oauthProfile: OAuthProfile = {
                        id: profile.id,
                        email: profile.emails?.[0]?.value || '',
                        name: profile.displayName,
                        picture: profile.photos?.[0]?.value,
                        emailVerified: profile.emails?.[0]?.verified,
                        provider: 'google'
                    };
                    
                    if (!oauthProfile.email) {
                        return done(new Error('No email provided by Google'));
                    }
                    
                    const user = await findOrCreateOAuthUser(oauthProfile);
                    done(user);
                } catch (error) {
                    done(error as Error);
                }
            }
        )
    );
    console.log('Google OAuth Strategy configured');
} else {
    console.log('Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

/**
 * GITHUB OAuth Strategy
 */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: `${process.env.ROOT_DOMAIN}/auth/github/callback`,
                scope: ['user:email']
            },
            async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: any) => {
                try {
                    const email = profile.emails?.[0]?.value || '';
                    
                    if (!email) {
                        return done(new Error('No email provided by GitHub. Make sure your GitHub email is public.'));
                    }
                    
                    const oauthProfile: OAuthProfile = {
                        id: profile.id,
                        email,
                        name: profile.displayName || profile.username,
                        picture: profile.photos?.[0]?.value,
                        emailVerified: true,
                        provider: 'github'
                    };
                    
                    const user = await findOrCreateOAuthUser(oauthProfile);
                    done(null, user);
                } catch (error) {
                    done(error as Error);
                }
            }
        )
    );
    console.log('GitHub OAuth Strategy configured');
} else {
    console.log('GitHub OAuth not configured (missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET)');
}

/**
 * MICROSOFT OAuth Strategy
 */
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use(
        new MicrosoftStrategy(
            {
                clientID: process.env.MICROSOFT_CLIENT_ID,
                clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
                callbackURL: `${process.env.ROOT_DOMAIN}/auth/microsoft/callback`,
                scope: ['user.read'],
                tenant: 'common'
            },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    const email = profile.emails?.[0]?.value || profile.userPrincipalName;
                    
                    if (!email) {
                        return done(new Error('No email provided by Microsoft'));
                    }
                    
                    const oauthProfile: OAuthProfile = {
                        id: profile.id,
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0]?.value,
                        emailVerified: true,
                        provider: 'microsoft'
                    };
                    
                    const user = await findOrCreateOAuthUser(oauthProfile);
                    done(null, user);
                } catch (error) {
                    done(error as Error);
                }
            }
        )
    );
    console.log('Microsoft OAuth Strategy configured');
} else {
    console.log('Microsoft OAuth not configured (missing MICROSOFT_CLIENT_ID or MICROSOFT_CLIENT_SECRET)');
}

export default passport;