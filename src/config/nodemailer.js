// config/nodemailer.js
const nodemailer = require('nodemailer');

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // No fallar en certificados inválidos
    rejectUnauthorized: false
  }
});

// Verificación de la conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al verificar la conexión con el servidor SMTP:', error);
  } else {
    console.log('✔ Servidor SMTP configurado correctamente');
    console.log(`✔ Cuenta de envío: ${process.env.EMAIL_USER}`);
  }
});

// Manejador de eventos para depuración
transporter.on('token', (token) => {
  console.log('Token generado:', token);
});

// Exportar el transporter configurado
module.exports = transporter;