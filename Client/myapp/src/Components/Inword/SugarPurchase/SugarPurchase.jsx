import React, { useState, useRef, useEffect } from "react";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import GSTRateMasterHelp from "../../../Helper/GSTRateMasterHelp";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from '../../../Common/CommonButtons/ActionButtonGroup';
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import SystemHelpMaster from "../../../Helper/SystemmasterHelp";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./SugarPurchase.css"
import { HashLoader } from 'react-spinners';
import { z } from "zod";
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import BrandMasterHelp from "../../../Helper/BrandMasterHelp";

//Validation Part Using Zod Library
const stringToNumber = z
    .string()
    .refine(value => !isNaN(Number(value)), { message: "This field must be a number" })
    .transform(value => Number(value));

//Validation Schemas
const SugarPurchaseSchema = z.object({
    //     texable_amount: stringToNumber
    //         .refine(value => value !== undefined && value >= 0),
    // cgst_rate: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // cgst_amount: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // sgst_rate: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // sgst_amount: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // igst_rate: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // igst_amount: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // bill_amount: stringToNumber
    //     .refine(value => value !== undefined && value >= 0),
    // TCS_Rate: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // TCS_Amt: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // TCS_Net_Payable: stringToNumber
    //     .refine(value => value !== undefined && value >= 0),
    // TDS_Rate: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // TDS_Amt: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
    // misc_amount: stringToNumber
    // .refine(value => value !== undefined && value >= 0),
});

//Global Variables
var purchaseidNew = ""
var FromName = ""
var FromCode = ""
var Unitname = ""
var UnitCode = ""
var MillName = ""
var MillCode = ""
var BrokerName = ""
var BrokerCode = ""
var GstRateName = ""
var GstRateCode = ""
var ItemName = ""
var ItemCodeNew = ""
var BrandName = ""
var BrandCode = ""
var subTotal = 0.00
var globalQuantalTotal = 0
var CGSTRate = 0.00
var SGSTRate = 0.00
var IGSTRate = 0.00
var BillAmountNew = 0.00
var newAcCode = 0

var selectedfilter = ""
const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");

