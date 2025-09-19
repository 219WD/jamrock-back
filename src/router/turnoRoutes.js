const express = require('express');
const router = express.Router();
const {
  createTurno,
  createTurnoAdmin,
  getAllTurnos,
  getTurnoById,
  getMisDatos,
  updateTurnoPorMedico,
  updateTurnoPorPaciente,
  updateTurnoPorSecretaria,
  deleteTurno,
  cancelarTurnoPorPaciente,
  agregarProductosATurno,
  marcarComoPagado,
  getTurnosParaCaja
} = require('../controllers/TurnoController');

const { authenticate, isAdmin, isMedico, isPaciente, isPacienteWithProfile, isAdminOrMedico, isAdminOrSecretaria, isSecretaria, isMedicoOrSecretaria, isAdminOrMedicoOrSecretaria } = require('../middlewares/authMiddleware');

// Crear nuevo turno (ahora con verificación de perfil)
router.post('/', authenticate, isPacienteWithProfile, createTurno);

// Obtener todos los turnos
router.get('/', authenticate, getAllTurnos);

// Mis datos de turno (solo paciente con perfil)
router.get('/mis-datos', authenticate, isPacienteWithProfile, getMisDatos);

// Obtener turno por ID
router.get('/:id', authenticate, getTurnoById);

// Actualizar turno por paciente (con verificación de perfil)
router.put('/paciente/:id', authenticate, isPacienteWithProfile, updateTurnoPorPaciente);

// Nueva ruta para actualización por secretaria
router.put('/secretaria/:id', authenticate, isSecretaria, updateTurnoPorSecretaria);

// Actualizar turno por médico
router.put('/medico/:id', authenticate, isMedicoOrSecretaria, updateTurnoPorMedico);

// Eliminar turno (solo admin)
router.delete('/:id', authenticate, isAdmin, deleteTurno);

// Cancelar turno por paciente (con verificación de perfil)
router.put('/paciente/:id/cancelar', authenticate, isPacienteWithProfile, cancelarTurnoPorPaciente);

// Nueva ruta para creación de turnos por admin/médico/secretaria
router.post('/admin', authenticate, isAdminOrMedicoOrSecretaria, createTurnoAdmin);

// Modificar la ruta existente para ser solo pacientes
router.post('/paciente', authenticate, isPacienteWithProfile, createTurno);

// Agregar productos a un turno (consultorio)
router.post('/:id/agregar-productos', authenticate, isAdminOrMedicoOrSecretaria, agregarProductosATurno);

// Marcar como pagado (caja)
router.put('/:id/marcar-pagado', authenticate, isAdminOrSecretaria, marcarComoPagado);

// Obtener turnos para caja
router.get('/caja/turnos', authenticate, isAdmin, getTurnosParaCaja);

module.exports = router;