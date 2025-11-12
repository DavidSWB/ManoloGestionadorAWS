import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/app-data";
import { AddClientModal } from "@/views/clientes/AddClientModal";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";

export default function Dashboard() {
  const data = useAppData();
  const [openAdd, setOpenAdd] = useState(false);

  const totalClientes = data.clientes.length;
  const cobrosPendientes = data.cobros.filter((c) => c.estado === "pendiente").length;
  const recordatoriosEnviados = data.recordatorios.filter((r) => r.estado === "enviado").length;
  const ingresosMes = data.cobros
    .filter((c) => c.estado === "pagado")
    .reduce((acc, c) => acc + c.montoUnitario * c.cantidad, 0);

  const pagados = data.cobros.filter((c) => c.estado === "pagado").length;
  const totalCobros = data.cobros.length || 1;
  const chartData = useMemo(() => [
    { name: "Pagado", value: pagados },
    { name: "Otros", value: totalCobros - pagados },
  ], [pagados, totalCobros]);

  const chartColors = ["hsl(var(--success))", "hsl(var(--muted))"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bienvenido, {data.usuarios[0]?.nombre}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Clientes" value={totalClientes.toString()} />
        <StatCard title="Cobros pendientes" value={cobrosPendientes.toString()} />
        <StatCard title="Recordatorios enviados" value={recordatoriosEnviados.toString()} />
        <StatCard title="Ingresos del mes" value={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(ingresosMes)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Porcentaje de pagos completados</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} strokeWidth={2}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Button onClick={() => setOpenAdd(true)} className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-[hsl(var(--brand-primary))] hover:opacity-90">
        <Plus className="h-5 w-5" />
      </Button>

      <AddClientModal open={openAdd} onOpenChange={setOpenAdd} />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );
}
