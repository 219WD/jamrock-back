const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  description: String,
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 🔹 MÉTODOS PARA MANEJO DE STOCK (SOLO ESTO SE AGREGA)
ProductSchema.methods = {
  // Verificar si hay stock suficiente
  hasEnoughStock: function(quantity) {
    return this.stock >= quantity;
  },
  
  // Reducir stock de forma segura
  reduceStock: async function(quantity) {
    if (!this.hasEnoughStock(quantity)) {
      throw new Error(`Stock insuficiente. Disponible: ${this.stock}, Solicitado: ${quantity}`);
    }
    this.stock -= quantity;
    return await this.save();
  },
  
  // Aumentar stock
  increaseStock: async function(quantity) {
    this.stock += quantity;
    return await this.save();
  }
};

// 🔹 MIDDLEWARE: Si el stock llega a 0, desactivar automáticamente
ProductSchema.pre('save', function(next) {
  if (this.stock === 0 && this.isActive) {
    this.isActive = false;
  } else if (this.stock > 0 && !this.isActive) {
    this.isActive = true;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);