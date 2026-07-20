
import express from 'express';
import InvoiceGenerator from './src/InvoiceGenerator.js'; 
import OCGenerator from './src/OCGenerator.js';
import PIGenerator from './src/PIGenerator.js';

const app = express();
const PORT = process.env.PORT || 8080;

const data = {
  id: "92468e0c-94f5-431c-a743-4e5babb0ebbd",
  created_at: "2026-07-01T04:26:54.809Z",
  created_by: "de66c268-d5cd-4230-8872-7c304d9b8e32",
  updated_at: "2026-07-01T04:36:11.952Z",
  updated_by: "admin",
  tenant_id: "002",
  order_id: "072aef3b-eba3-4064-8a00-d3301131ccc1",
  status: "draft",
  revision: "1",
  invoice_no: "INV202607017457",
  order_number: "ES250432",
  bill_to_name: "MITACHARM CORPORATION",
  bill_to_address: "19F-6, NO.241, SEC.3 WENXIN RD., XITUN DIST. TAICHUNG CITY 40753 TAIWAN",
  invoice_type: null,
  invoice_date: "2026-06-30T17:00:00.000Z",
  due_date: "2026-07-10T17:00:00.000Z",
  contract_pi_no: "update_contract 2",
  lc_no: "update lc 2",
  ship_to: "TAIPEI, TAIWAN",
  consignee: "",
  notify_party: "",
  shipper: "",
  total_invoice_amount: "14,630.00",
  total_gross_weight: null,
  customer: "",
  customer_po_no: "4503013313",
  ai_ref_number: null,
  payment_terms: "L/C 90 DAYS AFTER B/L DATE",
  currency_code: "USD",
  etd: "2025-11-29T17:00:00.000Z",
  eta: "2025-12-14T17:00:00.000Z",
  vessel: "WAN HAI 277 V.N044",
  loading_port: "",
  delivery_terms: "30.11.2025",
  destination_port: "BHADRACHALAM, TELANGANA, INDIA",
  remark: "STUFFED INTO 1 X 40' CONTAINERS",
  shipping_remark: "DYNAKOTE 68NB",
  net_weight_kg: "22,000.00",
  gross_weight_kg: "22,682.00",
  tare_weight_kg: "682.00",
  container_qty: null,
  line_amount: null,
  freight_cost: null,
  insurance_cost: null,
  gross_weight_per_container: null,
  packing_remark: "IN BAGS OF ABOUT 250 KGS NET EACH",
  intotal: 88,
  quantitytotal: 250,
  amountText: "(TOTAL US DOLLARS FOURTEEN THOUSAND SIX HUNDRED THIRTY ONLY)",
  line_items: [
    {
      description: "MODIFIED TAPIOCA STARCH DYNAKOTE 68NB 22MTS",
      id: "f0bcda21-f7e5-4847-b64b-7b94a5d8bdd9",
      created_at: "2026-07-01T04:26:54.809Z",
      created_by: "de66c268-d5cd-4230-8872-7c304d9b8e32",
      updated_at: "2026-07-01T04:26:54.809Z",
      updated_by: "de66c268-d5cd-4230-8872-7c304d9b8e32",
      tenant_id: "002",
      invoice_id: "92468e0c-94f5-431c-a743-4e5babb0ebbd",
      delivery_term: "30.11.2025",
      container_qty: 0,
      container_type: "",
      erp_item_code: "C STARCH",
      freight_cost_usd: null,
      gross_weight_kg: null,
      tare_weight_kg: null,
      insurance_cost_usd: null,
      loading_place: "",
      net_weight_kg: null,
      packaging_type: "",
      bag_size_kg: null,
      pallet_qty: 250,
      qty_mt: "22.00",
      bag_qty: 88,
      unit_price_usd_mt: "665.00",
      line_amount: "14,630.00",
      batch_no: ""
    },
    {
      id: "0ba37328-9c5f-449e-ad6e-4df4da0cba04",
      description: "description 2",
      created_at: "2026-07-01T04:26:54.809Z",
      created_by: "de66c268-d5cd-4230-8872-7c304d9b8e32",
      updated_at: "2026-07-01T04:26:54.809Z",
      updated_by: "de66c268-d5cd-4230-8872-7c304d9b8e32",
      tenant_id: "002",
      invoice_id: "92468e0c-94f5-431c-a743-4e5babb0ebbd",
      delivery_term: "30.11.2025",
      container_qty: 0,
      container_type: "",
      erp_item_code: "O.STARCH",
      freight_cost_usd: null,
      gross_weight_kg: null,
      tare_weight_kg: null,
      insurance_cost_usd: null,
      loading_place: "",
      net_weight_kg: null,
      packaging_type: "",
      bag_size_kg: null,
      pallet_qty: 0,
      qty_mt: "799.00",
      bag_qty: 5,
      unit_price_usd_mt: "720.00",
      line_amount: "1,111.00",
      batch_no: ""
    },
    {
      description: "description 3",
      id: "3814bedf-12b9-46fe-affb-1fcc980b9327",
      created_at: "2026-07-01T04:26:54.809Z",
      created_by: "de66c268-d5cd-4230-8872-7c304d9b8e32",
      updated_at: "2026-07-01T04:26:54.809Z",
      updated_by: "de66c268-d5cd-4230-8872-7c304d9b8e32",
      tenant_id: "002",
      invoice_id: "92468e0c-94f5-431c-a743-4e5babb0ebbd",
      delivery_term: "30.11.2025",
      container_qty: 0,
      container_type: "",
      erp_item_code: "S.STARCH",
      freight_cost_usd: null,
      gross_weight_kg: null,
      tare_weight_kg: null,
      insurance_cost_usd: null,
      loading_place: "",
      net_weight_kg: null,
      packaging_type: "",
      bag_size_kg: null,
      pallet_qty: 0,
      qty_mt: "2074.00",
      bag_qty: 45,
      unit_price_usd_mt: "710.00",
      line_amount: "710.00",
      batch_no: ""
    }
  ],
  history: [],
  owner: "admin",
  invoice_types: [
    "Performa Invoice",
    "Order Confirmation",
    "Customer Invoice",
    "Commercial Invoice",
    "Account Invoice"
  ]
};

// URL Endpoint สำหรับเรียกสร้างและดาวน์โหลดเอกสาร PDF
app.get('/invoice2', async (req, res) => {
  const pdf = new InvoiceGenerator(data);

  const pdfBytes = await pdf.generateInvoice();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename=invoice.pdf'
  );

  res.send(Buffer.from(pdfBytes));
});

app.get('/oc', async (req, res) => {
  const pdf = new OCGenerator(data);

  const pdfBytes = await pdf.generateOC();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename=invoice.pdf'
  );

  res.send(Buffer.from(pdfBytes));
});

app.get('/pi1', async (req, res) => {
  const pdf = new PIGenerator(data);

  const pdfBytes = await pdf.generatePI1();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename=invoice.pdf'
  );

  res.send(Buffer.from(pdfBytes));
});

app.get('/pi2', async (req, res) => {
  const pdf = new PIGenerator(data);

  const pdfBytes = await pdf.generatePI2();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename=invoice.pdf'
  );

  res.send(Buffer.from(pdfBytes));
});


// เริ่มทำงานเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`🚀 เซิร์ฟเวอร์รันเรียบร้อยแล้วที่ http://localhost:${PORT}`);
    console.log(`🔗 เรียกดูหรือดาวน์โหลด PDF ได้ที่: http://localhost:${PORT}/invoice2`);
});