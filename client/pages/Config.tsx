import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const KEY = "manolos-gestion:config:v1";

export default function Config() {
  const { register, handleSubmit, reset } = useForm({ defaultValues: { negocio: "Manolo’s Gestión", plantillaWhatsApp: "Hola {{nombre}}, te recordamos tu servicio" } });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) reset(JSON.parse(raw));
    } catch {}
  }, []);

  function onSubmit(values) {
    localStorage.setItem(KEY, JSON.stringify(values));
    alert("Guardado");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Configuración</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nombre del negocio</label>
            <Input {...register("negocio")} />
          </div>
          <div>
            <label className="block text-sm mb-1">Plantilla WhatsApp</label>
            <Input {...register("plantillaWhatsApp")} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[hsl(var(--brand-primary))]">Guardar</Button>
            <Button variant="outline" onClick={() => { localStorage.removeItem(KEY); reset(); }}>Reset</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
