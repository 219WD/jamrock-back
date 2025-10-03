console.log('🟢 UserController.js CARGADO - updatePartnerStatus disponible');

const mongoose = require('mongoose');
const User = require('../models/User');
const { 
  sendPartnerStatusEmail,  // ✅ Nueva función reutilizable
  sendPartnerRequestEmail 
} = require('../utils/emailJSSender');

// GET todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('partnerData');
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

// PUT actualizar datos del usuario (name, email)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'No autorizado para editar este usuario' });
    }

    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailExists) {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }

    user.name = name;
    user.email = email;

    await user.save();

    res.status(200).json({
      message: 'Usuario actualizado correctamente',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin,
        isSecretaria: user.isSecretaria,
        isPending: user.isPending,
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar usuario',
      details: err.message
    });
  }
};

// PATCH cambiar isPartner (toggle)
const updatePartnerStatus = async (req, res) => {
  try {
    console.log('🎯🎯🎯 UPDATE PARTNER STATUS INICIADO 🎯🎯🎯');
    console.log('📝 Params ID:', req.params.id);

    // Verificar que el ID sea válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ ID no válido:', req.params.id);
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('❌ Usuario no encontrado con ID:', req.params.id);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('👤 Usuario encontrado en BD:', {
      id: user._id,
      name: user.name,
      email: user.email,
      isPartnerActual: user.isPartner
    });

    const wasPartner = user.isPartner;
    user.isPartner = !user.isPartner;
    await user.save();

    console.log(`🔄 Estado de partner cambiado: ${wasPartner} -> ${user.isPartner}`);
    console.log(`📧 Email del usuario para notificación: ${user.email}`);

    // ✅ CORRECCIÓN: Usar la nueva función reutilizable
    if ((!wasPartner && user.isPartner) || (wasPartner && !user.isPartner)) {
      const isApproved = !wasPartner && user.isPartner;
      console.log(`📧 ENVIANDO EMAIL DE ${isApproved ? 'APROBACIÓN' : 'REVOCACIÓN'}...`);
      
      const emailResult = await sendPartnerStatusEmail(user, isApproved);
      console.log(`📩 Resultado del email:`, emailResult);
      
      if (!emailResult.success) {
        console.warn(`⚠️ Email de ${isApproved ? 'aprobación' : 'revocación'} falló: ${emailResult.error}`);
      } else {
        console.log(`✅✅✅ EMAIL DE ${isApproved ? 'APROBACIÓN' : 'REVOCACIÓN'} ENVIADO EXITOSAMENTE ✅✅✅`);
      }
    }

    const response = {
      message: `El usuario ahora es ${user.isPartner ? '' : 'no '}partner.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin,
        isSecretaria: user.isSecretaria,
      }
    };

    console.log('🎯🎯🎯 UPDATE PARTNER STATUS COMPLETADO 🎯🎯🎯');
    res.status(200).json(response);

  } catch (err) {
    console.error('❌❌❌ ERROR CRÍTICO en updatePartnerStatus:');
    console.error('🔴 Error:', err.message);
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

    user.isPending = !user.isPending;
    await user.save();

    res.status(200).json({
      message: `El usuario esta ${user.isPending ? '' : 'no '}pendiente.`,
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
  updateUser,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  isSecretariaStatus,
  searchUsers,
};