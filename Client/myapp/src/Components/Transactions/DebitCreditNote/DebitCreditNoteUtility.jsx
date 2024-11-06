// DebitCreditNoteUtility.js
import React, { useState } from "react";
import TableUtility from "../../../Common/UtilityCommon/TableUtility";

const DebitCreditNoteUtility = () => {
    const apiUrl = `${process.env.REACT_APP_API}/getdata-debitcreditNote`;
    const columns = [
        { label: "Doc No", key: "doc_no" },
        { label: "Tran Type", key: "tran_type" },
        { label: "Doc Date", key: "doc_date" },
        { label: "Account Name", key: "AccountName" },
        { label: "Bill Amount", key: "bill_amount" },
        { label: "DcID", key: "dcid" },
        { label: "Ship To Name", key: "ShipTo" },
        { label: "Old Bill ID", key: "bill_id" },
        { label: "Ack No", key: "ackno" },
        { label: "Is Deleted", key: "IsDeleted" },
    ];

    const dropdownOptions = [
        { label: "Debit Note To Customer", value: "DN" },
        { label: "Credit Note To Customer", value: "CN" },
        { label: "Debit Note To Supplier", value: "DS" },
        { label: "Credit Note To Supplier", value: "CS" },
    ];

    const [filterValue, setFilterValue] = useState("DN");

    const handleDropdownChange = (event) => {
        setFilterValue(event.target.value);
    };

    return (
        <TableUtility
            title="Debit/Credit Note Utility"
            apiUrl={apiUrl}
            columns={columns}
            rowKey="doc_no"
            addUrl="/debitcreditnote"
            detailUrl="/debitcreditnote"
            permissionUrl="/debitcreditnote-utility"
            dropdownOptions={dropdownOptions}
            dropdownValue={filterValue}
            onDropdownChange={(e) => setFilterValue(e.target.value)}
        />
    );
};

export default DebitCreditNoteUtility;
