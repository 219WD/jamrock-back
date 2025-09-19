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
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
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
  // NUEVOS CAMPOS AGREGADOS EN EL NIVEL PRINCIPAL
  diagnostico: {
    type: String,
    trim: true
  },
  tratamiento: {
    type: String,
    trim: true
  },
  observaciones: {
    type: String,
    trim: true
  },
  documentosAdjuntos: [{
    nombre: String,
    tipo: {
      type: String,
      enum: ['receta', 'estudio', 'informe', 'otro'],
      default: 'receta'
    },
    url: String,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
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
      nombreProducto: String
    }],
    total: {
      type: Number,
      default: 0
    },
    // NUEVO CAMPO AGREGADO DENTRO DE CONSULTA
    descuento: {
      type: Number,
      default: 0,
      min: 0
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
    notasConsulta: String,
    // MANTENER LOS CAMPOS EXISTENTES QUE YA TENÍAS EN CONSULTA
    diagnostico: {
      type: String,
      trim: true
    },
    tratamiento: {
      type: String,
      trim: true
    },
    observaciones: {
      type: String,
      trim: true
    },
    fechaConsulta: {
      type: Date
    },
    comprobantePago: {  // ✅ NUEVO CAMPO PARA COMPROBANTE
      url: String,
      nombreArchivo: String,
      fechaSubida: {
        type: Date,
        default: Date.now
      }
    }
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