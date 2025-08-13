// const Paciente = require('../models/Paciente');
// const User = require('../models/User');
// const Antecedentes = require('../models/antecedentes');
// const Especialista = require('../models/Especialista');

// const createPaciente = async (req, res) => {
//   try {
//     const { userId, partnerId, fullName, fechaDeNacimiento, antecedentes, reprocann } = req.body;

//     // Validar antecedentes
//     const antecedentesExisten = await Antecedentes.findById(antecedentes);
//     if (!antecedentesExisten) {
//       return res.status(400).json({
//         success: false,
//         error: 'Los antecedentes médicos no existen'
//       });
//     }

//     // Si se asocia a usuario, validar que exista
//     if (userId) {
//       const usuarioExiste = await User.findById(userId);
//       if (!usuarioExiste) {
//         return res.status(400).json({
//           success: false,
//           error: 'El usuario asociado no existe'
//         });
//       }
//     }

//     // Crear paciente con todos los datos, incluyendo REPROCANN
//     const paciente = new Paciente({
//       userId: userId || null,
//       partnerId: partnerId || null,
//       fullName,
//       fechaDeNacimiento: fechaDeNacimiento || null,
//       antecedentes,
//       reprocann: reprocann || {
//         status: 'inicializado',
//         fechaAprobacion: null,
//         fechaVencimiento: null
//       }
//     });

//     await paciente.save();

//     // Si tiene userId, actualizar isPaciente en User
//     if (userId) {
//       await User.findByIdAndUpdate(userId, { isPaciente: true });
//     }

//     res.status(201).json({
//       success: true,
//       data: paciente
//     });

//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: 'Error al crear paciente',
//       details: err.message
//     });
//   }
// };

// const getAllPacientes = async (req, res) => {
//   try {
//     let filtro = {};

//     // Si es admin, obtener todos los pacientes sin filtro
//     if (req.user.isAdmin) {
//       const pacientes = await Paciente.find(filtro)
//         .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

//       return res.status(200).json({
//         success: true,
//         count: pacientes.length,
//         data: pacientes
//       });
//     }

//     // Si es partner, solo sus pacientes
//     if (req.user.isPartner) {
//       const partnerPacientes = await Paciente.find({ partnerId: req.user.partnerData })
//         .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

//       return res.status(200).json({
//         success: true,
//         count: partnerPacientes.length,
//         data: partnerPacientes
//       });
//     }

//     // Si es médico, obtener pacientes que ha evaluado
//     if (req.user.isMedico) {
//       const especialista = await Especialista.findOne({ userId: req.user._id });

//       if (!especialista) {
//         return res.status(403).json({
//           success: false,
//           error: 'No se encontró el perfil de especialista'
//         });
//       }

//       const pacientes = await Paciente.find({
//         'evaluacionMedica.especialistaId': especialista._id
//       }).populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

//       return res.status(200).json({
//         success: true,
//         count: pacientes.length,
//         data: pacientes
//       });
//     }

//     // Para usuarios normales (pacientes), solo su propio perfil
//     const paciente = await Paciente.findOne({ userId: req.user._id })
//       .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

//     if (!paciente) {
//       return res.status(404).json({
//         success: false,
//         error: 'No se encontró el perfil de paciente'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       count: 1,
//       data: [paciente]
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: 'Error al obtener pacientes',
//       details: err.message
//     });
//   }
// };

// const getPacienteById = async (req, res) => {
//   try {
//     const paciente = await Paciente.findById(req.params.id)
//       .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

//     if (!paciente) {
//       return res.status(404).json({
//         success: false,
//         error: 'Paciente no encontrado'
//       });
//     }

//     // Verificar permisos (admin, médico o el propio paciente)
//     if (!req.user.isAdmin && !req.user.isMedico) {
//       if (paciente.userId && !paciente.userId._id.equals(req.user._id)) {
//         return res.status(403).json({
//           success: false,
//           error: 'No autorizado'
//         });
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: paciente
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       error: 'Error al buscar paciente',
//       details: err.message
//     });
//   }
// };

