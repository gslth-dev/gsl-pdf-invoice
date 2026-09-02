import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let y_end ;
class PIGenerator {
  static HEADER_IMAGE = path.resolve(
    __dirname,
    '../public/GSL_header_vector.png'
  );

  constructor(data) {
    this.data = data;
  }
  
  async generatePI1() {
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
    this._drawCustomerInfo1();
    this._drawTable();
    this._drawFooterPI1();

    return await this.pdfDoc.save();
  }

  async generatePI2() {
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
    this._drawCustomerInfo2();
    this._drawTable();
    this._drawFooterPI2();

    return await this.pdfDoc.save();
  }

  async _generate(outputPath = this.data.invoice_type+".pdf") {
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
    const headerBytes = fs.readFileSync(PIGenerator.HEADER_IMAGE);
    const headerImage = await this.pdfDoc.embedPng(headerBytes);

    const headerDims = headerImage.scale(0.25);

    this.page.drawImage(headerImage, {
        x: 40,
        y: 758,
        width: 515,
        height: 65
    });

  }

  _drawTitle() {
    const text = this.data.invoice_type == "proforma_invoice" ? "PROFORMA INVOICE" : this.data.invoice_type == "order_confirmation" ?"ORDER CONFIRMATION" :"undifine_type";

    const textWidth = this.font.widthOfTextAtSize(text, 20);

    const pageWidth = this.page.getWidth();

    const x = (pageWidth - textWidth) / 2;

    this._drawText(
      text,
      x,
      710,
      20,
      true
    );
  }

  _drawCustomerInfo1() {
    const labelSize = 12;
    const valueSize = 12;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 400;
    const rightValueX = 450;    

    let startY = 690;
    const startrightY = 690;
    const lineGap = 15; 
  
    this._drawText("SOLD TO : ", leftX, startY, labelSize, true);
    this._drawText(this.data.customer, valueX-30, startY, valueSize);

    startY -= 15;
    this._drawText(this.data.address1, valueX-30, startY, valueSize);

    if(this.data.address2){
      startY -= 15;
      this._drawText(this.data.address2, valueX-30, startY, valueSize);
    }
    if(this.data.address3){
      startY -= 15;
      this._drawText(this.data.address3, valueX-30, startY, valueSize);
    }
    if(this.data.address4){
      startY -= 15;
      this._drawText(this.data.address4, valueX-30, startY, valueSize);
    }
    if(this.data.address5){
      startY -= 15;
      this._drawText(this.data.address5, valueX-30, startY, valueSize);
    }
    if(this.data.address6){
      startY -= 15;
      this._drawText(this.data.address6, valueX-30, startY, valueSize);
    }
    startY -= 15;
    this._drawText("SHIPPED TO :", leftX, startY, labelSize, true);
    this._drawText(this.data.ship_to, valueX-25, startY, valueSize);


    this._drawText("PI NO.  ", rightLabelX, startrightY, labelSize, true);
    this._drawText(": " +this.data.contract_pi_no, rightValueX, startrightY , valueSize);

    // this._drawText("DATE :", rightLabelX+100, startY - (lineGap * 0.5), labelSize, true);
    // this._drawText(invoice_date_formattedDateUTC, rightLabelX+135, startY - (lineGap * 0.5), valueSize);

    this._drawText("DATE ", rightLabelX, startrightY - (lineGap * 1), labelSize, true);
    const date_obj = new Date();

    const date_formattedDateUTC = date_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText(": " +date_formattedDateUTC, rightValueX, startrightY - (lineGap * 1), valueSize);

    this._drawText("PO NO.", rightLabelX, startrightY - (lineGap * 2), labelSize, true);
    this._drawText(": " +this.data.customer_po_no, rightValueX, startrightY - (lineGap * 2), valueSize);



    
    y_end = startY-40
  }

  _drawCustomerInfo2() {
    const labelSize = 12;
    const valueSize = 12;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 400;
    const rightValueX = 450;    

    const startY = 690;
    const lineGap = 15; 
    let telY = 15; 
  
    this._drawText("SOLD TO : ", leftX, startY, labelSize, true);
    this._drawText(this.data.bill_to_name, valueX-30, startY, valueSize);

    const billToY = startY;
    const billToLines = this._splitText(
        " " + this.data.bill_to_address,
        220,       
        this.font,
        valueSize
    );

    billToLines.forEach((line, index) => {
      this._drawText(
          line,
          valueX-30,
          billToY - (lineGap * (index+1)),
          valueSize
      );
      telY = billToY - (lineGap * (index+1))-15;
    });

    this._drawText(
          "TEL: +886-4-22911877  FAX: +886-4-2291188",
          valueX-30,
          telY,
          valueSize
      );

    this._drawText("PI NO.  ", rightLabelX, startY, labelSize, true);
    this._drawText(": " +this.data.contract_pi_no, rightValueX, startY , valueSize);

    // this._drawText("DATE :", rightLabelX+100, startY - (lineGap * 0.5), labelSize, true);
    // this._drawText(invoice_date_formattedDateUTC, rightLabelX+135, startY - (lineGap * 0.5), valueSize);

    this._drawText("DATE ", rightLabelX, startY - (lineGap * 1), labelSize, true);
    const due_date_obj = new Date(this.data.due_date);

    const due_date_formattedDateUTC = due_date_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText(": " +due_date_formattedDateUTC, rightValueX, startY - (lineGap * 1), valueSize);

    this._drawText("PO NO.", rightLabelX, startY - (lineGap * 2), labelSize, true);
    this._drawText(": " +this.data.customer_po_no, rightValueX, startY - (lineGap * 2), valueSize);



    this._drawText("SHIPPED TO :", leftX, startY - (lineGap * 4), labelSize, true);
    this._drawText(this.data.ship_to, valueX-30, startY - (lineGap * 4), valueSize);
  }

