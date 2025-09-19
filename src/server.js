// Importación de rutas
const RegisterRouter = require("./router/Register");
const LoginRouter = require("./router/Login");
const Mercado_Pago_Router = require("./router/Mercado_Pago_Router");
const PartnerRouter = require("./router/PartnerRoutes");
const UserRouter = require("./router/UserRoutes");
const cartRouter = require("./router/cartRoutes");
const productRoutes = require("./router/productRoutes");
const AntecedentesRoutes = require("./router/antecedentesRoutes");
const EspecialistaRoutes = require("./router/especialistaRoutes");
const PacienteRoutes = require("./router/pacienteRoutes");
const TurnoRoutes = require("./router/turnoRoutes");
const authRouter = require("./router/authRoutes");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Asegurate de cargar las variables de entorno

mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'nombreDeTuDB', // Opcional: si querés usar un nombre específico
  })
  .then(() => console.log("🟢 Conectado a MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ Error al conectar con MongoDB:", err.message);
  });

const server = express();

// Middlewares
server.use(express.json());

// Configuración de CORS
// Configuración de CORS dinámica basada en entorno
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de dominios permitidos
    const allowedOrigins = [
      'http://localhost:5173',
      'https://jamrock-club.vercel.app'
    ];
    
    // Permitir solicitudes sin origen (como apps móviles o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

server.use(cors(corsOptions));

// Rutas
server.use("/Mercado_Pago", Mercado_Pago_Router);
server.use("/register", RegisterRouter);
server.use("/login", LoginRouter);
server.use("/auth", authRouter);
server.use("/partners", PartnerRouter);
server.use("/users", UserRouter);
server.use("/cart", cartRouter);
server.use("/products", productRoutes);
server.use('/antecedentes', AntecedentesRoutes);
server.use("/especialistas", EspecialistaRoutes);
server.use("/pacientes", PacienteRoutes);
server.use("/turnos", TurnoRoutes);

module.exports = server;
