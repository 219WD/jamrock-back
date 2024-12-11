const express = require("express");
const cors = require("cors");

// Importación de rutas
const Mercado_Pago_Router = require("./router/Mercado_Pago_Router");

const server = express();

// Middlewares
server.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: ['https://219food.vercel.app'], // Dominios permitidos
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

server.use(cors(corsOptions)); // Aquí usas "server" en lugar de "app"

// Rutas
server.use("/Mercado_Pago", Mercado_Pago_Router);

module.exports = server;