// const updatePaciente = async (req, res) => {
//   try {
//     const { fullName, fechaDeNacimiento, antecedentes } = req.body;

//     const paciente = await Paciente.findById(req.params.id);

//     if (!paciente) {
//       return res.status(404).json({
//         success: false,
//         error: 'Paciente no encontrado'
//       });
//     }

//     // Verificación de permisos (admin, médico o el propio paciente)
//     if (!req.user.isAdmin && !req.user.isMedico) {
//       if (paciente.userId && !paciente.userId._id.equals(req.user._id)) {
//         return res.status(403).json({
//           success: false,
//           error: 'No autorizado'
//         });
//       }
//     }

//     // Actualizar campos básicos
//     if (fullName) paciente.fullName = fullName;
//     if (fechaDeNacimiento) paciente.fechaDeNacimiento = fechaDeNacimiento;
//     if (antecedentes) paciente.antecedentes = antecedentes;

//     const pacienteActualizado = await paciente.save();

//     res.status(200).json({
//       success: true,
//       data: pacienteActualizado
//     });

//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: 'Error al actualizar paciente',
//       details: err.message
//     });
//   }
// };

// const updateDatosClinicos = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { patologia, tratamientoPropuesto, beneficios, fechaEvaluacion } = req.body;

//     // Verificar si el usuario es médico (redundante por el middleware, pero buena práctica)
//     if (!req.user.isMedico) {
//       return res.status(403).json({
//         success: false,
//         error: 'Solo los médicos pueden actualizar datos clínicos'
//       });
//     }

//     // Buscar especialista asociado al usuario médico
//     const especialista = await Especialista.findOne({ userId: req.user._id });
//     if (!especialista) {
//       return res.status(403).json({
//         success: false,
//         error: 'Perfil de especialista no encontrado'
//       });
//     }

//     // Buscar paciente
//     const paciente = await Paciente.findById(id);
//     if (!paciente) {
//       return res.status(404).json({
//         success: false,
//         error: 'Paciente no encontrado'
//       });
//     }

//     // Inicializar evaluacionMedica si no existe
//     if (!paciente.evaluacionMedica) {
//       paciente.evaluacionMedica = {
//         patologia: '',
//         tratamientoPropuesto: '',
//         beneficios: '',
//         fechaEvaluacion: null,
//         especialistaId: null
//       };
//     }

//     // Actualizar solo los campos proporcionados
//     if (patologia !== undefined) paciente.evaluacionMedica.patologia = patologia;
//     if (tratamientoPropuesto !== undefined) paciente.evaluacionMedica.tratamientoPropuesto = tratamientoPropuesto;
//     if (beneficios !== undefined) paciente.evaluacionMedica.beneficios = beneficios;

//     // Manejar fecha de evaluación
//     if (fechaEvaluacion !== undefined) {
//       paciente.evaluacionMedica.fechaEvaluacion = new Date(fechaEvaluacion);
//     } else if (!paciente.evaluacionMedica.fechaEvaluacion) {
//       paciente.evaluacionMedica.fechaEvaluacion = new Date();
//     }

//     // Asignar especialista
//     paciente.evaluacionMedica.especialistaId = especialista._id;

//     // Marcar como modificado explícitamente
//     paciente.markModified('evaluacionMedica');

//     // Guardar cambios
//     const pacienteActualizado = await paciente.save();

//     res.status(200).json({
//       success: true,
//       data: pacienteActualizado
//     });

//   } catch (err) {
//     console.error('Error en updateDatosClinicos:', err);
//     res.status(400).json({
//       success: false,
//       error: 'Error al actualizar datos clínicos',
//       details: err.message
//     });
//   }
// };

// const updateReprocannStatus = async (req, res) => {
//   try {
//     const { status, fechaAprobacion, fechaVencimiento } = req.body;

//     const paciente = await Paciente.findById(req.params.id);
    
