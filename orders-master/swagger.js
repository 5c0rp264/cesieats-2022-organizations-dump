const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
        version: "1.0.0",
        title: 'CESI EATS - Orders API',
        description: 'Cette documentation explique les différents endpoints contenu dans le service dédié à la gestion des commandes de CESI EATS',
    },
    tags: [{
        "name": "Orders",
        "description": "Endpoints"
    }],
    securityDefinitions: {
        JWT: {
            type: "apiKey",
            name: "jwt",
            in: "cookies"
        },
    },
    host: 'localhost:8090',
    basePath: "/",
    schemes: ['http', 'https'],
};


const outputFile = './orders.json'
const endpointsFiles = ['./app.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./app')           // Your project's root file
})