import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger-output.json';
const endpointsFiles = ['../../../*.js', '../../../app.js']; // Percorso aggiornato per arrivare a app.js

const doc = {
  info: {
    title: "Hogwarts  Characters API",
    description: "API for hpvault",
    version: "1.0.0"
  },
  host: "localhost:10000", // Cambialo se usi Render o un dominio diverso
  basePath: "/",
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: "fetch", description: "Basic endpoint." },
    { name: "users", description: "User management endpoints." },
    { name: "auth", description: "Authentication endpoints." },
    { name: "cards", description: "Album card management." },
    { name: "exchanges", description: "Exchange management." },
    { name: "database", description: "Database status check." }
  ],
  definitions: {
    user: {
      _id: "ObjectId('64df73b31e5eda5eb868ddcd')",
      name: "John",
      username: "Jhonny",
      surname: "Doe",
      email: "jhonny@example.com",
      password: "hashed_password",
      credits: 100,
      cards: ["card_id1", "card_id2"]
    },
    loggeduser: {
      $_id: "64df73b31e5eda5eb868ddcd",
      $username: "johndough",
      $email: "johndough@gmail.com",
      $name: "John"
    },
    loginrequest: {
      email: "johndough@gmail.com",
      username: "johndough",
      $password: "password"
    }
  }
};

swaggerAutogen()(outputFile, endpointsFiles, doc);