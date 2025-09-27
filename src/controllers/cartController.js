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

// 👉 Obtener el último carrito de un usuario
const getLastCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario solo acceda a su propio carrito, a menos que sea admin/secretaria
    if (req.user._id.toString() !== userId && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No tienes permisos para ver este carrito" });
    }

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

    // Verificar que el usuario solo agregue a su propio carrito
    if (req.user._id.toString() !== userId && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No puedes agregar productos al carrito de otro usuario" });
    }

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Faltan datos del carrito" });
    }

    // Buscar el último carrito del usuario
    const lastCart = await Cart.findOne({ userId }).sort({ createdAt: -1 });

    // Validar productos y calcular totalAmount
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.title}` });
      }

      totalAmount += product.price * item.quantity;
    }

    // Si no hay carrito o el último está entregado, crear uno nuevo
    if (!lastCart || lastCart.status === "entregado" || lastCart.status === "pagado") {
      const newCart = new Cart({
        userId,
        items,
        paymentMethod: paymentMethod || "efectivo",
        deliveryMethod: deliveryMethod || "retiro",
        shippingAddress: shippingAddress || {
          name: "Usuario Nuevo",
          address: "Sin dirección",
          phone: "0000000000"
        },
        totalAmount,
        status: "inicializado"
      });

      await newCart.save();
      return res.status(201).json(newCart);
    }

    // Si el carrito está pendiente, agregar o actualizar productos
    for (const item of items) {
      const index = lastCart.items.findIndex(i => i.productId.toString() === item.productId);
      if (index !== -1) {
        lastCart.items[index].quantity += item.quantity;
      } else {
        lastCart.items.push(item);
      }
    }

    // Recalcular total
    lastCart.totalAmount += totalAmount;
    await lastCart.save();

    return res.status(200).json(lastCart);
  } catch (err) {
    console.error("Error en addToCart:", err);
    res.status(500).json({ message: err.message });
  }
};

// 👉 Obtener el carrito de un usuario
const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario solo acceda a su propio carrito, a menos que sea admin/secretaria
    if (req.user._id.toString() !== userId && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No tienes permisos para ver este carrito" });
    }

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

    // Verificar que el usuario solo actualice su propio carrito, a menos que sea admin/secretaria
    if (req.user._id.toString() !== cart.userId.toString() && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No tienes permisos para modificar este carrito" });
    }

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

    const cart = await Cart.findById(cartId).populate("items.productId");
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    // Verificar que el usuario solo haga checkout de su propio carrito
    if (req.user._id.toString() !== cart.userId.toString() && !req.user.isAdmin && !req.user.isSecretaria) {
      return res.status(403).json({ message: "No puedes confirmar la compra de otro usuario" });
    }

    // Check if the cart is in a valid state for checkout
    if (["pagado", "preparacion", "entregado", "cancelado"].includes(cart.status)) {
      return res.status(400).json({ message: "Carrito ya procesado" });
    }

    // Validate stock for each product in the cart
    for (const item of cart.items) {
      const product = item.productId; // Populated product
      if (!product) {
        return res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Stock insuficiente para ${product.title}. Disponible: ${product.stock}, solicitado: ${item.quantity}`
        });
      }
    }

    // Update stock for each product
    for (const item of cart.items) {
      const product = item.productId;
      product.stock -= item.quantity; // Decrease stock
      await product.save(); // Save updated product
    }

    // Update cart fields
    cart.paymentMethod = paymentMethod;
    cart.deliveryMethod = deliveryMethod;

    cart.shippingAddress = {
      name: customerInfo?.name || shippingAddress?.name || cart.shippingAddress.name,
      address: customerInfo?.address || shippingAddress?.address || cart.shippingAddress.address,
      phone: customerInfo?.phone || shippingAddress?.phone || cart.shippingAddress.phone,
    };

    if (receiptUrl) cart.receiptUrl = receiptUrl;

    // Set cart status based on payment method
    if (paymentMethod === 'transferencia') {
      cart.status = 'pendiente'; // Needs receipt verification
    } else {
      cart.status = 'pagado'; // Card or cash
    }

    await cart.save();

    return res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error del servidor al procesar checkout", error: err.message });
  }
};

// 👉 Actualizar estado del carrito
const updateCartStatus = async (req, res) => {
  const { cartId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pendiente", "pagado", "preparacion", "cancelado", "entregado"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // 👇 Validación extra: solo permitir preparacion si ya fue pagado o tiene comprobante
    if (status === "preparacion" && !["pagado", "pendiente"].includes(cart.status)) {
      return res.status(400).json({ message: "Solo se puede pasar a preparación si el pedido está pagado o pendiente de comprobante" });
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

// 👉 Rating desde carrito
const addCartProductRating = async (req, res) => {
  const { cartId, productId } = req.params;
  const { stars, comment } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    const product = await Product.findById(productId);

    if (!cart || !product) {
      return res.status(404).json({ message: 'Producto o carrito no encontrado' });
    }

    // 🔒 Validar que el carrito pertenezca al usuario o sea admin
    if (req.user._id.toString() !== cart.userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'No autorizado a calificar este carrito' });
    }

    // 🔒 Solo permitir rating si el carrito fue ENTREGADO
    if (cart.status !== 'entregado') {
      return res.status(400).json({ message: 'Solo puedes calificar productos de carritos entregados' });
    }

    // 🔹 Guardar/Actualizar rating en producto
    await product.addCartRating(cartId, stars, comment);

    // 🔹 Guardar/Actualizar rating en carrito
    const existingIndex = cart.ratings.findIndex(r => r.productId.toString() === productId);
    if (existingIndex !== -1) {
      cart.ratings[existingIndex] = { productId, stars, comment, ratedAt: new Date() };
    } else {
      cart.ratings.push({ productId, stars, comment, ratedAt: new Date() });
    }
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Calificación guardada',
      productUpdate: {
        rating: product.rating,
        numReviews: product.numReviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al calificar', error: error.message });
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
  addCartProductRating
};