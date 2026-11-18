import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let y_end ;
const bottomMargin = 50;
let page_count = 0;
const pageWidth = 595.28;
const pageHeight = 841.89;
let start_page_new = 0;

// เอกสาร certificate: แต่ละ invoice_type ใช้ส่วนหัว/ลายเซ็นร่วมกัน
const CERT_FONT_SIZE = 9;
const CERT_LINE_GAP = 16;
// ช่องตราประทับ+ลายเซ็น (วัดจากตัวอย่างลูกค้า ~114x80pt) — วางไฟล์ไว้ที่ src/images/GSL_stamp.png
const STAMP_IMAGE = path.resolve(__dirname, './images/GSL_stamp.png');
const STAMP_BOX = { width: 120, height: 85 };
const CERTIFICATE_TYPES = {
  certificate_of_origin: {
    title: "CERTIFICATE OF ORIGIN",
    madeOutTo: true,
    showEtdEta: false,
    signer: "MANUFACTURER",
    body: "_drawBodyCOO",
  },
  certificate_of_non_wood: {
    title: "CERTIFICATE OF NON-WOOD PACKING MATERIAL",
    madeOutTo: true,
    showEtdEta: true,
    signer: "BENEFICIARY",
    body: "_drawBodyNonWood",
  },
  certificate_of_quality: {
    title: "CERTIFICATE OF QUALITY AND QUANTITY",
    madeOutTo: false,
    showEtdEta: true,
    signer: "BENEFICIARY",
    body: "_drawBodyQuality",
  },
};
class InvoiceGenerator {
  static HEADER_IMAGE = path.resolve(
    __dirname,
    './images/GSL-logo.png'
  );

  constructor(data) {
    this.data = data;
  }
  
  async generateInvoice() {

    start_page_new = 0;
    page_count = 0;
    this.pdfDoc = await PDFDocument.create();

    this.pdfDoc.registerFontkit(fontkit);
    this.page = this.pdfDoc.addPage([595.28, 841.89]);

    const fontBytes = fs.readFileSync(
      path.resolve(__dirname, './fonts/ArialCE.ttf')
    );

    this.font = await this.pdfDoc.embedFont(fontBytes);

    const boldBytes = fs.readFileSync(
      path.resolve(__dirname, './fonts/arialceb.ttf')
    );

    const boldItalicBytes = fs.readFileSync(
      path.resolve(__dirname, './fonts/ArialCEBoldItalic.ttf')
    );

    this.bold = await this.pdfDoc.embedFont(boldBytes);
    this.boldItalic = await this.pdfDoc.embedFont(boldItalicBytes);

    await this._drawHeader();
    this.stamp = null;
    if ((CERTIFICATE_TYPES[this.data.invoice_type] || this.data.invoice_type == "letter_of_declaration") && fs.existsSync(STAMP_IMAGE)) {
      this.stamp = await this.pdfDoc.embedPng(fs.readFileSync(STAMP_IMAGE));
    }

    if(this.data.invoice_type == "performa_invoice" || this.data.invoice_type == "order_confirmation") {
      this._drawTitlePI();
      this._drawCustomerInfoPI();
      this._drawTablePI();
      this._drawFooterPI();
    } else if (this.data.invoice_type == "account_invoice") {
      this._drawTitle();
      this._drawCustomerInfoAcc();
      this._drawTableAcc();
      this._drawFooterAcc();
    } else if (this.data.invoice_type == "packing_list") {
      this._drawTitlePack();
      this._drawCustomerInfoPack();
      this._drawTablePack();
      this._drawFooterPack();
    } else if (CERTIFICATE_TYPES[this.data.invoice_type]) {
      this._drawCertificate(CERTIFICATE_TYPES[this.data.invoice_type]);
    } else if (this.data.invoice_type == "letter_of_declaration") {
      this._drawLetterOfDeclaration();
    } else if (this.data.invoice_type == "customs_invoice" || this.data.invoice_type == "commercial_invoice") {
      this._drawTitle();
      this._drawCustomerInfo();
      this._drawTable();
      this._drawFooter();
    } else if (this.data.invoice_type == "customer_invoice") {
      this._drawTitle();
      this._drawCustomerInfoCustomer();
      this._drawTableCustomer();
      this._drawFooterCustomer();
    }

    const pages = this.pdfDoc.getPages();
    
    const totalPages = this.pdfDoc.getPageCount();

    pages.forEach((page, index) => {
        const { width } = page.getSize();

        const text = `PAGE ${index + 1} OF ${totalPages}`;
        const textWidth = this.font.widthOfTextAtSize(text, 8);

        page.drawText(text, {
            x: (width - textWidth - 10),
            y: 830,
            size: 7,
            font: this.font,
            color: rgb(0, 0, 0),
        });
    });

    return await this.pdfDoc.save();
  }

  _drawText(
    text,
    x,
    y,
    size = 10,
    bold = false,
    color = rgb(0, 0, 0)
  ) {
    if (y < bottomMargin) {
      // console.log("start",y , (y - (page_count * pageHeight) + bottomMargin));
      if(y < (y - (page_count * pageHeight) + bottomMargin )) {
        this.page =  this.pdfDoc.addPage([595.28, 841.89]); //this.page..addPage([pageWidth, pageHeight]);
        this._drawHeader();
        page_count++;
        start_page_new =  y+20
        // console.log("start_page_new",start_page_new)
        y = -200; 
      } else {
        y = y - start_page_new + pageHeight - 50 ;
      }
      // console.log("y",y)
    }
    this.page.drawText(String(text || ""), {
      x,
      y,
      size,
      color,
      font: bold ? this.bold :this.font ,
    });
  }

  _drawLine(
    startX,
    startY,
    endX,
    endY,
    thickness = 1,
    color = rgb(0, 0, 0)
  ) {

    if (startY < bottomMargin) {
      startY = startY - start_page_new + pageHeight - 50 ;
      endY = endY - start_page_new + pageHeight - 50 ;
    }
    
    this.page.drawLine({
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
      thickness,
      color,
    });
  }



  _drawTextAddr(
    text,
    x,
    y,
    size = 9,
    color = rgb(0, 0, 0)
  ) {
    console.log("5")
     const maxWidth = 200;

    const textWidth = this.boldItalic.widthOfTextAtSize(text, size);

    let characterSpacing = 0;

    if (text.length > 1 && textWidth > maxWidth) {
      characterSpacing =
        (maxWidth - textWidth) / (text.length - 1);
    }
    this.page.drawText(String(text || ""), {
      x,
      y,
      size,
      font: this.boldItalic,
      characterSpacing
      // characterSpacing: 10, 
    });
  }

  async _drawHeader() {
    const headerBytes = fs.readFileSync(InvoiceGenerator.HEADER_IMAGE);
    const headerImage = await this.pdfDoc.embedPng(headerBytes);

    const headerDims = headerImage.scale(0.25);

    this.page.drawImage(headerImage, {
        x: 35,
        y: 780,
        width: 180,
        height: 40
      });

    this._drawTextAddr(
      "3539 New Rama IX Road, Phatthanakan, Suan Luang, Bangkok 10250,",
      270,
      805,
      9
    );

  

    this._drawTextAddr(
      "Thailand Tel : +66 2732 2792  Fax : +66 2732 2711 www.gsl-th.com",
      270,
      793,
      9
    );

    this._drawTextAddr(
      "Tax ID : 0105535113963  Head Office",
      270,
      781,
      9
      
    );

  }

  _drawTitle() {

    let text = 'INVOICE'
    if(this.data.customer_code == 'E0617') {
      text = "INVOICE/PACKING LIST";
     
    } 

    const textWidth = this.font.widthOfTextAtSize(text, 20);

    const pageWidth = this.page.getWidth();

    const x = (pageWidth - textWidth) / 2;

    this._drawText(
      text,
      x,
      710,
      18,
      true
    );
    
  }

  _drawCustomerInfo() {
    const labelSize = 8;
    const valueSize = 8;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 340;
    const rightValueX = 390;    

    const startY = 670;
    const lineGap = 15; 
  
    let leftY = startY;
    this._drawText("INVOICE NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.invoice_number, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("SALE ORDER NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.es_no, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("CONTRACT NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.po_number, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("BILL TO :", leftX, leftY, labelSize, false);
    this._drawText(this.data.customer_name.toUpperCase(), valueX-30, leftY, valueSize);

    leftY -= lineGap;
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
    let term_line = leftY
    this._drawText("TERM OF PAYMENT :", leftX, leftY, labelSize, false);
    
    this._drawText(this.data.payment_term, valueX+5, leftY, valueSize);

    // const payment_term = this._splitText(
    //     this.data.payment_term,
    //     200,       
    //     this.font,
    //     valueSize
    // );

    // payment_term.forEach((line, index) => {
    //   if(index > 0){
    //       leftY -= lineGap;
    //   }
    //   this._drawText(
    //     line,
    //     valueX+10,
    //     leftY,
    //     valueSize
    //   );
    // }); 
    
    

    leftY -= lineGap;
    this._drawText("SHIPMENT BY :", leftX, leftY, labelSize, false);
    this._drawText(this.data.vessel.toUpperCase(), valueX, leftY, valueSize);

    leftY -= lineGap;
    this._drawText("FROM :", leftX, leftY, labelSize, false);
    this._drawText(this.data.loading_port, valueX, leftY, valueSize);


    let rightY = startY
    const dateObject = new Date();

    const date_formattedDateUTC = dateObject.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText("DATE :", rightLabelX+100, rightY, labelSize, false);
    this._drawText(date_formattedDateUTC, rightLabelX+135, rightY, valueSize);

    rightY -= (lineGap * 3)
    this._drawText("SHIP TO :", rightLabelX, rightY, labelSize, false);
    this._drawText(this.data.destination_port, rightValueX, rightY, valueSize);



    rightY = leftY + (lineGap * 2)

    if (rightY == term_line) {
      rightY += lineGap;
    }

    console.log("this.data.due_date",this.data.due_date)
    if(this.data.show_due_date == true && !this.data.customer_name?.toUpperCase().includes("ITC LIMITED")) {
      const due_date_obj = new Date(this.data.due_date);

      const due_date_formattedDateUTC = due_date_obj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC' // Forces UTC interpretation
      }).toUpperCase();

      this._drawText("DUE DATE :", rightLabelX, rightY, labelSize, false);
      this._drawText((this.data.due_date == "" || this.data.due_date == null)?"":due_date_formattedDateUTC, rightValueX, rightY, valueSize);
    }
    


    rightY -= (lineGap*2)
    const date_etd = new Date(this.data.etd);

    const etd_formattedDate = date_etd.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETD :", rightLabelX, rightY, labelSize, false);
    this._drawText((this.data.etd == "" || this.data.etd == null)?"":etd_formattedDate, rightValueX, rightY, valueSize);


    rightY -= lineGap 
    const date_eta = new Date(this.data.eta);

    const eta_formattedDate = date_eta.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETA :", rightLabelX, rightY, labelSize, false);
    this._drawText((this.data.eta == "" || this.data.eta == null)?"":eta_formattedDate, rightValueX, rightY, valueSize);

    y_end = rightY
  }

