// config/nodemailer.js - VERSIÓN AVANZADA PARA RENDER
const nodemailer = require('nodemailer');

console.log('🔧 Configurando Nodemailer para Render.com...');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true, // ✅ Forzar TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true,
  logger: true,
  
  // ✅ CONFIGURACIÓN ESPECÍFICA PARA RENDER
  connectionTimeout: 30000, // 30 segundos (más bajo)
  greetingTimeout: 15000,   // 15 segundos
  socketTimeout: 30000,     // 30 segundos
  dnsTimeout: 10000,        // 10 segundos
  
  // ✅ Configuración TLS mejorada
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2', // Forzar TLS 1.2
    ciphers: 'SSLv3'
  },
  
  // ✅ Pooling para mejor manejo de conexiones
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

// Función de verificación con reintentos
const verifyTransporter = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Intento ${i + 1} de verificación SMTP...`);
      await transporter.verify();
      console.log('✅ Servidor SMTP configurado correctamente');
      console.log(`✅ Cuenta de envío: ${process.env.EMAIL_USER}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ Intento ${i + 1} falló:`, error.message);
      if (i === retries - 1) {
        console.error('❌ Todos los intentos de verificación fallaron');
        return false;
      }
      // Esperar antes del próximo intento
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Verificar con reintentos
verifyTransporter();

module.exports = transporter;