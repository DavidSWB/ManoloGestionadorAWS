import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/context/app-data";
import AddCobroModal from "@/views/cobros/AddCobroModal";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { format } from "date-fns";
import { Download, Trash2 } from "lucide-react";

export default function Cobros() {
  const data = useAppData();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return data.cobros.map((b) => ({
      ...b,
      cliente: data.clientes.find((c) => c.id === b.clienteId)?.nombre || "—",
      servicio: data.servicios.find((s) => s.id === b.servicioId)?.nombre || "—",
      total: b.montoUnitario * b.cantidad,
    }));
  }, [data]);

  function markEstado(id: string, estado: "pagado" | "vencido" | "pendiente") {
    data.updateCobro(id, { estado });
  }

  function generarComprobante(b) {
    setDetailId(b.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cobros</h1>
        <div>
          <Button className="bg-[hsl(var(--brand-primary))]" onClick={() => setOpenAdd(true)}>Nuevo cobro</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.cliente}</TableCell>
                <TableCell>{r.servicio}</TableCell>
                <TableCell>{format(new Date(r.fecha), "dd/MM/yyyy")}</TableCell>
                <TableCell>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(r.total)}</TableCell>
                <TableCell>
                  <Badge variant={r.estado === "pagado" ? "secondary" : r.estado === "vencido" ? "destructive" : "outline"}>{r.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {r.estado === "pagado" ? (
                      <Button size="sm" onClick={() => markEstado(r.id, "pendiente")} variant="outline">Marcar pendiente</Button>
                    ) : (
                      <Button size="sm" onClick={() => markEstado(r.id, "pagado")} className="bg-[hsl(var(--success))]">Marcar pagado</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => markEstado(r.id, "vencido")} className="text-destructive">Vencido</Button>
                    <Button size="icon" variant="ghost" onClick={() => generarComprobante(r)}><Download className="h-4 w-4"/></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setConfirmDeleteId(r.id)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ComprobanteSheet id={detailId} onOpenChange={(o) => !o && setDetailId(null)} />
      <AddCobroModal open={openAdd} onOpenChange={setOpenAdd} />
      <ConfirmDeleteDialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)} title="Eliminar cobro" description="Esta acción eliminará el cobro y no podrá revertirse." onConfirm={async () => { if (confirmDeleteId) await data.deleteCobro(confirmDeleteId); }} />
    </div>
  );
}

function ComprobanteSheet({ id, onOpenChange }: { id: string | null; onOpenChange: (o: boolean) => void }) {
  const data = useAppData();
  const cobro = data.cobros.find((c) => c.id === id);
  if (!id || !cobro) return <Sheet open={false} onOpenChange={() => {}}><SheetContent side="right" className="w-full sm:max-w-md" /></Sheet>;

  const cliente = data.clientes.find((c) => c.id === cobro.clienteId);
  const servicio = data.servicios.find((s) => s.id === cobro.servicioId);
  const total = cobro.montoUnitario * cobro.cantidad;

  function downloadInvoice() {
    const html = `Comprobante\nCliente: ${cliente?.nombre}\nServicio: ${servicio?.nombre}\nMonto: ${total}`;
    const blob = new Blob([html], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comprobante_${cobro.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Sheet open={!!id} onOpenChange={(o) => onOpenChange(o)}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Comprobante</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <div className="text-sm text-muted-foreground">Cliente</div>
          <div className="font-medium mb-2">{cliente?.nombre}</div>
          <div className="text-sm text-muted-foreground">Servicio</div>
          <div className="mb-2">{servicio?.nombre}</div>
          <div className="text-sm text-muted-foreground">Fecha</div>
          <div className="mb-2">{format(new Date(cobro.fecha), "dd/MM/yyyy HH:mm")}</div>
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold mb-4">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(total)}</div>
          <div className="flex gap-2">
            <Button onClick={downloadInvoice} className="bg-[hsl(var(--brand-primary))]">Descargar</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
