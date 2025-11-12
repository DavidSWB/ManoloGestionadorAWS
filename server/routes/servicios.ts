import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { ObjectId } from "mongodb";

const router = Router();

const servicioSchema = z.object({ nombre: z.string(), descripcion: z.string().optional(), tarifa: z.number(), duracion: z.string().optional(), activo: z.boolean().optional() });

router.use(requireAuth);

router.get("/", async (req, res) => {
  const db = getDb();
  const items = await db.collection("servicios").find().toArray();
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const parsed = servicioSchema.parse(req.body);
    const db = getDb();
    const result = await db.collection("servicios").insertOne({ ...parsed, creadoEn: new Date() });
    res.json({ id: result.insertedId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  await db.collection("servicios").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  await db.collection("servicios").deleteOne({ _id: new ObjectId(id) });
  res.json({ ok: true });
});

export default router;
