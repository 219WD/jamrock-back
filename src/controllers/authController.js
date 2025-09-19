// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const transporter = require('../config/nodemailer');
const { JWT_SECRET, FRONTEND_URL } = process.env;

const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña.' 
      });
    }

    // Crear token con expiración de 1 hora
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Crear enlace de restablecimiento
    const resetPasswordLink = `${FRONTEND_URL}/reset-password/${token}`;

    // Configurar el correo electrónico
    const mailOptions = {
      from: `"Stock Manager Soporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecimiento de contraseña - Stock Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://i.imgur.com/QEs2Rku.png" alt="Logo Stock Manager" style="max-width: 100%;" />
          <h2 style="color: #333;">Hola ${user.name},</h2>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Stock Manager.</p>
          <p>Para continuar con el proceso, haz clic en el siguiente enlace:</p>
          <a href="${resetPasswordLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
             Restablecer Contraseña
          </a>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          <p>El enlace expirará en 1 hora.</p>
          <p>Gracias,<br>El equipo de Stock Manager</p>
          <hr>
          <p style="font-size: 12px; color: #777;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            ${resetPasswordLink}
          </p>
        </div>
      `
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Si el email existe, se ha enviado un enlace para restablecer la contraseña.' 
    });

  } catch (error) {
    console.error('Error en requestResetPassword:', error);
    res.status(500).json({ error: 'Error al solicitar restablecimiento de contraseña.' });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { userId } = decoded;

    // Buscar al usuario
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userToUpdate.password = hashedPassword;
    await userToUpdate.save();

    // Opcional: Enviar correo confirmando el cambio
    const mailOptions = {
      from: `"Stock Manager Soporte" <${process.env.EMAIL_USER}>`,
      to: userToUpdate.email,
      subject: 'Contraseña actualizada - Stock Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://i.imgur.com/QEs2Rku.png" alt="Logo Stock Manager" style="max-width: 100%;" />
          <h2 style="color: #333;">Hola ${userToUpdate.name},</h2>
          <p>La contraseña de tu cuenta en Stock Manager ha sido actualizada exitosamente.</p>
          <p>Si no realizaste este cambio, por favor contacta a soporte inmediatamente.</p>
          <p>Gracias,<br>El equipo de Stock Manager</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Contraseña cambiada exitosamente' });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
    console.error('Error en resetPassword:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña.' });
  }
};

module.exports = {
  requestResetPassword,
  resetPassword
};