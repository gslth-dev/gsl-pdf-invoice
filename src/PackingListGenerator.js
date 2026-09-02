import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let y_end ;
class PackingListGenerator {
  static HEADER_IMAGE = path.resolve(
    __dirname,
    '../public/GSL_header_vector.png'
  );

  constructor(data) {
    this.data = data;
  }
  
  async generatePL() {
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

    this._drawHeader();
    this._drawTitle();
    this._drawCustomerInfo();
    this._drawTable();
    this._drawFooter();

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
    const headerBytes = fs.readFileSync(PackingListGenerator.HEADER_IMAGE);
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
    const text = "PACKING LIST";

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

    this._drawText("DATE : ", 440, 720, 12, true);
    const date_obj = new Date();

    const date_formattedDateUTC = date_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText(date_formattedDateUTC, 470, 720, 12);

  }

  _drawCustomerInfo1() {
    const labelSize = 12;
    const valueSize = 12;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 350;
    const rightValueX = 410;    

    let startY = 690;
    let startYright = 690;
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
    this._drawText("SHIPPER :", leftX, startY, labelSize, true);
    this._drawText(this.data.shipper, valueX-30, startY, valueSize);

    
    startY -= 15;
    this._drawText("SHIPPED TO :", leftX, startY, labelSize, true);
    this._drawText(this.data.ship_to, valueX-25, startY, valueSize);

    startY -= 15;
    this._drawText("CONTRACT NO. : ", leftX, startY, labelSize, true);
    this._drawText(this.data.contract_pi_no, valueX, startY, valueSize);

    // this._drawText("DATE :", rightLabelX+100, startY - (lineGap * 0.5), labelSize, true);
    // this._drawText(invoice_date_formattedDateUTC, rightLabelX+135, startY - (lineGap * 0.5), valueSize);

    this._drawText("INVOICE NO. :  ", rightLabelX, startYright, labelSize, true);
    this._drawText(this.data.invoice_no, rightValueX, startYright , valueSize);

    if(this.data.consignee1 != null && this.data.consignee1 !="") {
      startYright -=15
      this._drawText("CONSIGNEE :  ", rightLabelX, startYright, labelSize, true);

      const consignee1 = this._splitText(
          this.data.consignee1,
          150,       
          this.font,
          valueSize
      );

      consignee1.forEach((line, index) => {
        if(index > 0) {
          startYright -= 15;
          this._drawText(
            line,
            rightLabelX,
            startYright,
            valueSize
        );
        } else {
          this._drawText(
            line,
                rightValueX,
            startYright,
            valueSize
          );
        }
        
      }); 
    }
    
    // this._drawText(this.data.consignee1, rightValueX, startYright , valueSize);

    if(this.data.consignee2 !="" && this.data.consignee2 != null) {
      startYright -=15
      this._drawText(this.data.consignee2, rightLabelX, startYright , valueSize);
    }

    if(this.data.consignee3 !="" && this.data.consignee3 != null) {
      startYright -=15
      this._drawText(this.data.consignee3, rightLabelX, startYright , valueSize);
    }

    y_end = startY
   
  }


