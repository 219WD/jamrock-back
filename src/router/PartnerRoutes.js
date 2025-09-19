const express = require('express');
const router = express.Router();
const {
  createPartner,
  getAllPartners,
  getPartnerById,
  getPartnerByUserId,
  getMyPartnerData, // Nueva función
  updatePartner,
  deletePartner,
} = require('../controllers/PartnerController');
const { authenticate, isAdmin, isAdminOrSecretaria } = require('../middlewares/authMiddleware');

// Crear un nuevo partner (accesible para todos los autenticados)
router.post('/createPartner', authenticate, createPartner);

// Obtener todos los partners (solo admin)
router.get('/getAllPartners', authenticate, isAdmin, getAllPartners);

// Obtener un partner por ID (solo admin)
router.get('/getPartnerById/:id', authenticate, isAdmin, getPartnerById);

// Obtener partner por userId (accesible para admin y secretarias)
router.get('/user/getPartnerByUserId/:userId', authenticate, isAdminOrSecretaria, getPartnerByUserId);

// Obtener MIS datos de partner (accesible para el usuario autenticado)
router.get('/my-partner-data', authenticate, getMyPartnerData);

// Actualizar partner (accesible para todos los autenticados)
router.put('/updatePartner/:id', authenticate, updatePartner);

// Eliminar partner (solo admin)
router.delete('/deletePartner/:id', authenticate, isAdmin, deletePartner);

module.exports = router;