import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import DataTable from "../Common/HelpCommon/DataTable";
import DataTableSearch from "../Common/HelpCommon/DataTableSearch";
import DataTablePagination from "../Common/HelpCommon/DataTablePagination";


const CompanyCode = sessionStorage.getItem("Company_Code");
var lActiveInputFeild = "";

const AccountMasterHelp = ({ onAcCodeClick, name, CategoryName, CategoryCode, tabIndexHelp, disabledFeild }) => {
    const [showModal, setShowModal] = useState(false);
    const [popupContent, setPopupContent] = useState([]);
    const [enteredAcCode, setEnteredAcCode] = useState("");
    const [enteredAcName, setEnteredAcName] = useState("");
    const [enteredAccoid, setEnteredAccoid] = useState("");
    const [enteredMobNo, setEnteredMobNo] = useState("");
    const [city, setCity] = useState("")
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [apiDataFetched, setApiDataFetched] = useState(false);


    // const fetchData = useCallback(async () => {
    //     try {
    //         const response = await axios.get(`http://localhost:8080/api/sugarian/account_master_all?Company_Code=${CompanyCode}`);
    //         const data = response.data;
    //         setPopupContent(data);
    //         setApiDataFetched(true);
    //     } catch (error) {
    //         console.error("Error fetching data:", error);
    //     }
    // }, []);

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

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/sugarian/account_master_all?Company_Code=${CompanyCode}`);
            const data = response.data;
            setPopupContent(data);
            setApiDataFetched(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAcCodeChange = (event) => {
        const { value } = event.target;
        setEnteredAcCode(value);

        if(value === ""){
            setEnteredAcName("");
                setEnteredAccoid("");
                setEnteredMobNo("");
                setCity("");
        }

    };

    const handleKeyDown = async (event) => {
        if (event.key === "Tab" && event.target.id === name) {
        
            if (!apiDataFetched) {
                await fetchData();
            }

            const matchingItem = popupContent.find(item => item.Ac_Code.toString() === enteredAcCode);
            if (matchingItem) {
                setEnteredAcName(matchingItem.Ac_Name_E);
                setEnteredAccoid(matchingItem.accoid);
                setEnteredMobNo(matchingItem.Mobile_No);
                setCity(matchingItem.cityname);

                if (onAcCodeClick) {
                    onAcCodeClick(matchingItem.Ac_Code, matchingItem.accoid, matchingItem.Ac_Name_E, matchingItem.Mobile_No, matchingItem.Gst_No, matchingItem.TDSApplicable, matchingItem.GSTStateCode);
                }
            } else {
                // setEnteredAcName("");
                // setEnteredAccoid("");
                // setEnteredMobNo("");
                // setCity("");
            }
        }
    };

    const handleRecordDoubleClick = (item) => {
        setEnteredAcCode(item.Ac_Code);
        setEnteredAcName(item.Ac_Name_E);
        setEnteredAccoid(item.accoid);
        setEnteredMobNo(item.Mobile_No);
        setCity(item.cityname);
        
        if (onAcCodeClick) {
            onAcCodeClick(item.Ac_Code, item.accoid, item.Ac_Name_E, item.Mobile_No, item.Gst_No,item.TDSApplicable,item.GSTStateCode);
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
        item.Ac_Name_E && item.Ac_Name_E.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="d-flex flex-row ">
            <div className="d-flex ">
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control ms-2"
                        id={name}
                        autoComplete="off"
                        value={enteredAcCode !== '' ? enteredAcCode : CategoryCode}
                        onChange={handleAcCodeChange}
                        onKeyDown={handleKeyDown}
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
                    <label id="acNameLabel" className="form-labels ms-2">
                    {`${enteredAcName || ''} ${city || ''} ${CategoryName || ''}`}

                    </label>
                </div>
            </div>
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                dialogClassName="modal-dialog modal-fullscreen"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Popup</Modal.Title>
                </Modal.Header>
                <DataTableSearch data={popupContent} onSearch={handleSearch} />
                <Modal.Body>
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginBottom: "1rem",
                                backgroundColor: "#fff",
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa" }}>
                                    <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>Account Code</th>
                                    <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>Account Name</th>
                                    <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>City Name</th>
                                    <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>Mobile No</th>
                                    <th style={{ border: "1px solid #dee2e6", padding: "8px" }}>GST No</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemsToDisplay.map((item, index) => (
                                    <tr
                                        key={item.accoid}
                                        style={{
                                            cursor: "pointer",
                                            backgroundColor: selectedRowIndex === index ? "#d6e9f9" : "white",
                                        }}
                                        onClick={() => setSelectedRowIndex(index)}
                                        onDoubleClick={() => handleRecordDoubleClick(item)}
                                    >
                                        <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.Ac_Code}</td>
                                        <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.Ac_Name_E}</td>
                                        <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.cityname}</td>
                                        <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.Mobile_No}</td>
                                        <td style={{ border: "1px solid #dee2e6", padding: "8px" }}>{item.Gst_No}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

export default AccountMasterHelp;
