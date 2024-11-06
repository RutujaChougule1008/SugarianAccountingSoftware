import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import "./TenderPurchase.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import { z } from "zod";
import GSTRateMasterHelp from "../../../Helper/GSTRateMasterHelp";
import SystemHelpMaster from "../../../Helper/SystemmasterHelp";
import GradeMasterHelp from "../../../Helper/GradeMasterHelp";


// Validation Part Using Zod Library
const stringToNumber = z
  .string()
  .refine((value) => !isNaN(Number(value)), {
    message: "This field must be a number",
  })
  .transform((value) => Number(value));

const SugarTenderPurchaseSchema = z.object({
  Tender_No: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  Company_Code: z.string().optional(),
  Tender_Date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  Lifting_Date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  Mill_Code: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  Grade: z.string().optional(),
  Quantal: z.preprocess((val) => Number(val), z.number().nonnegative()),
  Packing: z.preprocess((val) => Number(val), z.number().nonnegative()),
  Bags: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  Payment_To: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  Tender_From: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  Tender_DO: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  Voucher_By: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  Broker: z.string().optional(),
  Excise_Rate: z.preprocess((val) => Number(val), z.number().nonnegative()),
  Narration: z.string().optional(),
  Mill_Rate: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  Created_By: z.string().optional(),
  Modified_By: z.string().optional(),
  Year_Code: z.string().optional(),
  Purc_Rate: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  type: z.string().default("M"),
  Branch_Id: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  Voucher_No: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  Sell_Note_No: z.string().optional(),
  Brokrage: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  mc: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  itemcode: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  season: z.string().optional(),
  pt: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  tf: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  td: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  vb: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  bk: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  ic: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  gstratecode: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  CashDiff: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  TCS_Rate: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  TCS_Amt: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  commissionid: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  Voucher_Type: z.string().optional(),
  Party_Bill_Rate: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  TDS_Rate: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  TDS_Amt: z.preprocess((val) => Number(val), z.number().nonnegative()), // Convert to number if necessary
  Temptender: z.enum(["Y", "N"]).default("N"), // Limited to 'Y' or 'N'
  AutoPurchaseBill: z.enum(["Y", "N"]).default("Y"), // Limited to 'Y' or 'N'
  Bp_Account: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  bp: z.preprocess((val) => Number(val), z.number().int().nonnegative()),
  groupTenderNo: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  groupTenderId: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative()
  ),
  tenderid: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative().nullable()
  ), // Nullable for tenderid
});

