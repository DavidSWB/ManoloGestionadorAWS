import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/context/app-data";

const Schema = z.object({ 
  nombre: z.string().min(1, "Requerido"), 
  especie: z.string().min(1), 
  raza: z.string().optional(), 
  edad: z.number().optional(), 
  peso: z.number().optional() 
});

type Values = z.infer<typeof Schema>;

export function EditMascotaModal({ open, onOpenChange, mascota }: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void; 
  mascota: { id: string; nombre: string; especie: string; raza?: string; edad?: number; peso?: number; clienteId: string; }; 
}) {
  const data = useAppData();
  const form = useForm<Values>({ 
    resolver: zodResolver(Schema), 
    defaultValues: { 
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza || "",
      edad: mascota.edad,
      peso: mascota.peso
    } 
  });

  async function onSubmit(values: Values) {
    try {
      await data.updateMascota(mascota.id, values);
      onOpenChange(false);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar mascota</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField control={form.control} name="especie" render={({ field }) => (
                <FormItem>
                  <FormLabel>Especie</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="raza" render={({ field }) => (
                <FormItem>
                  <FormLabel>Raza</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField control={form.control} name="edad" render={({ field }) => (
                <FormItem>
                  <FormLabel>Edad</FormLabel>
                  <FormControl>
                    <Input type="number" value={field.value === undefined ? "" : String(field.value)} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="peso" render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" value={field.value === undefined ? "" : String(field.value)} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[hsl(var(--brand-primary))]">Guardar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditMascotaModal;