import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../Reports/Ledger/GledgerReport.css'

const GledgerReport = () => {
  const companyCode = sessionStorage.getItem("Company_Code");
  const Year_Code = sessionStorage.getItem("Year_Code");
  const API_URL = process.env.REACT_APP_API;
  const [ledgerData, setLedgerData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const location = useLocation(); 
  const { acCode, fromDate, toDate } = location.state || {};
  const navigate = useNavigate();

  const calculateTotals = (data) => {
    const totals = data.reduce(
      (acc, item) => {
        acc.debit += parseFloat(item.debit || 0);
        acc.credit += parseFloat(item.credit || 0);
        return acc;
      },
      { debit: 0, credit: 0 }
    );
    return totals;
  };

  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  useEffect(() => {
    const fetchGLedgerReport = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const response = await axios.get(
          `${process.env.REACT_APP_API}/get_gLedgerReport_AcWise`, 
          {
            params: {
              from_date: fromDate,
              to_date: toDate,
              Company_Code:companyCode,
              Year_Code:Year_Code,
            },
          }
        );
        const data = response.data.all_data || [];
        setLedgerData(data);

        // Calculate totals after data is fetched
        const totals = calculateTotals(data);
        setTotals(totals);

      } catch (err) {
        setError("Error fetching report data."); 
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGLedgerReport(); 
  }, [acCode, fromDate, toDate]);


  const handleRowClick = (doc_no, tran_type) => {
    navigate(`/commission-bill`, {
      state: {
        selectedVoucherNo: doc_no,
        selectedVoucherType: tran_type
      }
    });
  };
  return (
    <div className="ledger-report-container">
      <h2>gLedger Report</h2>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Display fetched data in a table */}
      {ledgerData.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Transaction Type</th>
              <th>Doc No</th>
              <th>Date</th>
              <th>Account Code</th>
              <th>Account Name</th>
              <th>Narration</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
          </thead>
          <tbody>
            {ledgerData.map((item, index) => (
              <tr key={index} onClick={() => handleRowClick(item.DOC_NO, item.TRAN_TYPE)}>
                <td>{item.TRAN_TYPE}</td>
                <td>{item.DOC_NO}</td>
                <td>{item.DOC_DATE}</td>
                <td>{item.AC_CODE}</td>
                <td>{item.Ac_Name_E}</td>
                <td>{item.NARRATION}</td>
                <td>{item.debit}</td>
                <td>{item.credit}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
              <tr>
                <td colSpan="6"><strong>Total</strong></td>
                <td><strong>{totals.debit.toFixed(2)}</strong></td>
                <td><strong>{totals.credit.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
        </table>
      )}

      {ledgerData.length === 0 && !loading && <p className="no-data-message">No data found for the given criteria.</p>}
    </div>
  );
};

export default GledgerReport;
