import ExcelJS from "exceljs";

import { ExtendedService } from "@/views/service-management/utils/serviceManagement";
import {
	displayTimeFromService,
	displayTimeToMinutes,
	getOffsetDisplayTime,
	normalizeNotesForEditor,
} from "@/views/service-management/utils/serviceManagement";

type CompanyKey = ExtendedService["serviceType"];

type ExportRow = {
	tipo: string;
	codigo: string;
	cliente: string;
	pickup: string;
	vuelo: string;
	vehiculo: string;
	pax: number | string;
	desde: string;
	hacia: string;
	notas: string;
	em: string;
	rowColor: string;
};

const EXPORT_HEADERS = ["TIPO", "CODIGO", "CLIENTE", "PICKUP", "VUELO", "VEHICULO", "PAX", "DESDE", "HACIA", "NOTAS", "EM"];

const COMPANY_ORDER: CompanyKey[] = ["at", "mbt", "st"];

const COMPANY_STYLES: Record<CompanyKey, { label: string; color: string }> = {
	at: { label: "Airport Transfer", color: "FFF2CC" },
	mbt: { label: "MB Transfer", color: "9FC5E8" },
	st: { label: "SACBE TRANSFER", color: "B6D7A8" },
};

const TYPE_ROW_COLORS: Record<string, string> = {
	TRANSFER: "D9EAD3",
	DEPARTURE: "FCE5CD",
	ARRIVAL: "FFFFFF",
};

const HEADER_FILL = "1F4E78";
const HEADER_TEXT = "FFFFFF";
const BORDER_COLOR = "D9D9D9";
const COMPANY_SEPARATOR_FILL = "D9E2F3";
const ITINERARY_END_FILL = "1C1C1C";
const ITINERARY_END_TEXT = "FFFFFF";

type ServiceNoteItem = {
	tag?: string;
};

const isNoteArray = (value: unknown): value is ServiceNoteItem[] =>
  Array.isArray(value) && value.every((note) => !note || typeof note === "object");

const getEmergencyMarker = (notes: unknown) => {
  if (!isNoteArray(notes)) return "";
  return notes.some((note) => String(note?.tag || "").toUpperCase() === "EMERGENCY") ? "EM" : "";
};

const getTypeLabel = (kindOf: ExtendedService["kindOf"]) => {
  switch (kindOf) {
    case "TRANSFER":
      return "transfer";
    case "DEPARTURE":
      return "departure";
    case "ARRIVAL":
      return "arrival";
    default:
      return String(kindOf || "").toLowerCase();
  }
};

const getServicePickupMinutes = (service: ExtendedService, selectedDate: string) => {
  const displayTime =
    service.kindOf === "DEPARTURE"
      ? getOffsetDisplayTime(displayTimeFromService(service.pickupTime, selectedDate), -15)
      : displayTimeFromService(service.pickupTime, selectedDate);
  const minutes = displayTimeToMinutes(displayTime);
  return minutes === null ? Number.MAX_SAFE_INTEGER : minutes;
};

const toExportRow = (service: ExtendedService, selectedDate: string): ExportRow => {
  const basePickupTime = displayTimeFromService(service.pickupTime, selectedDate) || "";
  const exportPickupTime =
    service.kindOf === "DEPARTURE"
      ? getOffsetDisplayTime(basePickupTime, -15)
      : basePickupTime;

  return {
    tipo: getTypeLabel(service.kindOf),
    codigo: service.code || "",
    cliente: service.clientName || "",
    pickup: exportPickupTime,
    vuelo: service.kindOf === "ARRIVAL" ? service.flightCode || "" : "",
    vehiculo: service.assignedVehicle || service.vehicleType || "",
    pax: typeof service.pax === "number" ? service.pax : service.pax || "",
    desde: service.pickupLocation || "",
    hacia: service.dropoffLocation || "",
    notas: normalizeNotesForEditor(service.notes),
    em: getEmergencyMarker(service.notes),
    rowColor: TYPE_ROW_COLORS[service.kindOf] || TYPE_ROW_COLORS.ARRIVAL,
  };
};

const applyFill = (row: ExcelJS.Row, color: string) => {
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: color },
    };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      bottom: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });
};

const fitWorksheetColumns = (worksheet: ExcelJS.Worksheet) => {
  worksheet.columns.forEach((column, index) => {
    const key = typeof column.key === "string" ? column.key : undefined;
    const headerLength = String(EXPORT_HEADERS[index] || "").length;
    let maxLength = headerLength;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const rawValue = key ? worksheet.getCell(cell.address).value : cell.value;
      const cellText =
        typeof rawValue === "object" && rawValue !== null && "richText" in rawValue
          ? rawValue.richText.map((part) => part.text).join("")
          : String(rawValue ?? "");
      const normalizedLength = cellText
        .split("\n")
        .reduce((longest, part) => Math.max(longest, part.trim().length), 0);
      maxLength = Math.max(maxLength, normalizedLength);
    });

    const paddedWidth = Math.min(Math.max(maxLength + 3, 10), 48);

    switch (key) {
      case "codigo":
        column.width = Math.max(paddedWidth, 16);
        break;
      case "cliente":
        column.width = Math.max(paddedWidth, 30);
        break;
      case "desde":
      case "hacia":
        column.width = Math.max(paddedWidth, 32);
        break;
      case "notas":
        column.width = Math.max(paddedWidth, 42);
        break;
      default:
        column.width = paddedWidth;
    }
  });
};

