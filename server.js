
import express from 'express';
import InvoiceGenerator from './src/InvoiceGenerator.js'; 
import PIGenerator from './src/PIGenerator.js';
import PackingListGenerator from './src/PackingListGenerator.js';
import InvoiceAccGenerator from './src/InvoiceAccGenerator.js';

const app = express();
const PORT = process.env.PORT || 8080;

const data = {
        id: "2e2b0832-7e9a-4a88-aa82-856404faa65e",
        created_at: "2026-09-14T03:51:01.304Z",
        created_by: "9de611cb-eced-455c-84f2-bff31b409f9b",
        updated_at: "2026-09-14T04:00:42.389Z",
        updated_by: "9de611cb-eced-455c-84f2-bff31b409f9b",
        tenant_id: "56c4f65f-daac-48ca-9f61-735582b4b4f3",
        order_id: "7a766cac-2a2f-4f98-90f7-0bac677e5406",
        invoice_number: "INV202609143059",
        invoice_date: "2026-09-14T00:00:00.000Z",
        invoice_type: "customs_invoice",
        status: "draft",
        revision: 1,
        customer_name: "MITACHARM",
        customer_code: "E0417",
        order_number: "SO202609146946",
        po_number: "",
        due_date: "2025-09-29T00:00:00.000Z",
        billing_address: "",
        shipping_address: "",
        description: "",
        remark: "STUFFED INTO 2 x 20' CONTAINER",
        subtotal: null,
        discount_type: "",
        discount_percent: null,
        discount_amount: null,
        tax: null,
        shipping_amount: null,
        other_amount: null,
        total: "24402.00",
        paid: null,
        balance: null,
        payment_term: "L/C 90 DAYS AFTER B/L DATE",
        eta: "2025-07-09",
        etd: "2025-07-01",
        lc_no: "",
        swift: "",
        vessel: "",
        remark2: "",
        remark3: "",
        remark4: "",
        remark5: "",
        ship_to: "",
        shipper: "",
        address1: "",
        address2: "",
        address3: "",
        address4: "",
        address5: "",
        address6: "",
        quantity: "",
        shipment: "",
        tolerace: "",
        bank_name: "",
        consignee1: "",
        consignee2: "",
        consignee3: "",
        line_amount: null,
        account_name: "",
        bank_address: "",
        freight_cost: "1000",
        loading_port: "BANGKOK, THAILAND",
        notify_party: "",
        container_qty: null,
        currency_code: "",
        net_weight_kg: null,
        total_bag_qty: 60,
        account_number: "",
        contract_pi_no: "",
        delivery_terms: "FOB BANGKOK, THAILAND",
        insurance_cost: "2",
        packing_remark: "IN JUMBO BAGS OF ABOUT 500 KGS NET EACH",
        tare_weight_kg: null,
        for_delivery_to: "",
        gross_weight_kg: null,
        packing_remark2: "",
        packing_remark3: "",
        packing_remark4: "",
        packing_remark5: "",
        shipping_remark: "GELTRON 245",
        destination_port: "BANGKOK, THAILAND",
        shipping_remark2: "",
        shipping_remark3: "",
        shipping_remark4: "",
        shipping_remark5: "",
        shipping_remark6: "",
        shipping_remark7: "",
        shipping_remark8: "",
        shipping_remark9: "",
        total_pallet_qty: 20,
        expiry_date_of_lc: null,
        last_of_ship_ment: "",
        shipping_remark10: "",
        total_tare_weight: 279,
        total_gross_weight: 15279,
        total_net_weight_kg: 15000,
        total_invoice_amount: 23400,
        net_weight_of_each_container: 7500,
        gross_weight_of_each_container: 7639.5,
        line_items: [
            {
                id: "64460411-3778-4f4e-b26d-e77906a4e67c",
                created_at: "2026-09-14T03:51:01.304Z",
                created_by: "9de611cb-eced-455c-84f2-bff31b409f9b",
                updated_at: "2026-09-14T03:51:01.304Z",
                updated_by: "9de611cb-eced-455c-84f2-bff31b409f9b",
                tenant_id: "56c4f65f-daac-48ca-9f61-735582b4b4f3",
                invoice_id: "2e2b0832-7e9a-4a88-aa82-856404faa65e",
                item_number: "SOLINE202609146949",
                product_code: "3706G0480500J35",
                product_name: "GELTRON 245",
                description: null,
                configuration: "MODIFIED TAPIOCA STARCH GELTRON 245 'qty'MTS",
                quantity: 30,
                uom: "MT",
                unit_price: "780.00",
                discount_type: null,
                discount_percent: null,
                discount_amount: null,
                total: null,
                remark: "",
                fob_price: 0,
                pallet_qty: 20,
                commission1: 0,
                commission2: 0,
                container_qty: 2,
                loading_place: "GSL' S WAREHOUSE IN LADKRABANG",
                net_weight_kg: 15000,
                container_type: "20'",
                tare_weight_kg: 279,
                gross_weight_kg: 15279,
                freight_cost_usd: 0,
                insurance_cost_usd: 0,
                invoice_description: "MODIFIED TAPIOCA STARCH GELTRON 245 30MTS",
                invoice_description2: "",
                invoice_description3: "",
                invoice_description4: "",
                invoice_description5: "",
                invoice_description6: "",
                bag_qty: null,
                bag_size_kg: null,
                batch_no: null,
                delivery_term: null,
                erp_item_code: null,
                packaging_type: null,
                total_amount: null,
                entity_name: "invoice_line_meta"
            }
        ],
        history: [],
        invoice_types: [
            "Performa Invoice",
            "Order Confirmation",
            "Customer Invoice",
            "Commercial Invoice",
            "Account Invoice"
        ],
        owner: "admin"
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

app.get('/invoice', async (req, res) => {
  
  const pdf = new InvoiceGenerator(data);

  // console.log()

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

app.get('/pi', async (req, res) => {
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
    // console.log(`🔗 เรียกดู PI or OC ได้ที่: http://localhost:${PORT}/pi1`);
    // console.log(`🔗 เรียกดู Packing List ได้ที่: http://localhost:${PORT}/packing`);
    console.log(`🔗 เรียกดู invoive  ได้ที่: http://localhost:${PORT}/invoice`);
    // console.log(`🔗 เรียกดู invoive Customer ได้ที่: http://localhost:${PORT}/invoiceCus`);
});