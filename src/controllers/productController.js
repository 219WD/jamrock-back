const Product = require('../models/Product');

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('cartRatings.cartId', 'userId status');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('cartRatings.cartId', 'userId status');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error });
  }
};

// Crear nuevo producto
const createProduct = async (req, res) => {
  try {
    const { title, image, description, stock, price, category } = req.body;

    const newProduct = new Product({
      title,
      image,
      description,
      stock,
      price,
      category
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error });
  }
};

// Actualizar producto
const updateProduct = async (req, res) => {
  try {
    const { title, image, description, stock, price, category } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { title, image, description, stock, price, category },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
};

// Eliminar producto
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
};

// Toggle activo/inactivo del producto
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      message: `El producto ahora está ${product.isActive ? 'activo' : 'inactivo'}.`,
      product
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al cambiar el estado del producto',
      error: error.message
    });
  }
};

// Agregar una calificación
const addProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { id: productId } = req.params;
  const { cartId } = req.query;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // Validar rating
    const parsedRating = Number(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'El rating debe estar entre 1 y 5' });
    }

    // ✅ Usar el método del modelo para mantener consistencia
    await product.addCartRating(cartId || new mongoose.Types.ObjectId(), parsedRating, comment);

    // Si hay cartId, actualizar también en carrito
    if (cartId) {
      const cart = await Cart.findById(cartId);
      if (cart) {
        const existingIndex = cart.ratings.findIndex(r => r.productId.toString() === productId);
        if (existingIndex !== -1) {
          cart.ratings[existingIndex] = { productId, stars: parsedRating, comment, ratedAt: new Date() };
        } else {
          cart.ratings.push({ productId, stars: parsedRating, comment, ratedAt: new Date() });
        }
        await cart.save();
      }
    }

    res.status(200).json({
      message: 'Rating agregado con éxito',
      rating: product.rating,
      numReviews: product.numReviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar rating', error });
  }
};

// Agregar temporalmente en productController.js para debug
const debugProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    
    res.json({
      _id: product._id,
      title: product.title,
      rating: product.rating,
      numReviews: product.numReviews,
      lastUpdated: product.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  addProductReview,
  debugProduct
};