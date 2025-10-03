console.log('🟢 userRoutes.js CARGADO');

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  isSecretariaStatus,
  searchUsers,
} = require('../controllers/UserController');
const { authenticate, isAdmin, isAdminOrSecretaria, isAdminOrMedicoOrSecretaria } = require('../middlewares/authMiddleware');

// Obtener todos los usuarios (accesible para admin y secretarias)
router.get('/getUsers', authenticate, isAdminOrMedicoOrSecretaria, getAllUsers);

// Obtener un usuario por ID (accesible para admin y secretarias)
router.get('/getUser/:id', authenticate, isAdminOrMedicoOrSecretaria, getUserById);

// Buscar usuarios por nombre o email (accesible para admin y secretarias)
router.get('/search', authenticate, isAdminOrMedicoOrSecretaria, searchUsers);

// Actualizar datos del usuario (name, email) (accesible para el usuario autenticado)
router.put('/updateUser/:id', authenticate, updateUser);

// Actualizar isPartner (accesible para admin y secretarias)
// userRoutes.js - RUTA CON LOGGING EXTREMO
router.patch('/togglePartner/:id', 
  // Middleware 1: authenticate
  (req, res, next) => {
    console.log('🔐 MIDDLEWARE authenticate - INICIADO');
    console.log('📝 URL:', req.originalUrl);
    console.log('🔑 Token presente:', !!req.headers.authorization);
    next();
  },
  authenticate,
  
  // Middleware 2: isAdminOrSecretaria  
  (req, res, next) => {
    console.log('👮 MIDDLEWARE isAdminOrSecretaria - INICIADO');
    console.log('👤 User después de authenticate:', req.user ? {
      id: req.user._id,
      name: req.user.name,
      isAdmin: req.user.isAdmin,
      isSecretaria: req.user.isSecretaria
    } : 'NO USER');
    next();
  },
  isAdminOrSecretaria,
  
  // Controller final
  (req, res, next) => {
    console.log('🎯 CONTROLLER updatePartnerStatus - A PUNTO DE EJECUTARSE');
    console.log('📝 ID final:', req.params.id);
    next();
  },
  updatePartnerStatus
);

// userRoutes.js - ENDPOINT DE DIAGNÓSTICO RÁPIDO
router.get('/diagnostic-test/:id', authenticate, isAdminOrSecretaria, async (req, res) => {
  try {
    console.log('🧪 DIAGNÓSTICO TEST ACCEDIDO');
    console.log('📝 ID:', req.params.id);
    console.log('👤 User:', req.user);
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('👤 Usuario encontrado:', user.name, user.email);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner
      }
    });
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar isAdmin (solo admin)
router.patch('/isAdmin/:id', authenticate, isAdmin, updateAdminStatus);

// Actualizar isSecretaria (solo admin)
router.patch('/isSecretaria/:id', authenticate, isAdmin, isSecretariaStatus);

// Actualizar isPending (solo admin)
router.patch('/isPending/:id', authenticate, isAdmin, updatePendingStatus);

module.exports = router;