  _drawTable() {
    let y = y_end-30;
    const fontSize = 12;
    const quantityX = 340;
    const leftX = 40;
    const valueX = 200;

    this.page.drawLine({
      start: { x: 40, y: y + 25 },
      end: { x: 555, y: y + 25 },
      thickness: 1,
    });

    y +=15;
    this._drawText("DESCRIPTION OF GOODS : ", leftX, y , fontSize, true);
    for (const item of this.data.line_items) {
      this._drawText( item.invoice_description, valueX, y , fontSize);
      if(item.invoice_description2 != "" && item.invoice_description2 != null){
        y -=15;
        this._drawText( item.invoice_description2, valueX, y , fontSize);
      }
      if(item.invoice_description3 != "" && item.invoice_description3 != null){
        y -=15;
        this._drawText( item.invoice_description3, valueX, y , fontSize);
      }
      if(item.invoice_description4 != "" && item.invoice_description4 != null){
        y -=15;
        this._drawText( item.invoice_description4, valueX, y , fontSize);
      }
      if(item.invoice_description5 != "" && item.invoice_description5 != null){
        y -=15;
        this._drawText( item.invoice_description5, valueX, y , fontSize);
      }
      if(item.invoice_description6 != "" && item.invoice_description6 != null){
        y -=15;
        this._drawText( item.invoice_description6, valueX, y , fontSize);
      }
      y -=15;
    }
    
    
    this._drawText("PACKING CONDITION : ", leftX, y , fontSize, true);
    this._drawText( this.data.packing_remark, valueX, y , fontSize);

    if(this.data.packing_remark2 != null && this.data.packing_remark2 != ""){
      y -=15;
      this._drawText(this.data.packing_remark2, valueX, y , fontSize);
    }
    if(this.data.packing_remark3 != null && this.data.packing_remark3 != ""){
      y -=15;
      this._drawText(this.data.packing_remark3, valueX, y , fontSize);
    }
    if(this.data.packing_remark4 != null && this.data.packing_remark4 != ""){
      y -=15;
      this._drawText(this.data.packing_remark4, valueX, y , fontSize);
    }
    if(this.data.packing_remark5 != null && this.data.packing_remark5 != ""){
      y -=15;
      this._drawText(this.data.packing_remark5, valueX, y , fontSize);
    }

    y -=15;
    this._drawText("SHIPPING MARK : ", leftX, y , fontSize, true);
    this._drawText( this.data.shipping_remark , valueX, y , fontSize);

    if(this.data.shipping_remark2 != null && this.data.shipping_remark2 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark2, valueX, y , fontSize);
    }
    if(this.data.shipping_remark3 != null && this.data.shipping_remark3 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark3, valueX, y , fontSize);
    }
    if(this.data.shipping_remark4 != null && this.data.shipping_remark4 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark4, valueX, y , fontSize);
    }
    if(this.data.shipping_remark5 != null && this.data.shipping_remark5 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark5, valueX, y , fontSize);
    }
    if(this.data.shipping_remark6 != null && this.data.shipping_remark6 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark6, valueX, y , fontSize);
    }
    if(this.data.shipping_remark7 != null && this.data.shipping_remark7 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark7, valueX, y , fontSize);
    }
    if(this.data.shipping_remark8 != null && this.data.shipping_remark8 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark8, valueX, y , fontSize);
    }
    if(this.data.shipping_remark9 != null && this.data.shipping_remark9 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark9, valueX, y , fontSize);
    }
    if(this.data.shipping_remark10 != null && this.data.shipping_remark10 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark10, valueX, y , fontSize);
    }

    y -=15;
    this._drawText("QUANTITY : ", leftX, y , fontSize, true);
    
    const quantity = this._splitText(
        this.data.quantity,
        350,       
        this.font,
        fontSize
    );

    quantity.forEach((line, index) => {
      if(index > 0) {
        y -= 15;
        this._drawText(
          line,
          valueX,
          y,
          fontSize
      );
      } else {
        this._drawText(
          line,
          valueX,
          y,
          fontSize
        );
      }
      
    });

    y -=15;
    this._drawText("VESSEL'S NAME : ", leftX, y , fontSize, true);
    this._drawText( this.data.vessel , valueX, y , fontSize);

    y -=15;
    this._drawText("ETD : ", leftX, y , fontSize, true);

    const etd_obj = new Date(this.data.etd);

    const etd_date_formattedDateUTC = etd_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText( etd_date_formattedDateUTC , valueX, y , fontSize);

    y -=15;
    this._drawText("ETA : ", leftX, y , fontSize, true);

    const eta_obj = new Date(this.data.eta);

    const eta_date_formattedDateUTC = eta_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText( eta_date_formattedDateUTC , valueX, y , fontSize);

     y -=15;
    this._drawText("TOTAL NET WEIGHT : ", leftX, y , fontSize, true);
    this._drawText( Number(this.data.net_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +" KGS.", valueX, y , fontSize);

    y -=15;
    this._drawText("TOTAL GROSS WEIGHT : ", leftX, y , fontSize, true);
    this._drawText( Number(this.data.gross_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +" KGS.", valueX, y , fontSize);

    y -=15;
    this._drawText("COUNTRY OF ORIGIN : ", leftX, y , fontSize, true);
    this._drawText( "THAILAND" , valueX, y , fontSize);

    y -=15;
    this._drawText("NET WEIGHT OF EACH CONTAINER : ", leftX, y , fontSize, true);
    this._drawText( Number(this.data.net_weight_of_each_container).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +" KGS.", valueX, y , fontSize);

    y -=15;
    this._drawText("GROSS WEIGHT OF EACH CONTAINER : ", leftX, y , fontSize, true);
    this._drawText( Number(this.data.gross_weight_of_each_container).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +" KGS." , valueX, y , fontSize);
    
    y -=15;
    this._drawText("WE HEREBY CERTIFY THIS PACKING LIST IS TRUE AND CORRECT ", leftX, y , fontSize, true);

    y_end = y-60;
  }

  _drawFooterPI1() {
    let y = y_end;
    const fontSize = 12;

    
  
    y -=50;

    this.page.drawLine({
      start: { x: 400, y: y  },
      end: { x: 520, y: y},
      thickness: 1,
    });
    y -=15;
     this._drawText("AUTHORIZED SIGNATURE", 415, y, fontSize);
     y -=15;
    let text ="GENERAL STARCH LIMITED AS MANUFACTURER"
    this._drawText(text, 380, y, fontSize);
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

export default PackingListGenerator;