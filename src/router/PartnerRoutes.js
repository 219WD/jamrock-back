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

// En PartnerRoutes.js - REEMPLAZA el endpoint de prueba con esta versión
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const testUser = {
      _id: '68dc5ceaafc2bcf60ba74664',
      name: name || 'Administrador',
      email: email || 'jcanepa.web@gmail.com'
    };

    console.log('🧪 TEST: Iniciando prueba de email...');
    console.log('📧 Datos de prueba:', testUser);
    
    // Importación directa para evitar problemas
    const { sendPartnerRequestEmail } = require('../utils/emailJSSender');
    const result = await sendPartnerRequestEmail(testUser);
    
    res.status(200).json({
      message: 'Prueba de email completada',
      success: result.success,
      messageId: result.messageId,
      error: result.error
    });
  } catch (error) {
    console.error('❌ Error en prueba de email:', error);
    res.status(500).json({
      error: 'Error en prueba de email',
      details: error.message
    });
  }
});

module.exports = router;