//     if (!paciente) {
//       return res.status(404).json({
//         success: false,
//         error: 'Paciente no encontrado'
//       });
//     }

//     // Verificar permisos (solo médico o admin puede actualizar REPROCANN)
//     if (!req.user.isAdmin && !req.user.isMedico) {
//       return res.status(403).json({
//         success: false,
//         error: 'No autorizado para actualizar REPROCANN'
//       });
//     }

//     // Inicializar objeto reprocann si no existe
//     if (!paciente.reprocann) {
//       paciente.reprocann = {
//         status: 'inicializado',
//         fechaAprobacion: null,
//         fechaVencimiento: null
//       };
//     }

//     // Validar estado REPROCANN
//     const estadosValidos = ['inicializado', 'pendiente', 'aprobado', 'rechazado', 'expirado'];
//     if (status && !estadosValidos.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Estado REPROCANN no válido'
//       });
//     }

//     // Validar fechas
//     if (fechaAprobacion && fechaVencimiento && new Date(fechaAprobacion) > new Date(fechaVencimiento)) {
//       return res.status(400).json({
//         success: false,
//         error: 'La fecha de aprobación no puede ser posterior a la de vencimiento'
//       });
//     }

//     // Actualizar solo los campos proporcionados
//     if (status) paciente.reprocann.status = status;
//     if (fechaAprobacion) paciente.reprocann.fechaAprobacion = new Date(fechaAprobacion);
//     if (fechaVencimiento) paciente.reprocann.fechaVencimiento = new Date(fechaVencimiento);

//     // Marcar como modificado explícitamente
//     paciente.markModified('reprocann');

//     await paciente.save();

//     res.status(200).json({
//       success: true,
//       data: paciente
//     });

//   } catch (err) {
//     console.error('Error en updateReprocannStatus:', err);
//     res.status(400).json({
//       success: false,
//       error: 'Error al actualizar estado REPROCANN',
//       details: err.message
//     });
//   }
// };

// // En controllers/PacienteController.js
// const getMiPerfil = async (req, res) => {
//   try {
//     const paciente = await Paciente.findOne({ userId: req.user._id });
//     if (!paciente) {
//       return res.status(404).json({ 
//         success: false,
//         error: "Paciente no encontrado" 
//       });
//     }
//     res.status(200).json({ 
//       success: true,
//       data: paciente 
//     });
//   } catch (err) {
//     res.status(500).json({ 
//       success: false,
//       error: "Error al buscar perfil",
//       details: err.message 
//     });
//   }
// };

// module.exports = {
//   createPaciente,
//   getAllPacientes,
//   getPacienteById,
//   updatePaciente,
//   updateDatosClinicos,
//   updateReprocannStatus,
//   getMiPerfil
// };

const Paciente = require('../models/Paciente');
const User = require('../models/User');
const Antecedentes = require('../models/antecedentes');
const Especialista = require('../models/Especialista');
const Turno = require('../models/Turno');

const createPaciente = async (req, res) => {
  try {
    const { userId, partnerId, fullName, fechaDeNacimiento, antecedentes, reprocann } = req.body;

    // Validar antecedentes
    const antecedentesExisten = await Antecedentes.findById(antecedentes);
    if (!antecedentesExisten) {
      return res.status(400).json({
        success: false,
        error: 'Los antecedentes médicos no existen'
      });
    }

    // Si se asocia a usuario, validar que exista
    if (userId) {
      const usuarioExiste = await User.findById(userId);
      if (!usuarioExiste) {
        return res.status(400).json({
          success: false,
          error: 'El usuario asociado no existe'
        });
      }
    }

    // Crear paciente con todos los datos, incluyendo REPROCANN
    const paciente = new Paciente({
      userId: userId || null,
      partnerId: partnerId || null,
      fullName,
      fechaDeNacimiento: fechaDeNacimiento || null,
      antecedentes,
      reprocann: reprocann || {
        status: 'inicializado',
        fechaAprobacion: null,
        fechaVencimiento: null
      }
    });

    await paciente.save();

    // Si tiene userId, actualizar isPaciente en User
    if (userId) {
      await User.findByIdAndUpdate(userId, { isPaciente: true });
    }

    res.status(201).json({
      success: true,
      data: paciente
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Error al crear paciente',
      details: err.message
    });
  }
};

