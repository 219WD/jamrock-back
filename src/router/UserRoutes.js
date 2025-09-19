const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
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

// Actualizar isPartner (accesible para admin y secretarias)
router.patch('/togglePartner/:id', authenticate, isAdminOrSecretaria, updatePartnerStatus);

// Actualizar isAdmin (solo admin)
router.patch('/isAdmin/:id', authenticate, isAdmin, updateAdminStatus);

// Actualizar isSecretaria (solo admin)
router.patch('/isSecretaria/:id', authenticate, isAdmin, isSecretariaStatus);

// Actualizar isPending (solo admin)
router.patch('/isPending/:id', authenticate, isAdmin, updatePendingStatus);

module.exports = router;