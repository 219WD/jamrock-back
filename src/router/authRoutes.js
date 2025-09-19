// router/authRoutes.js
const express = require('express');
const { check } = require('express-validator');
const { requestResetPassword, resetPassword } = require('../controllers/authController');
const expressValidations = require('../middlewares/expressValidations');

const router = express.Router();

router.post(
  "/reset-password-request",
  [
    check('email', "Debe mandar un mail").notEmpty(),
    check('email', "Debe tener formato de mail").isEmail(),
  ],
  expressValidations, // Ahora es una función directamente
  requestResetPassword
);

router.post(
  "/reset-password/:token", 
  [
    check('newPassword', "Debe mandar una nueva contraseña").notEmpty(),
    check('newPassword', "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
  ],
  expressValidations,
  resetPassword
);

module.exports = router;