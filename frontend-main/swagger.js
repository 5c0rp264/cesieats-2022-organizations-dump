const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
      version: "1.0.0",
      title: 'CESI EATS - Frontend API',
      description: 'Cette documentation explique les différents endpoints contenu dans le service dédié à la gestion du front-end de CESI EATS',
    },
    tags: [
      {
          "name": "Frontend",
          "description": "Endpoints"
      }
  ],
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
  


const outputFile = 'swagger-output.json';
const endpointsFiles = ['index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index')           // Your project's root file
})