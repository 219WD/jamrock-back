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
  const { cartId } = req.query; // Opcional: si viene de un carrito específico

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    // Validar rating
    const parsedRating = Number(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'El rating debe estar entre 1 y 5' });
    }

    // Actualizar rating del producto
    const totalRating = product.rating * product.numReviews + parsedRating;
    product.numReviews += 1;
    product.rating = totalRating / product.numReviews;
    await product.save();

    // Si hay un cartId, actualizar también el rating en el carrito
    if (cartId) {
      const cart = await Cart.findById(cartId);
      if (cart) {
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



module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  addProductReview
};
