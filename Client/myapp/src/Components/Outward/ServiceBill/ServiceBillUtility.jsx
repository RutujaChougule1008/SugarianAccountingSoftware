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

function ServiceBillUtility() {
    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = `${API_URL}/getdata-servicebill?Company_Code=${companyCode}&Year_Code=${Year_Code}`;
                const response = await axios.get(apiUrl);
                if (response.data && response.data.all_data_servicebill) {
                    setFetchedData(response.data.all_data_servicebill);
                    setFilteredData(response.data.all_data_servicebill);
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
            return Object.keys(post).some(key => {
                const value = post[key];
                if (key === 'service_bill_head_data') {
                    return Object.values(value).some(val =>
                        String(val).toLowerCase().includes(searchTermLower)
                    );
                }
                if (key === 'service_labels') {
                    return value.some(label =>
                        String(label.partyname).toLowerCase().includes(searchTermLower)
                    );
                }
                if (key === 'service_bill_details') {
                    return value.some(detail =>
                        String(detail.Item_Code).toLowerCase().includes(searchTermLower)
                    );
                }
                return String(value).toLowerCase().includes(searchTermLower);
            });
        });

        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, fetchedData]);

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
        setCurrentPage(1);
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const pageCount = Math.ceil(filteredData.length / perPage);

    const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClick = () => {
        navigate("/service-bill");
    };

    const handleRowClick = (doc_no) => {
        const selectedRecord = filteredData.find(record => record.service_bill_head_data.Doc_No === doc_no);
        navigate("/service-bill", { state: { selectedRecord } });
    };

    const handleBack = () => {
        navigate("/DashBoard");
    };

    return (
        <div>
            <Typography variant="h5">Service Bill</Typography>
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
                <Grid item xs={12} sm={10} sx={{ marginLeft: 2 }}>
                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={20}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Doc No</TableCell>
                                        <TableCell>Doc Date</TableCell>
                                        <TableCell>Customer Code</TableCell>
                                        <TableCell>Account Name</TableCell>
                                        <TableCell>GST Rate Code</TableCell>
                                        <TableCell>Item Code</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Final Amount</TableCell>
                                        <TableCell>TDS%</TableCell>
                                        <TableCell>ACK No</TableCell>
                                        <TableCell>RbId</TableCell>
                                        <TableCell>IsDeleted</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post) => (
                                        <TableRow
                                            key={post.service_bill_head_data.Doc_No}
                                            className="row-item"
                                            style={{ cursor: "pointer" }}
                                            onDoubleClick={() => handleRowClick(post.service_bill_head_data.Doc_No)}
                                        >
                                            <TableCell>{post.service_bill_head_data.Doc_No}</TableCell>
                                            <TableCell>{post.service_bill_head_data.Date}</TableCell>
                                            <TableCell>{post.service_bill_head_data.Customer_Code}</TableCell>
                                            <TableCell>{post.service_labels[0].partyname}</TableCell>
                                            <TableCell>{post.service_bill_head_data.GstRateCode}</TableCell>
                                            <TableCell>{post.service_bill_details[0].Item_Code}</TableCell>
                                            <TableCell>{post.service_bill_head_data.Total}</TableCell>
                                            <TableCell>{post.service_bill_head_data.Final_Amount}</TableCell>
                                            <TableCell>{post.service_bill_head_data.TDS_Per}</TableCell>
                                            <TableCell>{post.service_bill_head_data.ackno}</TableCell>
                                            <TableCell>{post.service_bill_head_data.rbid}</TableCell>
                                            <TableCell>{post.service_bill_head_data.IsDeleted}</TableCell>
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
export default ServiceBillUtility;
