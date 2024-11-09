import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import GSTRateMasterHelp from "../../../Helper/GSTRateMasterHelp";
import ItemMasterHelp from "../../../Helper/SystemmasterHelp";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SugarSaleReturnSale.css";
import { HashLoader } from "react-spinners";
import PurcNoFromReturnSaleHelp from "../../../Helper/PurcNoFromReturnSaleHelp";
import { TextField, Grid } from '@mui/material';
import SugarSaleReturnReport from "../SugarSaleReturnSale/report/SugarSaleReturn"

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

  const formatTruckNumber = (value) => {
    const cleanedValue = value.replace(/\s+/g, '').toUpperCase();
    return cleanedValue.length <= 10 ? cleanedValue : cleanedValue.substring(0, 10);
  };

  const handleChange = async (event) => {
    const { name, value } = event.target;
    const updatedValue = name === "LORRYNO" ? formatTruckNumber(value) : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue,
    }));
  };

  const handleKeyDownCalculations = async (event) => {
    if (event.key === "Tab") {
      const { name, value } = event.target;
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
      const updatedFormData = await calculateDependentValues(
        name,
        value,
        formData,
        matchStatus,
        gstRate
      );
      setFormData(updatedFormData);
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
    setIsEditing(true);
    setIsLoading(true);



    const {
      Bill_No,
      Bill_To,
      prid,
      purcyearcode,
      wearhouse,
      srid,
      ...filteredFormData
    } = formData;

    const headData = {
      ...initialFormData,
      ...filteredFormData,
      PURCNO: purchaseNo,
      bill_to: Bill_To || formData.bill_to,
      GstRateCode: gstCode || gstRateCode,
      Tran_Type: "RS" || type
    };

    console.log("headData:", headData);

    if (isEditMode) {
      delete headData.srid;
    }

    console.log("Users state before API call:", users);

    const detailData = users.map((user) => {
      const isNew = !user.detail_id;
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
        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

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

        const itemNameMap = first_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));
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

        const itemNameMap = next_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));
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

        const itemNameMap = previous_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

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
        const itemNameMap = last_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

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

        const itemNameMap = last_labels_data.reduce((map, label) => {
          if (label.item_code !== undefined && label.itemname) {
            map[label.item_code] = label.itemname;
          }
          return map;
        }, {});

        const enrichedDetails = detailsArray.map((detail) => ({
          ...detail,
          itemname: itemNameMap[detail.item_code] || "Unknown Item",
        }));

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

  const calculateDependentValues = async (
    name,
    input,
    formData,
    matchStatus,
    gstRate
  ) => {
    const updatedFormData = { ...formData, [name]: input };
    const subtotal = parseFloat(updatedFormData.subTotal) || 0.0;
    const rate = parseFloat(gstRate) || 0.0;
    const netQntl = parseFloat(updatedFormData.NETQNTL) || 0.0;
    const freightRate = parseFloat(updatedFormData.LESS_FRT_RATE) || 0.0;
    const miscAmount = parseFloat(updatedFormData.OTHER_AMT) || 0.0;
    const cashAdvance = parseFloat(updatedFormData.cash_advance) || 0.0;
    const bankCommission = parseFloat(updatedFormData.bank_commission) || 0.0;
    const tcsRate = parseFloat(updatedFormData.TCS_Rate) || 0.0;
    const tdsRate = parseFloat(updatedFormData.TDS_Rate) || 0.0;

    updatedFormData.freight = (netQntl * freightRate).toFixed(2);

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

    updatedFormData.TCS_Amt = (
      (parseFloat(updatedFormData.Bill_Amount) * tcsRate) /
      100
    ).toFixed(2);

    updatedFormData.TCS_Net_Payable = (
      parseFloat(updatedFormData.Bill_Amount) +
      parseFloat(updatedFormData.TCS_Amt)
    ).toFixed(2);

    updatedFormData.TDS_Amt = ((subtotal * tdsRate) / 100).toFixed(2);

    return updatedFormData;
  };

  const saleBillHeadData = (data) => {
    console.log("saleBillHeadData", data);

    partyCode = data.Ac_Code || "";
    unitCode = data.Unit_Code || "";
    billToCode = data.Bill_To || "";
    gstRateCode = data.GstRateCode || "";
    millCode = data.mill_code || "";
    brokerCode = data.BROKER || "";
    purchaseNo = data.doc_no || "";
    setFormData((prevData) => {
      const { doc_no, doc_date, ...remainingData } = data;

      return {
        ...prevData,
        ...remainingData,
        bc: data.bk || prevData.bc,
      };
    });

    setLastTenderData(data || {});
    setLastTenderDetails(data.details_data || []);
  };


  const saleBillDetailData = (details) => {
    debugger;
    console.log("Sale Bill Details Received:", details);

    if (!details || Object.keys(details).length === 0) {
      console.error("No details provided to saleBillDetailData");
      return;
    }

    partyName = details.partyname;
    unitName = details.unitname;
    billToName = details.billtoname;
    gstName = details.GSTName;
    millName = details.millname;
    itemName = details.itemname;
    brokerName = details.brokername;

    const existingDetailIds = users
      .map((user) => user.detail_id)
      .filter((id) => id != null);

    const isExisting = users.some(
      (user) => user.detail_id === details.detail_id
    );

    const newDetailId =
      existingDetailIds.length > 0 ? Math.max(...existingDetailIds) + 1 : 1;

    const newUserId =
      users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;

    const newDetailData = {
      item_code: details.item_code || 0,
      item_Name: details.itemname || "Unknown Item",
      id: newUserId,
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

  useEffect(() => {
    if (lastTenderDetails.length > 0) {
      const updatedUsers = lastTenderDetails.map((detail) => {
        const existingUser = users.find(
          (user) => user.detail_id === detail.srdtid
        );
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
      const isExisting = users.some(
        (user) => user.detail_id === details.detail_id
      );

      const newDetailData = {
        ...formDataDetail,
        item_code: details.item_code || 0,
        itemname: itemName || "Unknown Item",
        id:
          users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
        ic: details.ic || 0,
        narration: details.narration || "",
        Quantal: parseFloat(totalQuintal) || 0,
        bags: parseFloat(totalQuintal) / 50 * 100,
        packing: 50,
        rate: parseFloat(details.rate) || 0,
        item_Amount: parseFloat(totalAmount) || 0,
        rowaction: isExisting ? "update" : "add",
        detail_id: isExisting
          ? details.detail_id
          : users.length > 0
            ? Math.max(...users.map((user) => user.detail_id || 0)) + 1
            : 1,
      };
      const updatedUsers = isExisting
        ? users.map((user) =>
          user.detail_id === details.detail_id ? newDetailData : user
        )
        : [...users, newDetailData];

      setUsers(updatedUsers);
      const netQuantal = calculateNetQuantal(updatedUsers);
      const subtotal = calculateTotalItemAmount(updatedUsers);
      let updatedFormData = {
        ...formData,
        NETQNTL: parseFloat(netQuantal),
        subTotal: parseFloat(subtotal),
        PURCNO: 0
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
      "GstRateCode",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
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
      "GstRateCode",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
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
      "GstRateCode",
      gstRate,
      updatedFormData,
      matchStatus,
      gstRate
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
      Ac_Code: "",
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

      const newFormData = await calculateDependentValues(
        "GstRateCode",
        rate,
        updatedFormData,
        matchStatusResult,
        rate
      );

      setFormData(newFormData);
    } catch (error) { }
  };

  const handleBroker = (code, accoid) => {
    setBroker(code);
    setFormData({
      ...formData,
      BROKER: code,
      bc: accoid || saleBillDataDetails.bk,
    });
  };

  //Validation checks funtion 
  const validateNumericInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
  };

  return (
    <>
      <ToastContainer />
      <form className="SugarSaleReturnSale-container" onSubmit={handleSubmit}>
        <h5 className="Heading">Sugar Sale Return</h5>
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
          <NavigationButtons
            handleFirstButtonClick={handleFirstButtonClick}
            handlePreviousButtonClick={handlePreviousButtonClick}
            handleNextButtonClick={handleNextButtonClick}
            handleLastButtonClick={handleCancel}
            highlightedButton={highlightedButton}
            isEditing={isEditing}
          />
        </div>
        <div>
          <SugarSaleReturnReport doc_no={formData.doc_no} disabledFeild={!addOneButtonEnabled}/>
        </div>
        <div className="SugarSaleReturnSale-row">
          <Grid container spacing={2} className="SugarSaleReturnSale-row">
            <Grid item xs={12} md={1}>
              <TextField
                label="Change No"
                variant="outlined"
                fullWidth
                name="changeNo"
                autoComplete="off"
                onKeyDown={handleKeyDown}
                disabled={!addOneButtonEnabled}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                inputRef={setFocusTaskdate}
                label="Bill No"
                variant="outlined"
                fullWidth
                name="doc_no"
                autoComplete="off"
                value={formData.doc_no}
                onChange={handleChange}
                disabled
                size="small"
              />
            </Grid>
            <label style={{ marginTop: "25px", marginLeft: "20px" }} >
              Purchase No
            </label>
            <div style={{ marginTop: "25px" }}>
              <div >
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
            <Grid item xs={12} md={1}>
              <TextField
                inputRef={setFocusTaskdate}
                label="Year"
                variant="outlined"
                fullWidth
                name="Year_Code"
                autoComplete="off"
                value={formData.Year_Code}
                onChange={handleChange}
                size="small"
                disabled={!isEditing && addOneButtonEnabled}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                label="Date"
                variant="outlined"
                fullWidth
                type="date"
                name="doc_date"
                value={formData.doc_date}
                onChange={(e) => handleDateChange(e, "doc_date")}
                disabled={!isEditing && addOneButtonEnabled}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

          </Grid>
        </div>
        <br></br>
        <div className="SugarSaleReturnSale-row">
          <label >
            From A/C:
          </label>
          <div >
            <div className="SugarSaleReturnSale-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillFrom}
                CategoryName={partyName}
                CategoryCode={partyCode}
                name="Ac_Code"
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
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
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        <div className="SugarSaleReturnSale-row">
          <label htmlFor="Unit_Code" className="SugarSaleReturnSale-form-label">
            Unit :
          </label>
          <div className="SugarSaleReturnSale-col">
            <div className="SugarSaleReturnSale-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleShipTo}
                CategoryName={unitName}
                CategoryCode={unitCode}
                name="Unit_Code"
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
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <div className="SugarSaleReturnSale-row">
            <Grid container spacing={2} className="SugarSaleReturnSale-row">
              <Grid item xs={12} md={2} ml={1}>
                <TextField
                  label="From"
                  variant="outlined"
                  fullWidth
                  name="FROM_STATION"
                  autoComplete="off"
                  value={formData.FROM_STATION}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="To"
                  variant="outlined"
                  fullWidth
                  name="TO_STATION"
                  autoComplete="off"
                  value={formData.TO_STATION}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Lorry No"
                  variant="outlined"
                  fullWidth
                  name="LORRYNO"
                  autoComplete="off"
                  value={formData.LORRYNO}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={1}>
                <TextField
                  label="Warehouse"
                  variant="outlined"
                  fullWidth
                  name="wearhouse"
                  autoComplete="off"
                  value={formData.wearhouse}
                  onChange={handleChange}
                  disabled={!isEditing && addOneButtonEnabled}
                  size="small"

                />
              </Grid>
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
                    disabledFeild={!isEditing && addOneButtonEnabled}
                  />
                </div>
              </div>

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

        <br></br>
        {/*detail part popup functionality and Validation part Grid view */}
        <div className="">
          {showPopup && (
            <div className="modal" role="dialog" style={{ display: "block" }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {selectedUser.id ? "Edit" : "Add"}
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

                      <div className="form-row">
                        <div className="form-group">
                          <label className="SugarSaleReturnSale-form-label">Quantal:</label>
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="Quantal"
                            autoComplete="off"
                            value={formDataDetail.Quantal}
                            onChange={handleChangeDetail}
                          />
                          {formErrors.Quantal && <p className="error-message">{formErrors.Quantal}</p>}
                        </div>
                        <div className="form-group">
                          <label className="SugarSaleReturnSale-form-label">Packing:</label>
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="packing"
                            autoComplete="off"
                            value={formDataDetail.packing}
                            onChange={handleChangeDetail}
                          />
                          {formErrors.packing && <p className="error-message">{formErrors.packing}</p>}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="SugarSaleReturnSale-form-label">Bags:</label>
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="bags"
                            autoComplete="off"
                            value={formDataDetail.bags}
                            onChange={handleChangeDetail}
                          />
                          {formErrors.bags && <p className="error-message">{formErrors.bags}</p>}
                        </div>
                        <div className="form-group">
                          <label className="SugarSaleReturnSale-form-label">Rate:</label>
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="rate"
                            autoComplete="off"
                            value={formDataDetail.rate}
                            onChange={handleChangeDetail}
                          />
                          {formErrors.rate && <p className="error-message">{formErrors.rate}</p>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="SugarSaleReturnSale-form-label">Item Amount:</label>
                          <input
                            type="text"
                            tabIndex="5"
                            className="SugarSaleReturnSale-form-control"
                            name="item_Amount"
                            autoComplete="off"
                            value={formDataDetail.item_Amount}
                            onChange={handleChangeDetail}
                          />
                          {formErrors.item_Amount && <p className="error-message">{formErrors.item_Amount}</p>}
                        </div>
                        <div className="form-group">
                          <label className="SugarSaleReturnSale-form-label">Narration:</label>
                          <textarea
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
          <Grid container spacing={2} className="SugarSaleReturnSale-row">
            <Grid item xs={12} md={1}>
              <TextField
                label="Net Quantal"
                variant="outlined"
                fullWidth
                name="NETQNTL"
                autoComplete="off"
                value={formData.NETQNTL}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
                error={!!formErrors.NETQNTL}
                helperText={formErrors.NETQNTL}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                label="Due Days"
                variant="outlined"
                fullWidth
                name="Due_Days"
                autoComplete="off"
                value={formData.Due_Days}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <TextField
                label="PO Details"
                variant="outlined"
                fullWidth
                name="PO_Details"
                autoComplete="off"
                value={formData.PO_Details}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <div className="SugarSaleReturnSale-row">
              <label
                htmlFor="Transport_Code"
                style={{ marginTop: "20px", marginLeft: "20px" }}
              >
                Transport:
              </label>
              <div className="SugarSaleReturnSale-col">
                <div className="SugarSaleReturnSale-form-group" style={{ marginTop: "20px" }}>
                  <AccountMasterHelp
                    onAcCodeClick={handleTransport}
                    CategoryName={transportName}
                    CategoryCode={transportCode}
                    name="Transport_Code"
                    disabledFeild={!isEditing && addOneButtonEnabled}
                  />
                </div>
              </div>
            </div>
          </Grid>
        </div>
        <br></br>
        <br></br>
        <Grid container spacing={2} className="SugarSaleReturnSale-row">
          <Grid item xs={12} md={2}>
            <TextField
              label="ASN/GRN No"
              variant="outlined"
              fullWidth
              name="ASN_No"
              autoComplete="off"
              value={formData.ASN_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="EWayBill No"
              variant="outlined"
              fullWidth
              name="Eway_Bill_No"
              autoComplete="off"
              value={formData.Eway_Bill_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="ACK No"
              variant="outlined"
              fullWidth
              name="ackno"
              autoComplete="off"
              value={formData.ackno}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="EInvoice No"
              variant="outlined"
              fullWidth
              name="einvoiceno"
              autoComplete="off"
              value={formData.einvoiceno}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
        <br></br>

        <Grid container style={{ float: "right" }}>
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">Subtotal:</label>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              variant="outlined"
              name="subTotal"
              autoComplete="off"
              value={formData.subTotal}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.subTotal}
              helperText={formErrors.subTotal}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }} >
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">Add Frt. Rs:</label>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              name="LESS_FRT_RATE"
              autoComplete="off"
              value={formData.LESS_FRT_RATE}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.LESS_FRT_RATE}
              helperText={formErrors.LESS_FRT_RATE}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              name="freight"
              autoComplete="off"
              value={formData.freight}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.freight}
              helperText={formErrors.freight}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }} >
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">CGST:</label>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              name="CGSTRate"
              autoComplete="off"
              value={formData.CGSTRate}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.CGSTRate}
              helperText={formErrors.CGSTRate}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />

          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField

              variant="outlined"
              name="CGSTAmount"
              autoComplete="off"
              value={formData.CGSTAmount}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.CGSTAmount}
              helperText={formErrors.CGSTAmount}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }} >
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">SGST:</label>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              name="SGSTRate"
              autoComplete="off"
              value={formData.SGSTRate}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.SGSTRate}
              helperText={formErrors.SGSTRate}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              name="SGSTAmount"
              autoComplete="off"
              value={formData.SGSTAmount}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.SGSTAmount}
              helperText={formErrors.SGSTAmount}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }} >
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">IGST:</label>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              name="IGSTRate"
              autoComplete="off"
              value={formData.IGSTRate}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.IGSTRate}
              helperText={formErrors.IGSTRate}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              name="IGSTAmount"
              autoComplete="off"
              value={formData.IGSTAmount}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.IGSTAmount}
              helperText={formErrors.IGSTAmount}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">MISC:</label>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              variant="outlined"
              fullWidth
              name="OTHER_AMT"
              value={formData.OTHER_AMT}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.OTHER_AMT)}
              helperText={formErrors.OTHER_AMT || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">Cash Advance:</label>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              variant="outlined"
              fullWidth
              name="cash_advance"
              value={formData.cash_advance}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.cash_advance)}
              helperText={formErrors.cash_advance || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">Bill Amount:</label>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              variant="outlined"
              fullWidth
              name="Bill_Amount"
              value={formData.Bill_Amount || 0}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.Bill_Amount)}
              helperText={formErrors.Bill_Amount || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }} >
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">TCS:</label>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              fullWidth
              name="TCS_Rate"
              value={formData.TCS_Rate}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.TCS_Rate)}
              helperText={formErrors.TCS_Rate || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              fullWidth
              name="TCS_Amt"
              value={formData.TCS_Amt || 0}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.TCS_Amt)}
              helperText={formErrors.TCS_Amt || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }} >
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">TDS:</label>
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              fullWidth
              name="TDS_Rate"
              value={formData.TDS_Rate}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.TDS_Rate)}
              helperText={formErrors.TDS_Rate || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <TextField
              variant="outlined"
              fullWidth
              name="TDS_Amt"
              value={formData.TDS_Amt !== null ? formData.TDS_Amt : ""}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.TDS_Amt)}
              helperText={formErrors.TDS_Amt || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} alignItems="center" style={{ marginTop: '-6px' }}>
          <Grid item xs={1}>
            <label className="debitCreditNote-form-label">Net Payable:</label>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              variant="outlined"
              fullWidth
              name="TCS_Net_Payable"
              value={formData.TCS_Net_Payable || 0}
              onChange={handleChange}
              onKeyDown={handleKeyDownCalculations}
              disabled={!isEditing && addOneButtonEnabled}
              error={Boolean(formErrors.TCS_Net_Payable)}
              helperText={formErrors.TCS_Net_Payable || ''}
              size="small"
              inputProps={{
                sx: { textAlign: 'right' },
                inputMode: 'decimal',
                pattern: '[0-9]*[.,]?[0-9]+',
                onInput: validateNumericInput,
              }}
            />
          </Grid>
        </Grid>
      </form>
    </>
  );
};
export default SugarSaleReturnSale;
