const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const prisma = require('./config/database');
const ApiError = require('./utils/apiError');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running well',
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);

BigInt.prototype.toJSON = function () {
    return this.toString();
};

app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

app.use((err, req, res, next) => {
    if (!err.isOperational) {
        console.error('[error]:', err);
    }

    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';

    res.status(statusCode).json({
        status: err.status || 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
        }),
    });
});

app.listen(port, async () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    try {
        await prisma.$connect();
        console.log('[database]: Connected');
    } catch (error) {
        console.error('[database]: Failed to connect to database', error);
    }
});