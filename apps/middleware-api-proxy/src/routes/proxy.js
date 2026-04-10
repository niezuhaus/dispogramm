const express = require('express');
const axios = require('axios');
const router = express.Router();

// Load environment variables
const TARGET_API_URL = process.env.TARGET_API_URL;

// Proxy route with basic authentication
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

const TARGET_API_AUTH = `Basic ${Buffer.from(`${process.env.TARGET_API_USER}:${process.env.TARGET_API_PASS}`).toString('base64')}`;
router.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || authHeader !== process.env.BASIC_AUTH_SECRET) {
        console.log('Unauthorized');
        res.status(401).json({ message: 'Unauthorized' });
    } else {
        console.log('Authorized');
        next();
    }
});
router.use('/api', async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${TARGET_API_URL}${req.originalUrl}`,
            headers: {
                ...req.headers,
                host: TARGET_API_URL.replace(/^https?:\/\//, '').split('/')[0],
                authorization: TARGET_API_AUTH
            },
            data: req.body,
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(error.response ? error.response.status : 500).json({
            message: error.message,
            ...(error.response ? error.response.data : {})
        });
    }
});


module.exports = router;