const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Worker Housing System API Documentation',
}));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/maintenance', require('./routes/maintenance.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/grocery', require('./routes/grocery.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/pdf', require('./routes/pdf.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
    });
});

// Function to try starting the server on different ports
const startServer = async (initialPort) => {
    let port = initialPort;
    const maxAttempts = 10; // Try up to 10 different ports

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                const server = app.listen(port, async () => {
                    try {
                        await connectDB();
                        console.log(`Server running on port ${port}`);
                        console.log(`API Documentation available at http://localhost:${port}/api-docs`);
                        resolve();
                    } catch (error) {
                        console.error('Failed to connect to the database:', error);
                        reject(error);
                    }
                });

                server.on('error', (error) => {
                    if (error.code === 'EADDRINUSE') {
                        console.log(`Port ${port} is in use, trying ${port + 1}...`);
                        port++;
                        server.close();
                    } else {
                        reject(error);
                    }
                });
            });

            // If we reach here, the server started successfully
            break;
        } catch (error) {
            if (attempt === maxAttempts - 1) {
                console.error('Could not find an available port after multiple attempts');
                process.exit(1);
            }
        }
    }
};

// Start server
const PORT = parseInt(process.env.PORT) || 5000;
startServer(PORT);

module.exports = app;