const getAllPacientes = async (req, res) => {
  try {
    let filtro = {};

    // Si es admin, obtener todos los pacientes sin filtro
    if (req.user.isAdmin) {
      const pacientes = await Paciente.find(filtro)
        .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

      return res.status(200).json({
        success: true,
        count: pacientes.length,
        data: pacientes
      });
    }

    // Si es partner, solo sus pacientes
    if (req.user.isPartner) {
      const partnerPacientes = await Paciente.find({ partnerId: req.user.partnerData })
        .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

      return res.status(200).json({
        success: true,
        count: partnerPacientes.length,
        data: partnerPacientes
      });
    }

    // Si es médico, obtener pacientes que ha evaluado
    if (req.user.isMedico) {
      const especialista = await Especialista.findOne({ userId: req.user._id });

      if (!especialista) {
        return res.status(403).json({
          success: false,
          error: 'No se encontró el perfil de especialista'
        });
      }

      const pacientes = await Paciente.find({
        'evaluacionMedica.especialistaId': especialista._id
      }).populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

      return res.status(200).json({
        success: true,
        count: pacientes.length,
        data: pacientes
      });
    }

    // Para usuarios normales (pacientes), solo su propio perfil
    const paciente = await Paciente.findOne({ userId: req.user._id })
      .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró el perfil de paciente'
      });
    }

    res.status(200).json({
      success: true,
      count: 1,
      data: [paciente]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener pacientes',
      details: err.message
    });
  }
};

const getPacienteById = async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id)
      .populate('userId partnerId antecedentes evaluacionMedica.especialistaId');

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Verificar permisos (admin, médico o el propio paciente)
    if (!req.user.isAdmin && !req.user.isMedico) {
      if (paciente.userId && !paciente.userId._id.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: paciente
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al buscar paciente',
      details: err.message
    });
  }
};

const updatePaciente = async (req, res) => {
  try {
    const { fullName, fechaDeNacimiento, antecedentes } = req.body;

    const paciente = await Paciente.findById(req.params.id);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Verificación de permisos (admin, médico o el propio paciente)
    if (!req.user.isAdmin && !req.user.isMedico) {
      if (paciente.userId && !paciente.userId._id.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }
    }

    // Actualizar campos básicos
    if (fullName) paciente.fullName = fullName;
    if (fechaDeNacimiento) paciente.fechaDeNacimiento = fechaDeNacimiento;
    if (antecedentes) paciente.antecedentes = antecedentes;

    const pacienteActualizado = await paciente.save();

    res.status(200).json({
      success: true,
      data: pacienteActualizado
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar paciente',
      details: err.message
    });
  }
};

