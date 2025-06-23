const Cart = require("../models/Cart");
const Product = require("../models/Product");

// 👉 Obtener todos los carritos
const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("items.productId")
      .populate("userId", "name");
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 Obtener el último carrito de un usuario (ordenado por fecha)
const getLastCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const lastCart = await Cart.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId")
      .populate("userId", "name");

    if (!lastCart) return res.status(404).json({ message: "El usuario no tiene carritos" });
    res.status(200).json(lastCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 Agregar un producto al carrito
const addToCart = async (req, res) => {
  try {
    const { userId, items, paymentMethod, deliveryMethod, shippingAddress } = req.body;

    let totalAmount = 0;

    // Calcular el total y verificar stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });

      if (item.quantity > product.stock) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.title}` });
      }

      totalAmount += item.quantity * product.price;
    }

    const cart = new Cart({
      userId,
      items,
      paymentMethod,
      deliveryMethod,
      shippingAddress,
      totalAmount,
    });

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 Obtener el carrito de un usuario
const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.find({ userId })
      .populate("items.productId")
      .populate("userId", "name");

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 Actualizar productos en el carrito
const updateCartItems = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, action } = req.body; // action: 'add', 'subtract', 'remove'

    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1 && action === 'add') {
      // Producto nuevo
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });

      cart.items.push({ productId, quantity: 1 });
    } else if (itemIndex !== -1) {
      const item = cart.items[itemIndex];

      if (action === 'add') {
        item.quantity += 1;
      } else if (action === 'subtract') {
        item.quantity -= 1;
        if (item.quantity <= 0) cart.items.splice(itemIndex, 1); // eliminar si queda en 0
      } else if (action === 'remove') {
        cart.items.splice(itemIndex, 1); // eliminar directamente
      }
    } else {
      return res.status(400).json({ message: "Producto no existe en el carrito" });
    }

    // Recalcular total
    let totalAmount = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      totalAmount += item.quantity * product.price;
    }
    cart.totalAmount = totalAmount;

    await cart.save();
    res.status(200).json({ message: "Carrito actualizado", cart });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 👉 Confirmar compra (checkout)
const checkoutCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const {
      paymentMethod,
      deliveryMethod,
      shippingAddress,
      customerInfo,
      receiptUrl
    } = req.body;

    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
    if (cart.status !== "pendiente") return res.status(400).json({ message: "Carrito ya procesado" });

    // Actualizar campos
    cart.paymentMethod = paymentMethod;
    cart.deliveryMethod = deliveryMethod;

    cart.shippingAddress = {
      name: customerInfo?.name || shippingAddress?.name || cart.shippingAddress.name,
      address: customerInfo?.address || shippingAddress?.address || cart.shippingAddress.address,
      phone: customerInfo?.phone || shippingAddress?.phone || cart.shippingAddress.phone,
    };

    if (receiptUrl) cart.receiptUrl = receiptUrl;

    cart.status = "pagado";
    await cart.save();

    return res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor al procesar checkout", error: err.message });
  }
};

const updateCartStatus = async (req, res) => {
  const { cartId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pendiente", "pagado", "cancelado", "entregado"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    cart.status = status;
    await cart.save();

    const updatedCart = await Cart.findById(cartId)
      .populate("items.productId")
      .populate("userId", "name");

    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: "Error del servidor", error: error.message });
  }
};

module.exports = {
  getAllCarts,
  getLastCartByUser,
  addToCart,
  getCartByUser,
  updateCartItems,
  checkoutCart,
  updateCartStatus,
};
