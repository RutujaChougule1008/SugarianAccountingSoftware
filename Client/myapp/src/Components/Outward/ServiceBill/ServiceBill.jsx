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
import "./ServiceBill.css";
import { HashLoader } from "react-spinners";
import { z } from "zod";
// Validation Part Using Zod Library
const stringToNumber = z
  .string()
  .refine((value) => !isNaN(Number(value)), {
    message: "This field must be a number",
  })
  .transform((value) => Number(value));

// Validation Schemas
const ServiceBillSchema = z.object({
  //   texable_amount: stringToNumber.refine(value => value !== undefined && value >= 0),
  //   bill_amount: stringToNumber.refine(value => value !== undefined && value >= 0),
  //   TCS_Net_Payable: stringToNumber.refine(value => value !== undefined && value >= 0),
});

//Global Variables
var newSaleid = "";
var partyName = "";
var partyCode = "";
var millName = "";
var millCode = "";
var unitName = "";
var unitCode = "";
var itemName = "";
var item_Code = "";
var gstrate = "";
var gstRateCode = "";
var gstName = "";
var billToName = "";
var billToCode = "";
var gstStateCode = "";

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");

const ServiceBill = () => {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [item_Name, setItemName] = useState("");
  const [itemCodeAccoid, setItemCodeAccoid] = useState("");
  const [formDataDetail, setFormDataDetail] = useState({
    Description: "",
    Amount: 0.0,
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

  //In utility page record doubleClicked that recod show for edit functionality
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const navigate = useNavigate();
  const setFocusTaskdate = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialFormData = {
    Doc_No: '', 
    Date: new Date().toISOString().split("T")[0],
    Customer_Code: '', 
    GstRateCode: '', 
    Subtotal: 0.00, 
    CGSTRate: 0.00, 
    CGSTAmount: 0.00, 
    SGSTRate: 0.00, 
    SGSTAmount: 0.00, 
    IGSTRate: 0.00, 
    IGSTAmount: 0.00, 
    Total: 0.00, 
    Round_Off: 0.00, 
    Final_Amount: 0.00, 
    IsTDS: 'N', 
    TDS_Ac: '', 
    TDS_Per: 0.00, 
    TDSAmount: 0.00, 
    TDS: 0.00, 
    Company_Code: companyCode, 
    Year_Code: Year_Code, 
    Branch_Code: '', 
    Created_By: '', 
    Modified_By: '', 
    billno: '', 
    cc: '', 
    ta: '',
    TCS_Rate: 0.000, 
    TCS_Amt: 0.00, 
    TCS_Net_Payable: 0.00, 
    einvoiceno: '', 
    ackno: '',
    QRCode: '', 
    IsDeleted: 0, 
    gstid: '' 
  };

  const [formData, setFormData] = useState(initialFormData);
  const [billFrom, setBillFrom] = useState("");
  const [partyMobNo, setPartyMobNo] = useState("");
  const [tdsAc, setTDSAc] = useState("");
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  

  const handleKeyDownCalculations = async (event) => {
    if (event.key === "Tab") {
      // event.preventDefault();

      const { name, value } = event.target;

    
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
      validateField(name, value);
    }
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
  }, []);

  // Validation Part
  const validateField = (name, value) => {
    try {
      ServiceBillSchema.pick({ [name]: true }).parse({ [name]: value });
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
      ServiceBillSchema.parse(formData);
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
      `${API_URL}/get-next-bill-no?Company_Code=${companyCode}&Year_Code=${Year_Code}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        const newDocNo = data.next_doc_no;
        setFormData((prevState) => ({
          ...prevState,
          Doc_No: newDocNo,
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

    const head_data = {
      ...formData,
      GstRateCode: gstCode || gstRateCode,
    };

    if (isEditMode) {
      delete head_data.rbid;
    }
    const detail_data = users.map((user) => ({
      rowaction: user.rowaction,
      rbdid: user.rbdid,
      Item_Code: user.Item_Code,
      Description: user.Description,
      ic: user.ic || itemCodeAccoid,
      Detail_Id: 1,
      Company_Code: companyCode,
      Year_Code: Year_Code,
      Amount: user.Amount,
      
    }));

    const requestData = {
        head_data,
        detail_data,
    };

    try {
      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update-servicebill?rbid=${newSaleid}`;
        const response = await axios.put(updateApiUrl, requestData);

        toast.success("Data updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const response = await axios.post(
          `${API_URL}/insert-servicebill`,
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
      `Are you sure you want to delete this Task No ${formData.Doc_No}?`
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
        const deleteApiUrl = `${API_URL}/delete_data_by_rbid?rbid=${newSaleid}&Company_Code=${companyCode}&doc_no=${formData.Doc_No}&Year_Code=${Year_Code}`;
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
      const response = await axios.get(`${API_URL}/get-lastservicebilldata?Company_Code=${companyCode}&Year_Code=${Year_Code}`);
      if (response.status === 200) {
        const { last_head_data, last_details_data, service_labels } = response.data;

        const detailsArray = Array.isArray(last_details_data) ? last_details_data : [];


        newSaleid = last_head_data.rbid;
        partyName = service_labels[0].partyname;
        partyCode = last_head_data.Customer_Code;
        billToName = service_labels[0].millname;
        billToCode = last_head_data.TDS_Ac;
        gstRateCode = last_head_data.GstRateCode;
        gstName = service_labels[0].GST_Name;
        itemName = service_labels[0].itemname;
        item_Code = last_details_data.Item_Code;

        const itemNameMap = service_labels.reduce((map, label) => {
            if (label.Item_Code !== undefined && label.itemname) {
              map[label.Item_Code] = label.itemname;
            }
            return map;
          }, {});

          const enrichedDetails = detailsArray.map((detail) => ({
            ...detail,
            itemname: itemNameMap[detail.Item_Code] || "Unknown Item",
          }));
        // Prepare head data for setting form state
        setFormData((prevData) => ({
            ...prevData,
            ...last_head_data,
          }));
        // Ensure that last_details_data is treated as an array and combined with relevant label data
        setLastTenderData(last_head_data || {});
        setLastTenderDetails(enrichedDetails);
       
      } else {
        console.error("Failed to fetch last data:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
};


  const handleBack = () => {
    navigate("/ServiceBill-utility");
  };

  const handleFirstButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/get-firstservicebill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const { first_head_data, first_details_data, service_labels } = response.data;

        const detailsArray = Array.isArray(first_details_data) ? first_details_data : [];


        newSaleid = first_head_data.rbid;
        partyName = service_labels[0].partyname;
        partyCode = first_head_data.Customer_Code;
        billToName = service_labels[0].millname;
        billToCode = first_head_data.TDS_Ac;
        gstRateCode = first_head_data.GstRateCode;
        gstName = service_labels[0].GST_Name;
        itemName = service_labels[0].itemname;
        item_Code = first_details_data.Item_Code;

        const itemNameMap = service_labels.reduce((map, label) => {
            if (label.Item_Code !== undefined && label.itemname) {
              map[label.Item_Code] = label.itemname;
            }
            return map;
          }, {});

          const enrichedDetails = detailsArray.map((detail) => ({
            ...detail,
            itemname: itemNameMap[detail.Item_Code] || "Unknown Item",
          }));
        // Prepare head data for setting form state
        setFormData((prevData) => ({
            ...prevData,
            ...first_head_data,
          }));
        // Ensure that last_details_data is treated as an array and combined with relevant label data
        setLastTenderData(first_head_data || {});
        setLastTenderDetails(enrichedDetails);
       
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
        `${API_URL}/get-nextservicebill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&currentDocNo=${formData.Doc_No}`
      );
      if (response.status === 200) {
        const { next_head_data, next_details_data, service_labels } = response.data;

        const detailsArray = Array.isArray(next_details_data) ? next_details_data : [];


        newSaleid = next_head_data.rbid;
        partyName = service_labels[0].partyname;
        partyCode = next_head_data.Customer_Code;
        billToName = service_labels[0].millname;
        billToCode = next_head_data.TDS_Ac;
        gstRateCode = next_head_data.GstRateCode;
        gstName = service_labels[0].GST_Name;
        itemName = service_labels[0].itemname;
        item_Code = next_details_data.Item_Code;

        const itemNameMap = service_labels.reduce((map, label) => {
            if (label.Item_Code !== undefined && label.itemname) {
              map[label.Item_Code] = label.itemname;
            }
            return map;
          }, {});

          const enrichedDetails = detailsArray.map((detail) => ({
            ...detail,
            itemname: itemNameMap[detail.Item_Code] || "Unknown Item",
          }));
        // Prepare head data for setting form state
        setFormData((prevData) => ({
            ...prevData,
            ...next_head_data,
          }));
        // Ensure that last_details_data is treated as an array and combined with relevant label data
        setLastTenderData(next_head_data || {});
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
        `${API_URL}/get-previousservicebill-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&currentDocNo=${formData.Doc_No}`
      );

      if (response.status === 200) {
        const { previous_head_data, previous_details_data, service_labels } = response.data;

        const detailsArray = Array.isArray(previous_details_data) ? previous_details_data : [];


        newSaleid = previous_head_data.rbid;
        partyName = service_labels[0].partyname;
        partyCode = previous_head_data.Customer_Code;
        billToName = service_labels[0].millname;
        billToCode = previous_head_data.TDS_Ac;
        gstRateCode = previous_head_data.GstRateCode;
        gstName = service_labels[0].GST_Name;
        itemName = service_labels[0].itemname;
        item_Code = previous_details_data.Item_Code;

        const itemNameMap = service_labels.reduce((map, label) => {
            if (label.Item_Code !== undefined && label.itemname) {
              map[label.Item_Code] = label.itemname;
            }
            return map;
          }, {});

          const enrichedDetails = detailsArray.map((detail) => ({
            ...detail,
            itemname: itemNameMap[detail.Item_Code] || "Unknown Item",
          }));
        // Prepare head data for setting form state
        setFormData((prevData) => ({
            ...prevData,
            ...previous_head_data,
          }));
        // Ensure that last_details_data is treated as an array and combined with relevant label data
        setLastTenderData(previous_head_data || {});
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
    document.getElementById("Customer_Code").focus();
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
        `${API_URL}/getservicebillByid?doc_no=${selectedRecord.service_bill_head_data.Doc_No}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.status === 200) {
        const { service_bill_head, service_bill_details, service_labels } = response.data;

        const detailsArray = Array.isArray(service_bill_details) ? service_bill_details : [];


        newSaleid = service_bill_head.rbid;
        partyName = service_labels[0].partyname;
        partyCode = service_bill_head.Customer_Code;
        billToName = service_labels[0].millname;
        billToCode = service_bill_head.TDS_Ac;
        gstRateCode = service_bill_head.GstRateCode;
        gstName = service_labels[0].GST_Name;
        itemName = service_labels[0].itemname;
        item_Code = service_bill_details.Item_Code;

        const itemNameMap = service_labels.reduce((map, label) => {
            if (label.Item_Code !== undefined && label.itemname) {
              map[label.Item_Code] = label.itemname;
            }
            return map;
          }, {});

          const enrichedDetails = detailsArray.map((detail) => ({
            ...detail,
            itemname: itemNameMap[detail.Item_Code] || "Unknown Item",
          }));
        // Prepare head data for setting form state
        setFormData((prevData) => ({
            ...prevData,
            ...service_bill_head,
          }));
        // Ensure that last_details_data is treated as an array and combined with relevant label data
        setLastTenderData(service_bill_head || {});
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
          `${API_URL}/getservicebillByid?doc_no=${changeNoValue}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
        );
        const { service_bill_head, service_bill_details, service_labels } = response.data;

        const detailsArray = Array.isArray(service_bill_details) ? service_bill_details : [];


        newSaleid = service_bill_head.rbid;
        partyName = service_labels[0].partyname;
        partyCode = service_bill_head.Customer_Code;
        billToName = service_labels[0].millname;
        billToCode = service_bill_head.TDS_Ac;
        gstRateCode = service_bill_head.GstRateCode;
        gstName = service_labels[0].GST_Name;
        itemName = service_labels[0].itemname;
        item_Code = service_bill_details.Item_Code;

        const itemNameMap = service_labels.reduce((map, label) => {
            if (label.Item_Code !== undefined && label.itemname) {
              map[label.Item_Code] = label.itemname;
            }
            return map;
          }, {});

          const enrichedDetails = detailsArray.map((detail) => ({
            ...detail,
            itemname: itemNameMap[detail.Item_Code] || "Unknown Item",
          }));
        // Prepare head data for setting form state
        setFormData((prevData) => ({
            ...prevData,
            ...service_bill_head,
          }));
        // Ensure that last_details_data is treated as an array and combined with relevant label data
        setLastTenderData(service_bill_head || {});
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
      .reduce((sum, user) => sum + parseFloat(user.Amount || 0), 0);
  };

  

  const calculateDependentValues = async (
    name,
    input,
    formData,
    matchStatus,
    gstRate
  ) => {
    const updatedFormData = { ...formData, [name]: input };
    const subtotal = parseFloat(updatedFormData.Subtotal) || 0.0;

    const rate = gstRate;

   
    

    if (matchStatus === "TRUE") {
      updatedFormData.CGSTRate = (rate / 2).toFixed(2);
      updatedFormData.SGSTRate = (rate / 2).toFixed(2);
      updatedFormData.IGSTRate = 0.0;

      updatedFormData.CGSTAmount = (
        (updatedFormData.Subtotal * updatedFormData.CGSTRate) /
        100
      ).toFixed(2);
      updatedFormData.SGSTAmount = (
        (updatedFormData.Subtotal * updatedFormData.SGSTRate) /
        100
      ).toFixed(2);
      updatedFormData.IGSTAmount = 0.0;
    } else {
      updatedFormData.IGSTRate = rate.toFixed(2);
      updatedFormData.CGSTRate = 0.0;
      updatedFormData.SGSTRate = 0.0;

      updatedFormData.IGSTAmount = (
        (updatedFormData.Subtotal * updatedFormData.IGSTRate) /
        100
      ).toFixed(2);
      updatedFormData.CGSTAmount = 0.0;
      updatedFormData.SGSTAmount = 0.0;
    }

   

    const RoundOff = parseFloat(updatedFormData.Round_Off) || 0.0;

   
    updatedFormData.Total = (
      updatedFormData.Subtotal +
      parseFloat(updatedFormData.CGSTAmount) +
      parseFloat(updatedFormData.SGSTAmount) +
      parseFloat(updatedFormData.IGSTAmount)
    ).toFixed(2);

    updatedFormData.Final_Amount = (parseFloat(updatedFormData.Total)+RoundOff).toFixed(2)

    const tcsRate = parseFloat(updatedFormData.TCS_Rate) || 0.0;
    updatedFormData.TCS_Amt = (
      (updatedFormData.Final_Amount * tcsRate) /
      100
    ).toFixed(2);
    updatedFormData.TCS_Net_Payable = (
      parseFloat(updatedFormData.Final_Amount) +
      parseFloat(updatedFormData.TCS_Amt)
    ).toFixed(2);

    const tdsRate = parseFloat(updatedFormData.TDS_Per) || 0.0;
    updatedFormData.TDSAmount = (
      (updatedFormData.Subtotal * tdsRate) /
      100
    ).toFixed(2);

    return updatedFormData;
  };

  useEffect(() => {
    if (selectedRecord) {
      setUsers(
        lastTenderDetails.map((detail) => ({
          Item_Code: detail.Item_Code,
          item_Name: detail.item_Name,
          rowaction: "Normal",
      ic: detail.ic,
      id: detail.rbdid,
      rbdid: detail.rbdid,
      Description: detail.Description,
      Amount: detail.Amount,
      Detail_Id: detail.Detail_Id
        }))
      );
    }
  }, [selectedRecord, lastTenderDetails]);

  useEffect(() => {
    const updatedUsers = lastTenderDetails.map((detail) => ({
      Item_Code: detail.Item_Code,
      item_Name: detail.itemname,
      rowaction: "Normal",
      ic: detail.ic,
      id: detail.rbdid,
      rbdid: detail.rbdid,
      Description: detail.Description,
      Amount: detail.Amount,
      Detail_Id: detail.Detail_Id
    }));
    setUsers(updatedUsers);
  }, [lastTenderDetails]);

//   const calculateDetails = (quantal, packing, rate) => {
//     const bags = packing !== 0 ? (quantal / packing) * 100 : 0;
//     const item_Amount = quantal * rate;
//     return { bags, item_Amount };
//   };

  

  const handleChangeDetail = (event) => {
    const { name, value } = event.target;
    setFormDataDetail((prevDetail) => {
      const updatedDetail = {
        ...prevDetail,
        [name]:
          value
      };

      return updatedDetail;
    });
  };

  const addUser = async () => {
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      Item_Code: itemCode,
      item_Name: item_Name,
      ic: itemCodeAccoid,
      
      ...formDataDetail,
      rowaction: "add",
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);

    

    const subtotal = calculateTotalItemAmount(updatedUsers);
    let updatedFormData = {
      ...formData,
      Subtotal: subtotal,
    };

    const matchStatus = await checkMatchStatus(
      updatedFormData.Customer_Code,
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
          Item_Code: itemCode,
          item_Name: item_Name,
          ic: itemCodeAccoid,
          Description: formDataDetail.Description,
          Amount: formDataDetail.Amount,
          rowaction: updatedRowaction,
        };
      } else {
        return user;
      }
    });

    setUsers(updatedUsers);

    

    const subtotal = calculateTotalItemAmount(updatedUsers);

    let updatedFormData = {
      ...formData,
     
      Subtotal: subtotal,
    };
    const matchStatus = await checkMatchStatus(
      updatedFormData.Customer_Code,
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

    

    const subtotal = calculateTotalItemAmount(updatedUsers);
    let updatedFormData = {
      ...formData,
     
      Subtotal: subtotal,
    };

    const matchStatus = await checkMatchStatus(
      updatedFormData.Customer_Code,
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

    

    const subtotal = calculateTotalItemAmount(updatedUsers);
    let updatedFormData = {
      ...formData,
      
      Subtotal: subtotal,
    };

    const matchStatus = await checkMatchStatus(
      updatedFormData.Customer_Code,
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
      Description: "",
      Amount: 0.0
    });
    setItemCode("");
    setItemName("");
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setItemCode(user.Item_Code);
    setItemName(user.item_Name);
   
    setFormDataDetail({
     Description: user.Description,
     Amount: user.Amount
    });
    openPopup("edit");
  };

  const handleItemCode = (code, accoid, hsn, name) => {
    setItemCode(code);
    setItemName(name);
    setItemCodeAccoid(accoid);
  };


  //Head Section help Functions to manage the Ac_Code and accoid
  const handleBillFrom = async (code, accoid, name, mobileNo,gstNo,TDSApplicable,GstStateCode) => {
    gstStateCode = GstStateCode ; 
    setBillFrom(code);
    setPartyMobNo(mobileNo);
    let updatedFormData = {
      ...formData,
      Customer_Code: code,
      cc: accoid,
    };
    try {
      const matchStatusResult = await checkMatchStatus(
        code,
        companyCode,
        Year_Code
      );
      setMatchStatus(matchStatusResult);

      // if (matchStatusResult === "TRUE") {
      //   toast.success("GST State Codes match!");
      // } else {
      //   toast.warn("GST State Codes do not match.");
      // }

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
  const handleBillNo = () => {};

  const handleTDSAc = (code, accoid) => {
    setTDSAc(code);
    setFormData({
      ...formData,
      TDS_Ac: code,
      ta: accoid,
    });
  };

  const handleMillData = (code, accoid, name, mobileNo, gstno) => {
    setMill(code);
    setMillName(name);
    setMillGSTNo(gstno);
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
        updatedFormData.Customer_Code,
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
  const handleTransport = (code, accoid, name, mobileNo) => {
    setTransport(code);
    setTransportMob(mobileNo);
    setFormData({
      ...formData,
      Transport_Code: code,
      tc: accoid,
    });
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
      <form className="ServiceBill-container" onSubmit={handleSubmit}>
        <h6 className="Heading">Service Bill</h6>

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

        {/* <ServiceBillReport doc_no = {formData.doc_no}/> */}

        <div className="ServiceBill-row">
          <label className="ServiceBill-form-label">Change No:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                type="text"
                className="ServiceBill-form-control"
                name="changeNo"
                autoComplete="off"
                onKeyDown={handleKeyDown}
                disabled={!addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="ServiceBill-form-label">Bill No:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                ref={setFocusTaskdate}
                type="text"
                className="ServiceBill-form-control"
                name="Doc_No"
                autoComplete="off"
                value={formData.Doc_No}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <label className="ServiceBill-form-label">Bill Date:</label>
          <div className="ServiceBill-col">
            <div className="ServiceBill-form-group">
              <input
                tabIndex="1"
                ref={setFocusTaskdate}
                type="date"
                className="ServiceBill-form-control"
                id="datePicker"
                name="Date"
                value={formData.Date}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>

        <div className="ServiceBill-row">
          <label htmlFor="Customer_Code" className="ServiceBill-form-label">
            Customer:
          </label>
          <div className="ServiceBill-col">
            <div className="ServiceBill-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleBillFrom}
                CategoryName={partyName}
                CategoryCode={partyCode}
                name="Customer_Code"
                tabIndexHelp={1}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
        </div>
        <div className="ServiceBill-row">
          
          <label className="ServiceBill-form-label">State Code:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                type="text"
                className="ServiceBill-form-control"
                name="state"
                autoComplete="off"
                value={gstStateCode}
                disabled={!isEditing && addOneButtonEnabled}
                tabIndex={5}
              />
            </div>
          </div>
          <label htmlFor="GstRateCode" className="ServiceBill-form-label">
            GST Rate Code:
          </label>
          <div className="ServiceBill-col">
            <div className="ServiceBill-form-group">
              <GSTRateMasterHelp
                onAcCodeClick={handleGstCode}
                GstRateName={gstName}
                GstRateCode={gstRateCode}
                name="GstRateCode"
                tabIndexHelp={10}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="ServiceBill-form-label">Bill No:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                type="text"
                className="ServiceBill-form-control"
                name="billno"
                autoComplete="off"
                value={formData.billno}
                onChange={handleChange}
                disabled={!isEditing && addOneButtonEnabled}
                tabIndex={7}
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
                          CategoryName={item_Name}
                          CategoryCode={itemCode}
                          SystemType="I"
                          name="Item_Code"
                          tabIndexHelp={14}
                          className="account-master-help"
                        />
                      </div>

        

                      <label className="ServiceBill-form-label">Description:</label>
                      <div className="ServiceBill-col-Ewaybillno">
                        <div className="ServiceBill-form-group">
                          <input
                            type="text"
                            tabIndex="16"
                            className="ServiceBill-form-control"
                            name="Description"
                            autoComplete="off"
                            value={formDataDetail.Description}
                            onChange={handleChangeDetail}
                          />
                        </div>
                      </div>
                      <label className="ServiceBill-form-label">Amount:</label>
                      <div className="ServiceBill-col-Ewaybillno">
                        <div className="ServiceBill-form-group">
                          <input
                            type="text"
                            tabIndex="17"
                            className="ServiceBill-form-control"
                            name="Amount"
                            autoComplete="off"
                            value={formDataDetail.Amount}
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
                        tabIndex="22"
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
                        tabIndex="23"
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
                      tabIndex="24"
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
                tabIndex="12"
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
                tabIndex=""
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
                  <th>Description</th>
                  <th>Amount</th>
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
                    <td>{user.Item_Code}</td>
                    <td>{user.item_Name || user.itemname}</td>
                    <td>{user.Description}</td>
                    <td>{user.Amount}</td>
                    {/* <td>{user.saledetailid}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ServiceBill-row">
          

          

        <label className="ServiceBill-form-label">SubTotal:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="13"
                type="text"
                className="ServiceBill-form-control"
                name="Subtotal"
                autoComplete="off"
                value={formData.Subtotal}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="ServiceBill-form-label">CGST:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="14"
                type="text"
                className="ServiceBill-form-control"
                name="CGSTRate"
                autoComplete="off"
                value={formData.CGSTRate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                // tabIndex="15"
                type="text"
                className="ServiceBill-form-control"
                name="CGSTAmount"
                autoComplete="off"
                value={formData.CGSTAmount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="ServiceBill-form-label">SGST:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="16"
                type="text"
                className="ServiceBill-form-control"
                name="SGSTRate"
                autoComplete="off"
                value={formData.SGSTRate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                // tabIndex="17"
                type="text"
                className="ServiceBill-form-control"
                name="SGSTAmount"
                autoComplete="off"
                value={formData.SGSTAmount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="ServiceBill-form-label">IGST:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="18"
                type="text"
                className="ServiceBill-form-control"
                name="IGSTRate"
                autoComplete="off"
                value={formData.IGSTRate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />

              <input
                // tabIndex="19"
                type="text"
                className="ServiceBill-form-control"
                name="IGSTAmount"
                autoComplete="off"
                value={formData.IGSTAmount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
         
         
          <label className="ServiceBill-form-label">Total:</label>
          <div className="ServiceBill-col-Ewaybillno">
            <div className="ServiceBill-form-group">
              <input
                type="text"
                className="ServiceBill-form-control"
                name="Total"
                autoComplete="off"
                value={formData.Total}
                onChange={handleChange}
                // tabIndex="11"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="ServiceBill-form-label">Round Off</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="18"
                type="text"
                className="ServiceBill-form-control"
                name="Round_Off"
                autoComplete="off"
                value={formData.Round_Off}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="ServiceBill-form-label">Final Amount:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="21"
                type="text"
                className="ServiceBill-form-control"
                name="Final_Amount"
                autoComplete="off"
                value={formData.Final_Amount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                style={{ color: "red", fontWeight: "bold" }}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="ServiceBill-form-label">TCS %:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="22"
                type="text"
                className="ServiceBill-form-control"
                name="TCS_Rate"
                autoComplete="off"
                value={formData.TCS_Rate}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
              <input
                // tabIndex="23"
                type="text"
                className="ServiceBill-form-control"
                name="TCS_Amt"
                autoComplete="off"
                value={formData.TCS_Amt}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="ServiceBill-form-label">Net Payable:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="24"
                type="text"
                className="ServiceBill-form-control"
                name="TCS_Net_Payable"
                autoComplete="off"
                style={{ color: "red", fontWeight: "bold" }}
                value={formData.TCS_Net_Payable}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          
          
          
          
          
          
          
    
          

          
        <div className="ServiceBill-row">
          

        <label htmlFor="IsTDS" className="ServiceBill-form-label">
            Is TDS Applicable
          </label>
          <div className="ServiceBill-col">
            <div className="ServiceBill-form-group-type">
              <select
                id="IsTDS"
                tabIndex="11"
                name="IsTDS"
                className="ServiceBill-custom-select"
                value={formData.IsTDS}
                onChange={handleChange}
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
          </div>

          <label htmlFor="TDS_Ac" className="ServiceBill-form-label">
            TDS A/C:
          </label>
          <div className="ServiceBill-col">
            <div className="ServiceBill-form-group">
              <AccountMasterHelp
                onAcCodeClick={handleTDSAc}
                CategoryName={billToName}
                CategoryCode={billToCode}
                name="TDS_Ac"
                tabIndexHelp={1}
                disabledFeild={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
          <label className="ServiceBill-form-label">TDS %:</label>
          <div className="ServiceBill-col-Text">
            <div className="ServiceBill-form-group">
              <input
                // tabIndex="25"
                type="text"
                className="ServiceBill-form-control"
                name="TDS_Per"
                autoComplete="off"
                value={formData.TDS_Per}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
              <input
                // tabIndex="26"
                type="text"
                className="ServiceBill-form-control"
                name="TDSAmount"
                autoComplete="off"
                value={formData.TDSAmount !== null ? formData.TDSAmount : ""}
                // value={formData.TDSAmount}
                onChange={handleChange}
                onKeyDown={handleKeyDownCalculations}
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="ServiceBill-form-label">EInvoice</label>
          <div className="ServiceBill-col-Ewaybillno">
            <div className="ServiceBill-form-group">
              <input
                type="text"
                className="ServiceBill-form-control"
                name="einvoiceno"
                autoComplete="off"
                value={formData.einvoiceno}
                onChange={handleChange}
                // tabIndex="11"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>

          <label className="ServiceBill-form-label">ACK No:</label>
          <div className="ServiceBill-col-Ewaybillno">
            <div className="ServiceBill-form-group">
              <input
                type="text"
                className="ServiceBill-form-control"
                name="ackno"
                autoComplete="off"
                value={formData.ackno}
                onChange={handleChange}
                // tabIndex="11"
                disabled={!isEditing && addOneButtonEnabled}
              />
            </div>
          </div>
         

          
          
         

          

          
        </div>
        </div>

        <div className="ServiceBill-row">
          
        </div>
      </form>
    </>
  );
};
export default ServiceBill;