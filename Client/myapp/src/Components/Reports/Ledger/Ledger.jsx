import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp"; 
import './Ledger.css'; 

var ac_Name = ""; 

const Ledger = () => {
  const [acCode, setAcCode] = useState(""); 
  const [fromDate, setFromDate] = useState(""); 
  const [toDate, setToDate] = useState(""); 
  const [accoid, setAccoid] = useState("");

  const navigate = useNavigate();

  const handleAc_Code = (code, accoid) => {
    setAcCode(code);
    setAccoid(accoid);
  };

  const handleGetReportClick = (e) => {
    e.preventDefault(); 
    navigate(`/ledger-report`, {
      state: { acCode, fromDate, toDate },
    });
  };

  return (
    <div className="ledger-form-container">
      <h2>gLedger Report</h2>
      <form onSubmit={handleGetReportClick}>
        <div className="form-row">
          <label htmlFor="AC_CODE">Account Code:</label>
          <div className="account-help-container">
            <AccountMasterHelp
              name="AC_CODE"
              onAcCodeClick={handleAc_Code}
              CategoryName={ac_Name}
              CategoryCode={acCode}
              tabIndexHelp={10}
            />
          </div>
        </div>
        <div className="form-row">
          <label>From Date:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label>To Date:</label>
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
