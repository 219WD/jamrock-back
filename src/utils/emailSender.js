// utils/emailSender.js
const transporter = require('../config/nodemailer');

const sendPartnerRequestEmail = async (user) => {
  try {
    console.log('🔍 Iniciando envío de email...');
    console.log('📧 Destinatario:', user.email);
    console.log('👤 Usuario:', user.name);
    console.log('📨 Remitente:', process.env.EMAIL_USER);

    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Solicitud de Partner recibida - Jamrock',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">¡Solicitud recibida!</h2>
          <p>Hola ${user.name},</p>
          <p>Hemos recibido tu solicitud para convertirte en socio de Jamrock.</p>
          <p>Tu solicitud está ahora en revisión. Te notificaremos por correo una vez que sea procesada.</p>
          <p><strong>ID de solicitud:</strong> ${user._id}</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>¡Saludos cordiales!<br>El equipo de Jamrock</p>
        </div>
      `
    };

    console.log('📤 Enviando email...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado EXITOSAMENTE a ${user.email}`);
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`✅ Response: ${info.response}`);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error(`❌ ERROR CRÍTICO enviando email:`);
    console.error(`📧 Destinatario: ${user.email}`);
    console.error(`🔴 Error: ${error.message}`);
    console.error(`🔴 Stack: ${error.stack}`);
    return { success: false, error: error.message };
  }
};

const sendPartnerApprovalEmail = async (user) => {
  try {
    console.log('📧 Enviando email de aprobación de partner...');
    console.log('👤 Destinatario:', user.email);

    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '¡Felicidades! Eres ahora Partner oficial de Jamrock',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">¡Bienvenido a la familia Jamrock!</h2>
          <p>Hola ${user.name},</p>
          <p>Nos complace informarte que tu solicitud para convertirte en socio de Jamrock ha sido <strong>aprobada</strong>.</p>
          <p>Ahora eres oficialmente un Socio y parte de nuestro exclusivo Club. Estamos encantados de tenerte con nosotros.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://tujamrock.com'}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Acceder a la plataforma
            </a>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>¡Saludos cordiales!<br>El equipo de Jamrock</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de aprobación enviado a ${user.email}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error(`❌ Error enviando email de aprobación:`, error);
    return { success: false, error: error.message };
  }
};

const sendPartnerRevocationEmail = async (user) => {
  try {
    console.log('📧 Enviando email de revocación de partner...');
    console.log('👤 Destinatario:', user.email);

    const mailOptions = {
      from: `"Jamrock Club" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Estado de Partner actualizado - Jamrock',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Actualización de estado</h2>
          <p>Hola ${user.name},</p>
          <p>Te informamos que tu estado de Socio en Jamrock ha sido actualizado.</p>
          <p>Ya no tienes acceso privilegiado como socio del Club.</p>
          <p>Si crees que esto es un error, por favor contacta con nosotros.</p>
          <p>¡Saludos cordiales!<br>El equipo de Jamrock</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email de revocación enviado a ${user.email}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error(`❌ Error enviando email de revocación:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  sendPartnerRequestEmail,
  sendPartnerApprovalEmail, 
  sendPartnerRevocationEmail 
};