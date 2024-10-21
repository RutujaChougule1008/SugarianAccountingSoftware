import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp"; // Assuming you have this component imported

var ac_Name = ""; // This should come from your AccountMasterHelp when selected

const Ledger = () => {
  const [acCode, setAcCode] = useState(""); 
  const [fromDate, setFromDate] = useState(""); 
  const [toDate, setToDate] = useState(""); 
  const [accoid, setAccoid] = useState("");

  const navigate = useNavigate();

  // Handle account code selection from AccountMasterHelp
  const handleAc_Code = (code, accoid) => {
    setAcCode(code);
    setAccoid(accoid) // Update ac_Name if needed, based on your logic
  };

  // Handle form submission
  const handleGetReportClick = (e) => {
    e.preventDefault(); // Prevent form submission behavior

    // Navigate to the report page with the query parameters
    navigate(`/ledger-report`, {
      state: { acCode, fromDate, toDate },
    });
  };

  return (
    <div>
      <h2>gLedger Report</h2>

      <form onSubmit={handleGetReportClick}>
        <div>
          <label htmlFor="AC_CODE">
            Account Code:
          </label>
          <AccountMasterHelp
            name="AC_CODE"
            onAcCodeClick={handleAc_Code}
            CategoryName={ac_Name}
            CategoryCode={acCode}
            tabIndexHelp={10}
          />
        </div>
        <div>
          <label>From Date: </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>To Date: </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Get Report</button>
      </form>
    </div>
  );
};

export default Ledger;
