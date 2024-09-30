import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import axios from "axios";
import DataTableSearch from "../Common/HelpCommon/DataTableSearch";
import DataTablePagination from "../Common/HelpCommon/DataTablePagination";
import "../App.css";

const CompanyCode = sessionStorage.getItem("Company_Code");
const YearCode = sessionStorage.getItem("Year_Code");
var lActiveInputFeild = "";

const CarporateHelp = ({ onAcCodeClick, name, Carporate_no, tabIndexHelp, disabledFeild, onTenderDetailsFetched}) => {
    const [showModal, setShowModal] = useState(false);
    const [popupContent, setPopupContent] = useState([]);
    const [enteredTenderno, setenteredTenderno] = useState("");
    const [enteredTenderid, setEnteredTenderid] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [apiDataFetched, setApiDataFetched] = useState(false);

    const fetchData = useCallback(async () => {
        
        try {
            const response = await axios.get(`http://localhost:8080/api/sugarian/carporateno?CompanyCode=${CompanyCode}`);
            const data = response.data;
            
            setPopupContent(data);
            setApiDataFetched(true);
           
           

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

    const fetchCarporateDetails = async (carporateNo) => {
        try {
            
            const url = `http://localhost:8080/api/sugarian/getCarporateData?CompanyCode=${CompanyCode}&Carporate_no=${carporateNo}&Year_Code=${YearCode}`;
            const response = await axios.get(url);
            const details = response.data;
            onTenderDetailsFetched(details)
            console.log("Carporate Details:", details);
    
            // Optionally update state or perform additional actions with these details
        } catch (error) {
            console.error("Error fetching Carporate details:", error);
        }
    };
    

    const fetchAndOpenPopup = async () => {
        
        if (!apiDataFetched) {
            await fetchData();

        }
        setShowModal(true);
    };

    const handleButtonClicked = () => {
        fetchAndOpenPopup();
        if(onAcCodeClick)
            {
                onAcCodeClick(enteredTenderno)
            }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCodeChange = async (event) => {
        const { value } = event.target;
        setenteredTenderno(value);
    


        if (!apiDataFetched) {
            await fetchData();
        }

        const matchingItem = popupContent.find((item) => item.Doc_No === parseInt(value, 10));

        if (matchingItem) {
            setenteredTenderno(matchingItem.Doc_No);
            
            fetchCarporateDetails(matchingItem.Doc_No)
            if (onAcCodeClick) {
                onAcCodeClick(matchingItem.Doc_No);
               
            }
        } else {
            setenteredTenderno("");
        }
    };

    const handleRecordDoubleClick = (item) => {
        
        setenteredTenderno(item.Doc_No);
        console.log(item.Doc_No)
        
         fetchCarporateDetails(item.Doc_No)
       
        if (onAcCodeClick) {
            onAcCodeClick(item.Doc_No);
        }
        setShowModal(false);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearch = (searchValue) => {
        setSearchTerm(searchValue);
    };

    const filteredData = popupContent.filter((item) =>
        item.carporatepartyaccountname && item.carporatepartyaccountname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = filteredData.slice(startIndex, endIndex);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "F1") {
                if (event.target.id === name) {
                    lActiveInputFeild = name;
                    setSearchTerm(event.target.value);
                    fetchAndOpenPopup();
                    event.preventDefault();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [name, fetchAndOpenPopup]);

    useEffect(() => {
        const handleKeyNavigation = (event) => {
            if (showModal) {
                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
                } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setSelectedRowIndex((prev) => Math.min(prev + 1, itemsToDisplay.length - 1));
                } else if (event.key === "Enter") {
                    event.preventDefault();
                    if (selectedRowIndex >= 0) {
                        handleRecordDoubleClick(itemsToDisplay[selectedRowIndex]);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyNavigation);

        return () => {
            window.removeEventListener("keydown", handleKeyNavigation);
        };
    }, [showModal, selectedRowIndex, itemsToDisplay, handleRecordDoubleClick]);

    return (
        <div className="d-flex flex-row">
            <div className="d-flex">
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control ms-2"
                        id={name}
                        autoComplete="off"
                        value={enteredTenderno !== '' ? enteredTenderno : Carporate_no}
                        onChange={handleCodeChange}
                        style={{ width: "150px", height: "35px" }}
                        tabIndex={tabIndexHelp}
                        disabled={disabledFeild}
                    />
                    <Button
                        variant="primary"
                        onClick={handleButtonClicked}
                        className="ms-1"
                        style={{ width: "30px", height: "35px" }}
                        disabled={disabledFeild}
                    >
                        ...
                    </Button>
                    {/* <input
                        type="text"
                        className="form-control ms-2"
                        id={name}
                        autoComplete="off"
                        value={enteredTenderid !== '' ? enteredTenderid : Tenderid}
                        onChange={handleCodeChange}
                        style={{ width: "150px", height: "35px" }}
                        tabIndex={tabIndexHelp}
                        disabled={disabledFeild}
                    /> */}
                </div>
            </div>
            
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                dialogClassName="modal-dialog"
                
            >
                <Modal.Header closeButton>
                    <Modal.Title>Popup</Modal.Title>
                </Modal.Header>
                <DataTableSearch data={popupContent} onSearch={handleSearch} />
                <Modal.Body>
                    {Array.isArray(popupContent) ? (
                        <div className="table-responsive">
                            <table className="custom-table" style={{maxWidth:"550px",height:"500px"}}>
                                <thead>
                                    <tr>
                                    
                                            <th>Doc_No</th>
                                            <th>Doc_Date</th>
                                            <th>partyName</th>
                                            
                                            <th>UnitName</th>
                                            <th>sell_rate</th>
                                            <th>Po_Details</th>
                                            <th>Buyer quantal</th>
                                            <th>dispatched</th>
                                            <th>balance</th>
                                            <th>selling_type</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsToDisplay.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                selectedRowIndex === index ? "selected-row" : ""
                                            }
                                            onDoubleClick={() => handleRecordDoubleClick(item)}
                                        >
                                            <td>{item.Doc_No}</td>
                                            <td>{item.doc_dateConverted}</td>
                                            <td>{item.carporatepartyaccountname}</td>
                                            <td>{item.carporatepartyunitname}</td>
                                            
                                            <td>{item.sell_rate}</td>
                                            <td>{item.pono}</td>
                                            <td>{item.quantal}</td>
                                            <td>{item.dispatched}</td>
                                            <td>{item.balance}</td>
                                            <td>{item.selling_type}</td>
                                            
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        "Loading..."
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <DataTablePagination
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CarporateHelp;
