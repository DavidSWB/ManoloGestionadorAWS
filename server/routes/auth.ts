import { Router } from "express";
import { z } from "zod";
import { getDb } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const registerSchema = z.object({ nombre: z.string(), correo: z.string().email(), password: z.string().min(4) });
const loginSchema = z.object({ correo: z.string().email(), password: z.string() });

router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const db = getDb();
    const exists = await db.collection("usuarios").findOne({ correo: parsed.correo });
    if (exists) return res.status(400).json({ message: "Correo ya registrado" });
    const hash = await bcrypt.hash(parsed.password, 10);
    const result = await db.collection("usuarios").insertOne({ nombre: parsed.nombre, correo: parsed.correo, passwordHash: hash, rol: "admin", creadoEn: new Date() });
    res.json({ id: result.insertedId });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const db = getDb();
    const user = await db.collection("usuarios").findOne({ correo: parsed.correo });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });
    const ok = await bcrypt.compare(parsed.password, user.passwordHash || "");
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });
    const token = jwt.sign({ sub: String(user._id), correo: user.correo, nombre: user.nombre, rol: user.rol }, process.env.JWT_SECRET || "dev", { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
    res.json({ token });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