  _drawTable() {
    let y = y_end-45;
    const fontSize = 8;
    const quantityX = 340;


    this._drawLine(40, y + 30, 555, y + 30, 1);
    

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

    this._drawLine(40, y, 555, y, 1);

    let currentY = y; 
    const rowHeight = 15; // ความสูงของแต่ละแถว
    let bag_type = '';
    let bag_type_count = 0;
    let index_total = this.data.line_items.length;
    let index_line_items = 0;

    for (const item of this.data.line_items) {
      index_line_items++;
      console.log("item.bag_type",item.bag_type)
      if(bag_type != item.bag_type) {
        bag_type = item.bag_type
        bag_type_count ++;
      }

      // this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);

      let lines = item.invoice_description.split('\n');
      let numberOfLines = lines.length; 
      
      let a = 0
      lines.forEach((line, index) => {
        const product_name = this._splitText(
          line,
          300,       
          this.font,
          fontSize
        );

        product_name.forEach((l, i) => {
            a -= 15;
            this._drawText(
              l,
              40,
              currentY+a,
              fontSize
          );
        }); 
      }); 


      this._drawText((item.bag_qty?item.bag_qty:" ") +" x "+(item.packaging_type?item.packaging_type:"")+" KGS = "+(item.quantity?Number(item.quantity).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " MT" || "0.00", 320, currentY - 15, fontSize);

      this._drawText(Number(item.fob_price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) || "0.00", 450, currentY - 15, fontSize);

      const amountText = Number(Number(item.fob_price) * Number(item.quantity)).toLocaleString('en-US', {
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
      if(index_line_items == index_total) {
        this._drawLine(500, currentY-2-15, 555, currentY-2-15, 1);
      }

      if(item.invoice_description2 != "") {
        currentY -=15

        lines = item.invoice_description2.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description3 != "") {
        currentY -=15
        lines = item.invoice_description3.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description4 != "") {
        currentY -=15
        lines = item.invoice_description4.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description5 != "") {
        currentY -=15
        lines = item.invoice_description5.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description6 != "") {
        currentY -=15
        lines = item.invoice_description6.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }


      console.log(currentY)

      // ลดพิกัด Y ลงไปสำหรับรายการถัดไป
      currentY -= 0 - a;


      console.log(currentY)
      // this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);

   
      y = currentY

    }

  

    // this._drawLine(500, currentY-2, 555, currentY-2, 1);

    y = y+15

    // custom subtotal //'TOTAL 
    text = 'TOTAL ' + this.data.delivery_terms;
    if(this.data.customer_name == "MITACHARM CORPORATION"  ||  this.data.customer_name == "ITC LIMITED"  ||  this.data.customer_name == "Sanguan Wongse Japan Co.,Ltd."   ||  this.data.customer_name =="International Additive Concepts Inc.") {
        text = 'TOTAL ' + this.data.delivery_terms;
    }

    if(this.data.delivery_terms.slice(0, 3) == 'CFR' || this.data.delivery_terms.slice(0, 3) == 'CIF') {
      text = 'TOTAL FOB ' + this.data.loading_port ;
    }


  
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 120;
    this._drawText(text , x, y - 30, fontSize);

    text = Number(this.data.total_invoice_amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

    if(this.data.delivery_terms.slice(0, 3) == 'CFR' || this.data.delivery_terms.slice(0, 3) == 'CIF') {
      text = Number(this.data.subtotal).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 40;

    y = y - 30
    this._drawText(text, x, y, fontSize);



    if(this.data.delivery_terms.slice(0, 3) == 'CFR' || this.data.delivery_terms.slice(0, 3) == 'CIF') {
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

    if(this.data.delivery_terms.slice(0, 3) == 'CIF') {
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

    if(this.data.delivery_terms.slice(0, 3) == 'CFR' || this.data.delivery_terms.slice(0, 3) == 'CIF') {


      this._drawLine(500, y-2, 555, y-2, 1);

      y -= 15
      text = 'TOTAL '  + this.data.delivery_terms;
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


    this._drawLine(500, y - offsetFromText, 555, y - offsetFromText, thickness);
    this._drawLine(500, y - offsetFromText - gap - thickness, 555, y - offsetFromText - gap - thickness, thickness);


    y -= 15;
    this._drawText('TOTAL', quantityX - 30, y, fontSize);

    text = String(this.data.total_bag_qty);
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 380 - textWidth -5; 

    this._drawLine(quantityX, y+15 - offsetFromText-2, 380-5, y+15 - offsetFromText-2, thickness);

    this._drawText(this.data.total_bag_qty, x, y, fontSize);

    this._drawLine(quantityX, y - offsetFromText, 380-5, y - offsetFromText, thickness);

    console.log("bag_type",bag_type)
    if(bag_type_count > 1) {
      bag_type = 'BAGS'
    }

    this._drawText(bag_type , quantityX + 40, y, fontSize);

    if(this.data.total_pallet_qty != 0) {
      y -= 15;
      this._drawText('IN', quantityX - 30, y, fontSize);

      text = String(this.data.total_pallet_qty);
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = 380 - textWidth-5 ; 

      this._drawText(this.data.total_pallet_qty, x, y, fontSize);

      this._drawLine(quantityX, y - offsetFromText, 380-5, y - offsetFromText, thickness);
      this._drawLine(quantityX, y- offsetFromText - gap - thickness, 380-5, y- offsetFromText - gap - thickness, thickness);


      this._drawText('PALLETS', quantityX + 40, y, fontSize);
    }
    

    y -= 15 
    y -= 15 
    text = "(TOTAL US DOLLARS " + this._numberToWords(this.data.total_invoice_amount) + ")" ;
    this._drawText(text, 40, y, fontSize);

    y_end = y;
  }

  _drawFooter() {
    let y = y_end;
    const fontSize = 8;
    const valueX = 100;

    this._drawText(this.data.amountText, 40, y, fontSize, false);
    y -=15;

    /***** packing line */
    this._drawText("PACKING : " , 40, y, fontSize);
    this._drawText(this.data.packing_remark , 85, y, fontSize);
    if(this.data.packing_remark2 != null && this.data.packing_remark2 != "") {
      y -=15;
      this._drawText(this.data.packing_remark2 , 85, y, fontSize);
    }
    if(this.data.packing_remark3 != null && this.data.packing_remark3 != "") {
      y -=15;
      this._drawText(this.data.packing_remark3 , 85, y, fontSize);
    }
    if(this.data.packing_remark4 != null && this.data.packing_remark4 != "") {
      y -=15;
      this._drawText(this.data.packing_remark4 , 85, y, fontSize);
    }
    if(this.data.packing_remark5 != null && this.data.packing_remark5 != "") {
      y -=15;
      this._drawText(this.data.packing_remark5 , 85, y, fontSize);
    }
    y -=15;

     /***** SHIPPING MARK line */
    this._drawText("SHIPPING MARK : ", 40, y, fontSize);
    this._drawText( this.data.shipping_remark , valueX+10, y , fontSize);

    if(this.data.shipping_remark2 != null && this.data.shipping_remark2 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark2, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark3 != null && this.data.shipping_remark3 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark3, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark4 != null && this.data.shipping_remark4 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark4, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark5 != null && this.data.shipping_remark5 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark5, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark6 != null && this.data.shipping_remark6 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark6, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark7 != null && this.data.shipping_remark7 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark7, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark8 != null && this.data.shipping_remark8 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark8, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark9 != null && this.data.shipping_remark9 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark9, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark10 != null && this.data.shipping_remark10 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark10, valueX+10, y , fontSize);
    }

    let count_batch = 0;

    count_batch = this.data.custom_relations.length;
    console.log("this.data.custom_relations.length",this.data.custom_relations.length)
    
    if(count_batch > 0){
      y -=15;
      this._drawText("BATCH NO : " , 40, y, fontSize);
      let i_batch = 1;
      for (const item of this.data.custom_relations) {
        // for (const i of item.batch) {
          this._drawText(i_batch + ") " + item.batch_no, valueX, y , fontSize);
          
          let text_batch = item.bags + " Bags"
          let textWidth = this.font.widthOfTextAtSize(text_batch, fontSize);
          let BagsX = valueX+130 - textWidth;

          this._drawText(text_batch, BagsX, y , fontSize);
          y -=15;
          i_batch++;
        // }
      
      }
    } else {
      y -=15;
    }

    this._drawText("TOTAL NET WEIGHT :", 40, y, fontSize);

    let text = (this.data.total_net_weight_kg?Number(this.data.total_net_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):"") + " KGS.";
    let textWidth = this.font.widthOfTextAtSize(text, fontSize);
    let x = 200 - textWidth ;
    this._drawText((this.data.total_net_weight_kg?Number(this.data.total_net_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) :"") + " KGS.", x, y, fontSize);

    y -=15;
    this._drawText("TOTAL TARE WEIGHT :", 40, y, fontSize);

    text = (this.data.total_tare_weight?Number(this.data.total_tare_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) :" ") + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText((this.data.total_tare_weight?Number(this.data.total_tare_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " KGS.", x, y, fontSize);
    
    y -=15;
    this._drawText("TOTAL GROSS WEIGHT :", 40, y, fontSize);
    
    text = (this.data.total_gross_weight?Number(this.data.total_gross_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText((this.data.total_gross_weight?Number(this.data.total_gross_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " KGS.", x, y, fontSize);
    
    y -=15;
    this._drawText("COUNTRY OF ORIGIN : THAILAND", 40, y, fontSize);
    y -=15;
    this._drawText("REMARKS : " +this.data.remark, 40, y, fontSize);
    y -=15;
    this._drawText("WE HEREBY CERTIFY THIS INVOICE IS TRUE AND CORRECT.", 40, y, fontSize);

    if(this.data.for_delivery_to != "" && this.data.for_delivery_to != null) {
      y -=15;
      this._drawText("FOR DELIVERY TO :", 40, y, fontSize);
      const for_delivery_to = this.data.for_delivery_to.toUpperCase().split('\n');
      console.log("lines",for_delivery_to)
      const numberOfLines = for_delivery_to.length; 
      
      let a = 15
      for_delivery_to.forEach((line, index) => {
        a -= 15;
        this._drawText(
              line,
              120,
              y+a,
              fontSize
            );
      }); 
      y +=a;
    }
    
  }

  _drawCustomerInfoCustomer() {
    const labelSize = 8;
    const valueSize = 8;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 340;
    const rightValueX = 390;    

    const startY = 670;
    const lineGap = 15; 
  
    let leftY = startY;
    this._drawText("INVOICE NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.invoice_number, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("SALE ORDER NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.es_no, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("CONTRACT NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.po_number, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("BILL TO :", leftX, leftY, labelSize, false);
    this._drawText(this.data.customer_name.toUpperCase(), valueX-30, leftY, valueSize);

    if(this.data.customer_name?.toUpperCase().includes("TOP BLOSSOM")) {
      leftY -= lineGap;
      this._drawText("SHIPPER :", leftX, leftY, labelSize, false);
      // this._drawText(this.data.shipper, valueX-30, leftY, valueSize);

      const lines = this.data.shipper.split('\n');
      console.log("lines",lines)
      const numberOfLines = lines.length; 
      
      let a = lineGap
      lines.forEach((line, index) => {
        

        a -= lineGap;
        this._drawText(
          line,
          valueX-30,
          leftY+a,
          valueSize
        );
      }); 
      leftY +=a;

    }

    leftY -= lineGap;
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
    let term_line = leftY
    this._drawText("TERM OF PAYMENT :", leftX, leftY, labelSize, false);
    
    this._drawText(this.data.payment_term, valueX+5, leftY, valueSize);

    // const payment_term = this._splitText(
    //     this.data.payment_term,
    //     200,       
    //     this.font,
    //     valueSize
    // );

    // payment_term.forEach((line, index) => {
    //   if(index > 0){
    //       leftY -= lineGap;
    //   }
    //   this._drawText(
    //     line,
    //     valueX+10,
    //     leftY,
    //     valueSize
    //   );
    // }); 
    
    

    leftY -= lineGap;
    this._drawText("SHIPMENT BY :", leftX, leftY, labelSize, false);
    this._drawText(this.data.vessel.toUpperCase(), valueX, leftY, valueSize);

    leftY -= lineGap;
    this._drawText("FROM :", leftX, leftY, labelSize, false);
    this._drawText(this.data.loading_port, valueX, leftY, valueSize);


    let rightY = startY
    const dateObject = new Date();

    const date_formattedDateUTC = dateObject.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText("DATE :", rightLabelX+100, rightY, labelSize, false);
    this._drawText(date_formattedDateUTC, rightLabelX+135, rightY, valueSize);

   
    



    rightY -= (lineGap * 3)
    this._drawText("SHIP TO :", rightLabelX, rightY, labelSize, false);
    this._drawText(this.data.destination_port, rightValueX, rightY, valueSize);

    if(this.data.customer_name?.toUpperCase().includes("MITACHARM") || this.data.customer_name?.toUpperCase().includes("XIAMEN")) {
      this._drawText("L/C NO :", rightLabelX, rightY - (lineGap), labelSize, false);
      this._drawText(this.data.lc_no, rightValueX, rightY - (lineGap), valueSize);

    }
    

    if(this.data.customer_name?.toUpperCase().includes("TOP BLOSSOM")) {

      if(this.data.consignee1 != null && this.data.consignee1 !="") {
        rightY -=15
        this._drawText("CONSIGNEE :  ", rightLabelX, rightY, labelSize, false);

        const consignee = this._splitText(
            this.data.consignee1,
            150,       
            this.font,
            valueSize
        );

        consignee.forEach((line, index) => {
          if(index > 0) {
            rightY -= 15;
            this._drawText(
              line,
              rightLabelX,
              rightY,
              valueSize
          );
          } else {
            this._drawText(
              line,
              rightValueX + 5,
              rightY,
              valueSize
            );
          }
          
        }); 
      }
      
      // this._drawText(this.data.consignee1, rightValueX, startYright , valueSize);

      if(this.data.consignee2 !="" && this.data.consignee2 != null) {
        rightY -=15
        this._drawText(this.data.consignee2, rightLabelX, rightY , valueSize);
      }

      if(this.data.consignee3 !="" && this.data.consignee3 != null) {
        rightY -=15
        this._drawText(this.data.consignee3, rightLabelX, rightY , valueSize);
      }

    }



    if(this.data.customer_name?.toUpperCase().includes("TOP BLOSSOM")) {
      rightY = leftY + (lineGap * 2)
    } else {
      rightY = leftY + (lineGap * 2)

    if (rightY == term_line) {
      rightY += lineGap;
    }

    console.log("this.data.due_date",this.data.due_date)
    if(this.data.show_due_date == true && !this.data.customer_name?.toUpperCase().includes("ITC LIMITED")) {
      const due_date_obj = new Date(this.data.due_date);

      const due_date_formattedDateUTC = due_date_obj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC' // Forces UTC interpretation
      }).toUpperCase();

      this._drawText("DUE DATE :", rightLabelX, rightY, labelSize, false);
      this._drawText((this.data.due_date == "" || this.data.due_date == null)?"":due_date_formattedDateUTC, rightValueX, rightY, valueSize);
    }

    }
    
    


    rightY -= (lineGap*2)
    const date_etd = new Date(this.data.etd);

    const etd_formattedDate = date_etd.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETD :", rightLabelX, rightY, labelSize, false);
    this._drawText((this.data.etd == "" || this.data.etd == null)?"":etd_formattedDate, rightValueX, rightY, valueSize);


    rightY -= lineGap 
    const date_eta = new Date(this.data.eta);

    const eta_formattedDate = date_eta.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETA :", rightLabelX, rightY, labelSize, false);
    this._drawText((this.data.eta == "" || this.data.eta == null)?"":eta_formattedDate, rightValueX, rightY, valueSize);

    y_end = rightY
  }

  _drawTableCustomer() {
    let y = y_end-45;
    const fontSize = 8;
    const quantityX = 340;


    this._drawLine(40, y+30, 555, y+30, 1);

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


    this._drawLine(40, y, 555, y, 1);

    let currentY = y; 
    const rowHeight = 15; // ความสูงของแต่ละแถว
    let bag_type = '';
    let bag_type_count = 0;

    let index_total = this.data.line_items.length;
    let index_line_items = 0;
    for (const item of this.data.line_items) {
      index_line_items++;
      console.log("item.bag_type",item.bag_type)
      if(bag_type != item.bag_type) {
        bag_type = item.bag_type
        bag_type_count ++;
      }

      // this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);

      let lines = item.invoice_description.split('\n');
      let numberOfLines = lines.length; 
      
      let a = 0
      lines.forEach((line, index) => {
        const product_name = this._splitText(
          line,
          300,       
          this.font,
          fontSize
        );

        product_name.forEach((l, i) => {
            a -= 15;
            this._drawText(
              l,
              40,
              currentY+a,
              fontSize
          );
        }); 
      }); 


      this._drawText((item.bag_qty?item.bag_qty:" ") +" x "+(item.packaging_type?item.packaging_type:"")+" KGS = "+(item.quantity?Number(item.quantity).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " MT" || "0.00", 320, currentY - 15, fontSize);

      let unit_price_new = Number(item.unit_price) ; // (Number(item.unit_price)+Number(item.freight_cost_usd)+Number(item.insurance_cost_usd))
      this._drawText(unit_price_new.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) || "0.00", 450, currentY - 15, fontSize);

      const amountText = (unit_price_new*Number(item.quantity)).toLocaleString('en-US', {
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

      if(index_line_items == index_total) {
        this._drawLine(500, currentY-2-15, 555, currentY-2-15, 1);
      }

      if(item.invoice_description2 != "") {
        currentY -=15

        lines = item.invoice_description2.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description3 != "") {
        currentY -=15
        lines = item.invoice_description3.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description4 != "") {
        currentY -=15
        lines = item.invoice_description4.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description5 != "") {
        currentY -=15
        lines = item.invoice_description5.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description6 != "") {
        currentY -=15
        lines = item.invoice_description6.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }


      console.log(currentY)

      // ลดพิกัด Y ลงไปสำหรับรายการถัดไป
      currentY -= 0 - a;


      console.log(currentY)
      // this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);

   
      y = currentY

    }


   
    // this._drawLine(500, currentY-2, 555, currentY-2, 1);
    y = y+15

    // custom subtotal //'TOTAL 
    text = 'TOTAL ' + this.data.delivery_terms;
    if(this.data.customer_name == "MITACHARM CORPORATION"  ||  this.data.customer_name == "ITC LIMITED"  ||  this.data.customer_name == "Sanguan Wongse Japan Co.,Ltd."   ||  this.data.customer_name =="International Additive Concepts Inc.") {
        text = 'TOTAL ' + this.data.delivery_terms;
    }

    if(this.data.customer_name?.toUpperCase().includes("XIAMEN")) {
      text = 'TOTAL ' + this.data.delivery_terms+ " (Incoterm 2020)".toUpperCase()
    }
  
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


    const thickness = 1;      
    const gap = 2;              
    const offsetFromText = 4;   

    this._drawLine(500, y - offsetFromText, 555, y - offsetFromText, thickness);
    this._drawLine(500, y - offsetFromText - gap - thickness, 555, y - offsetFromText - gap - thickness, thickness);

    y -= 15;
    this._drawText('TOTAL', quantityX - 30, y, fontSize);

    text = String(this.data.total_bag_qty);
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 380 - textWidth -5; 


    this._drawLine(quantityX,  y+15 - offsetFromText-2, 380-5,  y+15 - offsetFromText-2, thickness);

    this._drawText(this.data.total_bag_qty, x, y, fontSize);

    this._drawLine(quantityX, y - offsetFromText, 380-5, y - offsetFromText, thickness);

    console.log("bag_type",bag_type)
    if(bag_type_count > 1) {
      bag_type = 'BAGS'
    }

    this._drawText(bag_type , quantityX + 40, y, fontSize);

    if(this.data.total_pallet_qty != 0) {
      y -= 15;
      this._drawText('IN', quantityX - 30, y, fontSize);

      text = String(this.data.total_pallet_qty);
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = 380 - textWidth-5 ; 

      this._drawText(this.data.total_pallet_qty, x, y, fontSize);

      this._drawLine(quantityX, y - offsetFromText, 380-5, y - offsetFromText, thickness);
      this._drawLine(quantityX, y- offsetFromText - gap - thickness, 380-5, y- offsetFromText - gap - thickness, thickness);

      this._drawText('PALLETS', quantityX + 40, y, fontSize);
    }
    

    y -= 15 
    y -= 15 
    text = "(TOTAL US DOLLARS " + this._numberToWords(this.data.total_invoice_amount) + ")" ;
    this._drawText(text, 40, y, fontSize);

    y_end = y;
  }

  _drawFooterCustomer() {
    let y = y_end;
    const fontSize = 8;
    const valueX = 100;

    this._drawText(this.data.amountText, 40, y, fontSize, false);
    y -=15;

    /***** packing line */
    this._drawText("PACKING : " , 40, y, fontSize);
    this._drawText(this.data.packing_remark , 85, y, fontSize);
    if(this.data.packing_remark2 != null && this.data.packing_remark2 != "") {
      y -=15;
      this._drawText(this.data.packing_remark2 , 85, y, fontSize);
    }
    if(this.data.packing_remark3 != null && this.data.packing_remark3 != "") {
      y -=15;
      this._drawText(this.data.packing_remark3 , 85, y, fontSize);
    }
    if(this.data.packing_remark4 != null && this.data.packing_remark4 != "") {
      y -=15;
      this._drawText(this.data.packing_remark4 , 85, y, fontSize);
    }
    if(this.data.packing_remark5 != null && this.data.packing_remark5 != "") {
      y -=15;
      this._drawText(this.data.packing_remark5 , 85, y, fontSize);
    }
    y -=15;

     /***** SHIPPING MARK line */
    this._drawText("SHIPPING MARK : ", 40, y, fontSize);
    this._drawText( this.data.shipping_remark , valueX+10, y , fontSize);

    if(this.data.shipping_remark2 != null && this.data.shipping_remark2 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark2, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark3 != null && this.data.shipping_remark3 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark3, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark4 != null && this.data.shipping_remark4 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark4, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark5 != null && this.data.shipping_remark5 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark5, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark6 != null && this.data.shipping_remark6 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark6, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark7 != null && this.data.shipping_remark7 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark7, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark8 != null && this.data.shipping_remark8 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark8, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark9 != null && this.data.shipping_remark9 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark9, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark10 != null && this.data.shipping_remark10 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark10, valueX+10, y , fontSize);
    }

    let count_batch = 0;
    count_batch = this.data.custom_relations.length;
    
    if(count_batch > 0){
      y -=15;
      this._drawText("BATCH NO : " , 40, y, fontSize);
      let i_batch = 1;
      for (const item of this.data.custom_relations) {
        // for (const i of item.batch) {
          this._drawText(i_batch + ") " + item.batch_no, valueX, y , fontSize);
          
          let text_batch = item.bags + " Bags"
          let textWidth = this.font.widthOfTextAtSize(text_batch, fontSize);
          let BagsX = valueX+130 - textWidth;

          this._drawText(text_batch, BagsX, y , fontSize);
          y -=15;
          i_batch++;
        // }
      
      }
    } else {
      y -=15;
    }

    this._drawText("TOTAL NET WEIGHT :", 40, y, fontSize);

    let text = (this.data.total_net_weight_kg?Number(this.data.total_net_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):"") + " KGS.";
    let textWidth = this.font.widthOfTextAtSize(text, fontSize);
    let x = 200 - textWidth ;
    this._drawText((this.data.total_net_weight_kg?Number(this.data.total_net_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) :"") + " KGS.", x, y, fontSize);

    y -=15;
    this._drawText("TOTAL TARE WEIGHT :", 40, y, fontSize);

    text = (this.data.total_tare_weight?Number(this.data.total_tare_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) :" ") + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText((this.data.total_tare_weight?Number(this.data.total_tare_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " KGS.", x, y, fontSize);
    
    y -=15;
    this._drawText("TOTAL GROSS WEIGHT :", 40, y, fontSize);
    
    text = (this.data.total_gross_weight?Number(this.data.total_gross_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText((this.data.total_gross_weight?Number(this.data.total_gross_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " KGS.", x, y, fontSize);
    
    y -=15;
    this._drawText("COUNTRY OF ORIGIN : THAILAND", 40, y, fontSize);
    y -=15;
    this._drawText("REMARKS : " +this.data.remark, 40, y, fontSize);

    if(this.data.customer_name?.toUpperCase().includes("CHYUAN HARVEST INDUSTRIES") || this.data.customer_name?.toUpperCase().includes("ITC LIMITED")) {
      if(this.data.bank_name != "" || this.data.bank_name != null) {
        y -=15;
        this._drawText("BANK NAME ", 40, y, fontSize);
        this._drawText(": "+ this.data.bank_name, 140, y, fontSize);
      }
      
      if(this.data.bank_address != "" || this.data.bank_address != null) {
        y -=15;
        this._drawText("BANK ADDRESS ", 40, y, fontSize);
        this._drawText(": "+ this.data.bank_address, 140, y, fontSize);
      }
      

      if(this.data.account_name != "" || this.data.account_name != null) {
        y -=15;
        this._drawText("ACCOUNT NAME ", 40, y, fontSize);
        this._drawText(": "+ this.data.account_name, 140, y, fontSize);
      }

      
      if(this.data.account_number != "" || this.data.account_number != null) {
        y -=15;
        this._drawText("ACCOUNT NO ", 40, y, fontSize);
        this._drawText(": "+ this.data.account_number, 140, y, fontSize);
      }
      

      if(this.data.swift != "" || this.data.swift != null) {
        y -=15;
        this._drawText("S.W.I.F.T ", 40, y, fontSize);
        this._drawText(": "+ (this.data.swift?this.data.swift:""), 140, y, fontSize);
      }
      
    }

    y -=15;
    this._drawText("WE HEREBY CERTIFY THIS INVOICE IS TRUE AND CORRECT.", 40, y, fontSize);

    if(this.data.for_delivery_to != "" && this.data.for_delivery_to != null) {
      y -=15;
      this._drawText("FOR DELIVERY TO :", 40, y, fontSize);
      const for_delivery_to = this.data.for_delivery_to.toUpperCase().split('\n');
      console.log("lines",for_delivery_to)
      const numberOfLines = for_delivery_to.length; 
      
      let a = 15
      for_delivery_to.forEach((line, index) => {
        a -= 15;
        this._drawText(
              line,
              120,
              y+a,
              fontSize
            );
      }); 
      y +=a;

    }

    
  }

  async _drawHeaderPI() {
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
    
  _drawTitlePI() {
    const text = this.data.invoice_type == "performa_invoice" ? "PROFORMA INVOICE" : this.data.invoice_type == "order_confirmation" ?"ORDER CONFIRMATION" :"is not PI or OC";

    const textWidth = this.font.widthOfTextAtSize(text, 20);

    const pageWidth = this.page.getWidth();

    const x = (pageWidth - textWidth) / 2;

    this._drawText(
      text,
      x,
      710,
      18,
      true
    );
  }

  _drawCustomerInfoPI() {
    const labelSize = 8;
    const valueSize = 8;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 400;
    const rightValueX = 450;    

    let startY = 690;
    const startrightY = 690;
    const lineGap = 15; 
  
    this._drawText("SOLD TO : ", leftX, startY, labelSize, false);
    this._drawText(this.data.customer_name.toUpperCase(), valueX-30, startY, valueSize);

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
      let text = this.data.address5
      if (this.data.customer_name?.toUpperCase().includes("ELIXA")) {
        text = text.replace("PAN NO. AAECE5411E,", "");
      }
      this._drawText(text, valueX-30, startY, valueSize);
    }
    if(this.data.address6){
      startY -= 15;
      
      let text = this.data.address6
      if (this.data.customer_name?.toUpperCase().includes("ELIXA")) {
        text = text.replace("IEC CODE: AAECE5411E", "");
      }
      this._drawText(text, valueX-30, startY, valueSize);
    }
    startY -= 15;
    this._drawText("SHIPPED TO :", leftX, startY, labelSize, false);
    this._drawText(this.data.shipped_to, valueX-25, startY, valueSize);


    this._drawText("PI NO.  ", rightLabelX, startrightY, labelSize, false);
    this._drawText(": " +this.data.pi_number, rightValueX, startrightY , valueSize);

    // this._drawText("DATE :", rightLabelX+100, startY - (lineGap * 0.5), labelSize, false);
    // this._drawText(invoice_date_formattedDateUTC, rightLabelX+135, startY - (lineGap * 0.5), valueSize);

    this._drawText("DATE ", rightLabelX, startrightY - (lineGap * 1), labelSize, false);
    const date_obj = new Date();

    const date_formattedDateUTC = date_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText(": " +date_formattedDateUTC, rightValueX, startrightY - (lineGap * 1), valueSize);

    this._drawText("PO NO.", rightLabelX, startrightY - (lineGap * 2), labelSize, false);
    this._drawText(": " +this.data.po_number, rightValueX, startrightY - (lineGap * 2), valueSize);



    
    y_end = startY-40
  }


  _drawTablePI() {
    let y = y_end;
    const fontSize = 8;
    const quantityX = 340;

  
    this._drawLine(40, y + 30, 555, y + 30, 1);

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

    this._drawLine(40, y, 555, y, 1);


    let currentY = y; 
    const rowHeight = 15; // ความสูงของแต่ละแถว

    let index = 0;
    for (const item of this.data.line_items) {
      index++;


      this._drawText(index, 45, currentY - 15, fontSize);

       const invoice_description = this._splitText(
          item.configuration + " " + item.product_name,
          230,       
          this.font,
          fontSize
      );

      let a = 0
      console.log(invoice_description)
      invoice_description.forEach((line, index) => {
          a -= 15;
          this._drawText(
            line,
            65,
            currentY+a,
            fontSize
          );
      }); 

      // this._drawText((item.description?item.description:"") + " " + (item.product_name?item.product_name:"")|| "", 70, currentY - 15, fontSize);

      this._drawText((item.bag_qty?item.bag_qty:"") +" x "+(item.packaging_type?item.packaging_type:"")+" KGS = "+(item.quantity ?Number(item.quantity).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) :"")+ " MT" || "0.00", 320, currentY - 15, fontSize);
      // this._drawText(item.unit_price || "0.00", 450, currentY - 15, fontSize);
      this._drawText(Number(item.unit_price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) || "0.00", 450, currentY - 15, fontSize)

      const amountText =  Number(item.total_amount).toLocaleString('en-US', {
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

      
      // ลดพิกัด Y ลงไปสำหรับรายการถัดไป
      currentY -= 0 - a;


      console.log(currentY)
    
      y = currentY


    }
    y = y+15

    this._drawLine(40, y-20, 555, y-20, 1);

    

    let totalText = 'TOTAL ' + this.data.delivery_terms.slice(0, 3) +' ' + this.data.shipped_to;
    if(this.data.customer_name == "MITACHARM CORPORATION"  ||  this.data.customer_name == "ITC LIMITED") {
        totalText = 'TOTAL ' + this.data.delivery_terms;
    }
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

    this._drawLine(500, y-30 - offsetFromText, 555, y-30 - offsetFromText, 1);
    this._drawLine(500, y -30- offsetFromText - gap - thickness, 555, y -30- offsetFromText - gap - thickness, 1);

 

    text = "(TOTAL US DOLLARS " + this._numberToWords(this.data.total_invoice_amount) + " )" ;

    textWidth = this.font.widthOfTextAtSize(text, fontSize);

    let pageWidth = this.page.getWidth();

    x = (pageWidth - textWidth) / 2;


    this._drawText(text, x, y-50, fontSize);

    this._drawLine(40, y -55, 555, y -55, 1);

    y_end = y-60;
  }

  _drawFooterPI() {
    let y = y_end;
    const fontSize = 8;

    
    y -=15;
    this._drawText("PACKAGING ", 40, y, fontSize);
    this._drawText(": " + this.data.packing_remark , 140, y, fontSize);
    if(this.data.remark != null && this.data.remark != "") {
      y -=15;
      this._drawText(": " +this.data.remark , 140, y, fontSize);
    }
    if(this.data.packing_remark2 != null && this.data.packing_remark2 != "") {
      y -=15;
      this._drawText(": " +this.data.packing_remark2 , 140, y, fontSize);
    }
    if(this.data.remark2 != null && this.data.remark2 != "") {
      y -=15;
      this._drawText(": " +this.data.remark2 , 140, y, fontSize);
    }
    if(this.data.packing_remark3 != null && this.data.packing_remark3 != "") {
      y -=15;
      this._drawText(": " +this.data.packing_remark3 , 140, y, fontSize);
    }
    if(this.data.remark3 != null && this.data.remark3 != "") {
      y -=15;
      this._drawText(": " +this.data.remark3 , 140, y, fontSize);
    }
    if(this.data.packing_remark4 != null && this.data.packing_remark4 != "") {
      y -=15;
      this._drawText(": " +this.data.packing_remark4 , 140, y, fontSize);
    }
    if(this.data.remark4 != null && this.data.remark4 != "") {
      y -=15;
      this._drawText(": " +this.data.remark4 , 140, y, fontSize);
    }
    if(this.data.packing_remark5 != null && this.data.packing_remark5 != "") {
      y -=15;
      this._drawText(": " +this.data.packing_remark5 , 140, y, fontSize);
    }
    if(this.data.remark5 != null && this.data.remark5 != "") {
      y -=15;
      this._drawText(": " +this.data.remark5 , 140, y, fontSize);
    }

    y -=15;
    this._drawText("DELIVERY ", 40, y, fontSize);
    if( this.data.customer_name == "MITACHARM CORPORATION") {
      this._drawText(": BY SEA FROM ANY THAILAND PORTS TO ANY TAIWAN PORT" , 140, y, fontSize);
    } else {
      this._drawText(": BY SEA FROM ANY THAILAND PORTS TO " + this.data.shipped_to , 140, y, fontSize);
    }
    
    
    y -=15;

    this._drawText("SHIPMENT", 40, y, fontSize);
    this._drawText(": " + this.data.shipment.toUpperCase(), 140, y, fontSize);
    y -=15;

    this._drawText("TERM OF PAYMENT ", 40, y, fontSize);
    this._drawText(": "+ this.data.payment_term, 140, y, fontSize);
    // const payment_term = this._splitText(
    //   ": "+this.data.payment_term,
    //   400,       
    //   this.font,
    //   fontSize
    // );

    // payment_term.forEach((line, index) => {
    //   if(index > 0){
    //       y -= 15;
    //   } 
    //   this._drawText(
    //     line,
    //     140,
    //     y,
    //     fontSize
    //   );
    // }); 



    if(this.data.last_of_ship_ment != "" && this.data.last_of_ship_ment != null) {
      y -=15;
      this._drawText("LASTEST OF SHIPMENT", 40, y, fontSize);
      this._drawText(": "+ new Date(this.data.last_of_ship_ment).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
      }).toUpperCase(), 140, y, fontSize);
    }

    
    if(this.data.expiry_date_of_lc != "" && this.data.expiry_date_of_lc != null) {
      y -=15;
      this._drawText("EXPIRY DATE OF L/C", 40, y, fontSize);
      this._drawText(": "+ new Date(this.data.expiry_date_of_lc).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric"
      }).toUpperCase(), 140, y, fontSize);
    }

    if(this.data.tolerance != "" && this.data.tolerance != null) {
      y -=15;
      this._drawText("TOLERANCE", 40, y, fontSize);
      this._drawText(": "+ this.data.tolerance, 140, y, fontSize);
    }
    y -=15;

    if(this.data.invoice_type == "performa_invoice") {
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
      this._drawText(": "+ (this.data.swift?this.data.swift:""), 140, y, fontSize);
    }
    


    y -=50;

    if(y  < bottomMargin) {
      if(y < (y - (page_count * pageHeight) + bottomMargin )) {
        this.page =  this.pdfDoc.addPage([595.28, 841.89]); //this.page..addPage([pageWidth, pageHeight]);
        this._drawHeader();
        page_count++;
        start_page_new =  0
        y = -80
      }
     
    }


    this._drawLine(400, y, 520, y, 1);

    y -=15;
      this._drawText("AUTHORIZED SIGNATURE", 415, y, fontSize);
  }

  _drawCustomerInfoAcc() {
    const labelSize = 8;
    const valueSize = 8;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 340;
    const rightValueX = 390;    

    const startY = 670;
    const lineGap = 15; 
  
    let leftY = startY;
    this._drawText("INVOICE NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.invoice_number, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("SALE ORDER NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.order_number, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("CONTRACT NO. :", leftX, leftY, labelSize, false);
    this._drawText(this.data.po_number, valueX, leftY, valueSize);

    leftY -= lineGap
    this._drawText("BILL TO :", leftX, leftY, labelSize, false);
    
    this._drawText(this.data.customer_name.toUpperCase(), valueX-30, leftY, valueSize);

    leftY -= lineGap;

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
    let term_line = leftY
    this._drawText("TERM OF PAYMENT :", leftX, leftY, labelSize, false);
    this._drawText(this.data.payment_term, valueX+5, leftY, valueSize);
    // const payment_term = this._splitText(
    //     this.data.payment_term,
    //     200,       
    //     this.font,
    //     valueSize
    // );

    // payment_term.forEach((line, index) => {
    //   if(index > 0){
    //       leftY -= lineGap;
    //   }
    //   this._drawText(
    //     line,
    //     valueX+10,
    //     leftY,
    //     valueSize
    //   );
    // }); 

    leftY -= lineGap;
    this._drawText("SHIPMENT BY :", leftX, leftY, labelSize, false);
    this._drawText(this.data.vessel.toUpperCase(), valueX, leftY, valueSize);

    leftY -= lineGap;
    this._drawText("FROM :", leftX, leftY, labelSize, false);
    this._drawText(this.data.loading_port, valueX, leftY, valueSize);


    let rightY = startY
    const dateObject = new Date();

    const date_formattedDateUTC = dateObject.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText("DATE :", rightLabelX+100, rightY, labelSize, false);
    this._drawText(date_formattedDateUTC, rightLabelX+135, rightY, valueSize);

    rightY -= (lineGap * 3)
    this._drawText("SHIP TO :", rightLabelX, rightY, labelSize, false);
    this._drawText(this.data.destination_port, rightValueX, rightY, valueSize);

    if(this.data.customer_name?.toUpperCase().includes("MITACHARM") || this.data.customer_name?.toUpperCase().includes("XIAMEN")) {
      this._drawText("L/C NO :", rightLabelX, rightY - (lineGap), labelSize, false);
      this._drawText(this.data.lc_no, rightValueX, rightY - (lineGap), valueSize);

    }



    console.log("this.data.due_date ",this.data.due_date )
    rightY = leftY + (lineGap * 2)

    if(rightY == term_line) {
      rightY += lineGap;
    }
    if(this.data.show_due_date == true && !this.data.customer_name?.toUpperCase().includes("ITC LIMITED")) {
      const due_date_obj = new Date(this.data.due_date);

      const due_date_formattedDateUTC = due_date_obj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC' // Forces UTC interpretation
      }).toUpperCase();

      this._drawText("DUE DATE :", rightLabelX, rightY, labelSize, false);
      this._drawText((this.data.due_date == "" || this.data.due_date == null)?"":due_date_formattedDateUTC, rightValueX, rightY, valueSize);
    }
    


    rightY -= (lineGap*2) 
    const date_etd = new Date(this.data.etd);

    const etd_formattedDate = date_etd.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETD :", rightLabelX, rightY, labelSize, false);
    this._drawText((this.data.etd == "" || this.data.etd == null)?"":etd_formattedDate, rightValueX, rightY, valueSize);


    rightY -= lineGap 
    const date_eta = new Date(this.data.eta);

    const eta_formattedDate = date_eta.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText("ETA :", rightLabelX, rightY, labelSize, false);
    this._drawText((this.data.eta == "" || this.data.eta == null)?"":eta_formattedDate, rightValueX, rightY, valueSize);

    y_end = rightY
  }
  
  _drawTableAcc() {
    let y = y_end-45;
    const fontSize = 8;
    const quantityX = 340;

    this._drawLine(40, y+30, 555, y+30, 1);

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



    this._drawLine(40, y, 555, y, 1);

    let currentY = y; 
    const rowHeight = 15; // ความสูงของแต่ละแถว
    let bag_type_count = 0;
    let bag_type = '';
    let index_total = this.data.line_items.length;
    let index_line_items = 0;

    for (const item of this.data.line_items) {
      index_line_items++;
      if(bag_type != item.bag_type) {
        bag_type = item.bag_type
        bag_type_count ++;
      }
  
      // this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);

      let lines = item.invoice_description.split('\n');
      console.log("lines",lines)
      let numberOfLines = lines.length; 
      
      let a = 0
      lines.forEach((line, index) => {
        const product_name = this._splitText(
          line,
          300,       
          this.font,
          fontSize
        );

        product_name.forEach((l, i) => {
            a -= 15;
            this._drawText(
              l,
              40,
              currentY+a,
              fontSize
          );
        }); 
      }); 

      this._drawText((item.bag_qty?item.bag_qty:" ") +" x "+(item.packaging_type?item.packaging_type:"")+" KGS = "+(item.quantity?Number(item.quantity).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " MT" || "0.00", 320, currentY - 15, fontSize);
      this._drawText(Number(item.fob_price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) || "0.00", 450, currentY - 15, fontSize);

      const amountText = Number(Number(item.fob_price) * Number(item.quantity)).toLocaleString('en-US', {
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

      if(index_line_items == index_total) {
        this._drawLine(500, currentY-2-15, 555, currentY-2-15, 1);
      }


       if(item.invoice_description2 != "") {
        currentY -=15

        lines = item.invoice_description2.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description3 != "") {
        currentY -=15
        lines = item.invoice_description3.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description4 != "") {
        currentY -=15
        lines = item.invoice_description4.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description5 != "") {
        currentY -=15
        lines = item.invoice_description5.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      if(item.invoice_description6 != "") {
        currentY -=15
        lines = item.invoice_description6.split('\n');
        numberOfLines = lines.length; 
        
        a = 0
        lines.forEach((line, index) => {
          const product_name = this._splitText(
            line,
            250,       
            this.font,
            fontSize
          );

          product_name.forEach((l, i) => {
              a -= 15;
              this._drawText(
                l,
                40,
                currentY+a,
                fontSize
            );
          }); 
        }); 

      }

      

      // ลดพิกัด Y ลงไปสำหรับรายการถัดไป
      currentY -= 0 -a;
      // this._drawText(item.invoice_description || "", 40, currentY - 15, fontSize);


      y = currentY

    }


    // this._drawLine(500, currentY-2, 555, currentY-2, 1);

    y = y+15
    // text = 'TOTAL ' + this.data.delivery_terms.slice(0, 3) +' ' + this.data.shipped_to;
    if(this.data.delivery_terms.slice(0, 3) == 'CFR' || this.data.delivery_terms.slice(0, 3) == 'CIF'){
      text = 'TOTAL FOB ' + this.data.loading_port ;
    } else {
      text = 'TOTAL ' + this.data.delivery_terms ;
    }
    
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 120;
    this._drawText(text , x, y - 30, fontSize);

    text = Number(this.data.subtotal).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = this.page.getWidth() - textWidth - 40;

    y = y - 30
    this._drawText(text, x, y, fontSize);

    if(this.data.delivery_terms.slice(0, 3) == 'CFR' || this.data.delivery_terms.slice(0, 3) == 'CIF') {
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

    if(this.data.delivery_terms.slice(0, 3) == 'CIF') {
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

    if(this.data.delivery_terms.slice(0, 3) == 'CFR' || this.data.delivery_terms.slice(0, 3) == 'CIF') {


      this._drawLine(500, y-2, 555, y-2, 1);

      y -= 15
      text = 'TOTAL '  + this.data.delivery_terms;
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


    this._drawLine(500, y - offsetFromText, 555, y - offsetFromText, thickness);
    this._drawLine(500, y - offsetFromText - gap - thickness, 555, y - offsetFromText - gap - thickness, thickness);



    y -= 15;
    this._drawText('TOTAL', quantityX - 30, y, fontSize);

    text = String(this.data.total_bag_qty);
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 380 - textWidth -5; 


    this._drawLine(quantityX,  y+15 - offsetFromText-2, 380-5,  y+15 - offsetFromText-2, thickness);

    this._drawText(this.data.total_bag_qty, x, y, fontSize);

    this._drawLine(quantityX, y - offsetFromText, 380-5, y - offsetFromText, thickness);

    if(bag_type_count > 1) {
      bag_type = 'BAGS';
    } 
    this._drawText(bag_type , quantityX + 40, y, fontSize);

    if(this.data.total_pallet_qty != 0) {
      y -= 15;
      this._drawText('IN', quantityX - 30, y, fontSize);

      text = String(this.data.total_pallet_qty);
      textWidth = this.font.widthOfTextAtSize(text, fontSize);
      x = 380 - textWidth-5 ; 

      this._drawText(this.data.total_pallet_qty, x, y, fontSize);

      this._drawLine(quantityX, y - offsetFromText, 380-5, y - offsetFromText, thickness);
      this._drawLine(quantityX, y- offsetFromText - gap - thickness, 380-5, y- offsetFromText - gap - thickness, thickness);

      this._drawText('PALLETS', quantityX + 40, y, fontSize);
    }
    

    y -= 15 
    y -= 15

    text = "(TOTAL US DOLLARS " + this._numberToWords(this.data.total_invoice_amount) + " )" ;
    this._drawText(text, 40, y, fontSize);

    y_end = y;
  }

  _drawFooterAcc() {
    let y = y_end;
    const fontSize = 8;
    const valueX = 100;

    this._drawText(this.data.amountText, 40, y, fontSize);
    y -=15;

    /***** packing line */
    this._drawText("PACKING : " , 40, y, fontSize);
    this._drawText(this.data.packing_remark , 85, y, fontSize);
    if(this.data.packing_remark2 != null && this.data.packing_remark2 != "") {
      y -=15;
      this._drawText(this.data.packing_remark2 , 85, y, fontSize);
    }
    if(this.data.packing_remark3 != null && this.data.packing_remark3 != "") {
      y -=15;
      this._drawText(this.data.packing_remark3 , 85, y, fontSize);
    }
    if(this.data.packing_remark4 != null && this.data.packing_remark4 != "") {
      y -=15;
      this._drawText(this.data.packing_remark4 , 85, y, fontSize);
    }
    if(this.data.packing_remark5 != null && this.data.packing_remark5 != "") {
      y -=15;
      this._drawText(this.data.packing_remark5 , 85, y, fontSize);
    }
    y -=15;

      /***** SHIPPING MARK line */
    this._drawText("SHIPPING MARK : ", 40, y, fontSize);
    this._drawText( this.data.shipping_remark , valueX+10, y , fontSize);

    if(this.data.shipping_remark2 != null && this.data.shipping_remark2 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark2, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark3 != null && this.data.shipping_remark3 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark3, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark4 != null && this.data.shipping_remark4 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark4, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark5 != null && this.data.shipping_remark5 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark5, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark6 != null && this.data.shipping_remark6 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark6, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark7 != null && this.data.shipping_remark7 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark7, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark8 != null && this.data.shipping_remark8 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark8, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark9 != null && this.data.shipping_remark9 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark9, valueX+10, y , fontSize);
    }
    if(this.data.shipping_remark10 != null && this.data.shipping_remark10 != ""){
      y -=15;
      this._drawText(this.data.shipping_remark10, valueX+10, y , fontSize);
    }

    let count_batch = 0;

    count_batch = this.data.custom_relations.length;
    
    if(count_batch > 0){
      y -=15;
      this._drawText("BATCH NO : " , 40, y, fontSize);
      let i_batch = 1;
      for (const item of this.data.custom_relations) {
        // for (const i of item.batch) {
          this._drawText(i_batch + ") " + item.batch_no, valueX, y , fontSize);
          
          let text_batch = item.bags + " Bags"
          let textWidth = this.font.widthOfTextAtSize(text_batch, fontSize);
          let BagsX = valueX+130 - textWidth;

          this._drawText(text_batch, BagsX, y , fontSize);
          y -=15;
          i_batch++;
        // }
      
      }
    } else {
      y -=15;
    }

    
    this._drawText("TOTAL NET WEIGHT :", 40, y, fontSize);

    let text = (this.data.total_net_weight_kg?Number(this.data.total_net_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):"")+ " KGS.";
    let textWidth = this.font.widthOfTextAtSize(text, fontSize);
    let x = 200 - textWidth ;
    this._drawText(text, x, y, fontSize);

    y -=15;
    this._drawText("TOTAL TARE WEIGHT :", 40, y, fontSize);

    text = (this.data.total_tare_weight?Number(this.data.total_tare_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }):" ") + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText((this.data.total_tare_weight?Number(this.data.total_tare_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) :" ") + " KGS.", x, y, fontSize);
    
    y -=15;
    this._drawText("TOTAL GROSS WEIGHT :", 40, y, fontSize);
    
    text = (this.data.total_gross_weight?Number(this.data.total_gross_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) :" ") + " KGS.";
    textWidth = this.font.widthOfTextAtSize(text, fontSize);
    x = 200 - textWidth ;
    this._drawText(text, x, y, fontSize);
    
    y -=15;
    this._drawText("COUNTRY OF ORIGIN : THAILAND", 40, y, fontSize);
    y -=15;
    this._drawText("REMARKS : " +this.data.remark, 40, y, fontSize);

    if(this.data.customer_name?.toUpperCase().includes("CHYUAN HARVEST INDUSTRIES") || this.data.customer_name?.toUpperCase().includes("ITC LIMITED")) {
      if(this.data.bank_name != "" || this.data.bank_name != null) {
        y -=15;
        this._drawText("BANK NAME ", 40, y, fontSize);
        this._drawText(": "+ this.data.bank_name, 140, y, fontSize);
      }
      
      if(this.data.bank_address != "" || this.data.bank_address != null) {
        y -=15;
        this._drawText("BANK ADDRESS ", 40, y, fontSize);
        this._drawText(": "+ this.data.bank_address, 140, y, fontSize);
      }
      

      if(this.data.account_name != "" || this.data.account_name != null) {
        y -=15;
        this._drawText("ACCOUNT NAME ", 40, y, fontSize);
        this._drawText(": "+ this.data.account_name, 140, y, fontSize);
      }

      
      if(this.data.account_number != "" || this.data.account_number != null) {
        y -=15;
        this._drawText("ACCOUNT NO ", 40, y, fontSize);
        this._drawText(": "+ this.data.account_number, 140, y, fontSize);
      }
      

      if(this.data.swift != "" || this.data.swift != null) {
        y -=15;
        this._drawText("S.W.I.F.T ", 40, y, fontSize);
        this._drawText(": "+ (this.data.swift?this.data.swift:""), 140, y, fontSize);
      }
      
    }

    y -=15;
    this._drawText("WE HEREBY CERTIFY THIS INVOICE IS TRUE AND CORRECT.", 40, y, fontSize);

    if(this.data.for_delivery_to != "" && this.data.for_delivery_to != null) {
      y -=15;
      this._drawText("FOR DELIVERY TO :", 40, y, fontSize);
      const for_delivery_to = this.data.for_delivery_to.toUpperCase().split('\n');
      console.log("lines",for_delivery_to)
      const numberOfLines = for_delivery_to.length; 
      
      let a = 15
      for_delivery_to.forEach((line, index) => {
        a -= 15;
        this._drawText(
              line,
              120,
              y+a,
              fontSize
            );
      }); 
      y +=a;
    }
    
  }

   _drawTitlePack() {
    const text = "PACKING LIST";

    const textWidth = this.font.widthOfTextAtSize(text, 20);

    const pageWidth = this.page.getWidth();

    const x = (pageWidth - textWidth) / 2;

    this._drawText(
      text,
      x,
      710,
      18,
      true
    );

    this._drawText("DATE : ", 440, 720, 8, false);
    const date_obj = new Date();

    const date_formattedDateUTC = date_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText(date_formattedDateUTC, 470, 720, 8);

  }

  _drawCustomerInfoPack() {
    const labelSize = 8;
    const valueSize = 8;

    const leftX = 40;
    const valueX = 120;

    const rightLabelX = 350;
    const rightValueX = 410;    

    let startY = 690;
    let startYright = 690;
    const lineGap = 15; 
  
    this._drawText("SOLD TO : ", leftX, startY, labelSize, false);
    this._drawText(this.data.customer_name.toUpperCase(), valueX-30, startY, valueSize);

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

    if(this.data.customer_name?.toUpperCase().includes("TOP BLOSSOM")) {
      startY -= 15;
      this._drawText("SHIPPER :", leftX, startY, labelSize, false);
      // this._drawText(this.data.shipper, valueX-30, startY, valueSize);

      const lines = this.data.shipper.split('\n');
      console.log("lines",lines)
      const numberOfLines = lines.length; 
      
      let a = 15
      lines.forEach((line, index) => {
        

        a -= 15;
        this._drawText(
          line,
          valueX-30,
          startY+a,
          valueSize
        );
      }); 
      startY +=a;

    }
    

    
    startY -= 15;
    this._drawText("SHIP TO :", leftX, startY, labelSize, false);
    
    this._drawText(this.data.destination_port, valueX-30, startY, valueSize);

    startY -= 15;
    this._drawText("CONTRACT NO. : ", leftX, startY, labelSize, false);
    this._drawText(this.data.po_number, valueX, startY, valueSize);

    // this._drawText("DATE :", rightLabelX+100, startY - (lineGap * 0.5), labelSize, false);
    // this._drawText(invoice_date_formattedDateUTC, rightLabelX+135, startY - (lineGap * 0.5), valueSize);

    this._drawText("INVOICE NO. :  ", rightLabelX, startYright, labelSize, false);
    this._drawText(this.data.invoice_number, rightValueX, startYright , valueSize);

    if(this.data.customer_name?.toUpperCase().includes("MITACHARM") || this.data.customer_name?.toUpperCase().includes("XIAMEN")) {
      startYright -= 15;
      this._drawText("L/C NO :", rightLabelX, startYright, labelSize, false);
      this._drawText(this.data.lc_no, rightValueX, startYright, valueSize);

    }


    if(this.data.customer_name?.toUpperCase().includes("TOP BLOSSOM")) {

      if(this.data.consignee1 != null && this.data.consignee1 !="") {
        startYright -=15
        this._drawText("CONSIGNEE :  ", rightLabelX, startYright, labelSize, false);

        const consignee = this._splitText(
            this.data.consignee1,
            150,       
            this.font,
            valueSize
        );

        consignee.forEach((line, index) => {
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

    }

    

    y_end = startY
   
  }


  _drawTablePack() {
    let y = y_end-30;
    const fontSize = 8;
    const quantityX = 340;
    const leftX = 40;
    const valueX = 200;



    this._drawLine(40, y + 25, 555, y + 25, 1);

    y +=15;
    this._drawText("DESCRIPTION OF GOODS : ", leftX, y , fontSize, false);

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
    /*for (const item of this.data.line_items) {
      // this._drawText( item.invoice_description, valueX, y , fontSize);

      const lines = item.product_name.split('\n');
      console.log("lines",lines)
      const numberOfLines = lines.length; 
      
      let a = 0
      lines.forEach((line, index) => {
        const product_name = this._splitText(
          line,
          350,       
          this.font,
          fontSize
        );

        product_name.forEach((l, i) => {
            a -= 15;
            this._drawText(
              l,
              valueX,
              y+a,
              fontSize
          );
        }); 
      }); 
      y -=-a;
    }*/
   
    // if(y)
    
      // y -=15;
    
    this._drawText("PACKING CONDITION : ", leftX, y , fontSize, false);

    if( this.data.customer_name?.toUpperCase().includes("PULCRA")) {

      const lines = this.data.packing_condition.split('\n');
      console.log("lines",lines)
      const numberOfLines = lines.length; 
      
      let a = 15
      lines.forEach((line, index) => {

        a -= 15;
        this._drawText( line, valueX, y+a , fontSize);

      }); 
      y = y+a;
    } else {

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

    }

    

    y -=15;
    this._drawText("SHIPPING MARK : ", leftX, y , fontSize, false);
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
    this._drawText("QUANTITY : ", leftX, y , fontSize, false);

    //  this._drawText(
    //       (this.data.quantity?this.data.quantity:" "),
    //       valueX,
    //       y,
    //       fontSize
    //     );
    
    const quantity = this._splitText(
        this.data.quantity?this.data.quantity:" ",
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
    this._drawText("VESSEL'S NAME : ", leftX, y , fontSize, false);
    this._drawText( this.data.vessel.toUpperCase() , valueX, y , fontSize);

    y -=15;
    this._drawText("ETD : ", leftX, y , fontSize, false);

    const etd_obj = new Date(this.data.etd);

    const etd_date_formattedDateUTC = etd_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();

    this._drawText((this.data.etd == "" || this.data.etd == null)?"":etd_date_formattedDateUTC , valueX, y , fontSize);

    y -=15;
    this._drawText("ETA : ", leftX, y , fontSize, false);

    const eta_obj = new Date(this.data.eta);

    const eta_date_formattedDateUTC = eta_obj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC' // Forces UTC interpretation
    }).toUpperCase();
    this._drawText((this.data.eta == "" || this.data.eta == null)?"":eta_date_formattedDateUTC , valueX, y , fontSize);

     y -=15;
    this._drawText("TOTAL NET WEIGHT : ", leftX, y , fontSize, false);
    this._drawText( Number(this.data.total_net_weight_kg).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +" KGS.", valueX, y , fontSize);

    y -=15;
    this._drawText("TOTAL GROSS WEIGHT : ", leftX, y , fontSize, false);
    this._drawText( Number(this.data.total_gross_weight).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) +" KGS.", valueX, y , fontSize);

    y -=15;
    this._drawText("COUNTRY OF ORIGIN : ", leftX, y , fontSize, false);
    this._drawText( "THAILAND" , valueX, y , fontSize);

    y -=15;
    this._drawText("NET WEIGHT OF EACH CONTAINER : ", leftX, y , fontSize, false);
    this._drawText( Number(this.data.net_weight_of_each_container).toLocaleString('en-US') +" KGS.", valueX, y , fontSize);

    y -=15;
    this._drawText("GROSS WEIGHT OF EACH CONTAINER : ", leftX, y , fontSize, false);
    this._drawText( Number(this.data.gross_weight_of_each_container).toLocaleString('en-US') +" KGS." , valueX, y , fontSize);
    
    y -=15;
    this._drawText("WE HEREBY CERTIFY THIS PACKING LIST IS TRUE AND CORRECT ", leftX, y , fontSize, false);

    y_end = y-60;
  }

  _drawFooterPack() {
    let y = y_end;
    const fontSize = 8;

    
  
    y;
    // this._drawLine(400, y , 520, y , 1, rgb(1, 1, 0));
    if(y-30  < bottomMargin) {
      if(y < (y - (page_count * pageHeight) + bottomMargin )) {
        this.page =  this.pdfDoc.addPage([595.28, 841.89]); //this.page..addPage([pageWidth, pageHeight]);
        this._drawHeader();
        page_count++;
        start_page_new =  0
        y = -80
      }
     
    }



    this._drawLine(400, y , 520, y , 1);
    y -=15;
    this._drawText("AUTHORIZED SIGNATURE", 410, y, fontSize);
    y -=15;
    let text ="GENERAL STARCH LIMITED AS MANUFACTURER"
    this._drawText(text, 365, y, fontSize);
  }

  // ===== Certificates (COO / Non-Wood / Quality) =====
  // ทั้ง 3 type ใช้ส่วนหัวและลายเซ็นร่วมกัน ต่างกันแค่ config + body

  _drawCertificate(cfg) {
    this._drawCertTitle(cfg.title);
    let y = this._drawCertInfo(cfg);
    y = this[cfg.body](y);
    this._drawCertFooter(y, cfg.signer);
  }

  _formatCertDate(value) {
    if (value == null || value === "") return "";
    return new Date(value).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    }).toUpperCase();
  }

  _drawLabelValue(label, value, x, y, size = CERT_FONT_SIZE) {
    this._drawText(label, x, y, size, false);
    this._drawText(value, x + this.font.widthOfTextAtSize(label, size), y, size);
  }

  _drawFitText(text, y, bold = true, center = false, maxSize = CERT_FONT_SIZE) {
    const font = bold ? this.bold : this.font;
    const maxWidth = 515;
    const size = Math.min(maxSize, maxSize * maxWidth / font.widthOfTextAtSize(text, maxSize));
    const width = font.widthOfTextAtSize(text, size);
    const x = center ? (this.page.getWidth() - width) / 2 : 40;
    this._drawText(text, x, y, size, bold);
  }

  _drawCertTitle(title) {
    const date = this._formatCertDate(this.data.invoice_date || new Date());
    this._drawLabelValue("DATE : ", date, 420, 735);

    const size = 14;
    const x = (this.page.getWidth() - this.bold.widthOfTextAtSize(title, size)) / 2;
    this._drawText(title, x, 700, size, true);
  }

  _drawCertInfo(cfg) {
    const size = CERT_FONT_SIZE;
    const gap = CERT_LINE_GAP;
    const leftX = 40;
    const addrX = 80;
    const rightX = 405;

    let y = 670;

    if (cfg.madeOutTo) {
      this._drawText("MADE OUT TO : WHOM IT MAY CONCERN", leftX, y, size, true);
      y -= gap;
    }

    // SOLD TO + ฝั่งขวา INVOICE / L/C
    this._drawLabelValue("SOLD TO : ", (this.data.customer_name || "").toUpperCase(), leftX, y);
    this._drawLabelValue("INVOICE NO. : ", this.data.invoice_number, rightX, y);

    // L/C แสดงเฉพาะเมื่อมีค่า (ต่างจากฟอร์มเดิมที่เช็กจากชื่อลูกค้า)
    if (this.data.lc_no) {
      this._drawLabelValue("L/C NO : ", this.data.lc_no, rightX, y - gap);
    }

    for (const key of ["address1", "address2", "address3", "address4", "address5", "address6"]) {
      if (this.data[key]) {
        y -= gap;
        this._drawText(this.data[key], addrX, y, size);
      }
    }

    // SHIPMENT BY + ฝั่งขวา B/L / ETD / ETA เริ่มที่บรรทัดเดียวกัน
    y -= gap;
    const right = [];
    // B/L แสดงเฉพาะเมื่อมีค่า
    if (this.data.bl_no) right.push(["B/L NO. : ", this.data.bl_no]);
    if (cfg.showEtdEta) {
      right.push(["ETD : ", this._formatCertDate(this.data.etd)]);
      right.push(["ETA : ", this._formatCertDate(this.data.eta)]);
    }
    right.forEach(([label, value], i) => this._drawLabelValue(label, value, rightX, y - gap * i));

    this._drawLabelValue("SHIPMENT BY : ", (this.data.vessel || "").toUpperCase(), leftX, y);
    y -= gap;
    this._drawLabelValue("FROM : ", this.data.loading_port, leftX, y);
    y -= gap;
    this._drawLabelValue("SHIP TO : ", this.data.destination_port, leftX, y);
    y -= gap;
    this._drawLabelValue("CONTRACT NO. : ", this.data.po_number, leftX, y);

    y -= 14;
    this._drawLine(40, y, 555, y, 1);
    return y;
  }

  _drawCertDescription(y) {
    const size = CERT_FONT_SIZE;
    this._drawText("DESCRIPTION OF GOODS : ", 40, y, size, false);

    for (const item of this.data.line_items || []) {
      const descs = [
        item.invoice_description,
        item.invoice_description2,
        item.invoice_description3,
        item.invoice_description4,
        item.invoice_description5,
        item.invoice_description6,
      ].filter(d => d != null && d != "");

      for (const d of descs) {
        this._drawText(d, 170, y, size);
        y -= CERT_LINE_GAP;
      }
    }
    return y;
  }

  _drawBodyCOO(y) {
    y = this._drawCertDescription(y - 22);
    y -= 20;
    this._drawFitText("WE HEREBY DECLARE THAT THE ABOVE MENTIONED PRODUCTS WERE PRODUCED IN THAILAND BY GENERAL STARCH LIMITED", y);
    return y;
  }

  _drawBodyNonWood(y) {
    y = this._drawCertDescription(y - 22);
    y -= 20;
    this._drawFitText("IT IS DECLARED THAT THIS SHIPMENT DOES NOT CONTAIN WOOD PACKING MATERIALS.", y, true, true);
    return y;
  }

  _drawBodyQuality(y) {
    const size = CERT_FONT_SIZE;
    const gap = CERT_LINE_GAP;
    const leftX = 40;
    const kg = (n) => Number(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " KG.";

    y -= 18;
    this._drawFitText("WE HEREBY CERTIFY THAT AT THE TIME OF STUFFING INTO CONTAINERS, A SHIPMENT WAS SAID TO CONSIST OF :-", y, true, true);

    y = this._drawCertDescription(y - 22);

    this._drawLabelValue("QUANTITY/WEIGHT OF SHIPPED GOODS : ", this.data.quantity, leftX, y);

    y -= gap;
    this._drawLabelValue("PACKING CONDITION : ", this.data.packing_remark, leftX, y);
    for (const key of ["packing_remark2", "packing_remark3", "packing_remark4", "packing_remark5"]) {
      if (this.data[key]) {
        y -= gap;
        this._drawText(this.data[key], 170, y, size);
      }
    }

    y -= gap * 2;
    this._drawText("PLACE OF INSPECTION : GENERAL STARCH LIMITED'S GO DOWN", leftX, y, size, true);

    // น้ำหนักต่อถุง = น้ำหนักรวม / จำนวนถุง
    const bags = Number(this.data.total_bag_qty) || 0;
    const perBag = (total) => bags > 0 ? kg(Number(total || 0) / bags) : "";

    const rows = [
      ["NET WEIGHT OF EACH PACKING : ", perBag(this.data.total_net_weight_kg)],
      ["TARE WEIGHT OF EACH PACKING : ", perBag(this.data.total_tare_weight)],
      ["GROSS WEIGHT OF EACH PACKING : ", perBag(this.data.total_gross_weight)],
      ["TOTAL NET WEIGHT : ", kg(this.data.total_net_weight_kg)],
      ["TOTAL TARE WEIGHT : ", kg(this.data.total_tare_weight)],
      ["TOTAL GROSS WEIGHT : ", kg(this.data.total_gross_weight)],
    ];
    for (const [label, value] of rows) {
      y -= gap;
      this._drawLabelValue(label, value, leftX, y);
    }

    y -= gap;
    this._drawLabelValue("SHIPPING MARKS : ", this.data.shipping_remark, leftX, y);
    for (let i = 2; i <= 10; i++) {
      const mark = this.data["shipping_remark" + i];
      if (mark) {
        y -= gap;
        this._drawText(mark, 170, y, size);
      }
    }

    y -= gap;
    this._drawText("WE HEREBY CERTIFY THAT THE MENTIONED PRODUCTS HAVE BEEN CHECKED QUALITY AS PER OUR QUALITY", leftX, y, size);
    y -= gap;
    this._drawText("ASSURANCE PRACTICES ARE IN GOOD CONDITION.", leftX, y, size);
    return y;
  }

  // วางตราในกล่อง STAMP_BOX ตามสัดส่วนรูป; ไม่มีไฟล์ = เว้นที่ว่างไว้
  // ตั้ง env STAMP_DEBUG=1 เพื่อดูกรอบช่อง
  _drawStamp(x, y) {
    const { width, height } = STAMP_BOX;
    if (process.env.STAMP_DEBUG) {
      this.page.drawRectangle({ x, y, width, height, borderColor: rgb(1, 0, 0), borderWidth: 0.5 });
    }
    if (!this.stamp) return;
    const scale = Math.min(width / this.stamp.width, height / this.stamp.height);
    const w = this.stamp.width * scale;
    const h = this.stamp.height * scale;
    this.page.drawImage(this.stamp, { x: x + (width - w) / 2, y: y + (height - h) / 2, width: w, height: h });
  }

  _drawCertFooter(y, signer) {
    const size = CERT_FONT_SIZE;
    // ลายเซ็นชิดล่างของหน้า ถ้าเนื้อหายาวลงมาจะเลื่อนตาม (เผื่อที่ให้ตราด้านบน)
    y = Math.min(y - STAMP_BOX.height - 15, 110);
    const centerX = 470;

    this._drawStamp(centerX - STAMP_BOX.width / 2, y + 3);

    this._drawLine(400, y, 540, y, 1);
    const center = (text, yy) => {
      const w = this.bold.widthOfTextAtSize(text, size);
      this._drawText(text, centerX - w / 2, yy, size, true);
    };
    center("AUTHORIZED SIGNATURE", y - 13);
    center("GENERAL STARCH LIMITED AS " + signer, y - 27);
  }


  // ===== Letter of Declaration =====

  _formatLetterDate(value) {
    if (value == null || value === "") return "";
    return new Date(value).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  // วาดย่อหน้าแบบตัดบรรทัดอัตโนมัติ รองรับคำที่ต้องเป็นตัวหนา+ขีดเส้นใต้
  _drawRichParagraph(tokens, x, y, maxWidth, size, gap) {
    const words = [];
    for (const t of tokens) {
      for (const w of t.text.split(' ').filter(Boolean)) {
        words.push({ text: w, bold: !!t.bold, underline: !!t.underline });
      }
    }
    const space = this.font.widthOfTextAtSize(' ', size);
    let cx = x;
    for (const w of words) {
      const font = w.bold ? this.bold : this.font;
      const width = font.widthOfTextAtSize(w.text, size);
      if (cx > x && cx + width > x + maxWidth) {
        cx = x;
        y -= gap;
      }
      this._drawText(w.text, cx, y, size, w.bold);
      if (w.underline) this._drawLine(cx, y - 2, cx + width, y - 2, 0.8);
      cx += width + space;
    }
    return y;
  }

  _drawLetterOfDeclaration() {
    const size = 11;
    const gap = 18;
    const leftX = 70;
    const colonX = 210;
    const valueX = 235;

    let y = 690;
    this._drawText("To whom it may concern:", leftX, y, size);

    y -= 50;
    const title = "Letter of Declaration";
    const titleSize = 16;
    this._drawText(title, (this.page.getWidth() - this.bold.widthOfTextAtSize(title, titleSize)) / 2, y, titleSize, true);

    y -= 45;
    y = this._drawRichParagraph([
      { text: "I, General Starch limited, hereby declare that the articles described below were produced in" },
      { text: "Thailand", bold: true, underline: true },
      { text: "by means of process operations performed in that country as set forth below and were also subjected to processing operations in the other country or countries are members of the same association of countries as set forth below and incorporate materials produced in the country named above or other country or countries which are members of the same association of countries as set forth below:" },
    ], leftX, y, 455, size, gap);

    // จำนวนรวมจาก line_items เช่น "153 MT"
    const items = this.data.line_items || [];
    const totalQty = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    const uom = items.find(i => i.uom)?.uom || "MT";
    const quantity = totalQty
      ? totalQty.toLocaleString('en-US', { maximumFractionDigits: 2 }) + " " + uom
      : "";
    const products = [...new Set(items.map(i => i.product_name).filter(Boolean))].join(", ");

    // Importer เป็น fixed text ตามตัวอย่าง INA (ข้อมูลลูกค้าใน Smadi ไม่ครบ)
    const importer = [
      "INTERNATIONAL ADDITIVE CONCEPTS INC.",
      "9200 STOCKPORT PLACE, CHARLOTTE, NC 28273 U.S.A.",
      "PHONE: 704-504-3555 FAX: 704-504-0780",
    ];

    const rows = [
      ["Importer", importer],
      ["Invoice", [this.data.invoice_number]],
      ["Dated", [this._formatLetterDate(this.data.invoice_date)]],
      ["Product", [products]],
      ["Quantity", [quantity]],
      ["Description of Process", ["Tapioca Root to Starch Modification Drying & Packing"]],
      ["Country of Process", ["Thailand"]],
      ["Costs of Processing", [this.data.costs_of_processing]],
      ["Date of Shipment", [this._formatLetterDate(this.data.etd)]],
    ];

    y -= 35;
    for (const [label, values] of rows) {
      this._drawText(label, leftX, y, size);
      this._drawText(":", colonX, y, size);
      values.forEach((v, i) => {
        if (i > 0) y -= gap;
        this._drawText(v, valueX, y, size);
      });
      y -= gap;
    }

    y -= 35;
    this._drawText("Yours Sincerely,", leftX, y, size);
    y -= 28;
    this._drawText("General Starch Limited.", leftX, y, size);
    // ตราประทับ/ลายเซ็นใต้ชื่อบริษัท (ลูกค้าให้ตัดชื่อผู้ลงนามออก)
    this._drawStamp(leftX, y - 8 - STAMP_BOX.height);
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

// export default InvoiceGenerator;
export { InvoiceGenerator as GenService };