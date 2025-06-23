const express = require('express');

const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  searchUsers
} = require('../controllers/UserController');
const isAdmin = require('../middlewares/isAdmin');

// Obtener todos los usuarios
router.get('/getUsers', isAdmin, getAllUsers);

// Obtener un usuario por ID
router.get('/getUser/:id', getUserById);

// Search
router.get('/search', isAdmin, searchUsers);

// Actualizar isPartner (PATCH) - Alternar estado
router.patch('/togglePartner/:id', isAdmin, updatePartnerStatus);

// Actualizar isAdmin (PATCH)
router.patch('/isAdmin/:id', isAdmin, updateAdminStatus);

// Actualizar isPending (PATCH)
router.patch('/isPending/:id', isAdmin, updatePendingStatus);

module.exports = router;