const updateDatosClinicos = async (req, res) => {
  try {
    const { id } = req.params;
    const { patologia, tratamientoPropuesto, beneficios, fechaEvaluacion } = req.body;

    // Verificar si el usuario es médico (redundante por el middleware, pero buena práctica)
    if (!req.user.isMedico) {
      return res.status(403).json({
        success: false,
        error: 'Solo los médicos pueden actualizar datos clínicos'
      });
    }

    // Buscar especialista asociado al usuario médico
    const especialista = await Especialista.findOne({ userId: req.user._id });
    if (!especialista) {
      return res.status(403).json({
        success: false,
        error: 'Perfil de especialista no encontrado'
      });
    }

    // Buscar paciente
    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Inicializar evaluacionMedica si no existe
    if (!paciente.evaluacionMedica) {
      paciente.evaluacionMedica = {
        patologia: '',
        tratamientoPropuesto: '',
        beneficios: '',
        fechaEvaluacion: null,
        especialistaId: null
      };
    }

    // Actualizar solo los campos proporcionados
    if (patologia !== undefined) paciente.evaluacionMedica.patologia = patologia;
    if (tratamientoPropuesto !== undefined) paciente.evaluacionMedica.tratamientoPropuesto = tratamientoPropuesto;
    if (beneficios !== undefined) paciente.evaluacionMedica.beneficios = beneficios;

    // Manejar fecha de evaluación
    if (fechaEvaluacion !== undefined) {
      paciente.evaluacionMedica.fechaEvaluacion = new Date(fechaEvaluacion);
    } else if (!paciente.evaluacionMedica.fechaEvaluacion) {
      paciente.evaluacionMedica.fechaEvaluacion = new Date();
    }

    // Asignar especialista
    paciente.evaluacionMedica.especialistaId = especialista._id;

    // Marcar como modificado explícitamente
    paciente.markModified('evaluacionMedica');

    // Guardar cambios
    const pacienteActualizado = await paciente.save();

    res.status(200).json({
      success: true,
      data: pacienteActualizado
    });

  } catch (err) {
    console.error('Error en updateDatosClinicos:', err);
    res.status(400).json({
      success: false,
      error: 'Error al actualizar datos clínicos',
      details: err.message
    });
  }
};

const updateReprocannStatus = async (req, res) => {
  try {
    const { status, fechaAprobacion, fechaVencimiento } = req.body;

    const paciente = await Paciente.findById(req.params.id);
    
    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Verificar permisos (solo médico o admin puede actualizar REPROCANN)
    if (!req.user.isAdmin && !req.user.isMedico) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para actualizar REPROCANN'
      });
    }

    // Inicializar objeto reprocann si no existe
    if (!paciente.reprocann) {
      paciente.reprocann = {
        status: 'inicializado',
        fechaAprobacion: null,
        fechaVencimiento: null
      };
    }

    // Validar estado REPROCANN
    const estadosValidos = ['inicializado', 'pendiente', 'aprobado', 'rechazado', 'expirado'];
    if (status && !estadosValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado REPROCANN no válido'
      });
    }

    // Validar fechas
    if (fechaAprobacion && fechaVencimiento && new Date(fechaAprobacion) > new Date(fechaVencimiento)) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de aprobación no puede ser posterior a la de vencimiento'
      });
    }

    // Actualizar solo los campos proporcionados
    if (status) paciente.reprocann.status = status;
    if (fechaAprobacion) paciente.reprocann.fechaAprobacion = new Date(fechaAprobacion);
    if (fechaVencimiento) paciente.reprocann.fechaVencimiento = new Date(fechaVencimiento);

    // Marcar como modificado explícitamente
    paciente.markModified('reprocann');

    await paciente.save();

    res.status(200).json({
      success: true,
      data: paciente
    });

  } catch (err) {
    console.error('Error en updateReprocannStatus:', err);
    res.status(400).json({
      success: false,
      error: 'Error al actualizar estado REPROCANN',
      details: err.message
    });
  }
};

// En controllers/PacienteController.js
const getMiPerfil = async (req, res) => {
  try {
    const paciente = await Paciente.findOne({ userId: req.user._id });
    if (!paciente) {
      return res.status(404).json({ 
        success: false,
        error: "Paciente no encontrado" 
      });
    }
    res.status(200).json({ 
      success: true,
      data: paciente 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: "Error al buscar perfil",
      details: err.message 
    });
  }
};

