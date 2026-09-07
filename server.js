
import express from 'express';
import InvoiceGenerator from './src/InvoiceGenerator.js'; 
import PIGenerator from './src/PIGenerator.js';
import PackingListGenerator from './src/PackingListGenerator.js';
import InvoiceAccGenerator from './src/InvoiceAccGenerator.js';

const app = express();
const PORT = process.env.PORT || 8080;

const data = {
  id: 'd22be222-8bf9-4069-859e-dfe7b00de270',
  created_at: '2026-09-07T07:05:28.356Z',
  created_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
  updated_at: '2026-09-07T07:05:28.356Z',
  updated_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
  tenant_id: '56c4f65f-daac-48ca-9f61-735582b4b4f3',
  order_id: '22cab5fe-834b-41db-8f48-a2bfa9e493f1',
  invoice_number: 'INV202609071360',
  invoice_date: '2026-09-06T17:00:00.000Z',
  invoice_type: 'invoice',
  status: 'draft',
  revision: 1,
  customer_name: 'Xiamen Port Commerce',
  customer_code: 'E0615',
  order_number: 'SO202609078300',
  po_number: 'XM PCI-20240716 (1st LOT)',
  due_date: null,
  billing_address: '',
  shipping_address: '',
  description: '',
  remark: "STUFFED INTO 16 x 20' CONTAINER",
  subtotal: null,
  discount_type: '',
  discount_percent: null,
  discount_amount: null,
  tax: null,
  shipping_amount: null,
  other_amount: null,
  total: null,
  paid: null,
  balance: null,
  payment_term: 'L/C 90 DAYS AFTER B/L DATE',
  eta: '2024-09-14',
  etd: '2024-09-05',
  lc_no: '',
  swift: '',
  vessel: '',
  remark2: '',
  remark3: '',
  remark4: '',
  remark5: '',
  shipper: '',
  address1: '',
  address2: '',
  address3: '',
  address4: '',
  address5: '',
  address6: '',
  shipment: '',
  tolerace: '',
  bank_name: '',
  consignee: '',
  line_amount: null,
  account_name: '',
  bank_address: '',
  freight_cost: null,
  loading_port: 'BANGKOK, THAILAND',
  notify_party: '',
  container_qty: null,
  currency_code: 'USD',
  net_weight_kg: null,
  total_bag_qty: 4320,
  account_number: '',
  contract_pi_no: '',
  delivery_terms: 'FOB BANGKOK, THAILAND',
  insurance_cost: null,
  packing_remark: 'IN PAPER BAGS OF ABOUT 25 KGS NET EACH',
  tare_weight_kg: null,
  gross_weight_kg: null,
  packing_remark2: '',
  packing_remark3: '',
  packing_remark4: '',
  packing_remark5: '',
  shipping_remark: 'C 30',
  destination_port: 'BANGKOK, THAILAND',
  shipping_remark2: 'C 30',
  shipping_remark3: 'C 30',
  shipping_remark4: '',
  shipping_remark5: '',
  shipping_remark6: '',
  shipping_remark7: '',
  shipping_remark8: '',
  shipping_remark9: '',
  total_pallet_qty: 0,
  expiry_date_of_lc: null,
  last_of_ship_ment: '',
  shipping_remark10: '',
  total_tare_weight: 432,
  total_gross_weight: 36432,
  total_net_weight_kg: 36000,
  total_invoice_amount: 198350,
  gross_weight_per_container: null,
  line_items: [
    {
      id: '1f173a96-cee8-416a-9e60-f784a3fdc585',
      created_at: '2026-09-07T07:05:28.356Z',
      created_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      updated_at: '2026-09-07T07:05:28.356Z',
      updated_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      tenant_id: '56c4f65f-daac-48ca-9f61-735582b4b4f3',
      invoice_id: 'd22be222-8bf9-4069-859e-dfe7b00de270',
      item_number: 'SOLINE202609075649',
      product_code: '3711C0110025D43',
      product_name: 'C 30',
      description: null,
      configuration: 'MODIFIED TAPIOCA STARCH',
      quantity: 170,
      uom: 'MT',
      unit_price: '700.00',
      discount_type: null,
      discount_percent: null,
      discount_amount: null,
      total: null,
      remark: '',
      fob_price: 0,
      pallet_qty: 0,
      commission1: 0,
      commission2: 0,
      container_qty: 10,
      loading_place: 'KORNBURI',
      net_weight_kg: 0,
      container_type: "20'",
      tare_weight_kg: 0,
      gross_weight_kg: 0,
      freight_cost_usd: 0,
      insurance_cost_usd: 0,
      invoice_description: '',
      invoice_description2: '',
      invoice_description3: '',
      invoice_description4: '',
      invoice_description5: '',
      invoice_description6: '',
      bag_qty: null,
      bag_size_kg: null,
      batch_no: null,
      delivery_term: null,
      erp_item_code: null,
      packaging_type: null,
      total_amount: null
    },
    {
      id: '9f22906f-8fa7-4b6b-9528-007516517367',
      created_at: '2026-09-07T07:05:28.356Z',
      created_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      updated_at: '2026-09-07T07:05:28.356Z',
      updated_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      tenant_id: '56c4f65f-daac-48ca-9f61-735582b4b4f3',
      invoice_id: 'd22be222-8bf9-4069-859e-dfe7b00de270',
      item_number: 'SOLINE202609075451',
      product_code: '3711C0110025D43',
      product_name: 'C 30',
      description: null,
      configuration: 'MODIFIED TAPIOCA STARCH',
      quantity: 75,
      uom: 'MT',
      unit_price: '710.00',
      discount_type: null,
      discount_percent: null,
      discount_amount: null,
      total: null,
      remark: '',
      fob_price: 0,
      pallet_qty: 0,
      commission1: 0,
      commission2: 0,
      container_qty: 4,
      loading_place: 'KORNBURI',
      net_weight_kg: 18000,
      container_type: "20'",
      tare_weight_kg: 216,
      gross_weight_kg: 18216,
      freight_cost_usd: 0,
      insurance_cost_usd: 0,
      invoice_description: '',
      invoice_description2: '',
      invoice_description3: '',
      invoice_description4: '',
      invoice_description5: '',
      invoice_description6: '',
      bag_qty: null,
      bag_size_kg: null,
      batch_no: null,
      delivery_term: null,
      erp_item_code: null,
      packaging_type: null,
      total_amount: null
    },
    {
      id: 'a922f3e2-6d31-4d1a-ae2b-27fe89bec170',
      created_at: '2026-09-07T07:05:28.356Z',
      created_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      updated_at: '2026-09-07T07:05:28.356Z',
      updated_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      tenant_id: '56c4f65f-daac-48ca-9f61-735582b4b4f3',
      invoice_id: 'd22be222-8bf9-4069-859e-dfe7b00de270',
      item_number: 'SOLINE202609079343',
      product_code: '3711C0110025D43',
      product_name: 'C 30',
      description: null,
      configuration: 'MODIFIED TAPIOCA STARCH',
      quantity: 36,
      uom: 'MT',
      unit_price: '725.00',
      discount_type: null,
      discount_percent: null,
      discount_amount: null,
      total: null,
      remark: '',
      fob_price: 0,
      pallet_qty: 0,
      commission1: 0,
      commission2: 0,
      container_qty: 2,
      loading_place: 'KORNBURI',
      net_weight_kg: 18000,
      container_type: "20'",
      tare_weight_kg: 216,
      gross_weight_kg: 18216,
      freight_cost_usd: 0,
      insurance_cost_usd: 0,
      invoice_description: '',
      invoice_description2: '',
      invoice_description3: '',
      invoice_description4: '',
      invoice_description5: '',
      invoice_description6: '',
      bag_qty: null,
      bag_size_kg: null,
      batch_no: null,
      delivery_term: null,
      erp_item_code: null,
      packaging_type: null,
      total_amount: null
    }
  ],
  owner: 'admin'
}


