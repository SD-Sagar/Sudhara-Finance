const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const message = {
            from: `${process.env.FROM_NAME || 'Shudhara Women Development Organization'} <${process.env.SMTP_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html // Optional HTML support
        };

        // Fire-and-forget: DO NOT await so we don't block the frontend for minutes if Google timeouts
        transporter.sendMail(message).then(info => {
            console.log('Message sent: %s', info.messageId);
        }).catch(error => {
            console.error('Error sending email in background:', error.message);
        });
        
    } catch (error) {
        console.error('Error configuring email:', error.message);
    }
};

module.exports = sendEmail;
