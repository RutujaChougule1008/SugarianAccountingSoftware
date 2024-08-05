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
import "./SugarSaleReturnPurchase.css";
import { HashLoader } from "react-spinners";
import { z } from "zod";
import PuchNoFromReturnPurchaseHelp from "../../../Helper/PuchNoFromReturnPurchaseHelp";

// Validation Part Using Zod Library
const stringToNumber = z
  .string()
  .refine((value) => !isNaN(Number(value)), {
    message: "This field must be a number",
  })
  .transform((value) => Number(value));

// Validation Schemas
const SugarSaleReturnPurchaseSchema = z.object({
  //   texable_amount: stringToNumber.refine(value => value !== undefined && value >= 0),
  //   bill_amount: stringToNumber.refine(value => value !== undefined && value >= 0),
  //   TCS_Net_Payable: stringToNumber.refine(value => value !== undefined && value >= 0),
});

//Global Variables
var newPrid = "";
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



const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");

const SugarSaleReturnPurchase = () => {
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
    Quantal: 0.0,
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
  const [purchNo,setPurchno] = useState("")
  const [saleBillDataDetails,setSaleBillDataDetials] = useState({})

  //In utility page record doubleClicked that recod show for edit functionality
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const navigate = useNavigate();
  const setFocusTaskdate = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = {
    doc_no: 0,
    PURCNO: 0,
    PurcTranType: "",
    Tran_Type: "",
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
    Company_Code: 0,
    Year_Code: 0,
    Branch_Code: 0,
    Created_By: "",
    Modified_By: "",
    Bill_No: "",
    CGSTRate: 0.0,
    CGSTAmount: 0.0,
    SGSTRate: 0.0,
    SGSTAmount: 0.0,
    IGSTRate: 0.0,
    IGSTAmount: 0.0,
    GstRateCode: 0,
    purcyearcode: 0,
    Bill_To: 0,
    prid: 0,
    srid: 0,
    ac: 0,
    uc: 0,
    mc: 0,
    bc: 0,
    bt: 0,
    sbid: 0,
    TCS_Rate: 0.0,
    TCS_Amt: 0.0,
    TCS_Net_Payable: 0.0,
    einvoiceno: "",
    ackno: "",
    TDS_Rate: 0.0,
    TDS_Amt: 0.0,
    QRCode: "",
    gstid: 0
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

  const handleChange = async (event) => {
    const { name, value } = event.target;

    validateField(name, value);

    const matchStatus = await checkMatchStatus(
      formData.Ac_Code,
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

    // Calculate dependent values and update form data
    const updatedFormData = await calculateDependentValues(
      name,
      value,
      formData,
      matchStatus,
      gstRate
    );

    setFormData(updatedFormData);
  };

  const handleOnChange = () => {
    setIsChecked((prev) => {
      const newValue = !prev;
      const value = newValue ? "Y" : "N";

      setFormData((prevData) => ({
        ...prevData,
        EWayBill_Chk: value,
      }));

      return newValue;
    });
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
    try {
      SugarSaleReturnPurchaseSchema.pick({ [name]: true }).parse({ [name]: value });
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
      SugarSaleReturnPurchaseSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err) {
      const errors = {};
      err.errors.forEach((error) => {
        errors[error.path[0]] = error.message;
      });
      setFormErrors(errors);
      return false;
    }
  };

  const fetchLastRecord = () => {
    fetch(
      `${API_URL}/get-lastSaleBill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        const newDocNo =
          data.last_head_data && data.last_head_data.doc_no
            ? data.last_head_data.doc_no + 1
            : 1;

        setFormData((prevState) => ({
          ...prevState,
          doc_no: newDocNo,
        }));
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
    setLastTenderDetails([]);
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
    setIsEditing(true);
    setIsLoading(true);

    const headData = {
      ...formData,
      GstRateCode: gstCode || gstRateCode,
    };

    if (isEditMode) {
      delete headData.saleid;
    }
    const detailData = users.map((user) => ({
      rowaction: user.rowaction,
      saledetailid: user.saledetailid,
      item_code: user.item_code,
      Quantal: user.Quantal,
      ic: user.ic,
      detail_id: 1,
      Company_Code: companyCode,
      Year_Code: Year_Code,
      Tran_Type: user.Tran_Type,
      narration: user.narration,
      packing: user.packing,
      bags: user.bags,
      rate: user.rate,
      item_Amount: user.item_Amount,
      Brand_Code: user.Brand_Code,
    }));

    const requestData = {
      headData,
      detailData,
    };
    console.log(requestData);

    try {
      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update-SaleBill?saleid=${newPrid}`;
        const response = await axios.put(updateApiUrl, requestData);

        toast.success("Data updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const response = await axios.post(
          `${API_URL}/insert-SaleBill`,
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
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error("Error occurred while saving data");
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
        const deleteApiUrl = `${API_URL}/delete_data_by_saleid?saleid=${newPrid}&Company_Code=${companyCode}&doc_no=${formData.doc_no}&Year_Code=${Year_Code}`;
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
        `${API_URL}/get-lastSaleBill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const data = response.data;
        newPrid = data.last_head_data.saleid;
        partyName = data.last_details_data[0].partyname;
        partyCode = data.last_head_data.Ac_Code;
        unitName = data.last_details_data[0].unitname;
        unitCode = data.last_details_data[0].unitaccode;
        billToName = data.last_details_data[0].billtoname;
        billToCode = data.last_head_data.Bill_To;
        gstrate = data.last_details_data[0].gstrate;
        gstRateCode = data.last_head_data.GstRateCode;
        gstName = data.last_details_data[0].GSTName;
        millName = data.last_details_data[0].millname;
        millCode = data.last_head_data.mill_code;
        itemName = data.last_details_data[0].itemname;
        item_Code = data.last_details_data[0].System_Code;
        
        brokerCode = data.last_details_data[0].brokeraccode;
        brokerName = data.last_details_data[0].brokername;
      
        
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));
        setIsChecked(true);
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
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
    navigate("/SaleBill-utility");
  };

  const handleFirstButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-firstSaleBill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const data = response.data;
        newPrid = data.first_head_data.saleid;
        partyName = data.first_details_data[0].partyname;
        partyCode = data.first_head_data.Ac_Code;
        unitName = data.first_details_data[0].unitname;
        unitCode = data.first_details_data[0].unitaccode;
        billToName = data.first_details_data[0].billtoname;
        billToCode = data.first_head_data.Bill_To;
        gstrate = data.first_details_data[0].gstrate;
        gstRateCode = data.first_head_data.GstRateCode;
        millName = data.first_details_data[0].millname;
        millCode = data.first_head_data.mill_code;
        itemName = data.first_details_data[0].itemname;
        item_Code = data.first_details_data[0].System_Code;
        brokerCode = data.first_details_data[0].brokeraccode;
        brokerName = data.first_details_data[0].brokername;
        setFormData((prevData) => ({
          ...prevData,
          ...data.first_head_data,
        }));

        setLastTenderData(data.first_head_data || {});
        setLastTenderDetails(data.first_details_data || []);
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

  const handleLastButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-lastSaleBill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const data = response.data;
        newPrid = data.last_head_data.saleid;
        partyName = data.last_details_data[0].partyname;
        partyCode = data.last_head_data.Ac_Code;
        unitName = data.last_details_data[0].unitname;
        unitCode = data.last_details_data[0].unitaccode;
        billToName = data.last_details_data[0].billtoname;
        billToCode = data.last_head_data.Bill_To;
        gstrate = data.last_details_data[0].gstrate;
        gstRateCode = data.last_head_data.GstRateCode;
        millName = data.last_details_data[0].millname;
        millCode = data.last_head_data.mill_code;
        itemName = data.last_details_data[0].itemname;
        item_Code = data.last_details_data[0].System_Code;
        
        brokerCode = data.last_details_data[0].brokeraccode;
        brokerName = data.last_details_data[0].brokername;
        
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));

        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
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

  const handleNextButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-nextSaleBill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&currentDocNo=${formData.doc_no}`
      );
      if (response.status === 200) {
        const data = response.data;
        newPrid = data.next_head_data.saleid;
        partyName = data.next_details_data[0].partyname;
        partyCode = data.next_head_data.Ac_Code;
        unitName = data.next_details_data[0].unitname;
        unitCode = data.next_details_data[0].unitaccode;
        billToName = data.next_details_data[0].billtoname;
        billToCode = data.next_head_data.Bill_To;
        gstrate = data.next_details_data[0].gstrate;
        gstRateCode = data.next_head_data.GstRateCode;
        millName = data.next_details_data[0].millname;
        millCode = data.next_head_data.mill_code;
        itemName = data.next_details_data[0].itemname;
        item_Code = data.next_details_data[0].System_Code;
        
        brokerCode = data.next_details_data[0].brokeraccode;
        brokerName = data.next_details_data[0].brokername;
       
        setFormData((prevData) => ({
          ...prevData,
          ...data.next_head_data,
        }));

        setLastTenderData(data.next_head_data || {});
        setLastTenderDetails(data.next_details_data || []);
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
        `${API_URL}/get-previousSaleBill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&currentDocNo=${formData.doc_no}`
      );

      if (response.status === 200) {
        const data = response.data;
        newPrid = data.previous_head_data.saleid;
        partyName = data.previous_details_data[0].partyname;
        partyCode = data.previous_head_data.Ac_Code;
        unitName = data.previous_details_data[0].unitname;
        unitCode = data.previous_details_data[0].unitaccode;
        billToName = data.previous_details_data[0].billtoname;
        billToCode = data.previous_head_data.Bill_To;
        gstrate = data.previous_details_data[0].gstrate;
        gstRateCode = data.previous_head_data.GstRateCode;
        millName = data.previous_details_data[0].millname;
        millCode = data.previous_head_data.mill_code;
        itemName = data.previous_details_data[0].itemname;
        item_Code = data.previous_details_data[0].System_Code;
        
        brokerCode = data.previous_details_data[0].brokeraccode;
        brokerName = data.previous_details_data[0].brokername;
        
        setFormData((prevData) => ({
          ...prevData,
          ...data.previous_head_data,
        }));
        setLastTenderData(data.previous_head_data || {});
        setLastTenderDetails(data.previous_details_data || []);
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
      const response = await axios.get(
        `${API_URL}/SaleBillByid?doc_no=${selectedRecord.doc_no}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const data = response.data;

        newPrid = data.last_head_data.saleid;
        partyName = data.last_details_data[0].partyname;
        partyCode = data.last_head_data.Ac_Code;
        unitName = data.last_details_data[0].unitname;
        unitCode = data.last_details_data[0].unitaccode;
        billToName = data.last_details_data[0].billtoname;
        billToCode = data.last_head_data.Bill_To;
        gstrate = data.last_details_data[0].gstrate;
        gstRateCode = data.last_head_data.GstRateCode;
        millName = data.last_details_data[0].millname;
        millCode = data.last_head_data.mill_code;
        itemName = data.last_details_data[0].itemname;
        item_Code = data.last_details_data[0].System_Code;
        
        brokerCode = data.last_details_data[0].brokeraccode;
        brokerName = data.last_details_data[0].brokername;
        
       
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_head_data,
        }));
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last_details_data || []);
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
          `${API_URL}/SaleBillByid?doc_no=${changeNoValue}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
        );
        const data = response.data;
        newPrid = data.last_head_data.saleid;
        partyName = data.last_details_data[0].partyname;
        partyCode = data.last_head_data.Ac_Code;
        unitName = data.last_details_data[0].unitname;
        unitCode = data.last_details_data[0].unitaccode;
        billToName = data.last_details_data[0].billtoname;
        billToCode = data.last_head_data.Bill_To;
        gstrate = data.last_details_data[0].gstrate;
        gstRateCode = data.last_head_data.GstRateCode;
        millName = data.last_details_data[0].millname;
        millCode = data.last_head_data.mill_code;
        itemName = data.last_details_data[0].itemname;
        item_Code = data.last_details_data[0].System_Code;
        
        brokerCode = data.last_details_data[0].brokeraccode;
        brokerName = data.last_details_data[0].brokername;
        
        setFormData({
          ...formData,
          ...data.last_head_data,
        });
        setLastTenderData(data.last_head_data || {});
        setLastTenderDetails(data.last.details.data || []);
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
      toast.error("Error checking GST State Code match.");
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

  const calculateRateDiffAmount = () => {
    const NETQNTL = Number(formData.NETQNTL);
    const RateDiff = Number(formData.RateDiff);
    return !isNaN(NETQNTL) && !isNaN(RateDiff) ? NETQNTL * RateDiff : 0;
  };

  const calculateDependentValues = async (
    name,
    input,
    formData,
    matchStatus,
    gstRate
  ) => {
    const updatedFormData = { ...formData, [name]: input };
    const subtotal = parseFloat(updatedFormData.subTotal) || 0.0;

    const rate = gstRate;

    const netQntl = parseFloat(updatedFormData.NETQNTL) || 0.0;
    const freightRate = parseFloat(updatedFormData.LESS_FRT_RATE) || 0.0;

    updatedFormData.freight = netQntl * freightRate;

    updatedFormData.TaxableAmount = updatedFormData.freight + subtotal;

    if (matchStatus === "TRUE") {
      updatedFormData.CGSTRate = (rate / 2).toFixed(2);
      updatedFormData.SGSTRate = (rate / 2).toFixed(2);
      updatedFormData.IGSTRate = 0.0;

      updatedFormData.CGSTAmount = (
        (updatedFormData.TaxableAmount * updatedFormData.CGSTRate) /
        100
      ).toFixed(2);
      updatedFormData.SGSTAmount = (
        (updatedFormData.TaxableAmount * updatedFormData.SGSTRate) /
        100
      ).toFixed(2);
      updatedFormData.IGSTAmount = 0.0;
    } else {
      updatedFormData.IGSTRate = rate.toFixed(2);
      updatedFormData.CGSTRate = 0.0;
      updatedFormData.SGSTRate = 0.0;

      updatedFormData.IGSTAmount = (
        (updatedFormData.TaxableAmount * updatedFormData.IGSTRate) /
        100
      ).toFixed(2);
      updatedFormData.CGSTAmount = 0.0;
      updatedFormData.SGSTAmount = 0.0;
    }

    const RateDiffAmt = updatedFormData.RateDiff * updatedFormData.NETQNTL;

    const RoundOff = parseFloat(updatedFormData.RoundOff) || 0.0;

    const miscAmount = parseFloat(updatedFormData.OTHER_AMT) || 0.0;
    updatedFormData.Bill_Amount = (
      updatedFormData.TaxableAmount +
      parseFloat(updatedFormData.CGSTAmount) +
      parseFloat(updatedFormData.SGSTAmount) +
      parseFloat(updatedFormData.IGSTAmount) +
      miscAmount +
      RateDiffAmt +
      RoundOff
    ).toFixed(2);

    const tcsRate = parseFloat(updatedFormData.TCS_Rate) || 0.0;
    updatedFormData.TCS_Amt = (
      (updatedFormData.Bill_Amount * tcsRate) /
      100
    ).toFixed(2);
    updatedFormData.TCS_Net_Payable = (
      parseFloat(updatedFormData.Bill_Amount) +
      parseFloat(updatedFormData.TCS_Amt)
    ).toFixed(2);

    const tdsRate = parseFloat(updatedFormData.TDS_Rate) || 0.0;
    updatedFormData.TDS_Amt = (
      (updatedFormData.TaxableAmount * tdsRate) /
      100
    ).toFixed(2);

    return updatedFormData;
  };

  const saleBillHeadData = (data) => {
    console.log(data)
    
        
    setFormData((prevData) => {
      const { doc_no, ...remainingData } = data;
      return {
        ...prevData,
        ...remainingData,
      };
    });
        setLastTenderData(data || {});
        setLastTenderDetails(data.last_details_data || [])


  }

  const saleBillDetailData = (details) => {
    let nextId = 1; 
    console.log("Detail", details);
    
    setSaleBillDataDetials(details);  // Assuming setSaleBillDataDetials is defined elsewhere
  
    partyName = details.partyname;
    partyCode = details.partyaccode;
     unitName = details.unitname;
     unitCode = details.unitaccode;
     billToName = details.billtoname;
     billToCode = details.Bill_To;
     gstrate = details.gstrate;
     gstRateCode = details.GstRateCode;
     millName = details.millname;
     millCode = details.millaccode;
     itemName = details.itemname;
     item_Code = details.System_Code;
     brokerCode = details.brokeraccode;
     brokerName = details.brokername;

     const newId = nextId;
  nextId += 1;
  
    setFormDataDetail((prevData) => {
      const newDetailData = {
        ...prevData,
        item_code: details.item_code,
        item_Name: details.itemname,
        id: newId,
        ic: details.ic,
        saledetailid: details.saledetailid,
        narration: details.narration,
        Quantal: details.Quantal,
        bags: details.bags,
        packing: details.packing,
        rate: details.rate,
        item_Amount: details.item_Amount,
        rowaction: "add",
      };
      console.log(newDetailData);
      return newDetailData;  // Ensure that setFormDataDetail returns new data
    });

    setUsers((prevUsers) => {
      const updatedUsers = [...prevUsers, {
        item_code: details.item_code,
        item_Name: details.itemname,
        id: newId,
        ic: details.ic,
        saledetailid: details.saledetailid,
        narration: details.narration,
        Quantal: details.Quantal,
        bags: details.bags,
        packing: details.packing,
        rate: details.rate,
        item_Amount: details.item_Amount,
        rowaction: "add",
      }];
      console.log("Updated Users:", updatedUsers);
      return updatedUsers;
    });
  };
  
  useEffect(() => {
    if (selectedRecord) {
      setUsers(
        lastTenderDetails.map((detail) => ({
          item_code: detail.item_code,
          item_Name: detail.item_Name,
          rowaction: "Normal",
          
          ic: detail.ic,
          id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
          saledetailid: detail.saledetailid,
          narration: detail.narration,
          Quantal: detail.Quantal,
          bags: detail.bags,
          packing: detail.packing,
          rate: detail.rate,
          item_Amount: detail.item_Amount,
        }))
      );
    }
  }, [selectedRecord, lastTenderDetails]);

  useEffect(() => {
    const updatedUsers = lastTenderDetails.map((detail) => ({
      item_code: detail.item_code ,
      item_Name: detail.itemname,
      rowaction: "Normal",
      
      
      ic: detail.ic,
      id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      saledetailid: detail.saledetailid,
      narration: detail.narration,
      Quantal: detail.Quantal,
      bags: detail.bags,
      packing: detail.packing,
      rate: detail.rate,
      item_Amount: detail.item_Amount,
    }));
    setUsers(updatedUsers);
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

      const { Quantal, packing, rate } = updatedDetail;
      const { bags, item_Amount } = calculateDetails(Quantal, packing, rate);

      updatedDetail.bags = bags;
      updatedDetail.item_Amount = item_Amount;

      return updatedDetail;
    });
  };

  const addUser = async () => {
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
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedUser({});
    clearForm();
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

  const handleItemCode = (code, accoid,hsn,name) => {
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
  };
  const handlePurchaseNo = (purchaseNo) => {
    setPurchno(purchaseNo)
    setFormData({
        ...formData,
        PURCNO: purchaseNo
        
    })
  };

  const handleBillTo = (code, accoid) => {
    setBillTo(code);
    setFormData({
      ...formData,
      Bill_To: code,
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
      bk: accoid,
    });
  };

  
  return (
    <>
      <ToastContainer />
  

      <form className="SugarSaleReturnPurchase-container" onSubmit={handleSubmit}>
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
            handleLastButtonClick={handleLastButtonClick}
            highlightedButton={highlightedButton}
            isEditing={isEditing}
          />
        </div>
        <div className="SugarSaleReturnPurchase-row">
          <label className="SugarSaleReturnPurchase-form-label">Change No:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="changeNo"
                autoComplete="off"
                onKeyDown={handleKeyDown}
                disabled={!addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">Bill No:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                ref={setFocusTaskdate}
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="doc_no"
                autoComplete="off"
                value={formData.doc_no}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>
 
          <label htmlFor="PURCNO" className="SugarSaleReturnPurchase-form-label">
            Purchase No
          </label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
              <PuchNoFromReturnPurchaseHelp
                onAcCodeClick={handlePurchaseNo}
                purchaseNo={purchNo}
                name="PURCNO"
                OnSaleBillHead = {saleBillHeadData}
                OnSaleBillDetail = {saleBillDetailData}
                tabIndexHelp={2}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>   

          <label className="SugarSaleReturnPurchase-form-label">Year</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                ref={setFocusTaskdate}
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="Year_Code"
                autoComplete="off"
                value={formData.Year_Code}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">Date:</label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="1"
                ref={setFocusTaskdate}
                type="date"
                className="SugarSaleReturnPurchase-form-control"
                id="datePicker"
                name="doc_date"
                value={formData.doc_date}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>

        <div className="SugarSaleReturnPurchase-row">
          <label htmlFor="Ac_Code" className="SugarSaleReturnPurchase-form-label">
            Bill From:
          </label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillFrom}
                CategoryName={partyName}
                CategoryCode={partyCode}
                name="Ac_Code"
                tabIndexHelp={2}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        <div className="SugarSaleReturnPurchase-row">
          <label htmlFor="Bill_To" className="SugarSaleReturnPurchase-form-label">
            Bill To:
          </label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillTo}
                CategoryName={billToName}
                CategoryCode={billToCode}
                name="Bill_To"
                tabIndexHelp={5}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        <div className="SugarSaleReturnPurchase-row">
          <label htmlFor="Unit_Code" className="SugarSaleReturnPurchase-form-label">
            Ship To:
          </label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
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
        <div className="SugarSaleReturnPurchase-row">
          <label htmlFor="mill_code" className="SugarSaleReturnPurchase-form-label">
            Mill:
          </label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleMillData}
                CategoryName={millName}
                CategoryCode={millCode}
                name="mill_code"
                tabIndexHelp={6}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">From:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="FROM_STATION"
                autoComplete="off"
                value={formData.FROM_STATION}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">To:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="TO_STATION"
                autoComplete="off"
                value={formData.TO_STATION}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">Lorry No:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="LORRYNO"
                autoComplete="off"
                value={formData.LORRYNO}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">WareHouse:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                ref={setFocusTaskdate}
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="wearhouse"
                autoComplete="off"
                value={formData.wearhouse}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label htmlFor="BROKER" className="SugarSaleReturnPurchase-form-label">
            Broker:
          </label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
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
          <label htmlFor="GstRateCode" className="SugarSaleReturnPurchase-form-label">
            GST Rate Code:
          </label>
          <div className="SugarSaleReturnPurchase-col">
            <div className="SugarSaleReturnPurchase-form-group">
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
                          CategoryName={item_Name }
                          CategoryCode={itemCode}
                          SystemType="I"
                          name="item_code"
                          tabIndexHelp={3}
                          className="account-master-help"
                        />
                      </div>


                      <label className="SugarSaleReturnPurchase-form-label">Quantal:</label>
                      <div className="SugarSaleReturnPurchase-col-Ewaybillno">
                        <div className="SugarSaleReturnPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnPurchase-form-control"
                            name="Quantal"
                            autoComplete="off"
                            value={formDataDetail.Quantal}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarSaleReturnPurchase-form-label">Packing:</label>
                      <div className="SugarSaleReturnPurchase-col-Ewaybillno">
                        <div className="SugarSaleReturnPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnPurchase-form-control"
                            name="packing"
                            autoComplete="off"
                            value={formDataDetail.packing}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarSaleReturnPurchase-form-label">Bags:</label>
                      <div className="SugarSaleReturnPurchase-col-Ewaybillno">
                        <div className="SugarSaleReturnPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnPurchase-form-control"
                            name="bags"
                            autoComplete="off"
                            value={formDataDetail.bags}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarSaleReturnPurchase-form-label">Rate:</label>
                      <div className="SugarSaleReturnPurchase-col-Ewaybillno">
                        <div className="SugarSaleReturnPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnPurchase-form-control"
                            name="rate"
                            autoComplete="off"
                            value={formDataDetail.rate}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarSaleReturnPurchase-form-label">
                        Item Amount:
                      </label>
                      <div className="SugarSaleReturnPurchase-col-Ewaybillno">
                        <div className="SugarSaleReturnPurchase-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnPurchase-form-control"
                            name="item_Amount"
                            autoComplete="off"
                            value={formDataDetail.item_Amount}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="SugarSaleReturnPurchase-form-label">Narration:</label>
                      <div className="SugarSaleReturnPurchase-col-Ewaybillno">
                        <div className="SugarSaleReturnPurchase-form-group">
                          <textarea
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnPurchase-form-control"
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

        <div className="SugarSaleReturnPurchase-row">
          <label className="SugarSaleReturnPurchase-form-label">Net Quantal</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="9"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="NETQNTL"
                autoComplete="off"
                value={formData.NETQNTL}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">Due Days</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="9"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="Due_Days"
                autoComplete="off"
                value={formData.Due_Days}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

    

    

          
          
          
          

          
          
          
          
          
          <label className="SugarSaleReturnPurchase-form-label">EInvoice No:</label>
          <div className="SugarSaleReturnPurchase-col-Ewaybillno">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="einvoiceno"
                autoComplete="off"
                value={formData.einvoiceno}
                onChange={handleChange}
                tabIndex="10"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">ACK No:</label>
          <div className="SugarSaleReturnPurchase-col-Ewaybillno">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="ackno"
                autoComplete="off"
                value={formData.ackno}
                onChange={handleChange}
                tabIndex="11"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

        </div>
        <div className="SugarSaleReturnPurchase-row">
          <label className="SugarSaleReturnPurchase-form-label">SubTotal:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="13"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="subTotal"
                autoComplete="off"
                value={formData.subTotal}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">Add Frt. Rs:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="14"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="LESS_FRT_RATE"
                autoComplete="off"
                value={formData.LESS_FRT_RATE}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                tabIndex="15"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="freight"
                autoComplete="off"
                value={formData.freight}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">Taxable Amount:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="13"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="TaxableAmount"
                autoComplete="off"
                value={formData.TaxableAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">CGST:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="14"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="CGSTRate"
                autoComplete="off"
                value={formData.CGSTRate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                tabIndex="15"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="CGSTAmount"
                autoComplete="off"
                value={formData.CGSTAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">SGST:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="16"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="SGSTRate"
                autoComplete="off"
                value={formData.SGSTRate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                tabIndex="17"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="SGSTAmount"
                autoComplete="off"
                value={formData.SGSTAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">IGST:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="IGSTRate"
                autoComplete="off"
                value={formData.IGSTRate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                tabIndex="19"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="IGSTAmount"
                autoComplete="off"
                value={formData.IGSTAmount}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">Rate Diff:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="RateDiff"
                autoComplete="off"
                value={formData.RateDiff}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                tabIndex="19"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="RateDiffAmount"
                autoComplete="off"
                value={calculateRateDiffAmount()}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">MISC:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="20"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="OTHER_AMT"
                autoComplete="off"
                value={formData.OTHER_AMT}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="SugarSaleReturnPurchase-form-label">Cash Advance</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="cash_advance"
                autoComplete="off"
                value={formData.cash_advance}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">Round Off</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="18"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="RoundOff"
                autoComplete="off"
                value={formData.RoundOff}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">Bill Amount:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="21"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="Bill_Amount"
                autoComplete="off"
                value={formData.Bill_Amount}
                onChange={handleChange}
                style={{ color: "red", fontWeight: "bold" }}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">TCS %:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="22"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="TCS_Rate"
                autoComplete="off"
                value={formData.TCS_Rate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
              <input
                tabIndex="23"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="TCS_Amt"
                autoComplete="off"
                value={formData.TCS_Amt}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="SugarSaleReturnPurchase-form-label">Net Payable:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="24"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="TCS_Net_Payable"
                autoComplete="off"
                style={{ color: "red", fontWeight: "bold" }}
                value={formData.TCS_Net_Payable}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>

        <div className="SugarSaleReturnPurchase-row">
          <label className="SugarSaleReturnPurchase-form-label">TDS %:</label>
          <div className="SugarSaleReturnPurchase-col-Text">
            <div className="SugarSaleReturnPurchase-form-group">
              <input
                tabIndex="25"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="TDS_Rate"
                autoComplete="off"
                value={formData.TDS_Rate}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
              <input
                tabIndex="26"
                type="text"
                className="SugarSaleReturnPurchase-form-control"
                name="TDS_Amt"
                autoComplete="off"
                value={formData.TDS_Amt !== null ? formData.TDS_Amt : ""}
                // value={formData.TDS_Amt}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
export default SugarSaleReturnPurchase;