const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // NODEMAILER HAS BEEN DISABLED FOR PRODUCTION AS REQUESTED BY USER
        // To re-enable, uncomment the code below:
        /*
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
            html: options.html
        };

        transporter.sendMail(message).then(info => {
            console.log('Message sent: %s', info.messageId);
        }).catch(error => {
            console.error('Error sending email in background:', error.message);
        });
        */
        console.log(`[MOCK EMAIL] To: ${options.email} | Subject: ${options.subject}`);
        
    } catch (error) {
        console.error('Error configuring email:', error.message);
    }
};

module.exports = sendEmail;
