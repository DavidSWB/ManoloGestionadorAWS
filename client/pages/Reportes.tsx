import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/app-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function Reportes() {
  const data = useAppData();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    const filtered = data.cobros.filter((c) => {
      if (from && new Date(c.fecha) < new Date(from)) return false;
      if (to && new Date(c.fecha) > new Date(to)) return false;
      return true;
    });

    return filtered.map((c) => ({
      ...c,
      cliente: data.clientes.find((x) => x.id === c.clienteId)?.nombre || "—",
      servicio: data.servicios.find((x) => x.id === c.servicioId)?.nombre || "—",
      total: c.montoUnitario * c.cantidad,
    }));
  }, [data, from, to]);

  const chartData = useMemo(() => {
    const agg = {} as Record<string, number>;
    rows.forEach((r) => {
      agg[r.servicio] = (agg[r.servicio] || 0) + r.total;
    });
    return Object.keys(agg).map((k) => ({ name: k, value: agg[k] }));
  }, [rows]);

  function exportCSV() {
    const csv = ["Cliente,Servicio,Fecha,Monto", ...rows.map(r => `${r.cliente},${r.servicio},${r.fecha},${r.total}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reportes_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Reportes</h1>
        <div className="flex gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border p-2" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border p-2" />
          <Button onClick={exportCSV} className="bg-[hsl(var(--brand-primary))]">Exportar a CSV</Button>
        </div>
      </div>

      <Card>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--brand-primary))" /></BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Resultados: {rows.length}</div>
      </Card>
    </div>
  );
}