export async function exportServicesToExcel(services: ExtendedService[], selectedDate: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Codex";
  workbook.created = new Date();
  const totalServices = services.length;
  const arrivalCount = services.filter((service) => service.kindOf === "ARRIVAL").length;
  const departureCount = services.filter((service) => service.kindOf === "DEPARTURE").length;
  const transferCount = services.filter((service) => service.kindOf === "TRANSFER").length;

  const worksheet = workbook.addWorksheet("Servicios", {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { defaultRowHeight: 22 },
  });

  worksheet.columns = [
    { header: "TIPO", key: "tipo", width: 14 },
    { header: "CODIGO", key: "codigo", width: 16 },
    { header: "CLIENTE", key: "cliente", width: 30 },
    { header: "PICKUP", key: "pickup", width: 12 },
    { header: "VUELO", key: "vuelo", width: 14 },
    { header: "VEHICULO", key: "vehiculo", width: 18 },
    { header: "PAX", key: "pax", width: 10 },
    { header: "DESDE", key: "desde", width: 32 },
    { header: "HACIA", key: "hacia", width: 32 },
    { header: "NOTAS", key: "notas", width: 42 },
    { header: "EM", key: "em", width: 10 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.values = EXPORT_HEADERS;
  headerRow.font = { bold: true, size: 12, color: { argb: HEADER_TEXT } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  applyFill(headerRow, HEADER_FILL);
  headerRow.height = 24;

  for (const companyKey of COMPANY_ORDER) {
    const companyServices = services
      .filter((service) => service.serviceType === companyKey)
      .sort((a, b) => getServicePickupMinutes(a, selectedDate) - getServicePickupMinutes(b, selectedDate));

    if (companyServices.length === 0) continue;

    const companyRow = worksheet.addRow([`${COMPANY_STYLES[companyKey].label} (${companyServices.length})`]);
    worksheet.mergeCells(companyRow.number, 1, companyRow.number, EXPORT_HEADERS.length);
    companyRow.font = { bold: true, size: 12, color: { argb: "000000" } };
    companyRow.alignment = { vertical: "middle", horizontal: "left" };
    applyFill(companyRow, COMPANY_STYLES[companyKey].color);
    companyRow.height = 24;

    for (const service of companyServices) {
      const rowData = toExportRow(service, selectedDate);
      const row = worksheet.addRow([
        rowData.tipo,
        rowData.codigo,
        rowData.cliente,
        rowData.pickup,
        rowData.vuelo,
        rowData.vehiculo,
        rowData.pax,
        rowData.desde,
        rowData.hacia,
        rowData.notas,
        rowData.em,
      ]);

      row.font = { size: 11 };
      row.alignment = { vertical: "top", wrapText: true };
      applyFill(row, rowData.rowColor);
      row.getCell(4).alignment = { vertical: "top", horizontal: "center" };
      row.getCell(7).alignment = { vertical: "top", horizontal: "center" };
      row.getCell(11).alignment = { vertical: "top", horizontal: "center" };
    }

    const separatorRow = worksheet.addRow(new Array(EXPORT_HEADERS.length).fill(""));
    applyFill(separatorRow, COMPANY_SEPARATOR_FILL);
    separatorRow.height = 8;
  }

  const itineraryEndRow = worksheet.addRow(["FIN DEL ITINERARIO"]);
  worksheet.mergeCells(itineraryEndRow.number, 1, itineraryEndRow.number, EXPORT_HEADERS.length);
  itineraryEndRow.font = { bold: true, size: 12, color: { argb: ITINERARY_END_TEXT } };
  itineraryEndRow.alignment = { vertical: "middle", horizontal: "center" };
  applyFill(itineraryEndRow, ITINERARY_END_FILL);
  itineraryEndRow.height = 24;

  worksheet.addRow([]);

  const summaryHeaderRow = worksheet.addRow(["METADATOS DEL ITINERARIO"]);
  worksheet.mergeCells(summaryHeaderRow.number, 1, summaryHeaderRow.number, 4);
  summaryHeaderRow.font = { bold: true, size: 11, color: { argb: "000000" } };
  summaryHeaderRow.alignment = { vertical: "middle", horizontal: "left" };
  applyFill(summaryHeaderRow, COMPANY_SEPARATOR_FILL);

  const summaryRowOne = worksheet.addRow([
    "Fecha",
    selectedDate,
    "Total servicios",
    totalServices,
  ]);
  const summaryRowTwo = worksheet.addRow([
    "Llegadas",
    arrivalCount,
    "Salidas",
    departureCount,
  ]);
  const summaryRowThree = worksheet.addRow([
    "Transfers",
    transferCount,
    "Generado",
    new Date().toLocaleString("es-DO"),
  ]);

  [summaryRowOne, summaryRowTwo, summaryRowThree].forEach((row) => {
    row.font = { size: 11 };
    row.alignment = { vertical: "middle", horizontal: "left" };
    applyFill(row, "F8FAFC");
  });

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: EXPORT_HEADERS.length },
  };

  fitWorksheetColumns(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `itinerario-${selectedDate}.xlsx`;
  link.click();

  URL.revokeObjectURL(url);
}
