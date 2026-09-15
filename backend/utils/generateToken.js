const jwt = require('jsonwebtoken');

const generateToken = (res, userId, role) => {
    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // Required by browsers for cross-site cookies
        sameSite: 'none', // Allow cross-site cookies between vercel and render
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
};

module.exports = generateToken;
