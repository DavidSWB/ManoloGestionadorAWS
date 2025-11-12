import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export default function Placeholder({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <Card className="p-6 text-sm text-muted-foreground">Sección en construcción. Pídeme completar esta pantalla para agregar tablas, formularios, exportaciones y más.</Card>
      {children}
    </div>
  );
}
