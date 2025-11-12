import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import authRouter from "./routes/auth";
import clientesRouter from "./routes/clientes";
import mascotasRouter from "./routes/mascotas";
import serviciosRouter from "./routes/servicios";
import cobrosRouter from "./routes/cobros";
import recordatoriosRouter from "./routes/recordatorios";
import reportsRouter from "./routes/reports";
import testMailRouter from "./routes/test-mail";

dotenv.config();

function setupApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRouter);
  app.use("/api/clientes", clientesRouter);
  app.use("/api/mascotas", mascotasRouter);
  app.use("/api/servicios", serviciosRouter);
  app.use("/api/cobros", cobrosRouter);
  app.use("/api/recordatorios", recordatoriosRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api", testMailRouter);

  app.get("/api/ping", (req, res) => res.json({ message: "pong" }));

  app.get("/api/seed", async (req, res) => {
    try {
      const db = await connectDB();
      // seed sample data
      const clientes = [
        { nombre: "Laura Rojas", correo: "laura@correo.com", telefono: "3115551234", creadoEn: new Date() },
        { nombre: "Carlos Pérez", correo: "carlos@correo.com", telefono: "3102229876", creadoEn: new Date() },
      ];
      const res1 = await db.collection("clientes").insertMany(clientes as any);

      const mascotas = [
        { clienteId: res1.insertedIds["0"], nombre: "Luna", especie: "Perro", raza: "Labrador", creadoEn: new Date() },
        { clienteId: res1.insertedIds["1"], nombre: "Michi", especie: "Gato", raza: "Siames", creadoEn: new Date() },
      ];
      await db.collection("mascotas").insertMany(mascotas as any);

      const servicios = [
        { nombre: "Paseo diario", tarifa: 15000, duracion: "1 hora", activo: true, creadoEn: new Date() },
        { nombre: "Baño y corte", tarifa: 25000, duracion: "45 min", activo: true, creadoEn: new Date() },
      ];
      const res3 = await db.collection("servicios").insertMany(servicios as any);

      const cobros = [
        { clienteId: res1.insertedIds["0"], servicioId: res3.insertedIds["0"], fecha: new Date().toISOString(), cantidad: 1, montoUnitario: 15000, estado: "pendiente", creadoEn: new Date() },
        { clienteId: res1.insertedIds["1"], servicioId: res3.insertedIds["1"], fecha: new Date().toISOString(), cantidad: 1, montoUnitario: 25000, estado: "pagado", creadoEn: new Date() },
      ];
      await db.collection("cobros").insertMany(cobros as any);

      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  return app;
}

export function createServer() {
  // create server without starting listener — used by Vite dev server
  return setupApp();
}

async function start() {
  await connectDB();
  const port = Number(process.env.PORT || 4000);
  const app = setupApp();
  app.listen(port, () => console.log("Server listening on port", port));
}

if (process.env.NODE_ENV !== "test" && process.env.RUN_SERVER !== "false") {
  start();
}

export default setupApp();
