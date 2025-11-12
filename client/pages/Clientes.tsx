import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useAppData } from "@/context/app-data";
import { AddClientModal } from "@/views/clientes/AddClientModal";
import AddMascotaModal from "@/views/clientes/AddMascotaModal";
import EditClienteModal from "@/views/clientes/EditClienteModal";
import EditMascotaModal from "@/views/clientes/EditMascotaModal";
import ConfirmDeleteDialog from "@/components/ui/ConfirmDeleteDialog";

export default function Clientes() {
  const data = useAppData();
  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [openAddMascota, setOpenAddMascota] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => data.clientes.filter((c) => c.nombre.toLowerCase().includes(query.toLowerCase())), [data.clientes, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <div className="flex gap-2">
          <Input placeholder="Buscar por nombre" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
          <Button className="bg-[hsl(var(--brand-primary))]" onClick={() => setOpenAdd(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar cliente
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Mascotas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setDetailId(c.id)}>
                <TableCell>{c.nombre}</TableCell>
                <TableCell>{c.telefono}</TableCell>
                <TableCell>{c.correo}</TableCell>
                <TableCell>{data.mascotas.filter((m) => m.clienteId === c.id).map((m) => m.nombre).join(", ") || "—"}</TableCell>
                <TableCell className="text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" onClick={() => setEditId(c.id)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setConfirmDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AddClientModal open={openAdd} onOpenChange={setOpenAdd} />
      <AddMascotaModal open={openAddMascota} onOpenChange={setOpenAddMascota} clienteId={detailId || undefined} />

      {editId && <EditClienteModal 
        open={!!editId} 
        onOpenChange={(o) => !o && setEditId(null)} 
        cliente={data.clientes.find((c) => c.id === editId)!} 
      />}

      <ConfirmDeleteDialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)} title="Eliminar cliente" description="Al eliminar este cliente se borrarán sus mascotas, cobros y recordatorios. Esta acción no se puede revertir." onConfirm={async () => { if (confirmDeleteId) await data.deleteCliente(confirmDeleteId); }} />

      <ClientDetail open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)} id={detailId} onAddMascota={() => setOpenAddMascota(true)} />
    </div>
  );
}

function ClientDetail({ open, onOpenChange, id, onAddMascota }: { open: boolean; onOpenChange: (o: boolean) => void; id: string | null; onAddMascota?: () => void }) {
  const data = useAppData();
  const cliente = data.clientes.find((c) => c.id === id);
  const mascotas = data.mascotas.filter((m) => m.clienteId === id);
  const [editMascotaId, setEditMascotaId] = useState<string | null>(null);
  const [confirmDeleteMascotaId, setConfirmDeleteMascotaId] = useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{cliente?.nombre}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <div>
            <div className="text-sm text-muted-foreground">Contacto</div>
            <div className="text-sm">{cliente?.correo} • {cliente?.telefono}</div>
            {cliente?.direccion && <div className="text-sm">{cliente?.direccion}</div>}
          </div>
          <div>
            <div className="font-medium mb-2">Mascotas</div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-end mb-2">
                <Button size="sm" onClick={() => onAddMascota && onAddMascota()} className="bg-[hsl(var(--brand-primary))]">
                  <Plus className="mr-2 h-4 w-4" /> Agregar mascota
                </Button>
              </div>
              {mascotas.length === 0 && <div className="text-sm text-muted-foreground">Sin mascotas registradas</div>}
              {mascotas.map((m) => (
                <div key={m.id} className="rounded-lg border p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-muted" />
                  <div className="flex-1">
                    <div className="font-medium">{m.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.especie}{m.raza ? ` • ${m.raza}` : ""}
                      {m.edad ? ` • ${m.edad} años` : ""}
                      {m.peso ? ` • ${m.peso} kg` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditMascotaId(m.id)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setConfirmDeleteMascotaId(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {editMascotaId && <EditMascotaModal
          open={!!editMascotaId}
          onOpenChange={(o) => !o && setEditMascotaId(null)}
          mascota={data.mascotas.find((m) => m.id === editMascotaId)!}
        />}

        <ConfirmDeleteDialog 
          open={!!confirmDeleteMascotaId} 
          onOpenChange={(o) => !o && setConfirmDeleteMascotaId(null)} 
          title="Eliminar mascota" 
          description="¿Está seguro que desea eliminar esta mascota? Esta acción no se puede revertir."
          onConfirm={async () => { if (confirmDeleteMascotaId) await data.deleteMascota(confirmDeleteMascotaId); }}
        />
      </SheetContent>
    </Sheet>
  );
}
