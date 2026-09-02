import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let y_end ;
class InvoiceGenerator {
  static HEADER_IMAGE = path.resolve(
    __dirname,
    '../public/GSL_header_vector.png'
  );

  constructor(data) {
    this.data = data;
  }
  
  async generateInvoice() {

    
    this.pdfDoc = await PDFDocument.create();

    this.pdfDoc.registerFontkit(fontkit);
    this.page = this.pdfDoc.addPage([595.28, 841.89]);

    const fontBytes = fs.readFileSync(
      path.resolve(__dirname, '../fonts/THSarabunNew.ttf')
    );

    this.font = await this.pdfDoc.embedFont(fontBytes);

    const boldBytes = fs.readFileSync(
      path.resolve(__dirname, '../fonts/THSarabunNew Bold.ttf')
    );

    this.bold = await this.pdfDoc.embedFont(boldBytes);

    await this._drawHeader();
    this._drawTitle();
    this._drawCustomerInfo();
    this._drawTable();
    this._drawFooter();

    return await this.pdfDoc.save();
  }

  async _generate(outputPath = "invoice.pdf") {
    this.pdfDoc = await PDFDocument.create();

    this.page = this.pdfDoc.addPage([595.28, 841.89]);

    this.width = this.page.getWidth();
    this.height = this.page.getHeight();

    this.font = await this.pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    this.bold = await this.pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    this.drawHeader();
    this.drawTitle();
    this.drawCustomerInfo();
    this.drawTable();
    this.drawFooter();

    const pdfBytes = await this.pdfDoc.save();

    fs.writeFileSync(outputPath, pdfBytes);

    return outputPath;
  }

  _drawText(
    text,
    x,
    y,
    size = 10,
    bold = false,
    color = rgb(0, 0, 0)
  ) {
    this.page.drawText(String(text || ""), {
      x,
      y,
      size,
      color,
      font: bold ? this.bold : this.font,
    });
  }

  async _drawHeader() {
    const headerBytes = fs.readFileSync(InvoiceGenerator.HEADER_IMAGE);
    const headerImage = await this.pdfDoc.embedPng(headerBytes);

    const headerDims = headerImage.scale(0.25);

    this.page.drawImage(headerImage, {
        x: 40,
        y: 758,
        width: 515,
        height: 65
    });

    this._drawText(
      "PAGE 1 OF 1",
      500,
      710,
      10
    );
  }

  _drawTitle() {
    this._drawText(
      "INVOICE",
      255,
      690,
      20,
      true
    );
  }

