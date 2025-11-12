import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { ObjectId } from 'mongodb';

const router = Router();

const clienteSchema = z.object({ nombre: z.string(), direccion: z.string().optional(), correo: z.string().email(), telefono: z.string() });

router.use(requireAuth);

router.get("/", async (req, res) => {
  const db = getDb();
  const items = await db.collection("clientes").find().toArray();
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const parsed = clienteSchema.parse(req.body);
    const db = getDb();
    const result = await db.collection("clientes").insertOne({ ...parsed, creadoEn: new Date() });
    res.json({ id: result.insertedId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  await db.collection("clientes").updateOne({ _id: new ObjectId(id) }, { $set: req.body });
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const result = await db.collection('clientes').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando cliente:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
