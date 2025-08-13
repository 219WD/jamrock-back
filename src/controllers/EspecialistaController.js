const Especialista = require('../models/Especialista');
const User = require('../models/User');

const createEspecialista = async (req, res) => {
  try {
    const { userId, especialidad, matricula, reprocann } = req.body;
    
    console.log('Datos recibidos:', req.body); // Log para depuración
    
    // Validaciones más detalladas
    if (!userId || !especialidad || !matricula) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: userId, especialidad o matricula'
      });
    }

    // Validar que el usuario existe
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(400).json({
        success: false,
        error: 'El usuario no existe'
      });
    }
    
    // Validar que no sea ya especialista
    const existeEspecialista = await Especialista.findOne({ userId });
    if (existeEspecialista) {
      return res.status(400).json({
        success: false,
        error: 'Este usuario ya está registrado como especialista'
      });
    }
    
    // Validar matrícula única
    const matriculaExiste = await Especialista.findOne({ matricula });
    if (matriculaExiste) {
      return res.status(400).json({
        success: false,
        error: 'La matrícula ya está en uso'
      });
    }
    
    // Crear especialista
    const especialista = new Especialista({
      userId,
      partnerId: req.user.isPartner ? req.user._id : null,
      especialidad,
      matricula,
      reprocann: reprocann || 'inicializado'
    });
    
    await especialista.save();
    
    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(userId, { 
      isMedico: true,
      isPending: false 
    }, { new: true });
    
    console.log('Usuario actualizado:', updatedUser); // Log para depuración
    
    res.status(201).json({
      success: true,
      data: {
        especialista,
        user: updatedUser
      }
    });
    
  } catch (err) {
    console.error('Error en createEspecialista:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear especialista',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

const getAllEspecialistas = async (req, res) => {
  try {
    // Obtener todos los especialistas sin filtros
    const especialistas = await Especialista.find({})
      .populate({
        path: 'userId',
        select: 'name email isPartner isAdmin' // Solo los campos necesarios
      })
      .populate({
        path: 'partnerId',
        select: 'name' // Solo los campos necesarios
      });
    
    res.status(200).json({
      success: true,
      count: especialistas.length,
      data: especialistas
    });
    
  } catch (err) {
    console.error('Error en getAllEspecialistas:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener especialistas',
      details: err.message 
    });
  }
};

const getEspecialistaById = async (req, res) => {
  try {
    const especialista = await Especialista.findById(req.params.id)
      .populate('userId partnerId');
    
    if (!especialista) {
      return res.status(404).json({ 
        success: false,
        error: 'Especialista no encontrado' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: especialista
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Error al buscar especialista',
      details: err.message 
    });
  }
};

const getEspecialistaByUserId = async (req, res) => {
  try {
    const especialista = await Especialista.findOne({ userId: req.params.userId })
      .populate('userId partnerId');
    
    if (!especialista) {
      return res.status(404).json({ 
        success: false,
        error: 'Especialista no encontrado' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: especialista
    });
    
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: 'Error al buscar especialista',
      details: err.message 
    });
  }
};

const updateEspecialista = async (req, res) => {
  try {
    const { especialidad, matricula, reprocann } = req.body;
    
    const especialista = await Especialista.findById(req.params.id);
    
    if (!especialista) {
      return res.status(404).json({ 
        success: false,
        error: 'Especialista no encontrado' 
      });
    }
    
    // Solo admin o el propio especialista puede actualizar
    if (!req.user.isAdmin && !especialista.userId.equals(req.user._id)) {
      return res.status(403).json({ 
        success: false,
        error: 'No autorizado' 
      });
    }
    
    // Validar matrícula única si se cambia
    if (matricula && matricula !== especialista.matricula) {
      const matriculaExiste = await Especialista.findOne({ matricula });
      if (matriculaExiste) {
        return res.status(400).json({
          success: false,
          error: 'La matrícula ya está en uso'
        });
      }
      especialista.matricula = matricula;
    }
    
    if (especialidad) especialista.especialidad = especialidad;
    if (reprocann) especialista.reprocann = reprocann;
    
    const especialistaActualizado = await especialista.save();
    
    res.status(200).json({
      success: true,
      data: especialistaActualizado
    });
    
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: 'Error al actualizar especialista',
      details: err.message 
    });
  }
};

module.exports = {
  createEspecialista,
  getAllEspecialistas,
  getEspecialistaById,
  getEspecialistaByUserId,
  updateEspecialista
};