// URL Endpoint สำหรับเรียกสร้างและดาวน์โหลดเอกสาร PDF

app.get('/invoiceAcc', async (req, res) => {
  
  const pdf = new InvoiceAccGenerator(data);

  const pdfBytes = await pdf.generateInvoice();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename=invoice.pdf'
  );

  res.send(Buffer.from(pdfBytes));
});

app.get('/invoiceCus', async (req, res) => {
  
  const pdf = new InvoiceGenerator(data);

  const pdfBytes = await pdf.generateInvoice();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename=invoice.pdf'
  );

  res.send(Buffer.from(pdfBytes));
});


app.get('/packing', async (req, res) => {
  const pdf = new PackingListGenerator(data);

  const pdfBytes = await pdf.generatePL();

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



// เริ่มทำงานเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`🚀 เซิร์ฟเวอร์รันเรียบร้อยแล้วที่ http://localhost:${PORT}`);
    console.log(`🔗 เรียกดู PI or OC ได้ที่: http://localhost:${PORT}/pi1`);
    console.log(`🔗 เรียกดู Packing List ได้ที่: http://localhost:${PORT}/packing`);
    console.log(`🔗 เรียกดู invoive Acc ได้ที่: http://localhost:${PORT}/invoiceAcc`);
    console.log(`🔗 เรียกดู invoive Customer ได้ที่: http://localhost:${PORT}/invoiceCus`);
});