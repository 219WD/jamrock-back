const Turno = require('../models/Turno');
const Paciente = require('../models/Paciente');
const Especialista = require('../models/Especialista');
const Product = require('../models/Product');

// En controllers/TurnoController.js
const createTurno = async (req, res) => {
  try {
    const { especialistaId, fecha, motivo, notas, reprocannRelacionado } = req.body;

    // El middleware isPacienteWithProfile ya verificó que existe req.paciente
    const pacienteId = req.paciente._id;

    // Validar especialista
    const especialista = await Especialista.findById(especialistaId);
    if (!especialista) {
      return res.status(404).json({
        success: false,
        error: 'Especialista no encontrado'
      });
    }

    // Validar fecha futura
    const fechaTurno = new Date(fecha);
    if (fechaTurno <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'La fecha del turno debe ser futura'
      });
    }

    // Verificar disponibilidad del especialista
    const turnoExistente = await Turno.findOne({
      especialistaId,
      fecha: fechaTurno,
      estado: { $in: ['pendiente', 'confirmado'] }
    });

    if (turnoExistente) {
      return res.status(409).json({
        success: false,
        error: 'El especialista ya tiene un turno asignado en ese horario'
      });
    }

    const nuevoTurno = new Turno({
      pacienteId,
      especialistaId,
      userId: req.user._id,
      fecha: fechaTurno,
      motivo,
      notas: notas || '',
      reprocannRelacionado: reprocannRelacionado || false,
      estado: 'pendiente'
    });

    const turnoGuardado = await nuevoTurno.save();

    res.status(201).json({
      success: true,
      data: turnoGuardado,
      message: 'Turno creado exitosamente'
    });
  } catch (err) {
    console.error('Error en createTurno:', err);
    res.status(400).json({
      success: false,
      error: 'Error al crear turno',
      details: err.message
    });
  }
};

// Nuevo controlador para creación por admin/médico
const createTurnoAdmin = async (req, res) => {
  try {
    const { pacienteId, especialistaId, fecha, motivo, notas, reprocannRelacionado } = req.body;

    // Validar que el paciente existe
    const paciente = await Paciente.findById(pacienteId);
    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    // Resto de validaciones igual que en createTurno...
    const fechaTurno = new Date(fecha);
    if (fechaTurno <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'La fecha del turno debe ser futura'
      });
    }

    const especialista = await Especialista.findById(especialistaId);
    if (!especialista) {
      return res.status(404).json({
        success: false,
        error: 'Especialista no encontrado'
      });
    }

    // Verificar disponibilidad
    const turnoExistente = await Turno.findOne({
      especialistaId,
      fecha: fechaTurno,
      estado: { $in: ['pendiente', 'confirmado'] }
    });

    if (turnoExistente) {
      return res.status(409).json({
        success: false,
        error: 'El especialista ya tiene un turno asignado en ese horario'
      });
    }

    const nuevoTurno = new Turno({
      pacienteId,
      especialistaId,
      userId: req.user._id, // Quién crea el turno
      fecha: fechaTurno,
      motivo,
      notas: notas || '',
      reprocannRelacionado: reprocannRelacionado || false,
      estado: 'pendiente'
    });

    const turnoGuardado = await nuevoTurno.save();

    res.status(201).json({
      success: true,
      data: turnoGuardado,
      message: 'Turno creado exitosamente'
    });
  } catch (err) {
    console.error('Error en createTurnoAdmin:', err);
    res.status(400).json({
      success: false,
      error: 'Error al crear turno',
      details: err.message
    });
  }
};

// Obtener todos los turnos
const getAllTurnos = async (req, res) => {
  try {
    const filtros = {};

    if (req.user.isPaciente) {
      const paciente = await Paciente.findOne({ userId: req.user._id });
      if (paciente) filtros.pacienteId = paciente._id;
    }

    const turnos = await Turno.find(filtros)
      .populate({
        path: 'pacienteId',
        select: 'fullName fechaDeNacimiento'
      })
      .populate({
        path: 'especialistaId',
        select: 'especialidad matricula',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ fecha: 1 });

    res.status(200).json({
      success: true,
      count: turnos.length,
      data: turnos
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener turnos',
      details: err.message
    });
  }
};

