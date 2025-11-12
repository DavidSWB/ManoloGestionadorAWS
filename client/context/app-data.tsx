import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Rol = "admin" | "cliente";

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
};

export type Mascota = {
  id: string;
  clienteId: string;
  nombre: string;
  especie: string;
  raza?: string;
  edad?: number;
  peso?: number;
  imagenUrl?: string;
};

export type Cliente = {
  id: string;
  nombre: string;
  direccion?: string;
  correo: string;
  telefono: string;
};

export type Servicio = {
  id: string;
  nombre: string;
  descripcion?: string;
  tarifa: number; // COP
  duracion?: string; // e.g. "1 hora"
  activo: boolean;
};

export type CobroEstado = "pendiente" | "pagado" | "vencido";

export type Cobro = {
  id: string;
  clienteId: string;
  servicioId: string;
  fecha: string; // ISO
  cantidad: number; // unidades
  montoUnitario: number; // tarifa del servicio al momento del cobro
  estado: CobroEstado;
};

export type MedioRecordatorio = "WhatsApp" | "Email";

export type Recordatorio = {
  id: string;
  clienteId: string;
  medio: MedioRecordatorio;
  fecha: string; // ISO
  estado: "enviado" | "fallo" | "pendiente";
  asunto?: string;
  mensaje?: string;
};

export type AppData = {
  usuarios: Usuario[];
  clientes: Cliente[];
  mascotas: Mascota[];
  servicios: Servicio[];
  cobros: Cobro[];
  recordatorios: Recordatorio[];
};

const STORAGE_KEY = "manolos-gestion:data:v1";

