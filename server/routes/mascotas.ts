import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { ObjectId } from "mongodb";

const router = Router();

const mascotaSchema = z.object({ clienteId: z.string(), nombre: z.string(), especie: z.string(), raza: z.string().optional(), edad: z.number().optional(), peso: z.number().optional() });

router.use(requireAuth);

router.get("/", async (req, res) => {
  const db = getDb();
  const items = await db.collection("mascotas").find().toArray();
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const parsed = mascotaSchema.parse(req.body);
    const db = getDb();
    // Check cliente exists
    const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(parsed.clienteId) });
    if (!cliente) return res.status(400).json({ error: "Cliente no existe" });
    // Enforce max 7 mascotas per cliente
    const count = await db.collection("mascotas").countDocuments({ clienteId: parsed.clienteId });
    if (count >= 7) return res.status(400).json({ error: "El cliente ya tiene el máximo de 7 mascotas" });
    const result = await db.collection("mascotas").insertOne({ ...parsed, creadoEn: new Date() });
    res.json({ id: result.insertedId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  await db.collection("mascotas").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  await db.collection("mascotas").deleteOne({ _id: new ObjectId(id) });
  res.json({ ok: true });
});

export default router;
