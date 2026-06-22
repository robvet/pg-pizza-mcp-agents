import pptxgen from "pptxgenjs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("./rest-vs-mcp.pptx", import.meta.url));

const NAVY = "1E2761";
const ICE = "CADCFC";
const REST = "1C7293";
const MCP = "16A34A";
const WHITE = "FFFFFF";
const INK = "242424";
const MUTED = "5C5C5C";
const SOFT = "F5F5F5";

const pres = new pptxgen();
pres.defineLayout({ name: "W16x9", width: 13.333, height: 7.5 });
pres.layout = "W16x9";
pres.author = "Pizza MCP Demo";
pres.title = "One Backend, Two Interfaces — REST vs. MCP";

// ---- Slide 1: title + diagram ----
const s1 = pres.addSlide();
s1.background = { color: WHITE };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 1.5, fill: { color: NAVY }, line: { color: NAVY } });
s1.addText("One Backend, Two Interfaces — REST vs. MCP", { x: 0.6, y: 0.25, w: 12.1, h: 0.7, fontSize: 30, bold: true, color: WHITE, fontFace: "Georgia" });
s1.addText("Same pizza data, exposed two ways. MCP is a thin facade over REST — no second data store.", { x: 0.6, y: 0.95, w: 12.1, h: 0.4, fontSize: 14, color: ICE });

const box = (s, x, y, w, h, title, sub, color) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: SOFT }, line: { color, width: 2 }, rectRadius: 0.08 });
  s.addText([
    { text: title, options: { fontSize: 15, bold: true, color: INK, breakLine: true } },
    { text: sub, options: { fontSize: 11, color: MUTED } },
  ], { x, y, w, h, align: "center", valign: "middle", margin: 4 });
};

box(s1, 0.7, 2.2, 3.0, 1.1, "pizza-webapp", "browser app", "919191");
box(s1, 0.7, 4.5, 3.0, 1.1, "LLM agent", "MCP client", "919191");
box(s1, 5.0, 2.2, 3.4, 1.3, "pizza-api", "REST · Azure Functions", REST);
box(s1, 5.0, 4.4, 3.4, 1.3, "pizza-mcp", "MCP · Express facade", MCP);
box(s1, 9.9, 3.2, 2.8, 1.5, "Data store", "system of record", NAVY);

const arrow = (s, x, y, w, color, label) => {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color, width: 2.5, endArrowType: "triangle" } });
  if (label) s.addText(label, { x, y: y - 0.35, w, h: 0.3, fontSize: 10, color: MUTED, align: "center" });
};
arrow(s1, 3.7, 2.75, 1.3, REST, "REST");
arrow(s1, 3.7, 5.05, 1.3, MCP, "MCP");
s1.addShape(pres.shapes.LINE, { x: 6.7, y: 3.5, w: 0, h: 0.9, line: { color: MUTED, width: 2, dashType: "dash", endArrowType: "triangle" } });
s1.addText("REST over HTTP", { x: 6.85, y: 3.75, w: 1.8, h: 0.3, fontSize: 9, color: MUTED });
arrow(s1, 8.4, 2.85, 1.5, REST);
s1.addText("Source: src/pizza-api · src/pizza-mcp", { x: 0.7, y: 6.7, w: 12, h: 0.3, fontSize: 10, italic: true, color: MUTED });

// ---- Slide 2: comparison ----
const s2 = pres.addSlide();
s2.background = { color: WHITE };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 1.1, fill: { color: NAVY }, line: { color: NAVY } });
s2.addText("Same Operation, Two Shapes", { x: 0.6, y: 0.25, w: 12, h: 0.6, fontSize: 26, bold: true, color: WHITE, fontFace: "Georgia" });

const head = (t, color) => ({ text: t, options: { bold: true, color: WHITE, fill: { color }, fontSize: 13, valign: "middle" } });
const cell = (t, opts = {}) => ({ text: t, options: { fontSize: 12, color: INK, valign: "middle", fontFace: opts.code ? "Consolas" : undefined } });
const rows = [
  [head("Capability", "5C5C5C"), head("REST (apps)", REST), head("MCP tool (agents)", MCP)],
  [cell("List pizzas"), cell("GET /api/pizzas", { code: true }), cell("get_pizzas", { code: true })],
  [cell("Get one pizza"), cell("GET /api/pizzas/{id}", { code: true }), cell("get_pizza_by_id", { code: true })],
  [cell("List / filter orders"), cell("GET /api/orders", { code: true }), cell("get_orders", { code: true })],
  [cell("Place order"), cell("POST /api/orders", { code: true }), cell("place_order", { code: true })],
  [cell("Cancel order"), cell("DELETE /api/orders/{id}", { code: true }), cell("delete_order_by_id", { code: true })],
];
s2.addTable(rows, { x: 0.6, y: 1.4, w: 12.1, colW: [3.3, 4.6, 4.2], rowH: 0.55, border: { type: "solid", color: "DEDEDE", pt: 1 }, align: "left" });

s2.addText([
  { text: "One source of truth — pizza-api owns data & logic; pizza-mcp stores nothing.", options: { bullet: true, breakLine: true } },
  { text: "Contract per audience — OpenAPI for HTTP clients, Zod tool schemas for LLMs.", options: { bullet: true, breakLine: true } },
  { text: "Adapter pattern — MCP delegates each call to an injected REST client.", options: { bullet: true } },
], { x: 0.6, y: 5.2, w: 12.1, h: 1.6, fontSize: 13, color: MUTED });

await pres.writeFile({ fileName: OUT });
console.log("Wrote", OUT);