  _drawTable() {
    let y = y_end;
    const fontSize = 12;
    const quantityX = 340;

    this.page.drawLine({
      start: { x: 40, y: y + 30 },
      end: { x: 555, y: y + 30 },
      thickness: 1,
    });

    this._drawText("ITEM", 40, y + 15, fontSize, true);
    this._drawText("DESCRIPTION", 70, y + 15, fontSize, true);
    this._drawText("QUANTITY", 340, y + 15, fontSize, true);
    this._drawText("UNIT PRICE", 430, y + 15, fontSize, true);
    this._drawText("(USD PER MT)", 430, y+5 , fontSize, true);

    let text = "TOTAL AMOUNT";
    let textWidth = this.font.widthOfTextAtSize(text, fontSize);
    let x = this.page.getWidth() - textWidth - 45;

    this._drawText("TOTAL AMOUNT", x, y + 15, fontSize, true);

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
    let index = 0;
    for (const item of this.data.line_items) {
      index++;
      total_pallet_qty +=item.pallet_qty;
      total_bag_qty +=item.bag_qty;

      this._drawText(index, 45, currentY - 15, fontSize);
      this._drawText(item.description + " " + item.product_name|| "", 70, currentY - 15, fontSize);

      this._drawText(item.bag_qty +" x "+item.pallet_qty+" KGS = "+item.qty_mt + " MT" || "0.00", 320, currentY - 15, fontSize);
      this._drawText(item.unit_price_usd_mt || "0.00", 450, currentY - 15, fontSize);

      const amountText =  Number(item.line_amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })|| "";
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

    const totalText = 'TOTAL ' + this.data.delivery_terms;
    textWidth = 0;
    let amountX = this.page.getWidth() - 100; // ค่า default ถ้าไม่มีข้อความ

    if (totalText) {
      textWidth = this.font.widthOfTextAtSize(totalText, fontSize);
      amountX = this.page.getWidth() - textWidth - 100;
    }
    
    // วาด Line Amount
    this._drawText(totalText, amountX, currentY - 15, fontSize);

    // this._drawText(totalText, 300, y - 30, fontSize);

    text = Number(this.data.total_invoice_amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

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

    text = "(TOTAL US DOLLARS " + this._numberToWords(this.data.total_invoice_amount) + " )" ;

    textWidth = this.font.widthOfTextAtSize(text, fontSize);

    let pageWidth = this.page.getWidth();

    x = (pageWidth - textWidth) / 2;


    this._drawText(text, x, y-50, fontSize);

    this.page.drawLine({
      start: { x: 40, y: y -55 },
      end: { x: 555, y: y -55 },
      thickness: 1,
    });

   

    y_end = y-60;
  }

  _drawFooterPI1() {
    let y = y_end;
    const fontSize = 12;

    
    y -=15;
    this._drawText("PACKING ", 40, y, fontSize);
    this._drawText(": " + this.data.packing_remark , 80, y, fontSize);
    if(this.data.packing_remark2 != null && this.data.packing_remark2 != "") {
      y -=15;
      this._drawText(this.data.packing_remark2 , 80, y, fontSize);
    }
    if(this.data.packing_remark3 != null && this.data.packing_remark3 != "") {
      y -=15;
      this._drawText(this.data.packing_remark3 , 80, y, fontSize);
    }
    if(this.data.packing_remark4 != null && this.data.packing_remark4 != "") {
      y -=15;
      this._drawText(this.data.packing_remark4 , 80, y, fontSize);
    }
    if(this.data.packing_remark5 != null && this.data.packing_remark5 != "") {
      y -=15;
      this._drawText(this.data.packing_remark5 , 80, y, fontSize);
    }
    
    y -=15;
    if(this.data.delivery_terms == "VISAKHAPATNAM (VIZAG SEAPORT), INDIA" || this.data.delivery_terms == "SURABAYA, INDONESIA" || this.data.delivery_terms == "TAIWAN" || this.data.delivery_terms == "HO CHI MINH, VIETNAM" || this.data.delivery_terms == "NHAVA SHEVA, INDIA" || this.data.delivery_terms == "CHENNAI PORT, INDIA" || this.data.delivery_terms == "YANGZHOU / BEIHAI, CHINA") {
      this._drawText("DELIVERY", 40, y, fontSize);

      this._drawText(": BY SEA FROM ANY THAILAND PORTS TO " + this.data.delivery_terms, 140, y, fontSize);
      y -=15;
    } 
    

    this._drawText("SHIPMENT", 40, y, fontSize);
    this._drawText(": " + this.data.shipment, 140, y, fontSize);
    y -=15;

    this._drawText("TERM OF PAYMENT :", 40, y, fontSize);
    this._drawText(": "+ this.data.payment_terms, 140, y, fontSize);


    if(this.data.last_of_ship_ment != "" && this.data.last_of_ship_ment != null) {
      y -=15;
      this._drawText("LASTEST OF SHIPMENT", 40, y, fontSize);
      this._drawText(": "+ this.data.last_of_ship_ment, 140, y, fontSize);
    }

    
    if(this.data.expiry_date_of_lc != "" && this.data.expiry_date_of_lc != null) {
      y -=15;
      this._drawText("EXPIRY DATE OF L/C", 40, y, fontSize);
      this._drawText(": "+ this.data.expiry_date_of_lc, 140, y, fontSize);
    }

    if(this.data.tolerace != "" && this.data.tolerace != null) {
      y -=15;
      this._drawText("TOLERANCE", 40, y, fontSize);
      this._drawText(": "+ this.data.tolerace, 140, y, fontSize);
    }
    y -=15;

    this._drawText("BANK NAME ", 40, y, fontSize);
    this._drawText(": "+ this.data.bank_name, 140, y, fontSize);

    y -=15;

    this._drawText("BANK ADDRESS ", 40, y, fontSize);
    this._drawText(": "+ this.data.bank_address, 140, y, fontSize);

    y -=15;

    this._drawText("ACCOUNT NAME ", 40, y, fontSize);
    this._drawText(": "+ this.data.account_name, 140, y, fontSize);

    y -=15;

    this._drawText("ACCOUNT NO ", 40, y, fontSize);
    this._drawText(": "+ this.data.account_number, 140, y, fontSize);

    y -=15;

    this._drawText("S.W.I.F.T ", 40, y, fontSize);
    this._drawText(": "+ this.data.s_w_i_f_t, 140, y, fontSize);


    y -=50;

    this.page.drawLine({
      start: { x: 400, y: y  },
      end: { x: 520, y: y},
      thickness: 1,
    });
    y -=15;
     this._drawText("AUTHORIZED SIGNATURE", 415, y, fontSize);
  }

  _drawFooterPI2() {
    let y = y_end;
    const fontSize = 12;

    
    y -=15;
    this._drawText("PACKING ", 40, y, fontSize);
    this._drawText(": IN BAGS OF ABOUT 250 KGS NET EACH", 140, y, fontSize);
    y -=15;
    this._drawText(": STUFFED INTO 1X20' CONTAINER", 140, y, fontSize);

    y -=15;
    this._drawText("DELIVERY", 40, y, fontSize);
    this._drawText(": BY SEA FROM ANY THAILAND PORTS TO CHENNAI PORT, INDIA", 140, y, fontSize);
    y -=15;

    this._drawText("SHIPMENT", 40, y, fontSize);
    this._drawText(": 1X20' CONTAINER TO BE SHIPPED FROM THAILAND WITHIN JULY 2026 (ETD BASIS)", 140, y, fontSize);
    y -=15;

    this._drawText("TERM OF PAYMENT :", 40, y, fontSize);
    this._drawText(": "+ this.data.payment_terms, 140, y, fontSize);

    y -=15;
    this._drawText("LASTEST OF SHIPMENT", 40, y, fontSize);
    this._drawText(": LASTEST OF SHIPMENT", 140, y, fontSize);

    y -=15;
    this._drawText("EXPIRY DATE OF L/C", 40, y, fontSize);
    this._drawText(": EXPIRY", 140, y, fontSize);


    y -=15;
    this._drawText("TOLERANCE", 40, y, fontSize);
    this._drawText(": TOLERANCE", 140, y, fontSize);


    y -=15;

    this._drawText("BANK NAME ", 40, y, fontSize);
    this._drawText(": BANK_NAME", 140, y, fontSize);

    y -=15;

    this._drawText("BANK ADDRESS ", 40, y, fontSize);
    this._drawText(": BANK_ADDRESS", 140, y, fontSize);

    y -=15;

    this._drawText("ACCOUNT NAME ", 40, y, fontSize);
    this._drawText(": ACCOUNT NAME", 140, y, fontSize);

    y -=15;

    this._drawText("ACCOUNT NO ", 40, y, fontSize);
    this._drawText(": ACCOUNT NO", 140, y, fontSize);

    y -=15;

    this._drawText("S.W.I.F.T ", 40, y, fontSize);
    this._drawText(": KASITHBK", 140, y, fontSize);


    y -=50;

    this.page.drawLine({
      start: { x: 400, y: y  },
      end: { x: 520, y: y},
      thickness: 1,
    });
    y -=15;
     this._drawText("AUTHORIZED SIGNATURE", 415, y, fontSize);
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

export default PIGenerator;