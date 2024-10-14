import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import GSTRateMasterHelp from "../../../Helper/GSTRateMasterHelp";
import ItemMasterHelp from "../../../Helper/SystemmasterHelp";
import BrandMasterHelp from "../../../Helper/BrandMasterHelp";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SugarSaleReturnSale.css";
import { HashLoader } from "react-spinners";
import { z } from "zod";
import PuchNoFromReturnPurchaseHelp from "../../../Helper/PuchNoFromReturnPurchaseHelp";
import PurcNoFromReturnSaleHelp from "../../../Helper/PurcNoFromReturnSaleHelp";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Validation Part Using Zod Library
const stringToNumber = z
  .string()
  .refine((value) => !isNaN(Number(value)), {
    message: "This field must be a number",
  })
  .transform((value) => Number(value));

// Validation Schemas
const SugarSaleReturnSaleSchema = z.object({
  //PURCNO: z.preprocess((val) => (val === '' ? undefined : parseFloat(val)), z.number().optional()),
  //PurcTranType: z.string().optional(),
  Ac_Code: z
  .number({
    required_error: "This field is required", // This shows when the field is empty
  })
  .refine((val) => !isNaN(val) && val !== "", {
    message: "Only numbers accepted", // This shows when the input is not a number
  }),
  
 // Unit_Code: z.preprocess((val) => (val === "" || val === null ? undefined : parseFloat(val)), z.number().optional()),

  mill_code: z
  .number({
    required_error: "This field is required", // This shows when the field is empty
  })
  .refine((val) => !isNaN(val) && val !== "", {
    message: "Only numbers accepted", // This shows when the input is not a number
  }),
  // FROM_STATION: z.string().optional(),
  // TO_STATION: z.string().optional(),
  // LORRYNO: z.string().optional(),
  // BROKER: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  // wearhouse: z.string().optional(),
  LESS_FRT_RATE: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  freight: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  cash_advance: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  bank_commission: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  OTHER_AMT: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  Bill_Amount: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  Due_Days: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  NETQNTL: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  CGSTRate: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  CGSTAmount: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  SGSTRate: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  SGSTAmount: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  IGSTRate: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  IGSTAmount: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  GstRateCode: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  // PO_Details: z.string().optional(),
  // ASN_No: z.string().optional(),
  // Eway_Bill_No: z.string().optional(),
  TCS_Rate: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  TCS_Amt: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  TCS_Net_Payable: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  // einvoiceno: z.string().optional(),
  // ackno: z.string().optional(),
  TDS_Rate: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
  TDS_Amt: z.preprocess((val) => (isNaN(parseFloat(val)) ? undefined : parseFloat(val)), z.number().optional()),
});

// Zod validation schema for the detail section
const DetailValidationSchema = z.object({
  // item_code: z.number({
  //   required_error: "Item Code is required", // Mandatory field
  // }),
  Quantal: z.number({
    required_error: "Quantal is required", // Mandatory field
  }).refine(val => val > 0, {
    message: "Quantal must be greater than 0",
  }),
  bags: z.number({
    required_error: "Bags are required", // Mandatory field
  }).refine(val => val > 0, {
    message: "Bags must be greater than 0",
  }),
  rate: z.number({
    required_error: "Rate is required", // Mandatory field
  }).refine(val => val > 0, {
    message: "Rate must be greater than 0",
  }),
  item_Amount: z.number({
    required_error: "Item Amount is required", // Mandatory field
  }).refine(val => val > 0, {
    message: "Item Amount must be greater than 0",
  }),
});



//Global Variables
var newsrid = "";
var partyName = "";
var partyCode = "";
var millName = "";
var millCode = "";
var unitName = "";
var unitCode = "";
var brokerName = "";
var brokerCode = "";
var itemName = "";
var item_Code = "";
var gstrate = "";
var gstRateCode = "";
var gstName = "";
var billToName = "";
var billToCode = "";
var TYPE = "";
var purchaseNo = "";
var transportCode = "";
var transportName = "";

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");

