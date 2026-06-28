import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
const isSecure = emailPort === 465;

console.log('📧 Email Configuration Test\n');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', emailPort);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'presentotreasure@gmail.com (default)');
console.log('Secure mode:', isSecure ? 'SSL (port 465)' : 'TLS (port 587)');
console.log('\n🔄 Testing SMTP connection...\n');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: emailPort,
    secure: isSecure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
    },
});

transporter.verify()
    .then(() => {
        console.log('✅ SMTP connection successful!');
        console.log('✅ Email system is ready to send emails');
        process.exit(0);
    })

    .catch((error) => {
        console.error('❌ SMTP connection failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check if EMAIL_USER and EMAIL_PASS are correct in .env');
        console.error('2. Make sure you are using an App Password (not regular Gmail password)');
        console.error('3. Verify 2-Step Verification is enabled on your Google account');
        console.error('4. Check if the port and host are correct');
        process.exit(1);
    });