// Obtener perfil de paciente del usuario actual
const getMiPerfilPaciente = async (req, res) => {
  try {
    const paciente = await Paciente.findOne({ userId: req.user._id });
    
    if (!paciente) {
      return res.status(404).json({ 
        success: false,
        error: "Perfil de paciente no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      data: paciente // Nota: aquí devolvemos el paciente directamente, no en data.paciente
    });
  } catch (err) {
    console.error("Error en getMiPerfilPaciente:", err);
    res.status(500).json({ 
      success: false,
      error: "Error al buscar perfil de paciente",
      details: err.message 
    });
  }
};

// Agregar consulta al historial
const agregarConsultaHistorial = async (req, res) => {
  try {
    const { turnoId, diagnostico, tratamiento, observaciones, productosRecetados } = req.body;
    
    // Validar que el turno existe
    const turno = await Turno.findById(turnoId).populate('especialistaId');
    if (!turno) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // Validar que el paciente existe
    const paciente = await Paciente.findById(req.params.id);
    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Validar que el turno pertenece al paciente
    if (!turno.pacienteId.equals(paciente._id)) {
      return res.status(403).json({
        success: false,
        error: 'El turno no pertenece a este paciente'
      });
    }

    // Crear entrada de historial
    const nuevaConsulta = {
      turnoId: turno._id,
      fechaConsulta: turno.fecha,
      especialista: turno.especialistaId.userId.name,
      motivo: turno.motivo,
      diagnostico: diagnostico || '',
      tratamiento: tratamiento || '',
      observaciones: observaciones || '',
      productosRecetados: productosRecetados || []
    };

    // Agregar al historial
    if (!paciente.historialConsultas) {
      paciente.historialConsultas = [];
    }
    
    paciente.historialConsultas.push(nuevaConsulta);
    await paciente.save();

    res.status(201).json({
      success: true,
      data: paciente,
      message: 'Consulta agregada al historial exitosamente'
    });

  } catch (err) {
    console.error('Error en agregarConsultaHistorial:', err);
    res.status(400).json({
      success: false,
      error: 'Error al agregar consulta al historial',
      details: err.message
    });
  }
};

// Actualizar consulta en el historial
const actualizarConsultaHistorial = async (req, res) => {
  try {
    const { consultaId } = req.params;
    const { diagnostico, tratamiento, observaciones, productosRecetados } = req.body;

    const paciente = await Paciente.findOne({
      'historialConsultas._id': consultaId
    });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Consulta no encontrada'
      });
    }

    // Verificar permisos (médico o admin)
    if (!req.user.isAdmin && !req.user.isMedico) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para actualizar historial'
      });
    }

    // Buscar y actualizar la consulta
    const consulta = paciente.historialConsultas.id(consultaId);
    if (!consulta) {
      return res.status(404).json({
        success: false,
        error: 'Consulta no encontrada en el historial'
      });
    }

    if (diagnostico !== undefined) consulta.diagnostico = diagnostico;
    if (tratamiento !== undefined) consulta.tratamiento = tratamiento;
    if (observaciones !== undefined) consulta.observaciones = observaciones;
    if (productosRecetados !== undefined) consulta.productosRecetados = productosRecetados;

    paciente.markModified('historialConsultas');
    await paciente.save();

    res.status(200).json({
      success: true,
      data: paciente,
      message: 'Consulta actualizada exitosamente'
    });

  } catch (err) {
    console.error('Error en actualizarConsultaHistorial:', err);
    res.status(400).json({
      success: false,
      error: 'Error al actualizar consulta',
      details: err.message
    });
  }
};

// Obtener historial de consultas
const getHistorialConsultas = async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id)
      .select('historialConsultas fullName')
      .populate({
        path: 'historialConsultas.turnoId',
        select: 'fecha motivo notas consulta'
      });

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Verificar permisos (admin, médico o el propio paciente)
    if (!req.user.isAdmin && !req.user.isMedico) {
      if (paciente.userId && !paciente.userId.equals(req.user._id)) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: paciente.historialConsultas || [],
      paciente: paciente.fullName
    });

  } catch (err) {
    console.error('Error en getHistorialConsultas:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial',
      details: err.message
    });
  }
};

module.exports = {
  createPaciente,
  getAllPacientes,
  getPacienteById,
  updatePaciente,
  updateDatosClinicos,
  updateReprocannStatus,
  getMiPerfil,
  getMiPerfilPaciente,
  agregarConsultaHistorial,
  actualizarConsultaHistorial,
  getHistorialConsultas
};