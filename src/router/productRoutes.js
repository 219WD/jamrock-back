const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  addProductReview
} = require('../controllers/productController');

// Middlewares de autenticación/autorización (si los usas)
const isAdmin = require('../middlewares/isAdmin');
const { authenticate, isAdminOrSecretaria } = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/getProducts', getProducts);
router.get('/getProducts/:id', getProductById);

// Rutas protegidas (solo admin, por ejemplo)
router.post('/createProduct', authenticate, isAdminOrSecretaria, createProduct);
router.put('/updateProduct/:id', authenticate, isAdminOrSecretaria, updateProduct);
router.delete('/deleteProduct/:id', authenticate, isAdminOrSecretaria, deleteProduct);

// Actualizar isPartner (PATCH) - Alternar estado
router.patch('/toggle-status/:id', authenticate, isAdminOrSecretaria, toggleProductStatus);

// Rutas para reseñas de productos
router.post('/:id/review', addProductReview);

module.exports = router;
