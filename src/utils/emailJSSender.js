const emailJS = require('@emailjs/nodejs');

console.log('🟢 emailJSSender.js CARGADO');

const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  TEMPLATE_STATUS_ID: process.env.EMAILJS_STATUS_TEMPLATE_ID, // ✅ Template reutilizable
  TEMPLATE_REQUEST_ID: process.env.EMAILJS_REQUEST_TEMPLATE_ID, // ✅ Template de solicitud
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY
};

console.log('🔧 Configuración EmailJS:', {
  serviceId: EMAILJS_CONFIG.SERVICE_ID ? '✅ Configurado' : '❌ Faltante',
  statusTemplate: EMAILJS_CONFIG.TEMPLATE_STATUS_ID ? '✅ Configurado' : '❌ Faltante',
  requestTemplate: EMAILJS_CONFIG.TEMPLATE_REQUEST_ID ? '✅ Configurado' : '❌ Faltante',
  publicKey: EMAILJS_CONFIG.PUBLIC_KEY ? '✅ Configurado' : '❌ Faltante'
});

// ✅ FUNCIÓN REUTILIZABLE para aprobación Y revocación
const sendPartnerStatusEmail = async (user, isApproved) => {
  try {
    console.log(`📧 Enviando email de ${isApproved ? 'APROBACIÓN' : 'REVOCACIÓN'} con EmailJS...`);
    
    const templateParams = {
      name: user.name,
      email: user.email,
      to_email: user.email,
      user_id: user._id.toString(),
      title: isApproved ? '¡Bienvenido a la familia Jamrock!' : 'Actualización de estado',
      message: isApproved 
        ? 'Nos complace informarte que tu solicitud para convertirte en socio de Jamrock ha sido <strong>aprobada</strong>. Ahora eres oficialmente un Socio y parte de nuestro exclusivo Club.'
        : 'Te informamos que tu estado de Socio en Jamrock ha sido actualizado. Ya no tienes acceso privilegiado como socio del Club.',
      is_approved: isApproved
    };

    const result = await emailJS.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_STATUS_ID,
      templateParams,
      {
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
        privateKey: EMAILJS_CONFIG.PRIVATE_KEY,
      }
    );

    console.log(`✅ Email de ${isApproved ? 'aprobación' : 'revocación'} enviado con EmailJS`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Error enviando email de ${isApproved ? 'aprobación' : 'revocación'} con EmailJS:`, error);
    return { success: false, error: error.message };
  }
};

// ✅ FUNCIÓN PARA SOLICITUD RECIBIDA
const sendPartnerRequestEmail = async (user) => {
  try {
    console.log('📧 Enviando email de solicitud recibida con EmailJS...');
    
    const templateParams = {
      name: user.name,
      email: user.email,
      to_email: user.email,
      user_id: user._id.toString()
    };

    const result = await emailJS.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_REQUEST_ID,
      templateParams,
      {
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
        privateKey: EMAILJS_CONFIG.PRIVATE_KEY,
      }
    );

    console.log('✅ Email de solicitud enviado con EmailJS');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error enviando email de solicitud con EmailJS:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPartnerStatusEmail, // ✅ Reemplaza las dos funciones anteriores
  sendPartnerRequestEmail
};