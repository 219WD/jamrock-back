const express = require('express');
const router = express.Router();
const {
  createEspecialista,
  getAllEspecialistas,
  getEspecialistaById,
  getEspecialistaByUserId,
  updateEspecialista
} = require('../controllers/EspecialistaController');

const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authenticate, isAdmin, createEspecialista);
router.get('/', authenticate, getAllEspecialistas);
router.get('/:id', authenticate, getEspecialistaById);
router.get('/user/:userId', authenticate, getEspecialistaByUserId);
router.put('/:id', authenticate, updateEspecialista);

module.exports = router;