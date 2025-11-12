import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Skip authentication and set a default admin user
  (req as any).user = {
    sub: "6902a1d4ade8c9d8fc967adc",
    nombre: "Prueba",
    correo: "admin@gmail.com",
    rol: "admin"
  };
  next();
}