var millCodeName;
var newMill_Code;
var gradeName;
var newGrade;
var paymentToName;
var newPayment_To;
var tenderFromName;
var newTender_From;
var tenderDOName;
var newTender_DO;
var voucherByName;
var newVoucher_By;
var brokerName;
var newBroker;
var itemName;
var newitemcode;
var gstRateName;
var gstRateCode;
var newgstratecode;
var bpAcName;
var newBp_Account;
var billToName;
var newBillToCode;
var shipToName;
var shipToCode;
var subBrokerName;
var subBrokerCode;
var newTenderId;
var selfAcCode;
var selfAcName;
var selfAccoid;
var buyerPartyCode;
var buyer_party_name;
const TenderPurchase = () => {
  const [updateButtonClicked, setUpdateButtonClicked] = useState(false);
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
  const [accountCode, setAccountCode] = useState("");
  const [millCode, setMillCode] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [grade, setGrade] = useState("");
  const [bpAcCode, setBpAcCode] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [tdsApplicable, setTdsApplicalbe] = useState("N");
  const [tenderFrom, setTenderFrom] = useState("");
  const [tenderDO, setTenderDO] = useState("");
  const [voucherBy, setVoucherBy] = useState("");
  const [broker, setBroker] = useState("");
  const [GstRate, setGSTRate] = useState("");
  const [lastTenderDetails, setLastTenderDetails] = useState([]);
  const [lastTenderData, setLastTenderData] = useState({});
  const [gstCode, setGstCode] = useState("");
  const [billtoName, setBillToName] = useState("");
  const [brokerDetail, setBrokerDetail] = useState("");
  const [shiptoName, setShipToName] = useState("");
  const [isGstRateChanged, setIsGstRateChanged] = useState(false);
  const [tenderFrName, setTenderFrName] = useState("");
  const [tenderDONm, setTenderDOName] = useState("");
  const [voucherbyName, setVoucherByName] = useState("");
  const [dispatchType, setDispatchType] = useState(null);
  const [buyerParty, setBuyerParty] = useState(selfAcCode);
  const [buyerPartyAccoid, setBuyerPartyAccoid] = useState(selfAccoid);
  const [buyerPartyName, setBuyerPartyName] = useState(selfAcName);
  const [errors, setErrors] = useState({});

  const companyCode = sessionStorage.getItem("Company_Code");
  const Year_Code = sessionStorage.getItem("Year_Code");
  const API_URL = process.env.REACT_APP_API;

  const type = useRef(null);

  const navigate = useNavigate();
  //In utility page record doubleClicked that recod show for edit functionality
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const permissions = location.state?.permissionsData;

  const selectedTenderNo = location.state?.selectedTenderNo;
  const initialFormData = {
    Tender_No: 0,
    Company_Code: companyCode,
    Tender_Date: new Date().toISOString().split("T")[0],
    Lifting_Date: new Date().toISOString().split("T")[0],
    Mill_Code: 0,
    Grade: "",
    Quantal: 0.0,
    Packing: 50,
    Bags: 0,
    Payment_To: 0,
    Tender_From: 0,
    Tender_DO: 0,
    Voucher_By: 0,
    Broker: selfAcCode,
    Excise_Rate: 0.0,
    Narration: "",
    Mill_Rate: 0.0,
    Created_By: "",
    Modified_By: "",
    Year_Code: Year_Code,
    Purc_Rate: 0.0,
    type: "M",
    Branch_Id: 0,
    Voucher_No: 0,
    Sell_Note_No: "",
    Brokrage: 0.0,
    mc: 0,
    itemcode: 0,
    season: "",
    pt: 0,
    tf: 0,
    td: 0,
    vb: 0,
    bk: selfAccoid,
    ic: 0,
    gstratecode: 0,
    CashDiff: 0.0,
    TCS_Rate: 0.0,
    TCS_Amt: 0.0,
    commissionid: 0,
    Voucher_Type: "",
    Party_Bill_Rate: 0.0,
    TDS_Rate: 0.0,
    TDS_Amt: 0.0,
    Temptender: "N",
    AutoPurchaseBill: "Y",
    Bp_Account: 0,
    bp: 0,
    groupTenderNo: 0,
    groupTenderId: 0,
    tenderid: null,
  };

  const [formData, setFormData] = useState(initialFormData);

  const setFocusTaskdate = useRef(null);
  const [isHandleChange, setIsHandleChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //Deatil
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [billTo, setBillTo] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [detailBroker, setDetailBroker] = useState("");
  const [subBroker, setSubBroker] = useState("");
  const [billToAccoid, setBillToAccoid] = useState("");
  const [shipToAccoid, setShipToAccoid] = useState("");
  const [subBrokerAccoid, setSubBrokerAccoid] = useState("");
  const [self_ac_Code, setSelf_ac_code] = useState("");
  const [self_accoid, set_self_accoid] = useState("");
  const [self_acName, set_self_acName] = useState("");

  const [formDataDetail, setFormDataDetail] = useState({
    Buyer_Quantal: 0.0,
    Sale_Rate: 0.0,
    Commission_Rate: 0.0,
    Sauda_Date: new Date().toISOString().split("T")[0],
    Lifting_Date: formData?.Lifting_Date || "",
    Narration: "",
    tcs_rate: 0.0,
    gst_rate: 0.0,
    tcs_amt: 0.0,
    gst_amt: 0.0,
    CashDiff: 0.0,
    BP_Detail: 0,
    loding_by_us: "",
    DetailBrokrage: 0.0,
    Delivery_Type: dispatchType,
    sub_broker: 2,
    DetailBrokrage: 0.0,
  });

  useEffect(() => {
    const fetchDispatchType = async () => {
      try {
        const response = await fetch(
          `${API_URL}/get_dispatch_type/${companyCode}`
        );
        const data = await response.json();
        setDispatchType(data.dispatchType);
      } catch (error) {
        console.error("Error fetching dispatch type:", error);
      }
    };

    fetchDispatchType();
  }, [companyCode]);

  const calculateValues = (
    updatedFormData,
    updatedFormDataDetail,
    tdsApplicable,
    gstCode
  ) => {
    const {
      Quantal = 0,
      Packing = 50,
      Mill_Rate = 0,
      Purc_Rate = 0,
      Excise_Rate = 0,
      TCS_Rate = 0,
      TDS_Rate = 0,
    } = updatedFormData;

    const quantal = parseFloat(Quantal) || 0;
    const packing = parseFloat(Packing) || 50;
    const millRate = parseFloat(Mill_Rate) || 0;
    const purchaseRate = parseFloat(Purc_Rate) || 0;
    const exciseRate = (millRate * gstCode) / 100;
    const tcsRate = parseFloat(TCS_Rate) || 0;
    const tdsRate = parseFloat(TDS_Rate) || 0;

    const bags = (quantal / packing) * 100;
    const diff = millRate - purchaseRate;
    const exciseAmount = exciseRate;
    const gstAmt = exciseAmount + millRate;
    const amount =
      quantal * (formData.type === "M" ? millRate + exciseAmount : diff);

    console.log("Excise Rate", exciseAmount);

    let tcsAmt = 0;
    let tdsAmt = 0;

    if (tdsApplicable === "Y") {
      tdsAmt = quantal * millRate * (tdsRate / 100);
    } else {
      tcsAmt = amount * (tcsRate / 100);
    }

    // Calculate both regardless of TDS applicability
    const calculatedTcsAmt = amount * (tcsRate / 100);
    const calculatedTdsAmt = quantal * millRate * (tdsRate / 100);
    const {
      Buyer_Quantal = 0,
      Sale_Rate = 0,
      BP_Detail = 0,
      tcs_rate = 0,
      gst_rate = 0,
    } = updatedFormDataDetail;

    const buyerQuantalNum = parseFloat(Buyer_Quantal) || 0;
    const saleRateNum = parseFloat(Sale_Rate) || 0;
    const bpDetailNum = parseFloat(BP_Detail) || 0;
    const tcsRateNum = parseFloat(tcs_rate) || 0;
    const gstRateNum = parseFloat(gst_rate) || 0;

    const lblRate = buyerQuantalNum * saleRateNum;
    const gstAmtDetail = lblRate * (gstRateNum / 100);
    const tcsAmtDetail = lblRate * (tcsRateNum / 100);
    const lblNetAmount = lblRate + gstAmtDetail + tcsAmtDetail;
    const lblValue = quantal * millRate;

    return {
      bags,
      diff,
      exciseAmount: exciseRate,
      gstAmt,
      amount,
      lblValue,
      tcsAmt,
      tdsAmt,
      calculatedTcsAmt,
      calculatedTdsAmt,
      lblRate,
      gstAmtDetail,
      TCSAmt: tcsAmtDetail,
      lblNetAmount,
    };
  };

  useEffect(() => {
    console.log(
      "Re-rendering due to gstCode or gstRateCode change:",
      gstCode,
      gstRateCode
    );
    const effectiveGstCode = gstCode || gstRateCode; 
    const calculated = calculateValues(
      formData,
      formDataDetail,
      tdsApplicable,
      effectiveGstCode
    );
    setCalculatedValues(calculated);
  }, [formData, formDataDetail, tdsApplicable, gstCode, gstRateCode]);

  const calculateNetQuantal = (users) => {
    return users
      .filter((user) => user.rowaction !== "delete" && user.rowaction !== "DNU")
      .reduce((sum, user) => sum + parseFloat(user.Quantal || 0), 0);
  };

  const calculateDetails = (quantal, packing, rate) => {
    const bags = packing !== 0 ? (quantal / packing) * 100 : 0;
    const item_Amount = quantal * rate;
    return { bags, item_Amount };
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

  const calculateTotalItemAmount = (users) => {
    return users
      .filter((user) => user.rowaction !== "delete" && user.rowaction !== "DNU")
      .reduce((sum, user) => sum + parseFloat(user.item_Amount || 0), 0);
  };

  const handleMill_Code = (code, accoid) => {
    setMillCode(code);
    setFormData({
      ...formData,
      Mill_Code: code,
      mc: accoid,
    });
  };
  const handleGrade = (name) => {
    setGrade(name);
    setFormData({
      ...formData,
      Grade: name,
    });
  };
  const handlePayment_To = (
    code,
    accoid,
    name,
    mobileNo,
    gstNo,
    TdsApplicable
  ) => {
    // Update the state for Payment_To and TdsApplicable
    setPaymentTo(code);
    setTenderFrName(name); // Update Tender_From name
    setVoucherByName(name); // Update Voucher_By name
    setTenderDOName(name); // Update Tender_DO name

    setFormData((prevFormData) => {
      const shouldUpdateTenderFrom =
        prevFormData.Tender_From === prevFormData.Payment_To;
      const shouldUpdateVoucherBy =
        prevFormData.Voucher_By === prevFormData.Payment_To;
      const shouldUpdateTenderDO =
        prevFormData.Tender_DO === prevFormData.Payment_To;

  

      const updatedFormData = {
        ...prevFormData,
        Payment_To: code,
        pt: accoid,
        Tender_From: shouldUpdateTenderFrom ? code : prevFormData.Tender_From,
        tf: shouldUpdateTenderFrom ? accoid : prevFormData.tf,
        Voucher_By: shouldUpdateVoucherBy ? code : prevFormData.Voucher_By,
        vb: shouldUpdateVoucherBy ? accoid : prevFormData.vb,
        Tender_DO: shouldUpdateTenderDO ? code : prevFormData.Tender_DO,
        td: shouldUpdateTenderDO ? accoid : prevFormData.td,
      };

      console.log("Updated Form Data:", updatedFormData);

      const calculated = calculateValues(
        updatedFormData,
        formDataDetail,
        TdsApplicable,
        gstCode
      );

      setCalculatedValues(calculated);
      return updatedFormData;
    });

    // Update any other related state
    setTenderFrom(code);
    setVoucherBy(code);
    setTenderDO(code);
  };

  const handleTender_From = (code, accoid) => {
    setTenderFrName("");
    setTenderFrom(code);
    setFormData({
      ...formData,
      Tender_From: code,
      tf: accoid,
    });
  };
  const handleTender_DO = (code, accoid) => {
    setTenderDOName("");
    setTenderDO(code);
    setFormData({
      ...formData,
      Tender_DO: code,
      td: accoid,
    });
  };
  const handleVoucher_By = (code, accoid) => {
    setVoucherByName("");
    setVoucherBy(code);
    setFormData({
      ...formData,
      Voucher_By: code,
      vb: accoid,
    });
  };
  const handleBroker = (code, accoid) => {
    setBroker(code);
    setFormData({
      ...formData,
      Broker: code,
      bk: accoid,
    });
  };
  const handleitemcode = (code, accoid) => {
    setItemCode(code);
    setFormData({
      ...formData,
      itemcode: code,
      ic: accoid,
    });
  };
  const handlegstratecode = (code, Rate) => {
    const rate = parseFloat(Rate);

    // Update the GST rate code and form data
    setGSTRate(code);
    setGstCode(rate);

    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        gstratecode: code,
      };

      // Perform the calculation with the updated formData
      const calculatedValues = calculateValues(
        updatedFormData,
        formDataDetail,
        tdsApplicable,
        rate
      );

      // Update the state with the calculated values
      setCalculatedValues(calculatedValues);

      return updatedFormData;
    });
  };

  const handleBp_Account = (code, accoid) => {
    setBpAcCode(code);
    setFormData({
      ...formData,
      Bp_Account: code,
      bp: accoid,
    });
  };

  const handleBillTo = (code, accoid, name) => {
    setBillTo(code);
    setBillToName(name);
    setBillToAccoid(accoid);
    setFormDataDetail({
      ...formDataDetail,
      Buyer: code,
      buyerid: accoid,
    });
  };

  const handleShipTo = (code, accoid, name) => {
    setShipTo(code);
    setShipToAccoid(accoid);
    setShipToName(name);
    setFormDataDetail({
      ...formDataDetail,
      ShipTo: code,
      shiptoid: accoid,
    });
  };

  const handleBuyerParty = (code, accoid, name) => {
    setBuyerParty(code);
    setBuyerPartyAccoid(accoid);
    setBuyerPartyName(name);
    setFormDataDetail({
      ...formDataDetail,
      Buyer_Party: code,
      buyerpartyid: accoid,
    });
  };

  const handleDetailSubBroker = (code, accoid, name) => {
    setSubBroker(code);
    setBrokerDetail(name);
    setSubBrokerAccoid(accoid);
    setFormDataDetail({
      ...formDataDetail,
      sub_broker: code,
      sbr: accoid,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };

      try {
        SugarTenderPurchaseSchema.shape[name].parse(value);
        // Clear error if validation passes
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "",
        }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Set error message if validation fails
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error.errors[0].message,
          }));
        }
      }

      // Determine new GST Rate and TCS Rate based on the field being updated
      const newGstRate = name === "gstratecode" ? parseFloat(value) : gstCode;
      const newTcsRate =
        name === "TCS_Rate" ? parseFloat(value) : formData.TCS_Rate;

      // Update the `users` state based on the changes
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          tcs_rate: name === "TCS_Rate" ? newTcsRate : user.tcs_rate,
          tcs_amt:
            name === "TCS_Rate"
              ? (user.Buyer_Quantal * user.Sale_Rate * newTcsRate) / 100
              : user.tcs_amt,
          gst_rate: name === "gstratecode" ? newGstRate : gstCode,
          gst_amt:
            name === "gstratecode"
              ? (user.Buyer_Quantal * user.Sale_Rate * newGstRate) / 100
              : user.gst_amt,
        }))
      );

      // Perform any additional calculations as required
      const calculatedValues = calculateValues(
        updatedFormData,
        formDataDetail,
        tdsApplicable,
        newGstRate
      );

      return {
        ...updatedFormData,
        Excise_Rate: calculatedValues.exciseAmount,
      };
    });
  };

  const handleChangeDetail = (e) => {
    const { name, value } = e.target;
    setFormDataDetail((prevFormDataDetail) => {
      const updatedFormDataDetail = {
        ...prevFormDataDetail,
        [name]: value,
      };

      const calculatedValues = calculateValues(
        formData,
        updatedFormDataDetail,
        tdsApplicable,
        gstCode
      );

      return {
        ...updatedFormDataDetail,
        tcs_amt: calculatedValues.TCSAmt,
      };
    });
  };

  const handleDateChange = (event, fieldName) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: event.target.value,
    }));
  };

  const handleDetailDateChange = (event, fieldName) => {
    setFormDataDetail((prevFormDetailData) => ({
      ...prevFormDetailData,
      [fieldName]: event.target.value,
    }));
  };

  const handleCheckbox = (e, valueType = "string") => {
    const { name, checked } = e.target;

    // Determine the value to set based on the valueType parameter
    const value =
      valueType === "numeric" ? (checked ? 1 : 0) : checked ? "Y" : "N";

    setFormDataDetail((prevState) => ({
      ...prevState,
      [name]: value, // Set the appropriate value based on valueType
    }));
  };

  const addUser = async (e) => {
    e.preventDefault();

    // Create the new user object with the latest calculations
    const newUser = {
      ...formDataDetail,
      id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
      Buyer: billTo,
      billtoName: billtoName,
      buyerid: billToAccoid,
      ShipTo: shipTo,
      shiptoName: shiptoName,
      shiptoid: shipToAccoid,
      sub_broker: subBroker || selfAcCode || self_ac_Code,
      brokerDetail: brokerDetail || selfAcName || self_acName,
      sbr: subBrokerAccoid || selfAccoid || self_accoid,
      Buyer_Party: buyerParty || self_ac_Code || selfAcCode,
      buyerPartyName: buyerPartyName || selfAcName || self_acName,
      buyerpartyid: buyerPartyAccoid || selfAccoid || self_accoid,
      gst_rate: gstCode || formDataDetail.gst_rate,
      gst_amt:
        calculatedValues.gstAmtDetail ||
        (formDataDetail.Buyer_Quantal * formDataDetail.Sale_Rate * gstCode) /
          100 ||
        0.0,
      tcs_rate: formData.TCS_Rate,
      tcs_amt:
        calculatedValues.TCSAmt ||
        calculatedValues.gstAmtDetail * (formDataDetail.tcs_rate / 100) ||
        0.0,
      rowaction: "add",
      Lifting_Date: formData.Lifting_Date || "",
    };

    // Create a copy of the current users list
    const updatedUsers = [...users];

    if (updatedUsers.length > 0) {
      // Deduct the Buyer_Quantal from the first user's Buyer_Quantal
      const firstUser = updatedUsers[0];
      updatedUsers[0] = {
        ...firstUser,
        Buyer_Quantal:
          firstUser.Buyer_Quantal - (formDataDetail.Buyer_Quantal || 0),
      };
    }

    // Add the new user to the list
    updatedUsers.push(newUser);

    // Update the state with the new users list
    setUsers(updatedUsers);
    // Close the popup or modal
    closePopup();
  };

  const updateUser = async () => {
    // Track the original Buyer_Quantal of the selected user

    const selectedUserOriginalQuantal =
      users.find((user) => user.id === selectedUser.id)?.Buyer_Quantal || 0;

    // Calculate the difference in Buyer_Quantal
    const newBuyerQuantal = formDataDetail.Buyer_Quantal || 0;
    const quantalDifference = newBuyerQuantal - selectedUserOriginalQuantal;

    // Update the user list
    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        const updatedRowaction =
          user.rowaction === "Normal" ? "update" : user.rowaction;

        return {
          ...user,
          Buyer: billTo || selfAcCode,
          billtoName: billtoName || selfAcName,
          ShipTo: shipTo || selfAcCode,
          shiptoName: shiptoName || selfAcName,
          sub_broker: subBroker || selfAcCode,
          brokerDetail: brokerDetail || selfAcName,
          BP_Detail: formDataDetail.BP_Detail,
          Buyer_Party: buyerParty || selfAcCode,
          buyerPartyName: buyerPartyName || selfAcName,
          Buyer_Quantal: newBuyerQuantal,
          CashDiff: formDataDetail.CashDiff,
          Commission_Rate: formDataDetail.Commission_Rate,
          DetailBrokrage: formDataDetail.DetailBrokrage,
          Lifting_Date: formDataDetail.Lifting_Date,
          Narration: formDataDetail.Narration,
          Sale_Rate: formDataDetail.Sale_Rate,
          Sauda_Date: formDataDetail.Sauda_Date,
          gst_amt:
            calculatedValues.gstAmtDetail ||
            (newBuyerQuantal * formDataDetail.Sale_Rate * gstCode) / 100 ||
            0.0,
          gst_rate: formDataDetail.gst_rate || 0.0,
          loding_by_us: formDataDetail.loding_by_us,
          Delivery_Type: formDataDetail.Delivery_Type,
          tcs_amt:
            calculatedValues.TCSAmt ||
            calculatedValues.gstAmtDetail * (formDataDetail.tcs_rate / 100) ||
            0.0,
          tcs_rate: formDataDetail.tcs_rate || 0.0,
          Broker: newBroker || selfAcCode,
          brokerName: brokerName || selfAcName,
          rowaction: updatedRowaction,
        };
      } else {
        return user;
      }
    });

    // Adjust the first user's Buyer_Quantal based on the difference
    if (updatedUsers.length > 0 && updatedUsers[0]) {
      updatedUsers[0] = {
        ...updatedUsers[0],
        Buyer_Quantal: updatedUsers[0].Buyer_Quantal - quantalDifference,
      };
    }

    // Update the state with the new users list
    setUsers(updatedUsers);

    closePopup();
  };

  const deleteModeHandler = (user) => {
    let updatedUsers = [...users];
    const userQuantal = parseFloat(user.Buyer_Quantal) || 0;

    if (isEditMode && user.rowaction === "add") {
      setDeleteMode(true);
      setSelectedUser(user);

      // Add the quantal to the first user's Buyer_Quantal
      if (updatedUsers.length > 0) {
        updatedUsers[0] = {
          ...updatedUsers[0],
          Buyer_Quantal: updatedUsers[0].Buyer_Quantal + userQuantal,
        };
      }

      updatedUsers = updatedUsers.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    } else if (isEditMode) {
      setDeleteMode(true);
      setSelectedUser(user);

      // Add the quantal to the first user's Buyer_Quantal
      if (updatedUsers.length > 0) {
        updatedUsers[0] = {
          ...updatedUsers[0],
          Buyer_Quantal: updatedUsers[0].Buyer_Quantal + userQuantal,
        };
      }

      updatedUsers = updatedUsers.map((u) =>
        u.id === user.id ? { ...u, rowaction: "delete" } : u
      );
    } else {
      setDeleteMode(true);
      setSelectedUser(user);

      // Add the quantal to the first user's Buyer_Quantal
      if (updatedUsers.length > 0) {
        updatedUsers[0] = {
          ...updatedUsers[0],
          Buyer_Quantal: updatedUsers[0].Buyer_Quantal + userQuantal,
        };
      }

      updatedUsers = updatedUsers.map((u) =>
        u.id === user.id ? { ...u, rowaction: "DNU" } : u
      );
    }

    setUsers(updatedUsers);
    setSelectedUser({});
  };

  const openDelete = async (user) => {
    setDeleteMode(true);
    setSelectedUser(user);
    let updatedUsers = [...users];
    const userQuantal = parseFloat(user.Buyer_Quantal) || 0;

    if (isEditMode && user.rowaction === "delete") {
      // Deduct the quantal from the first user's Buyer_Quantal
      if (updatedUsers.length > 0) {
        updatedUsers[0] = {
          ...updatedUsers[0],
          Buyer_Quantal: updatedUsers[0].Buyer_Quantal - userQuantal,
        };
      }

      updatedUsers = updatedUsers.map((u) =>
        u.id === user.id ? { ...u, rowaction: "Normal" } : u
      );
    } else {
      // Deduct the quantal from the first user's Buyer_Quantal
      if (updatedUsers.length > 0) {
        updatedUsers[0] = {
          ...updatedUsers[0],
          Buyer_Quantal: updatedUsers[0].Buyer_Quantal - userQuantal,
        };
      }

      updatedUsers = updatedUsers.map((u) =>
        u.id === user.id ? { ...u, rowaction: "add" } : u
      );
    }

    setUsers(updatedUsers);
    setSelectedUser({});
  };

  const openPopup = (mode) => {
    debugger;
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
      Buyer_Quantal: "",
      Sale_Rate: 0.0,
      Commission_Rate: 0.0,
      Sauda_Date: new Date().toISOString().split("T")[0],
      Lifting_Date: formData.Lifting_Date,
      Narration: "",
      tcs_rate: 0.0,
      gst_rate: 0.0,
      tcs_amt: 0.0,
      gst_amt: 0.0,
      CashDiff: 0.0,
      BP_Detail: "",
      loding_by_us: "",
      DetailBrokrage: "",
      Delivery_Type: "",
    });
    setBillTo("");
    setShipTo("");
    setSubBroker("");
    setBillToAccoid("");
    setShipToAccoid("");
    setSubBrokerAccoid("");
    setBillToName("");
    setShipToName("");
    setBrokerDetail("");
    setDetailBroker("");
    setBuyerParty("");
    setBuyerPartyAccoid("");
    setBuyerPartyName("");

    selfAcCode = "";
    selfAcName = "";
    selfAccoid = "";
  };

  const editUser = (user) => {
    setSelectedUser(user);

    setBillTo(user.Buyer);
    setShipTo(user.ShipTo);
    setSubBroker(user.sub_broker);
    setBillToName(user.billtoName);
    setShipToName(user.shiptoName);
    setBrokerDetail(user.subBrokerName);
    setBuyerParty(user.Buyer_Party);
    setBuyerPartyName(user.buyerPartyName);

    setFormDataDetail({
      Buyer_Quantal: user.Buyer_Quantal || 0.0,
      Sale_Rate: user.Sale_Rate || 0.0,
      Commission_Rate: user.Commission_Rate || 0.0,
      Sauda_Date: user.Sauda_Date || 0.0,
      Lifting_Date: user.Lifting_Date || 0.0,
      Narration: user.Narration || 0.0,
      tcs_rate: user.tcs_rate || 0.0,
      gst_rate: user.gst_rate || 0.0,
      tcs_amt: user.tcs_amt || 0.0,
      gst_amt: parseFloat(user.gst_amt).toFixed(2) || 0.0,
      CashDiff: user.CashDiff || 0.0,
      BP_Detail: user.BP_Detail || 0.0,
      loding_by_us: user.loding_by_us || 0.0,
      DetailBrokrage: user.DetailBrokrage || 0.0,
    });
    openPopup("edit");
  };

  useEffect(() => {
    if (selectedRecord) {
      setUsers(
        lastTenderDetails.map((detail) => ({
          Buyer: detail.Buyer,
          billtoName: detail.billtoName,
          ShipTo: detail.ShipTo,
          shiptoName: detail.shiptoName,
          Buyer_Party: detail.Buyer_Party,
          buyerPartyName: detail.buyerPartyName,
          sub_broker: detail.sub_broker,
          brokerDetail: detail.brokerDetail,
          BP_Detail: detail.BP_Detail,
          Buyer_Quantal: detail.Buyer_Quantal,
          CashDiff: detail.CashDiff,
          Commission_Rate: detail.Commission_Rate,
          DetailBrokrage: detail.DetailBrokrage,
          Lifting_Date: detail.Lifting_Date,
          Narration: detail.Narration,
          Sale_Rate: detail.Sale_Rate,
          Sauda_Date: detail.Sauda_Date,
          gst_amt: detail.gst_amt,
          gst_rate: detail.gst_rate,
          loding_by_us: detail.loding_by_us,
          Delivery_Type: detail.Delivery_Type,
          tenderdetailid: detail.tenderdetailid,
          id: detail.ID,
          tcs_rate: detail.tcs_rate,
          tcs_amt: detail.tcs_amt,
          buyerid: detail.buyerid,
          buyerpartyid: detail.buyerpartyid,
          sbr: detail.sbr,
          gst_rate: detail.gst_rate,

          rowaction: "Normal",
        }))
      );
    }
  }, [selectedRecord, lastTenderDetails]);

  useEffect(() => {
    const updatedUsers = lastTenderDetails.map((detail) => ({
      Buyer: detail.Buyer,
      billtoName: detail.buyername,
      ShipTo: detail.ShipTo,
      shiptoName: detail.ShipToname,
      Buyer_Party: detail.Buyer_Party,
      buyerPartyName: detail.buyerpartyname,
      sub_broker: detail.sub_broker,
      brokerDetail: detail.subbrokername,
      BP_Detail: detail.BP_Detail,
      Buyer_Quantal: detail.Buyer_Quantal,
      CashDiff: detail.CashDiff,
      Commission_Rate: detail.Commission_Rate,
      DetailBrokrage: detail.DetailBrokrage,
      Lifting_Date: detail.payment_date,
      Narration: detail.Narration || "",
      Sale_Rate: detail.Sale_Rate,
      Sauda_Date: detail.Sauda_Date,
      gst_amt: detail.gst_amt,
      gst_rate: detail.gst_rate,
      loding_by_us: detail.loding_by_us,
      Delivery_Type: detail.Delivery_Type,
      tenderdetailid: detail.tenderdetailid,
      id: detail.tenderdetailid,
      tcs_rate: detail.tcs_rate,
      tcs_amt: detail.tcs_amt,
      buyerid: detail.buyerid,
      buyerpartyid: detail.buyerpartyid,
      sbr: detail.sbr,

      rowaction: "Normal",
    }));
    setUsers(updatedUsers);
  }, [lastTenderDetails]);

  const fetchLastRecord = () => {
    fetch(
      `${API_URL}/getNextTenderNo_SugarTenderPurchase?Company_Code=${companyCode}&Year_Code=${Year_Code}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        setFormData((prevState) => ({
          ...prevState,
          Tender_No: data.next_doc_no,
          Lifting_Date: data.lifting_date,
        }));
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
  };

  useEffect(() => {
    if (users.length > 0) {
      const updatedUsers = [...users];

      // Update the first user's Buyer_Quantal with formData.Quantal
      if (formData.Quantal !== undefined) {
        const firstUser = updatedUsers[0];
        const newBuyerQuantal = parseFloat(formData.Quantal) || 0;
        const newGstRate = gstCode || firstUser.gst_rate;
        const newGstAmt =
          (newBuyerQuantal * newGstRate * (firstUser.Sale_Rate || 0)) / 100 ||
          0.0;

        updatedUsers[0] = {
          ...firstUser,
          Buyer_Quantal: newBuyerQuantal,
          gst_rate: newGstRate,
          gst_amt: newGstAmt,
          rowaction: firstUser.rowaction === "add" ? "add" : "update",
        };
      }

      // Adjust the first user's Buyer_Quantal if there's a second user
      if (updatedUsers.length > 1) {
        let remainingQuantal = updatedUsers[0].Buyer_Quantal;

        for (let i = 1; i < updatedUsers.length; i++) {
          const currentUser = updatedUsers[i];
          const userQuantal = currentUser.Buyer_Quantal || 0;

          remainingQuantal -= userQuantal;

          if (remainingQuantal < 0) {
            remainingQuantal = 0;
          }

          updatedUsers[0].Buyer_Quantal = remainingQuantal;
        }
      }

      setUsers(updatedUsers);
    }
  }, [formData.Quantal, gstCode]);

  let isProcessing = false; // Module-level flag to track processing state

  const handleAddOne = async () => {
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditMode(false);
    setIsEditing(true);
    setFormData(initialFormData);
    fetchLastRecord();
    setLastTenderDetails([]);
    setLastTenderData({});
    setUsers([]);
    millCodeName = "";
    newMill_Code = "";
    gradeName = "";
    newGrade = "";
    paymentToName = "";
    newPayment_To = "";
    tenderFromName = "";
    newTender_From = "";
    tenderDOName = "";
    newTender_DO = "";
    voucherByName = "";
    newVoucher_By = "";
    brokerName = "";
    newBroker = "";
    itemName = "";
    newitemcode = "";
    gstRateName = "";
    gstRateCode = "";
    newgstratecode = "";
    bpAcName = "";
    newBp_Account = "";
    billToName = "";
    newBillToCode = "";
    shipToName = "";
    shipToCode = "";
    subBrokerName = "";
    subBrokerCode = "";
    newTenderId = "";
    selfAcCode = "";
    selfAcName = "";
    selfAccoid = "";
    buyerPartyCode = "";
    buyer_party_name = "";

    if (isProcessing) return; // Prevent further execution if already processing

    isProcessing = true; // Set processing flag to true

    try {
      await fetchSelfAcData(); // Your data fetching logic
    } catch (error) {
      console.error("Error adding record:", error);
    } finally {
      isProcessing = false; // Reset processing flag
    }
  };

  const [calculatedValues, setCalculatedValues] = useState({
    lblRate: 0,
    amount: 0,
    tdsAmt: 0,
    diff: 0,
    gstAmtDetail: 0,
    exciseAmount: 0,
    lblValue: 0,
    TCSAmt: 0,
    lblNetAmount: 0,
    bags: 0,
    gstAmt: 0,
    tcsAmt: 0,
  });

  const cleanFormData = (data) => {
    const {
      lblRate,
      amount,
      tdsAmt,
      diff,
      gstAmtDetail,
      exciseAmount,
      lblValue,
      TCSAmt,
      lblNetAmount,
      bags,
      gstAmt,
      tcsAmt,
      ...cleanedData
    } = data;
    return cleanedData;
  };

  const handleSaveOrUpdate = async (event) => {
    event.preventDefault();

    setIsEditing(true);
    setIsLoading(true);

    // Perform calculations
    const calculated = calculateValues(
      formData,
      formDataDetail,
      tdsApplicable,
      gstCode
    );

    // Merge calculated values into formData
    const updatedFormData = {
      ...formData,
      Bags: calculated.bags,
      CashDiff: calculated.diff,
      // GST_Amt: calculated.gstAmt,
      TCS_Amt: calculated.tcsAmt,
      TDS_Amt: calculated.tdsAmt,
      Excise_Rate: calculated.exciseAmount,
    };

    // Clean form data by removing unnecessary calculated fields
    const cleanedHeadData = cleanFormData(updatedFormData);

    // Remove tenderid from cleanedHeadData if in edit mode
    if (isEditMode) {
      delete cleanedHeadData.tenderid;
    }

    // Prepare detail data
    const detailData = users.map((user) => {
      return {
        rowaction: user.rowaction,
        Buyer: user.Buyer || 0,
        Buyer_Quantal: user.Buyer_Quantal || 0.0,
        Sale_Rate: user.Sale_Rate || 0.0,
        Commission_Rate: user.Commission_Rate || 0.0,
        Sauda_Date: user.Sauda_Date || "",
        Lifting_Date: user.Lifting_Date || "",
        Narration: user.Narration || "",
        ID: user.ID || 0,
        ShipTo: user.ShipTo || 0,
        AutoID: user.AutoID || 0,
        IsActive: user.IsActive || "",
        year_code: Year_Code,
        Branch_Id: user.Branch_Id || 0,
        Delivery_Type: user.Delivery_Type || "",
        tenderdetailid: user.tenderdetailid,
        buyerid: user.buyerid,
        buyerpartyid: user.buyerpartyid,
        sub_broker: user.sub_broker,
        sbr: user.sbr || 0,
        tcs_rate: user.tcs_rate || 0.0,
        gst_rate: user.gst_rate || 0.0,
        tcs_amt: user.tcs_amt || 0.0,
        gst_amt: user.gst_amt || 0.0,
        ShipTo: user.ShipTo || 0,
        CashDiff: user.CashDiff || 0.0,
        shiptoid: user.shiptoid,
        BP_Detail: user.BP_Detail || 0,
        bpid: user.bpid || 0,
        loding_by_us: user.loding_by_us || "",
        DetailBrokrage: user.DetailBrokrage || 0.0,
        Company_Code: companyCode,
        Buyer_Party: user.Buyer_Party,
      };
    });

    // Structure the request data
    const requestData = {
      headData: cleanedHeadData,
      detailData,
    };
    try {
      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update_tender_purchase?tenderid=${newTenderId}`;
        const response = await axios.put(updateApiUrl, requestData);

        toast.success("Data updated successfully!");
      } else {
        const response = await axios.post(
          `${API_URL}/insert_tender_head_detail`,
          requestData
        );

        toast.success("Data saved successfully!");
      }
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);
      setIsEditing(false);
      setIsLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error during API call:", error.response || error);
      toast.error("Error occurred while saving data");
    } finally {
      setIsEditing(false);
      setIsLoading(false);
    }
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

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this Task No ${formData.Tender_No}?`
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
        const deleteApiUrl = `${API_URL}/delete_TenderBytenderid?tenderid=${newTenderId}`;
        const response = await axios.delete(deleteApiUrl);

        if (response.status === 200) {
          const commissionDelete = `${API_URL}/delete-CommissionBill?doc_no=${formData.Voucher_No}&Company_Code=${companyCode}&Year_Code=${Year_Code}&Tran_Type=${formData.Voucher_Type}`;
          const result = await axios.delete(commissionDelete);
          if (result.status === 200 || result.status === 201) {
            toast.success("Data delete successfully!!");
            handleCancel();
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
        setIsLoading(false);
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
        `${API_URL}/getlasttender_record_navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );

      if (response.status === 200) {
        const data = response.data;

        // Extract data from API response
        newTenderId = data.last_tender_head_data.tenderid;
        millCodeName = data.last_tender_details_data[0].MillName;
        newMill_Code = data.last_tender_head_data.Mill_Code;
        paymentToName = data.last_tender_details_data[0].PaymentToAcName;
        newPayment_To = data.last_tender_head_data.Payment_To;
        tenderFromName = data.last_tender_details_data[0].TenderFromAcName;
        newTender_From = data.last_tender_head_data.Tender_From;
        tenderDOName = data.last_tender_details_data[0].TenderDoAcName;
        newTender_DO = data.last_tender_head_data.Tender_DO;
        voucherByName = data.last_tender_details_data[0].VoucherByAcName;
        newVoucher_By = data.last_tender_head_data.Voucher_By;
        brokerName = data.last_tender_details_data[0].BrokerAcName;
        newBroker = data.last_tender_head_data.Broker;
        itemName = data.last_tender_details_data[0].ItemName;
        newitemcode = data.last_tender_head_data.itemcode;
        gstRateName = data.last_tender_details_data[0].GST_Name;
        gstRateCode = data.last_tender_details_data[0].GSTRate;
        newgstratecode = data.last_tender_head_data.gstratecode;
        bpAcName = data.last_tender_details_data[0].BPAcName;
        newBp_Account = data.last_tender_head_data.Bp_Account;
        billToName = data.last_tender_details_data[0].buyername;
        newBillToCode = data.last_tender_details_data[0].Buyer;
        shipToName = data.last_tender_details_data[0].ShipToname;
        shipToCode = data.last_tender_details_data[0].ShipTo;
        subBrokerName = data.last_tender_details_data[0].subbrokername;
        subBrokerCode = data.last_tender_details_data[0].sub_broker;
        newGrade = data.last_tender_head_data.Grade;
        buyerPartyCode = data.last_tender_details_data[0].Buyer_Party;
        buyer_party_name = data.last_tender_details_data[0].buyerpartyname;

        // Update Buyer_Quantal only for the first entry
        const updatedTenderDetailsData = data.last_tender_details_data.map(
          (item, index) => ({
            ...item,
            ...item.last_tender_details_data,
            // Ensure Buyer_Quantal is correctly set for the first record
            Buyer_Quantal:
              index === 0
                ? data.last_tender_details_data[0].Buyer_Quantal
                : item.Buyer_Quantal,
          })
        );

        // Update formData without affecting Quantal
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_tender_head_data,
          // Quantal is not overridden
        }));

        // Update lastTenderData and lastTenderDetails
        setLastTenderData(data.last_tender_head_data || {});
        setLastTenderDetails(updatedTenderDetailsData || []);
        setUsers(
          updatedTenderDetailsData.map((detail) => ({
            Buyer: detail.Buyer,
            billtoName: detail.buyername,
            ShipTo: detail.ShipTo,
            shiptoName: detail.ShipToname,
            Buyer_Party: detail.Buyer_Party,
            buyerPartyName: detail.buyerpartyname,
            sub_broker: detail.sub_broker,
            brokerDetail: detail.subbrokername,
            BP_Detail: detail.BP_Detail,
            Buyer_Quantal: detail.Buyer_Quantal,
            CashDiff: detail.CashDiff,
            Commission_Rate: detail.Commission_Rate,
            DetailBrokrage: detail.DetailBrokrage,
            Lifting_Date: detail.payment_date,
            Narration: detail.Narration || "",
            Sale_Rate: detail.Sale_Rate,
            Sauda_Date: detail.Sauda_Date,
            gst_amt: detail.gst_amt,
            gst_rate: detail.gst_rate,
            loding_by_us: detail.loding_by_us,
            Delivery_Type: detail.Delivery_Type,
            tenderdetailid: detail.tenderdetailid,
            id: detail.tenderdetailid,
            tcs_rate: detail.tcs_rate,
            tcs_amt: detail.tcs_amt,
            buyerid: detail.buyerid,
            buyerpartyid: detail.buyerpartyid,
            sbr: detail.sbr,
            rowaction: "Normal",
          }))
        );
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
    navigate("/tender-purchaseutility");
  };
  //Handle Record DoubleCliked in Utility Page Show that record for Edit
  const handlerecordDoubleClicked = async () => {
    try {
      const tenderNo = selectedTenderNo || selectedRecord?.Tender_No;

      if (!tenderNo) {
        console.error("No Tender No. provided.");
        return;
      }
      const response = await axios.get(
        `${API_URL}/getTenderByTenderNo?Company_Code=${companyCode}&Tender_No=${tenderNo}&Year_Code=${Year_Code}`
      );
      const data = response.data;
      newTenderId = data.last_tender_head_data.tenderid;
      millCodeName = data.last_tender_details_data[0].MillName;
      newMill_Code = data.last_tender_head_data.Mill_Code;
      paymentToName = data.last_tender_details_data[0].PaymentToAcName;
      newPayment_To = data.last_tender_head_data.Payment_To;
      tenderFromName = data.last_tender_details_data[0].TenderFromAcName;
      newTender_From = data.last_tender_head_data.Tender_From;
      tenderDOName = data.last_tender_details_data[0].TenderDoAcName;
      newTender_DO = data.last_tender_head_data.Tender_DO;
      voucherByName = data.last_tender_details_data[0].VoucherByAcName;
      newVoucher_By = data.last_tender_head_data.Voucher_By;
      brokerName = data.last_tender_details_data[0].BrokerAcName;
      newBroker = data.last_tender_head_data.Broker;
      itemName = data.last_tender_details_data[0].ItemName;
      newitemcode = data.last_tender_head_data.itemcode;
      gstRateName = data.last_tender_details_data[0].GST_Name;
      gstRateCode = data.last_tender_details_data[0].GSTRate;
      newgstratecode = data.last_tender_head_data.gstratecode;
      bpAcName = data.last_tender_details_data[0].BPAcName;
      newBp_Account = data.last_tender_head_data.Bp_Account;
      billToName = data.last_tender_details_data[0].buyername;
      newBillToCode = data.last_tender_details_data[0].Buyer;
      shipToName = data.last_tender_details_data[0].ShipToname;
      shipToCode = data.last_tender_details_data[0].ShipTo;
      subBrokerName = data.last_tender_details_data[0].subbrokername;
      subBrokerCode = data.last_tender_details_data[0].sub_broker;
      newGrade = data.last_tender_head_data.Grade;
      buyerPartyCode = data.last_tender_details_data[0].Buyer_Party;
      buyer_party_name = data.last_tender_details_data[0].buyerpartyname;

      // Update Buyer_Quantal only for the first entry
      const updatedTenderDetailsData = data.last_tender_details_data.map(
        (item, index) => ({
          ...item,
          ...item.last_tender_details_data,
          // Ensure Buyer_Quantal is correctly set for the first record
          Buyer_Quantal:
            index === 0
              ? data.last_tender_details_data[0].Buyer_Quantal
              : item.Buyer_Quantal,
        })
      );

      // Update formData without affecting Quantal
      setFormData((prevData) => ({
        ...prevData,
        ...data.last_tender_head_data,
        // Quantal is not overridden
      }));

      // Update lastTenderData and lastTenderDetails
      setLastTenderData(data.last_tender_head_data || {});
      setLastTenderDetails(updatedTenderDetailsData || []);
      setUsers(
        updatedTenderDetailsData.map((detail) => ({
          Buyer: detail.Buyer,
          billtoName: detail.buyername,
          ShipTo: detail.ShipTo,
          shiptoName: detail.ShipToname,
          Buyer_Party: detail.Buyer_Party,
          buyerPartyName: detail.buyerpartyname,
          sub_broker: detail.sub_broker,
          brokerDetail: detail.subbrokername,
          BP_Detail: detail.BP_Detail,
          Buyer_Quantal: detail.Buyer_Quantal,
          CashDiff: detail.CashDiff,
          Commission_Rate: detail.Commission_Rate,
          DetailBrokrage: detail.DetailBrokrage,
          Lifting_Date: detail.payment_date,
          Narration: detail.Narration || "",
          Sale_Rate: detail.Sale_Rate,
          Sauda_Date: detail.Sauda_Date,
          gst_amt: detail.gst_amt,
          gst_rate: detail.gst_rate,
          loding_by_us: detail.loding_by_us,
          Delivery_Type: detail.Delivery_Type,
          tenderdetailid: detail.tenderdetailid,
          id: detail.tenderdetailid,
          tcs_rate: detail.tcs_rate,
          tcs_amt: detail.tcs_amt,
          buyerid: detail.buyerid,
          buyerpartyid: detail.buyerpartyid,
          sbr: detail.sbr,
          rowaction: "Normal",
        }))
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setUpdateButtonClicked(true);
    setIsEditing(false);
  };

  useEffect(() => {
    if (selectedRecord || selectedTenderNo) {
      handlerecordDoubleClicked();
    } else {
      handleAddOne();
    }
    document.getElementById("type").focus();
  }, [selectedRecord, selectedTenderNo]);

  //change No functionality to get that particular record
  const handleKeyDown = async (event) => {
    if (event.key === "Tab") {
      const changeNoValue = event.target.value;
      try {
        const response = await axios.get(
          `${API_URL}/getTenderByTenderNo?Company_Code=${companyCode}&Tender_No=${changeNoValue}&Year_Code=${Year_Code}`
        );
        const data = response.data;
        newTenderId = data.last_tender_head_data.tenderid;
        millCodeName = data.last_tender_details_data[0].MillName;
        newMill_Code = data.last_tender_head_data.Mill_Code;
        paymentToName = data.last_tender_details_data[0].PaymentToAcName;
        newPayment_To = data.last_tender_head_data.Payment_To;
        tenderFromName = data.last_tender_details_data[0].TenderFromAcName;
        newTender_From = data.last_tender_head_data.Tender_From;
        tenderDOName = data.last_tender_details_data[0].TenderDoAcName;
        newTender_DO = data.last_tender_head_data.Tender_DO;
        voucherByName = data.last_tender_details_data[0].VoucherByAcName;
        newVoucher_By = data.last_tender_head_data.Voucher_By;
        brokerName = data.last_tender_details_data[0].BrokerAcName;
        newBroker = data.last_tender_head_data.Broker;
        itemName = data.last_tender_details_data[0].ItemName;
        newitemcode = data.last_tender_head_data.itemcode;
        gstRateName = data.last_tender_details_data[0].GST_Name;
        gstRateCode = data.last_tender_details_data[0].GSTRate;
        newgstratecode = data.last_tender_head_data.gstratecode;
        bpAcName = data.last_tender_details_data[0].BPAcName;
        newBp_Account = data.last_tender_head_data.Bp_Account;
        billToName = data.last_tender_details_data[0].buyername;
        newBillToCode = data.last_tender_details_data[0].Buyer;
        shipToName = data.last_tender_details_data[0].ShipToname;
        shipToCode = data.last_tender_details_data[0].ShipTo;
        subBrokerName = data.last_tender_details_data[0].subbrokername;
        subBrokerCode = data.last_tender_details_data[0].sub_broker;
        newGrade = data.last_tender_head_data.Grade;
        buyerPartyCode = data.last_tender_details_data[0].Buyer_Party;
        buyer_party_name = data.last_tender_details_data[0].buyerpartyname;

        // Update Buyer_Quantal only for the first entry
        const updatedTenderDetailsData = data.last_tender_details_data.map(
          (item, index) => ({
            ...item,
            ...item.last_tender_details_data,
            // Ensure Buyer_Quantal is correctly set for the first record
            Buyer_Quantal:
              index === 0
                ? data.last_tender_details_data[0].Buyer_Quantal
                : item.Buyer_Quantal,
          })
        );

        // Update formData without affecting Quantal
        setFormData((prevData) => ({
          ...prevData,
          ...data.last_tender_head_data,
          // Quantal is not overridden
        }));

        // Update lastTenderData and lastTenderDetails
        setLastTenderData(data.last_tender_head_data || {});
        setLastTenderDetails(updatedTenderDetailsData || []);
        setUsers(
          updatedTenderDetailsData.map((detail) => ({
            Buyer: detail.Buyer,
            billtoName: detail.buyername,
            ShipTo: detail.ShipTo,
            shiptoName: detail.ShipToname,
            Buyer_Party: detail.Buyer_Party,
            buyerPartyName: detail.buyerpartyname,
            sub_broker: detail.sub_broker,
            brokerDetail: detail.subbrokername,
            BP_Detail: detail.BP_Detail,
            Buyer_Quantal: detail.Buyer_Quantal,
            CashDiff: detail.CashDiff,
            Commission_Rate: detail.Commission_Rate,
            DetailBrokrage: detail.DetailBrokrage,
            Lifting_Date: detail.payment_date,
            Narration: detail.Narration || "",
            Sale_Rate: detail.Sale_Rate,
            Sauda_Date: detail.Sauda_Date,
            gst_amt: detail.gst_amt,
            gst_rate: detail.gst_rate,
            loding_by_us: detail.loding_by_us,
            Delivery_Type: detail.Delivery_Type,
            tenderdetailid: detail.tenderdetailid,
            id: detail.tenderdetailid,
            tcs_rate: detail.tcs_rate,
            tcs_amt: detail.tcs_amt,
            buyerid: detail.buyerid,
            buyerpartyid: detail.buyerpartyid,
            sbr: detail.sbr,
            rowaction: "Normal",
          }))
        );
        setIsEditing(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  //Navigation Buttons
  const handleFirstButtonClick = async () => {
    try {
      const response = await fetch(
        `${API_URL}/getfirsttender_record_navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );
      if (response.ok) {
        const data = await response.json();
        // Access the first element of the array
        newTenderId = data.first_tender_head_data.tenderid;
        millCodeName = data.first_tender_details_data[0].MillName;
        newMill_Code = data.first_tender_head_data.Mill_Code;
        gradeName = data.first_tender_head_data.Grade;
        paymentToName = data.first_tender_details_data[0].PaymentToAcName;
        newPayment_To = data.first_tender_head_data.Payment_To;
        tenderFromName = data.first_tender_details_data[0].TenderFromAcName;
        newTender_From = data.first_tender_head_data.Tender_From;
        tenderDOName = data.first_tender_details_data[0].TenderDoAcName;
        newTender_DO = data.first_tender_head_data.Tender_DO;
        voucherByName = data.first_tender_details_data[0].VoucherByAcName;
        newVoucher_By = data.first_tender_head_data.Voucher_By;
        brokerName = data.first_tender_details_data[0].BrokerAcName;
        newBroker = data.first_tender_head_data.Broker;
        itemName = data.first_tender_details_data[0].ItemName;
        newitemcode = data.first_tender_head_data.itemcode;
        gstRateName = data.first_tender_details_data[0].GST_Name;
        gstRateCode = data.first_tender_details_data[0].GSTRate;
        newgstratecode = data.first_tender_head_data.gstratecode;
        bpAcName = data.first_tender_details_data[0].BPAcName;
        newBp_Account = data.first_tender_head_data.Bp_Account;
        billToName = data.first_tender_details_data[0].buyername;
        newBillToCode = data.first_tender_details_data[0].Buyer;
        shipToName = data.first_tender_details_data[0].ShipToname;
        shipToCode = data.first_tender_details_data[0].ShipTo;
        subBrokerName = data.first_tender_details_data[0].subbrokername;
        subBrokerCode = data.first_tender_details_data[0].sub_broker;
        buyerPartyCode = data.first_tender_details_data[0].Buyer_Party;
        buyer_party_name = data.first_tender_details_data[0].buyerpartyname;

        // Update Buyer_Quantal only for the first entry
        const updatedTenderDetailsData = data.first_tender_details_data.map(
          (item, index) => ({
            ...item,
            ...item.first_tender_details_data,
            // Ensure Buyer_Quantal is correctly set for the first record
            Buyer_Quantal:
              index === 0
                ? data.first_tender_details_data[0].Buyer_Quantal
                : item.Buyer_Quantal,
          })
        );

        // Update formData without affecting Quantal
        setFormData((prevData) => ({
          ...prevData,
          ...data.first_tender_head_data,
          // Quantal is not overridden
        }));

        // Update lastTenderData and lastTenderDetails
        setLastTenderData(data.first_tender_head_data || {});
        setLastTenderDetails(updatedTenderDetailsData || []);
        setUsers(
          updatedTenderDetailsData.map((detail) => ({
            Buyer: detail.Buyer,
            billtoName: detail.buyername,
            ShipTo: detail.ShipTo,
            shiptoName: detail.ShipToname,
            Buyer_Party: detail.Buyer_Party,
            buyerPartyName: detail.buyerpartyname,
            sub_broker: detail.sub_broker,
            brokerDetail: detail.subbrokername,
            BP_Detail: detail.BP_Detail,
            Buyer_Quantal: detail.Buyer_Quantal,
            CashDiff: detail.CashDiff,
            Commission_Rate: detail.Commission_Rate,
            DetailBrokrage: detail.DetailBrokrage,
            Lifting_Date: detail.payment_date,
            Narration: detail.Narration || "",
            Sale_Rate: detail.Sale_Rate,
            Sauda_Date: detail.Sauda_Date,
            gst_amt: detail.gst_amt,
            gst_rate: detail.gst_rate,
            loding_by_us: detail.loding_by_us,
            Delivery_Type: detail.Delivery_Type,
            tenderdetailid: detail.tenderdetailid,
            id: detail.tenderdetailid,
            tcs_rate: detail.tcs_rate,
            tcs_amt: detail.tcs_amt,
            buyerid: detail.buyerid,
            buyerpartyid: detail.buyerpartyid,
            sbr: detail.sbr,
            rowaction: "Normal",
          }))
        );
      } else {
        console.error(
          "Failed to fetch first record:",
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
      // Use formData.Company_Code as the current company code
      const response = await fetch(
        `${API_URL}/getprevioustender_navigation?CurrenttenderNo=${formData.Tender_No}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );

      if (response.ok) {
        const data = await response.json();

        newTenderId = data.previous_tender_head_data.tenderid;
        millCodeName = data.previous_tender_details_data[0].MillName;
        newMill_Code = data.previous_tender_head_data.Mill_Code;
        gradeName = data.previous_tender_head_data.Grade;
        paymentToName = data.previous_tender_details_data[0].PaymentToAcName;
        newPayment_To = data.previous_tender_head_data.Payment_To;
        tenderFromName = data.previous_tender_details_data[0].TenderFromAcName;
        newTender_From = data.previous_tender_head_data.Tender_From;
        tenderDOName = data.previous_tender_details_data[0].TenderDoAcName;
        newTender_DO = data.previous_tender_head_data.Tender_DO;
        voucherByName = data.previous_tender_details_data[0].VoucherByAcName;
        newVoucher_By = data.previous_tender_head_data.Voucher_By;
        brokerName = data.previous_tender_details_data[0].BrokerAcName;
        newBroker = data.previous_tender_head_data.Broker;
        itemName = data.previous_tender_details_data[0].ItemName;
        newitemcode = data.previous_tender_head_data.itemcode;
        gstRateName = data.previous_tender_details_data[0].GST_Name;
        gstRateCode = data.previous_tender_details_data[0].GSTRate;
        newgstratecode = data.previous_tender_head_data.gstratecode;
        bpAcName = data.previous_tender_details_data[0].BPAcName;
        newBp_Account = data.previous_tender_head_data.Bp_Account;
        billToName = data.previous_tender_details_data[0].buyername;
        newBillToCode = data.previous_tender_details_data[0].Buyer;
        shipToName = data.previous_tender_details_data[0].ShipToname;
        shipToCode = data.previous_tender_details_data[0].ShipTo;
        subBrokerName = data.previous_tender_details_data[0].subbrokername;
        subBrokerCode = data.previous_tender_details_data[0].sub_broker;
        buyerPartyCode = data.previous_tender_details_data[0].Buyer_Party;
        buyer_party_name = data.previous_tender_details_data[0].buyerpartyname;

        // Update Buyer_Quantal only for the first entry
        const updatedTenderDetailsData = data.previous_tender_details_data.map(
          (item, index) => ({
            ...item,
            ...item.previous_tender_details_data,
            // Ensure Buyer_Quantal is correctly set for the first record
            Buyer_Quantal:
              index === 0
                ? data.previous_tender_details_data[0].Buyer_Quantal
                : item.Buyer_Quantal,
          })
        );

        // Update formData without affecting Quantal
        setFormData((prevData) => ({
          ...prevData,
          ...data.previous_tender_head_data,
          // Quantal is not overridden
        }));

        // Update lastTenderData and lastTenderDetails
        setLastTenderData(data.previous_tender_head_data || {});
        setLastTenderDetails(updatedTenderDetailsData || []);
        setUsers(
          updatedTenderDetailsData.map((detail) => ({
            Buyer: detail.Buyer,
            billtoName: detail.buyername,
            ShipTo: detail.ShipTo,
            shiptoName: detail.ShipToname,
            Buyer_Party: detail.Buyer_Party,
            buyerPartyName: detail.buyerpartyname,
            sub_broker: detail.sub_broker,
            brokerDetail: detail.subbrokername,
            BP_Detail: detail.BP_Detail,
            Buyer_Quantal: detail.Buyer_Quantal,
            CashDiff: detail.CashDiff,
            Commission_Rate: detail.Commission_Rate,
            DetailBrokrage: detail.DetailBrokrage,
            Lifting_Date: detail.payment_date,
            Narration: detail.Narration || "",
            Sale_Rate: detail.Sale_Rate,
            Sauda_Date: detail.Sauda_Date,
            gst_amt: detail.gst_amt,
            gst_rate: detail.gst_rate,
            loding_by_us: detail.loding_by_us,
            Delivery_Type: detail.Delivery_Type,
            tenderdetailid: detail.tenderdetailid,
            id: detail.tenderdetailid,
            tcs_rate: detail.tcs_rate,
            tcs_amt: detail.tcs_amt,
            buyerid: detail.buyerid,
            buyerpartyid: detail.buyerpartyid,
            sbr: detail.sbr,
            rowaction: "Normal",
          }))
        );
      } else {
        console.error(
          "Failed to fetch previous record:",
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
      const response = await fetch(
        `${API_URL}/getnexttender_navigation?CurrenttenderNo=${formData.Tender_No}&Company_Code=${companyCode}&Year_Code=${Year_Code}`
      );

      if (response.ok) {
        const data = await response.json();
        newTenderId = data.next_tender_head_data.tenderid;
        millCodeName = data.next_tender_details_data[0].MillName;
        newMill_Code = data.next_tender_head_data.Mill_Code;
        gradeName = data.next_tender_head_data.Grade;
        paymentToName = data.next_tender_details_data[0].PaymentToAcName;
        newPayment_To = data.next_tender_head_data.Payment_To;
        tenderFromName = data.next_tender_details_data[0].TenderFromAcName;
        newTender_From = data.next_tender_head_data.Tender_From;
        tenderDOName = data.next_tender_details_data[0].TenderDoAcName;
        newTender_DO = data.next_tender_head_data.Tender_DO;
        voucherByName = data.next_tender_details_data[0].VoucherByAcName;
        newVoucher_By = data.next_tender_head_data.Voucher_By;
        brokerName = data.next_tender_details_data[0].BrokerAcName;
        newBroker = data.next_tender_head_data.Broker;
        itemName = data.next_tender_details_data[0].ItemName;
        newitemcode = data.next_tender_head_data.itemcode;
        gstRateName = data.next_tender_details_data[0].GST_Name;
        gstRateCode = data.next_tender_details_data[0].GSTRate;
        newgstratecode = data.next_tender_head_data.gstratecode;
        bpAcName = data.next_tender_details_data[0].BPAcName;
        newBp_Account = data.next_tender_head_data.Bp_Account;
        billToName = data.next_tender_details_data[0].buyername;
        newBillToCode = data.next_tender_details_data[0].Buyer;
        shipToName = data.next_tender_details_data[0].ShipToname;
        shipToCode = data.next_tender_details_data[0].ShipTo;
        subBrokerName = data.next_tender_details_data[0].subbrokername;
        subBrokerCode = data.next_tender_details_data[0].sub_broker;
        buyerPartyCode = data.next_tender_details_data[0].Buyer_Party;
        buyer_party_name = data.next_tender_details_data[0].buyerpartyname;

        // Update Buyer_Quantal only for the first entry
        const updatedTenderDetailsData = data.next_tender_details_data.map(
          (item, index) => ({
            ...item,
            ...item.next_tender_details_data,
            // Ensure Buyer_Quantal is correctly set for the first record
            Buyer_Quantal:
              index === 0
                ? data.next_tender_details_data[0].Buyer_Quantal
                : item.Buyer_Quantal,
          })
        );

        // Update formData without affecting Quantal
        setFormData((prevData) => ({
          ...prevData,
          ...data.next_tender_head_data,
          // Quantal is not overridden
        }));

        // Update lastTenderData and lastTenderDetails
        setLastTenderData(data.next_tender_head_data || {});
        setLastTenderDetails(updatedTenderDetailsData || []);
        setUsers(
          updatedTenderDetailsData.map((detail) => ({
            Buyer: detail.Buyer,
            billtoName: detail.buyername,
            ShipTo: detail.ShipTo,
            shiptoName: detail.ShipToname,
            Buyer_Party: detail.Buyer_Party,
            buyerPartyName: detail.buyerpartyname,
            sub_broker: detail.sub_broker,
            brokerDetail: detail.subbrokername,
            BP_Detail: detail.BP_Detail,
            Buyer_Quantal: detail.Buyer_Quantal,
            CashDiff: detail.CashDiff,
            Commission_Rate: detail.Commission_Rate,
            DetailBrokrage: detail.DetailBrokrage,
            Lifting_Date: detail.payment_date,
            Narration: detail.Narration || "",
            Sale_Rate: detail.Sale_Rate,
            Sauda_Date: detail.Sauda_Date,
            gst_amt: detail.gst_amt,
            gst_rate: detail.gst_rate,
            loding_by_us: detail.loding_by_us,
            Delivery_Type: detail.Delivery_Type,
            tenderdetailid: detail.tenderdetailid,
            id: detail.tenderdetailid,
            tcs_rate: detail.tcs_rate,
            tcs_amt: detail.tcs_amt,
            buyerid: detail.buyerid,
            buyerpartyid: detail.buyerpartyid,
            sbr: detail.sbr,
            rowaction: "Normal",
          }))
        );
      } else {
        console.error(
          "Failed to fetch next record:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };

  const fetchSelfAcData = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_SelfAc`, {
        params: { Company_Code: companyCode },
      });

      selfAcCode = response.data.SELF_AC;
      selfAccoid = response.data.Self_acid;
      selfAcName = response.data.Self_acName;
      setSelf_ac_code(selfAcCode);
      set_self_accoid(selfAccoid);
      set_self_acName(selfAcName);

      setFormData((prevData) => ({
        ...prevData,
        Broker: selfAcCode,
        bk: selfAccoid,
      }));

      setUsers((prevUsers) => [
        {
          ...formDataDetail,
          rowaction: "add",
          id:
            prevUsers.length > 0
              ? Math.max(...prevUsers.map((user) => user.id)) + 1
              : 1,
          Buyer: selfAcCode,
          billtoName: selfAcName,
          buyerid: selfAccoid,
          ShipTo: selfAcCode,
          shiptoName: selfAcName,
          shiptoid: selfAccoid,
          buyerpartyid: selfAccoid,
          sub_broker: selfAcCode,
          brokerDetail: selfAcName,
          sbr: selfAccoid,
          Buyer_Party: selfAcCode,
          buyerPartyName: selfAcName,
          buyerpartyid: selfAccoid,
          Lifting_Date: formData.Lifting_Date,
          gst_rate: formData.gstratecode,
          tcs_rate: parseFloat(formData.TCS_Rate),
          Delivery_Type: dispatchType,
          ID: 1,
        },
        ...prevUsers,
      ]);
    } catch (error) {
      console.log(error.response?.data?.error || "An error occurred");
    }
  };

  const handleVoucherClick = () => {
    // When Voucher_No is clicked, navigate to CommissionBill and pass formData (or other data)
    navigate("/commission-bill", {
      state: {
        selectedVoucherNo: formData.Voucher_No,
        selectedVoucherType: formData.Voucher_Type, // Use a specific key for Voucher_Type
      },
    });
  };

  return (
    <>
      <ToastContainer />
      <form className="SugarTenderPurchase-container" onSubmit={handleSubmit}>
        <h6 className="Heading">Tender Purchase</h6>
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
            permissions={permissions}
          />

          {/* Navigation Buttons */}
          <NavigationButtons
            handleFirstButtonClick={handleFirstButtonClick}
            handlePreviousButtonClick={handlePreviousButtonClick}
            handleNextButtonClick={handleNextButtonClick}
            handleLastButtonClick={handleCancel}
            highlightedButton={highlightedButton}
            isEditing={isEditing}
            // isFirstRecord={formData.Company_Code === 1}
          />
        </div>

        <div className="SugarTenderPurchase-row"></div>

        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_No"
              className="SugarTenderPurchase-form-label"
            >
              Change No
            </label>
            <input
              type="text"
              className="SugarTenderPurchase-form-control"
              name="changeNo"
              autoComplete="off"
              onKeyDown={handleKeyDown}
              disabled={!addOneButtonEnabled}
              tabIndex={1}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_No"
              className="SugarTenderPurchase-form-label"
            >
              Tender No:
            </label>
            <input
              type="text"
              id="Tender_No"
              name="Tender_No"
              className="SugarTenderPurchase-form-control"
              value={formData.Tender_No}
              onChange={handleChange}
              disabled
              tabIndex={2}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="type" className="SugarTenderPurchase-form-label">
              Resale/Mill:
            </label>
            <select
              type="text"
              id="type"
              name="type"
              className="SugarTenderPurchase-form-control"
              value={formData.type}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={3}
              ref={type}
            >
              <option value="R">Resale</option>
              <option value="M">Mill</option>
              <option value="W">With Payment</option>
              <option value="P">Party Bill Rate</option>
            </select>
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Temptender"
              className="SugarTenderPurchase-form-label"
            >
              Temp Tender
            </label>
            <select
              type="text"
              id="Temptender"
              name="Temptender"
              className="SugarTenderPurchase-form-control"
              value={formData.Temptender}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={4}
            >
              <option value="N">No</option>
              <option value="Y">Yes</option>
            </select>
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="AutoPurchaseBill"
              className="SugarTenderPurchase-form-label"
            >
              Auto Purchase Bill:
            </label>
            <select
              type="text"
              id="AutoPurchaseBill"
              name="AutoPurchaseBill"
              className="SugarTenderPurchase-form-control"
              value={formData.AutoPurchaseBill}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={5}
            >
              <option value="Y">Yes</option>
              <option value="N">No</option>
            </select>
          </div>
          <div className="SugarTenderPurchase-col" onClick={handleVoucherClick}>
            <label
              htmlFor="Voucher_No"
              className="SugarTenderPurchase-form-label"
            >
              Voucher No:
            </label>

            <input
              type="text"
              id="Voucher_No"
              name="Voucher_No"
              className="SugarTenderPurchase-form-control"
              value={formData.Voucher_No}
              onChange={handleChange}
              disabled
              tabIndex={6}
            />
            <label>{formData.Voucher_Type}</label>
          </div>
        </div>

        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_Date"
              className="SugarTenderPurchase-form-label"
            >
              Date:
            </label>
            <input
              type="date"
              id="Tender_Date"
              name="Tender_Date"
              className="SugarTenderPurchase-form-control"
              value={formData.Tender_Date}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={7}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Lifting_Date"
              className="SugarTenderPurchase-form-label"
            >
              Payment Date:
            </label>
            <input
              type="date"
              id="Lifting_Date"
              name="Lifting_Date"
              className="SugarTenderPurchase-form-control"
              value={formData.Lifting_Date}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={8}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="groupTenderNo"
              className="SugarTenderPurchase-form-label"
            >
              Group Tender No:
            </label>
            <input
              type="text"
              id="groupTenderNo"
              name="groupTenderNo"
              className="SugarTenderPurchase-form-control"
              value={formData.groupTenderNo}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={9}
            />
          </div>
        </div>

        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Mill_Code"
              className="SugarTenderPurchase-form-label"
            >
              Mill Code:
            </label>
            <AccountMasterHelp
              name="Mill_Code"
              onAcCodeClick={handleMill_Code}
              CategoryName={millCodeName}
              CategoryCode={newMill_Code}
              tabIndexHelp={10}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="season" className="SugarTenderPurchase-form-label">
              Season:
            </label>
            <input
              type="text"
              id="season"
              name="season"
              className="SugarTenderPurchase-form-control"
              value={formData.season}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={11}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="itemcode"
              className="SugarTenderPurchase-form-label"
            >
              Item Code:
            </label>
            <SystemHelpMaster
              name="itemcode"
              onAcCodeClick={handleitemcode}
              CategoryName={itemName}
              CategoryCode={newitemcode}
              tabIndexHelp={12}
              disabledField={!isEditing && addOneButtonEnabled}
              SystemType="I"
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Grade" className="SugarTenderPurchase-form-label">
              Grade:
            </label>
            <GradeMasterHelp
              name="Grade"
              onAcCodeClick={handleGrade}
              CategoryName={newGrade || formData.Grade}
              tabIndexHelp={13}
              disabledField={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Quantal" className="SugarTenderPurchase-form-label">
              Quintal:
            </label>
            <input
              type="text"
              id="Quantal"
              name="Quantal"
              className="SugarTenderPurchase-form-control"
              value={formData.Quantal}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={14}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Packing" className="SugarTenderPurchase-form-label">
              Packing:
            </label>
            <input
              type="text"
              id="Packing"
              name="Packing"
              className="SugarTenderPurchase-form-control"
              value={formData.Packing}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={15}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Bags" className="SugarTenderPurchase-form-label">
              Bags:
            </label>
            <input
              type="text"
              id="Bags"
              name="Bags"
              className="SugarTenderPurchase-form-control"
              value={formData.Bags || calculatedValues.bags}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={16}
            />
          </div>
        </div>

        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Mill_Rate"
              className="SugarTenderPurchase-form-label"
            >
              Mill Rate:
            </label>
            <input
              type="text"
              id="Mill_Rate"
              name="Mill_Rate"
              className={`SugarTenderPurchase-form-control ${
                errors.type ? "error-border" : ""
              }`}
              value={formData.Mill_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={17}
            />
            {errors.Mill_Rate && (
              <p className="error-message">{errors.Mill_Rate}</p>
            )}
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Purc_Rate"
              className="SugarTenderPurchase-form-label"
            >
              Purchase Rate:
            </label>
            <input
              type="text"
              id="Purc_Rate"
              name="Purc_Rate"
              className={`SugarTenderPurchase-form-control ${
                errors.type ? "error-border" : ""
              }`}
              value={formData.Purc_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={18}
            />
            {errors.Purc_Rate && (
              <p className="error-message">{errors.Purc_Rate}</p>
            )}
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Party_Bill_Rate"
              className="SugarTenderPurchase-form-label"
            >
              Party Bill Rate:
            </label>
            <input
              type="text"
              id="Party_Bill_Rate"
              name="Party_Bill_Rate"
              className={`SugarTenderPurchase-form-control ${
                errors.type ? "error-border" : ""
              }`}
              value={formData.Purc_Rate || formData.Party_Bill_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={19}
            />
            {errors.Party_Bill_Rate && (
              <p className="error-message">{errors.Party_Bill_Rate}</p>
            )}
          </div>
        </div>

        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Bp_Account"
              className="SugarTenderPurchase-form-label"
            >
              BP A/C:
            </label>
            <AccountMasterHelp
              name="Bp_Account"
              onAcCodeClick={handleBp_Account}
              CategoryName={bpAcName}
              CategoryCode={newBp_Account}
              tabIndexHelp={20}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="CashDiff"
              className="SugarTenderPurchase-form-label"
            >
              Diff:
            </label>
            <input
              type="text"
              id="CashDiff"
              name="CashDiff"
              className={`SugarTenderPurchase-form-control ${
                errors.type ? "error-border" : ""
              }`}
              value={calculatedValues.diff || formData.CashDiff}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={21}
            />
            {errors.CashDiff && (
              <p className="error-message">{errors.CashDiff}</p>
            )}
          </div>
          <div className="SugarTenderPurchase-col">
            <label>{calculatedValues.amount}</label>
          </div>
        </div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Payment_To"
              className="SugarTenderPurchase-form-label"
            >
              Payment To:
            </label>
            <AccountMasterHelp
              name="Payment_To"
              onAcCodeClick={handlePayment_To}
              CategoryName={paymentToName}
              CategoryCode={newPayment_To}
              tabIndexHelp={22}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_From"
              className="SugarTenderPurchase-form-label"
            >
              Tender From:
            </label>
            <AccountMasterHelp
              name="Tender_From"
              onAcCodeClick={handleTender_From}
              CategoryName={tenderFromName || paymentToName || tenderFrName}
              CategoryCode={
                newTender_From || newPayment_To || formData.Tender_From
              }
              tabIndexHelp={23}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Tender_DO"
              className="SugarTenderPurchase-form-label"
            >
              Tender D.O.:
            </label>
            <AccountMasterHelp
              name="Tender_DO"
              onAcCodeClick={handleTender_DO}
              CategoryName={tenderDOName !== "" ? tenderDOName : tenderDONm}
              CategoryCode={newTender_DO || formData.Tender_DO}
              tabIndexHelp={24}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Voucher_By"
              className="SugarTenderPurchase-form-label"
            >
              Voucher By:
            </label>
            <AccountMasterHelp
              name="Voucher_By"
              onAcCodeClick={handleVoucher_By}
              CategoryName={voucherByName || voucherbyName}
              CategoryCode={newVoucher_By || formData.Voucher_By}
              tabIndexHelp={25}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label htmlFor="Broker" className="SugarTenderPurchase-form-label">
              Broker:
            </label>
            <AccountMasterHelp
              name="Broker"
              onAcCodeClick={handleBroker}
              CategoryName={
                formData.Broker === self_ac_Code ? self_acName : brokerName
              }
              CategoryCode={newBroker || self_ac_Code}
              tabIndexHelp={26}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Brokrage"
              className="SugarTenderPurchase-form-label"
            >
              Brokrage:
            </label>
            <input
              type="text"
              id="Brokrage"
              name="Brokrage"
              className={`SugarTenderPurchase-form-control ${
                errors.type ? "error-border" : ""
              }`}
              value={formData.Brokrage}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={27}
            />
            {errors.Brokrage && (
              <p className="error-message">{errors.Brokrage}</p>
            )}
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="gstratecode"
              className="SugarTenderPurchase-form-label"
            >
              GST Rate Code:
            </label>
            <GSTRateMasterHelp
              onAcCodeClick={handlegstratecode}
              GstRateName={gstRateName}
              GstRateCode={newgstratecode}
              name="gstratecode"
              tabIndexHelp={28}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Excise_Rate"
              className="SugarTenderPurchase-form-label"
            >
              GST Rate:
            </label>
            <input
              type="text"
              id="Excise_Rate"
              name="Excise_Rate"
              className="SugarTenderPurchase-form-control"
              value={calculatedValues.exciseAmount}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={29}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="GSTAmt" className="SugarTenderPurchase-form-label">
              GST Amount
            </label>
            <input
              type="text"
              id="GSTAmt"
              name="GSTAmt"
              className="SugarTenderPurchase-form-control"
              value={calculatedValues.gstAmt || ""}
              onChange={(e) => {
                console.log("GST Amount Input:", e.target.value);
                handleChange(e);
              }}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={30}
            />
          </div>

          <div className="SugarTenderPurchase-col">
            <label>{calculatedValues.lblValue}</label>
          </div>

          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Sell_Note_No"
              className="SugarTenderPurchase-form-label"
            >
              Sell Note No:
            </label>
            <input
              type="text"
              id="Sell_Note_No"
              name="Sell_Note_No"
              className="SugarTenderPurchase-form-control"
              value={formData.Sell_Note_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={31}
            />
          </div>
        </div>
        <div className="SugarTenderPurchase-row">
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="Narration"
              className="SugarTenderPurchase-form-label"
            >
              Narration:
            </label>
            <textarea
              type="text"
              id="Narration"
              name="Narration"
              className="SugarTenderPurchase-form-control"
              value={formData.Narration}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={32}
            />
          </div>
          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="TCS_Rate"
              className="SugarTenderPurchase-form-label"
            >
              TCS%:
            </label>
            <input
              type="text"
              id="TCS_Rate"
              name="TCS_Rate"
              className={`SugarTenderPurchase-form-control ${
                errors.type ? "error-border" : ""
              }`}
              value={formData.TCS_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={33}
            />
            {errors.TCS_Rate && (
              <p className="error-message">{errors.TCS_Rate}</p>
            )}
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="TCS_Amt" className="SugarTenderPurchase-form-label">
              TCS Amount:
            </label>
            <input
              type="text"
              id="TCS_Amt"
              name="TCS_Amt"
              className="SugarTenderPurchase-form-control"
              value={
                calculatedValues.tcsAmt || calculatedValues.calculatedTcsAmt
              }
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={34}
            />
          </div>

          <div className="SugarTenderPurchase-col">
            <label
              htmlFor="TDS_Rate"
              className="SugarTenderPurchase-form-label"
            >
              TDS Rate:
            </label>
            <input
              type="text"
              id="TDS_Rate"
              name="TDS_Rate"
              className={`SugarTenderPurchase-form-control ${
                errors.type ? "error-border" : ""
              }`}
              value={formData.TDS_Rate}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={35}
            />
            {errors.TDS_Rate && (
              <p className="error-message">{errors.TDS_Rate}</p>
            )}
          </div>
          <div className="SugarTenderPurchase-col">
            <label htmlFor="TDS_Amt" className="SugarTenderPurchase-form-label">
              TDS Amount:
            </label>
            <input
              type="text"
              id="TDS_Amt"
              name="TDS_Amt"
              className="SugarTenderPurchase-form-control"
              value={
                formData.TDS_Amt ||
                calculatedValues.tdsAmt ||
                calculatedValues.calculatedTdsAmt
              }
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              tabIndex={36}
            />
          </div>
        </div>

        {/*detail part popup functionality and Validation part Grid view */}
        <div className="">
          {showPopup && (
            <div className="custom-modal" role="dialog">
              <div className="custom-modal-dialog" role="document">
                <div className="custom-modal-content">
                  <div className="custom-modal-header">
                    <h5 className="custom-modal-title">
                      {selectedUser.id ? "Edit User" : "Add User"}
                    </h5>
                    <button
                      type="button"
                      onClick={closePopup}
                      aria-label="Close"
                      className="close-btn"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="custom-modal-body">
                    <form>
                      <div className="form-row">
                        <label>Bill To</label>
                        <div className="form-element">
                          <AccountMasterHelp
                            key={billTo}
                            onAcCodeClick={handleBillTo}
                            CategoryName={selfAcCode ? selfAcName : billtoName}
                            CategoryCode={billTo || selfAcCode}
                            name="Buyer"
                            tabIndexHelp={38}
                            className="account-master-help"
                            disabledFeild={!isEditing && addOneButtonEnabled}
                          />
                        </div>
                        <label>Ship To</label>
                        <div className="form-element">
                          <AccountMasterHelp
                            key={shipTo}
                            onAcCodeClick={handleShipTo}
                            CategoryName={selfAcCode ? selfAcName : shiptoName}
                            CategoryCode={shipTo || selfAcCode}
                            name="ShipTo"
                            tabIndexHelp={39}
                            className="account-master-help"
                            disabledFeild={!isEditing && addOneButtonEnabled}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label htmlFor="Delivery_Type">Delivery Type:</label>
                        <select
                          id="Delivery_Type"
                          name="Delivery_Type"
                          value={formDataDetail.Delivery_Type || dispatchType}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                          tabIndex={40}
                        >
                          <option value="N">With GST Naka Delivery</option>
                          <option value="A">
                            Naka Delivery without GST Rate
                          </option>
                          <option value="C">Commission</option>
                          <option value="D">DO</option>
                        </select>
                        <label>Broker</label>
                        <div className="form-element">
                          <AccountMasterHelp
                            key={buyerParty}
                            onAcCodeClick={handleBuyerParty}
                            CategoryName={
                              self_ac_Code ? self_acName : buyerPartyName
                            }
                            CategoryCode={
                              buyerParty || selfAcCode || self_ac_Code || 2
                            }
                            name="Buyer_Party"
                            tabIndexHelp={39}
                            className="account-master-help"
                            disabledFeild={!isEditing && addOneButtonEnabled}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <label>Brokrage</label>
                        <input
                          type="text"
                          tabIndex={43}
                          className="form-control"
                          name="DetailBrokrage"
                          autoComplete="off"
                          value={formDataDetail.DetailBrokrage}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                        <label>Sub Broker:</label>
                        <AccountMasterHelp
                          onAcCodeClick={handleDetailSubBroker}
                          CategoryName={
                            self_ac_Code ? self_acName : brokerDetail
                          }
                          CategoryCode={
                            formDataDetail.sub_broker ||
                            subBroker ||
                            selfAcCode ||
                            self_ac_Code ||
                            2
                          }
                          name="sub_broker"
                          tabIndexHelp={42}
                          className="account-master-help"
                          disabledFeild={!isEditing && addOneButtonEnabled}
                        />
                        <label>Buyer Quantal:</label>
                        <input
                          type="text"
                          tabIndex={43}
                          className="form-control"
                          name="Buyer_Quantal"
                          autoComplete="off"
                          value={formDataDetail.Buyer_Quantal}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                      </div>

                      <div className="form-row">
                        <label>Sale Rate</label>
                        <input
                          type="text"
                          tabIndex="44"
                          className="form-control"
                          name="Sale_Rate"
                          autoComplete="off"
                          value={formDataDetail.Sale_Rate}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                        <label>B.P.</label>
                        <input
                          type="text"
                          tabIndex="45"
                          className="form-control"
                          name="BP_Detail"
                          autoComplete="off"
                          value={formDataDetail.BP_Detail}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                        <label>Commission</label>
                        <input
                          type="text"
                          tabIndex="45"
                          className="form-control"
                          name="Commission_Rate"
                          autoComplete="off"
                          value={formDataDetail.Commission_Rate}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                      </div>

                      <div className="form-row">
                        <label>Sauda Date</label>
                        <input
                          tabIndex="46"
                          type="date"
                          className="form-control"
                          id="datePicker"
                          name="Sauda_Date"
                          value={formDataDetail.Sauda_Date}
                          onChange={(e) =>
                            handleDetailDateChange(e, "Sauda_Date")
                          }
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                        <label>Payment Date</label>
                        <input
                          tabIndex="47"
                          type="date"
                          className="form-control"
                          id="datePicker"
                          name="Lifting_Date"
                          value={formDataDetail.Lifting_Date}
                          onChange={(e) =>
                            handleDetailDateChange(e, "Lifting_Date")
                          }
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                      </div>

                      <div className="form-row">
                        <label>Narration:</label>
                        <textarea
                          tabIndex="48"
                          className="form-control"
                          name="Narration"
                          autoComplete="off"
                          value={formDataDetail.Narration}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                        <label>Loading By Us</label>
                        <input
                          type="checkbox"
                          id="loding_by_us"
                          Name="loding_by_us"
                          checked={formDataDetail.loding_by_us === "Y"}
                          onChange={(e) => handleCheckbox(e, "string")}
                          disabled={!isEditing && addOneButtonEnabled}
                          tabIndex={49}
                        />
                      </div>

                      <div className="form-row">
                        <label>GST Amount</label>
                        <input
                          type="text"
                          tabIndex="50"
                          className="form-control"
                          name="gst_rate"
                          autoComplete="off"
                          value={formDataDetail.gst_rate || gstCode}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                        <input
                          type="text"
                          tabIndex="51"
                          className="form-control"
                          name="gst_amt"
                          autoComplete="off"
                          value={
                            calculatedValues.gstAmtDetail ||
                            (formDataDetail.Buyer_Quantal *
                              formDataDetail.Sale_Rate *
                              gstCode) /
                              100
                          }
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                      </div>

                      <div className="form-row">
                        <label>TCS Amount</label>
                        <input
                          type="text"
                          tabIndex="52"
                          className="form-control"
                          name="tcs_rate"
                          autoComplete="off"
                          value={formDataDetail.tcs_rate || formData.TCS_Rate}
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                        <input
                          type="text"
                          tabIndex="53"
                          className="form-control"
                          name="tcs_amt"
                          autoComplete="off"
                          value={
                            calculatedValues.TCSAmt ||
                            calculatedValues.gstAmtDetail *
                              (formDataDetail.tcs_rate / 100)
                          }
                          onChange={handleChangeDetail}
                          disabled={!isEditing && addOneButtonEnabled}
                        />
                      </div>

                      <label>{calculatedValues.lblNetAmount}</label>
                    </form>
                  </div>
                  <div className="custom-modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closePopup}
                      style={{ marginLeft: "750px" }}
                      tabIndex="54"
                    >
                      Cancel
                    </button>
                    {selectedUser.id ? (
                      <button
                        className="btn btn-primary"
                        onClick={updateUser}
                        tabIndex="55"
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
                        tabIndex="55"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            addUser();
                          }
                        }}
                      >
                        Add User
                      </button>
                    )}
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
                tabIndex="37"
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
                tabIndex="38"
              >
                Close
              </button>
            </div>
            <table className="table mt-4 table-bordered">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>ID</th>
                  {/*<th>RowAction</th> */}
                  <th>Party</th>
                  <th>Party Name</th>
                  <th>Broker</th>
                  <th>Broker Name</th>
                  <th>ShipTo</th>
                  <th>ShipTo Name</th>
                  <th>Quintal</th>
                  <th>Sale Rate</th>
                  <th>Cash Difference</th>
                  <th>Commission</th>
                  <th>Sauda Date</th>
                  <th>Lifting_Date</th>
                  <th>Sauda_Narration</th>
                  <th>Delivery_Type</th>
                  <th>GSTRate</th>
                  <th>GSTAmt</th>
                  <th>TCSRate</th>
                  <th>TCSAmount</th>
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
                            disabled={!isEditing || user.id === 1}
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
                            disabled={!isEditing || user.id === 1}
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
                    {/* <td>{user.rowaction}</td> */}
                    <td>{user.Buyer}</td>
                    <td>{user.billtoName}</td>
                    <td>{user.Buyer_Party}</td>
                    <td>{user.buyerPartyName}</td>
                    <td>{user.ShipTo}</td>
                    <td>{user.shiptoName}</td>
                    <td>{user.Buyer_Quantal}</td>
                    <td>{user.Sale_Rate}</td>
                    <td>{user.CashDiff}</td>
                    <td>{user.Commission_Rate}</td>
                    <td>{user.Sauda_Date}</td>
                    <td>{user.Lifting_Date}</td>
                    <td>{user.Narration}</td>
                    <td>{user.Delivery_Type || dispatchType}</td>
                    <td>{user.gst_rate}</td>
                    <td>{user.gst_amt}</td>
                    <td>{user.tcs_rate || formData.TCS_Rate}</td>
                    <td>{user.tcs_amt}</td>
                    {/* <td>{user.saledetailid}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </>
  );
};
export default TenderPurchase;
