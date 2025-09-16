// test-gmail.js - Standalone script to test Gmail
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const testGmailConnection = async () => {
    console.log('🧪 Testing Gmail SMTP Connection\n');
    
    const email = process.env.SMTP_EMAIL || '';
    const password = process.env.SMTP_EMAIL_PASSWORD || "" ; // No spaces
    
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    console.log('🔑 Password (first 4 chars):', password.substring(0, 4));
    
    // Configuration 1: Using 'gmail' service
    console.log('\n🔄 Testing with service: "gmail"');
    try {
        const transporter1 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: password
            }
        });
        
        await transporter1.verify();
        console.log('✅ Service "gmail" works!');
        
        // Test sending a test email
        const testEmail = {
            from: email,
            to: email, // Send to self
            subject: 'Test Email',
            text: 'This is a test email from Node.js'
        };
        
        const result = await transporter1.sendMail(testEmail);
        console.log('✅ Test email sent successfully:', result.accepted);
        
        return true;
        
    } catch (error: any) {
        console.error('❌ Service "gmail" failed:', error.message);
    }
    
    // Configuration 2: Manual setup
    console.log('\n🔄 Testing with manual SMTP settings');
    try {
        const transporter2 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: email,
                pass: password
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        await transporter2.verify();
        console.log('✅ Manual SMTP works!');
        return true;
        
    } catch (error: any) {
        console.error('❌ Manual SMTP failed:', error.message);
    }
    
    // Configuration 3: Secure port 465
    console.log('\n🔄 Testing with secure port 465');
    try {
        const transporter3 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: email,
                pass: password
            }
        });
        
        await transporter3.verify();
        console.log('✅ Secure port 465 works!');
        return true;
        
    } catch (error: any) {
        console.error('❌ Secure port 465 failed:', error.message);
    }
    
    console.log('\n❌ All configurations failed. Possible issues:');
    console.log('1. App Password might be invalid - generate a new one');
    console.log('2. 2FA might not be enabled on Gmail account');
    console.log('3. Gmail security settings might be blocking the connection');
    console.log('4. Check Gmail "Less secure app access" settings (if available)');
    
    return false;
}