const SugarSaleReturnSale = () => {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [item_Name, setItemName] = useState("");
  const [itemCodeAccoid, setItemCodeAccoid] = useState("");
  const [formDataDetail, setFormDataDetail] = useState({
    narration: "",
    packing: 0,
    Quantal: "0.00",
    bags: 0,
    rate: 0.0,
    item_Amount: 0.0,
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
  const [isChecked, setIsChecked] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [purchNo, setPurchno] = useState("");
  const [saleBillDataDetails, setSaleBillDataDetials] = useState({});
  const [nextId, setNextId] = useState(1);
 

  //In utility page record doubleClicked that recod show for edit functionality
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const navigate = useNavigate();
  const setFocusTaskdate = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = {
    doc_no: "",
    PURCNO: 0,
    PurcTranType: "",
    doc_date: new Date().toISOString().split("T")[0],
    Ac_Code: 0,
    Unit_Code: 0,
    mill_code: 0,
    FROM_STATION: "",
    TO_STATION: "",
    LORRYNO: "",
    BROKER: 0,
    wearhouse: "",
    subTotal: 0.0,
    LESS_FRT_RATE: 0.0,
    freight: 0.0,
    cash_advance: 0.0,
    bank_commission: 0.0,
    OTHER_AMT: 0.0,
    Bill_Amount: 0.0,
    Due_Days: 0,
    NETQNTL: 0.0,
    Company_Code: companyCode,
    Year_Code: Year_Code,
    Branch_Code: 0,
    Created_By: "",
    Modified_By: "",
    Tran_Type: "RS",
    DO_No: 0,
    Transport_Code: 0,
    CGSTRate: 0.0,
    CGSTAmount: 0.0,
    SGSTRate: 0.0,
    SGSTAmount: 0.0,
    IGSTRate: 0.0,
    IGSTAmount: 0.0,
    GstRateCode: 0,
    purcyearcode: Year_Code,
    ac: 0,
    uc: 0,
    mc: 0,
    bc: 0,
    sbid: 0,
    bill_to: 0,
    bt: 0,
    gc: 0,
    tc: 0,
    FromAc: 0,
    fa: 0,
    PO_Details: "",
    ASN_No: "",
    Eway_Bill_No: "",
    TCS_Rate: 0.0,
    TCS_Amt: 0.0,
    TCS_Net_Payable: 0.0,
    einvoiceno: "",
    ackno: "",
    TDS_Rate: 0.0,
    TDS_Amt: 0.0,
    QRCode: "",
    IsDeleted: 0,
    gstid: 0,
    srid: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [billFrom, setBillFrom] = useState("");
  const [partyMobNo, setPartyMobNo] = useState("");
  const [billTo, setBillTo] = useState("");
  const [mill, setMill] = useState("");
  const [millname, setMillName] = useState("");
  const [millGSTNo, setMillGSTNo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [shipToMobNo, setShipToMobNo] = useState("");
  const [gstCode, setGstCode] = useState("");
  const [transport, setTransport] = useState("");
  const [transportMob, setTransportMob] = useState("");
  const [broker, setBroker] = useState("");
  const [GstRate, setGstRate] = useState(0.0);
  const [matchStatus, setMatchStatus] = useState(null);
  const [type, setType] = useState("");

  const handleChange = async (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Validate field as user types
    validateField(name, value);
    // const matchStatus = await checkMatchStatus(
    //   formData.Ac_Code,
    //   companyCode,
    //   Year_Code
    // );

    // let gstRate = GstRate;

    // if (!gstRate || gstRate === 0) {
    //   const cgstRate = parseFloat(formData.CGSTRate) || 0;
    //   const sgstRate = parseFloat(formData.SGSTRate) || 0;
    //   const igstRate = parseFloat(formData.IGSTRate) || 0;

    //   gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    // }

    // // Calculate dependent values and update form data
    // const updatedFormData = await calculateDependentValues(
    //   name,
    //   value,
    //   formData,
    //   matchStatus,
    //   gstRate
    // );

    // setFormData(updatedFormData);
    // validateField(name, value);
  };

  const handleKeyDownCalculations = async (event) => {
    if (event.key === "Tab") {
      // event.preventDefault();

      const { name, value } = event.target;

      // const matchStatus = await checkMatchStatus(
      //   formData.Ac_Code,
      //   companyCode,
      //   Year_Code
      // );

      let gstRate = GstRate;

      if (!gstRate || gstRate === 0) {
        const cgstRate = parseFloat(formData.CGSTRate) || 0;
        const sgstRate = parseFloat(formData.SGSTRate) || 0;
        const igstRate = parseFloat(formData.IGSTRate) || 0;
  
        gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
      }
  
      // Calculate dependent values and update form data
      const updatedFormData = await calculateDependentValues(
        name,
        value,
        formData,
        matchStatus,
        gstRate
      );
  
      setFormData(updatedFormData);
      validateField(name, value);
    }
  };

  

  const handleDateChange = (event, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: event.target.value,
    }));
  };
  useEffect(() => {
    if (isHandleChange) {
      handleCancel();
      setIsHandleChange(false);
    }
    setFocusTaskdate.current.focus();
  }, []);

  // Validation Part
  const validateField = (name, value) => {

    let parsedValue = value;

  // Manually convert to number if the field expects a number
  if (name === "NETQNTL" && typeof value === "string") {
    parsedValue = parseFloat(value); // Convert string to number
  }

    try {
      // Validate the specific field against the schema
      SugarSaleReturnSaleSchema.pick({ [name]: true }).parse({
        [name]: value,
      });
  
      // If no error, remove any existing errors for that field
      setFormErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    } catch (err) {
      // Check if Zod errors exist and handle them
      if (err.errors && err.errors.length > 0) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: err.errors[0].message, // Show the first error message
        }));
      } else {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "An unexpected error occurred", // Fallback error message
        }));
      }
    }
  };
  
  const validateForm = () => {
    try {
      // Parse the formData against the schema
      SugarSaleReturnSaleSchema.parse(formData);
  
      // If validation passes, clear form errors and return true
      setFormErrors({});
      return true;
    } catch (err) {
      const errors = {};
  
      // Loop through all errors returned by the schema
      err.errors.forEach((error) => {
        let errorMessage = error.message;
  
        // Customize the error message for required fields and numbers
        if (error.message.includes("required")) {
          errorMessage = "This field is required"; // Show if field is empty
        } else if (error.message.includes("number")) {
          errorMessage = "Only numbers accepted"; // Show if not a valid number
        }
  
        // Assign the error message to the corresponding field
        errors[error.path[0]] = errorMessage;
      });
  
      // Set the form errors state
      setFormErrors(errors);
      return false;
    }
  };
  
  const validateDetailForm = () => {
    try {
      // Parse the formDataDetail against the schema
      DetailValidationSchema.parse(formDataDetail);
      
      // Clear errors if validation passes
      setFormErrors({});
      return true;
    } catch (err) {
      const errors = {};
      err.errors.forEach((error) => {
        errors[error.path[0]] = error.message; // Assign the error message to the corresponding field
      });
  
      // Set form errors for the detail form
      setFormErrors(errors);
      return false;
    }
  };
  
  const fetchLastRecord = () => {
    fetch(
      `${API_URL}/getNextDocNo_SugarSaleReturnSale?Company_Code=${companyCode}&Year_Code=${Year_Code}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        setFormData({
          doc_no: data.next_doc_no,
        });
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
  };


  
  const handleAddOne = async () => {
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);
    setIsEditing(true);
    fetchLastRecord();
    setFormData(initialFormData);
    partyName = "";
    partyCode = "";
    millName = "";
    millCode = "";
    unitName = "";
    unitCode = "";
    brokerName = "";
    brokerCode = "";
    itemName = "";
    item_Code = "";
    gstrate = "";
    gstRateCode = "";
    billToName = "";
    billToCode = "";
    purchaseNo = "";
    setLastTenderDetails([]);
    setUsers([])
    setType("")
    setFormErrors({})
  };

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

  const handleSaveOrUpdate = async () => {
    if (!validateForm()) {
      toast.error("Please Check the validations");
      return;
    }
    setIsEditing(true);
    setIsLoading(true);

    

    const {
      // Bill_To,
      // Bill_No,
      // DO_No,
      // Delivery_type,
      // DoNarrtion,
      // EWayBill_Chk,
      // EWay_Bill_No,
      // EwayBillValidDate,
      // Insured,
      // IsDeleted,
      // MillInvoiceNo,
      //RateDiff,
      // RoundOff,
      // newsbdate,
      // newsbno,
      // saleid,
      // Purcid,
      // SBNarration,
      // TaxableAmount,
      // Transport_Code,
      // saleidnew,
      // bk,
      // tc,
      Bill_No,
      Bill_To,
      prid,
      purcyearcode,
      wearhouse,
      srid,
      ...filteredFormData
    } = formData;

    console.log("formData before constructing headData:", formData);

    const headData = {
      ...initialFormData,
      ...filteredFormData,
      PURCNO: purchaseNo,
      bill_to: Bill_To || formData.bill_to,

      GstRateCode: gstCode || gstRateCode,
      //   Company_Code: companyCode || saleBillDataDetails.Company_Code,
      // Year_Code: Year_Code || saleBillDataDetails.Year_Code,
      Tran_Type: "RS" || type
    };

    console.log("headData:", headData);

    if (isEditMode) {
      delete headData.srid;
    }

    console.log("Users state before API call:", users);

    const detailData = users.map((user) => {
      const isNew = !user.detail_id; // If there's no detail_id, it's a new entry
      console.log("Mapping user:", user, "isNew:", isNew); // Log each user and whether it's new

      return {
        rowaction: isNew ? "add" : user.rowaction || "Normal",
        srdtid: user.srdtid,
        item_code: user.item_code,
        Quantal: parseFloat(user.Quantal) || 0,
        ic: user.ic || itemCodeAccoid,
        detail_id: isNew
          ? (Math.max(...users.map((u) => u.detail_id || 0)) || 0) + 1
          : user.detail_id,
        Company_Code: companyCode,
        Year_Code: Year_Code,
        narration: user.narration || "",
        packing: user.packing || 0.0,
        bags: user.bags || 0.0,
        rate: parseFloat(user.rate) || 0.0,
        item_Amount: parseFloat(user.item_Amount) || 0.0,
        Branch_Code: user.Branch_Code || null,
      };
    });

    const requestData = {
      headData,
      detailData,
    };

    console.log("Request Data:", requestData);

    try {

      
      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update-sugarsalereturn?srid=${newsrid}`;
        const response = await axios.put(updateApiUrl, requestData);
        toast.success("Data updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const response = await axios.post(
          `${API_URL}/create-sugarsalereturn`,
          requestData
        );
        toast.success("Data saved successfully!");
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
        }, 1000);
      }
    } catch (err) {
    } finally {
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this Task No ${formData.doc_no}?`
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
        const deleteApiUrl = `${API_URL}/delete-sugarsalereturn?srid=${newsrid}&Company_Code=${companyCode}&doc_no=${formData.doc_no}&Year_Code=${Year_Code}&tran_type=${formData.Tran_Type}`;
        const response = await axios.delete(deleteApiUrl);

        if (response.status === 200) {
          toast.success("Data delete successfully!!");
          handleCancel();
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
        setIsLoading(false);
      }
    } else {
      console.log("Deletion cancelled");
    }
  };

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
        `${API_URL}/get-last-sugarsalereturn?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("Full Response Data:", data);

        const { last_head_data, detail_data, last_labels_data } = data;

        // Ensure detail_data is an array
        const detailsArray = Array.isArray(detail_data) ? detail_data : [];

        newsrid = last_head_data.srid;
        purchaseNo = last_head_data.PURCNO;
        partyName = last_labels_data[0].partyname;
        partyCode = last_head_data.Ac_Code;
        unitName = last_labels_data[0].unitname;
        unitCode = last_head_data.Unit_Code;
        billToName = last_labels_data[0].billtoname;
        billToCode = last_head_data.bill_to;
        gstRateCode = last_head_data.GstRateCode;
        gstName = last_labels_data[0].GSTName;
        millName = last_labels_data[0].millname;
        millCode = last_head_data.mill_code;
        itemName = last_labels_data[0].itemname;
        item_Code = detail_data.item_code;
        brokerCode = last_head_data.BROKER;
        brokerName = last_labels_data[0].brokername;
        transportCode = last_head_data.Transport_Code;
        transportName = last_labels_data[0].transportname;

        const itemNameMap = last_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        // Enrich detail_data with itemname
        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

        // Log enriched details
        console.log("Enriched Details:", enrichedDetails);

        // Updating state
        setFormData((prevData) => ({
          ...prevData,
          ...last_head_data,
        }));
        setLastTenderData(last_head_data || {});
        setType(last_head_data.Tran_Type)
        setLastTenderDetails(enrichedDetails);
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

  const handleBack = () => {
    navigate("/sugar-sale-return-sale-utility");
  };

  const handleFirstButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-first-sugarsalereturn?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const data = response.data;
        const { first_head_data, detail_data, first_labels_data } = data;

        // Ensure detail_data is an array
        const detailsArray = Array.isArray(detail_data) ? detail_data : [];

        newsrid = first_head_data.srid;
        partyName = first_labels_data[0].partyname;
        partyCode = first_head_data.Ac_Code;
        unitName = first_labels_data[0].unitname;
        unitCode = first_head_data.Unit_Code;
        billToName = first_labels_data[0].billtoname;
        billToCode = first_head_data.bill_to;
        gstRateCode = first_head_data.GstRateCode;
        gstName = first_labels_data[0].GSTName;
        millName = first_labels_data[0].millname;
        millCode = first_head_data.mill_code;
        itemName = first_labels_data[0].itemname;
        item_Code = detail_data.item_code;
        brokerCode = first_head_data.BROKER;
        brokerName = first_labels_data[0].brokername;
        purchaseNo = first_head_data.PURCNO

        // Create a mapping for itemname based on item_code
        const itemNameMap = first_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        // Enrich detail_data with itemname
        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

        // Log enriched details
        console.log("Enriched Details:", enrichedDetails);

        // Updating state
        setFormData((prevData) => ({
          ...prevData,
          ...first_head_data,
        }));
        setLastTenderData(first_head_data || {});
        setLastTenderDetails(enrichedDetails);
        setType(first_head_data.Tran_Type);
      } else {
        console.error(
          "Failed to fetch first tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handleNextButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-next-sugarsalereturn?Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${formData.doc_no}`
      );
      if (response.status === 200) {
        const data = response.data;
        const { next_head_data, detail_data, next_labels_data } = data;

        // Ensure detail_data is an array
        const detailsArray = Array.isArray(detail_data) ? detail_data : [];

        newsrid = next_head_data.srid;
        partyName = next_labels_data[0].partyname;
        partyCode = next_head_data.Ac_Code;
        unitName = next_labels_data[0].unitname;
        unitCode = next_head_data.Unit_Code;
        billToName = next_labels_data[0].billtoname;
        billToCode = next_head_data.bill_to;
        gstRateCode = next_head_data.GstRateCode;
        gstName = next_labels_data[0].GSTName;
        millName = next_labels_data[0].millname;
        millCode = next_head_data.mill_code;
        itemName = next_labels_data[0].itemname;
        item_Code = detail_data.item_code;
        brokerCode = next_head_data.BROKER;
        brokerName = next_labels_data[0].brokername;
        purchaseNo = next_head_data.purchNo;

        // Create a mapping for itemname based on item_code
        const itemNameMap = next_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        // Enrich detail_data with itemname
        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

        // Log enriched details
        console.log("Enriched Details:", enrichedDetails);

        // Updating state
        setFormData((prevData) => ({
          ...prevData,
          ...next_head_data,
        }));
        setLastTenderData(next_head_data || {});
        setType(next_head_data.Tran_Type)
        setLastTenderDetails(enrichedDetails);
      } else {
        console.error(
          "Failed to fetch next tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handlePreviousButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-previous-sugarsalereturn?Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${formData.doc_no}`
      );

      if (response.status === 200) {
        const data = response.data;
        const { previous_head_data, detail_data, previous_labels_data } = data;

        // Ensure detail_data is an array
        const detailsArray = Array.isArray(detail_data) ? detail_data : [];

        newsrid = previous_head_data.srid;
        partyName = previous_labels_data[0].partyname;
        partyCode = previous_head_data.Ac_Code;
        unitName = previous_labels_data[0].unitname;
        unitCode = previous_head_data.Unit_Code;
        billToName = previous_labels_data[0].billtoname;
        billToCode = previous_head_data.bill_to;
        gstRateCode = previous_head_data.GstRateCode;
        gstName = previous_labels_data[0].GSTName;
        millName = previous_labels_data[0].millname;
        millCode = previous_head_data.mill_code;
        itemName = previous_labels_data[0].itemname;
        item_Code = detail_data.item_code;
        brokerCode = previous_head_data.BROKER;
        brokerName = previous_labels_data[0].brokername;
        purchaseNo = previous_head_data.PURCNO

        // Create a mapping for itemname based on item_code
        const itemNameMap = previous_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        // Enrich detail_data with itemname
        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

        // Log enriched details
        console.log("Enriched Details:", enrichedDetails);

        // Updating state
        setFormData((prevData) => ({
          ...prevData,
          ...previous_head_data,
        }));
        setLastTenderData(previous_head_data || {});
        setType(previous_head_data.Tran_Type);
        setLastTenderDetails(enrichedDetails);
      } else {
        console.error(
          "Failed to fetch previous tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

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

  const handlerecordDoubleClicked = async () => {
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
      console.log(selectedRecord);
      const response = await axios.get(
        `${API_URL}/getsugarsalereturnByid?doc_no=${selectedRecord.doc_no}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const data = response.data;
        const { last_head_data, detail_data, last_labels_data } = data;

        // Ensure detail_data is an array
        const detailsArray = Array.isArray(detail_data) ? detail_data : [];

        newsrid = last_head_data.srid;
        partyName = last_labels_data[0].partyname;
        partyCode = last_head_data.Ac_Code;
        unitName = last_labels_data[0].unitname;
        unitCode = last_head_data.Unit_Code;
        billToName = last_labels_data[0].billtoname;
        billToCode = last_head_data.bill_to;
        gstRateCode = last_head_data.GstRateCode;
        gstName = last_labels_data[0].GSTName;
        millName = last_labels_data[0].millname;
        millCode = last_head_data.mill_code;
        itemName = last_labels_data[0].itemname;
        item_Code = detail_data.item_code;
        brokerCode = last_head_data.BROKER;
        brokerName = last_labels_data[0].brokername;
        purchaseNo = last_head_data.PURCNO
        // Create a mapping for itemname based on item_code
        const itemNameMap = last_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        // Enrich detail_data with itemname
        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

        // Log enriched details
        console.log("Enriched Details:", enrichedDetails);

        // Updating state
        setFormData((prevData) => ({
          ...prevData,
          ...last_head_data,
        }));
        setLastTenderData(last_head_data || {});
        setType(last_head_data.Tran_Type)
        setLastTenderDetails(enrichedDetails);
      } else {
        console.error(
          "Failed to fetch last tender data:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Tab") {
      const changeNoValue = event.target.value;
      try {
        const response = await axios.get(
          `${API_URL}/getsugarsalereturnByid?doc_no=${changeNoValue}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
        );
        const data = response.data;
        const { last_head_data, detail_data, last_labels_data } = data;

        // Ensure detail_data is an array
        const detailsArray = Array.isArray(detail_data) ? detail_data : [];

        newsrid = last_head_data.srid;
        partyName = last_labels_data[0].partyname;
        partyCode = last_head_data.Ac_Code;
        unitName = last_labels_data[0].unitname;
        unitCode = last_head_data.Unit_Code;
        billToName = last_labels_data[0].billtoname;
        billToCode = last_head_data.bill_to;
        gstRateCode = last_head_data.GstRateCode;
        gstName = last_labels_data[0].GSTName;
        millName = last_labels_data[0].millname;
        millCode = last_head_data.mill_code;
        itemName = last_labels_data[0].itemname;
        item_Code = detail_data.item_code;
        brokerCode = last_head_data.BROKER;
        brokerName = last_labels_data[0].brokername;
        purchaseNo = last_head_data.PURCNO

        // Create a mapping for itemname based on item_code
        const itemNameMap = last_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        // Enrich detail_data with itemname
        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

        // Log enriched details
        console.log("Enriched Details:", enrichedDetails);

        // Updating state
        setFormData((prevData) => ({
          ...prevData,
          ...last_head_data,
        }));
        setLastTenderData(last_head_data || {});
        setLastTenderDetails(enrichedDetails);
        setIsEditing(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const checkMatchStatus = async (ac_code, company_code, year_code) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API}/get_match_status`,
        {
          params: {
            Ac_Code: ac_code,
            Company_Code: company_code,
            Year_Code: year_code,
          },
        }
      );
      return data.match_status;
    } catch (error) {
      console.error("Couldn't able to match GST State Code:", error);
      return error;
    }
  };

  useEffect(() => {
    if (!isChecked) {
      fetchCompanyGSTCode(companyCode);
    }
  }, [isChecked, companyCode]);

  const fetchCompanyGSTCode = async (company_code) => {
    try {
      const { data } = await axios.get(
        `http://localhost:8080/get_company_by_code?company_code=${company_code}`
      );
      setGstNo(data.GST);
    } catch (error) {
      toast.error("Error while fetching company GST No.");
      console.error("Error:", error);
      setGstNo("");
    }
  };

  const calculateTotalItemAmount = (users) => {
    return users
      .filter((user) => user.rowaction !== "delete" && user.rowaction !== "DNU")
      .reduce((sum, user) => sum + parseFloat(user.item_Amount || 0), 0);
  };

  // const calculateRateDiffAmount = () => {
  //   const NETQNTL = Number(formData.NETQNTL);
  //   const RateDiff = Number(formData.RateDiff);
  //   return !isNaN(NETQNTL) && !isNaN(RateDiff) ? NETQNTL * RateDiff : 0;
  // };

  const calculateDependentValues = async (
    name,
    input,
    formData,
    matchStatus,
    gstRate
  ) => {
    // Clone the formData and update the specific field
    const updatedFormData = { ...formData, [name]: input };

    // Parsing and handling potential NaN values by defaulting to 0
    const subtotal = parseFloat(updatedFormData.subTotal) || 0.0;
    const rate = parseFloat(gstRate) || 0.0;
    const netQntl = parseFloat(updatedFormData.NETQNTL) || 0.0;
    const freightRate = parseFloat(updatedFormData.LESS_FRT_RATE) || 0.0;
    const miscAmount = parseFloat(updatedFormData.OTHER_AMT) || 0.0;
    const cashAdvance = parseFloat(updatedFormData.cash_advance) || 0.0;
    const bankCommission = parseFloat(updatedFormData.bank_commission) || 0.0;
    const tcsRate = parseFloat(updatedFormData.TCS_Rate) || 0.0;
    const tdsRate = parseFloat(updatedFormData.TDS_Rate) || 0.0;

    // Calculating freight
    updatedFormData.freight = (netQntl * freightRate).toFixed(2);

    // Setting GST rates and amounts based on matchStatus
    if (matchStatus === "TRUE") {
      updatedFormData.CGSTRate = (rate / 2).toFixed(2);
      updatedFormData.SGSTRate = (rate / 2).toFixed(2);
      updatedFormData.IGSTRate = 0.0;

      updatedFormData.CGSTAmount = (
        (subtotal * parseFloat(updatedFormData.CGSTRate)) /
        100
      ).toFixed(2);
      updatedFormData.SGSTAmount = (
        (subtotal * parseFloat(updatedFormData.SGSTRate)) /
        100
      ).toFixed(2);
      updatedFormData.IGSTAmount = 0.0;
    } else {
      updatedFormData.IGSTRate = rate.toFixed(2);
      updatedFormData.CGSTRate = 0.0;
      updatedFormData.SGSTRate = 0.0;

      updatedFormData.IGSTAmount = (
        (subtotal * parseFloat(updatedFormData.IGSTRate)) /
        100
      ).toFixed(2);
      updatedFormData.CGSTAmount = 0.0;
      updatedFormData.SGSTAmount = 0.0;
    }

    // Calculating the Bill Amount
    updatedFormData.Bill_Amount = (
      subtotal +
      parseFloat(updatedFormData.CGSTAmount) +
      parseFloat(updatedFormData.SGSTAmount) +
      parseFloat(updatedFormData.IGSTAmount) +
      miscAmount +
      parseFloat(updatedFormData.freight) +
      bankCommission +
      cashAdvance
    ).toFixed(2);

    // Calculating TCS and Net Payable
    updatedFormData.TCS_Amt = (
      (parseFloat(updatedFormData.Bill_Amount) * tcsRate) /
      100
    ).toFixed(2);

    updatedFormData.TCS_Net_Payable = (
      parseFloat(updatedFormData.Bill_Amount) +
      parseFloat(updatedFormData.TCS_Amt)
    ).toFixed(2);

    // Calculating TDS
    updatedFormData.TDS_Amt = ((subtotal * tdsRate) / 100).toFixed(2);

    return updatedFormData;
  };

  const saleBillHeadData = (data) => {
    console.log("saleBillHeadData",data);

    partyCode = data.Ac_Code || "";
    unitCode = data.Unit_Code || "";
    billToCode = data.Bill_To || "";
    gstRateCode = data.GstRateCode || "";
    millCode = data.mill_code || "";
    brokerCode = data.BROKER || "";
    purchaseNo = data.doc_no || "";

    console.log("BillTo", billToCode)

    // Update form data with new values
    setFormData((prevData) => {
      // Avoid overwriting entire data, spread necessary fields and exclude unwanted ones
      const { doc_no, doc_date, ...remainingData } = data;

      return {
        ...prevData,
        ...remainingData,
        bc: data.bk || prevData.bc,
      };
    });

    // Store the received sale bill head data for further use
    setLastTenderData(data || {});
    setLastTenderDetails(data.details_data || []); // Only update if details_data is available
  };

  // const saleBillDetailData = (details) => {
  //   console.log("Sale Bill Details Received:", details);

  //   // Extract necessary details like partyName, unitName, etc.
  //   partyName = details.partyname;
  //   unitName = details.unitname;
  //   billToName = details.billtoname;
  //   gstName = details.GSTName;
  //   millName = details.millname;
  //   itemName = details.itemname;
  //   brokerName = details.brokername;

  //   // Extract existing detail_ids from users
  //   const existingDetailIds = users.map(user => user.detail_id).filter(id => id != null);

  //   // Determine if the current detail is an existing entry
  //   const isExisting = users.some(user => user.detail_id === details.detail_id);

  //   // Assign a new detail_id if it's a new entry
  //   const newDetailId = existingDetailIds.length > 0 ? Math.max(...existingDetailIds) + 1 : 1;

  //   // Assign a unique id for rendering purposes
  //   const newUserId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;

  //   // Prepare the new detail data to be added or updated
  //   const newDetailData = {
  //     item_code: details.item_code || 0,
  //     itemname: details.itemname || "Unknown Item",
  //     id: newUserId,  // Ensure id is assigned here for rendering in JSX
  //     ic: details.ic || 0,
  //     narration: details.narration || "",
  //     Quantal: parseFloat(details.Quantal) || 0,
  //     bags: details.bags || 0,
  //     packing: details.packing || 0,
  //     rate: parseFloat(details.rate) || 0,
  //     item_Amount: parseFloat(details.item_Amount) || 0,
  //     detail_id: isExisting ? details.detail_id : newDetailId,
  //     rowaction: isExisting ? "update" : "add",
  //     ...(isExisting && details.srdtid ? { srdtid: details.srdtid } : {}),
  //   };

  //   console.log("New Detail Data Before State Update:", newDetailData);

  //   // Update the state
  //   setUsers((prevUsers) => {
  //     const updatedUsers = isExisting
  //       ? prevUsers.map(user => user.detail_id === details.detail_id ? newDetailData : user)
  //       : [...prevUsers, newDetailData];

  //     return [...updatedUsers];  // Return a new array to ensure re-render
  //   });
  // };

  const saleBillDetailData = (details) => {
    debugger;
    console.log("Sale Bill Details Received:", details);

    if (!details || Object.keys(details).length === 0) {
      console.error("No details provided to saleBillDetailData");
      return;
    }

    // Extract necessary details like partyName, unitName, etc.
    partyName = details.partyname;
    unitName = details.unitname;
    billToName = details.billtoname;
    gstName = details.GSTName;
    millName = details.millname;
    itemName = details.itemname;
    brokerName = details.brokername;

    // Extract existing detail_ids from users
    const existingDetailIds = users
      .map((user) => user.detail_id)
      .filter((id) => id != null);

    // Determine if the current detail is an existing entry
    const isExisting = users.some(
      (user) => user.detail_id === details.detail_id
    );

    // Assign a new detail_id if it's a new entry
    const newDetailId =
      existingDetailIds.length > 0 ? Math.max(...existingDetailIds) + 1 : 1;

    // Assign a unique id for rendering purposes
    const newUserId =
      users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;

    // Prepare the new detail data to be added or updated
    const newDetailData = {
      item_code: details.item_code || 0,
      item_Name: details.itemname || "Unknown Item",
      id: newUserId, // Ensure id is assigned here for rendering in JSX
      ic: details.ic || 0,
      narration: details.narration || "",
      Quantal: parseFloat(details.Quantal) || 0,
      bags: details.bags || 0,
      packing: details.packing || 0,
      rate: parseFloat(details.rate) || 0,
      item_Amount: parseFloat(details.item_Amount) || 0,
      detail_id: isExisting ? details.detail_id : newDetailId,
      rowaction: isExisting ? "update" : "add",
      ...(isExisting && details.srdtid ? { srdtid: details.srdtid } : {}),
    };

    console.log("New Detail Data Before State Update:", newDetailData);

    setUsers((prevUsers) => [...prevUsers, newDetailData]);

    setLastTenderData(newDetailData);
  };

  useEffect(() => {
    if (selectedRecord) {
      setUsers(
        lastTenderDetails.map((detail) => ({
          item_code: detail.item_code,
          item_Name: detail.item_Name,
          rowaction: "Normal",

          ic: detail.ic,
          id: detail.srdtid,
          srdtid: detail.srdtid,
          narration: detail.narration,
          Quantal: detail.Quantal,
          bags: detail.bags,
          packing: detail.packing,
          rate: detail.rate,
          item_Amount: detail.item_Amount,
          detail_id: detail.srdtid,
        }))
      );
    }
  }, [selectedRecord, lastTenderDetails]);

  // useEffect(() => {
  //   debugger;
  //   const updatedUsers = lastTenderDetails.map((detail) => ({
  //     id: detail.srdtid,
  //     srdtid: detail.srdtid,
  //     narration: detail.narration,
  //     Quantal: detail.Quantal,
  //     bags: detail.bags,
  //     packing: detail.packing,
  //     rate: detail.rate,
  //     item_Amount: detail.item_Amount,
  //     item_code: detail.item_code,
  //     item_Name: detail.itemname,
  //     ic: detail.ic,
  //     rowaction: "Normal",
  //     detail_id: detail.srdtid,
  //   }));
  //   setUsers(updatedUsers);
  //   console.log(updatedUsers);
  // }, [lastTenderDetails]);

  useEffect(() => {
    if (lastTenderDetails.length > 0) {
      const updatedUsers = lastTenderDetails.map((detail) => {
        // Find existing user with the same detail_id in the current users
        const existingUser = users.find(
          (user) => user.detail_id === detail.srdtid
        );

        // Merge the existing user with the new detail data or create new if not found
        return {
          id: detail.srdtid,
          srdtid: detail.srdtid,
          narration: detail.narration || existingUser?.narration || "",
          Quantal: detail.Quantal || existingUser?.Quantal || 0,
          bags: detail.bags || existingUser?.bags || 0,
          packing: detail.packing || existingUser?.packing || 0,
          rate: detail.rate || existingUser?.rate || 0.0,
          item_Amount: detail.item_Amount || existingUser?.item_Amount || 0.0,
          item_code: detail.item_code || existingUser?.item_code || "",
          item_Name: detail.itemname || existingUser?.item_Name || "",
          ic: detail.ic || existingUser?.ic || 0,
          rowaction: existingUser?.rowaction || "Normal",
          detail_id: detail.srdtid,
        };
      });

      setUsers(updatedUsers);
      console.log("Updated users:", updatedUsers);
    }
  }, [lastTenderDetails]);

  const calculateDetails = (quantal, packing, rate) => {
    const bags = packing !== 0 ? (quantal / packing) * 100 : 0;
    const item_Amount = quantal * rate;
    return { bags, item_Amount };
  };

  const calculateNetQuantal = (users) => {
    return users
      .filter((user) => user.rowaction !== "delete" && user.rowaction !== "DNU")
      .reduce((sum, user) => sum + parseFloat(user.Quantal || 0), 0);
  };

  const handleChangeDetail = (event) => {
    const { name, value } = event.target;
    setFormDataDetail((prevDetail) => {
      const updatedDetail = {
        ...prevDetail,
        [name]:
          name === "packing" || name === "bags"
            ? parseInt(value) || 0
            : parseFloat(value) || value,
      };

      setFormErrors({})

      const { Quantal, packing, rate } = updatedDetail;
      const { bags, item_Amount } = calculateDetails(Quantal, packing, rate);

      updatedDetail.bags = bags;
      updatedDetail.item_Amount = item_Amount;

      return updatedDetail;
    });
  };

  const sugarSaleReturnSale = async (
    totalAmount,
    totalQuintal,
    selectedItems
  ) => {
    selectedItems.forEach(async (details) => {
      const millName = details.MillName;
      const itemName = details.ItemName;

      // Determine if the detail is new or existing based on `detail_id`
      const isExisting = users.some(
        (user) => user.detail_id === details.detail_id
      );

      // Create new or updated detail data
      const newDetailData = {
        ...formDataDetail, // Spread the form data details if needed
        item_code: details.item_code || 0,
        itemname: itemName || "Unknown Item",
        id:
          users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
        ic: details.ic || 0,
        narration: details.narration || "",
        Quantal: parseFloat(totalQuintal) || 0,
        bags: parseFloat(totalQuintal)/50 * 100 ,
        packing:50,
        rate: parseFloat(details.rate) || 0,
        item_Amount: parseFloat(totalAmount) || 0,
        rowaction: isExisting ? "update" : "add",
        detail_id: isExisting
          ? details.detail_id
          : users.length > 0
          ? Math.max(...users.map((user) => user.detail_id || 0)) + 1
          : 1,
      };

      // Update or add to `users` state
      const updatedUsers = isExisting
        ? users.map((user) =>
            user.detail_id === details.detail_id ? newDetailData : user
          )
        : [...users, newDetailData];

      setUsers(updatedUsers);

      // Calculate net quantal and subtotal
      const netQuantal = calculateNetQuantal(updatedUsers);
      const subtotal = calculateTotalItemAmount(updatedUsers);

      // Update form data with calculated values
      let updatedFormData = {
        ...formData,
        NETQNTL: parseFloat(netQuantal),
        subTotal: parseFloat(subtotal),
        PURCNO: 0
      };

      // Check match status and calculate GST rate
      const matchStatus = await checkMatchStatus(
        updatedFormData.Ac_Code,
        companyCode,
        Year_Code
      );

      let gstRate = GstRate;
      if (!gstRate || gstRate === 0) {
        const cgstRate = parseFloat(formData.CGSTRate) || 0;
        const sgstRate = parseFloat(formData.SGSTRate) || 0;
        const igstRate = parseFloat(formData.IGSTRate) || 0;
        gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
      }

      // Calculate dependent values based on GST rate
      updatedFormData = await calculateDependentValues(
        "GstRateCode",
        gstRate,
        updatedFormData,
        matchStatus,
        gstRate
      );

      // Update form data state
      setFormData(updatedFormData);

      // Optional: close the popup if needed
      // closePopup();
    });
  };

  const addUser = async () => {
    if (!validateDetailForm()) {
      toast.error("Please fix the errors before adding.");
      return;
    }
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      item_code: itemCode,
      item_Name: item_Name,
      ic: itemCodeAccoid,

      ...formDataDetail,
      rowaction: "add",
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    const netQuantal = calculateNetQuantal(updatedUsers);

    const subtotal = calculateTotalItemAmount(updatedUsers);
    let updatedFormData = {
      ...formData,
      NETQNTL: netQuantal,
      subTotal: subtotal,
    };

    const matchStatus = await checkMatchStatus(
      updatedFormData.Ac_Code,
      companyCode,
      Year_Code
    );
    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.CGSTRate) || 0;
      const sgstRate = parseFloat(formData.SGSTRate) || 0;
      const igstRate = parseFloat(formData.IGSTRate) || 0;

      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "GstRateCode",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
    );

    setFormData(updatedFormData);

    closePopup();
  };

  const updateUser = async () => {
    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        const updatedRowaction =
          user.rowaction === "Normal" ? "update" : user.rowaction;
        return {
          ...user,

          item_code: itemCode,
          item_Name: item_Name,
          packing: formDataDetail.packing,
          bags: formDataDetail.bags,
          Quantal: formDataDetail.Quantal,
          rate: formDataDetail.rate,
          item_Amount: formDataDetail.item_Amount,
          narration: formDataDetail.narration,
          rowaction: updatedRowaction,
        };
      } else {
        return user;
      }
    });

    setUsers(updatedUsers);

    const netQuantal = calculateNetQuantal(updatedUsers);

    const subtotal = calculateTotalItemAmount(updatedUsers);

    let updatedFormData = {
      ...formData,
      NETQNTL: netQuantal,
      subTotal: subtotal,
    };
    const matchStatus = await checkMatchStatus(
      updatedFormData.Ac_Code,
      companyCode,
      Year_Code
    );

    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.CGSTRate) || 0;
      const sgstRate = parseFloat(formData.SGSTRate) || 0;
      const igstRate = parseFloat(formData.IGSTRate) || 0;

      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "GstRateCode", // Pass the name of the field being changed
      gstRate, // Pass the correct gstRate
      updatedFormData,
      matchStatus,
      gstRate // Pass gstRate explicitly to calculateDependentValues
    );

    setFormData(updatedFormData);

    closePopup();
  };

  const deleteModeHandler = async (user) => {
    let updatedUsers;
    if (isEditMode && user.rowaction === "add") {
      setDeleteMode(true);
      setSelectedUser(user);
      console.log("selectedUser", selectedUser);
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    } else if (isEditMode) {
      setDeleteMode(true);
      setSelectedUser(user);
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "delete" } : u
      );
    } else {
      setDeleteMode(true);
      setSelectedUser(user);
      console.log("selectedUser", selectedUser);
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    }
    setUsers(updatedUsers);
    setSelectedUser({});

    const netQuantal = calculateNetQuantal(updatedUsers);

    const subtotal = calculateTotalItemAmount(updatedUsers);
    let updatedFormData = {
      ...formData,
      NETQNTL: netQuantal,
      subTotal: subtotal,
    };

    const matchStatus = await checkMatchStatus(
      updatedFormData.Ac_Code,
      companyCode,
      Year_Code
    );

    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.CGSTRate) || 0;
      const sgstRate = parseFloat(formData.SGSTRate) || 0;
      const igstRate = parseFloat(formData.IGSTRate) || 0;

      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "GstRateCode", // Pass the name of the field being changed
      gstRate, // Pass the correct gstRate
      updatedFormData,
      matchStatus,
      gstRate // Pass gstRate explicitly to calculateDependentValues
    );

    setFormData(updatedFormData);
  };

  const openDelete = async (user) => {
    setDeleteMode(true);
    setSelectedUser(user);
    let updatedUsers;
    if (isEditMode && user.rowaction === "delete") {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "Normal" } : u
      );
    } else {
      updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, rowaction: "add" } : u
      );
    }
    setUsers(updatedUsers);
    setSelectedUser({});

    const netQuantal = calculateNetQuantal(updatedUsers);

    const subtotal = calculateTotalItemAmount(updatedUsers);
    let updatedFormData = {
      ...formData,
      NETQNTL: netQuantal,
      subTotal: subtotal,
    };

    const matchStatus = await checkMatchStatus(
      updatedFormData.Ac_Code,
      companyCode,
      Year_Code
    );

    let gstRate = GstRate;
    if (!gstRate || gstRate === 0) {
      const cgstRate = parseFloat(formData.CGSTRate) || 0;
      const sgstRate = parseFloat(formData.SGSTRate) || 0;
      const igstRate = parseFloat(formData.IGSTRate) || 0;

      gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
    }

    updatedFormData = await calculateDependentValues(
      "GstRateCode", // Pass the name of the field being changed
      gstRate, // Pass the correct gstRate
      updatedFormData,
      matchStatus,
      gstRate // Pass gstRate explicitly to calculateDependentValues
    );

    setFormData(updatedFormData);
  };

  const openPopup = (mode) => {
    setPopupMode(mode);
    setShowPopup(true);
    if (mode === "add") {
      clearForm();
      setFormErrors({})
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedUser({});
    clearForm();
    setFormErrors({})
  };

  const clearForm = () => {
    setFormDataDetail({
      narration: "",
      packing: 0,
      Quantal: 0.0,
      bags: 0,
      rate: 0.0,
      item_Amount: 0.0,
    });
    setItemCode("");
    setItemName("");
  };

  const editUser = (user) => {
    setSelectedUser(user);
    console.log("selectedUser", selectedUser);
    setItemCode(user.item_code);
    setItemName(user.item_Name);

    setFormDataDetail({
      narration: user.narration || "",
      packing: user.packing || 0,
      Quantal: user.Quantal || 0.0,
      bags: user.bags || 0,
      rate: user.rate || 0.0,
      item_Amount: user.item_Amount || 0.0,
    });
    openPopup("edit");
  };

  const handleItemCode = (code, accoid, hsn, name) => {
    setFormErrors({})
    setItemCode(code);
    setItemName(name);
    setItemCodeAccoid(accoid);
   
  };

  //Head Section help Functions to manage the Ac_Code and accoid
  const handleBillFrom = async (code, accoid, name, mobileNo) => {
    setBillFrom(code);
    setPartyMobNo(mobileNo);
    let updatedFormData = {
      ...formData,
      Ac_Code: code,
      ac: accoid,
    };
    console.log(mobileNo);
    try {
      const matchStatusResult = await checkMatchStatus(
        code,
        companyCode,
        Year_Code
      );
      setMatchStatus(matchStatusResult);

      if (matchStatusResult === "TRUE") {
        toast.success("GST State Codes match!");
      } else {
        toast.warn("GST State Codes do not match.");
      }

      let gstRate = GstRate;

      if (!gstRate || gstRate === 0) {
        const cgstRate = parseFloat(formData.CGSTRate) || 0;
        const sgstRate = parseFloat(formData.SGSTRate) || 0;
        const igstRate = parseFloat(formData.IGSTRate) || 0;

        gstRate = igstRate > 0 ? igstRate : cgstRate + sgstRate;
      }

      // Perform the calculation after setting BillFrom
      updatedFormData = await calculateDependentValues(
        "GstRateCode",
        GstRate,
        updatedFormData,
        matchStatusResult,
        gstRate
      );
      setFormData(updatedFormData);
    } catch (error) {
      console.error("Error in handleBillFrom:", error);
    }
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      Ac_Code: "", // Clear the error for this field
    }));
  };
  const handlePurchaseNo = (purchaseNo, type) => {
    setPurchno(purchaseNo);
    setType(type);
    setFormData({
      ...formData,
       PURCNO: purchaseNo,
       Tran_Type: type,
    });
  };

  const handleBillTo = (code, accoid) => {
    setBillTo(code);
    setFormData({
      ...formData,
      bill_to: code,
      bt: accoid,
    });
  };

  const handleMillData = (code, accoid, name, mobileNo, gstno) => {
    setMill(code);
    setMillName(name);
    setMillGSTNo(gstno);
    console.log(gstno);
    console.log(gstno);
    setFormData({
      ...formData,
      mill_code: code,
      mc: accoid,
    });
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      mill_code: "", 
    }));
  };

  const handleShipTo = (code, accoid, name, Mobile_No) => {
    setShipTo(code);
    setShipToMobNo(Mobile_No);
    setFormData({
      ...formData,
      Unit_Code: code,
      uc: accoid,
    });
  };

  const handleTransport = (code, accoid, name, Mobile_No) => {
    setTransport(code);
    setFormData({
      ...formData,
      Transport_Code: code,
      tc: accoid,
    });
  };

  const handleGstCode = async (code, Rate) => {
    setGstCode(code);
    let rate = parseFloat(Rate);
    setFormData({
      ...formData,
      GstRateCode: code,
    });
    setGstRate(rate);

    const updatedFormData = {
      ...formData,
      GstRateCode: code,
    };

    try {
      const matchStatusResult = await checkMatchStatus(
        updatedFormData.Ac_Code,
        companyCode,
        Year_Code
      );
      setMatchStatus(matchStatusResult);

      // Calculate the dependent values based on the match status
      const newFormData = await calculateDependentValues(
        "GstRateCode",
        rate,
        updatedFormData,
        matchStatusResult, // Use the matchStatusResult
        rate // Explicitly pass the gstRate
      );

      setFormData(newFormData);
    } catch (error) {}
  };

  const handleBroker = (code, accoid) => {
    setBroker(code);
    setFormData({
      ...formData,
      BROKER: code,
      bc: accoid || saleBillDataDetails.bk,
    });
  };

  const handlePrint = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
      });

      // Setting the font size for the text
      pdf.setFontSize(10);

      // Header section
      pdf.text(`Salary No:`, 15, 10);
      pdf.text(`Employee Code: ${cancelButtonClicked}`, 15, 15);
      pdf.text(`Employee Name: ${cancelButtonClicked}`, 15, 20);
      pdf.text(`Salary Date: `, pdf.internal.pageSize.width - 80, 10);
      pdf.text(
        `Days In Month: ${cancelButtonClicked}`,
        pdf.internal.pageSize.width - 80,
        15
      );

      // Add data from the API to the PDF
      const apiData = {}; // Replace with your actual API data
      Object.keys(apiData).forEach((key, index) => {
        const value = apiData[key];
        pdf.text(`${key}: ${value}`, 15, 25 + index * 5);
      });

      // Add table headers
      const headers = [
        "Late(min)",
        "Day",
        "Date",
        "D/HRS",
        "R/HRS",
        "PDS",
        "Deduction",
        ...Array.from({ length: 5 }, (_, idx) => [
          `In ${idx + 1}`,
          `Out ${idx + 1}`,
        ]).flat(),
      ];

      // Example data to be added to the table
      const data = [
        [15, "Mon", "2024-08-01", "8H", "7H", "PDS1", "$10"],
        [10, "Tue", "2024-08-02", "8H", "7H", "PDS2", "$8"],
      ];

      // Using autoTable plugin to add the table
      pdf.autoTable({
        head: [headers],
        body: data,
        startY: 30,
      });

      // Summary information
      const finalY = pdf.autoTable.previous.finalY;
      pdf.setFontSize(10);
      pdf.text(`\u2022 Total Monthly Working Hours= 160 Hr`, 15, finalY + 10);
      pdf.text(`\u2022 Total Sunday Deduction= 2`, 15, finalY + 15);
      pdf.text(`\u2022 Total Monthly Leave's = 5`, 15, finalY + 20);
      pdf.text(`\u2022 Total Monthly Sunday Leave's = 2`, 15, finalY + 25);
      pdf.text(`\u2022 Total Monthly Late Minutes= 120 min`, 15, finalY + 30);
      pdf.text(`\u2022 Total Monthly Late Days= 3 days`, 15, finalY + 35);

      // Total salary
      pdf.setFontSize(14);
      pdf.text(`Total: $1000/-`, pdf.internal.pageSize.width - 80, finalY + 50);

      // Save the PDF
      pdf.save(`salary_details.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <>
      <ToastContainer />

      <form className="SugarSaleReturnSale-container" onSubmit={handleSubmit}>
        <h6 className="Heading">Sale Return</h6>

        <div>
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
          />

          {/* Navigation Buttons */}
          <NavigationButtons
            handleFirstButtonClick={handleFirstButtonClick}
            handlePreviousButtonClick={handlePreviousButtonClick}
            handleNextButtonClick={handleNextButtonClick}
            handleLastButtonClick={handleCancel}
            highlightedButton={highlightedButton}
            isEditing={isEditing}
          />
        </div>
        <button onClick={handlePrint}>Print</button>
        <div className="SugarSaleReturnSale-row">
          <label className="SugarSaleReturnSale-form-label">Change No:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="changeNo"
                autoComplete="off"
                onKeyDown={handleKeyDown}
                disabled={!addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnSale-form-label">Bill No:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                ref={setFocusTaskdate}
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="doc_no"
                autoComplete="off"
                value={formData.doc_no}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <label htmlFor="PURCNO" className="SugarSaleReturnSale-form-label">
            Purchase No
          </label>
          <div className="SugarSaleReturnSale-col">
            <div className="SugarSaleReturnSale-form-group">
              <PurcNoFromReturnSaleHelp
                onAcCodeClick={handlePurchaseNo}
                purchaseNo={purchaseNo}
                name="PURCNO"
                OnSaleBillHead={saleBillHeadData}
                OnSaleBillDetail={saleBillDetailData}
                tabIndexHelp={2}
                disabledFeild={!isEditing && addOneButtonEnabled}
                Type={type}
                sugarSaleReturnSale={sugarSaleReturnSale}
              />
            </div>
          </div>

          <label className="SugarSaleReturnSale-form-label">Year</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                ref={setFocusTaskdate}
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="Year_Code"
                autoComplete="off"
                value={formData.Year_Code}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <label className="SugarSaleReturnSale-form-label">Date:</label>
          <div className="SugarSaleReturnSale-col">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="1"
                ref={setFocusTaskdate}
                type="date"
                className="SugarSaleReturnSale-form-control"
                id="datePicker"
                name="doc_date"
                value={formData.doc_date}
                onChange={(e) => handleDateChange(e, "doc_date")}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>

        <div className="SugarSaleReturnSale-row">
          <label htmlFor="Ac_Code" className="SugarSaleReturnSale-form-label">
            From A/C:
          </label>
          <div className="SugarSaleReturnSale-col">
            <div className="SugarSaleReturnSale-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillFrom}
                CategoryName={partyName}
                CategoryCode={partyCode}
                name="Ac_Code"
                tabIndexHelp={2}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
            {formErrors.Ac_Code && <p className="error-message">{formErrors.Ac_Code}</p>}
          </div>
        </div>
        <div className="SugarSaleReturnSale-row">
          <label htmlFor="bill_to" className="SugarSaleReturnSale-form-label">
            Bill To:
          </label>
          <div className="SugarSaleReturnSale-col">
            <div className="SugarSaleReturnSale-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillTo}
                CategoryName={billToName}
                CategoryCode={billToCode}
                name="bill_to"
                tabIndexHelp={5}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        <div className="SugarSaleReturnSale-row">
          <label htmlFor="Unit_Code" className="SugarSaleReturnSale-form-label">
            Unit:
          </label>
          <div className="SugarSaleReturnSale-col">
            <div className="SugarSaleReturnSale-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleShipTo}
                CategoryName={unitName}
                CategoryCode={unitCode}
                name="Unit_Code"
                tabIndexHelp={7}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        <div className="SugarSaleReturnSale-row">
          <label htmlFor="mill_code" className="SugarSaleReturnSale-form-label">
            Mill:
          </label>
          <div className="SugarSaleReturnSale-col">
            <div className="SugarSaleReturnSale-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleMillData}
                CategoryName={millName}
                CategoryCode={millCode}
                name="mill_code"
                tabIndexHelp={6}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
            {formErrors.mill_code && <p className="error-message">{formErrors.mill_code}</p>}
          </div>
          <div className="SugarSaleReturnSale-row">
            <label className="SugarSaleReturnSale-form-label">From:</label>
            <div className="SugarSaleReturnSale-col-Text">
              <div className="SugarSaleReturnSale-form-group">
                <input
                  type="text"
                  className="SugarSaleReturnSale-form-control"
                  name="FROM_STATION"
                  autoComplete="off"
                  value={formData.FROM_STATION}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
            <label className="SugarSaleReturnSale-form-label">To:</label>
            <div className="SugarSaleReturnSale-col-Text">
              <div className="SugarSaleReturnSale-form-group">
                <input
                  type="text"
                  className="SugarSaleReturnSale-form-control"
                  name="TO_STATION"
                  autoComplete="off"
                  value={formData.TO_STATION}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
            <label className="SugarSaleReturnSale-form-label">Lorry No:</label>
            <div className="SugarSaleReturnSale-col-Text">
              <div className="SugarSaleReturnSale-form-group">
                <input
                  type="text"
                  className="SugarSaleReturnSale-form-control"
                  name="LORRYNO"
                  autoComplete="off"
                  value={formData.LORRYNO}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
            <label className="SugarSaleReturnSale-form-label">WareHouse:</label>
            <div className="SugarSaleReturnSale-col-Text">
              <div className="SugarSaleReturnSale-form-group">
                <input
                  type="text"
                  className="SugarSaleReturnSale-form-control"
                  name="wearhouse"
                  autoComplete="off"
                  value={formData.wearhouse}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
            <label htmlFor="BROKER" className="SugarSaleReturnSale-form-label">
              Broker:
            </label>
            <div className="SugarSaleReturnSale-col">
              <div className="SugarSaleReturnSale-form-group">
                <AccountMasterHelp
                  onAcCodeClick={handleBroker}
                  CategoryName={brokerName}
                  CategoryCode={brokerCode}
                  name="BROKER"
                  tabIndexHelp={2}
                  disabledFeild={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
            <label
              htmlFor="GstRateCode"
              className="SugarSaleReturnSale-form-label"
            >
              GST Rate Code:
            </label>
            <div className="SugarSaleReturnSale-col">
              <div className="SugarSaleReturnSale-form-group">
                <GSTRateMasterHelp
                  onAcCodeClick={handleGstCode}
                  GstRateName={gstName}
                  GstRateCode={gstRateCode}
                  name="GstRateCode"
                  tabIndexHelp={8}
                  disabledFeild={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
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
        <div className="">
          {showPopup && (
            <div className="modal" role="dialog" style={{ display: "block" }}>
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
                      style={{
                        marginLeft: "80%",
                        width: "60px",
                        height: "30px",
                      }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <label>Item Code:</label>
                      <div className="form-element">
                        <ItemMasterHelp
                          onAcCodeClick={handleItemCode}
                          CategoryName={item_Name}
                          CategoryCode={itemCode}
                          SystemType="I"
                          name="item_code"
                          tabIndexHelp={3}
                          className="account-master-help"
                        />
                      </div>

                      <label className="SugarSaleReturnSale-form-label">
                        Quantal:
                      </label>
                      <div className="SugarSaleReturnSale-col-Ewaybillno">
                        <div className="SugarSaleReturnSale-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="Quantal"
                            autoComplete="off"
                            value={formDataDetail.Quantal}
                            onChange={handleChangeDetail}
                          
                          />
                        </div>
                        {formErrors.Quantal && <p className="error-message">{formErrors.Quantal}</p>}
                      </div>
                      <label className="SugarSaleReturnSale-form-label">
                        Packing:
                      </label>
                      <div className="SugarSaleReturnSale-col-Ewaybillno">
                        <div className="SugarSaleReturnSale-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="packing"
                            autoComplete="off"
                            value={formDataDetail.packing}
                            onChange={handleChangeDetail}
                          />
                        </div>
                        {formErrors.packing && <p className="error-message">{formErrors.packing}</p>}
                      </div>
                      <label className="SugarSaleReturnSale-form-label">
                        Bags:
                      </label>
                      <div className="SugarSaleReturnSale-col-Ewaybillno">
                        <div className="SugarSaleReturnSale-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="bags"
                            autoComplete="off"
                            value={formDataDetail.bags}
                            onChange={handleChangeDetail}
                          />
                        </div>
                        {formErrors.bags && <p className="error-message">{formErrors.bags}</p>}
                      </div>
                      <label className="SugarSaleReturnSale-form-label">
                        Rate:
                      </label>
                      <div className="SugarSaleReturnSale-col-Ewaybillno">
                        <div className="SugarSaleReturnSale-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="rate"
                            autoComplete="off"
                            value={formDataDetail.rate}
                            onChange={handleChangeDetail}
                          />
                        </div>
                        {formErrors.rate && <p className="error-message">{formErrors.rate}</p>}
                      </div>
                      <label className="SugarSaleReturnSale-form-label">
                        Item Amount:
                      </label>
                      <div className="SugarSaleReturnSale-col-Ewaybillno">
                        <div className="SugarSaleReturnSale-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="item_Amount"
                            autoComplete="off"
                            value={formDataDetail.item_Amount}
                            onChange={handleChangeDetail}
                          />
                        </div>
                        {formErrors.item_Amount && <p className="error-message">{formErrors.item_Amount}</p>}
                      </div>
                      <label className="SugarSaleReturnSale-form-label">
                        Narration:
                      </label>
                      <div className="SugarSaleReturnSale-col-Ewaybillno">
                        <div className="SugarSaleReturnSale-form-group">
                          <textarea
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="narration"
                            autoComplete="off"
                            value={formDataDetail.narration}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    {selectedUser.id ? (
                      <button
                        className="btn btn-primary"
                        onClick={updateUser}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            updateUser();
                          }
                        }}
                      >
                        Update User
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={addUser}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            addUser();
                          }
                        }}
                      >
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
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                height: "35px",
                marginTop: "25px",
                marginRight: "10px",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => openPopup("add")}
                tabIndex="16"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    openPopup("add");
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
            <table className="table mt-4 table-bordered">
              <thead>
                <tr>
                  <th>Actions</th>
                  {/* <th>ID</th>
                <th>RowAction</th> */}
                  <th>Item</th>
                  <th>Item Name</th>
                  <th>Quantal</th>
                  <th>Packing</th>
                  <th>Bags</th>
                  <th>Rate</th>
                  <th>Item Amount</th>
                  {/* <th>Saledetailid</th> */}
                </tr>
              </thead>
              <tbody>
                {console.log("Rendering users:", users)}
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
                                deleteModeHandler(user);
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
                    {/* <td>{user.id}</td>
                  <td>{user.rowaction}</td> */}
                    <td>{user.item_code}</td>
                    <td>{user.item_Name}</td>
                    <td>{user.Quantal}</td>
                    <td>{user.packing}</td>
                    <td>{user.bags}</td>
                    <td>{user.rate}</td>
                    <td>{user.item_Amount}</td>
                    {/* <td>{user.saledetailid}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="SugarSaleReturnSale-row">
          <label className="SugarSaleReturnSale-form-label">Net Quantal</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="9"
                type="text"
                name="NETQNTL"
                autoComplete="off"
                value={formData.NETQNTL}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
            {formErrors.NETQNTL && <p className="error-message">{formErrors.NETQNTL}</p>}
          </div>
          <label className="SugarSaleReturnSale-form-label">Due Days</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="9"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="Due_Days"
                autoComplete="off"
                value={formData.Due_Days}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnSale-form-label">PO Details</label>
          <div className="SugarSaleReturnSale-col-Ewaybillno">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="9"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="PO_Details"
                autoComplete="off"
                value={formData.PO_Details}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <div className="SugarSaleReturnSale-row">
            <label
              htmlFor="Transport_Code"
              className="SugarSaleReturnSale-form-label"
            >
              Transport:
            </label>
            <div className="SugarSaleReturnSale-col">
              <div className="SugarSaleReturnSale-form-group">
                <AccountMasterHelp
                  onAcCodeClick={handleTransport}
                  CategoryName={transportName}
                  CategoryCode={transportCode}
                  name="Transport_Code"
                  tabIndexHelp={6}
                  disabledFeild={!isEditing && addOneButtonEnabled}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="SugarSaleReturnSale-row">
          <label className="SugarSaleReturnSale-form-label">ASN/GRN No:</label>
          <div className="SugarSaleReturnSale-col-Ewaybillno">
            <div className="SugarSaleReturnSale-form-group">
              <input
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="ASN_No"
                autoComplete="off"
                value={formData.ASN_No}
                onChange={handleChange}
                tabIndex="10"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnSale-form-label">EWayBill No</label>
          <div className="SugarSaleReturnSale-col-Ewaybillno">
            <div className="SugarSaleReturnSale-form-group">
              <input
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="Eway_Bill_No"
                autoComplete="off"
                value={formData.Eway_Bill_No}
                onChange={handleChange}
                tabIndex="10"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnSale-form-label">ACK No:</label>
          <div className="SugarSaleReturnSale-col-Ewaybillno">
            <div className="SugarSaleReturnSale-form-group">
              <input
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="ackno"
                autoComplete="off"
                value={formData.ackno}
                onChange={handleChange}
                tabIndex="11"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnSale-form-label">EInvoice No:</label>
          <div className="SugarSaleReturnSale-col-Ewaybillno">
            <div className="SugarSaleReturnSale-form-group">
              <input
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="einvoiceno"
                autoComplete="off"
                value={formData.einvoiceno}
                onChange={handleChange}
                tabIndex="10"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        <div className="SugarSaleReturnSale-row">
          <label className="SugarSaleReturnSale-form-label">SubTotal:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="13"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="subTotal"
                autoComplete="off"
                value={formData.subTotal}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
          </div>
          <label className="SugarSaleReturnSale-form-label">Add Frt. Rs:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="14"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="LESS_FRT_RATE"
                autoComplete="off"
                value={formData.LESS_FRT_RATE}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
              {formErrors.LESS_FRT_RATE && <p className="error-message">{formErrors.LESS_FRT_RATE}</p>}

              <input
                tabIndex="15"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="freight"
                autoComplete="off"
                value={formData.freight}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
            {formErrors.freight && <p className="error-message">{formErrors.freight}</p>}
          </div>

          {/* <label className="SugarSaleReturnSale-form-label">Taxable Amount:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="13"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="TaxableAmount"
                autoComplete="off"
                value={formData.TaxableAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div> */}

          <label className="SugarSaleReturnSale-form-label">CGST:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="14"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="CGSTRate"
                autoComplete="off"
                value={formData.CGSTRate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />

              <input
                tabIndex="15"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="CGSTAmount"
                autoComplete="off"
                value={formData.CGSTAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
          </div>

          <label className="SugarSaleReturnSale-form-label">SGST:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="16"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="SGSTRate"
                autoComplete="off"
                value={formData.SGSTRate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />

              <input
                tabIndex="17"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="SGSTAmount"
                autoComplete="off"
                value={formData.SGSTAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
          </div>

          <label className="SugarSaleReturnSale-form-label">IGST:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="IGSTRate"
                autoComplete="off"
                value={formData.IGSTRate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />

              <input
                tabIndex="19"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="IGSTAmount"
                autoComplete="off"
                value={formData.IGSTAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
          </div>

          {/* <label className="SugarSaleReturnSale-form-label">Rate Diff:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="RateDiff"
                autoComplete="off"
                value={formData.RateDiff}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
              {formErrors.RateDiff && <p className="error-message">{formErrors.RateDiff}</p>}

              <input
                tabIndex="19"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="RateDiffAmount"
                autoComplete="off"
                value={calculateRateDiffAmount()}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
          </div> */}

          <label className="SugarSaleReturnSale-form-label">MISC:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="20"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="OTHER_AMT"
                autoComplete="off"
                value={formData.OTHER_AMT}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
               
            </div>
            {formErrors.OTHER_AMT && <p className="error-message">{formErrors.OTHER_AMT}</p>}
          </div>
          <label className="SugarSaleReturnSale-form-label">Cash Advance</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="cash_advance"
                autoComplete="off"
                value={formData.cash_advance}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
          </div>

          {/* <label className="SugarSaleReturnSale-form-label">Round Off</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="RoundOff"
                autoComplete="off"
                value={formData.RoundOff}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
            {formErrors.RoundOff && <p className="error-message">{formErrors.RoundOff}</p>}
          </div> */}

          <label className="SugarSaleReturnSale-form-label">Bill Amount:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="21"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="Bill_Amount"
                autoComplete="off"
                value={formData.Bill_Amount}
                onChange={handleChange}
                style={{ color: "red", fontWeight: "bold" }}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
            {formErrors.Bill_Amount && <p className="error-message">{formErrors.Bill_Amount}</p>}
          </div>

          <label className="SugarSaleReturnSale-form-label">TCS %:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="22"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="TCS_Rate"
                autoComplete="off"
                value={formData.TCS_Rate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
              {formErrors.TCS_Rate && <p className="error-message">{formErrors.TCS_Rate}</p>}
              <input
                tabIndex="23"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="TCS_Amt"
                autoComplete="off"
                value={formData.TCS_Amt}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
            {formErrors.TCS_Amt && <p className="error-message">{formErrors.TCS_Amt}</p>}
          </div>

          <label className="SugarSaleReturnSale-form-label">Net Payable:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="24"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="TCS_Net_Payable"
                autoComplete="off"
                style={{ color: "red", fontWeight: "bold" }}
                value={formData.TCS_Net_Payable}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
            {formErrors.TCS_Net_Payable && <p className="error-message">{formErrors.TCS_Net_Payable}</p>}
          </div>
        </div>

        <div className="SugarSaleReturnSale-row">
          <label className="SugarSaleReturnSale-form-label">TDS %:</label>
          <div className="SugarSaleReturnSale-col-Text">
            <div className="SugarSaleReturnSale-form-group">
              <input
                tabIndex="25"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="TDS_Rate"
                autoComplete="off"
                value={formData.TDS_Rate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
              {formErrors.TDS_Rate && <p className="error-message">{formErrors.TDS_Rate}</p>}
              <input
                tabIndex="26"
                type="text"
                className="SugarSaleReturnSale-form-control"
                name="TDS_Amt"
                autoComplete="off"
                value={formData.TDS_Amt !== null ? formData.TDS_Amt : ""}
                // value={formData.TDS_Amt}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                onKeyDown={handleKeyDownCalculations}
              />
            </div>
            {formErrors.TDS_Amt && <p className="error-message">{formErrors.TDS_Amt}</p>}
          </div>
        </div>
      </form>
    </>
  );
};
export default SugarSaleReturnSale;
