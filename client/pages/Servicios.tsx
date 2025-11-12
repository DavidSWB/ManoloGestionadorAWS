import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input as UiInput } from "@/components/ui/input";
import { useAppData } from "@/context/app-data";

const Schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  descripcion: z.string().optional(),
  tarifa: z.number().min(0, "Debe ser un número"),
  duracion: z.string().optional(),
  activo: z.boolean().optional(),
});

type Values = z.infer<typeof Schema>;

export default function Servicios() {
  const data = useAppData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const form = useForm<Values>({ resolver: zodResolver(Schema), defaultValues: { nombre: "", descripcion: "", tarifa: 0, duracion: "", activo: true } });

  const filtered = useMemo(() => data.servicios.filter((s) => s.nombre.toLowerCase().includes(query.toLowerCase())), [data.servicios, query]);

  function onOpenAdd() {
    setEditingId(null);
    form.reset();
    setOpen(true);
  }

  function onEdit(id: string) {
    const s = data.servicios.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    form.reset({ nombre: s.nombre, descripcion: s.descripcion || "", tarifa: s.tarifa, duracion: s.duracion || "", activo: s.activo });
    setOpen(true);
  }

  function onSubmit(values: Values) {
    if (editingId) {
      data.updateServicio(editingId, values as any);
    } else {
      data.addServicio({ ...(values as any) });
    }
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Servicios</h1>
        <div className="flex gap-2">
          <Input placeholder="Buscar servicio" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
          <Button className="bg-[hsl(var(--brand-primary))]" onClick={onOpenAdd}><Plus className="mr-2 h-4 w-4"/>Nuevo servicio</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.nombre}</TableCell>
                <TableCell className="max-w-xs truncate">{s.descripcion || "—"}</TableCell>
                <TableCell>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(s.tarifa)}</TableCell>
                <TableCell>{s.duracion || "—"}</TableCell>
                <TableCell><Switch checked={s.activo} onCheckedChange={(v) => data.updateServicio(s.id, { activo: !!v })} /></TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" onClick={() => onEdit(s.id)}><Edit className="h-4 w-4"/></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setConfirmDeleteId(s.id)}><Trash2 className="h-4 w-4"/></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <UiInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="descripcion" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <UiInput {...field} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="tarifa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarifa (COP)</FormLabel>
                  <FormControl>
                    <UiInput type="number" value={field.value as any} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[hsl(var(--brand-primary))]">Guardar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  <ConfirmDeleteDialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)} title="Eliminar servicio" description="Eliminar este servicio quitará su disponibilidad. Esta acción no se puede revertir." onConfirm={async () => { if (confirmDeleteId) await data.deleteServicio(confirmDeleteId); }} />
    </div>
  );
}