const SugarPurchase = () => {
    //Detail Help State Management
    const [users, setUsers] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState({});
    const [deleteMode, setDeleteMode] = useState(false);
    const [brandCode, setBrandCode] = useState("");
    const [brandCodeAccoid, setBrandCodeAccoid] = useState("");
    const [itemSelect, setItemSelect] = useState("");
    const [itemSelectAccoid, setItemSelectAccoid] = useState("");
    const [formDataDetail, setFormDataDetail] = useState({
        Quantal: "",
        packing: "50",
        bags: "",
        rate: null,
        item_Amount: null,
        narration: "",
        detail_id: 1,

    });

    //Head Section State Managements
    const [addOneButtonEnabled, setAddOneButtonEnabled] = useState(false);
    const [saveButtonEnabled, setSaveButtonEnabled] = useState(true);
    const [cancelButtonEnabled, setCancelButtonEnabled] = useState(true);
    const [editButtonEnabled, setEditButtonEnabled] = useState(false);
    const [deleteButtonEnabled, setDeleteButtonEnabled] = useState(false);
    const [backButtonEnabled, setBackButtonEnabled] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [highlightedButton, setHighlightedButton] = useState(null);
    const [cancelButtonClicked, setCancelButtonClicked] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [lastTenderDetails, setLastTenderDetails] = useState([]);
    const [lastTenderData, setLastTenderData] = useState({});
    const [formErrors, setFormErrors] = useState({});

    //In utility page record doubleClicked that recod show for edit functionality
    const location = useLocation();
    const selectedRecord = location.state?.selectedRecord;
    const permissions = location.state?.permissionsData;
    const navigate = useNavigate();
    const setFocusTaskdate = useRef(null);
    const [isHandleChange, setIsHandleChange] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [itemNameLabel, setItemNameLabel] = useState('')
    const [brandName, setBrandName] = useState('')

    const inputRef = useRef(null);

    const initialFormData = {
        doc_no: "",
        Tran_Type: "PS",
        PURCNO: "",
        doc_date: new Date().toISOString().split('T')[0],
        Ac_Code: "",
        Unit_Code: "",
        mill_code: "",
        FROM_STATION: "",
        TO_STATION: "",
        LORRYNO: "",
        BROKER: "",
        wearhouse: "",
        subTotal: 0.00,
        LESS_FRT_RATE: 0.00,
        freight: 0.00,
        cash_advance: 0.00,
        bank_commission: 0.00,
        OTHER_AMT: 0.00,
        Bill_Amount: 0.00,
        Due_Days: "",
        NETQNTL: 0.00,
        Company_Code: companyCode,
        Year_Code: Year_Code,
        Branch_Code: "",
        Created_By: "",
        Modified_By: "",
        Bill_No: "",
        GstRateCode: "",
        CGSTRate: 0.00,
        CGSTAmount: 0.00,
        SGSTRate: 0.00,
        SGSTAmount: 0.00,
        IGSTRate: 0.00,
        IGSTAmount: 0.00,
        EWay_Bill_No: "",
        purchaseid: null,
        ac: "",
        uc: "",
        mc: "",
        bk: "",
        grade: "",
        mill_inv_date: new Date().toISOString().split('T')[0],
        Purcid: "",
        SelfBal: "",
        TCS_Rate: 0.00,
        TCS_Amt: 0.00,
        TCS_Net_Payable: 0.00,
        TDS_Rate: 0.00,
        TDS_Amt: 0.00,
        Retail_Stock: "N",
        purchaseidnew: 1,
    };

    //Head data functionality code.
    const [formData, setFormData] = useState(initialFormData);
    const [DoNo, setDoNo] = useState("");
    const [from, setFrom] = useState("");
    const [unit, setUnit] = useState("");
    const [mill, setMill] = useState("");
    const [broker, setBroker] = useState("");
    const [gstCode, setGstCode] = useState("");
    const [gstRate, setGstRate] = useState("");

    // Function to format the truck number
    const formatTruckNumber = (value) => {
        const cleanedValue = value.replace(/\s+/g, '').toUpperCase();
        return cleanedValue.length <= 10 ? cleanedValue : cleanedValue.substring(0, 10);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        validateField(name, value);
        const updatedValue = name === "LORRYNO" ? formatTruckNumber(value) : value;

        setFormData((prevState) => ({
            ...prevState,
            [name]: updatedValue
        }));
    };

    useEffect(() => {
        if (isHandleChange) {
            handleCancel();
            setIsHandleChange(false);
        }
        setFocusTaskdate.current.focus();
    }, []);

    //Validation Part
    const validateField = (name, value) => {
        try {
            SugarPurchaseSchema.pick({ [name]: true }).parse({ [name]: value });
            setFormErrors((prevErrors) => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors[name];
                return updatedErrors;
            });
        } catch (err) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: err.errors[0].message,
            }));
        }
    };

    const validateForm = () => {
        try {
            SugarPurchaseSchema.parse(formData);
            setFormErrors({});
            return true;
        } catch (err) {
            const errors = {};
            err.errors.forEach(error => {
                errors[error.path[0]] = error.message;
            });
            setFormErrors(errors);
            return false;
        }
    };

    const calculateTotals = () => {
        const subTotal = users.reduce((total, user) => total + (parseFloat(user.item_Amount) || 0), 0);
        const quantalTotal = users.reduce((total, user) => total + (parseFloat(user.Quantal) || 0), 0);
    
       
        const cgstRate = parseFloat(formData.CGSTRate) || 0;
        const sgstRate = parseFloat(formData.SGSTRate) || 0;
        const igstRate = parseFloat(formData.IGSTRate) || 0;
        const tcsRate = parseFloat(formData.TCS_Rate) || 0;
        const tdsRate = parseFloat(formData.TDS_Rate) || 0;
    
        
        const cgstAmount = (subTotal * cgstRate / 100).toFixed(2);
        const sgstAmount = (subTotal * sgstRate / 100).toFixed(2);
        const igstAmount = (subTotal * igstRate / 100).toFixed(2);
    
       
        const tcsAmount = ((parseFloat(formData.Bill_Amount) || 0) * tcsRate / 100).toFixed(2);
        const tdsAmount = (subTotal * tdsRate / 100).toFixed(2);
    
        
        const otherAmt = parseFloat(formData.OTHER_AMT) || 0;
        const cashAdvance = parseFloat(formData.cash_advance) || 0;
        const bankCommission = parseFloat(formData.bank_commission) || 0;
    
      
        const billAmount = subTotal + parseFloat(cgstAmount) + parseFloat(sgstAmount) + parseFloat(igstAmount) +
            otherAmt + cashAdvance + bankCommission;
    
       
        const netPayable = (billAmount + parseFloat(tcsAmount)).toFixed(2);
    
        
        setFormData(prev => ({
            ...prev,
            subTotal: subTotal.toFixed(2),
            CGSTAmount: cgstAmount,
            SGSTAmount: sgstAmount,
            IGSTAmount: igstAmount,
            Bill_Amount: billAmount.toFixed(2),
            TCS_Amt: tcsAmount,
            TDS_Amt: tdsAmount,
            TCS_Net_Payable: netPayable,
            NETQNTL: quantalTotal.toFixed(2)
        }));
    };
    
    //Fetch last record
    const fetchLastRecord = () => {
        fetch(`${API_URL}/get-next-doc-no-purchaseBill?Company_Code=${companyCode}&Year_Code=${Year_Code}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch last record");
                }
                return response.json();
            })
            .then((data) => {
                setFormData((prevState) => ({
                    ...prevState,
                    doc_no: data.next_doc_no
                }));
            })
            .catch((error) => {
                console.error("Error fetching last record:", error);
            });
    };

    console.log("Permissions", permissions)
    //handle Add button Functionality
    const handleAddOne = async () => {
        
        setAddOneButtonEnabled(false);
        setSaveButtonEnabled(true);
        setCancelButtonEnabled(true);
        setEditButtonEnabled(false);
        setDeleteButtonEnabled(false);
        setIsEditMode(false);
        setIsEditing(true);
        fetchLastRecord()
        setFormData(initialFormData)
       
        FromName = ""
        FromCode = ""
        Unitname = ""
        UnitCode = ""
        MillName = ""
        MillCode = ""
        BrokerName = ""
        BrokerCode = ""
        GstRateName = ""
        GstRateCode = ""
        ItemName = ""
        ItemCodeNew = ""
        BrandName = ""
        BrandCode = ""
        subTotal = ""
        globalQuantalTotal = ""
        setLastTenderDetails([])
    };

    //handle Edit button Functionality
    const handleEdit = () => {
        setIsEditMode(true);
        setAddOneButtonEnabled(false);
        setSaveButtonEnabled(true);
        setCancelButtonEnabled(true);
        setEditButtonEnabled(false);
        setDeleteButtonEnabled(false);
        setBackButtonEnabled(true);
        setIsEditing(true);
    };

    //handle New record insert in datatbase and update the record Functionality
    const handleSaveOrUpdate = async () => {
        if (!validateForm()) return;
        setIsEditing(true);
        setIsLoading(true);

        const headData = {
            ...formData,
            subTotal: subTotal,
            NETQNTL: globalQuantalTotal,
            GstRateCode: gstCode
        };

        // Remove dcid from headData if in edit mode
        if (isEditMode) {
            delete headData.purchaseid;
        }
        const detailData = users.map((user) => ({
            rowaction: user.rowaction,
            purchasedetailid: user.purchasedetailid,
            Tran_Type: "PS",
            item_code: user.item_code,
            ic: user.ic,
            Brand_Code: user.Brand_Code,
            Quantal: user.Quantal,
            packing: user.packing,
            bags: user.bags,
            rate: user.rate,
            item_Amount: user.item_Amount,
            narration: user.narration,
            Company_Code: companyCode,
            Year_Code: Year_Code,
            Branch_Code: 1,
            detail_id: 1
        }));
        const requestData = {
            headData,
            detailData,
        };
        try {
            if (isEditMode) {
                const updateApiUrl = `${API_URL}/update-SugarPurchase?purchaseid=${purchaseidNew}`;
                const response = await axios.put(updateApiUrl, requestData);
                toast.success('Data updated successfully!');
                setTimeout(() => {
                    window.location.reload();
                }, 1000)

            } else {
                const response = await axios.post(
                    `${API_URL}/insert_SugarPurchase`,
                    requestData
                );
                toast.success('Data saved successfully!');
                setIsEditMode(false);
                setAddOneButtonEnabled(true);
                setEditButtonEnabled(true);
                setDeleteButtonEnabled(true);
                setBackButtonEnabled(true);
                setSaveButtonEnabled(false);
                setCancelButtonEnabled(false);
                setIsEditing(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1000)
            }
        } catch (error) {
            console.error("Error during API call:", error);
            toast.error("Error occurred while saving data");
        } finally {
            setIsEditing(false);
            setIsLoading(false);
        }
    };

    //handle Delete the record from database functionality
    const handleDelete = async () => {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete this record ${formData.doc_no}?`
        );
        if (isConfirmed) {
            setIsEditMode(false);
            setAddOneButtonEnabled(true);
            setEditButtonEnabled(true);
            setDeleteButtonEnabled(true);
            setBackButtonEnabled(true);
            setSaveButtonEnabled(false);
            setCancelButtonEnabled(false);
            setIsLoading(true);
            try {
                const deleteApiUrl = `${API_URL}/delete_data_SugarPurchase?purchaseid=${purchaseidNew}&Company_Code=${companyCode}&doc_no=${formData.doc_no}&Year_Code=${Year_Code}&tran_type=${formData.Tran_Type}`;
                const response = await axios.delete(deleteApiUrl);

                if (response.status === 200) {
                    // console.log("Record deleted successfully");
                    if (response.data) {
                        toast.success('Data delete successfully!');
                        handleCancel();
                    }
                    else if (response.status === 404) {
                    }
                } else {
                    console.error(
                        "Failed to delete tender:",
                        response.status,
                        response.statusText
                    );
                }
            } catch (error) {
                console.error("Error during API call:", error);
            } finally {
                setIsLoading(false)
            }
        } else {
            console.log("Deletion cancelled");
        }
    };

    // handleCancel button cliked show the last record for edit functionality
    const handleCancel = async () => {
        setIsEditing(false);
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setBackButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        setCancelButtonClicked(true);

        try {
            const response = await axios.get(
                `${API_URL}/get-lastrecordsugarpurchase?Company_Code=${companyCode}&Year_Code=${Year_Code}`
            );
            if (response.status === 200) {
                const data = response.data;
                purchaseidNew = data.last_SugarPurchasehead.purchaseid
                FromName = data.last_SugarPurchasedetail[0].FromName
                FromCode = data.last_SugarPurchasehead.Ac_Code
                newAcCode = data.last_SugarPurchasehead.Ac_Code
                Unitname = data.last_SugarPurchasedetail[0].Unit_Name
                UnitCode = data.last_SugarPurchasehead.Unit_Code
                MillName = data.last_SugarPurchasedetail[0].Mill_Name
                MillCode = data.last_SugarPurchasehead.mill_code
                BrokerName = data.last_SugarPurchasedetail[0].Broker_Name
                BrokerCode = data.last_SugarPurchasehead.BROKER
                GstRateName = data.last_SugarPurchasedetail[0].GST_Name
                GstRateCode = data.last_SugarPurchasehead.GstRateCode
                ItemName = data.last_SugarPurchasedetail[0].ItemName
                ItemCodeNew = data.last_SugarPurchasedetail[0].item_code
                BrandName = data.last_SugarPurchasedetail[0].Brand_Name
                BrandCode = data.last_SugarPurchasedetail[0].Branch_Code
                subTotal = data.last_SugarPurchasehead.subTotal
                globalQuantalTotal = data.last_SugarPurchasehead.NETQNTL
                CGSTRate = data.last_SugarPurchasehead.CGSTRate
                SGSTRate = data.last_SugarPurchasehead.SGSTRate
                IGSTRate = data.last_SugarPurchasehead.IGSTRate
                BillAmountNew = data.last_SugarPurchasehead.Bill_Amount
                // Ensure all fields are updated correctly
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.last_SugarPurchasehead
                }));
                setLastTenderData(data.last_SugarPurchasehead || {});
                setLastTenderDetails(data.last_SugarPurchasedetail || []);
            } else {
                console.error(
                    "Failed to fetch last data:",
                    response.status,
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    //handle back to Utility page.
    const handleBack = () => {
        navigate("/sugarpurchasebill-utility")
    };

    //Navigation Functionality to show first,previous,next and last record functionality
    const handleFirstButtonClick = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-firstsugarpurchase-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`);
            if (response.status === 200) {
                const data = response.data;
                purchaseidNew = data.first_SugarPurchaseHead_data.purchaseid
                FromName = data.first_SugarPurchasedetail_data[0].FromName
                FromCode = data.first_SugarPurchaseHead_data.Ac_Code
                Unitname = data.first_SugarPurchasedetail_data[0].Unit_Name
                UnitCode = data.first_SugarPurchaseHead_data.Unit_Code
                MillName = data.first_SugarPurchasedetail_data[0].Mill_Name
                MillCode = data.first_SugarPurchaseHead_data.mill_code
                BrokerName = data.first_SugarPurchasedetail_data[0].Broker_Name
                BrokerCode = data.first_SugarPurchaseHead_data.BROKER
                GstRateName = data.first_SugarPurchasedetail_data[0].GST_Name
                GstRateCode = data.first_SugarPurchaseHead_data.GstRateCode
                ItemName = data.first_SugarPurchasedetail_data[0].ItemName
                ItemCodeNew = data.first_SugarPurchaseHead_data.item_code
                BrandName = data.first_SugarPurchasedetail_data[0].Brand_Name
                BrandCode = data.first_SugarPurchaseHead_data.Branch_Code
                subTotal = data.first_SugarPurchaseHead_data.subTotal
                globalQuantalTotal = data.first_SugarPurchaseHead_data.NETQNTL
                CGSTRate = data.first_SugarPurchaseHead_data.CGSTRate
                SGSTRate = data.first_SugarPurchaseHead_data.SGSTRate
                IGSTRate = data.first_SugarPurchaseHead_data.IGSTRate
                BillAmountNew = data.first_SugarPurchaseHead_data.Bill_Amount
                // Ensure all fields are updated correctly
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.first_SugarPurchaseHead_data
                }));
                setLastTenderData(data.first_SugarPurchaseHead_data || {});
                setLastTenderDetails(data.first_SugarPurchasedetail_data || []);
            } else {
                console.error("Failed to fetch first tender data:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    // Function to fetch the last record
    const handleLastButtonClick = async () => {
        try {
            const response = await axios.get(`${API_URL}/getlastSugarPurchase-record-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`);
            if (response.status === 200) {
                const data = response.data;
                purchaseidNew = data.last_SugarPurchaseHead_data.purchaseid
                FromName = data.last_SugarPurchasedetail_data[0].FromName
                FromCode = data.last_SugarPurchaseHead_data.Ac_Code
                Unitname = data.last_SugarPurchasedetail_data[0].Unit_Name
                UnitCode = data.last_SugarPurchaseHead_data.Unit_Code
                MillName = data.last_SugarPurchasedetail_data[0].Mill_Name
                MillCode = data.last_SugarPurchaseHead_data.mill_code
                BrokerName = data.last_SugarPurchasedetail_data[0].Broker_Name
                BrokerCode = data.last_SugarPurchaseHead_data.BROKER
                GstRateName = data.last_SugarPurchasedetail_data[0].GST_Name
                GstRateCode = data.last_SugarPurchaseHead_data.GstRateCode
                ItemName = data.last_SugarPurchasedetail_data[0].ItemName
                ItemCodeNew = data.last_SugarPurchaseHead_data.item_code
                BrandName = data.last_SugarPurchasedetail_data[0].Brand_Name
                BrandCode = data.last_SugarPurchaseHead_data.Branch_Code
                subTotal = data.last_SugarPurchaseHead_data.subTotal
                globalQuantalTotal = data.last_SugarPurchaseHead_data.NETQNTL
                CGSTRate = data.last_SugarPurchaseHead_data.CGSTRate
                SGSTRate = data.last_SugarPurchaseHead_data.SGSTRate
                IGSTRate = data.last_SugarPurchaseHead_data.IGSTRate
                BillAmountNew = data.last_SugarPurchaseHead_data.Bill_Amount

                // Ensure all fields are updated correctly
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.last_SugarPurchaseHead_data
                }));
                setLastTenderData(data.last_SugarPurchaseHead_data || {});
                setLastTenderDetails(data.last_SugarPurchasedetail_data || []);

            } else {
                console.error("Failed to fetch last tender data:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    // Function to fetch the next record
    const handleNextButtonClick = async () => {
        try {
            const response = await axios.get(`${API_URL}/getnextsugarpurchase-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${formData.doc_no}`);
            if (response.status === 200) {
                const data = response.data;
                purchaseidNew = data.next_SugarPurchasehead_data.purchaseid
                FromName = data.next_SugarPurchasedetails_data[0].FromName
                FromCode = data.next_SugarPurchasehead_data.Ac_Code
                Unitname = data.next_SugarPurchasedetails_data[0].Unit_Name
                UnitCode = data.next_SugarPurchasehead_data.Unit_Code
                MillName = data.next_SugarPurchasedetails_data[0].Mill_Name
                MillCode = data.next_SugarPurchasehead_data.mill_code
                BrokerName = data.next_SugarPurchasedetails_data[0].Broker_Name
                BrokerCode = data.next_SugarPurchasehead_data.BROKER
                GstRateName = data.next_SugarPurchasedetails_data[0].GST_Name
                GstRateCode = data.next_SugarPurchasehead_data.GstRateCode
                ItemName = data.next_SugarPurchasedetails_data[0].ItemName
                ItemCodeNew = data.next_SugarPurchasehead_data.item_code
                BrandName = data.next_SugarPurchasedetails_data[0].Brand_Name
                BrandCode = data.next_SugarPurchasehead_data.Branch_Code
                subTotal = data.next_SugarPurchasehead_data.subTotal
                globalQuantalTotal = data.next_SugarPurchasehead_data.NETQNTL
                CGSTRate = data.next_SugarPurchasehead_data.CGSTRate
                SGSTRate = data.next_SugarPurchasehead_data.SGSTRate
                IGSTRate = data.next_SugarPurchasehead_data.IGSTRate
                BillAmountNew = data.next_SugarPurchasehead_data.Bill_Amount

                // Ensure all fields are updated correctly
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.next_SugarPurchasehead_data
                }));
                setLastTenderData(data.next_SugarPurchasehead_data || {});
                setLastTenderDetails(data.next_SugarPurchasedetails_data || []);
            } else {
                console.error("Failed to fetch next tender data:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    // Function to fetch the previous record
    const handlePreviousButtonClick = async () => {
        try {
            // Use formData.Tender_No as the current tender number
            const response = await axios.get(`${API_URL}/getprevioussugarpurchase-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${formData.doc_no}`);

            if (response.status === 200) {
                const data = response.data;
                purchaseidNew = data.previous_SugarPurchaseHead_data.purchaseid
                FromName = data.previous_SugarPurchasedetail_data[0].FromName
                FromCode = data.previous_SugarPurchaseHead_data.Ac_Code
                Unitname = data.previous_SugarPurchasedetail_data[0].Unit_Name
                UnitCode = data.previous_SugarPurchaseHead_data.Unit_Code
                MillName = data.previous_SugarPurchasedetail_data[0].Mill_Name
                MillCode = data.previous_SugarPurchaseHead_data.mill_code
                BrokerName = data.previous_SugarPurchasedetail_data[0].Broker_Name
                BrokerCode = data.previous_SugarPurchaseHead_data.BROKER
                GstRateName = data.previous_SugarPurchasedetail_data[0].GST_Name
                GstRateCode = data.previous_SugarPurchaseHead_data.GstRateCode
                ItemName = data.previous_SugarPurchasedetail_data[0].ItemName
                ItemCodeNew = data.previous_SugarPurchaseHead_data.item_code
                BrandName = data.previous_SugarPurchasedetail_data[0].Brand_Name
                BrandCode = data.previous_SugarPurchaseHead_data.Branch_Code
                subTotal = data.previous_SugarPurchaseHead_data.subTotal
                globalQuantalTotal = data.previous_SugarPurchaseHead_data.NETQNTL
                CGSTRate = data.previous_SugarPurchaseHead_data.CGSTRate
                SGSTRate = data.previous_SugarPurchaseHead_data.SGSTRate
                IGSTRate = data.previous_SugarPurchaseHead_data.IGSTRate
                BillAmountNew = data.previous_SugarPurchaseHead_data.Bill_Amount
                // Ensure all fields are updated correctly
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.previous_SugarPurchaseHead_data
                }));
                setLastTenderData(data.previous_SugarPurchaseHead_data || {});
                setLastTenderDetails(data.previous_SugarPurchasedetail_data || []);
            } else {
                console.error("Failed to fetch previous tender data:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    // Handle form submission (you can modify this based on your needs)
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (selectedRecord) {
            handlerecordDoubleClicked();
        } else {
            handleAddOne();
        }
    }, [selectedRecord]);

    //After Record DoubleClicked on utility page show that record on User Creation for Edit Mode
    const handlerecordDoubleClicked = async () => {
        // if(permissions?.canSave === "N")
        // {
        //     setAddOneButtonEnabled(false);
        //     setSaveButtonEnabled(false);
        // }
        // else if(permissions?.canEdit === "N")
        //     {
        //         setEditButtonEnabled(false);
        //     }
        //     else if(permissions?.canDelte === "N")
        //         {
        //             setDeleteButtonEnabled(false);
        //         }
        // else{
        setIsEditing(false);
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setBackButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        setCancelButtonClicked(true);
        try {
            const response = await axios.get(`${API_URL}/getsugarpurchasebyid?doc_no=${selectedRecord.doc_no}&Company_Code=${companyCode}&Year_Code=${Year_Code}`);
            if (response.status === 200) {
                const data = response.data;
                purchaseidNew = data.getData_SugarPurchaseHead_data.purchaseid
                FromName = data.getData_SugarPurchaseDetail_data[0].FromName
                FromCode = data.getData_SugarPurchaseHead_data.Ac_Code
                Unitname = data.getData_SugarPurchaseDetail_data[0].Unit_Name
                UnitCode = data.getData_SugarPurchaseHead_data.Unit_Code
                MillName = data.getData_SugarPurchaseDetail_data[0].Mill_Name
                MillCode = data.getData_SugarPurchaseHead_data.mill_code
                BrokerName = data.getData_SugarPurchaseDetail_data[0].Broker_Name
                BrokerCode = data.getData_SugarPurchaseHead_data.BROKER
                GstRateName = data.getData_SugarPurchaseDetail_data[0].GST_Name
                GstRateCode = data.getData_SugarPurchaseHead_data.GstRateCode
                ItemName = data.getData_SugarPurchaseDetail_data[0].ItemName
                ItemCodeNew = data.getData_SugarPurchaseHead_data.item_code
                BrandName = data.getData_SugarPurchaseDetail_data[0].Brand_Name
                BrandCode = data.getData_SugarPurchaseHead_data.Branch_Code
                subTotal = data.getData_SugarPurchaseHead_data.subTotal
                globalQuantalTotal = data.getData_SugarPurchaseHead_data.NETQNTL
                CGSTRate = data.getData_SugarPurchaseHead_data.CGSTRate
                SGSTRate = data.getData_SugarPurchaseHead_data.SGSTRate
                IGSTRate = data.getData_SugarPurchaseHead_data.IGSTRate
                BillAmountNew = data.getData_SugarPurchaseHead_data.Bill_Amount
                // Ensure all fields are updated correctly
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.getData_SugarPurchaseHead_data
                }));
                setLastTenderData(data.getData_SugarPurchaseHead_data || {});
                setLastTenderDetails(data.getData_SugarPurchaseDetail_data || []);
            } else {
                console.error("Failed to fetch last tender data:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    //change No functionality to get that particular record
    const handleKeyDown = async (event) => {
        if (event.key === "Tab") {
            const changeNoValue = event.target.value;
            try {
                const response = await axios.get(
                    `${API_URL}/getsugarpurchasebyid?Company_Code=${companyCode}&doc_no=${changeNoValue}&Year_Code=${Year_Code}`
                );
                const data = response.data
                purchaseidNew = data.getData_SugarPurchaseHead_data.purchaseid
                FromName = data.getData_SugarPurchaseDetail_data[0].FromName
                FromCode = data.getData_SugarPurchaseHead_data.Ac_Code
                Unitname = data.getData_SugarPurchaseDetail_data[0].Unit_Name
                UnitCode = data.getData_SugarPurchaseHead_data.Unit_Code
                MillName = data.getData_SugarPurchaseDetail_data[0].Mill_Name
                MillCode = data.getData_SugarPurchaseHead_data.mill_code
                BrokerName = data.getData_SugarPurchaseDetail_data[0].Broker_Name
                BrokerCode = data.getData_SugarPurchaseHead_data.BROKER
                GstRateName = data.getData_SugarPurchaseDetail_data[0].GST_Name
                GstRateCode = data.getData_SugarPurchaseHead_data.GstRateCode
                ItemName = data.getData_SugarPurchaseDetail_data[0].ItemName
                ItemCodeNew = data.getData_SugarPurchaseHead_data.item_code
                BrandName = data.getData_SugarPurchaseDetail_data[0].Brand_Name
                BrandCode = data.getData_SugarPurchaseHead_data.Branch_Code
                subTotal = data.getData_SugarPurchaseHead_data.subTotal
                globalQuantalTotal = data.getData_SugarPurchaseHead_data.NETQNTL
                CGSTRate = data.getData_SugarPurchaseHead_data.CGSTRate
                SGSTRate = data.getData_SugarPurchaseHead_data.SGSTRate
                IGSTRate = data.getData_SugarPurchaseHead_data.IGSTRate
                BillAmountNew = data.getData_SugarPurchaseHead_data.Bill_Amount
                // Ensure all fields are updated correctly
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.getData_SugarPurchaseHead_data
                }));
                setLastTenderData(data.getData_SugarPurchaseHead_data || {});
                setLastTenderDetails(data.getData_SugarPurchaseDetail_data || []);
                setIsEditing(false);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
    };

    //detail Grid Functionality......
    useEffect(() => {
        if (selectedRecord) {
            setUsers(
                lastTenderDetails.map((detail) => ({
                    rowaction: "Normal",
                    id: detail.purchasedetailid,
                    purchasedetailid: detail.purchasedetailid,
                    item_code: detail.item_code,
                    ic: detail.ic,
                    Brand_Code: detail.Brand_Code,
                    Quantal: detail.Quantal,
                    packing: detail.packing,
                    bags: detail.bags,
                    rate: detail.rate,
                    item_Amount: detail.item_Amount,
                    narration: detail.narration,
                    itemNameLabel: detail.itemNameLabel,
                    brandName: detail.brandName,
                    detail_id: detail.detail_id

                }))
            );
        }
    }, [selectedRecord, lastTenderDetails]);

    useEffect(() => {
        setUsers(
            lastTenderDetails.map((detail) => ({
                rowaction: "Normal",
                id: detail.purchasedetailid,
                purchasedetailid: detail.purchasedetailid,
                item_code: detail.item_code,
                ic: detail.ic,
                Brand_Code: detail.Brand_Code,
                Quantal: detail.Quantal,
                packing: detail.packing,
                bags: detail.bags,
                rate: detail.rate,
                item_Amount: detail.item_Amount,
                narration: detail.narration,
                itemNameLabel: detail.ItemName,
                brandName: detail.Brand_Name,
                detail_id: detail.detail_id
            }))
        );
    }, [lastTenderDetails]);

    // Function to handle changes in the form fields
    const handleChangeDetail = (event) => {
        const { name, value } = event.target;
        let updatedFormDataDetail = { ...formDataDetail, [name]: value };

        if (name === 'Quantal') {
            const quantal = parseFloat(value);
            const packing = parseFloat(formDataDetail.packing);

            updatedFormDataDetail = {
                ...updatedFormDataDetail,
                bags: !isNaN(quantal) && !isNaN(packing) && packing !== 0 ? Math.round((quantal * 100) / packing) : '',
            };
        }

        if (name === 'packing') {
            const packing = parseFloat(value);
            const quantal = parseFloat(formDataDetail.Quantal);

            updatedFormDataDetail = {
                ...updatedFormDataDetail,
                bags: !isNaN(quantal) && !isNaN(packing) && packing !== 0 ? Math.round((quantal * 100) / packing) : '',
            };
        }

        if (name === 'rate' || name === 'Quantal') {
            const quantal = parseFloat(updatedFormDataDetail.Quantal);
            const rate = parseFloat(updatedFormDataDetail.rate);

            updatedFormDataDetail = {
                ...updatedFormDataDetail,
                item_Amount: !isNaN(quantal) && !isNaN(rate) ? (quantal * rate).toFixed(2) : "0.00",
            };
        }

        setFormDataDetail(updatedFormDataDetail);
    };

    //open popup function
    const openPopup = () => {
        setShowPopup(true);
    };

    //close popup function
    const closePopup = () => {
        setShowPopup(false);
        setSelectedUser({});
        clearForm();
    };

    const clearForm = () => {
        setFormDataDetail({
            Quantal: "",
            packing: "",
            bags: "",
            rate: 0.00,
            item_Amount: 0.00,
            narration: ""
        });
    };

    const editUser = (user) => {
        setSelectedUser(user);
        setItemSelect(user.item_code);
        setBrandCode(user.Branch_Code);
        setBrandName(user.brandName)
        setItemNameLabel(user.itemNameLabel)
        setFormDataDetail({
            bags: user.bags || "",
            packing: user.packing || "",
            Quantal: user.Quantal || "",
            rate: user.rate || "",
            item_Amount: user.item_Amount || "",
            narration: user.narration || ""
        });
        openPopup();
    };

    const fetchMatchStatus = async (params) => {
        try {
            const response = await axios.get(`${API_URL}/get_match_status`, { params });
            return response.data.match_status;
        } catch (error) {
            console.error('Error fetching match status:', error);
            return null;
        }
    };

    const handleMatchStatus = (match_status, subTotal) => {
        const gstRateDivide = parseFloat(gstRate);

        // Calculate CGST, SGST, and IGST rates based on the given GST rate
        const cgstRate = cancelButtonClicked ? parseFloat(CGSTRate) : gstRateDivide / 2;
        const sgstRate = cancelButtonClicked ? parseFloat(SGSTRate) : gstRateDivide / 2;
        const igstRate = cancelButtonClicked ? parseFloat(IGSTRate) : gstRateDivide;

        const cgstAmount = parseFloat(calculateGSTAmount(subTotal, cgstRate)).toFixed(2);
        const sgstAmount = parseFloat(calculateGSTAmount(subTotal, sgstRate)).toFixed(2);
        const igstAmount = parseFloat(calculateGSTAmount(subTotal, igstRate)).toFixed(2);

        const TCSRate = parseFloat(formData.TCS_Rate) || 0
        const TDSRate = parseFloat(formData.TDS_Rate) || 0

        let billAmount;
        let netPayable;
        let TCSAmount;
        let TDSAmount;

        // Update formData based on match_status
        if (match_status === "TRUE") {
            billAmount = parseFloat(subTotal) + parseFloat(cgstAmount) + parseFloat(sgstAmount) + parseFloat(formData.OTHER_AMT) + parseFloat(formData.cash_advance);
            netPayable = billAmount.toFixed(2);
            TCSAmount = billAmount * TCSRate / 100
            TDSAmount = subTotal * TDSRate / 100
            setFormData({
                ...formData,
                CGSTRate: cgstRate.toFixed(2),
                SGSTRate: sgstRate.toFixed(2),
                IGSTRate: 0.00, // Reset IGST rate
                CGSTAmount: cgstAmount,
                SGSTAmount: sgstAmount,
                IGSTAmount: 0.00, // Reset IGST amount
                Bill_Amount: billAmount,
                TCS_Net_Payable: netPayable,
                TCS_Amt: TCSAmount,
                TDS_Amt: TDSAmount
            });
        } else {
            billAmount = parseFloat(subTotal) + parseFloat(igstAmount) + parseFloat(formData.OTHER_AMT) + parseFloat(formData.cash_advance);
            netPayable = billAmount.toFixed(2);
            TCSAmount = billAmount * TCSRate / 100
            TDSAmount = subTotal * TDSRate / 100
            setFormData({
                ...formData,
                CGSTRate: 0.00, // Reset CGST rate
                SGSTRate: 0.00, // Reset SGST rate
                IGSTRate: igstRate.toFixed(2), // Convert rate to string with 2 decimal places
                CGSTAmount: 0.00, // Reset CGST amount
                SGSTAmount: 0.00,
                IGSTAmount: igstAmount,
                Bill_Amount: billAmount,
                TCS_Net_Payable: netPayable,
                TCS_Amt: TCSAmount,
                TDS_Amt: TDSAmount
            });
        }
    };

    const   addUser = async () => {
        debugger

        const newUser = {
            id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
            item_code: itemSelect,
            ic: itemSelectAccoid,
            Brand_Code: brandCode,
            itemNameLabel: itemNameLabel,
            brandName: brandName,
            ...formDataDetail,
            rowaction: "add",
        };
        // Calculate subTotal based on all users including newUser
        const newUsers = [...users, newUser];
        const totalItemAmount = newUsers.reduce((total, user) => {
            return total + parseFloat(user.item_Amount);
        }, 0);
        subTotal = totalItemAmount.toFixed(2);

        // Calculate total Quantal based on all users including newUser
        const totalQuantal = newUsers.reduce((total, user) => {
            return total + parseFloat(user.Quantal);
        }, 0);
        globalQuantalTotal = totalQuantal; // Update the global variable

        setFormDataDetail({
            ...newUser,
            subTotal: subTotal
        });

        const updatedFormData = {
            ...formData,
        };

        if (from !== "" || FromCode !== "") {
            // Fetch match status
            const match_status = await fetchMatchStatus({
                Company_Code: companyCode,
                Year_Code: Year_Code,
                Ac_Code: cancelButtonClicked ? FromCode || updatedFormData.Ac_Code : from
            });

            if (match_status) {
                handleMatchStatus(match_status, subTotal);
            }
        }
        setUsers([...users, newUser]);
        closePopup();
    };

    //Update User On Grid
    const updateUser = async () => {

        const updatedUsers = users.map((user) => {
            if (user.id === selectedUser.id) {
                const updatedRowaction = user.rowaction === "Normal" ? "update" : user.rowaction;

                // Calculate updated item_Amount
                const updatedItemAmount = (parseFloat(formDataDetail.Quantal) * parseFloat(formDataDetail.rate)).toFixed(2);

                return {
                    ...user,
                    item_code: itemSelect,
                    itemNameLabel: itemNameLabel,
                    ic: itemSelectAccoid,
                    Brand_Code: brandCode,
                    brandName: brandName,
                    ...formDataDetail,
                    item_Amount: updatedItemAmount,
                    rowaction: updatedRowaction,
                };
            } else {
                return user;
            }
        });

        // Calculate new subTotal
        const totalItemAmount = updatedUsers.reduce((total, user) => {
            return total + parseFloat(user.item_Amount);
        }, 0);
        subTotal = totalItemAmount.toFixed(2);

        // Calculate total Quantal based on all users
        const totalQuantal = updatedUsers.reduce((total, user) => {
            return total + parseFloat(user.Quantal);
        }, 0);
        globalQuantalTotal = totalQuantal;

        setFormDataDetail({
            ...updatedUsers,
            subTotal: subTotal
        });

        const updatedFormData = {
            ...formData
        }

        if (from !== "" || FromCode !== "") {
            // Fetch match status
            const match_status = await fetchMatchStatus({
                Company_Code: companyCode,
                Year_Code: Year_Code,
                Ac_Code: cancelButtonClicked ? FromCode || updatedFormData.Ac_Code : from
            });

            if (match_status) {
                handleMatchStatus(match_status, subTotal);
            }
        }

        setUsers(updatedUsers);
        closePopup();
    };


    const deleteModeHandler = async (userToDelete) => {
        debugger;
        let updatedUsers;

        if (isEditMode && userToDelete.rowaction === "add") {
            updatedUsers = users.map((u) =>
                u.id === userToDelete.id ? { ...u, rowaction: "DNU" } : u
            );
        } else if (isEditMode) {
            updatedUsers = users.map((u) =>
                u.id === userToDelete.id ? { ...u, rowaction: "delete" } : u
            );
        } else {
            updatedUsers = users.map((u) =>
                u.id === userToDelete.id ? { ...u, rowaction: "DNU" } : u
            );
        }

        // Calculate new subTotal
        const totalItemAmount = updatedUsers.reduce((total, u) => {
            if (u.rowaction !== "delete" && u.rowaction !== "DNU") {
                return total + parseFloat(u.item_Amount || 0);
            } else {
                return total;
            }
        }, 0);

        // Update subTotal state
        subTotal = (totalItemAmount.toFixed(2));

        // Calculate total Quantal based on all users
        const totalQuantal = updatedUsers.reduce((total, u) => {
            if (u.rowaction !== "delete" && u.rowaction !== "DNU") {
                return total + parseFloat(u.Quantal);
            } else {
                return total;
            }
        }, 0);

        globalQuantalTotal = totalQuantal;

        const updatedFormData = {
            ...formData
        }

        // Update formDataDetail with updatedUsers and subTotal
        setFormDataDetail({
            ...formDataDetail,  // Spread existing formDataDetail fields
            ...updatedUsers.find(u => u.id === u.id),  // Spread only the updated user fields
            subTotal: subTotal  // Set the updated subTotal
        });

        if (from !== "" || FromCode !== "") {
            // Fetch match status
            const match_status = await fetchMatchStatus({
                Company_Code: companyCode,
                Year_Code: Year_Code,
                Ac_Code: cancelButtonClicked ? FromCode || updatedFormData.Ac_Code : from
            });

            if (match_status) {
                handleMatchStatus(match_status, subTotal);
            }
        }

        // Update users state, delete mode, and selected user
        setUsers(updatedUsers);
        setDeleteMode(true); // Assuming you need to set delete mode to true
        setSelectedUser(userToDelete);
    };


    //Functionality After delete record undo deleted record.
    const openDelete = async (user) => {
        let updatedUsers;

        // Set delete mode and selected user
        setDeleteMode(true);
        setSelectedUser(user);

        // Determine action based on edit mode and row action
        if (isEditMode && user.rowaction === "delete") {
            updatedUsers = users.map((u) =>
                u.id === user.id ? { ...u, rowaction: "Normal" } : u
            );
        } else {
            updatedUsers = users.map((u) =>
                u.id === user.id ? { ...u, rowaction: "add" } : u
            );
        }

        // Calculate new subTotal after updating users
        const totalItemAmount = updatedUsers.reduce((total, u) => {
            return total + parseFloat(u.item_Amount || 0);
        }, 0);

        // Update subTotal state
        const updatedSubTotal = totalItemAmount.toFixed(2);
        subTotal = updatedSubTotal

        // Calculate total Quantal based on all users
        const totalQuantal = updatedUsers.reduce((total, u) => {

            return total + parseFloat(u.Quantal || 0);

        }, 0);

        globalQuantalTotal = totalQuantal;

        const updatedFormData = {
            ...formData
        }

        // Update formDataDetail with updatedUsers and subTotal
        setFormDataDetail({
            ...formDataDetail,
            subTotal: updatedSubTotal
        });

        if (from !== "" || FromCode !== "") {
            // Fetch match status
            const match_status = await fetchMatchStatus({
                Company_Code: companyCode,
                Year_Code: Year_Code,
                Ac_Code: cancelButtonClicked ? FromCode || updatedFormData.Ac_Code : from
            });

            if (match_status) {
                handleMatchStatus(match_status, subTotal);
            }
        }


        // Update users state
        setUsers(updatedUsers);

        // Clear selected user
        setSelectedUser({});
    };

    //Functionality to help section to set the record.
    const handleItemSelect = (code, accoid, HSN, Name) => {
        setItemSelect(code);
        setItemSelectAccoid(accoid)
        setItemNameLabel(Name)
        // setHSNNo(HSN)
    };

    // Handle changes in the Mill_Code input (assuming SystemMasterHelp handles its own state
    const handleBrandCode = (code, accoid, Name) => {
        setBrandCode(code);
        setBrandCodeAccoid(accoid)
        setBrandName(Name)

    };

    //Head Section help Functions to manage the Ac_Code and accoid
    const handleDoNo = (code, accoid) => {
        setDoNo(code);
        setFormData({
            ...formData,
        });
    }

    const handleFrom = (code, accoid) => {
        setFrom(code)
        newAcCode = code
        setFormData({
            ...formData,
            Ac_Code: code,
            ac: accoid
        });

    }

    const handleUnit = (code, accoid) => {
        setUnit(code);
        setFormData({
            ...formData,
            Unit_Code: code,
            uc: accoid
        });
    }

    const handleMill = (code, accoid) => {
        setMill(code);
        setFormData({
            ...formData,
            mill_code: code,
            mc: accoid
        });
    }

    const handleBroker = (code, accoid) => {
        setBroker(code);
        setFormData({
            ...formData,
            BROKER: code,
            bk: accoid
        });
    }

    const handleGstCode = async (code, Rate) => {
        debugger
        setGstCode(code);
        setGstRate(Rate);

        const updatedFormData = {
            ...formData,
        };


        if (from != "" || FromCode != "") {
            // Make an API call to fetch match status
            const match_status = await fetchMatchStatus({
                Company_Code: companyCode,
                Year_Code: Year_Code,
                Ac_Code: cancelButtonClicked ? FromCode : updatedFormData.Ac_Code
            });

            const gstRateDivide = parseFloat(Rate);

            const cgstRate = gstRateDivide / 2;
            const sgstRate = gstRateDivide / 2;
            const igstRate = gstRateDivide;

            const cgstAmount = parseFloat(calculateGSTAmount(subTotal, cgstRate)).toFixed(2);
            const sgstAmount = parseFloat(calculateGSTAmount(subTotal, sgstRate)).toFixed(2);
            const igstAmount = parseFloat(calculateGSTAmount(subTotal, igstRate)).toFixed(2);

            const TCSRate = parseFloat(formData.TCS_Rate) || 0
            const TDSRate = parseFloat(formData.TDS_Rate) || 0

            let billAmount;
            let netPayable;
            let TCSAmount;
            let TDSAmount;

            // Update formData based on match_status
            if (match_status === "TRUE") {
                billAmount = parseFloat(subTotal) + parseFloat(cgstAmount) + parseFloat(sgstAmount) + parseFloat(formData.OTHER_AMT) + parseFloat(formData.cash_advance);
                netPayable = billAmount.toFixed(2);
                TCSAmount = billAmount * TCSRate / 100
                TDSAmount = subTotal * TDSRate / 100



                setFormData({
                    ...formData,
                    CGSTRate: cgstRate.toFixed(2),
                    SGSTRate: sgstRate.toFixed(2),
                    IGSTRate: 0.00,
                    CGSTAmount: cgstAmount,
                    SGSTAmount: sgstAmount,
                    IGSTAmount: 0.00,
                    Bill_Amount: billAmount,
                    TCS_Net_Payable: netPayable,
                    TCS_Amt: TCSAmount,
                    TDS_Amt: TDSAmount
                });
            } else {
                billAmount = parseFloat(subTotal) + parseFloat(igstAmount) + parseFloat(formData.OTHER_AMT) + parseFloat(formData.cash_advance);
                netPayable = billAmount.toFixed(2);
                TCSAmount = billAmount * TCSRate / 100
                TDSAmount = subTotal * TDSRate / 100
                setFormData({
                    ...formData,
                    CGSTRate: 0.00,
                    SGSTRate: 0.00,
                    IGSTRate: igstRate.toFixed(2),
                    CGSTAmount: 0.00,
                    SGSTAmount: 0.00,
                    IGSTAmount: igstAmount,
                    Bill_Amount: billAmount,
                    TCS_Net_Payable: netPayable,
                    TCS_Amt: TCSAmount,
                    TDS_Amt: TDSAmount
                });
            }
        }


    }

    const calculateGSTAmount = (subTotal, rate) => {
        return (subTotal * (rate / 100)).toFixed(2);
    };

    const handleKeyDownOther = (e) => {
        if (e.key === 'Tab') {

            
            calculateTotals();
        }
    };


    const validateNumericInput = (e) => {
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
    };

    return (
        <>
            <ToastContainer />
            {/* <button style={{ marginBottom: "-80px" }} className="btn btn-primary">Print</button> */}
            {/* Action button  */}
            <div className="main-container" >
            <h5 className="mt-4 mb-4 text-center custom-heading">
                Sugar Purchase For GST
            </h5>
                <ActionButtonGroup
                    handleAddOne={handleAddOne}
                    addOneButtonEnabled={addOneButtonEnabled}
                    handleSaveOrUpdate={handleSaveOrUpdate}
                    saveButtonEnabled={saveButtonEnabled}
                    isEditMode={isEditMode}
                    handleEdit={handleEdit}
                    editButtonEnabled={editButtonEnabled}
                    handleDelete={handleDelete}
                    deleteButtonEnabled={deleteButtonEnabled}
                    handleCancel={handleCancel}
                    cancelButtonEnabled={cancelButtonEnabled}
                    handleBack={handleBack}
                    backButtonEnabled={backButtonEnabled}
                    permissions={permissions} 
                />
                <div>
                    {/* Navigation Buttons */}
                    <NavigationButtons
                        handleFirstButtonClick={handleFirstButtonClick}
                        handlePreviousButtonClick={handlePreviousButtonClick}
                        handleNextButtonClick={handleNextButtonClick}
                        handleLastButtonClick={handleLastButtonClick}
                        highlightedButton={highlightedButton}
                        isEditing={isEditing}
                    />
                </div>
  
            <form onSubmit={handleSubmit}>
                <div >

                    <Grid container spacing={2}>
                        <Grid item xs={1}>
                            <FormControl>
                                <TextField
                                    label="Change No"
                                    name="changeNo"
                                    variant="outlined"
                                    autoComplete="off"
                                    onKeyDown={handleKeyDown}
                                    disabled={!addOneButtonEnabled}
                                    size="small"
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={2}>
                            <FormControl>
                                <TextField
                                    label="doc no"
                                    name="doc_no"
                                    variant="outlined"
                                    autoComplete="off"
                                    value={formData.doc_no}
                                    onChange={handleChange}
                                    disabled
                                    size="small"

                                />
                            </FormControl>
                        </Grid>
                        <label htmlFor="Date" style={{ marginTop: "25px" }}>Do No :</label>
                        <Grid item xs={3}>

                            <FormControl fullWidth variant="outlined" size="small" disabled={!isEditing && addOneButtonEnabled} >
                                <AccountMasterHelp
                                    onAcCodeClick={handleDoNo}
                                    CategoryName={""}
                                    CategoryCode={""}
                                    name="DO_No"

                                    disabledFeild={!isEditing && addOneButtonEnabled}

                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={2} >
                            <TextField
                                label="Date"
                                type="date"
                                variant="outlined"
                                inputRef={setFocusTaskdate}
                                name="doc_date"
                                value={formData.doc_date}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                fullWidth
                                size="small"
                                tabIndex={1}

                            />
                        </Grid>

                        <Grid item xs={2}>
                            <FormControl variant="outlined" fullWidth size="small">
                                <InputLabel id="retail-stock-label">Retail Stock</InputLabel>
                                <Select
                                    labelId="retail-stock-label"
                                    id="Retail_Stock"
                                    name="Retail_Stock"
                                    value={formData.Retail_Stock}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    label="Retail Stock"
                                    tabIndex={2}
                                >
                                    <MenuItem value="Y">Yes</MenuItem>
                                    <MenuItem value="N">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                    </Grid>

                    <Grid container spacing={1}>
                        <label htmlFor="From" style={{ marginTop: "45px" }}>From :</label>
                        <Grid item xs={5} sx={{ mt: 4 }}>
                            <FormControl fullWidth variant="outlined" size="small" disabled={!isEditing && addOneButtonEnabled}>
                                <AccountMasterHelp
                                    onAcCodeClick={handleFrom}
                                    CategoryName={FromName}
                                    CategoryCode={FromCode}
                                    name="From"
                                    disabledFeild={!isEditing && addOneButtonEnabled}

                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <label htmlFor="Unit" style={{ marginTop: "25px" }}>Unit :</label>
                        <Grid item xs={8} sx={{ mt: 2 }}>
                            <FormControl fullWidth variant="outlined" size="small" disabled={!isEditing && addOneButtonEnabled}>
                                <AccountMasterHelp
                                    onAcCodeClick={handleUnit}
                                    CategoryName={Unitname}
                                    CategoryCode={UnitCode}
                                    name="Unit"

                                    disabledFeild={!isEditing && addOneButtonEnabled}
                                />
                            </FormControl>
                        </Grid>
                        <Grid container >
                            <label htmlFor="Mill" style={{ marginTop: "25px" }}>Mill :</label>
                            <Grid item xs={11} sx={{ mt: 2 }}>
                                <FormControl fullWidth variant="outlined" size="small" disabled={!isEditing && addOneButtonEnabled}>
                                    <AccountMasterHelp
                                        onAcCodeClick={handleMill}
                                        CategoryName={MillName}
                                        CategoryCode={MillCode}
                                        name="Mill"

                                        disabledFeild={!isEditing && addOneButtonEnabled}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>

                    <div className="debitCreditNote-row" >
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={2}>
                                <TextField
                                    label="From"
                                    variant="outlined"
                                    name="FROM_STATION"
                                    autoComplete="off"
                                    value={formData.FROM_STATION}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    fullWidth
                                    size="small"

                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="To"
                                    variant="outlined"
                                    name="TO_STATION"
                                    autoComplete="off"
                                    value={formData.TO_STATION}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="Grade"
                                    variant="outlined"
                                    name="grade"
                                    autoComplete="off"
                                    value={formData.grade}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="Lorry No"
                                    variant="outlined"
                                    name="LORRYNO"
                                    autoComplete="off"
                                    value={formData.LORRYNO}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="wearhouse"
                                    variant="outlined"
                                    name="wearhouse"
                                    autoComplete="off"
                                    value={formData.wearhouse}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </div>


                    <div className="debitCreditNote-row">
                        <Grid container >
                            <label htmlFor="Broker" style={{ marginTop: "5px" }}>Broker :</label>
                            <Grid item xs={3}>
                                <FormControl fullWidth variant="outlined">

                                    <AccountMasterHelp
                                        onAcCodeClick={handleBroker}
                                        CategoryName={BrokerName}
                                        CategoryCode={BrokerCode}
                                        name="broker"

                                        disabledFeild={!isEditing && addOneButtonEnabled}
                                    />
                                </FormControl>
                            </Grid>

                            <label htmlFor="GSTRATECODE" style={{ marginTop: "5px" }}>GST Rate Code :</label>
                            <Grid item xs={3}>
                                <FormControl fullWidth variant="outlined">
                                    <GSTRateMasterHelp
                                        onAcCodeClick={handleGstCode}
                                        GstRateName={GstRateName}
                                        GstRateCode={GstRateCode}
                                        name="gst_code"

                                        disabledFeild={!isEditing && addOneButtonEnabled}
                                    />
                                </FormControl>
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="Bill No"
                                    variant="outlined"
                                    name="Bill_No"
                                    autoComplete="off"
                                    value={formData.Bill_No}
                                    onChange={handleChange}
                                    tabIndex="10"
                                    disabled={!isEditing && addOneButtonEnabled}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={2} ml={2}>
                                <TextField
                                    label="Mill Invoice Date"
                                    type="date"
                                    variant="outlined"
                                    name="mill_inv_date"
                                    value={formData.mill_inv_date}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </div>
                </div>

                {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner-container">
                            <HashLoader color="#007bff" loading={isLoading} size={80} />
                        </div>
                    </div>
                )}


                {/*detail part popup functionality and Validation part Grid view */}
                <div className="mt-4" >
                <div className="mt-4" style={{float:'left',marginBottom:'10px'}}>
                    <button
                        className="btn btn-primary"
                        onClick={openPopup}
                        disabled={!isEditing}
                        tabIndex="16"
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                openPopup();
                            }
                        }}
                    >
                        Add
                    </button>
                    <button
                        className="btn btn-danger"
                        disabled={!isEditing}
                        style={{ marginLeft: "10px" }}
                        tabIndex="17"
                    >
                        Close
                    </button>
                    </div>
                    {showPopup && (
                        <div
                            className="modal"

                            role="dialog"
                            style={{ display: "block" }}
                        >
                            <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            {selectedUser.id ? "Edit User" : "Add User"}
                                        </h5>
                                        <button
                                            type="button"
                                            onClick={closePopup}
                                            aria-label="Close"
                                            style={{ marginLeft: "80%", width: "60px", height: "30px" }}
                                        >
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <form>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <label htmlFor="Item Name">Item Name :</label>
                                                    <FormControl fullWidth variant="outlined" size="small">
                                                        <SystemHelpMaster
                                                            onAcCodeClick={handleItemSelect}
                                                            CategoryName={itemNameLabel}
                                                            CategoryCode={itemSelect}
                                                            name="Item_Select"

                                                            SystemType="I"
                                                            className="account-master-help"
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <label htmlFor="Item Name">Brand Code :</label>
                                                    <FormControl fullWidth variant="outlined" size="small">
                                                        <BrandMasterHelp
                                                            onAcCodeClick={handleBrandCode}
                                                            CategoryName={brandName}
                                                            CategoryCode={brandCode}
                                                            name="Brand_Code"
                                                            className="account-master-help"
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                                <Grid item xs={4}>
                                                    <InputLabel htmlFor="Quantal">Quantal:</InputLabel>
                                                    <TextField
                                                        id="Quantal"
                                                        type="text"
                                                        fullWidth
                                                        size="small"
                                                        name="Quantal"
                                                        autoComplete="off"
                                                        value={formDataDetail.Quantal}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <InputLabel htmlFor="packing">Packing:</InputLabel>
                                                    <TextField
                                                        id="packing"
                                                        type="text"
                                                        fullWidth
                                                        size="small"
                                                        name="packing"
                                                        autoComplete="off"
                                                        value={formDataDetail.packing}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <InputLabel htmlFor="bags">Bags:</InputLabel>
                                                    <TextField
                                                        id="bags"
                                                        type="text"
                                                        fullWidth
                                                        size="small"
                                                        name="bags"
                                                        autoComplete="off"
                                                        value={formDataDetail.bags}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                                <Grid item xs={4}>
                                                    <InputLabel htmlFor="rate">Rate:</InputLabel>
                                                    <TextField
                                                        id="rate"
                                                        type="text"
                                                        fullWidth
                                                        size="small"
                                                        name="rate"
                                                        autoComplete="off"
                                                        value={formDataDetail.rate !== null ? formDataDetail.rate : ""}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <InputLabel htmlFor="item_Amount">Item Amount:</InputLabel>
                                                    <TextField
                                                        id="item_Amount"
                                                        type="text"
                                                        fullWidth
                                                        size="small"
                                                        name="item_Amount"
                                                        autoComplete="off"
                                                        value={formDataDetail.item_Amount}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <InputLabel htmlFor="narration" style={{ fontWeight: 'bold' }}>Narration:</InputLabel>
                                                    <TextField
                                                        id="narration"
                                                        name="narration"
                                                        value={formDataDetail.narration}
                                                        onChange={handleChangeDetail}
                                                        autoComplete="off"
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        size="small"
                                                        disabled={!isEditing && addOneButtonEnabled}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                        {selectedUser.id ? (
                                            <button className="btn btn-primary" onClick={updateUser} onKeyDown={(event) => {
                                                if (event.key === 13) {
                                                    updateUser();
                                                }
                                            }}>
                                                Update User
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary" onClick={addUser} onKeyDown={(event) => {
                                                if (event.key === 13) {
                                                    addUser();
                                                }
                                            }}>
                                                Add User
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={closePopup}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <table className="table mt-4 table-bordered">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>ID</th>
                                <th>Rowaction</th>
                                <th>Item Code</th>
                                <th>Item Name</th>
                                <th>Brand Code</th>
                                <th>Brand Name</th>
                                <th>Quantal</th>
                                <th>packing</th>
                                <th>rate</th>
                                <th>bags</th>
                                <th>item_Amount</th>
                                <th>narration</th>

                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        {user.rowaction === "add" ||
                                            user.rowaction === "update" ||
                                            user.rowaction === "Normal" ? (
                                            <>
                                                <button
                                                    className="btn btn-warning"
                                                    onClick={() => editUser(user)}
                                                    disabled={!isEditing}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter") {
                                                            editUser(user);
                                                        }
                                                    }}
                                                    tabIndex="18"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger ms-2"
                                                    onClick={() => deleteModeHandler(user)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Enter") {
                                                            deleteModeHandler(user)
                                                        }
                                                    }}
                                                    disabled={!isEditing}
                                                    tabIndex="19"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : user.rowaction === "DNU" ||
                                            user.rowaction === "delete" ? (
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => openDelete(user)}
                                            >
                                                Open
                                            </button>
                                        ) : null}
                                    </td>
                                    <td>{user.id}</td>
                                    <td>{user.rowaction}</td>
                                    <td>{user.item_code}</td>
                                    <td>{user.itemNameLabel}</td>
                                    <td>{user.Brand_Code}</td>
                                    <td>{user.brandName}</td>
                                    <td>{user.Quantal}</td>
                                    <td>{user.packing}</td>
                                    <td>{user.rate}</td>
                                    <td>{user.bags}</td>
                                    <td>{user.item_Amount}</td>
                                    <td>{user.narration}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <br></br>
                <br></br>

                <div className="debitCreditNote-row">
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <TextField
                                label="Net Quental"
                                variant="outlined"
                                name="NETQNTL"
                                autoComplete="off"
                                value={globalQuantalTotal}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                size="small"
                               
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                label="EWay Bill"
                                variant="outlined"
                                name="EWay_Bill_No"
                                autoComplete="off"
                                value={formData.EWay_Bill_No}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                label="Due Days"
                                variant="outlined"
                                name="Due_Days"
                                autoComplete="off"
                                value={formData.Due_Days}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                size="small"
                            />
                        </Grid>

                    </Grid>
                </div>
                <div className="debitCreditNote-row">
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Subtotal"
                                variant="outlined"
                                name="subTotal"
                                autoComplete="off"
                                value={subTotal || formData.subTotal}
                                disabled={!isEditing && addOneButtonEnabled}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                error={!!formErrors.subTotal}
                                helperText={formErrors.subTotal}
                                size="small"
                                inputProps={{
                                    inputMode: 'decimal',
                                    pattern: '[0-9]*[.,]?[0-9]+',
                                    onInput: validateNumericInput,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={9}>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={1}>
                                    <TextField
                                        label="CGST Rate"
                                        variant="outlined"
                                        name="CGSTRate"
                                        autoComplete="off"
                                        value={formData.CGSTRate}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.CGSTRate}
                                        helperText={formErrors.CGSTRate}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <TextField
                                        label="CGST Amount"
                                        variant="outlined"
                                        name="CGSTAmount"
                                        autoComplete="off"
                                        value={formData.CGSTAmount}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.CGSTAmount}
                                        helperText={formErrors.CGSTAmount}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={1}>
                                    <TextField
                                        label="SGST Rate"
                                        variant="outlined"
                                        name="SGSTRate"
                                        autoComplete="off"
                                        value={formData.SGSTRate}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.SGSTRate}
                                        helperText={formErrors.SGSTRate}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <TextField
                                        label="SGST Amount"
                                        variant="outlined"
                                        name="SGSTAmount"
                                        autoComplete="off"
                                        value={formData.SGSTAmount}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.SGSTAmount}
                                        helperText={formErrors.SGSTAmount}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={6} sm={1}>
                                    <TextField
                                        label="IGST Rate"
                                        variant="outlined"
                                        name="IGSTRate"
                                        autoComplete="off"
                                        value={formData.IGSTRate}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.IGSTRate}
                                        helperText={formErrors.IGSTRate}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <TextField
                                        label="IGST Amount"
                                        variant="outlined"
                                        name="IGSTAmount"
                                        autoComplete="off"
                                        value={formData.IGSTAmount}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.IGSTAmount}
                                        helperText={formErrors.IGSTAmount}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={6} sm={1}>
                                    <TextField
                                        label="Less Frt Rs Rate"
                                        variant="outlined"
                                        name="LESS_FRT_RATE"
                                        autoComplete="off"
                                        value={formData.LESS_FRT_RATE}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.LESS_FRT_RATE}
                                        helperText={formErrors.LESS_FRT_RATE}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <TextField
                                        label="Freight"
                                        variant="outlined"
                                        name="freight"
                                        autoComplete="off"
                                        value={formData.freight}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!formErrors.freight}
                                        helperText={formErrors.freight}
                                        size="small"
                                        inputProps={{
                                            inputMode: 'decimal',
                                            pattern: '[0-9]*[.,]?[0-9]+',
                                            onInput: validateNumericInput,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>

                <div className="debitCreditNote-row">
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <TextField
                                label="Bank Commission"
                                variant="outlined"
                                fullWidth
                                name="bank_commission"
                                value={formData.bank_commission}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                error={Boolean(formErrors.bank_commission)}
                                helperText={formErrors.bank_commission || ''}
                                size="small"
                                inputProps={{
                                    inputMode: 'decimal',
                                    pattern: '[0-9]*[.,]?[0-9]+',
                                    onInput: validateNumericInput,
                                }}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                label="Other +/-"
                                variant="outlined"
                                fullWidth
                                name="OTHER_AMT"
                                value={formData.OTHER_AMT}
                                onKeyDown={handleKeyDownOther}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                error={Boolean(formErrors.OTHER_AMT)}
                                helperText={formErrors.OTHER_AMT || ''}
                                size="small"
                            
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Cash Advance"
                                variant="outlined"
                                fullWidth
                                name="cash_advance"
                                value={formData.cash_advance}
                                onKeyDown={handleKeyDownOther}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                error={Boolean(formErrors.cash_advance)}
                                helperText={formErrors.cash_advance || ''}
                                size="small"
                                inputProps={{
                                    inputMode: 'decimal',
                                    pattern: '[0-9]*[.,]?[0-9]+',
                                    onInput: validateNumericInput,
                                }}
                            />
                        </Grid>

                        <Grid item xs={3}>
                            <TextField
                                label="Bill Amount"
                                variant="outlined"
                                fullWidth
                                name="Bill_Amount"
                                value={formData.Bill_Amount || 0}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                                error={Boolean(formErrors.Bill_Amount)}
                                helperText={formErrors.Bill_Amount || ''}
                                size="small"
                                inputProps={{
                                    inputMode: 'decimal',
                                    pattern: '[0-9]*[.,]?[0-9]+',
                                    onInput: validateNumericInput,
                                }}
                            />
                        </Grid>
                    </Grid>

                    <div className="debitCreditNote-row">
                        <Grid container spacing={2} mt={2}>
                            <Grid item xs={2}>
                                <TextField
                                    label="TCS %"
                                    variant="outlined"
                                    fullWidth
                                    name="TCS_Rate"
                                    value={formData.TCS_Rate}
                                    onKeyDown={handleKeyDownOther}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    error={Boolean(formErrors.TCS_Rate)}
                                    helperText={formErrors.TCS_Rate || ''}
                                    size="small"
                                    inputProps={{
                                        inputMode: 'decimal',
                                        pattern: '[0-9]*[.,]?[0-9]+',
                                        onInput: validateNumericInput,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="TCS Amount"
                                    variant="outlined"
                                    fullWidth
                                    name="TCS_Amt"
                                    value={formData.TCS_Amt || 0}
                                    onKeyDown={handleKeyDownOther}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    error={Boolean(formErrors.TCS_Amt)}
                                    helperText={formErrors.TCS_Amt || ''}
                                    size="small"
                                    inputProps={{
                                        inputMode: 'decimal',
                                        pattern: '[0-9]*[.,]?[0-9]+',
                                        onInput: validateNumericInput,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="TDS %"
                                    variant="outlined"
                                    fullWidth
                                    name="TDS_Rate"
                                    value={formData.TDS_Rate}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDownOther}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    error={Boolean(formErrors.TDS_Rate)}
                                    helperText={formErrors.TDS_Rate || ''}
                                    size="small"
                                    inputProps={{
                                        inputMode: 'decimal',
                                        pattern: '[0-9]*[.,]?[0-9]+',
                                        onInput: validateNumericInput,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                <TextField
                                    label="TDS Amount"
                                    variant="outlined"
                                    fullWidth
                                    name="TDS_Amt"
                                    value={formData.TDS_Amt !== null ? formData.TDS_Amt : ""}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDownOther}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    error={Boolean(formErrors.TDS_Amt)}
                                    helperText={formErrors.TDS_Amt || ''}
                                    size="small"
                                    inputProps={{
                                        inputMode: 'decimal',
                                        pattern: '[0-9]*[.,]?[0-9]+',
                                        onInput: validateNumericInput,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={3}>
                                <TextField
                                    label="Net Payable"
                                    variant="outlined"
                                    fullWidth
                                    name="TCS_Net_Payable"
                                    value={formData.TCS_Net_Payable || 0}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                    error={Boolean(formErrors.TCS_Net_Payable)}
                                    helperText={formErrors.TCS_Net_Payable || ''}
                                    size="small"
                                    inputProps={{
                                        inputMode: 'decimal',
                                        pattern: '[0-9]*[.,]?[0-9]+',
                                        onInput: validateNumericInput,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </div>
                </div>
               
            </form>
            </div>
        </>
    );
};
export default SugarPurchase;