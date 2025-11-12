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
  correo: z.string().email("Email inválido"), 
  telefono: z.string().min(1), 
  direccion: z.string().optional(), 
});

type Values = z.infer<typeof Schema>;

export function EditClienteModal({ open, onOpenChange, cliente }: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void; 
  cliente: { 
    id: string;
    nombre: string;
    correo: string;
    telefono: string;
    direccion?: string;
  }; 
}) {
  const data = useAppData();
  const form = useForm<Values>({ 
    resolver: zodResolver(Schema), 
    defaultValues: { 
      nombre: cliente.nombre, 
      correo: cliente.correo, 
      telefono: cliente.telefono, 
      direccion: cliente.direccion || "" 
    } 
  });

  async function onSubmit(values: Values) {
    try {
      await data.updateCliente(cliente.id, values);
      onOpenChange(false);
    } catch (e: any) {
      alert(e.message || String(e));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
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

            <FormField control={form.control} name="correo" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="telefono" render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="direccion" render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

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

export default EditClienteModal;