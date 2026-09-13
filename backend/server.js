const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true, // required for cookies
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Route Imports
const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const customerRoutes = require('./routes/customerRoutes');
const loanRoutes = require('./routes/loanRoutes');
const installmentRoutes = require('./routes/installmentRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/installments', installmentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
