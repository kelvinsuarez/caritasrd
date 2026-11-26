
import { writeFile } from "node:fs/promises";
import { buildQuotationEmail } from "./quotationEmail.js";

// Datos ficticios para visualizar el correo.
const { subject, html } = buildQuotationEmail({
  quotationId: "915ecd95-bf3c-480c-b7da-928fd35887d8",
  fullName: "María Rodríguez",
  eventType: "Cumpleaños infantil",
  eventDate: "2026-12-20",
  startTime: "15:00",
  duration: 3,

  quotationDetails: {
    childrenCount: 35,
    hairPartyGirls: 20,
    glitterParticipants: null,

    locationType: "interior",
    province: "La Altagracia",
    municipality: "Higüey",

    servicePrices: {
      pintacaritas: 9500,
      hairParty: 6000,
      glitter: 0,
    },

    servicesSubtotal: 15500,
    additionalHoursCost: 2000,
    transportCost: 3000,
    estimatedTotal: 20500,
  },
});

// Utilizar el logo local únicamente para esta prueba.
const previewHtml = html.replaceAll(
  "https://caritasrd.netlify.app",
  "http://localhost:8888"
);

// Generar el archivo HTML temporal.
const outputFile = new URL(
  "../public/email/preview-quotation.html",
  import.meta.url
);

await writeFile(outputFile, previewHtml, "utf8");

console.log("========================================");
console.log("Vista previa generada correctamente.");
console.log("Asunto:", subject);
console.log("========================================");
console.log(
  "http://localhost:8888/email/preview-quotation.html"
);
