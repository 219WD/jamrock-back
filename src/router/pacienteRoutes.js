// const express = require('express');
// const router = express.Router();
// const {
//   createPaciente,
//   getAllPacientes,
//   getPacienteById,
//   updatePaciente,
//   updateDatosClinicos,
//   updateReprocannStatus,
//   getMiPerfil
// } = require('../controllers/PacienteController');

// const { authenticate, isAdmin, isMedico, isPaciente} = require('../middlewares/authMiddleware');

// router.post('/', authenticate, createPaciente); // Cualquier usuario autenticado
// router.get('/', authenticate, getAllPacientes); 
// router.get('/:id', authenticate, getPacienteById);
// router.put('/:id', authenticate, updatePaciente);
// router.put('/:id/reprocann', authenticate, isMedico, updateReprocannStatus);
// // 👨‍⚕️ PUT /pacientes/medico/:id
// router.put('/medico/:id', authenticate, isMedico, updateDatosClinicos);
// // En routes/pacientes.js
// router.get('/mi-perfil', authenticate, isPaciente, getMiPerfil);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/PacienteController');

const { authenticate, isAdmin, isMedico, isPaciente, isAdminOrMedico} = require('../middlewares/authMiddleware');

router.post('/', authenticate, createPaciente); // Cualquier usuario autenticado
router.get('/', authenticate, getAllPacientes); 
router.get('/:id', authenticate, getPacienteById);
router.put('/:id', authenticate, updatePaciente);
router.put('/:id/reprocann', authenticate, isMedico, updateReprocannStatus);
// 👨‍⚕️ PUT /pacientes/medico/:id
router.put('/medico/:id', authenticate, isMedico, updateDatosClinicos);
// En routes/pacientes.js
router.get('/mi-perfil', authenticate, isPaciente, getMiPerfil);

router.get('/pacientes/mi-perfil', authenticate, getMiPerfilPaciente);

// Historial de consultas
router.post('/:id/historial', authenticate, isAdminOrMedico, agregarConsultaHistorial);
router.put('/historial/:consultaId', authenticate, isAdminOrMedico, actualizarConsultaHistorial);
router.get('/:id/historial', authenticate, getHistorialConsultas);

module.exports = router;