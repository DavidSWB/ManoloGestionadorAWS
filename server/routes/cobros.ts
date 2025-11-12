import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { invoicePdfBuffer } from "../utils/pdf";
import { ObjectId } from "mongodb";

const router = Router();

const cobroSchema = z.object({ clienteId: z.string(), servicioId: z.string(), fecha: z.string().optional(), cantidad: z.number().optional().default(1), montoUnitario: z.number(), estado: z.enum(["pendiente", "pagado", "vencido"]).optional().default("pendiente") });

router.use(requireAuth);

router.get("/", async (req, res) => {
  const db = getDb();
  const items = await db.collection("cobros").find().toArray();
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const parsed = cobroSchema.parse(req.body);
    const db = getDb();
    const result = await db.collection("cobros").insertOne({ ...parsed, fecha: parsed.fecha || new Date().toISOString(), creadoEn: new Date() });
    res.json({ id: result.insertedId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id/estado", async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const estado = req.body.estado;
  await db.collection("cobros").updateOne({ _id: new ObjectId(id) }, { $set: { estado } });
  res.json({ ok: true });
});

router.get("/:id/comprobante", async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const c = await db.collection("cobros").findOne({ _id: new ObjectId(id) });
  if (!c) return res.status(404).json({ error: "No encontrado" });
  const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(c.clienteId) });
  const servicio = await db.collection("servicios").findOne({ _id: new ObjectId(c.servicioId) });
  const total = c.montoUnitario * (c.cantidad || 1);
  const buffer = await invoicePdfBuffer({ cliente: cliente?.nombre || "-", servicio: servicio?.nombre || "-", fecha: c.fecha, total });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=comprobante_${id}.pdf`);
  res.send(buffer);
});

router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const id = req.params.id;
    const result = await db.collection("cobros").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Cobro no encontrado" });
    }
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
