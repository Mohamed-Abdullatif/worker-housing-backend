const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Worker Housing System API',
            version: '1.0.0',
            description: 'API documentation for Worker Housing System',
            contact: {
                name: 'Support Team',
                email: 'support@workerhousing.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    msg: {
                                        type: 'string',
                                        example: 'Field is required',
                                    },
                                    param: {
                                        type: 'string',
                                        example: 'fieldName',
                                    },
                                    location: {
                                        type: 'string',
                                        example: 'body',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ValidationError',
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Authentication and user management endpoints',
            },
            {
                name: 'Maintenance',
                description: 'Maintenance request management endpoints',
            },
            {
                name: 'Invoices',
                description: 'Invoice management endpoints',
            },
            {
                name: 'Grocery',
                description: 'Grocery items and orders management endpoints',
            },
            {
                name: 'Notifications',
                description: 'Push and email notification endpoints',
            },
            {
                name: 'PDF',
                description: 'PDF generation endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Path to the API routes
};

module.exports = swaggerJsdoc(options);
