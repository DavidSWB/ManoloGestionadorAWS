import PDFDocument from "pdfkit";

export function invoicePdfBuffer({ cliente, servicio, fecha, total }: { cliente: string; servicio: string; fecha: string; total: number }) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  doc.on("end", () => {});

  doc.fontSize(20).text("Comprobante - Manolo's Gestión", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Cliente: ${cliente}`);
  doc.text(`Servicio: ${servicio}`);
  doc.text(`Fecha: ${fecha}`);
  doc.moveDown();
  doc.fontSize(14).text(`Total: ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(total)}`);

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
