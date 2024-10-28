import React from "react";
import TableUtility from "../../../Common/UtilityCommon/TableUtility";

const TenderPurchaseUtility = () => {
    const apiUrl = `${process.env.REACT_APP_API}/all_tender_data`;
    const columns = [
        { label: "Tender No", key: "Tender_No" },
        { label: "Tender Date", key: "Tender_Date" },
        { label: "Mill Short Name", key: "millshortname" },
        { label: "Quantal", key: "Quantal" },
        { label: "Grade", key: "Grade" },
        { label: "Mill Rate", key: "Mill_Rate" },
        { label: "Payment To Name", key: "paymenttoname" },
        { label: "Tender Do Name", key: "tenderdoname" },
        { label: "Lifting Date", key: "Lifting_Date" },
        { label: "Tender ID", key: "tenderid" }
    ];

    return (
        <TableUtility
            title="Tender Purchase Utility"
            apiUrl={apiUrl}
            columns={columns}
            rowKey="Tender_No"
            addUrl="/tender_head"
            detailUrl="/tender_head"
        />
    );
};

export default TenderPurchaseUtility;
