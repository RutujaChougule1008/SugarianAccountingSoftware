import React, { useState } from "react";
import "./invoice.css";
import logo from "../../../Assets/companylogo.jpg";
import Sign from "../../../Assets/companylogo.jpg";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");


const YourComponent = ({doc_no}) => {
  const [invoiceData, setInvoiceData] = useState([]);

  console.log("doc_no.....",doc_no)

  const fetchData = async () => {
    try {
      // Replace with your API endpoint
      const response = await fetch(`${API_URL}/generating_saleBill_report?Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${doc_no}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setInvoiceData(data.all_data);

      

      // Generate PDF after setting the data
      generatePdf(data.all_data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  console.log("Invoice Data", invoiceData)

  const generatePdf = (data) => {
    const pdf = new jsPDF({ orientation: "portrait" });

    const logoImg = new Image();
    logoImg.src = logo;
    logoImg.onload = () => {
      pdf.addImage(logoImg, "PNG", 5, 5, 30, 30);

      // Add header text
      pdf.setFontSize(14);
      pdf.text("JK Sugars And Commodities Pvt. Ltd.", 40, 10);
      pdf.setFontSize(8);
      pdf.text("(Formerly known as JK eBuySugar Pvt. Ltd.)", 40, 15);
      pdf.text("DABHOLKAR CORNER, 4TH FLOOR, AMATYA TOWER, NEW SHAHUPURI, 329, E-WARD,", 40, 20);
      pdf.text("Kolhapur-416002 (Maharashtra)", 40, 25);
      pdf.text("Tel: (0231) 6688888 / 6688889 / 6688890", 40, 30);
      pdf.text("Email: lnfo@ebuysugars.com .GST NO 27AAECJ8332R1ZV / PAN .AAECJ8332R", 40, 35);

      pdf.setFontSize(12);
      pdf.setLineWidth(0.3);
      pdf.line(10, 38, 200, 38);
      pdf.setFontSize(14);
      pdf.text("TAX INVOICE", 90, 43);
      pdf.setFontSize(12);
      pdf.setLineWidth(0.3);
      pdf.line(10, 45, 200, 45);

      // Map data to tables
      const allData = data[0]; // Assuming you are dealing with an array of objects
      const tableData = [
        ["Reverse Charge", "No"],
        ["Invoice No:", allData.doc_no],
        ["Invoice Date:", allData.doc_dateConverted],
        ["State:", ""],
        ["Buyer,"],
        [allData.billtoname],
        [allData.billtoaddress],
        [allData.billtocitystate + ' ' + allData.billtopin],
        ["Bill To,"],
        ["City:", allData.billtocitystate, "State:", allData.billtocitystate],
        ["Gst NO:", allData.billtogstno],
        ["FSSAI No:", allData.FSSAI_BillTo],
        ["TAN No:", allData.BillToTanNo],
        ["Mill Name:", allData.millname],
        ["Dispatch From:", allData.FROM_STATION],
      ];

      const buyerData = [
        ["GST No:", allData.shiptogstno],
        ["Transport Mode:", "Road"],
        ["Date Of Supply:", allData.doc_dateConverted],
        ["Place Of Supply:", allData.TO_STATION],
        ["Consigned To,"],
        [allData.shiptoname],
        [allData.shiptoaddress],
        [allData.shiptocitystate + ' ' + allData.shiptocitypincode],
        ["Ship To,"],
        ["City:", allData.shiptocitystate, "State:", allData.shiptocitystate],
        ["Gst NO:", allData.shiptogstno],
        ["FSSAI No:", allData.FSSAI_ShipTo],
        ["TAN No:", allData.ShipToTanNo],
        ["FSSAI No:"],
        ["Lorry No:", allData.LORRYNO],
      ];

      // Add left side table
      if (tableData && tableData.length > 0) {
        pdf.autoTable({
          startY: 47,
          margin: { left: 10, right: pdf.internal.pageSize.width / 2 + 10 },
          body: tableData,
          theme: "plain",
          styles: {
            cellPadding: 1,
            fontSize: 8,
          },
          didDrawCell: function (data) {
            // Check if the current row contains "State"
            if (data.row.index === 3) { // "State" is at index 3
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

      // Add a vertical line between the tables
      pdf.setLineWidth(0.3);
      pdf.line(pdf.internal.pageSize.width / 2, 45, pdf.internal.pageSize.width / 2, 118);

      // Add right side table
      if (buyerData && buyerData.length > 0) {
        pdf.autoTable({
          startY: 47,
          margin: { left: pdf.internal.pageSize.width / 2 + 10, right: 10 },
          body: buyerData,
          theme: "plain",
          styles: {
            cellPadding: 1,
            fontSize: 8,
          },
          didDrawCell: function (data) {
            // Check if the current row contains "Place of Supply"
            if (data.row.index === 3) { // "Place of Supply" is at index 3
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

      pdf.setFontSize(12);
      pdf.setLineWidth(0.3);
      pdf.line(10, 118, 200, 118);
      pdf.setFontSize(14);
      const particulars = [
        ["Particulars", "Brand Name", "HSN/ACS", "Quntal", "Packing(kg)", "Bags", "Rate", "Value"],
        [allData.itemname, allData.Brand_Name, allData.HSN, allData.Quantal, allData.packing, allData.bags, allData.salerate, allData.item_Amount],
      ];

      pdf.autoTable({
        startY: pdf.lastAutoTable.finalY + 10,
        head: [particulars[0]],
        body: particulars.slice(1),
      });

      const eInvoiceData = [
        ["Sale Rate:", ""],
        ["Grade", "S2"],
        ["Eway Bill No:", allData.EWay_Bill_No],
        ["EwayBill ValidDate", allData.EwayBillValidDate],
        ["Bank Details", "Bank Account no -12345678"],
      ];

      // Add eInvoiceData table (left side)
      pdf.autoTable({
        startY: pdf.lastAutoTable.finalY + 10,
        margin: { left: 10, right: pdf.internal.pageSize.width / 2 + 10 },
        body: eInvoiceData,
        theme: "plain",
        styles: {
          cellPadding: 1,
          fontSize: 8,
        },
      });

      pdf.setLineWidth(0.3);

      const summaryData = [
        ["Freight:", allData.LESS_FRT_RATE, allData.freight],
        ["Taxable Amount:", "", allData.item_Amount],
        ["CGST:", allData.CGSTRate, allData.CGSTAmount],
        ["SGST:", allData.SGSTRate, allData.SGSTAmount],
        ["IGST:", allData.IGSTRate, allData.IGSTAmount],
        ["Rate Diff:/Qntl:", "", "0.00"],
        ["Other Expense:", "", "0.00"],
        ["Round Off:", "", "0.00"],
        ["Total Amount:", "", allData.TCS_Net_Payable],
        ["TCS:", "0.00", "0.00"],
        ["TCS Net Payable:", "", allData.TCS_Net_Payable],
      ];

      // Add summaryData table (right side)
      pdf.autoTable({
        startY: 155,
        margin: { left: pdf.internal.pageSize.width / 2 + 10, right: -10 },
        body: summaryData,
        theme: "plain",
        styles: {
          cellPadding: 1,
          fontSize: 8,
        },
      });

      // Set the font size
      pdf.setFontSize(12);
      // Draw the line above the text
      const lineY = pdf.lastAutoTable.finalY + 10; // Adjust this based on where you want the line to appear
      pdf.setLineWidth(0.3);
      pdf.line(10, lineY - 6, 200, lineY - 6); // Line above the text

      // Add the text "Total Amount"
      pdf.text("Total Amount: Two Thousand Five Hundred Twenty Only.", 10, lineY);

      // Draw the line below the text
      pdf.line(10, lineY + 4, 200, lineY + 4); // Line below the text

      // Add footer
      pdf.setFontSize(10);
      pdf.text("Our Tan No: JDHJ01852E", 10, pdf.lastAutoTable.finalY + 20);
      pdf.text("FSSAI No: 11516035000705", 60, pdf.lastAutoTable.finalY + 20);
      pdf.text("PAN No: AABHJ9303C", 110, pdf.lastAutoTable.finalY + 20);

      const signImg = new Image();
      signImg.src = Sign;
      signImg.onload = () => {
        pdf.addImage(signImg, "PNG", 160, pdf.lastAutoTable.finalY + 25, 30, 20);
        pdf.text("For, JK Sugars And Commodities Pvt. Ltd", 140, pdf.lastAutoTable.finalY + 50);
        pdf.text("Authorised Signatory", 160, pdf.lastAutoTable.finalY + 55);

        // Save the PDF
        pdf.save(`JKSugars.pdf`);
      }
    };
  };

  return (
    <div id="pdf-content" className="centered-container">
      <button onClick={fetchData}>Print</button>
    </div>
  );
};

export default YourComponent;
