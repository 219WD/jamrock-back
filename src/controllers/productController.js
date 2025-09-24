const Product = require('../models/Product');

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
};

// Obtener producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
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

// Agregar una calificación (solo rating promedio)
const addProductReview = async (req, res) => {
  const { rating } = req.body;
  const { id: productId } = req.params;
  const { cartId } = req.query; // Opcional: cartId como query parameter

  try {
    // Validar rating
    if (!rating || isNaN(rating)) {
      return res.status(400).json({ success: false, message: 'El rating debe ser un número' });
    }

    const parsedRating = Number(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'El rating debe estar entre 1 y 5' });
    }

    // Buscar el producto
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Actualizar rating del producto
    product.rating = ((product.rating * product.numReviews) + parsedRating) / (product.numReviews + 1);
    product.numReviews += 1;
    await product.save();

    // Si hay cartId, actualizar el rating en el carrito
    if (cartId) {
      try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
          console.warn(`Carrito con ID ${cartId} no encontrado`);
        } else {
          const existingRatingIndex = cart.ratings.findIndex(
            r => r.productId.toString() === productId.toString()
          );

          if (existingRatingIndex !== -1) {
            cart.ratings[existingRatingIndex].stars = parsedRating;
          } else {
            cart.ratings.push({ productId, stars: parsedRating });
          }

          await cart.save();
        }
      } catch (cartError) {
        console.error(`Error al actualizar el carrito ${cartId}:`, cartError);
        // No fallar la solicitud por un error en el carrito
      }
    }

    res.status(200).json({
      success: true,
      message: 'Rating agregado con éxito',
      data: {
        rating: product.rating,
        numReviews: product.numReviews,
      },
    });
  } catch (error) {
    console.error('Error en addProductReview:', error);
    res.status(500).json({ success: false, message: 'Error al agregar rating', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  addProductReview
};