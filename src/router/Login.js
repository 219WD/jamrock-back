const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require("dotenv").config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // Guardalo en .env

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            {
                id: user._id, isAdmin: user.isAdmin, isPartner: user.isPartner,
                isPaciente: user.isPaciente,
                isMedico: user.isMedico,
                isSecretaria: user.isSecretaria
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                isPartner: user.isPartner,
                isPaciente: user.isPaciente,
                isMedico: user.isMedico,
                isSecretaria: user.isSecretaria,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
});

module.exports = router;