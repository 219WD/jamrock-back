const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'transferencia'],
    default: 'efectivo'
  },
  deliveryMethod: {
    type: String,
    enum: ['retiro', 'envio'],
    default: 'retiro'
  },
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['inicializado', 'pendiente', 'pagado', 'preparacion', 'cancelado', 'entregado'],
    default: 'inicializado'
  },
  receiptUrl: {
    type: String, // URL de Cloudinary o donde subas el comprobante
    required: false,
  },
  ratings: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      stars: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      comment: { type: String },
      ratedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);
