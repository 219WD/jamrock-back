// config/nodemailer.js - VERSIÓN CORREGIDA
const nodemailer = require('nodemailer');

console.log('🔧 Configurando Nodemailer...');
console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Email Password:', process.env.EMAIL_PASSWORD ? '✅ Configurada' : '❌ Faltante');

// Crear el transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // ✅ CAMBIA de 465 a 587
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Función de verificación mejorada
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servidor SMTP configurado correctamente');
    console.log(`✅ Cuenta de envío: ${process.env.EMAIL_USER}`);
    console.log('✅ Listo para enviar emails');
    return true;
  } catch (error) {
    console.error('❌ ERROR DE CONEXIÓN SMTP:');
    console.error('🔴 Error:', error.message);
    console.error('🔴 Code:', error.code);
    return false;
  }
};

// Verificar inmediatamente
verifyTransporter();

module.exports = transporter;