import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const PendingReports = () => {
    const navigate = useNavigate();
    const [selectType, setSelectType] = useState('Mill Wise');
    const [receiptPaymentType, setReceiptPaymentType] = useState('Against Sauda');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const AccountYear = sessionStorage.getItem('Accounting_Year');

    useEffect(() => {
        if (AccountYear) {
            const dates = AccountYear.split(' - ');
            if (dates.length === 2) {
                setFromDate(dates[0]);
                setToDate(dates[1]);
            }
        }
    }, [AccountYear]);

    const handleGenerateReport = () => {
        if (!fromDate || !toDate) {
            setError('Please select both From Date and To Date.');
            return;
        }
        setError('');
        setLoading(true);
        navigate('/tenderwise-reports', { state: { fromDate, toDate, selectType, receiptPaymentType } });
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            <h1 className="mb-2">Pending Reports</h1>

            <div className="mb-2">
                <label htmlFor="selectType" className="form-label">Select Type</label>
                <select
                    id="selectType"
                    className="form-select"
                    value={selectType}
                    onChange={(e) => setSelectType(e.target.value)}
                >
                    <option value="Mill Wise">Mill Wise</option>
                    <option value="Bank Wise">Bank Wise</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="receiptPaymentType" className="form-label">Receipt Payment Type</label>
                <select
                    id="receiptPaymentType"
                    className="form-select"
                    value={receiptPaymentType}
                    onChange={(e) => setReceiptPaymentType(e.target.value)}
                >
                    <option value="Against Sauda">Against Sauda</option>
                    <option value="Do Sauda">Do Sauda</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="fromDate" className="form-label">From Date</label>
                <input
                    type="date"
                    id="fromDate"
                    className="form-control"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="toDate" className="form-label">To Date</label>
                <input
                    type="date"
                    id="toDate"
                    className="form-control"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>

            <div className="mb-3">
                <button
                    className="btn btn-primary"
                    onClick={handleGenerateReport}
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Tender Wise Sauda'}
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
        </div>
    );
};

export default PendingReports;
