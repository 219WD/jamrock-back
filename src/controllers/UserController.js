const User = require('../models/User');
const transporter = require('../config/nodemailer');

// GET todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
      .populate('partnerData');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// GET un usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// GET buscar usuarios por nombre o email
const searchUsers = async (req, res) => {
  const { q } = req.query;

  try {
    // Búsqueda por nombre, email
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
    }).select('-password');

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar usuarios', details: err.message });
  }
};


// PATCH cambiar isPartner (toggle) - Versión asíncrona
const updatePartnerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Guardar el estado anterior
    const wasPartner = user.isPartner;
    
    // Alternar el valor de isPartner
    user.isPartner = !user.isPartner;
    await user.save();

    // Responder inmediatamente al frontend
    res.status(200).json({
      message: `El usuario ahora es ${user.isPartner ? '' : 'no '}partner.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin,
        isSecretaria: user.isSecretaria,
      }
    });

    // ENVIAR CORREOS DE FORMA ASÍNCRONA (después de responder)
    setTimeout(async () => {
      // CORREO DE APROBACIÓN (cambiando de false a true)
      if (!wasPartner && user.isPartner) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
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

          await transporter.sendMail(mailOptions);
          console.log(`Correo de aprobación enviado a: ${user.email}`);
        } catch (emailError) {
          console.error('Error al enviar el correo de aprobación:', emailError);
        }
      }
      // CORREO DE REVOCACIÓN (cambiando de true a false)
      else if (wasPartner && !user.isPartner) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
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

          await transporter.sendMail(mailOptions);
          console.log(`Correo de revocación enviado a: ${user.email}`);
        } catch (emailError) {
          console.error('Error al enviar el correo de revocación:', emailError);
        }
      }
    }, 100); // Pequeño delay para asegurar que la respuesta se envió primero

  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar isPartner',
      details: err.message
    });
  }
};

// PATCH cambiar isAdmin
const updateAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Alternar el valor de isAdmin
    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora es ${user.isAdmin ? '' : 'no '}admin.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin,
        isSecretaria: user.isSecretaria,
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar isAdmin',
      details: err.message
    });
  }
};

// PATCH cambiar isPending
const updatePendingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Alternar el valor de isAdmin
    user.isPending = !user.isPending;
    await user.save();

    res.status(200).json({
      message: `El usuario esta ${user.isAdmin ? '' : 'no '}pendiente.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin,
        isPending: user.isPending,
        isSecretaria: user.isSecretaria
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar isPending',
      details: err.message
    });
  }
};

// PATCH cambiar isSecretaria
const isSecretariaStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Alternar el valor de isSecretaria
    user.isSecretaria = !user.isSecretaria;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora ${user.isSecretaria ? 'es' : 'no es'} secretaria.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar isSecretaria',
      details: err.message
    });
  }
};



module.exports = {
  getAllUsers,
  getUserById,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  isSecretariaStatus,
  searchUsers,
};
