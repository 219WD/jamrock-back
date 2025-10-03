const mongoose = require('mongoose'); 
const Partner = require('../models/Partner');
const User = require('../models/User');
const { sendPartnerRequestEmail } = require('../utils/emailJSSender');

// Crear un nuevo partner
const createPartner = async (req, res) => {
  try {
    console.log('🟡 Iniciando creación de partner...');
    console.log('📝 Datos recibidos:', req.body);

    const partner = new Partner(req.body);
    await partner.save();
    console.log('✅ Partner guardado en BD:', partner._id);

    const user = await User.findById(req.body.userId);
    if (!user) {
      console.error('❌ Usuario no encontrado:', req.body.userId);
      return res.status(404).json({ error: 'Usuario no encontrado para asociar el partner' });
    }

    console.log('👤 Usuario encontrado:', user.email);
    
    user.partnerData = partner._id;
    await user.save();
    console.log('✅ Partner asociado al usuario');

    // ✅ CORRECCIÓN: Usar sendPartnerRequestEmail (no sendPartnerStatusEmail)
    console.log('📧 Iniciando envío de email de confirmación...');
    const emailResult = await sendPartnerRequestEmail(user); // ✅ SOLO user, sin isApproved

    if (!emailResult.success) {
      console.warn(`⚠️ Partner creado pero email falló para: ${user.email}`);
      console.warn(`⚠️ Error: ${emailResult.error}`);
    } else {
      console.log('✅ Email enviado exitosamente');
    }

    res.status(201).json({
      message: 'Solicitud de partner enviada correctamente. Esperando aprobación.',
      partner,
      emailSent: emailResult.success,
      emailError: emailResult.error || null
    });

  } catch (err) {
    console.error('❌ Error en createPartner:');
    console.error('🔴 Error:', err.message);
    console.error('🔴 Stack:', err.stack);
    res.status(400).json({ 
      error: 'Error al crear el partner', 
      details: err.message 
    });
  }
};


// Obtener todos los partners
const getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().populate('userId', 'name email');
    res.status(200).json(partners);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los partners' });
  }
};

// Obtener un partner por ID
const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id).populate('userId', 'name email');
    if (!partner) return res.status(404).json({ error: 'Partner no encontrado' });
    res.status(200).json(partner);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar el partner' });
  }
};

// Obtener partner por userId - Versión mejorada
const getPartnerByUserId = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    const partner = await Partner.findOne({ userId: req.params.userId })
      .populate('userId', 'name email'); // Popula los datos básicos del usuario

    if (!partner) {
      return res.status(404).json({ 
        error: "No se encontró partner para este usuario",
        exists: false
      });
    }
    
    res.status(200).json({
      ...partner.toObject(),
      exists: true,
      userId: partner.userId._id, // Asegurar que el userId esté incluido
      userName: partner.userId.name, // Incluir nombre del usuario
      userEmail: partner.userId.email // Incluir email del usuario
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Error al buscar el partner",
      details: err.message 
    });
  }
};

// Obtener los datos del partner del usuario autenticado
const getMyPartnerData = async (req, res) => {
  try {
    console.log("Buscando partner para usuario:", req.user._id);
    
    const partner = await Partner.findOne({ userId: req.user._id })
      .populate('userId', 'name email');

    if (!partner) {
      return res.status(404).json({ 
        error: "No se encontró partner para este usuario",
        exists: false
      });
    }
    
    res.status(200).json({
      ...partner.toObject(),
      exists: true,
      userId: partner.userId._id,
      userName: partner.userId.name,
      userEmail: partner.userId.email
    });
  } catch (err) {
    console.error("Error en getMyPartnerData:", err);
    res.status(500).json({ 
      error: "Error al buscar el partner",
      details: err.message 
    });
  }
};

// Actualizar un partner - Versión mejorada
const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { adress, phone, dni, reprocann } = req.body;
    
    console.log("Solicitud de actualización recibida:", { id, body: req.body });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de partner no válido' });
    }

    const updatedPartner = await Partner.findByIdAndUpdate(
      id,
      { adress, phone, dni, reprocann },
      { new: true, runValidators: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({ error: 'Partner no encontrado' });
    }

    console.log("Partner actualizado:", updatedPartner);

    res.status(200).json({
      success: true,
      message: 'Partner actualizado correctamente',
      partner: {
        _id: updatedPartner._id,
        adress: updatedPartner.adress,
        phone: updatedPartner.phone,
        dni: updatedPartner.dni,
        reprocann: updatedPartner.reprocann
      }
    });
  } catch (err) {
    console.error("Error en updatePartner:", err);
    res.status(400).json({ 
      success: false,
      error: 'Error al actualizar el partner',
      details: err.message 
    });
  }
};

// Eliminar un partner
const deletePartner = async (req, res) => {
  try {
    // Obtener el Partner por ID
    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: 'Partner no encontrado' });

    // Buscar el User asociado al Partner
    const user = await User.findById(partner.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Actualizar el campo isPartner en el User
    user.isPartner = true;  // Cambiar el estado a true
    await user.save(); // Guardar el cambio

    // Responder con el Partner actualizado
    res.status(200).json({
      message: 'Partner actualizado correctamente',
      partner,
      user,
    });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el partner', details: err.message });
  }
};


module.exports = {
  createPartner,
  getAllPartners,
  getPartnerById,
  getPartnerByUserId,
  getMyPartnerData,
  updatePartner,
  deletePartner
};
