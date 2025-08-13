const mongoose = require('mongoose');
const { Schema } = mongoose;

const PacienteSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: false
  },
  fullName: {
    type: String,
    required: true
  },
  fechaDeNacimiento: {
    type: Date,
    default: null
  },
  reprocann: {
    status: {
      type: String,
      enum: ['inicializado', 'pendiente', 'aprobado', 'rechazado', 'expirado'],
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
  antecedentes: {
    type: Schema.Types.ObjectId,
    ref: "Antecedentes",
    required: true
  },
  evaluacionMedica: {
    patologia: {
      type: String,
      default: "",
      trim: true
    },
    tratamientoPropuesto: {
      type: String,
      default: "",
      trim: true
    },
    beneficios: {
      type: String,
      default: "",
      trim: true
    },
    especialistaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Especialista',
      required: false
    },
    fechaEvaluacion: {
      type: Date,
      default: null
    }
  },
  historialConsultas: [{
    turnoId: {
      type: Schema.Types.ObjectId,
      ref: 'Turno',
      required: true
    },
    fechaConsulta: {
      type: Date,
      required: true
    },
    especialista: {
      type: String,
      required: true
    },
    motivo: {
      type: String,
      required: true
    },
    diagnostico: {
      type: String,
      default: ""
    },
    tratamiento: {
      type: String,
      default: ""
    },
    observaciones: {
      type: String,
      default: ""
    },
    productosRecetados: [{
      nombre: {
        type: String,
        required: true
      },
      cantidad: {
        type: Number,
        required: true
      },
      dosis: {
        type: String,
        default: ""
      }
    }],
    documentos: [{
      nombre: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      tipo: {
        type: String,
        enum: ['receta', 'estudio', 'informe', 'otro'],
        default: 'receta'
      }
    }]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Paciente', PacienteSchema);

// CODIGO INCOMPLETO

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const PacienteSchema = new Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: false
//   },
//   partnerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Partner',
//     required: false
//   },
//   fullName: {
//     type: String,
//     required: true
//   },
//   fechaDeNacimiento: {
//     type: Date,
//     default: null
//   },
//   reprocann: {
//     status: {
//       type: String,
//       enum: ['inicializado', 'pendiente', 'aprobado', 'rechazado', 'expirado'],
//       default: 'inicializado'
//     },
//     fechaAprobacion: {
//       type: Date,
//       default: null
//     },
//     fechaVencimiento: {
//       type: Date,
//       default: null
//     }
//   },
//   antecedentes: {
//     type: Schema.Types.ObjectId,
//     ref: "Antecedentes",
//     required: true
//   },
//   evaluacionMedica: {
//     patologia: {
//       type: String,
//       default: "",
//       trim: true
//     },
//     tratamientoPropuesto: {
//       type: String,
//       default: "",
//       trim: true
//     },
//     beneficios: {
//       type: String,
//       default: "",
//       trim: true
//     },
//     especialistaId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Especialista',
//       required: false
//     },
//     fechaEvaluacion: {
//       type: Date,
//       default: null
//     }
//   }
// }, {
//   timestamps: true
// });


// module.exports = mongoose.model('Paciente', PacienteSchema);


// CODIGO COMPLETO PERO ROTO

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const PacienteSchema = new Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: false
//   },
//   partnerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Partner',
//     required: false
//   },
//   fullName: {
//     type: String,
//     required: true
//   },
//   fechaDeNacimiento: {
//     type: Date,
//     default: null
//   },
//   reprocann: {
//     status: {
//       type: String,
//       enum: ['inicializado', 'pendiente', 'aprobado', 'rechazado', 'expirado'],
//       default: 'inicializado'
//     },
//     fechaAprobacion: {
//       type: Date,
//       default: null
//     },
//     fechaVencimiento: {
//       type: Date,
//       default: null
//     }
//   },
//   antecedentes: {
//     type: Schema.Types.ObjectId,
//     ref: "Antecedentes",
//     required: true
//   },
//   evaluacionMedica: {
//     patologia: {
//       type: String,
//       default: "",
//       trim: true
//     },
//     tratamientoPropuesto: {
//       type: String,
//       default: "",
//       trim: true
//     },
//     beneficios: {
//       type: String,
//       default: "",
//       trim: true
//     },
//     especialistaId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Especialista',
//       required: false
//     },
//     fechaEvaluacion: {
//       type: Date,
//       default: null
//     }
//   },
//   historialConsultas: [{
//     turnoId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Turno',
//       required: true
//     },
//     fechaConsulta: {
//       type: Date,
//       required: true
//     },
//     especialista: {
//       type: String,
//       required: true
//     },
//     motivo: {
//       type: String,
//       required: true
//     },
//     diagnostico: {
//       type: String,
//       default: ""
//     },
//     tratamiento: {
//       type: String,
//       default: ""
//     },
//     observaciones: {
//       type: String,
//       default: ""
//     },
//     productosRecetados: [{
//       nombre: {
//         type: String,
//         required: true
//       },
//       cantidad: {
//         type: Number,
//         required: true
//       },
//       dosis: {
//         type: String,
//         default: ""
//       }
//     }],
//     documentos: [{
//       nombre: {
//         type: String,
//         required: true
//       },
//       url: {
//         type: String,
//         required: true
//       },
//       tipo: {
//         type: String,
//         enum: ['receta', 'estudio', 'informe', 'otro'],
//         default: 'receta'
//       }
//     }]
//   }]
// }, {
//   timestamps: true
// });

// // Middleware para popular automáticamente los turnos
// PacienteSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'historialConsultas.turnoId',
//     select: 'fecha motivo notas consulta'
//   }).populate({
//     path: 'evaluacionMedica.especialistaId',
//     select: 'especialidad matricula',
//     populate: {
//       path: 'userId',
//       select: 'name email'
//     }
//   });
//   next();
// });

// module.exports = mongoose.model('Paciente', PacienteSchema);