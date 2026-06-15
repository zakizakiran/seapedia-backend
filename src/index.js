const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const prisma = require('./config/database');

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

BigInt.prototype.toJSON = function () {
    return this.toString();
};

app.listen(port, async () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    try {
        await prisma.$connect();
        console.log('[database]: Connected');
    } catch (error) {
        console.error('[database]: Failed to connect to database', error);
    }
});