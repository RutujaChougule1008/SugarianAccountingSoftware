import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import axios from "axios";
import DataTableSearch from "../Common/HelpCommon/DataTableSearch";
import DataTablePagination from "../Common/HelpCommon/DataTablePagination";
import "../App.css";

const CompanyCode = sessionStorage.getItem("Company_Code");
const YearCode = sessionStorage.getItem("Year_Code");
const API_URL = process.env.REACT_APP_API;

var lActiveInputFeild = "";

const PurcnoHelp = ({ onAcCodeClick, name, Tenderid, Tenderno, tabIndexHelp, disabledFeild, Millcode, onTenderDetailsFetched}) => {
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
            const response = await axios.get(`${API_URL}/purchno?CompanyCode=${CompanyCode}&MillCode=${Millcode}`);
            const data = response.data;
            
            setPopupContent(data);
            setApiDataFetched(true);
           
           

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

    const fetchTenderDetails = async (tenderNo, tenderId) => {
        try {
           
            const url = `http://localhost:8080/api/sugarian/getTenderNo_Data?CompanyCode=${CompanyCode}&Tender_No=${tenderNo}&ID=${tenderId}&Year_Code=${YearCode}`;
            const response = await axios.get(url);
            const details = response.data;
            onTenderDetailsFetched(details)
            console.log("Tender Details:", details);
    
            // Optionally update state or perform additional actions with these details
        } catch (error) {
            console.error("Error fetching tender details:", error);
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
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCodeChange = async (event) => {
        const { value } = event.target;
        setenteredTenderno(value);
    
        setEnteredTenderid(value);

        if (!apiDataFetched) {
            await fetchData();
        }

        const matchingItem = popupContent.find((item) => item.Tender_No === parseInt(value, 10));

        if (matchingItem) {
            setenteredTenderno(matchingItem.Tender_No);
            setEnteredTenderid(matchingItem.ID);
            fetchTenderDetails(matchingItem.Tender_No, matchingItem.ID)

    
           

            if (onAcCodeClick) {
                onAcCodeClick(matchingItem.Tender_No, matchingItem.ID);
               
            }
            
            
            
        } else {
            setenteredTenderno("");
            setEnteredTenderid("");
           
        }
    };

    const handleRecordDoubleClick = (item) => {
        setenteredTenderno(item.Tender_No);
        setEnteredTenderid(item.ID);
        fetchTenderDetails(item.Tender_No, item.ID)
       
        if (onAcCodeClick) {
            onAcCodeClick(item.Tender_No, item.ID);
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
        item.buyername && item.buyername.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = filteredData.slice(startIndex, endIndex);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "F1") {
                if (event.target.id === name) {
                    lActiveInputFeild = name;
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
                        value={enteredTenderno !== '' ? enteredTenderno : Tenderno}
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
                    <input
                        type="text"
                        className="form-control ms-2"
                        id={name}
                        autoComplete="off"
                        value={enteredTenderid !== '' ? enteredTenderid : Tenderid}
                        onChange={handleCodeChange}
                        style={{ width: "150px", height: "35px" }}
                        tabIndex={tabIndexHelp}
                        disabled={disabledFeild}
                    />
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
                                    <th>Tenderno</th>
                                            <th>Tender_Date</th>
                                            <th>Party2</th>
                                            <th>Party</th>
                                            
                                            <th>Mill_Rate</th>
                                            <th>Grade</th>
                                            <th>Sale_Rate</th>
                                            <th>Buyer Quantal</th>
                                            <th>DESPATCH</th>
                                            <th>BALANCE</th>
                                            <th>doname</th>
                                            <th>Lifting_Date</th>
                                            <th>ID</th>
                                            <th>tenderdetailid</th>
                                            <th>tenderid</th>
                                            <th>Delivery_Type</th>
                                            <th>shiptoname</th>
                                            <th>tenderdoshortname</th>
                                            <th>season</th>
                                            <th>Party_Bill_Rate</th>
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
                                            <td>{item.Tender_No}</td>
                                            <td>{item.Tender_DateConverted}</td>
                                            <td>{item.buyername}</td>
                                            <td>{item.buyerpartyname}</td>
                                            
                                            <td>{item.Mill_Rate}</td>
                                            <td>{item.Grade}</td>
                                            <td>{item.Sale_Rate}</td>
                                            <td>{item.Buyer_Quantal}</td>
                                            <td>{item.DESPATCH}</td>
                                            <td>{item.BALANCE}</td>
                                            <td>{item.tenderdoname}</td>
                                            <td>{item.Lifting_DateConverted}</td>
                                            <td>{item.ID}</td>
                                            <td>{item.tenderdetailid}</td>
                                            <td>{item.tenderid}</td>
                                            <td>{item.Delivery_Type}</td>
                                            <td>{item.shiptoname}</td>
                                            <td>{item.tenderdoshortname}</td>
                                            <td>{item.season}</td>
                                            <td>{item.Party_Bill_Rate}</td>
                                            
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

export default PurcnoHelp;
