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
import Pagination from "../../../../Common/UtilityCommon/Pagination";
import SearchBar from "../../../../Common/UtilityCommon/SearchBar";
import PerPageSelect from "../../../../Common/UtilityCommon/PerPageSelect";
import axios from "axios";

const API_URL = process.env.REACT_APP_API;

function PartyUnitMasterUtility() {
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
                const apiUrl = `${API_URL}/getAll_PartyUnitMaster?Company_Code=${companyCode}&Year_Code=${yearCode}`;
                const response = await axios.get(apiUrl);
                if (response.data && response.data.all_records_data) {
                    setFetchedData(response.data.all_records_data); // Assuming response structure includes this field
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
                post.recordData?.unit_code.toString().includes(searchTermLower) ||
                post.additionalLabels?.some(label => label.partyName.toLowerCase().includes(searchTermLower))
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
        navigate("/corporate-customer-limit");
    };

    const handleRowClick = (Code) => {
        const selectedRecord = filteredData.find(record => record.recordData.unit_code === Code);
        console.log(selectedRecord)
        navigate("/corporate-customer-limit", { state: { selectedRecord } });
    };

    const handleSearchClick = () => {
        setSearchTerm(""); // To reset search term and refilter
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
        </Grid>
        <Grid item xs={0}>
          <Button variant="contained" style={{ marginTop: "20px" }} onClick={handleBack}>
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
                                        <TableCell>Doc Code</TableCell>
                                        <TableCell>Party Code</TableCell>
                                        <TableCell>Party Name</TableCell>
                                        <TableCell>Unit Code</TableCell>
                                        <TableCell>Unit Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post, index) => (
                                        <TableRow
                                            key={index}
                                            onClick={() => handleRowClick(post.recordData.unit_code)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <TableCell>{post.recordData.unit_code}</TableCell>
                                            <TableCell>{post.recordData.Ac_Code}</TableCell>
                                            <TableCell>{post.additionalLabels[0].partyName}</TableCell>
                                            <TableCell>{post.recordData.Unit_name}</TableCell>
                                            <TableCell>{post.additionalLabels[0].UnitName}</TableCell>
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

export default PartyUnitMasterUtility;
