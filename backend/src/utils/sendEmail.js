const nodemailer = require('nodemailer');

async function sendVerificationEmail(to, subject, text) {
    try {
        // Check if email credentials are configured
        const emailUser = process.env.EMAIL_USER || 'your email';
        const emailPass = process.env.EMAIL_PASSWORD || 'your gmail app password';
        
        // Skip email sending if credentials are not properly configured
        if (emailUser === 'your email' || emailPass === 'your gmail app password' || emailUser === 'your-email@gmail.com') {
            console.log('🚨 EMAIL CREDENTIALS NOT CONFIGURED - DEVELOPMENT MODE 🚨');
            console.log('📧 Email Details:');
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log(`   📱 OTP: ${text.match(/\d+/)?.[0] || 'Not found'}`);
            console.log('🔧 To enable real emails, configure EMAIL_USER and EMAIL_PASSWORD in .env file');
            console.log('=' .repeat(60));
            return { success: true, message: 'Email sending skipped - credentials not configured' };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: emailUser,
            to,
            subject,
            text
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return { success: true, message: 'Email sent successfully' };
        
    } catch (error) {
        console.log('Email sending failed:', error.message);
        // Don't throw error, just log it and continue
        return { success: false, message: 'Email sending failed', error: error.message };
    }
}

module.exports = { sendVerificationEmail };
