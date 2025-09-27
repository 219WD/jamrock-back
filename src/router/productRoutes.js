const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  debugProduct
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
// router.post('/:id/review', addProductReview);

// Y en productRoutes.js agregar:
router.get('/debug/:id', debugProduct);

// 🔹 NUEVAS RUTAS PARA MANEJO DE STOCK (SOLO ESTO SE AGREGA)
const Product = require('../models/Product');

// RESTAURAR STOCK (para cuando fallan operaciones)
router.post('/:id/restore-stock', authenticate, isAdminOrSecretaria, async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    await product.increaseStock(quantity);
    
    res.status(200).json({
      success: true,
      data: product,
      message: `Stock restaurado exitosamente. Nuevo stock: ${product.stock}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// VERIFICAR STOCK (para pre-validaciones)
router.post('/:id/check-stock', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    const hasStock = product.hasEnoughStock(quantity);
    
    res.status(200).json({
      success: true,
      data: {
        hasStock,
        available: product.stock,
        requested: quantity
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;