// Obtener turno por ID
const getTurnoById = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id)
      .populate('pacienteId', 'nombre apellido dni email telefono')
      .populate('especialistaId', 'nombre especialidad');

    if (!turno) {
      return res.status(404).json({ success: false, error: 'Turno no encontrado' });
    }

    // Si es paciente, validar que sea suyo
    if (req.user.isPaciente) {
      const paciente = await Paciente.findOne({ userId: req.user._id });
      if (!paciente || !turno.pacienteId._id.equals(paciente._id)) {
        return res.status(403).json({ error: 'No autorizado' });
      }
    }

    res.status(200).json({ success: true, data: turno });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener turno', details: err.message });
  }
};

// Obtener los datos del paciente actual autenticado
const getMisDatos = async (req, res) => {
  try {
    console.log("Buscando paciente para user:", req.user._id);
    const paciente = await Paciente.findOne({ userId: req.user._id });

    if (!paciente) {
      console.log("Paciente no encontrado");
      return res.status(404).json({
        success: false,
        error: "Paciente no encontrado para este usuario"
      });
    }

    console.log("Buscando turnos para paciente:", paciente._id);
    const turnos = await Turno.find({ pacienteId: paciente._id })
      .populate({
        path: 'especialistaId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .populate('pacienteId')
      .sort({ fecha: -1 });

    console.log(`Turnos encontrados: ${turnos.length}`);

    // Asegúrate de devolver el formato correcto
    res.status(200).json({
      success: true,
      data: turnos
    });
  } catch (err) {
    console.error("Error en getMisDatos:", err);
    res.status(500).json({
      success: false,
      error: "Error al buscar turnos",
      details: err.message
    });
  }
};

// Actualizar turno como médico
const updateTurnoPorMedico = async (req, res) => {
  try {
    const {
      estado,
      notas,
      reprocannRelacionado,
      fecha,
      motivo,
      precioConsulta,
      diagnostico,        // NUEVO - nivel principal
      tratamiento,        // NUEVO - nivel principal
      observaciones,      // NUEVO - nivel principal
      documentosAdjuntos, // NUEVO
      descuento           // NUEVO - dentro de consulta
    } = req.body;

    const medicoId = req.user._id;

    const turno = await Turno.findById(req.params.id)
      .populate('especialistaId', 'userId');

    if (!turno) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // Verificar que el médico es el asignado al turno
    if (!turno.especialistaId.userId.equals(medicoId)) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado: Solo el médico asignado puede modificar este turno'
      });
    }

    // Campos actualizables del nivel principal
    if (estado) turno.estado = estado;
    if (notas !== undefined) turno.notas = notas;
    if (reprocannRelacionado !== undefined) turno.reprocannRelacionado = reprocannRelacionado;
    if (fecha) turno.fecha = new Date(fecha);
    if (motivo) turno.motivo = motivo;

    // NUEVOS CAMPOS EN NIVEL PRINCIPAL
    if (diagnostico !== undefined) turno.diagnostico = diagnostico;
    if (tratamiento !== undefined) turno.tratamiento = tratamiento;
    if (observaciones !== undefined) turno.observaciones = observaciones;
    if (documentosAdjuntos !== undefined) turno.documentosAdjuntos = documentosAdjuntos;

    // Actualizar datos de consulta
    if (!turno.consulta) {
      turno.consulta = {};
    }

    if (precioConsulta !== undefined) {
      turno.consulta.precioConsulta = precioConsulta;
    }

    // Mantener los campos existentes dentro de consulta (por compatibilidad)
    if (req.body.consultaDiagnostico !== undefined) {
      turno.consulta.diagnostico = req.body.consultaDiagnostico;
    }

    if (req.body.consultaTratamiento !== undefined) {
      turno.consulta.tratamiento = req.body.consultaTratamiento;
    }

    if (req.body.consultaObservaciones !== undefined) {
      turno.consulta.observaciones = req.body.consultaObservaciones;
    }

    // NUEVO CAMPO DESCUENTO DENTRO DE CONSULTA
    if (descuento !== undefined) {
      turno.consulta.descuento = descuento;
    }

    // Si se está completando el turno, registrar fecha de consulta
    if (estado === 'completado') {
      turno.consulta.fechaConsulta = new Date();
    }

    const actualizado = await turno.save();

    res.status(200).json({
      success: true,
      data: actualizado
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar turno',
      details: err.message
    });
  }
};

