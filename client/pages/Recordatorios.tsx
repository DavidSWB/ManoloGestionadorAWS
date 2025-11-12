import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppData } from "@/context/app-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Check } from "lucide-react";

export default function Recordatorios() {
  const data = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recordatorios</h1>
        <Button className="bg-[hsl(var(--brand-primary))]" onClick={() => setOpen(true)}>Enviar recordatorio</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Medio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.recordatorios.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{data.clientes.find((c) => c.id === r.clienteId)?.nombre || "—"}</TableCell>
                <TableCell>{r.medio}</TableCell>
                <TableCell>{new Date(r.fecha).toLocaleString()}</TableCell>
                <TableCell>{r.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <SendDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function SendDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const data = useAppData();
  const form = useForm({ 
    defaultValues: { 
      clienteId: data.clientes[0]?.id || "", 
      medio: "WhatsApp", 
      asunto: "Recordatorio de Manolo's Gestión",
      mensaje: "Hola, te recordamos tu próximo servicio." 
    } 
  });

  async function onSubmit(values) {
    const now = new Date().toISOString();
    await data.addRecordatorio({ 
      clienteId: values.clienteId, 
      medio: values.medio, 
      fecha: now,
      estado: "pendiente",
      asunto: values.asunto,
      mensaje: values.mensaje 
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar recordatorio</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField control={form.control} name="clienteId" render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {data.clientes.map((c) => <SelectItem value={c.id} key={c.id}>{c.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="medio" render={({ field }) => (
              <FormItem>
                <FormLabel>Medio</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="asunto" render={({ field }) => (
              <FormItem>
                <FormLabel>Asunto</FormLabel>
                <FormControl>
                  <input className="w-full rounded-md border p-2" {...field} />
                </FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="mensaje" render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje</FormLabel>
                <FormControl>
                  <textarea className="w-full rounded-md border p-2" rows={4} {...field}></textarea>
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[hsl(var(--brand-primary))]">Enviar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
