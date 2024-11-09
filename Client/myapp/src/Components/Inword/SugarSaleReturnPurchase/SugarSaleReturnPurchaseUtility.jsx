import React from "react";
import TableUtility from "../../../Common/UtilityCommon/TableUtility";

const SugarSaleReturnPurchaseUtility = () => {
    const apiUrl = `${process.env.REACT_APP_API}/getdata-sugarpurchasereturn`;

    const columns = [
        { label: "Doc No", key: "doc_no" },
        { label: "Doc Date", key: "doc_date" },
        { label: "Account Name", key: "partyname" },
        { label: "NETQNTL", key: "NETQNTL" },
        { label: "Bill Amount", key: "Bill_Amount" },
        { label: "Prid", key: "prid" },
        { label: "AckNo", key: "ackno" }
    ];

    return (
        <TableUtility
            title="Sugar Sale Return Purchase"
            apiUrl={apiUrl}
            columns={columns}
            rowKey="doc_no"
            addUrl="/sugar-sale-return-purchase"
            detailUrl="/sugar-sale-return-purchase"
            permissionUrl="/sugar-sale-return-purchase-utility"
        />
    );
};

export default SugarSaleReturnPurchaseUtility;