const initialData: AppData = {
  usuarios: [
    { id: "u1", nombre: "Admin", correo: "admin@manolo.com", rol: "admin" },
  ],
  clientes: [
    { id: "c1", nombre: "Laura Rojas", correo: "laura@correo.com", telefono: "3115551234" },
    { id: "c2", nombre: "Carlos Pérez", correo: "carlos@correo.com", telefono: "3102229876" },
  ],
  mascotas: [
    { id: "m1", clienteId: "c1", nombre: "Luna", especie: "Perro", raza: "Labrador" },
    { id: "m2", clienteId: "c2", nombre: "Michi", especie: "Gato", raza: "Siames" },
  ],
  servicios: [
    { id: "s1", nombre: "Paseo diario", tarifa: 15000, duracion: "1 hora", activo: true },
    { id: "s2", nombre: "Baño y corte", tarifa: 25000, duracion: "45 min", activo: true },
  ],
  cobros: [
    { id: "b1", clienteId: "c1", servicioId: "s1", fecha: new Date().toISOString(), cantidad: 1, montoUnitario: 15000, estado: "pendiente" },
    { id: "b2", clienteId: "c2", servicioId: "s2", fecha: new Date().toISOString(), cantidad: 1, montoUnitario: 25000, estado: "pagado" },
  ],
  recordatorios: [],
};

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    return JSON.parse(raw) as AppData;
  } catch {
    return initialData;
  }
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export type AppDataContextType = AppData & {
  addCliente: (c: Omit<Cliente, "id">) => Promise<string>;
  updateCliente: (id: string, update: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  addMascota: (m: Omit<Mascota, "id">) => Promise<string>;
  updateMascota: (id: string, update: Partial<Mascota>) => Promise<void>;
  deleteMascota: (id: string) => Promise<void>;
  addServicio: (s: Omit<Servicio, "id">) => Promise<string>;
  updateServicio: (id: string, update: Partial<Servicio>) => Promise<void>;
  deleteServicio: (id: string) => Promise<void>;
  addCobro: (c: Omit<Cobro, "id">) => Promise<string>;
  updateCobro: (id: string, update: Partial<Cobro>) => Promise<void>;
  deleteCobro: (id: string) => Promise<void>;
  addRecordatorio: (r: Omit<Recordatorio, "id">) => Promise<string>;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

async function fetchWithAuth(url: string, opts: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {})
  };

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.body && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body
  });

  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || text || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }

  // Try parse JSON but tolerate empty responses
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => ({ 
    usuarios: [], clientes: [], mascotas: [], 
    servicios: [], cobros: [], recordatorios: [] 
  }));

  // Cargar datos iniciales del backend
  useEffect(() => {
    async function loadServerData() {
      try {
        const [clientes, mascotas, servicios, cobros, recordatorios] = await Promise.all([
          fetchWithAuth("/api/clientes"),
          fetchWithAuth("/api/mascotas"),
          fetchWithAuth("/api/servicios"),
          fetchWithAuth("/api/cobros"),
          fetchWithAuth("/api/recordatorios"),
        ]);

        setData({
          usuarios: [],
          clientes: clientes.map((c: any) => ({ 
            id: String(c._id), 
            nombre: c.nombre,
            correo: c.correo,
            telefono: c.telefono,
            direccion: c.direccion
          })),
          mascotas: mascotas.map((m: any) => ({ 
            id: String(m._id),
            clienteId: String(m.clienteId),
            nombre: m.nombre,
            especie: m.especie,
            raza: m.raza,
            edad: m.edad,
            peso: m.peso
          })),
          servicios: servicios.map((s: any) => ({
            id: String(s._id),
            nombre: s.nombre,
            descripcion: s.descripcion,
            tarifa: s.tarifa,
            duracion: s.duracion,
            activo: s.activo
          })),
          cobros: cobros.map((c: any) => ({
            id: String(c._id),
            clienteId: String(c.clienteId),
            servicioId: String(c.servicioId),
            fecha: c.fecha,
            cantidad: c.cantidad,
            montoUnitario: c.montoUnitario,
            estado: c.estado
          })),
          recordatorios: recordatorios.map((r: any) => ({
            id: String(r._id),
            clienteId: String(r.clienteId),
            medio: r.medio,
            fecha: r.fecha,
            estado: r.estado,
            asunto: r.asunto,
            mensaje: r.mensaje
          }))
        });
      } catch (e) {
        console.error("Error cargando datos del servidor:", e);
      }
    }
    loadServerData();
  }, []);

  const api = useMemo<AppDataContextType>(() => ({
    ...data,
    addCliente: async (c) => {
      const res = await fetchWithAuth("/api/clientes", {
        method: "POST",
        body: JSON.stringify(c)
      });
      const id = String(res.id);
      setData((d) => ({ ...d, clientes: [...d.clientes, { ...c, id }] }));
      return id;
    },
    updateCliente: async (id, update) => {
      await fetchWithAuth(`/api/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(update)
      });
      setData((d) => ({ ...d, clientes: d.clientes.map((c) => (c.id === id ? { ...c, ...update } : c)) }));
    },
    deleteCliente: async (id) => {
      await fetchWithAuth(`/api/clientes/${id}`, { method: "DELETE" });
      setData((d) => ({
        ...d,
        clientes: d.clientes.filter((c) => c.id !== id),
        mascotas: d.mascotas.filter((m) => m.clienteId !== id),
        cobros: d.cobros.filter((b) => b.clienteId !== id),
        recordatorios: d.recordatorios.filter((r) => r.clienteId !== id),
      }));
    },
    addMascota: async (m) => {
      const res = await fetchWithAuth("/api/mascotas", {
        method: "POST",
        body: JSON.stringify(m)
      });
      const id = String(res.id);
      setData((d) => ({ ...d, mascotas: [...d.mascotas, { ...m, id }] }));
      return id;
    },
    updateMascota: async (id, update) => {
      await fetchWithAuth(`/api/mascotas/${id}`, {
        method: "PUT",
        body: JSON.stringify(update)
      });
      setData((d) => ({ ...d, mascotas: d.mascotas.map((m) => (m.id === id ? { ...m, ...update } : m)) }));
    },
    deleteMascota: async (id) => {
      await fetchWithAuth(`/api/mascotas/${id}`, { method: "DELETE" });
      setData((d) => ({ ...d, mascotas: d.mascotas.filter((m) => m.id !== id) }));
    },
    addServicio: async (s) => {
      const res = await fetchWithAuth("/api/servicios", {
        method: "POST",
        body: JSON.stringify(s)
      });
      const id = String(res.id);
      setData((d) => ({ ...d, servicios: [...d.servicios, { ...s, id }] }));
      return id;
    },
    updateServicio: async (id, update) => {
      await fetchWithAuth(`/api/servicios/${id}`, {
        method: "PUT",
        body: JSON.stringify(update)
      });
      setData((d) => ({ ...d, servicios: d.servicios.map((s) => (s.id === id ? { ...s, ...update } : s)) }));
    },
    deleteServicio: async (id) => {
      await fetchWithAuth(`/api/servicios/${id}`, { method: "DELETE" });
      setData((d) => ({ ...d, servicios: d.servicios.filter((s) => s.id !== id) }));
    },
    addCobro: async (c) => {
      const res = await fetchWithAuth("/api/cobros", {
        method: "POST",
        body: JSON.stringify(c)
      });
      const id = String(res.id);
      setData((d) => ({ ...d, cobros: [...d.cobros, { ...c, id }] }));
      return id;
    },
    updateCobro: async (id, update) => {
      if ('estado' in update) {
        await fetchWithAuth(`/api/cobros/${id}/estado`, {
          method: "PUT",
          body: JSON.stringify({ estado: update.estado })
        });
      }
      setData((d) => ({ ...d, cobros: d.cobros.map((b) => (b.id === id ? { ...b, ...update } : b)) }));
    },
    deleteCobro: async (id) => {
      await fetchWithAuth(`/api/cobros/${id}`, { method: "DELETE" });
      setData((d) => ({ ...d, cobros: d.cobros.filter((b) => b.id !== id) }));
    },
    addRecordatorio: async (r) => {
      const res = await fetchWithAuth("/api/recordatorios", {
        method: "POST",
        body: JSON.stringify(r)
      });
      const id = String(res.id);
      setData((d) => ({ ...d, recordatorios: [...d.recordatorios, { ...r, id }] }));
      return id;
    },
  }), [data]);

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>;
};
