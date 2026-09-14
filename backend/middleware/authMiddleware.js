const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const protect = async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role === 'ADMIN') {
                req.user = { _id: 'admin', email: process.env.SMTP_USER, role: 'ADMIN' };
                req.userRole = 'ADMIN';
            } else if (decoded.role === 'CUSTOMER') {
                req.user = await Customer.findById(decoded.id).select('-password');
                req.userRole = 'CUSTOMER';
            }

            if (!req.user) {
                res.status(401);
                return next(new Error('Not authorized, user not found'));
            }

            next();
        } catch (error) {
            res.status(401);
            return next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
};

const admin = (req, res, next) => {
    if (req.user && req.userRole === 'ADMIN') {
        next();
    } else {
        res.status(403);
        return next(new Error('Not authorized as an admin'));
    }
};

const customer = (req, res, next) => {
    if (req.user && req.userRole === 'CUSTOMER') {
        next();
    } else {
        res.status(403);
        return next(new Error('Not authorized as a customer'));
    }
};

module.exports = { protect, admin, customer };
