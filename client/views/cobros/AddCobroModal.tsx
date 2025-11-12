import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/context/app-data";

const Schema = z.object({ clienteId: z.string().min(1), servicioId: z.string().min(1), cantidad: z.number().min(1).default(1), fecha: z.string().optional() });
type Values = z.infer<typeof Schema>;

export function AddCobroModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const data = useAppData();
  const form = useForm<Values>({ resolver: zodResolver(Schema), defaultValues: { clienteId: "", servicioId: "", cantidad: 1 } });
  const activeServicios = data.servicios.filter(s => s.activo);
  const hasActiveServicios = activeServicios.length > 0;

  async function onSubmit(values: Values) {
    // Find service tarifa
    const servicio = data.servicios.find((s) => s.id === values.servicioId);
    const montoUnitario = servicio ? servicio.tarifa : 0;
    await data.addCobro({ clienteId: values.clienteId, servicioId: values.servicioId, cantidad: values.cantidad, montoUnitario, fecha: values.fecha || new Date().toISOString(), estado: "pendiente" });
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar cobro</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField control={form.control} name="clienteId" render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {data.clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="servicioId" render={({ field }) => (
              <FormItem>
                <FormLabel>Servicio</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {activeServicios.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {!hasActiveServicios && (
                  <div className="text-sm text-destructive mt-1">No hay servicios activos. Active al menos un servicio para poder crear cobros.</div>
                )}
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="cantidad" render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input type="number" value={String(field.value)} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[hsl(var(--brand-primary))]" disabled={!hasActiveServicios}>Guardar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddCobroModal;
