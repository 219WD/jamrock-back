const User = require('../models/User');

// GET todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
      .populate('partnerData');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// GET un usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// GET buscar usuarios por nombre o email
const searchUsers = async (req, res) => {
  const { q } = req.query;

  try {
    // Búsqueda por nombre, email
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ]
    }).select('-password');

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar usuarios', details: err.message });
  }
};


// PATCH cambiar isPartner (toggle)
const updatePartnerStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Alternar el valor de isPartner
    user.isPartner = !user.isPartner;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora es ${user.isPartner ? '' : 'no '}partner.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin
        // Agrega otros campos que quieras devolver
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar isPartner',
      details: err.message
    });
  }
};


// PATCH cambiar isAdmin
const updateAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Alternar el valor de isAdmin
    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json({
      message: `El usuario ahora es ${user.isAdmin ? '' : 'no '}admin.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin
        // Agrega otros campos que quieras devolver
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar isAdmin',
      details: err.message
    });
  }
};

// PATCH cambiar isPending
const updatePendingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Alternar el valor de isAdmin
    user.isPending = !user.isPending;
    await user.save();

    res.status(200).json({
      message: `El usuario esta ${user.isAdmin ? '' : 'no '}pendiente.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPartner: user.isPartner,
        isAdmin: user.isAdmin,
        isPending: user.isPending
        // Agrega otros campos que quieras devolver
      }
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error al actualizar isPending',
      details: err.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateAdminStatus,
  updatePartnerStatus,
  updatePendingStatus,
  searchUsers,
};
