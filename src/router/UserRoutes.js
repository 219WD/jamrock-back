const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  isSecretariaStatus,
  searchUsers
} = require('../controllers/UserController');
const { authenticate, isAdmin, isAdminOrMedico } = require('../middlewares/authMiddleware');

// Obtener todos los usuarios (accesible para admin y médicos)
router.get('/getUsers', authenticate, isAdminOrMedico, getAllUsers);

// Obtener un usuario por ID (accesible para todos los usuarios autenticados)
router.get('/getUser/:id', getUserById);

// Search (accesible para admin y médicos)
router.get('/search', authenticate, isAdminOrMedico, searchUsers);

// Actualizar isPartner (PATCH) - Alternar estado (solo admin)
router.patch('/togglePartner/:id', authenticate, isAdmin, updatePartnerStatus);

// Actualizar isAdmin (PATCH) (solo admin)
router.patch('/isAdmin/:id', authenticate, isAdmin, updateAdminStatus);


// Actualizar isSecretaria (PATCH) - Alternar estado (solo admin)
router.patch('/isSecretaria/:id', authenticate, isAdmin, isSecretariaStatus);

// Actualizar isPending (PATCH) (solo admin)
router.patch('/isPending/:id', authenticate, isAdmin, updatePendingStatus);

module.exports = router;