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
    Paper,
    Typography
} from "@mui/material";
import Pagination from "../../../Common/UtilityCommon/Pagination";
import SearchBar from "../../../Common/UtilityCommon/SearchBar";
import PerPageSelect from "../../../Common/UtilityCommon/PerPageSelect";
import axios from "axios";

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem('Company_Code');
const Year_Code = sessionStorage.getItem('Year_Code');

function SugarSaleReturnPurchaseUtility() {
    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = `${API_URL}/getdata-sugarpurchasereturn?Company_Code=${companyCode}&Year_Code=${Year_Code}`;
                const response = await axios.get(apiUrl);
                if (response.data && response.data.all_data_sugarReturnPurchase) {
                    setFetchedData(response.data.all_data_sugarReturnPurchase);
                    setFilteredData(response.data.all_data_sugarReturnPurchase);
                    console.log(response.data.all_data_sugarReturnPurchase);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const filtered = fetchedData.filter(post => {
            const searchTermLower = searchTerm.toLowerCase();
            return Object.keys(post.returnPurchaseData).some(key =>
                String(post.returnPurchaseData[key]).toLowerCase().includes(searchTermLower)
            );
        });
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, fetchedData]);

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
        setCurrentPage(1);
    };

    const handleSearchTermChange = (event) => {
        const term = event.target.value;
        setSearchTerm(term);
    };

    const pageCount = Math.ceil(filteredData.length / perPage);

    const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClick = () => {
        navigate("/sugar-sale-return-purchase");
    };

    const handleRowClick = (doc_no) => {
        const selectedRecord = filteredData.find(record => record.returnPurchaseData.doc_no === doc_no);
        navigate("/sugar-sale-return-purchase", { state: { selectedRecord } });
    };

    const handleSearchClick = () => {
        // Handle search button click if needed
    };

    const handleBack = () => {
        navigate("/DashBoard");
    };

    return (
        <div className="container" style={{ padding: '20px', overflow: 'hidden' }}>
            <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginBottom: '20px' }}>
                Sugar Purchase Bill
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleClick}>
                        Add
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="secondary" onClick={handleBack}>
                        Back
                    </Button>
                </Grid>
                <Grid item>
                    <PerPageSelect value={perPage} onChange={handlePerPageChange} />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ marginLeft: 2 }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        onSearchClick={handleSearchClick}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <TableContainer style={{ maxHeight: '400px' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Doc No</TableCell>
                                        <TableCell>Doc Date</TableCell>
                                        <TableCell>Account Name</TableCell>
                                        <TableCell>NETQNTL</TableCell>
                                        <TableCell>Bill Amount</TableCell>
                                        <TableCell>Prid</TableCell>
                                        <TableCell>AckNo</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post) => (
                                        <TableRow
                                            key={post.returnPurchaseData.doc_no}
                                            className="row-item"
                                            style={{ cursor: "pointer" }}
                                            onDoubleClick={() => handleRowClick(post.returnPurchaseData.doc_no)}
                                        >
                                            <TableCell>{post.returnPurchaseData.doc_no}</TableCell>
                                            <TableCell>{post.returnPurchaseData.doc_date}</TableCell>
                                            <TableCell>{post.returnPurchaseLabels[0]?.partyname || ""}</TableCell>
                                            <TableCell>{post.returnPurchaseData.NETQNTL}</TableCell>
                                            <TableCell>{post.returnPurchaseData.Bill_Amount}</TableCell>
                                            <TableCell>{post.returnPurchaseData.prid}</TableCell>
                                            <TableCell>{post.returnPurchaseData.ackno}</TableCell>
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

export default SugarSaleReturnPurchaseUtility;
