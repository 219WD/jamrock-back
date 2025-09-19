const Antecedentes = require('../models/Antecedentes');
const Paciente = require('../models/Paciente');
const User = require('../models/User');
const Partner = require('../models/Partner');
const mongoose = require('mongoose');

const createPacienteConAntecedentes = async (req, res) => {
  try {
    const { partnerId, ...rest } = req.body;
    const { userId, fullName, fechaDeNacimiento, ...antecedentesData } = req.body;

    // Validar campos obligatorios
    if (!fullName) {
      return res.status(400).json({
        success: false,
        error: 'El nombre completo es requerido'
      });
    }

    // Validar userId si se proporciona
    if (userId) {
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          error: 'El usuario especificado no existe'
        });
      }

      // Verificar si el usuario ya tiene paciente
      const existingPaciente = await Paciente.findOne({ userId });
      if (existingPaciente) {
        return res.status(400).json({
          success: false,
          error: 'Este usuario ya tiene un paciente asociado'
        });
      }
    }

    // Validar partnerId si se proporciona
    if (partnerId) {
      const partnerExists = await Partner.findById(partnerId);
      if (!partnerExists) {
        return res.status(400).json({
          success: false,
          error: 'El partner especificado no existe'
        });
      }
    }

    // 1. Crear antecedentes (solo con datos médicos)
    const antecedentes = new Antecedentes({
      ...antecedentesData,
      // No incluir partnerId aquí
    });

    // 2. Crear paciente
    const paciente = new Paciente({
      userId: userId || null,
      partnerId: partnerId || null, // partnerId solo va aquí
      fullName,
      fechaDeNacimiento: fechaDeNacimiento || null,
      antecedentes: antecedentes._id
    });

    // 3. Establecer relación bidireccional
    antecedentes.pacienteId = paciente._id;

    // 4. Transacción atómica
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await paciente.save({ session });
      await antecedentes.save({ session });
      await session.commitTransaction();

      // Actualizar usuario si corresponde
      if (userId) {
        await User.findByIdAndUpdate(userId, { isPaciente: true });
      }

      // Obtener datos completos para respuesta
      const pacienteCreado = await Paciente.findById(paciente._id)
        .populate('antecedentes userId partnerId');

      res.status(201).json({
        success: true,
        data: pacienteCreado
      });

    } catch (error) {
      await session.abortTransaction();
      console.error('Error en transacción:', error);
      throw error;
    } finally {
      session.endSession();
    }

    // Limpieza adicional para asegurar que no llegue partnerId
    const cleanAntecedentesData = Object.keys(antecedentesData).reduce((acc, key) => {
      if (key !== 'partnerId') acc[key] = antecedentesData[key];
      return acc;
    }, {});

  } catch (err) {
    console.error('Error en createPacienteConAntecedentes:', err);
    res.status(400).json({
      success: false,
      error: 'Error al crear paciente y antecedentes',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
  }
};

const getAllAntecedentes = async (req, res) => {
  try {
    const data = await Antecedentes.find();

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener antecedentes',
      details: err.message
    });
  }
};

const getAntecedentesByPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.pacienteId)
      .populate('antecedentes');

    if (!paciente || !paciente.antecedentes) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron antecedentes para este paciente'
      });
    }

    // Verificar permisos (médico asignado o el propio paciente)
    if (!req.user.isAdmin && !req.user.isMedico) {
      if (!paciente.userId || !paciente.userId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: paciente.antecedentes
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener antecedentes',
      details: err.message
    });
  }
};

const getAntecedentesById = async (req, res) => {
  try {
    const antecedentes = await Antecedentes.findById(req.params.id);
    if (!antecedentes) {
      return res.status(404).json({
        success: false,
        error: 'Antecedentes no encontrados'
      });
    }

    res.status(200).json({
      success: true,
      data: antecedentes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener antecedentes por ID',
      details: err.message
    });
  }
};


const updateAntecedentes = async (req, res) => {
  try {
    const updated = await Antecedentes.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Antecedentes no encontrados'
      });
    }

    res.status(200).json({
      success: true,
      data: updated
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar antecedentes',
      details: err.message
    });
  }
};

const deleteAntecedentes = async (req, res) => {
  try {
    // Verificar si algún paciente usa estos antecedentes
    const pacienteConAntecedentes = await Paciente.findOne({ antecedentes: req.params.id });

    if (pacienteConAntecedentes) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden eliminar estos antecedentes porque están asignados a un paciente'
      });
    }

    const deleted = await Antecedentes.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Antecedentes no encontrados'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar antecedentes',
      details: err.message
    });
  }
};

module.exports = {
  createPacienteConAntecedentes,
  getAllAntecedentes,
  getAntecedentesByPaciente,
  getAntecedentesById,
  updateAntecedentes,
  deleteAntecedentes
};