// Actualizar turno por secretaria
const updateTurnoPorSecretaria = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validar que la secretaria solo pueda modificar ciertos campos
    const allowedUpdates = ['fecha', 'motivo', 'notas', 'estado', 'reprocannRelacionado'];
    const isValidUpdate = Object.keys(updates).every(update =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: 'Actualización no permitida' });
    }

    const turno = await Turno.findByIdAndUpdate(id, updates, { new: true })
      .populate('pacienteId')
      .populate('especialistaId.userId');

    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.json(turno);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar turno como paciente
const updateTurnoPorPaciente = async (req, res) => {
  try {
    const { fecha, motivo } = req.body;

    const turno = await Turno.findById(req.params.id);
    if (!turno) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // El middleware ya verificó que req.paciente existe
    if (!turno.pacienteId.equals(req.paciente._id)) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado: Este turno no te pertenece'
      });
    }

    // Validar que solo se puedan modificar turnos pendientes
    if (turno.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden modificar turnos en estado "pendiente"'
      });
    }

    // Validar fecha futura si se modifica
    if (fecha) {
      const nuevaFecha = new Date(fecha);
      if (nuevaFecha <= new Date()) {
        return res.status(400).json({
          success: false,
          error: 'La nueva fecha del turno debe ser futura'
        });
      }
      turno.fecha = nuevaFecha;
    }

    if (motivo) turno.motivo = motivo;

    const actualizado = await turno.save();

    res.status(200).json({
      success: true,
      data: actualizado,
      message: 'Turno actualizado exitosamente'
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Error al actualizar turno',
      details: err.message
    });
  }
};

// Eliminar turno (admin)
const deleteTurno = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id);
    if (!turno) return res.status(404).json({ success: false, error: 'Turno no encontrado' });

    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await turno.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al eliminar turno', details: err.message });
  }
};

// En controllers/TurnoController.js
const cancelarTurnoPorPaciente = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id)
      .populate('pacienteId', 'userId');

    if (!turno) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // Buscar paciente asociado al usuario
    const paciente = await Paciente.findOne({ userId: req.user._id });

    if (!paciente) {
      return res.status(403).json({
        success: false,
        error: 'No tienes un perfil de paciente completo'
      });
    }

    // Verificar que el turno pertenece al paciente
    if (!turno.pacienteId._id.equals(paciente._id)) {
      return res.status(403).json({
        success: false,
        error: 'No autorizado: Este turno no te pertenece'
      });
    }

    // Solo permitir cancelar turnos pendientes o confirmados
    if (!['pendiente', 'confirmado'].includes(turno.estado)) {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden cancelar turnos pendientes o confirmados'
      });
    }

    turno.estado = "cancelado";
    const actualizado = await turno.save();

    res.status(200).json({
      success: true,
      data: actualizado,
      message: 'Turno cancelado exitosamente'
    });
  } catch (err) {
    console.error('Error en cancelarTurnoPorPaciente:', err);
    res.status(400).json({
      success: false,
      error: 'Error al cancelar turno',
      details: err.message
    });
  }
};

