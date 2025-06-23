const express = require('express');
const router = express.Router();
const {
  createPartner,
  getAllPartners,
  getPartnerById,
  getPartnerByUserId,
  updatePartner,
  deletePartner
} = require('../controllers/PartnerController');
const isAdmin = require('../middlewares/isAdmin');

// Crear un nuevo partner
router.post('/createPartner', createPartner);

// Obtener todos los partners
router.get('/getAllPartners', isAdmin, getAllPartners);

// Obtener un partner por ID
router.get('/getPartnerById/:id', isAdmin, getPartnerById);

// Obtener partner por userId
router.get('/user/getPartnerByUserId/:userId', getPartnerByUserId);

// Actualizar partner
router.put('/updatePartner/:id', updatePartner);

// Eliminar partner
router.delete('/deletePartner/:id', isAdmin, deletePartner);

module.exports = router;
