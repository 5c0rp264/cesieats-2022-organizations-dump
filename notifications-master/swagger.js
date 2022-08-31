const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
        version: "1.0.0",
        title: 'CESI EATS - Shop API',
        description: 'Cette documentation explique les différents endpoints contenu dans le service dédié à la gestion des restaurants de CESI EATS',
    },
    tags: [{
        "name": "Notifications",
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


const outputFile = './notifications.json'
const endpointsFiles = ['./routes/Notifications.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./app')           // Your project's root file
})