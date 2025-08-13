const mongoose = require('mongoose');
const { Schema } = mongoose;

const EspecialistaSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: false
  },
  especialidad: {
    type: String,
    required: true
  },
  matricula: {
    type: String,
    required: true,
    unique: true
  },
  reprocann: {
    status: {
      type: String,
      enum: ['inicializado', 'pendiente', 'aprobado', 'cancelado'],
      default: 'inicializado'
    },
    fechaAprobacion: {
      type: Date,
      default: null
    },
    fechaVencimiento: {
      type: Date,
      default: null
    }
  },
  firmaDigital: String, // Ruta o base64
}, {
  timestamps: true
});

module.exports = mongoose.model('Especialista', EspecialistaSchema);
