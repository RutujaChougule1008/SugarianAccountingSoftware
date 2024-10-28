import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Paper, Typography } from "@mui/material";
import Pagination from "../../Common/UtilityCommon/Pagination";
import SearchBar from "../../Common/UtilityCommon/SearchBar";
import PerPageSelect from "../../Common/UtilityCommon/PerPageSelect";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageNotFound from "./../PageNotFound/PageNotFound"


function TableUtility({ title, apiUrl, columns, rowKey, addUrl, detailUrl, permissionUrl }) {

    const companyCode = sessionStorage.getItem('Company_Code');
    const Year_Code = sessionStorage.getItem('Year_Code');
    const uid = sessionStorage.getItem('uid');

    const [fetchedData, setFetchedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [perPage, setPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [canView, setCanView] = useState(null); 
    const [permissionsData, setPermissionData] = useState({})

    const navigate = useNavigate();

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const userCheckUrl = `${process.env.REACT_APP_API}/get_user_permissions?Company_Code=${companyCode}&Year_Code=${Year_Code}&Program_Name=${permissionUrl}&uid=${uid}`;
                const response = await axios.get(userCheckUrl);
                setPermissionData(response.data?.UserDetails)
                if (response.data?.UserDetails?.canView === 'Y') {
                    setCanView(true);
                    fetchData(); 
                } else {
                    setCanView(false); 
                }
            } catch (error) {
                console.error("Error fetching user permissions:", error);
                setCanView(false); 
            }
        };
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}?Company_Code=${companyCode}&Year_Code=${Year_Code}`);
                if (response.data) {
                    const dataKey = Object.keys(response.data)[0];
                    setFetchedData(response.data[dataKey]);
                    setFilteredData(response.data[dataKey]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        checkPermissions();
    }, [apiUrl]);

    useEffect(() => {
        const filtered = fetchedData.filter(post => {
            const searchTermLower = searchTerm.toLowerCase();
            return Object.keys(post).some(key =>
                String(post[key]).toLowerCase().includes(searchTermLower)
            );
        });
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, fetchedData]);

    if (canView === false) {
        return <PageNotFound/>;
    }

    const handlePerPageChange = (event) => {
        setPerPage(event.target.value);
        setCurrentPage(1);
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleRowClick = (rowId) => {
        const selectedRecord = filteredData.find(record => record[rowKey] === rowId);
        navigate(detailUrl, { state: { selectedRecord, permissionsData } });
    };

    const handleAddClick = () => {
        navigate(addUrl, { state: {permissionsData} });
    };

    const handleBackClick = () => {
        navigate("/DashBoard");
    };

    const pageCount = Math.ceil(filteredData.length / perPage);
    const paginatedPosts = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div>
            <Typography variant="h6" style={{ textAlign: 'center' }}>{title}</Typography>
            <Grid container spacing={2}>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={handleAddClick} disabled={permissionsData.canSave === "N"}>Add</Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="secondary" onClick={handleBackClick}>Back</Button>
                </Grid>
                <Grid item>
                    <PerPageSelect value={perPage} onChange={handlePerPageChange} />
                </Grid>
                <Grid xs={6} sm={10}>
                    <SearchBar value={searchTerm} onChange={handleSearchTermChange} />
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={20}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column, index) => (
                                            <TableCell key={index}>{column.label}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedPosts.map((post) => (
                                        <TableRow
                                            key={post[rowKey]}
                                            style={{ cursor: "pointer" }}
                                            onDoubleClick={() => handleRowClick(post[rowKey])}
                                        >
                                            {columns.map((column, index) => (
                                                <TableCell key={index}>{post[column.key]}</TableCell>
                                            ))}
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

export default TableUtility;
