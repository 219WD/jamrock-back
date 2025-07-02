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

// Rutas públicas
router.get('/getProducts', getProducts);
router.get('/getProducts/:id', getProductById);

// Rutas protegidas (solo admin, por ejemplo)
router.post('/createProduct', isAdmin, createProduct);
router.put('/updateProduct/:id', isAdmin, updateProduct);
router.delete('/deleteProduct/:id', isAdmin, deleteProduct);

// Actualizar isPartner (PATCH) - Alternar estado
router.patch('/toggle-status/:id', isAdmin, toggleProductStatus);

// Rutas para reseñas de productos
router.post('/:id/review', addProductReview);

module.exports = router;
