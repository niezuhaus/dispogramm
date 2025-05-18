const express = require('express');
const cors = require('./middlewares/cors');
const proxyRoutes = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors);
app.use(express.json());

// Routes
app.use('/api', proxyRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});