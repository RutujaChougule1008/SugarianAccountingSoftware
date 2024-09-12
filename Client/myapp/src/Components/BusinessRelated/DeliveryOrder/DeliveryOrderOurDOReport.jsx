import React, { useState } from "react";
import "./OurDoReport.css";
import logo from "../../../Assets/companylogo.jpg";
import Sign from "../../../Assets/companylogo.jpg";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DeliveryOrderOurDoReport = ({ doc_no }) => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [isBillToShipToSame, setIsBillToShipToSame] = useState(true);
 
  
  const numberToWords = (num) => {
    const belowTwenty = [
      "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const scales = [
      "", "Thousand", "Lakh", "Crore"
    ];

    const words = (num) => {
      if (num === 0) return "";
      if (num < 20) return belowTwenty[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + belowTwenty[num % 10] : "");
      if (num < 1000) return belowTwenty[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " and " + words(num % 100) : "");

      if (num < 100000) {
        return words(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + words(num % 1000) : "");
      } else if (num < 10000000) {
        return words(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + words(num % 100000) : "");
      } else {
        return words(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + words(num % 10000000) : "");
      }
    };

    const convertFraction = (fraction) => {
      if (fraction === 0) return "Zero Paise";
      return words(fraction) + " Paise";
    };

    const integerPart = Math.floor(num);
    const fractionPart = Math.round((num - integerPart) * 100);

    let result = words(integerPart) + " Rupees";

    if (fractionPart > 0) {
      result += " and " + convertFraction(fractionPart);
    } else {
      result += " Only";
    }

    return result;
  };

  const fetchData = async () => {
    const userConfirmed = window.confirm("Is Bill To Ship To Same?");
    setIsBillToShipToSame(userConfirmed);

      try {
        const response = await fetch(
          `http://localhost:8080/api/sugarian/generating_ourDO_report?Company_Code=1&Year_Code=1&doc_no=${doc_no}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setInvoiceData(data.all_data);

        // Generate PDF once data is fetched
        generatePdf(data.all_data, userConfirmed);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
  };
  console.log("Invoice Data", invoiceData)
  console.log("isBillToShipToSame", isBillToShipToSame)

  const generatePdf = (data, isBillToShipToSame) => {
    setIsBillToShipToSame(false);

    console.log("isBillToShipToSame", isBillToShipToSame)

    const pdf = new jsPDF({ orientation: "portrait" });

    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => {
      pdf.addImage(logoImg, "PNG", 5, 5, 30, 30);

      pdf.setLineHeightFactor(1);

      pdf.setFontSize(14);
      pdf.text("JK Sugars And Commodities Pvt. Ltd.", 40, 10);
      pdf.setFontSize(8);
      pdf.text("(Formerly known as JK eBuySugar Pvt. Ltd.)", 40, 15);
      pdf.text("DABHOLKAR CORNER, 4TH FLOOR, AMATYA TOWER, NEW SHAHUPURI, 329, E-WARD,", 40, 20);
      pdf.text("Kolhapur-416002 (Maharashtra)", 40, 25);
      pdf.text("Tel: (0231) 6688888 / 6688889 / 6688890", 40, 30);
      pdf.text("Email: lnfo@ebuysugars.com .GST NO 27AAECJ8332R1ZV / PAN .AAECJ8332R", 40, 35);

      const allData = data[0];

      const totalAmountWords = numberToWords(allData.amount);

      const doNumber = allData.doc_no; 
      const date = allData.doc_date;

      pdf.setFontSize(12);
      pdf.setLineWidth(0.3);
      pdf.setFontSize(10);
      pdf.text(`DO NO : ${doNumber}`, 10, 43);
      pdf.line(10, 38, 200, 38);
      pdf.setFontSize(10);
      pdf.text("Delivery Order", 90, 43);
      pdf.setFontSize(10);
      pdf.text(`Date : ${date}`, 160, 43);
      pdf.line(10, 38, 200, 38);
      pdf.setFontSize(6);
      pdf.setLineWidth(0.3);
      pdf.line(10, 45, 200, 45);

      

      const tableData = [
        ["Mill Name:", allData.millname],
        ["Mill Address",allData.milladress],
        ["Buyer,"],
        [allData.getpassname],
        [allData.getpassaddress],
        // [allData.billtocitystate + ' ' + allData.billtopin],
        ["Bill To,"],
        ["City:", allData.getpasscityname],
        ["State:", allData.getpassstatename],
        ["State Code:", allData.GetpassGstStateCode],
        ["Gst NO:", allData.getpassgstno],
        ["PAN NO:", allData.getpasspanno],
        ["FSSAI No:", allData.getpassfssai],
        ["TAN No:", allData.getpasstan_no],
      ];

      const buyerData = [
        ["Tender Date:", ""],
        ["Truck NO:", "MH09AB1234"],
        ["Shipped To,"],
        [isBillToShipToSame ? allData.getpassname : allData.shiptoname],
        [isBillToShipToSame ? allData.getpassaddress : allData.shiptoaddress],
        ["Ship To,"],
        ["City:", isBillToShipToSame ? allData.getpasscityname : allData.shiptocityname],
        ["State:", isBillToShipToSame ? allData.getpassstatename : allData.shiptostatename],
        ["State Code:", isBillToShipToSame ? allData.GetpassGstStateCode : allData.VoucherbyGstStateCode],
        ["Gst NO:", isBillToShipToSame ? allData.getpassgstno : allData.shiptogstno],
        ["PAN NO:", isBillToShipToSame ? allData.getpasspanno : allData.shiptopanno],
        ["FSSAI No:", isBillToShipToSame ? allData.getpassfssai : allData.shiptofssai],
        ["TAN No:", isBillToShipToSame ? allData.getpasstan_no : allData.shiptotan_no],
      ];

      if (tableData && tableData.length > 0) {
        pdf.autoTable({
          startY: 47,
          margin: { left: 10, right: pdf.internal.pageSize.width / 2 + 20 },
          body: tableData,
          theme: "plain",
          styles: {
            cellPadding: 1,
            fontSize: 6,
            overflow: 'linebreak',
            minCellHeight: 6
          },
          didDrawCell: function (data) {
            if (data.row.index === 0 || data.row.index === 1) { // Assuming index 0 is millname, 1 is milladdress
                data.cell.styles.minCellHeight = 12; // Increase the cell height for these rows
                data.cell.styles.cellPadding = 1; // Add extra padding if needed
              }
        
            if (data.row.index === 1) {
              pdf.setLineWidth(0.3);
              pdf.setDrawColor(0);
              const startX = 10;
              const endX = pdf.internal.pageSize.width / 2;
              const y = data.cell.y + data.cell.height;
              pdf.line(startX, y, endX, y);
            }
          }
        });
      }

      pdf.setLineWidth(0.3);
      pdf.line(pdf.internal.pageSize.width / 2, 45, pdf.internal.pageSize.width / 2, 120);

      if (buyerData && buyerData.length > 0) {
        pdf.autoTable({
          startY: 47,
          margin: { left: pdf.internal.pageSize.width / 2 + 20, right: 10 },
          body: buyerData,
          theme: "plain",
          styles: {
            cellPadding: 1,
            fontSize: 6,
            overflow: 'linebreak',
            minCellHeight: 6
          },
          didDrawCell: function (data) {
            if (data.row.index === 0 || data.row.index === 1) { // Assuming index 0 is millname, 1 is milladdress
                data.cell.styles.minCellHeight = 12; // Increase the cell height for these rows
                data.cell.styles.cellPadding = 1; // Add extra padding if needed
              }
            if (data.row.index === 1) { 
              pdf.setLineWidth(0.3);
              pdf.setDrawColor(0);
              const startX = pdf.internal.pageSize.width / 2;
              const endX = pdf.internal.pageSize.width - 10;
              const y = data.cell.y + data.cell.height;
              pdf.line(startX, y, endX, y);
            }
          }
        });
      }

      pdf.setFontSize(10);
      pdf.setLineWidth(0.3);

      const eInvoiceData = [
        ["Grade",allData.grade],
        ["Season", allData.season],
        ["Purchase Rate", allData.mill_rate],
        ["Add GST:", allData.excise_rate],
        ["Mill Rate:", allData.mill_rate + allData.excise_rate],
        ["QUINTAL:", allData.quantal],
        ["Bags:", allData.bags],
        ["HSN:", allData.HSN],
      ];

      pdf.autoTable({
        startY: pdf.lastAutoTable.finalY + 5 ,
        margin: { left: 10, right: pdf.internal.pageSize.width / 2 + 10 },
        body: eInvoiceData,
        theme: "plain",
        styles: {
          cellPadding: 1,
          fontSize: 8,
          minCellHeight: 8
        },
      });

      pdf.setLineWidth(0.3);

      const summaryData = [
        ["Basic Amount:", allData.mill_rate * allData.quantal],
        ["Total Amount:", allData.amount],
        ["Less Amount:", ""],
        ["Final Amount:", allData.amount],
        ["TCS Rate:", allData.TCS_Rate],
        ["TCS Amount:", allData.amount * allData.TCS_Rate / 100],
        ["TDS Rate:", "", allData.PurchaseTDSRate],
        ["TDS Amount:", allData.mill_rate * allData.quantal * allData.PurchaseTDSRate / 100],
        ["Net Amount:", "", allData.Mill_AmtWO_TCS],
       
      ];

      pdf.autoTable({
        startY: 125,
        margin: { left: pdf.internal.pageSize.width / 2 + 10, right: -10 },
        body: summaryData,
        theme: "plain",
        styles: {
          cellPadding: 1,
          fontSize: 8,
          minCellHeight: 8
        },
      });


      pdf.setFontSize(10);
      const lineY = pdf.lastAutoTable.finalY + 10; 
      pdf.setLineWidth(0.3);
      pdf.line(10, lineY - 6, 200, lineY - 6); 
      pdf.text(`In Words : ${totalAmountWords} Rupees Only`, 10, lineY);
      pdf.line(10, lineY + 4, 200, lineY + 4); 


      pdf.setFontSize(10);
      pdf.text(`${allData.millname}`, 10, pdf.lastAutoTable.finalY + 20);

      pdf.setLineWidth(0.3);
      pdf.line(10, 195, 200, 195);
      pdf.text("Sell Note No: 0", 120, pdf.lastAutoTable.finalY + 30);
      pdf.text(`Tender Name:${allData.doname}`, 10, pdf.lastAutoTable.finalY + 35);

      pdf.setFontSize(12);
      pdf.setLineWidth(0.3);
      pdf.line(10, 118, 200, 118);
      pdf.setFontSize(14);
      const particulars = [
        ["UTR Narration", "Date", "Use Amount", "Utr Amount"],
        [allData.Narration, allData.UTRDate, allData.UTRAmount, allData.totUTRAmt],
      ];

      pdf.autoTable({
        startY: pdf.lastAutoTable.finalY + 40,
        head: [particulars[0]],
        body: particulars.slice(1),
      });

      pdf.setFontSize(8);
      pdf.setTextColor(255, 0, 0);
      pdf.text("Note :Kindly provide sale invoices on E-Mail (JkIndia9101@gmail.com) once the Truck moves out of the Factory.", 10, pdf.lastAutoTable.finalY + 10);
      pdf.text("Also, please send hard copies of the original for buyer Invoice to the address of our.", 18, pdf.lastAutoTable.finalY + 15);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const signImg = new Image();
      signImg.src = Sign;
      signImg.onload = () => {
        pdf.addImage(signImg, "PNG", 160, pdf.lastAutoTable.finalY + 20, 30, 20);
        pdf.text("For, JK Sugars And Commodities Pvt. Ltd", 140, pdf.lastAutoTable.finalY + 45);
        pdf.text("Authorised Signatory", 160, pdf.lastAutoTable.finalY + 55);

        pdf.save(`JKSugars.pdf`);
      }
    };
  };

  return (
    <div id="pdf-content" className="centered-container">
      <button onClick={fetchData}>Our DO</button>
    </div>
  );
};

export default DeliveryOrderOurDoReport;
