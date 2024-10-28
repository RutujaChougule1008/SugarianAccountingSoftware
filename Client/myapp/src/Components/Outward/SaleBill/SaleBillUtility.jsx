import React from "react";
import TableUtility from "../../../Common/UtilityCommon/TableUtility"; 

const SaleBillUtility = () => {
    const apiUrl = `${process.env.REACT_APP_API}/getdata-SaleBill`;
    const columns = [
        { label: "Doc No", key: "doc_no" },
        { label: "Doc Date", key: "doc_date" },
        { label: "BillFrom Name", key: "billFromName" },
        { label: "BillFrom GST", key: "BillFromGSTNo" },
        { label: "ShipTo Name", key: "ShipToName" },
        { label: "NETQNTL", key: "NETQNTL" },
        { label: "Bill Amount", key: "Bill_Amount" },
        { label: "Mill Name", key: "MillName" },
        { label: "EWay Bill No", key: "EWay_Bill_No" },
        { label: "ACK No", key: "ackno" },
        { label: "SaleId", key: "saleid" },
        { label: "IsDeleted", key: "IsDeleted" },
        { label: "DO No", key: "DO_No" }
    ];
    
    return (
        <TableUtility
            title="Sugar Bill For GST"
            apiUrl={apiUrl}
            columns={columns}
            rowKey="doc_no"
            addUrl="/sale-bill"
            detailUrl="/sale-bill"
            permissionUrl="/SaleBill-utility"
        />
    );
};

export default SaleBillUtility;
