import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Grid,
    Paper
} from "@mui/material";
import Pagination from "../../../Common/UtilityCommon/Pagination";
import SearchBar from "../../../Common/UtilityCommon/SearchBar";
import PerPageSelect from "../../../Common/UtilityCommon/PerPageSelect";
import axios from "axios";

const API_URL = process.env.REACT_APP_API;

const Year_Code = sessionStorage.getItem("Year_Code");
const companyCode = sessionStorage.getItem("Company_Code");

function RecieptPaymentUtility() {
    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [tranType, setTranType] = useState("CP");  // State to store the selected value
    const navigate = useNavigate();

    // Fetch data from API based on selected value
    useEffect(() => {
        const fetchData = async () => {
            debugger
            try {
                const apiUrl = `${API_URL}/getdata-receiptpayment?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${tranType}`; // Adding the tran_type as query param
                const response = await axios.get(apiUrl);

                if (response.data && Array.isArray(response.data.all_data_receiptpayment)) {
                    setFetchedData(response.data.all_data_receiptpayment);
                    setFilteredData(response.data.all_data_receiptpayment);
                } else {
                    console.error("Unexpected response format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [tranType]); // Refetch data when tranType changes

    // Search and Pagination logics remain unchanged
    useEffect(() => {
        if (Array.isArray(fetchedData)) {
            const filtered = fetchedData.filter(post => {
                const searchTermLower = searchTerm.toLowerCase();
                return Object.keys(post.receipt_payment_head_data).some(key =>
                    String(post.receipt_payment_head_data[key]).toLowerCase().includes(searchTermLower)
                );
            });
            setFilteredData(filtered);
            setCurrentPage(1);
        }
    }, [searchTerm, fetchedData]);

    // Handle dropdown change
    const handleTranTypeChange = (event) => {
        setTranType(event.target.value);  // Update tranType with selected value
    };

    const handlePerPageChange = (event) => {
        setPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const pageCount = Math.ceil(filteredData.length / perPage);

    const paginatedPosts = Array.isArray(filteredData) ? filteredData.slice((currentPage - 1) * perPage, currentPage * perPage) : [];

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClick = () => {
        navigate("/receipt-payment");
    };

    const handleRowClick = (tranid) => {

        debugger
        const selectedRecord = fetchedData.find(record => record.receipt_payment_head_data.tranid === tranid);
        navigate("/receipt-payment", { state: { selectedRecord } });
    };

    const handleSearchClick = () => {
        // Optionally handle search button click
    };

    const handleBack = () => {
        navigate("/DashBoard");
    };

    return (
        <div className="App container">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Button variant="contained" style={{ marginTop: "20px" }} onClick={handleClick}>
                        Add
                    </Button>
                    <Button variant="contained" style={{ marginTop: "20px", marginLeft: "10px" }} onClick={handleBack}>
                        Back
                    </Button>
                    
               
                <select
                    
                    id="tran_type"
                    name="tran_type"
                    variant="contained"
                   
                    value={tranType} // Bind the value to the state
                    onChange={handleTranTypeChange} // Update state on change
                    className="form-select mb-3" // Adds Bootstrap's margin-bottom utility class
                    style={{ marginTop: "-20px", marginLeft: "10px", width: "300px" }}
                    
                >
                
                    <option value="CP">Cash Payment</option>
                    <option value="CR">Cash Receipt</option>
                    <option value="BP">Bank Payment</option>
                    <option value="BR">Bank Receipt</option>
                </select>
                
                    
                </Grid>

                <Grid item xs={12} sm={12}>
                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        onSearchClick={handleSearchClick}
                    />
                </Grid>
                <Grid item xs={12} sm={8} style={{ marginTop: "-80px", marginLeft: "-150px" }}>
                    <PerPageSelect value={perPage} onChange={handlePerPageChange} />
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Doc No</TableCell>
                                        <TableCell>Tran Type</TableCell>
                                        <TableCell>Doc Date</TableCell>
                                        <TableCell>Bank Name</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Credit Code</TableCell>
                                        <TableCell>Credit Name</TableCell>
                                        <TableCell>Narration</TableCell>
                                        <TableCell>Receipt ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post) => (
                                        <TableRow
                                            key={post?.receipt_payment_head_data?.tranid}
                                            className="row-item"
                                            style={{ cursor: "pointer" }}
                                            onDoubleClick={() => handleRowClick(post?.receipt_payment_head_data?.tranid)}
                                        >
                                                 <TableCell>{post?.receipt_payment_head_data.doc_no || 'N/A'}</TableCell>
                                                <TableCell>{post?.receipt_payment_head_data.tran_type || 'N/A'}</TableCell>
                                                <TableCell>{post?.receipt_payment_head_data.doc_date || 'N/A'}</TableCell>
                                                <TableCell>{post?.labels[0]?.cashbankname || 'N/A'}</TableCell>
                                                <TableCell>{post?.receipt_payment_details[0]?.amount || 'N/A'}</TableCell>
                                                <TableCell>{post?.receipt_payment_details[0].credit_ac || 'N/A'}</TableCell>
                                                <TableCell>{post?.labels[0]?.creditacname || 'N/A'}</TableCell>
                                                <TableCell>{post?.receipt_payment_details[0]?.narration || 'N/A'}</TableCell>
                                                <TableCell>{post?.receipt_payment_head_data.tranid || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Pagination
                        pageCount={pageCount}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </Grid>
            </Grid>
        </div>
    );
}

export default RecieptPaymentUtility;
