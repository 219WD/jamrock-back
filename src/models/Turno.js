const mongoose = require('mongoose');
const { Schema } = mongoose;

const TurnoSchema = new Schema({
  pacienteId: {
    type: Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  especialistaId: {
    type: Schema.Types.ObjectId,
    ref: 'Especialista',
    required: true
  },
  userId: { // Usuario que creó el turno (puede ser admin, médico o el mismo paciente)
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        // Solo validar fecha futura para turnos pendientes
        return this.estado !== 'pendiente' || value > new Date();
      },
      message: 'La fecha debe ser futura para turnos pendientes'
    }
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmado', 'cancelado', 'completado'],
    default: 'pendiente'
  },
  motivo: {
    type: String,
    required: true,
    trim: true
  },
  notas: {
    type: String,
    trim: true
  },
  reprocannRelacionado: {
    type: Boolean,
    default: false
  },
  evaluacionMedica: {
    type: Schema.Types.ObjectId,
    ref: 'EvaluacionMedica'
  },
  consulta: {
    productos: [{
      productoId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      cantidad: {
        type: Number,
        default: 1,
        min: 1
      },
      precioUnitario: Number,
      nombreProducto: String // Para mantener histórico
    }],
    total: {
      type: Number,
      default: 0
    },
    formaPago: {
      type: String,
      enum: ['efectivo', 'tarjeta', 'transferencia', 'mercadoPago', 'otro'],
      default: 'efectivo'
    },
    precioConsulta: {
      type: Number,
      required: true,
      default: 0
    },
    pagado: {
      type: Boolean,
      default: false
    },
    notasConsulta: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Populate automático mejorado
TurnoSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'pacienteId',
    select: 'fullName fechaDeNacimiento'
  }).populate({
    path: 'especialistaId',
    select: 'especialidad matricula',
    populate: {
      path: 'userId',
      select: 'name email'
    }
  }).populate({
    path: 'userId',
    select: 'name email'
  });
  next();
});

module.exports = mongoose.model('Turno', TurnoSchema);