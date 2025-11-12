import { Router } from "express";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";
import { ObjectId } from "mongodb";

const router = Router();

router.use(requireAuth);

router.get("/csv", async (req, res) => {
  const db = getDb();
  const { from, to } = req.query;
  const filter: any = {};
  if (from) filter.fecha = { $gte: new Date(String(from)) };
  if (to) filter.fecha = { ...(filter.fecha || {}), $lte: new Date(String(to)) };
  const rows = await db.collection("cobros").find(filter).toArray();
  const header = "Cliente,Servicio,Fecha,Monto";
  const lines = [header];
  for (const r of rows) {
    const cliente = await db.collection("clientes").findOne({ _id: new ObjectId(r.clienteId) });
    const servicio = await db.collection("servicios").findOne({ _id: new ObjectId(r.servicioId) });
    lines.push(`${cliente?.nombre || "-"},${servicio?.nombre || "-"},${r.fecha},${r.montoUnitario * (r.cantidad || 1)}`);
  }
  res.setHeader("Content-Type", "text/csv");
  res.send(lines.join("\n"));
});

export default router;
