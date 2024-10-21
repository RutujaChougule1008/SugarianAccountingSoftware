import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const GLedgerReportPage = () => {
  const [ledgerData, setLedgerData] = useState([]); // Store fetched report data
  const [loading, setLoading] = useState(false); // Show loading state
  const [error, setError] = useState(null); // Handle errors

  const location = useLocation(); // Get state from previous page
  const { acCode, fromDate, toDate } = location.state || {}; // Destructure passed data

  useEffect(() => {
    const fetchGLedgerReport = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const response = await axios.get(
          `${process.env.REACT_APP_API}/get_gLedgerReport_AcWise`, // Your API URL
          {
            params: {
              ac_code: acCode,
              from_date: fromDate,
              to_date: toDate,
            },
          }
        );
        setLedgerData(response.data.all_data || []); // Store fetched data
      } catch (err) {
        setError("Error fetching report data."); // Handle errors
        console.error(err);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchGLedgerReport(); // Fetch the data when the component mounts
  }, [acCode, fromDate, toDate]);

  return (
    <div>
      <h2>gLedger Report</h2>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {/* Display fetched data in a table */}
      {ledgerData.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Transaction Type</th>
              <th>Document No</th>
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
              <tr key={index}>
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
        </table>
      )}

      {ledgerData.length === 0 && !loading && <p>No data found for the given criteria.</p>}
    </div>
  );
};

export default GLedgerReportPage;
