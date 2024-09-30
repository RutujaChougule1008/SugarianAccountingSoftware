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
  TextField,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import Pagination from "../../../Common/UtilityCommon/Pagination";
import SearchBar from "../../../Common/UtilityCommon/SearchBar";
import PerPageSelect from "../../../Common/UtilityCommon/PerPageSelect";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");
const socketUrl = process.env.REACT_APP_API_URL

function TenderPurchaseUtility() {
  const [fetchedData, setFetchedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [perPage, setPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apiUrl = `${API_URL}/all_tender_data?Company_Code=${companyCode}&Year_Code=${Year_Code}`;
      const response = await axios.get(apiUrl);
      setFetchedData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  useEffect(() => {
    const socket = io(socketUrl);

    socket.on('connect', () => {
        console.log('Connected to socket server');
    });

    socket.on('addTender', (newGroup) => {
        setFetchedData((prevData) => [...prevData, newGroup]);
        fetchData();
    });


    // socket.on('updateGroup', (updatedGroup) => {
    //     setFetchedData((prevData) => 
    //         prevData.map((group) =>
    //             group.group_Code === updatedGroup.group_Code ? updatedGroup : group
    //         )
    //     );
    //     console.log("updatedGroup",updatedGroup)
    // });

    // socket.on('deleteGroup', (deletedGroup) => {
    //     setFetchedData((prevData) =>
    //         prevData.filter((group) => group.group_Code !== deletedGroup.group_Code)
    //     );
    //     console.log('Group deleted:', deletedGroup);
    // });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });

    return () => {
        socket.disconnect();
    };
}, []);



  useEffect(() => {
    const filtered = fetchedData.filter(post => {
      const searchTermLower = searchTerm.toLowerCase();
      const tenderNoLower =  String(post.Tender_No)
      const tenderDateLower = (post.Tender_Date || '').toLowerCase();
      const millShortNameLower = (post.millshortname || '').toLowerCase();
      const quantalLower = (post.Quantal || '').toLowerCase();
      const gradeLower = (post.Grade || '').toLowerCase();
      const millRateLower = (post.Mill_Rate || '').toLowerCase();
      const paymentToNameLower = (post.paymenttoname || '').toLowerCase();
      const tenderDoNameLower = (post.tenderdoname || '').toLowerCase();
      const liftingDateLower = (post.Lifting_Date || '').toLowerCase();
      const tenderIdString = String(post.tenderid);
  
      return (
        (filterValue === "" || post.group_Type === filterValue) &&
        (tenderNoLower.includes(searchTermLower) ||
        tenderDateLower.includes(searchTermLower) ||
        millShortNameLower.includes(searchTermLower) ||
        quantalLower.includes(searchTermLower) ||
        gradeLower.includes(searchTermLower) ||
        millRateLower.includes(searchTermLower) ||
        paymentToNameLower.includes(searchTermLower) ||
        tenderDoNameLower.includes(searchTermLower) ||
        liftingDateLower.includes(searchTermLower) ||
        tenderIdString.includes(searchTermLower))
      );
    });
  
    setFilteredData(filtered);
    setCurrentPage(1); 
  }, [searchTerm, filterValue, fetchedData]);


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
    navigate("/tender_head");
  };

  const handleRowClick = (tenderNo) => {
    const selectedRecord = filteredData.find(record => record.Tender_No === tenderNo);
    console.log("selectedRecord",selectedRecord)
    navigate("/tender_head", { state: { selectedRecord } });
  };

  const handleSearchClick = () => {
    setFilterValue("");
  };

  const handleBack =()=>{}

  return (
    <div className="App container">
      <Grid container spacing={3}>
        <Grid item xs={0}>
          <Button variant="contained" style={{marginTop:"20px"}} onClick={handleClick}>
            Add
          </Button>
        </Grid>
        <Grid item xs={0}>
          <Button variant="contained" style={{marginTop:"20px"}} onClick={handleBack}>
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
        <Grid item xs={12} sm={8} style={{marginTop:"-80px",marginLeft:"-150px"}}>
          <PerPageSelect value={perPage} onChange={handlePerPageChange} />
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tender No</TableCell>
                    <TableCell>Tender Date</TableCell>
                    <TableCell>Mill Short Name</TableCell>
                    <TableCell>Quantal</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Mill Rate</TableCell>
                    <TableCell>Payment To Name</TableCell>
                    <TableCell>Tender do Name</TableCell>
                    <TableCell>Lifting Date</TableCell>
                    <TableCell>tenderid</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPosts.map((post) => (
                    <TableRow
                      key={post.Tender_No}
                      className="row-item"
                      onClick={() => handleRowClick(post.Tender_No)}
                    >
                      <TableCell>{post.Tender_No}</TableCell>
                      <TableCell>{post.Tender_Date}</TableCell>
                      <TableCell>{post.millshortname}</TableCell>
                      <TableCell>{post.Quantal}</TableCell>
                      <TableCell>{post.Grade}</TableCell>
                      <TableCell>{post.Mill_Rate}</TableCell>
                      <TableCell>{post.paymenttoname}</TableCell>
                      <TableCell>{post.tenderdoname}</TableCell>
                      <TableCell>{post.Lifting_Date}</TableCell>
                      <TableCell>{post.tenderid}</TableCell>
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

export default TenderPurchaseUtility;
