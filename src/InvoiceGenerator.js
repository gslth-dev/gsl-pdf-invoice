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
    const rightValueX = 410;    

    const startY = 670;
    const lineGap = 15; 
  
    this._drawText("INVOICE NO. :", leftX, startY, labelSize, true);
    this._drawText(this.data.invoice_no, valueX, startY, valueSize);

    this._drawText("SALE ORDER NO. :", leftX, startY - (lineGap * 1), labelSize, true);
    this._drawText(this.data.order_number, valueX, startY - (lineGap * 1), valueSize);

    this._drawText("CONTRACT NO. :", leftX, startY - (lineGap * 2), labelSize, true);
    this._drawText(this.data.contract_pi_no, valueX, startY - (lineGap * 2), valueSize);

    this._drawText("BILL TO :", leftX, startY - (lineGap * 3), labelSize, true);
    
    const billToY = startY - (lineGap * 3);
    const billToLines = this._splitText(
        this.data.bill_to_name + " " + this.data.bill_to_address,
        180,       
        this.font,
        valueSize
    );

    billToLines.forEach((line, index) => {
      this._drawText(
          line,
          valueX-30,
          billToY - (lineGap * index),
          valueSize
      );
    });

    const nextY = billToY - (lineGap * billToLines.length);

    this._drawText("TERM OF PAYMENT :", leftX, startY - (lineGap * 7), labelSize, true);
    this._drawText(this.data.payment_terms, valueX, startY - (lineGap * 7), valueSize);

    this._drawText("SHIPMENT BY :", leftX, startY - (lineGap * 8), labelSize, true);
    this._drawText(this.data.vessel, valueX, startY - (lineGap * 8), valueSize);

    this._drawText("FROM :", leftX, startY - (lineGap * 9), labelSize, true);
    this._drawText("THAILAND", valueX, startY - (lineGap * 9), valueSize);

    const dateObject = new Date(this.data.invoice_date);

    const invoice_date_formattedDateUTC = dateObject.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText("DATE :", rightLabelX+100, startY - (lineGap * 0.5), labelSize, true);
    this._drawText(invoice_date_formattedDateUTC, rightLabelX+135, startY - (lineGap * 0.5), valueSize);

    this._drawText("SHIP TO :", rightLabelX, startY - (lineGap * 3), labelSize, true);
    this._drawText(this.data.ship_to, rightValueX, startY - (lineGap * 3), valueSize);

    this._drawText("L/C NO. :", rightLabelX, startY - (lineGap * 4), labelSize, true);
    this._drawText(this.data.lc_no, rightValueX, startY - (lineGap * 4), valueSize);

    const due_date_obj = new Date(this.data.due_date);

    const due_date_formattedDateUTC = due_date_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("DUE DATE :", rightLabelX, startY - (lineGap * 6), labelSize, true);
    this._drawText(due_date_formattedDateUTC, rightValueX, startY - (lineGap * 6), valueSize);

    const date_etd = new Date(this.data.etd);

    const etd_formattedDate = date_etd.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETD :", rightLabelX, startY - (lineGap * 8), labelSize, true);
    this._drawText(etd_formattedDate, rightValueX, startY - (lineGap * 8), valueSize);

    const date_eta = new Date(this.data.eta);

    const eta_formattedDate = date_eta.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETA :", rightLabelX, startY - (lineGap * 9), labelSize, true);
    this._drawText(eta_formattedDate, rightValueX, startY - (lineGap * 9), valueSize);
  }

  _drawTable() {
    let y = 500;
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
    let total_bag_qty = 0;
    let total_pallet_qty = 0;
    for (const item of this.data.line_items) {
      total_pallet_qty +=item.pallet_qty;
      total_bag_qty +=item.bag_qty;
  
      this._drawText(item.description || "", 40, currentY - 15, fontSize);

      this._drawText(item.bag_qty +" x "+item.pallet_qty+" KGS = "+item.qty_mt + " MT" || "0.00", 320, currentY - 15, fontSize);
      this._drawText(item.unit_price_usd_mt || "0.00", 450, currentY - 15, fontSize);

      const amountText = item.line_amount || "";
      let textWidth = 0;
      let amountX = this.page.getWidth() - 40; // ค่า default ถ้าไม่มีข้อความ

      if (amountText) {
        textWidth = this.font.widthOfTextAtSize(amountText, fontSize);
        amountX = this.page.getWidth() - textWidth - 40;
      }
      
      // วาด Line Amount
      this._drawText(amountText, amountX, currentY - 15, fontSize);

      this.page.drawLine({
        start: { x: 500, y: currentY - 20 },
        end: { x: 555, y: currentY - 20 },
        thickness: 1,
      });

      // ลดพิกัด Y ลงไปสำหรับรายการถัดไป
      currentY -= rowHeight;
      y = currentY

    }

    y = y+15
    this._drawText('TOTAL PRICE TERM: FOB BANGKOK, THAILAND', 300, y - 30, fontSize);

    text = this.data.total_invoice_amount;
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 40;

    this._drawText(text, x, y - 30, fontSize);

    const thickness = 1;      
    const gap = 2;              
    const offsetFromText = 4;   

    this.page.drawLine({
        start: { x: 500, y: y-30 - offsetFromText },
        end: { x: 555, y: y-30 - offsetFromText },
        thickness: thickness,
        color:  rgb(0, 0, 0),
    });

    this.page.drawLine({
        start: { x: 500, y: y -30- offsetFromText - gap - thickness },
        end: { x: 555, y: y -30- offsetFromText - gap - thickness },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

    this._drawText('TOTAL', quantityX - 30, y - 45, fontSize);

    text = String(total_bag_qty);
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 380 - textWidth -5; 

    this.page.drawLine({
        start: { x: quantityX, y: y-30 - offsetFromText-2 },
        end: { x: 380-5, y: y-30 - offsetFromText-2 },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

    this._drawText(total_bag_qty, x, y - 45, fontSize);

    this.page.drawLine({
        start: { x: quantityX, y: y-45 - offsetFromText },
        end: { x: 380-5, y: y-45 - offsetFromText },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

    this._drawText('BAGS', quantityX + 40, y - 45, fontSize);
    this._drawText('IN', quantityX - 30, y - 60, fontSize);

    text = String(total_pallet_qty);
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 380 - textWidth-5 ; 

    this._drawText(total_pallet_qty, x, y - 60, fontSize);

    this.page.drawLine({
        start: { x: quantityX, y: y-60 - offsetFromText },
        end: { x: 380-5, y: y-60 - offsetFromText },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

     this.page.drawLine({
        start: { x: quantityX, y: y -60- offsetFromText - gap - thickness },
        end: { x: 380-5, y: y -60- offsetFromText - gap - thickness },
        thickness: thickness,
        color: rgb(0, 0, 0),
    });

    this._drawText('PALLETS', quantityX + 40, y - 60, fontSize);

    y_end = y-90;
  }

  _drawFooter() {
    let y = y_end;
    const fontSize = 12;

    this._drawText(this.data.amountText, 40, y, fontSize);
    y -=15;
    this._drawText("PACKING : " + this.data.packing_remark , 40, y, fontSize);
    y -=15;
    this._drawText("SHIPPING MARK : DYNAKOTE 68NB", 40, y, fontSize);
    y -=15;
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
    y -=15;
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
}

export default InvoiceGenerator;