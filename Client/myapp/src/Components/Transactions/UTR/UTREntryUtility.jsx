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

function UTREntryUtility() {
    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = `${API_URL}/getdata-utr?Company_Code=${companyCode}&Year_Code=${Year_Code}`;
                const response = await axios.get(apiUrl);

                // Ensure the response contains 'all_data_utr'
                if (response.data && Array.isArray(response.data.all_data_utr)) {
                    setFetchedData(response.data.all_data_utr);
                    setFilteredData(response.data.all_data_utr);
                } else {
                    console.error("Unexpected response format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (Array.isArray(fetchedData)) {
            const filtered = fetchedData.filter(post => {
                const searchTermLower = searchTerm.toLowerCase();
                return Object.keys(post.utr_head_data).some(key =>
                    String(post.utr_head_data[key]).toLowerCase().includes(searchTermLower)
                );
            });
            setFilteredData(filtered);
            setCurrentPage(1);
        }
    }, [searchTerm, fetchedData]);

    const handlePerPageChange = (event) => {
        setPerPage(Number(event.target.value)); // Ensure perPage is a number
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
        navigate("/utr-entry");
    };

    const handleRowClick = (utrId) => {
        debugger
        const selectedRecord = fetchedData.find(record => record.utr_head_data.utrid === utrId);
        console.log('selectedRecord',selectedRecord)
        navigate("/utr-entry", { state: { selectedRecord } });
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
                                        <TableCell>Doc Date</TableCell>
                                        <TableCell>Bank Ac Name</TableCell>
                                        <TableCell>Mill Name</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>UTR No</TableCell>
                                        <TableCell>Narration Header</TableCell>
                                        <TableCell>Narration Footer</TableCell>
                                        <TableCell>UTR ID</TableCell>
                                        <TableCell>Is Deleted</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post) => (
                                        <TableRow
                                            key={post.utr_head_data.utrid}
                                            className="row-item"
                                            style={{ cursor: "pointer" }}
                                            onDoubleClick={() => handleRowClick(post.utr_head_data.utrid)}
                                        >
                                            <TableCell>{post.utr_head_data.doc_no}</TableCell>
                                            <TableCell>{post.utr_head_data.doc_date}</TableCell>
                                            <TableCell>{post.labels.bankAcName}</TableCell>
                                            <TableCell>{post.labels.millName}</TableCell>
                                            <TableCell>{post.utr_head_data.amount}</TableCell>
                                            <TableCell>{post.utr_head_data.utr_no}</TableCell>
                                            <TableCell>{post.utr_head_data.narration_header}</TableCell>
                                            <TableCell>{post.utr_head_data.narration_footer}</TableCell>
                                            <TableCell>{post.utr_head_data.utrid}</TableCell>
                                            <TableCell>{post.utr_head_data.IsDeleted}</TableCell>
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

export default UTREntryUtility;
