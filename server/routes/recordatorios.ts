import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { sendMail } from "../utils/mail";
import { ObjectId } from "mongodb";

const router = Router();

const recSchema = z.object({ 
  clienteId: z.string(), 
  medio: z.enum(["WhatsApp", "Email"]), 
  fecha: z.string().optional(), 
  asunto: z.string().optional(),
  mensaje: z.string().optional()
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const db = getDb();
  const items = await db.collection("recordatorios").find().toArray();
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    console.log("POST /api/recordatorios body:", req.body);

    // validar con zod y devolver errores legibles
    const parsed = recSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Payload inválido", details: parsed.error.errors });
    }

    const db = getDb();
    const { clienteId, medio, fecha, asunto, mensaje } = parsed.data;
    const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(clienteId) });
    if (!cliente) {
      return res.status(400).json({ message: "Cliente no encontrado" });
    }

    const now = new Date().toISOString();
    const doc = { 
      clienteId, 
      medio, 
      fecha: fecha || now, 
      estado: "pendiente", 
      asunto: asunto || "Recordatorio de Manolo's Gestión",
      mensaje: mensaje || "Hola, este es un recordatorio"
    };
    const result = await db.collection("recordatorios").insertOne({ ...doc, creadoEn: new Date() });

    if (medio === "Email") {
      try {
        await sendMail(
          cliente.correo || "", 
          doc.asunto,
          doc.mensaje
        );
        await db.collection("recordatorios").updateOne({ _id: result.insertedId }, { $set: { estado: "enviado" } });
      } catch (e) {
        await db.collection("recordatorios").updateOne({ _id: result.insertedId }, { $set: { estado: "fallo" } });
      }
    }

    res.status(201).json({ id: result.insertedId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || "Error interno" });
  }
});

export default router;
