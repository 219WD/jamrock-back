const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartByUser,
  getAllCarts,
  getLastCartByUser,
  updateCartItems,
  checkoutCart,
  updateCartStatus,
  addCartProductRating
} = require("../controllers/cartController");
const isAdmin = require("../middlewares/isAdmin");

// POST /cart/addToCart → crear carrito
router.post("/addToCart", addToCart);

// GET /cart/ → obtener todos los carritos
router.get("/getAllCarts", getAllCarts);

// GET /cart/user/:userId → obtener todos los carritos de un usuario
router.get("/user/:userId", getCartByUser);

// GET /cart/user/:userId/last → obtener el último carrito de un usuario
router.get("/user/:userId/last", getLastCartByUser);

// PUT /cart/update/:cartId → actualizar productos en el carrito
router.put("/update/:cartId", updateCartItems);

// PUT /cart/checkout/:cartId → confirmar compra
router.put("/checkout/:cartId", checkoutCart);

// PUT /cart/status/:cartId → actualizar estado del carrito (solo admin)
router.put("/status/:cartId", isAdmin, updateCartStatus);

router.post('/:cartId/rate/:productId', addCartProductRating);

module.exports = router;
