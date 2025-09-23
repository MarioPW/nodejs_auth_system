// test-gmail.ts - Standalone script to test Gmail
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const testGmailConnection = async (): Promise<boolean> => {
    console.log('🧪 Testing SMTP Connection\n');
    
    const email = process.env.SMTP_EMAIL;
    const password = process.env.SMTP_EMAIL_PASSWORD;
    
    if (!email || !password) {
        console.error('❌ Email or password not found in environment variables');
        console.log('💡 Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env file');
        return false;
    }
    
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    
    // Configurations to test using environment variables
    const configs = [
        {
            name: `SMTP (${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587})`,
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === 'true' || false
        },
        {
            name: `Service: ${process.env.TRANSPORTER_SERVICE || 'Gmail'}`,
            host: getServiceHost(process.env.TRANSPORTER_SERVICE),
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === 'true' || false
        },
        {
            name: 'Secure port 465',
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 465,
            secure: true
        }
    ];
    
    for (const config of configs) {
        console.log(`\n🔄 Testing: ${config.name}`);
        
        try {
            const transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: { 
                    user: email, 
                    pass: password 
                }
            });
            
            await transporter.verify();
            console.log(`✅ ${config.name} works!`);
            
            // Opcional: enviar email de prueba
            console.log('✉️ Sending test email to yourself...' + process.env.SEND_TEST_EMAIL);
            if (process.env.SEND_TEST_EMAIL === 'true') {
                const testEmail = {
                    from: email,
                    to: email,
                    subject: 'SMTP Test Email',
                    text: `This is a test email from ${config.name} configuration`
                };
                
                const result = await transporter.sendMail(testEmail);
                console.log('📨 Test email sent successfully');
            }
            
            return true;
            
        } catch (error: any) {
            console.error(`❌ ${config.name} failed:`, error.message);
        }
    }
    
    console.log('\n❌ All configurations failed. Check your:');
    console.log('1. EMAIL_USER and EMAIL_PASSWORD in .env file');
    console.log('2. SMTP_HOST and SMTP_PORT settings');
    console.log('3. App password (if using Gmail with 2FA)');
    
    return false;
};

// Helper function to get the service host
function getServiceHost(service?: string): string {
    const serviceHosts: { [key: string]: string } = {
        'gmail': 'smtp.gmail.com',
        'outlook': 'smtp-mail.outlook.com',
        'yahoo': 'smtp.mail.yahoo.com',
        'hotmail': 'smtp.live.com',
        'office365': 'smtp.office365.com'
    };
    
    return service ? serviceHosts[service] || service : 'smtp.gmail.com';
}

// Execute if called directly
if (require.main === module) {
    testGmailConnection().then(success => {
        process.exit(success ? 0 : 1);
    });
}