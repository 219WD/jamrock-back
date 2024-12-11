const { Router } = require("express");
const mercadopago = require("mercadopago");
const dotenv = require("dotenv");
dotenv.config();

const Mercado_Pago = Router();

mercadopago.configure({
  access_token: process.env.ACCESS_TOKEN || "",
});

Mercado_Pago.post("/", async (req, res) => {
  const items = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // Crear preferencia en Mercado Pago
    const preference = {
      items: items.map((item) => ({
        title: item.title,
        description: item.description,
        picture_url: item.image,
        unit_price: parseFloat(item.price),
        quantity: parseInt(item.quantity, 10),
        currency_id: "ARS",
      })),
      back_urls: {
        success: process.env.SUCCESS_URL || "http://localhost:5173/",
        failure: process.env.FAILURE_URL || "http://localhost:3000/fallo",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error.message, error.stack);
    return res.status(500).json({ error: "Hubo un error al procesar la solicitud" });
  }
});


module.exports = Mercado_Pago;
