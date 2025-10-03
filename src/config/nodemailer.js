// config/nodemailer.js - VERSIÓN MÍNIMA
const nodemailer = require('nodemailer');

console.log('🔧 Configurando Nodemailer (versión mínima)...');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ✅ Usar 'service' en lugar de host/port
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Sin verificación inicial (puede causar timeout)
console.log('📧 Transporter creado (verificación diferida)');

module.exports = transporter;