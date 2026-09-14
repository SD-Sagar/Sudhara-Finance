const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const message = {
            from: `${process.env.FROM_NAME || 'Shudhara Women Developement Organization'} <${process.env.FROM_EMAIL || 'noreply@shudharafinance.com'}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html // Optional HTML support
        };

        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
