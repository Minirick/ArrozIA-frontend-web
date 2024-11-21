import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import logoBase64 from "../../../assets/images/logoBase64"; // Importa el logo como Base64
import siembraBase64 from "../../../assets/images/siembraBase64"; // Icono de siembra en Base64
import cosechaBase64 from "../../../assets/images/cosechaBase64"; // Icono de cosecha en Base64

export const generatePDF = (cropDetails, inputs = [], culturalWorks = [], totalInputCost = 0, totalWorkValue = 0) => {
  const doc = new jsPDF();

  // Agregar el logo y el título del reporte
  doc.addImage(logoBase64, "PNG", 10, 10, 30, 30);
  doc.setFontSize(22);
  doc.setTextColor(34, 139, 34);
  doc.text("ARROZ IA", 50, 25);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("REPORTE - FINANCIERO", 80, 35);

  // Agregar fecha y hora de generación
  const currentDate = new Date().toLocaleString();
  doc.setFontSize(12);
  doc.text(`GENERADO: ${currentDate}`, 80, 42);

  // Información general
  doc.setFontSize(12);
  doc.text(`Ubicación: ${cropDetails.location || "No disponible"}`, 14, 55);
  doc.text(`Finca: ${cropDetails.farm?.cropName || "No disponible"}`, 14, 63);
  doc.text(`Lote: ${cropDetails.plotId || "No disponible"}`, 14, 71);
  doc.text(`Cultivo: ${cropDetails.cropName || "No disponible"}`, 100, 55);
  doc.text(`Área Cultivada: ${cropDetails.cultivatedArea || "No disponible"} ${cropDetails.areaUnit || ""}`, 100, 63);
  doc.text(`Variedad: ${cropDetails.varietyId || "No disponible"}`, 100, 71);

  // Fechas de siembra y cosecha con íconos
  doc.text("Fecha de siembra:", 14, 85);
  doc.addImage(siembraBase64, "PNG", 60, 75, 10, 10);
  doc.text(cropDetails.plantingDate ? new Date(cropDetails.plantingDate).toLocaleDateString() : "No disponible", 75, 85);

  doc.text("Fecha de cosecha:", 14, 100);
  doc.addImage(cosechaBase64, "PNG", 60, 90, 10, 10);
  doc.text(cropDetails.estimatedHarvestDate ? new Date(cropDetails.estimatedHarvestDate).toLocaleDateString() : "No disponible", 75, 100);

  // Sección de costos totales
  doc.text("Costos totales", 14, 115);
  autoTable(doc, {
    startY: 120,
    head: [["Descripción", "Valor"]],
    body: [
      ["Insumos", `$${totalInputCost.toLocaleString() || 0}`],
      ["Labores Culturales", `$${totalWorkValue.toLocaleString() || 0}`],
      ["Valor Total", `$${(totalInputCost + totalWorkValue).toLocaleString() || 0}`],
    ],
    theme: "grid",
    styles: { halign: "right" },
  });

  // Tabla de insumos
  const finalYCosts = doc.lastAutoTable.finalY + 10;
  doc.text("Insumos Utilizados", 14, finalYCosts);
  autoTable(doc, {
    startY: finalYCosts + 5,
    head: [["Concepto", "Valor Unitario", "Cantidad", "Descripción", "Valor Total"]],
    body: inputs.map((input) => [
      input.concepto || "No disponible",
      `$${input.valor_unitario?.toLocaleString() || 0}`,
      input.cantidad || 0,
      input.descripcion || "No disponible",
      `$${input.valor_total?.toLocaleString() || 0}`,
    ]),
    theme: "grid",
    styles: { halign: "center" },
  });

  // Mostrar total de insumos
  const finalYInputs = doc.lastAutoTable.finalY + 10;
  doc.text(`Valor Total de Insumos: $${totalInputCost.toLocaleString() || 0}`, 14, finalYInputs);

  // Tabla de labores culturales
  const finalYInputsTotal = finalYInputs + 10;
  doc.text("Labores Culturales", 14, finalYInputsTotal);
  autoTable(doc, {
    startY: finalYInputsTotal + 5,
    head: [["Fecha Inicio", "Fecha Fin", "Actividad", "Maquinaria", "Operario", "Descripción", "Valor"]],
    body: culturalWorks.map((work) => [
      work.fecha_inicio ? new Date(work.fecha_inicio).toLocaleDateString() : "No disponible",
      work.fecha_culminacion ? new Date(work.fecha_culminacion).toLocaleDateString() : "No disponible",
      work.actividad || "No disponible",
      work.maquinaria || "No aplica",
      work.operario || "No disponible",
      work.descripcion || "No disponible",
      `$${work.valor?.toLocaleString() || 0}`,
    ]),
    theme: "grid",
    styles: { halign: "center" },
  });

  // Mostrar total de labores culturales
  const finalYWorks = doc.lastAutoTable.finalY + 10;
  doc.text(`Valor Total de Labores Culturales: $${totalWorkValue.toLocaleString() || 0}`, 14, finalYWorks);

  // Guardar PDF
  doc.save(`Reporte_Financiero_${cropDetails.cropName || "No disponible"}.pdf`);
};

export const generateXLS = (cropDetails, inputs = [], culturalWorks = [], totalInputCost = 0, totalWorkValue = 0) => {
  const workbook = XLSX.utils.book_new();

  // General Information
  const generalSheet = XLSX.utils.json_to_sheet([
    { Campo: "Cultivo", Valor: cropDetails.cropName || "No disponible" },
    { Campo: "Finca", Valor: cropDetails.farm?.cropName || "No disponible" },
    { Campo: "Lote", Valor: cropDetails.plotId || "No disponible" },
    { Campo: "Área Cultivada", Valor: `${cropDetails.cultivatedArea || "No disponible"} ${cropDetails.areaUnit || ""}` },
    { Campo: "Fecha de Siembra", Valor: cropDetails.plantingDate ? new Date(cropDetails.plantingDate).toLocaleDateString() : "No disponible" },
    { Campo: "Fecha de Cosecha", Valor: cropDetails.estimatedHarvestDate ? new Date(cropDetails.estimatedHarvestDate).toLocaleDateString() : "No disponible" },
  ]);
  XLSX.utils.book_append_sheet(workbook, generalSheet, "Información General");

  // Inputs Sheet
  const inputsSheet = XLSX.utils.json_to_sheet(
    inputs.map((input) => ({
      Concepto: input.concepto || "No disponible",
      "Valor Unitario": input.valor_unitario || 0,
      Cantidad: input.cantidad || 0,
      Descripción: input.descripcion || "No disponible",
      "Valor Total": input.valor_total || 0,
    }))
  );
  XLSX.utils.book_append_sheet(workbook, inputsSheet, "Insumos");

  // Cultural Works Sheet
  const worksSheet = XLSX.utils.json_to_sheet(
    culturalWorks.map((work) => ({
      "Fecha Inicio": work.fecha_inicio ? new Date(work.fecha_inicio).toLocaleDateString() : "No disponible",
      "Fecha Fin": work.fecha_culminacion ? new Date(work.fecha_culminacion).toLocaleDateString() : "No disponible",
      Actividad: work.actividad || "No disponible",
      Maquinaria: work.maquinaria || "No aplica",
      Operario: work.operario || "No disponible",
      Descripción: work.descripcion || "No disponible",
      Valor: work.valor || 0,
    }))
  );
  XLSX.utils.book_append_sheet(workbook, worksSheet, "Labores Culturales");

  // Save XLSX
  XLSX.writeFile(workbook, `Reporte_Financiero_${cropDetails.cropName || "No disponible"}.xlsx`);
};