const User = require('../models/User');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');

// @desc    Auth admin & get token
// @route   POST /api/auth/admin
// @access  Public
const authAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            generateToken(res, user._id, 'ADMIN');

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401);
            return next(new Error('Invalid email or password'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth customer & get token
// @route   POST /api/auth/customer
// @access  Public
const authCustomer = async (req, res, next) => {
    try {
        const { customerId, password } = req.body;

        const customer = await Customer.findOne({ customerId });

        if (customer && (await customer.matchPassword(password))) {
            if (customer.status !== 'ACTIVE') {
                res.status(403);
                return next(new Error('Account is inactive. Please contact admin.'));
            }

            generateToken(res, customer._id, 'CUSTOMER');

            res.json({
                _id: customer._id,
                customerId: customer.customerId,
                name: customer.name,
                email: customer.email,
                role: customer.role,
                photoUrl: customer.photoUrl,
                cibilScore: customer.cibilScore || 600
            });
        } else {
            res.status(401);
            return next(new Error('Invalid customer ID or password'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        if (req.userRole === 'ADMIN') {
            const user = await User.findById(req.user._id).select('-password');
            if (user) {
                res.json({ ...user._doc, role: 'ADMIN' });
            } else {
                res.status(404);
                return next(new Error('Admin not found'));
            }
        } else if (req.userRole === 'CUSTOMER') {
            const customer = await Customer.findById(req.user._id).select('-password');
            if (customer) {
                res.json({ ...customer._doc, role: 'CUSTOMER' });
            } else {
                res.status(404);
                return next(new Error('Customer not found'));
            }
        } else {
            res.status(401);
            return next(new Error('Not authorized'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authAdmin,
    authCustomer,
    logoutUser,
    getUserProfile
};
