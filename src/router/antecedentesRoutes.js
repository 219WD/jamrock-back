const express = require('express');
const router = express.Router();
const {
  createPacienteConAntecedentes,
  getAllAntecedentes,
  getAntecedentesByPaciente,
  getAntecedentesById,
  updateAntecedentes,
  deleteAntecedentes
} = require('../controllers/AntecedentesController');

const { authenticate, isAdmin, isMedico } = require('../middlewares/authMiddleware');

// Nueva ruta unificada
router.post('/completo', authenticate, isMedico, createPacienteConAntecedentes);
router.get('/', authenticate, isMedico, getAllAntecedentes);
router.get('/:id', authenticate, isMedico, getAntecedentesByPaciente);
router.get('/by-id/:id', authenticate, isMedico, getAntecedentesById); //ID de antecedentes
router.put('/:id', authenticate, isMedico, updateAntecedentes);
router.delete('/:id', authenticate, isAdmin, deleteAntecedentes);
router.get('/paciente/:pacienteId', authenticate, getAntecedentesByPaciente);

module.exports = router;