// Agregar productos a un turno (consultorio)
const agregarProductosATurno = async (req, res) => {
  try {
    console.log("🔄 BACKEND: agregarProductosATurno INICIADO");
    const { productos, formaPago, notasConsulta, precioConsulta, descuento = 0, reemplazarProductos = true } = req.body;
    const turnoId = req.params.id;

    console.log("📦 Productos recibidos:", productos);
    console.log("🆔 Turno ID:", turnoId);

    // Validar que el turno existe
    const turno = await Turno.findById(turnoId);
    if (!turno) {
      console.log("❌ Turno no encontrado");
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    console.log("✅ Turno encontrado");

    // Validar productos
    if (!productos || !Array.isArray(productos)) {
      console.log("❌ Lista de productos inválida");
      return res.status(400).json({
        success: false,
        error: 'Lista de productos inválida'
      });
    }

    let subtotal = precioConsulta || turno.consulta?.precioConsulta || 0;
    const productosProcesados = [];

    // Solo procesar productos si hay productos en el array
    if (productos.length > 0) {
      console.log("🔍 Verificando stock de productos...");
      
      // 🔹 PRIMERA PASADA: Verificar stock de todos los productos ANTES de actualizar
      const productosVerificados = [];

      for (const item of productos) {
        console.log(`🔍 Verificando producto: ${item.productoId}, cantidad: ${item.cantidad}`);
        
        const producto = await Product.findById(item.productoId);
        if (!producto) {
          console.log(`❌ Producto no encontrado: ${item.productoId}`);
          return res.status(404).json({
            success: false,
            error: `Producto no encontrado: ${item.productoId}`
          });
        }

        console.log(`📊 Producto encontrado: ${producto.title}, stock actual: ${producto.stock}`);

        // Validar stock disponible
        if (producto.stock < item.cantidad) {
          console.log(`❌ Stock insuficiente: ${producto.title}. Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`);
          return res.status(400).json({
            success: false,
            error: `Stock insuficiente para ${producto.title}. Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
          });
        }

        productosVerificados.push({
          producto,
          cantidad: item.cantidad,
          dosis: item.dosis || ''
        });
      }

      console.log("✅ Todos los productos tienen stock suficiente");

      // 🔹 SEGUNDA PASADA: Actualizar stock usando el MÉTODO del modelo
      for (const { producto, cantidad, dosis } of productosVerificados) {
        console.log(`🔄 Actualizando stock de ${producto.title}: ${producto.stock} -> ${producto.stock - cantidad}`);
        
        // ✅ USAR EL MÉTODO reduceStock EN LUGAR DE MANIPULAR DIRECTAMENTE
        await producto.reduceStock(cantidad);

        // Verificar stock después de la actualización
        const productoActualizado = await Product.findById(producto._id);
        console.log(`✅ Stock actualizado: ${productoActualizado.stock}`);

        // Calcular subtotal
        subtotal += producto.price * cantidad;

        // Agregar a productos procesados
        productosProcesados.push({
          productoId: producto._id,
          cantidad: cantidad,
          precioUnitario: producto.price,
          nombreProducto: producto.title,
          dosis: dosis
        });
      }
    }

    console.log("📊 Cálculo de totales...");
    
    // Validar y aplicar descuento
    if (descuento < 0 || descuento > subtotal) {
      console.log("❌ Descuento inválido");
      return res.status(400).json({
        success: false,
        error: 'El descuento debe ser un valor positivo no mayor al subtotal'
      });
    }

    const total = Math.max(0, subtotal - descuento);
    console.log(`💰 Subtotal: ${subtotal}, Descuento: ${descuento}, Total: ${total}`);

    // Decidir si reemplazar o concatenar productos
    let nuevosProductos;
    if (reemplazarProductos) {
      nuevosProductos = productosProcesados;
      console.log("🔄 Reemplazando productos existentes");
    } else {
      nuevosProductos = [...(turno.consulta?.productos || []), ...productosProcesados];
      console.log("➕ Concatenando productos a los existentes");
    }

    // Actualizar turno con los productos
    turno.consulta = {
      ...turno.consulta,
      productos: nuevosProductos,
      subtotal: subtotal,
      descuento: descuento,
      total: total,
      precioConsulta: precioConsulta || turno.consulta?.precioConsulta || 0,
      formaPago: formaPago || turno.consulta?.formaPago || 'efectivo',
      pagado: turno.consulta?.pagado || false,
      notasConsulta: notasConsulta || turno.consulta?.notasConsulta || ''
    };

    console.log("💾 Guardando turno actualizado...");
    const turnoActualizado = await turno.save();
    console.log("✅ Turno guardado exitosamente");

    res.status(200).json({
      success: true,
      data: turnoActualizado,
      message: reemplazarProductos ? 
        'Productos actualizados y stock actualizado correctamente' : 
        'Productos agregados y stock actualizado correctamente',
      productosActualizados: productosProcesados
    });

    console.log("🎉 BACKEND: agregarProductosATurno COMPLETADO EXITOSAMENTE");

  } catch (err) {
    console.error('❌ BACKEND: Error en agregarProductosATurno:', err);
    
    // 🔥 RESTAURAR STOCK EN CASO DE ERROR usando increaseStock
    if (productos && productos.length > 0) {
      console.log('🔄 Restaurando stock debido a error...');
      for (const item of productos) {
        try {
          const producto = await Product.findById(item.productoId);
          if (producto) {
            console.log(`🔄 Restaurando ${item.cantidad} unidades a ${producto.title}`);
            // ✅ USAR increaseStock EN LUGAR DE MANIPULAR DIRECTAMENTE
            await producto.increaseStock(item.cantidad);
          }
        } catch (restoreError) {
          console.error('❌ Error restaurando stock:', restoreError);
        }
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Error al procesar los productos',
      details: err.message
    });
  }
};

// Marcar consulta como pagada (para caja)
const marcarComoPagado = async (req, res) => {
  try {
    const turnoId = req.params.id;
    const { comprobanteUrl, nombreComprobante } = req.body;

    const turno = await Turno.findById(turnoId);
    if (!turno) {
      return res.status(404).json({
        success: false,
        error: 'Turno no encontrado'
      });
    }

    // ✅ ELIMINAR esta validación que impide turnos sin productos
    // if (!turno.consulta || turno.consulta.productos.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     error: 'El turno no tiene productos asociados'
    //   });
    // }

    // ✅ PERMITIR turnos sin productos pero con precio de consulta
    const tieneProductos = turno.consulta?.productos?.length > 0;
    const tienePrecioConsulta = turno.consulta?.precioConsulta > 0;
    
    if (!tieneProductos && !tienePrecioConsulta) {
      return res.status(400).json({
        success: false,
        error: 'El turno no tiene productos ni precio de consulta asociado'
      });
    }

    // ✅ Actualizar con datos del comprobante
    turno.consulta.pagado = true;
    if (comprobanteUrl) {
      turno.consulta.comprobantePago = {
        url: comprobanteUrl,
        nombreArchivo: nombreComprobante || 'Comprobante de pago',
        fechaSubida: new Date()
      };
    }

    const turnoActualizado = await turno.save();

    res.status(200).json({
      success: true,
      data: turnoActualizado,
      message: 'Turno marcado como pagado exitosamente'
    });
  } catch (err) {
    console.error('Error en marcarComoPagado:', err);
    res.status(400).json({
      success: false,
      error: 'Error al marcar turno como pagado',
      details: err.message
    });
  }
};

// Obtener turnos con productos para caja
const getTurnosParaCaja = async (req, res) => {
  try {
    const { pagado } = req.query; // Puede ser true/false/undefined

    const filtro = {
      'consulta.productos.0': { $exists: true } // Solo turnos con productos
    };

    if (pagado !== undefined) {
      filtro['consulta.pagado'] = pagado === 'true';
    }

    const turnos = await Turno.find(filtro)
      .populate({
        path: 'pacienteId',
        select: 'fullName dni'
      })
      .populate({
        path: 'especialistaId',
        select: 'especialidad',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: turnos.length,
      data: turnos
    });
  } catch (err) {
    console.error('Error en getTurnosParaCaja:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener turnos para caja',
      details: err.message
    });
  }
};

module.exports = {
  createTurno,
  createTurnoAdmin,
  getAllTurnos,
  getTurnoById,
  getMisDatos,
  updateTurnoPorMedico,
  updateTurnoPorPaciente,
  updateTurnoPorSecretaria,
  deleteTurno,
  cancelarTurnoPorPaciente,
  agregarProductosATurno,
  marcarComoPagado,
  getTurnosParaCaja
};