  _drawCustomerInfo() {
    const labelSize = 12;
    const valueSize = 12;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 340;
    const rightValueX = 390;    

    const startY = 670;
    const lineGap = 15; 
  
    let leftY = startY;
    this._drawText("INVOICE NO. :", leftX, leftY, labelSize, true);
    this._drawText(this.data.invoice_no, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("SALE ORDER NO. :", leftX, leftY, labelSize, true);
    this._drawText(this.data.order_no, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("CONTRACT NO. :", leftX, leftY, labelSize, true);
    this._drawText(this.data.contract_pi_no, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("BILL TO :", leftX, leftY, labelSize, true);
    
    
     this._drawText(this.data.address1, valueX-30, leftY, valueSize);

    if(this.data.address2){
      leftY -= lineGap;
      this._drawText(this.data.address2, valueX-30, leftY, valueSize);
    }
    if(this.data.address3){
      leftY -= lineGap;
      this._drawText(this.data.address3, valueX-30, leftY, valueSize);
    }
    if(this.data.address4){
      leftY -= lineGap;
      this._drawText(this.data.address4, valueX-30, leftY, valueSize);
    }
    if(this.data.address5){
      leftY -= lineGap;
      this._drawText(this.data.address5, valueX-30, leftY, valueSize);
    }
    if(this.data.address6){
      leftY -= lineGap;
      this._drawText(this.data.address6, valueX-30, leftY, valueSize);
    }

   
    leftY -= lineGap;
    this._drawText("TERM OF PAYMENT :", leftX, leftY, labelSize, true);
    this._drawText(this.data.payment_terms, valueX, leftY, valueSize);

    leftY -= lineGap;
    this._drawText("SHIPMENT BY :", leftX, leftY, labelSize, true);
    this._drawText(this.data.vessel, valueX, leftY, valueSize);

    leftY -= lineGap;
    this._drawText("FROM :", leftX, leftY, labelSize, true);
    this._drawText(this.data.loading_port, valueX, leftY, valueSize);


    let rightY = startY
    const dateObject = new Date();

    const date_formattedDateUTC = dateObject.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText("DATE :", rightLabelX+100, rightY, labelSize, true);
    this._drawText(date_formattedDateUTC, rightLabelX+135, rightY, valueSize);

    rightY -= (lineGap * 3)
    this._drawText("SHIP TO :", rightLabelX, rightY, labelSize, true);
    this._drawText(this.data.ship_to, rightValueX, rightY, valueSize);



    rightY = leftY + (lineGap * 2)
    if(this.data.invoice_due_date != "" && this.data.invoice_due_date != null) {
      const due_date_obj = new Date(this.data.invoice_due_date);

      const due_date_formattedDateUTC = due_date_obj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC' // Forces UTC interpretation
      }).toUpperCase();

      this._drawText("DUE DATE :", rightLabelX, rightY, labelSize, true);
      this._drawText(due_date_formattedDateUTC, rightValueX, rightY, valueSize);
    }
    


    rightY -= lineGap 
    const date_etd = new Date(this.data.etd);

    const etd_formattedDate = date_etd.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETD :", rightLabelX, rightY, labelSize, true);
    this._drawText(etd_formattedDate, rightValueX, rightY, valueSize);


    rightY -= lineGap 
    const date_eta = new Date(this.data.eta);

    const eta_formattedDate = date_eta.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETA :", rightLabelX, rightY, labelSize, true);
    this._drawText(eta_formattedDate, rightValueX, rightY, valueSize);

    y_end = rightY
  }

  _drawTable() {
    let y = y_end-45;
    const fontSize = 12;
    const quantityX = 340;

    this.page.drawLine({
      start: { x: 40, y: y + 30 },
      end: { x: 555, y: y + 30 },
      thickness: 1,
    });

    this._drawText("DESCRIPTION", 50, y + 15, fontSize, true);
    this._drawText("QUANTITY", 340, y + 15, fontSize, true);
    this._drawText("UNIT PRICE", 430, y + 15, fontSize, true);
    this._drawText("(USD PER MT)", 430, y+5 , fontSize, true);

    let text = "AMOUNT";
    let textWidth = this.font.widthOfTextAtSize(text, fontSize);
    let x = this.page.getWidth() - textWidth - 45;

    this._drawText("AMOUNT", x, y + 15, fontSize, true);

    text = "USD";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 50;

    this._drawText("(USD)", x, y +5, fontSize, true);

    this.page.drawLine({
      start: { x: 40, y },
      end: { x: 555, y },
      thickness: 1,
    });

    let currentY = y; 
    const rowHeight = 15; // ความสูงของแต่ละแถว

    for (const item of this.data.line_items) {

      this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);

      this._drawText(item.bag_qty +" x "+item.pallet_qty+" KGS = "+item.qty_mt + " MT" || "0.00", 320, currentY - 15, fontSize);
      this._drawText(Number(item.unit_price_usd_mt).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) || "0.00", 450, currentY - 15, fontSize);

      const amountText = Number(item.line_amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      let textWidth = 0;
      let amountX = this.page.getWidth() - 40; // ค่า default ถ้าไม่มีข้อความ

      if (amountText) {
        textWidth = this.font.widthOfTextAtSize(amountText, fontSize);
        amountX = this.page.getWidth() - textWidth - 40;
      }
      
      // วาด Line Amount
      this._drawText(amountText, amountX, currentY - 15, fontSize);

      

      // ลดพิกัด Y ลงไปสำหรับรายการถัดไป
      currentY -= rowHeight;
      // this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);

      if(item.invoice_description2 != "" && item.invoice_description2 != null){
        currentY -= rowHeight;
        this._drawText( item.invoice_description2, 40, currentY , fontSize);
      }
      if(item.invoice_description3 != "" && item.invoice_description3 != null){
        currentY -= rowHeight;
        this._drawText( item.invoice_description3, 40, currentY , fontSize);
      }
      if(item.invoice_description4 != "" && item.invoice_description4 != null){
        currentY -= rowHeight;
        this._drawText( item.invoice_description4, 40, currentY , fontSize);
      }
      if(item.invoice_description5 != "" && item.invoice_description5 != null){
        currentY -= rowHeight;
        this._drawText( item.invoice_description5, 40, currentY , fontSize);
      }
      if(item.invoice_description6 != "" && item.invoice_description6 != null){
        currentY -= rowHeight;
        this._drawText( item.invoice_description6, 40, currentY , fontSize);
      }
      y = currentY

    }

    this.page.drawLine({
      start: { x: 500, y: currentY },
      end: { x: 555, y: currentY },
      thickness: 1,
    });

    y = y+15
    text = "TOTAL FOB " + this.data.loading_port;
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 120;
    this._drawText(text , x, y - 30, fontSize);

    text = Number(this.data.total_invoice_amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 40;

    y = y - 30
    this._drawText(text, x, y, fontSize);

    if(this.data.freight_cost != 0 && this.data.freight_cost != null) {
      y -= 15;
      text = "FREIGHT"
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = this.page.getWidth() - textWidth - 120;
      this._drawText(text, x, y, fontSize);


      text = Number(this.data.freight_cost).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = this.page.getWidth() - textWidth - 40;
      this._drawText(text, x, y, fontSize);

    }

    if(this.data.insurance_cost != 0 && this.data.insurance_cost != null) {
      y -= 15;
      text = "INSURANCE"
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = this.page.getWidth() - textWidth - 120;
      this._drawText(text, x, y, fontSize);


      text = Number(this.data.insurance_cost).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = this.page.getWidth() - textWidth - 40;
      this._drawText(text, x, y, fontSize);

    }

    if((this.data.insurance_cost != null && this.data.insurance_cost != 0) || (this.data.freight_cost != null && this.data.freight_cost != 0)) {
      this.page.drawLine({
        start: { x: 500, y: y - 2 },
        end: { x: 555, y: y - 2 },
        thickness: 1,
        color:  rgb(0, 0, 0),
      });

      y -= 15
      text = "TOTAL " + this.data.delivery_terms ;
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = this.page.getWidth() - textWidth - 120;
      this._drawText(text , x, y, fontSize);

      text = Number(this.data.total_invoice_amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = this.page.getWidth() - textWidth - 40;
      this._drawText(text, x, y, fontSize);

    }

    const thickness = 1;      
    const gap = 2;              
    const offsetFromText = 4;   

    this.page.drawLine({
        start: { x: 500, y: y - offsetFromText },
        end: { x: 555, y: y - offsetFromText },
        thickness: thickness,
        color:  rgb(0, 0, 0),
    });

    this.page.drawLine({
        start: { x: 500, y: y - offsetFromText - gap - thickness },
        end: { x: 555, y: y - offsetFromText - gap - thickness },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

    y -= 15;
    this._drawText('TOTAL', quantityX - 30, y, fontSize);

    text = String(this.data.total_bag_qty);
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 380 - textWidth -5; 

    this.page.drawLine({
        start: { x: quantityX, y: y+15 - offsetFromText-2 },
        end: { x: 380-5, y: y+15 - offsetFromText-2 },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

    this._drawText(this.data.total_bag_qty, x, y, fontSize);

    this.page.drawLine({
        start: { x: quantityX, y: y - offsetFromText },
        end: { x: 380-5, y: y - offsetFromText },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

    this._drawText('BAGS', quantityX + 40, y, fontSize);

    if(this.data.total_pallet_qty != 0) {
      y -= 15;
      this._drawText('IN', quantityX - 30, y, fontSize);

      text = String(this.data.total_pallet_qty);
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = 380 - textWidth-5 ; 

      this._drawText(this.data.total_pallet_qty, x, y, fontSize);

      this.page.drawLine({
          start: { x: quantityX, y: y - offsetFromText },
          end: { x: 380-5, y: y - offsetFromText },
          thickness: thickness,
          color: rgb(0, 0, 0),
      });

      this.page.drawLine({
          start: { x: quantityX, y: y- offsetFromText - gap - thickness },
          end: { x: 380-5, y: y- offsetFromText - gap - thickness },
          thickness: thickness,
          color: rgb(0, 0, 0),
      });

      this._drawText('PALLETS', quantityX + 40, y, fontSize);
    }
    

    y -= 15 

    text = "(TOTAL US DOLLARS " + this._numberToWords(this.data.total_invoice_amount) + " ONLY)" ;
    this._drawText(text, 40, y, fontSize);

    y_end = y-15;
  }

  _drawFooter() {
    let y = y_end;
    const fontSize = 12;
    const valueX = 100;

    this._drawText(this.data.amountText, 40, y, fontSize);
    y -=15;

    /***** packing line */
    this._drawText("PACKING : " , 40, y, fontSize);
    this._drawText(this.data.packing_remark , 80, y, fontSize);
    if(this.data.packing_remark2 != null && this.data.packing_remark2 != null) {
      y -=15;
      this._drawText(this.data.packing_remark2 , 80, y, fontSize);
    }
    if(this.data.packing_remark3 != null && this.data.packing_remark3 != null) {
      y -=15;
      this._drawText(this.data.packing_remark3 , 80, y, fontSize);
    }
    if(this.data.packing_remark4 != null && this.data.packing_remark4 != null) {
      y -=15;
      this._drawText(this.data.packing_remark4 , 80, y, fontSize);
    }
    if(this.data.packing_remark5 != null && this.data.packing_remark5 != null) {
      y -=15;
      this._drawText(this.data.packing_remark5 , 80, y, fontSize);
    }
    y -=15;

     /***** SHIPPING MARK line */
    this._drawText("SHIPPING MARK : ", 40, y, fontSize);
    this._drawText( this.data.shipping_remark , valueX+5, y , fontSize);

    if(this.data.shipping_remark2 != null && this.data.shipping_remark2 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark2, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark3 != null && this.data.shipping_remark3 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark3, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark4 != null && this.data.shipping_remark4 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark4, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark5 != null && this.data.shipping_remark5 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark5, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark6 != null && this.data.shipping_remark6 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark6, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark7 != null && this.data.shipping_remark7 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark7, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark8 != null && this.data.shipping_remark8 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark8, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark9 != null && this.data.shipping_remark9 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark9, valueX+5, y , fontSize);
    }
    if(this.data.shipping_remark10 != null && this.data.shipping_remark10 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark10, valueX+5, y , fontSize);
    }

    let count_batch = 0;
    for (const item of this.data.line_items) {
      count_batch += item.batch.length 
    
    }

    if(count_batch > 0){
      y -=15;
      this._drawText("BATCH NO : " , 40, y, fontSize);
      let i_batch = 1;
      for (const item of this.data.line_items) {
        for (const i of item.batch) {
          this._drawText(i_batch + ") " + i.batch_no, valueX, y , fontSize);
          
          let text_batch = i.bags + " Bags"
          let textWidth = this.font.widthOfTextAtSize(text_batch, fontSize);
          let BagsX = valueX+130 - textWidth;

          this._drawText(text_batch, BagsX, y , fontSize);
          y -=15;
          i_batch++;
        }
      
      }
    } else {
      y -=15;
    }

    this._drawText("TOTAL NET WEIGHT :", 40, y, fontSize);

    let text = this.data.net_weight_kg + " KGS.";
    let textWidth = this.font.widthOfTextAtSize(text, fontSize);
    let x = 200 - textWidth ;
    this._drawText(this.data.net_weight_kg + " KGS.", x, y, fontSize);

    y -=15;
    this._drawText("TOTAL TARE WEIGHT :", 40, y, fontSize);

    text = this.data.tare_weight_kg + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText(this.data.tare_weight_kg + " KGS.", x, y, fontSize);
    
    y -=15;
    this._drawText("TOTAL GROSS WEIGHT :", 40, y, fontSize);
    
    text = this.data.gross_weight_kg + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText(this.data.gross_weight_kg + " KGS.", x, y, fontSize);
    
    y -=15;
    this._drawText("COUNTRY OF ORIGIN : THAILAND", 40, y, fontSize);
    y -=15;
    this._drawText("REMARKS : " +this.data.remark, 40, y, fontSize);
    y -=15;
    this._drawText("WE HEREBY CERTIFY THIS INVOICE IS TRUE AND CORRECT.", 40, y, fontSize);

    if(this.data.for_delivery_to != "" && this.data.for_delivery_to != null) {
      y -=15;
      this._drawText("FOR DELIVERY TO : " +this.data.for_delivery_to, 40, y, fontSize);
    }
    
  }

  _splitText(text, maxWidth, font, size) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      const width = font.widthOfTextAtSize(testLine, size);

      if (width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  _numberToWords(amount) {
    amount = String(amount).replace(/,/g, "");

    const [integerPart, decimalPart = "00"] = amount.split(".");
    const number = parseInt(integerPart, 10);

    const ones = [
        "", "ONE", "TWO", "THREE", "FOUR", "FIVE",
        "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
        "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
        "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
        "NINETEEN"
    ];

    const tens = [
        "", "", "TWENTY", "THIRTY", "FORTY",
        "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
    ];

    function convert(n) {
        if (n < 20) {
            return ones[n];
        }

        if (n < 100) {
            return tens[Math.floor(n / 10)] +
                (n % 10 ? " " + ones[n % 10] : "");
        }

        if (n < 1000) {
            return ones[Math.floor(n / 100)] +
                " HUNDRED" +
                (n % 100 ? " " + convert(n % 100) : "");
        }

        if (n < 1000000) {
            return convert(Math.floor(n / 1000)) +
                " THOUSAND" +
                (n % 1000 ? " " + convert(n % 1000) : "");
        }

        if (n < 1000000000) {
            return convert(Math.floor(n / 1000000)) +
                " MILLION" +
                (n % 1000000 ? " " + convert(n % 1000000) : "");
        }

        return convert(Math.floor(n / 1000000000)) +
            " BILLION" +
            (n % 1000000000 ? " " + convert(n % 1000000000) : "");
    }

    const words = convert(number);

    // ถ้าไม่มีทศนิยม หรือเป็น .00
    if (decimalPart === "00") {
        return `${words} ONLY`;
    }

    return `${words} AND ${decimalPart.padEnd(2, "0").slice(0, 2)}/100`;
  }
}

export default InvoiceGenerator;