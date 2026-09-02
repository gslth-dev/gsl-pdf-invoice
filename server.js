
import express from 'express';
import InvoiceGenerator from './src/InvoiceGenerator.js'; 
import PIGenerator from './src/PIGenerator.js';
import PackingListGenerator from './src/PackingListGenerator.js';
import InvoiceAccGenerator from './src/InvoiceAccGenerator.js';

const app = express();
const PORT = process.env.PORT || 8080;

const data = {
         id: null,
         created_at: null,
         created_by: null,
         updated_at: null,
         updated_by: null,
         tenant_id: null,
         order_id: null,
         status: "draft",
         revision: "1",
         invoice_no: "invoice_no",
         invoice_type: 'proforma_invoice',
         invoice_date: "2026-06-13T00:00:00.000Z",
         contract_pi_no: "contract_pi_no",
         lc_no: null,
         ship_to: "ship_to",
         consignee: null,
         notify_party: null,
         shipper: "shipper",
         total_invoice_amount: 45900.50,
         total_gross_weight: 18216,
         customer: "TOP BLOSSOM HOLDINGS LIMITED",
         customer_po_no: "TBHL-20260504 (1st LOT)",
         ai_ref_number: null,
         payment_terms: "T/T IN ADVANCE",
         currency_code: "USD",
         etd: "2026-06-13T00:00:00.000Z",
         eta: "2026-06-30T00:00:00.000Z",
         vessel: "vessel",
         loading_port: "BANGKOK, THAILAND",
         delivery_terms: "CIF YANGZHOU, CHINA",
         destination_port: "YANGZHOU, CHINA",
         remark: "STUFFED INTO 1 x 20' CONTAINER",
         shipping_remark: "TBOND 880",
         net_weight_kg: 18000,
         gross_weight_kg: 123,
         tare_weight_kg: 216,
         container_qty: 1,
         line_amount: 45900,
         freight_cost: 1,
         insurance_cost: 1,
         gross_weight_per_container: null,
         total_bag_qty: 720,
         total_pallet_qty: 10,
         remark2: null,
         remark3: null,
         remark4: null,
         remark5: null,
         packing_remark: "IN PAPER BAGS OF ABOUT 25 KGS NET EACH",
         packing_remark2: null,
         packing_remark3: null,
         packing_remark4: null,
         packing_remark5: null,
         shipping_remark2: null,
         shipping_remark3: null,
         shipping_remark4: null,
         shipping_remark5: null,
         shipping_remark6: null,
         shipping_remark7: null,
         shipping_remark8: null,
         shipping_remark9: null,
         shipping_remark10: null,
         po_date: "2026-05-04",
         loading_date: "2026-06-08",
         payment_terms_code: "T/T ADV",
         delivery_terms_code: "CIF YANGZHOU, CHINA",
         destination_port_code: "YANGZHOU",
         loading_port_code: "1",
         exchange_rate: "",
         pool: "",
         ai_generated_flag: "Y",
         estimated_flag: "",
         so_status: "",
         erp_get: "N",
         lot: 1,
         shipment: "shipment",
         last_of_ship_ment: "",
         expiry_date_of_lc: "",
         tolerace: "",
         bank_name: "KASIKORNBANK PUBLIC COMPANY LIMITED (PHAHONYOTHIN BRANCH)",
         bank_address: "400/22 PHAHONYOTHIN ROAD, BANGKOK 10400, THAILAND",
         account_name: "GENERAL STARCH LIMITED",
         account_number: "099-1-26446-9 THE CURRENT A/C",
         s_w_i_f_t: "KASITHBK",
         address1: "19F-6,NO.241, SEC.3, WENXIN RD., XITUN DIST.,",
         address2: "TAICHUNG CITY 40753 TAIWAN",
         address3: "address3",
         address4: "address4",
         address5: "",
         address6: "",
         invoice_due_date: "2026-05-01",
         quantity: "153.00565344 MT (120 PALLETS / 180180 Bags (6 containers) 153MT (Relabeled RediStrength HC for the customer))",
         consignee1: "CHAMPION CHEMICALS (YANGZHOU) COMPANY LIMITED",
         consignee2: "NO.9-10 CHUANG YE ROAD, YANGZHOU CHEMICAL",
         consignee3: "INDUSTRY PARK, YIZHENG CITY, JIANGSU, CHINA. 211417",
         net_weight_of_each_container: 4250,
         for_delivery_to: "CH Robinson - 1401 St. Stephens Rd, Prichard Al 36610",
         gross_weight_of_each_container: 4330,
         order_no: "order_no",
         total_amount: 49000,
         line_items: [
            {
                 id: null,
                 created_at: null,
                 created_by: null,
                 updated_at: null,
                 updated_by: null,
                 tenant_id: null,
                 invoice_id: null,
                 delivery_term: "CIF YANGZHOU, CHINA",
                 container_qty: 1,
                 container_type: "20'",
                 erp_item_code: "3511T0250025D44",
                 freight_cost_usd: 0,
                 gross_weight_kg: 18216,
                 tare_weight_kg: 216,
                 insurance_cost_usd: 0,
                 loading_place: "KORNBURI",
                 net_weight_kg: 18000,
                 packaging_type: "25KG PAPER BAG",
                 bag_size_kg: 25,
                 pallet_qty: 0,
                 qty_mt: "30.000",
                 bag_qty: 720,
                 unit_price_usd_mt: "1530.00",
                 line_amount: 45900,
                 batch_no: null,
                 item_number: 1,
                 product_name: "TBOND 880",
                 description: "MODIFIED TAPIOCA STARCH",
                 fob_price: 0,
                 commission1: 0,
                 commission2: 0,
                 invoice_description: "MODIFIED TAPIOCA STARCH",
                 configuration: "MODIFIED TAPIOCA STARCH",
                 quantity_raw: 30,
                 uom_raw: "MT",
                 unit_price_raw: 1530,
                 unit_price_uom_raw: "USD",
                 loading_code: "2",
                 eta: "2026-06-30",
                 packed_pallet: false,
                 use_pallet: "",
                 ai_ref_number: "",
                 erp_get: "N",
                 invoice_description2: "TBOND 880",
                 invoice_description3: "",
                 invoice_description4: "",
                 invoice_description5: "",
                 invoice_description6: "",
                 batch: [
                    {
                        "batch_no": "31431",
                        "bags": 732
                    },
                    {
                        "batch_no": "79829",
                        "bags": 539
                    },
                    {
                        "batch_no": "42165",
                        "bags": 1064
                    }
                ]
            },
            {
                 id: null,
                 created_at: null,
                 created_by: null,
                 updated_at: null,
                 updated_by: null,
                 tenant_id: null,
                 invoice_id: null,
                 delivery_term: "CIF YANGZHOU, CHINA",
                 container_qty: 1,
                 container_type: "20'",
                 erp_item_code: "3511T0250025D44",
                 freight_cost_usd: 0,
                 gross_weight_kg: 18216,
                 tare_weight_kg: 216,
                 insurance_cost_usd: 0,
                 loading_place: "KORNBURI",
                 net_weight_kg: 18000,
                 packaging_type: "25KG PAPER BAG",
                 bag_size_kg: 25,
                 pallet_qty: 0,
                 qty_mt: "30.000",
                 bag_qty: 720,
                 unit_price_usd_mt: "1530.00",
                 line_amount: 45900,
                 batch_no: null,
                 item_number: 1,
                 product_name: "TBOND 880",
                 description: "MODIFIED TAPIOCA STARCH",
                 fob_price: 0,
                 commission1: 0,
                 commission2: 0,
                 invoice_description: "MODIFIED TAPIOCA STARCH",
                 configuration: "MODIFIED TAPIOCA STARCH",
                 quantity_raw: 30,
                 uom_raw: "MT",
                 unit_price_raw: 1530,
                 unit_price_uom_raw: "USD",
                 loading_code: "2",
                 eta: "2026-06-30",
                 packed_pallet: false,
                 use_pallet: "",
                 ai_ref_number: "",
                 erp_get: "N",
                 invoice_description2: "TBOND 1200",
                 invoice_description3: "",
                 invoice_description4: "",
                 invoice_description5: "",
                 invoice_description6: "",
                 batch: [
                    {
                        "batch_no": "0001",
                        "bags": 25
                    },
                    {
                        "batch_no": "45678",
                        "bags": 26
                    },
                    {
                        "batch_no": "21156",
                        "bags": 30
                    }
                ]
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