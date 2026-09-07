
import express from 'express';
import InvoiceGenerator from './src/InvoiceGenerator.js'; 
import PIGenerator from './src/PIGenerator.js';
import PackingListGenerator from './src/PackingListGenerator.js';
import InvoiceAccGenerator from './src/InvoiceAccGenerator.js';

const app = express();
const PORT = process.env.PORT || 8080;

const data = {
  id: 'c78afa7f-5613-4d33-bebd-ea16335793e7',
  created_at: '2026-09-04T06:49:17.709Z',
  created_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
  updated_at: '2026-09-04T06:49:17.709Z',
  updated_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
  tenant_id: '56c4f65f-daac-48ca-9f61-735582b4b4f3',
  order_id: '407cd03c-0f52-4dd2-9e66-dd0a813c9ba1',
  invoice_number: 'INV202609044543',
  invoice_date: '2026-09-03T17:00:00.000Z',
  invoice_type: 'invoice',
  status: 'new',
  revision: 1,
  customer_name: 'TOP BLOSSOM',
  customer_code: 'E0663',
  order_number: 'SO202609043566',
  po_number: 'TBHL-20260504 (1st LOT)',
  due_date: null,
  billing_address: '',
  shipping_address: '',
  description: '',
  remark: "STUFFED INTO 1 x 20' CONTAINER",
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
  payment_term: 'T/T IN ADVANCE',
  eta: '2026-06-30',
  etd: '2026-06-13',
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
  total_bag_qty: 720,
  account_number: '',
  contract_pi_no: '',
  delivery_terms: 'CIF YANGZHOU, CHINA',
  insurance_cost: null,
  packing_remark: 'IN PAPER BAGS OF ABOUT 25 KGS NET EACH',
  tare_weight_kg: null,
  gross_weight_kg: null,
  packing_remark2: '',
  packing_remark3: '',
  packing_remark4: '',
  packing_remark5: '',
  shipping_remark: 'TBOND 880',
  destination_port: 'YANGZHOU, CHINA',
  shipping_remark2: '',
  shipping_remark3: '',
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
  total_tare_weight: 216,
  total_gross_weight: 18216,
  total_net_weight_kg: 18000,
  total_invoice_amount: 45900,
  gross_weight_per_container: null,
  line_items: [
    {
      id: '1145c5b0-a825-45b7-9554-5a500618d820',
      created_at: '2026-09-04T06:49:17.709Z',
      created_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      updated_at: '2026-09-04T06:49:17.709Z',
      updated_by: '9de611cb-eced-455c-84f2-bff31b409f9b',
      tenant_id: '56c4f65f-daac-48ca-9f61-735582b4b4f3',
      invoice_id: 'c78afa7f-5613-4d33-bebd-ea16335793e7',
      item_number: 'SOLINE202609046121',
      product_code: '3511T0250025D44',
      product_name: 'TBOND 880',
      description: null,
      configuration: 'MODIFIED TAPIOCA STARCH',
      quantity: 30,
      uom: 'MT',
      unit_price: '1530.00',
      discount_type: null,
      discount_percent: null,
      discount_amount: null,
      total: null,
      remark: '',
      fob_price: 0,
      pallet_qty: 0,
      commission1: 0,
      commission2: 0,
      container_qty: 1,
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
      invoice_description6: ''
    }
  ]
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