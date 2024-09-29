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

function LetterUtility() {
    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const companyCode = sessionStorage.getItem('Company_Code');
            const yearCode = sessionStorage.getItem('Year_Code');
            try {
                const apiUrl = `${API_URL}/getAll_Letter?Company_Code=${companyCode}&Year_Code=${yearCode}`;
                const response = await axios.get(apiUrl);
                if (response.data && response.data.all_letters_data) {
                    const letters = response.data.all_letters_data.map(item => item.letterData);
                    setFetchedData(letters);
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
            return (
                post.AC_CODE.toString().includes(searchTermLower) ||
                post.AC_NAME.toLowerCase().includes(searchTermLower) ||
                post.ADDRESS.toLowerCase().includes(searchTermLower)
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
        setSearchTerm(event.target.value);
    };

    const pageCount = Math.ceil(filteredData.length / perPage);

    const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClick = () => {
        navigate("/letter-data");
    };

    const handleRowClick = (Code) => {
        const selectedRecord = filteredData.find(record => record.DOC_NO === Code);
        navigate("/letter-data", { state: { selectedRecord } });
    };

    const handleBack = () => {
        navigate("/DashBoard");
    };

    return (
        <div className="App container">
            <Grid container spacing={3}>
                <Grid item xs={0}>
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
                                        <TableCell>Account Code</TableCell>
                                        <TableCell>Account Name</TableCell>
                                        <TableCell>City</TableCell>
                                        <TableCell>Subject</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post, index) => (
                                        <TableRow
                                            key={index}
                                            onClick={() => handleRowClick(post.DOC_NO)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <TableCell>{post.DOC_NO}</TableCell>
                                            <TableCell>{post.DOC_DATE}</TableCell>
                                            <TableCell>{post.AC_CODE}</TableCell>
                                            <TableCell>{post.AC_NAME}</TableCell>
                                            <TableCell>{post.CITY}</TableCell>
                                            <TableCell>{post.SUBJECT}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Pagination pageCount={pageCount} currentPage={currentPage} onPageChange={handlePageChange} />
                </Grid>
            </Grid>
        </div>
    );
}

export default LetterUtility;
