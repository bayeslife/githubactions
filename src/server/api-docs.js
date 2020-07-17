import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

const options = {
    definition: {
      openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
      info: {
        title: 'Project Controls Pipeline Management', // Title (required)
        description: "APIs which support the pipeline management",
        version: '1.0.0', // Version (required)
      },
    },
    apis: ['./src/server/routes.js'],// Path to the API docs
  };

const swaggerSpec = swaggerJSDoc(options);

module.exports=(app)=>{
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
