// test-smtp.ts - Simplified SMTP tester
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface SMTPConfig {
    name: string;
    host: string;
    port: number;
    secure: boolean;
    service?: string;
    authMethod?: string;
    requireTLS?: boolean;
    tls?: any;
}

export interface TestResult {
    success: boolean;
    config: SMTPConfig;
    error?: string;
    emailSent?: boolean;
}

export class SMTPTester {
    private email: string;
    private password: string;
    
    constructor(email?: string, password?: string) {
        this.email = email || process.env.SMTP_EMAIL || '';
        this.password = password || process.env.SMTP_EMAIL_PASSWORD || '';
    }
    
    // Most common predefined configurations
    public getConfigs(): SMTPConfig[] {
        const customHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const customPort = parseInt(process.env.SMTP_PORT || '587');
        
        return [
            { name: `Custom (${customHost})`, host: customHost, port: customPort, secure: false },
            { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false, service: 'gmail' },
            { name: 'Gmail SSL', host: 'smtp.gmail.com', port: 465, secure: true, service: 'gmail' },
            { 
                name: 'Outlook/Hotmail', 
                host: 'smtp-mail.outlook.com', 
                port: 587, 
                secure: false, 
                authMethod: 'LOGIN',
                requireTLS: true,
                tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' }
            },
            { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, secure: false, service: 'yahoo' }
        ];
    }
    
    
    // Tests an SMTP configuration
    public async testConfig(config: SMTPConfig): Promise<TestResult> {
        try {
            const transportConfig: any = {
                host: config.host,
                port: config.port,
                secure: config.secure,
                auth: { user: this.email, pass: this.password },
                connectionTimeout: 15000,
                tls: { rejectUnauthorized: false }
            };

            // Apply specific configurations
            if (config.service) transportConfig.service = config.service;
            if (config.requireTLS) transportConfig.requireTLS = config.requireTLS;
            if (config.authMethod) transportConfig.authMethod = config.authMethod;
            if (config.tls) transportConfig.tls = { ...transportConfig.tls, ...config.tls };

            const transporter = nodemailer.createTransport(transportConfig);
            
            console.log(`🔄 Testing: ${config.name} (${config.host}:${config.port})`);
            await transporter.verify();
            console.log(`✅ Success: ${config.name}`);
            
            let emailSent = false;
            if (process.env.SEND_TEST_EMAIL === 'true') {
                emailSent = await this.sendTestEmail(transporter, config);
            }
            
            return { success: true, config, emailSent };
            
        } catch (error: any) {
            console.error(`❌ Failed: ${config.name} - ${error.message}`);
            return { success: false, config, error: error.message };
        }
    }
    
    
    // Sends a test email
    private async sendTestEmail(transporter: nodemailer.Transporter, config: SMTPConfig): Promise<boolean> {
        try {
            const result = await transporter.sendMail({
                from: this.email,
                to: this.email,
                subject: `SMTP Test - ${config.name}`,
                text: `Test email from ${config.name}\nHost: ${config.host}:${config.port}\nTime: ${new Date().toISOString()}`,
                html: `
                    <h3>SMTP Test - ${config.name}</h3>
                    <p><strong>Host:</strong> ${config.host}:${config.port}</p>
                    <p><strong>Secure:</strong> ${config.secure}</p>
                    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                `
            });
            
            console.log(`📨 Email sent: ${result.messageId}`);
            return true;
        } catch (error: any) {
            console.error(`❌ Email failed: ${error.message}`);
            return false;
        }
    }
    
    
    // Tests all configurations
    public async testAll(configs?: SMTPConfig[]): Promise<TestResult[]> {
        if (!this.email || !this.password) {
            throw new Error('Missing SMTP_EMAIL or SMTP_EMAIL_PASSWORD in environment');
        }
        
        console.log('🧪 SMTP Configuration Tests');
        console.log(`📧 Email: ${this.email}`);
        console.log(`📨 Send test: ${process.env.SEND_TEST_EMAIL === 'true'}`);
        console.log('='.repeat(50));
        
        const testConfigs = configs || this.getConfigs();
        const results: TestResult[] = [];
        
        for (const config of testConfigs) {
            results.push(await this.testConfig(config));
            console.log('-'.repeat(30));
        }
        
        this.printSummary(results);
        return results;
    }
    
    
    // Summary of results
    private printSummary(results: TestResult[]): void {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log('\n📊 SUMMARY');
        console.log(`✅ Success: ${successful.length} | ❌ Failed: ${failed.length}`);
        
        if (successful.length > 0) {
            console.log('\n🎉 Working configs:');
            successful.forEach(r => console.log(`  ✓ ${r.config.name}`));
        }
        
        if (failed.length > 0) {
            console.log('\n🔧 Failed configs:');
            failed.forEach(r => console.log(`  ✗ ${r.config.name}: ${r.error}`));
        }
    }
    
    
    // Quick test with custom configuration
    public async quickTest(host: string, port: number, secure = false): Promise<TestResult> {
        const config: SMTPConfig = {
            name: `Quick Test - ${host}:${port}`,
            host,
            port,
            secure
        };
        
        // Auto-config para Outlook
        if (host.includes('outlook.com')) {
            config.authMethod = 'LOGIN';
            config.requireTLS = true;
            config.tls = { rejectUnauthorized: false, minVersion: 'TLSv1.2' };
        }
        
        return this.testConfig(config);
    }
}

// Function for compatibility
export const testSMTPConnection = async (): Promise<boolean> => {
    const tester = new SMTPTester();
    const results = await tester.testAll();
    return results.some(r => r.success);
};

// Execute if called directly
if (require.main === module) {
    const tester = new SMTPTester();
    
    tester.testAll()
        .then(results => process.exit(results.some(r => r.success) ? 0 : 1))
        .catch(error => {
            console.error('💥 Error:', error.message);
            process.exit(1);
        });
}