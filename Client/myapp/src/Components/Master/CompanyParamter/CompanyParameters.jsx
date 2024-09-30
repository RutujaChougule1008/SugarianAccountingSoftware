import React from "react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "./CompanyParameters.css";
import "react-toastify/dist/ReactToastify.css";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");
const API_URL = process.env.REACT_APP_API;

var CommissionAcName;
var newCOMMISSION_AC;
var InterestAcName;
var newINTEREST_AC;
var TransportAcName;
var newTRANSPORT_AC;
var PostageAcName;
var newPOSTAGE_AC;
var SelfAc;
var newSELF_AC;
var GSTStateCodeName;
var newGSTStateCode;
var SaleCGSTAcName;
var newCGSTAc;
var SaleSGSTAcName;
var newSGSTAc;
var SaleIGSTAcName;
var newIGSTAc;
var PurchaseCGSTAcName;
var newPurchaseCGSTAc;
var PurchaseSGSTAcName;
var newPurchaseSGSTAc;
var PurchaseIGSTAcName;
var newPurchaseIGSTAc;
var RoundOffAcName;
var newRoundOff;
var TransportRCMGSTAcName;
var newTransport_RCM_GSTRate;
var CGST_RCMAcName;
var newCGST_RCM_Ac;
var SGST_RCMAcName;
var newSGST_RCM_Ac;
var IGST_RCMAcName;
var newIGST_RCM_Ac;
var FreightAcName;
var newFreight_Ac;
var PurchaseTCS_AcName;
var newPurchaseTCSAc;
var SaleTCS_AcName;
var newSaleTCSAc;
var OtherAcName;
var newOTHER_AMOUNT_AC;
var MarketSaseAcName;
var newMarketSase;
var SupercostAcName;
var newSuperCost;
var PackingAcName;
var newPacking;
var HamaliAcName;
var newHamali;
var TransportTDS_AcName;
var newTransportTDS_Ac;
var TransportTDS_CutAcName;
var newTransportTDS_AcCut;
var ReturnSaleCGST_AcName;
var newReturnSaleCGST;
var ReturnSaleSGSTAc_Name;
var newReturnSaleSGST;
var ReturnSaleIGSTName;
var newReturnSaleIGST;
var ReturnPurchaseCGSTName;
var newReturnPurchaseCGST;
var ReturnPurchaseSGST;
var newReturnPurchaseSGST;
var ReturnPurchaseIGSTName;
var newReturnPurchaseIGST;
var SaleTDSAcName;
var newSaleTDSAc;
var PurchaseTDSAcName;
var newPurchaseTDSAc;
var RateDiffAcName;
var newRateDiffAc;
var DepreciationAcName;
var newDepreciationAC;
var InterestTDS_AcName;
var newInterestTDSAc;
var BankPaymentAcName;
var newBankPaymentAc;
const CompanyParameters = () => {
  const [accountCode, setAccountCode] = useState("");

  const initialFormData = {
    COMMISSION_AC: "",
    INTEREST_AC: "",
    TRANSPORT_AC: "",
    POSTAGE_AC: "",
    SELF_AC: "",
    Company_Code: "",
    Year_Code: "",
    Created_By: "",
    Modified_By: "",
    AutoVoucher: "",
    tblPrefix: "",
    GSTStateCode: "",
    CGSTAc: "",
    SGSTAc: "",
    IGSTAc: "",
    PurchaseCGSTAc: "",
    PurchaseSGSTAc: "",
    PurchaseIGSTAc: "",
    RoundOff: "",
    Transport_RCM_GSTRate: "",
    CGST_RCM_Ac: "",
    SGST_RCM_Ac: "",
    IGST_RCM_Ac: "",
    Freight_Ac: "",
    TCS: "",
    PurchaseTCSAc: "",
    SaleTCSAc: "",
    filename: "",
    OTHER_AMOUNT_AC: "",
    MarketSase: "",
    SuperCost: "",
    Packing: "",
    Hamali: "",
    TransportTDS_Ac: "",
    TransportTDS_AcCut: "",
    Mill_Payment_date: "",
    dispatchType: "",
    ReturnSaleCGST: "",
    ReturnSaleSGST: "",
    ReturnSaleIGST: "",
    ReturnPurchaseCGST: "",
    ReturnPurchaseSGST: "",
    ReturnPurchaseIGST: "",
    SaleTDSAc: "",
    PurchaseTDSAc: "",
    PurchaseTDSRate: "",
    SaleTDSRate: "",
    BalanceLimit: "",
    RateDiffAc: "",
    customisesb: "",
    customisedo: "",
    DODate: "",
    DOPages: "",
    TCSPurchaseBalanceLimit: "",
    TDSPurchaseBalanceLimit: "",
    PurchaseSaleTcs: "",
    TCSTDSSaleBalanceLimit: "",
    DepreciationAC: "",
    InterestRate: "",
    InterestTDSAc: "",
    BankPaymentAc: "",
    bpid: "",
    Edit_Sale_Rate: "",
  };
  const handleCOMMISSION_AC = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      COMMISSION_AC: code,
    });
  };
  const handleINTEREST_AC = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      INTEREST_AC: code,
    });
  };
  const handleTRANSPORT_AC = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      TRANSPORT_AC: code,
    });
  };
  const handlePOSTAGE_AC = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      POSTAGE_AC: code,
    });
  };
  const handleSELF_AC = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      SELF_AC: code,
    });
  };
  const handleGSTStateCode = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      GSTStateCode: code,
    });
  };
  const handleCGSTAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      CGSTAc: code,
    });
  };
  const handleSGSTAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      SGSTAc: code,
    });
  };
  const handleIGSTAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      IGSTAc: code,
    });
  };
  const handlePurchaseCGSTAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      PurchaseCGSTAc: code,
    });
  };
  const handlePurchaseSGSTAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      PurchaseSGSTAc: code,
    });
  };
  const handlePurchaseIGSTAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      PurchaseIGSTAc: code,
    });
  };
  const handleRoundOff = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      RoundOff: code,
    });
  };
  const handleTransport_RCM_GSTRate = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      Transport_RCM_GSTRate: code,
    });
  };
  const handleCGST_RCM_Ac = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      CGST_RCM_Ac: code,
    });
  };
  const handleSGST_RCM_Ac = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      SGST_RCM_Ac: code,
    });
  };
  const handleIGST_RCM_Ac = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      IGST_RCM_Ac: code,
    });
  };
  const handleFreight_Ac = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      Freight_Ac: code,
    });
  };
  const handlePurchaseTCSAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      PurchaseTCSAc: code,
    });
  };
  const handleSaleTCSAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      SaleTCSAc: code,
    });
  };
  const handleOTHER_AMOUNT_AC = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      OTHER_AMOUNT_AC: code,
    });
  };
  const handleMarketSase = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      MarketSase: code,
    });
  };
  const handleSuperCost = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      SuperCost: code,
    });
  };
  const handlePacking = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      Packing: code,
    });
  };
  const handleHamali = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      Hamali: code,
    });
  };
  const handleTransportTDS_Ac = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      TransportTDS_Ac: code,
    });
  };
  const handleTransportTDS_AcCut = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      TransportTDS_AcCut: code,
    });
  };
  const handleReturnSaleCGST = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      ReturnSaleCGST: code,
    });
  };
  const handleReturnSaleSGST = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      ReturnSaleSGST: code,
    });
  };
  const handleReturnSaleIGST = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      ReturnSaleIGST: code,
    });
  };
  const handleReturnPurchaseCGST = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      ReturnPurchaseCGST: code,
    });
  };
  const handleReturnPurchaseSGST = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      ReturnPurchaseSGST: code,
    });
  };
  const handleReturnPurchaseIGST = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      ReturnPurchaseIGST: code,
    });
  };
  const handleSaleTDSAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      SaleTDSAc: code,
    });
  };
  const handlePurchaseTDSAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      PurchaseTDSAc: code,
    });
  };
  const handleRateDiffAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      RateDiffAc: code,
    });
  };
  const handleDepreciationAC = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      DepreciationAC: code,
    });
  };
  const handleInterestTDSAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      InterestTDSAc: code,
    });
  };
  const handleBankPaymentAc = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      BankPaymentAc: code,
    });
  };
  const [formData, setFormData] = useState(initialFormData);
  // Handle change for all inputs
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => {
      // Create a new object based on existing state
      const updatedFormData = { ...prevState, [name]: value };
      return updatedFormData;
    });
  };

  const handleSaveOrUpdate = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/create-or-update-CompanyParameters`,
        formData
      );
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to update data");
    }
  };

  useEffect(() => {
    handleCancel();
  }, []);

  const handleCancel = () => {
    axios
      .get(
        `${API_URL}/get-CompanyParameters-Record?Company_Code=${companyCode}&Year_Code=${Year_Code}`
      )
      .then((response) => {
        const data = response.data.CompanyParameters_data;
        const additionalData = response.data.additional_data[0];
        CommissionAcName = additionalData.commissionAcName;
        newCOMMISSION_AC = data.COMMISSION_AC;
        InterestAcName = additionalData.interestAcName;
        newINTEREST_AC = data.INTEREST_AC;
        TransportAcName = additionalData.transportAcName;
        newTRANSPORT_AC = data.TRANSPORT_AC;
        PostageAcName = additionalData.postageAcName;
        newPOSTAGE_AC = data.POSTAGE_AC;
        SelfAc = additionalData.selfAcName;
        newSELF_AC = data.SELF_AC;
        GSTStateCodeName = additionalData.State_Name;
        newGSTStateCode = data.GSTStateCode;
        SaleCGSTAcName = additionalData.CGSTAcName;
        newCGSTAc = data.CGSTAc;
        SaleSGSTAcName = additionalData.SGSTAcName;
        newSGSTAc = data.SGSTAc;
        SaleIGSTAcName = additionalData.IGSTAcName;
        newIGSTAc = data.IGSTAc;
        PurchaseCGSTAcName = additionalData.PurchaseCGSTAcName;
        newPurchaseCGSTAc = data.PurchaseCGSTAc;
        PurchaseSGSTAcName = additionalData.PurchaseSGSTAcName;
        newPurchaseSGSTAc = data.PurchaseSGSTAc;
        PurchaseIGSTAcName = additionalData.PurchaseIGSTAcName;
        newPurchaseIGSTAc = data.PurchaseIGSTAc;
        RoundOffAcName = additionalData.interestAcName;
        newRoundOff = data.RoundOff;
        TransportRCMGSTAcName = additionalData.TransportRCMGSTRateAcName;
        newTransport_RCM_GSTRate = data.Transport_RCM_GSTRate;
        CGST_RCMAcName = additionalData.CGSTRCMAcName;
        newCGST_RCM_Ac = data.CGST_RCM_Ac;
        SGST_RCMAcName = additionalData.SGSTRCMAcName;
        newSGST_RCM_Ac = data.SGST_RCM_Ac;
        IGST_RCMAcName = additionalData.IGSTRCMAcName;
        newIGST_RCM_Ac = data.IGST_RCM_Ac;
        FreightAcName = additionalData.FreightAcName;
        newFreight_Ac = data.Freight_Ac;
        PurchaseTCS_AcName = additionalData.PurchaseTCSAcName;
        newPurchaseTCSAc = data.PurchaseTCSAc;
        SaleTCS_AcName = additionalData.SaleTCSAcName;
        newSaleTCSAc = data.SaleTCSAc;
        OtherAcName = additionalData.OtherAmountAcName;
        newOTHER_AMOUNT_AC = data.OTHER_AMOUNT_AC;
        MarketSaseAcName = additionalData.MarketSaseAcName;
        newMarketSase = data.MarketSase;
        SupercostAcName = additionalData.SuperCostAcName;
        newSuperCost = data.SuperCost;
        PackingAcName = additionalData.PackingAcName;
        newPacking = data.Packing;
        HamaliAcName = additionalData.HamaliAcName;
        newHamali = data.Hamali;
        TransportTDS_AcName = additionalData.TransportTDSAcName;
        newTransportTDS_Ac = data.TransportTDS_Ac;
        TransportTDS_CutAcName = additionalData.TransportTDSAcCutAcName;
        newTransportTDS_AcCut = data.TransportTDS_AcCut;
        ReturnSaleCGST_AcName = additionalData.ReturnSaleCGSTAcAcName;
        newReturnSaleCGST = data.ReturnSaleCGST;
        ReturnSaleSGSTAc_Name = additionalData.ReturnSaleSGSTAcName;
        newReturnSaleSGST = data.ReturnSaleSGST;
        ReturnSaleIGSTName = additionalData.ReturnSaleIGSTAcName;
        newReturnSaleIGST = data.ReturnSaleIGST;
        ReturnPurchaseCGSTName = additionalData.ReturnPurchaseCGSTAcName;
        newReturnPurchaseCGST = data.ReturnPurchaseCGST;
        ReturnPurchaseSGST = additionalData.ReturnPurchaseSGSTAcName;
        newReturnPurchaseSGST = data.ReturnPurchaseSGST;
        ReturnPurchaseIGSTName = additionalData.ReturnPurchaseIGSTAcName;
        newReturnPurchaseIGST = data.ReturnPurchaseIGST;
        SaleTDSAcName = additionalData.SaleTDSAcName;
        newSaleTDSAc = data.SaleTDSAc;
        PurchaseTDSAcName = additionalData.PurchaseTDSAcName;
        newPurchaseTDSAc = data.PurchaseTDSAc;
        RateDiffAcName = additionalData.RateDiffAcName;
        newRateDiffAc = data.RateDiffAc;
        DepreciationAcName = additionalData.DepreciationAcName;
        newDepreciationAC = data.DepreciationAC;
        InterestTDS_AcName = additionalData.InterestTDSAcName;
        newInterestTDSAc = data.InterestTDSAc;
        BankPaymentAcName = additionalData.BankPaymentAcName;
        newBankPaymentAc = data.BankPaymentAc;

        console.log(data);
        setFormData({
          ...formData,
          ...data,
        });
      })
      .catch((error) => {
        console.error("Error fetching latest data for edit:", error);
      });
  };

  return (
    <>
      <div className="company-parameters-form-container">
        <ToastContainer />
        <form onSubmit={handleSaveOrUpdate}>
          <h2>Company Parameter</h2>
          <br />
          <div className="CompanyParameters-form-group">
            <div className="CompanyParameters-form-group-column">
            <label htmlFor="COMMISSION_AC">Commission A/c</label>
            <AccountMasterHelp
              Name="COMMISSION_AC"
              onAcCodeClick={handleCOMMISSION_AC}
              CategoryName={CommissionAcName}
              CategoryCode={newCOMMISSION_AC}
              tabIndex={1}
            />
            </div>
            <div className="CompanyParameters-form-group-row">
            <label htmlFor="INTEREST_AC">Interest A/c</label>
            <AccountMasterHelp
              Name="INTEREST_AC"
              onAcCodeClick={handleINTEREST_AC}
              CategoryName={InterestAcName}
              CategoryCode={newINTEREST_AC}
              tabIndex={2}
            />
            </div>
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="TRANSPORT_AC">Transport A/c</label>
            <AccountMasterHelp
              Name="TRANSPORT_AC"
              onAcCodeClick={handleTRANSPORT_AC}
              CategoryName={TransportAcName}
              CategoryCode={newTRANSPORT_AC}
              tabIndex={3}
            />
            <label htmlFor="POSTAGE_AC">Postage A/c</label>
            <AccountMasterHelp
              Name="POSTAGE_AC"
              onAcCodeClick={handlePOSTAGE_AC}
              CategoryName={PostageAcName}
              CategoryCode={newPOSTAGE_AC}
              tabIndex={4}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="SELF_AC">Self A/c</label>
            <AccountMasterHelp
              Name="SELF_AC"
              onAcCodeClick={handleSELF_AC}
              CategoryName={SelfAc}
              CategoryCode={newSELF_AC}
              tabIndex={5}
            />
            <label htmlFor="AutoVoucher">Auto Generate Voucher:</label>
            <input
              type="text"
              id="AutoVoucher"
              Name="AutoVoucher"
              value={formData.AutoVoucher}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="GSTStateCode">GST State Code</label>
            <AccountMasterHelp
              Name="GSTStateCode"
              onAcCodeClick={handleGSTStateCode}
              CategoryName={GSTStateCodeName}
              CategoryCode={newGSTStateCode}
              tabIndex={12}
            />
            <label htmlFor="CGSTAc">Sale CGST A/c</label>
            <AccountMasterHelp
              Name="CGSTAc"
              onAcCodeClick={handleCGSTAc}
              CategoryName={SaleCGSTAcName}
              CategoryCode={newCGSTAc}
              tabIndex={13}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="SGSTAc">Sale SGST A/c</label>
            <AccountMasterHelp
              Name="SGSTAc"
              onAcCodeClick={handleSGSTAc}
              CategoryName={SaleSGSTAcName}
              CategoryCode={newSGSTAc}
              tabIndex={14}
            />
            <label htmlFor="IGSTAc">Sale IGST A/c</label>
            <AccountMasterHelp
              Name="IGSTAc"
              onAcCodeClick={handleIGSTAc}
              CategoryName={SaleIGSTAcName}
              CategoryCode={newIGSTAc}
              tabIndex={15}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="PurchaseCGSTAc">Purchase CGST A/c</label>
            <AccountMasterHelp
              Name="PurchaseCGSTAc"
              onAcCodeClick={handlePurchaseCGSTAc}
              CategoryName={PurchaseCGSTAcName}
              CategoryCode={newPurchaseCGSTAc}
              tabIndex={16}
            />
            <label htmlFor="PurchaseSGSTAc">Purchase SGST A/c</label>
            <AccountMasterHelp
              Name="PurchaseSGSTAc"
              onAcCodeClick={handlePurchaseSGSTAc}
              CategoryName={PurchaseSGSTAcName}
              CategoryCode={newPurchaseSGSTAc}
              tabIndex={17}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="PurchaseIGSTAc">Purchase IGST A/c</label>
            <AccountMasterHelp
              Name="PurchaseIGSTAc"
              onAcCodeClick={handlePurchaseIGSTAc}
              CategoryName={PurchaseIGSTAcName}
              CategoryCode={newPurchaseIGSTAc}
              tabIndex={18}
            />
            <label htmlFor="RoundOff">Round off</label>
            <AccountMasterHelp
              Name="RoundOff"
              onAcCodeClick={handleRoundOff}
              CategoryName={RoundOffAcName}
              CategoryCode={newRoundOff}
              tabIndex={19}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="Transport_RCM_GSTRate">Transport RCM GSTRate</label>
            <AccountMasterHelp
              Name="Transport_RCM_GSTRate"
              onAcCodeClick={handleTransport_RCM_GSTRate}
              CategoryName={TransportRCMGSTAcName}
              CategoryCode={newTransport_RCM_GSTRate}
              tabIndex={20}
            />
            <label htmlFor="CGST_RCM_Ac">CGST RCM Ac</label>
            <AccountMasterHelp
              Name="CGST_RCM_Ac"
              onAcCodeClick={handleCGST_RCM_Ac}
              CategoryName={CGST_RCMAcName}
              CategoryCode={newCGST_RCM_Ac}
              tabIndex={21}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="SGST_RCM_Ac">SGST RCM Ac</label>
            <AccountMasterHelp
              Name="SGST_RCM_Ac"
              onAcCodeClick={handleSGST_RCM_Ac}
              CategoryName={SGST_RCMAcName}
              CategoryCode={newSGST_RCM_Ac}
              tabIndex={22}
            />
            <label htmlFor="IGST_RCM_Ac">IGST RCM Ac</label>
            <AccountMasterHelp
              Name="IGST_RCM_Ac"
              onAcCodeClick={handleIGST_RCM_Ac}
              CategoryName={IGST_RCMAcName}
              CategoryCode={newIGST_RCM_Ac}
              tabIndex={23}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="Freight_Ac">Freight A/C</label>
            <AccountMasterHelp
              Name="Freight_Ac"
              onAcCodeClick={handleFreight_Ac}
              CategoryName={FreightAcName}
              CategoryCode={newFreight_Ac}
              tabIndex={24}
            />
            <label htmlFor="TCS">SALE TCS %:</label>
            <input
              type="text"
              id="TCS"
              Name="TCS"
              value={formData.TCS}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="PurchaseTCSAc">Purchase TCS A/c</label>
            <AccountMasterHelp
              Name="PurchaseTCSAc"
              onAcCodeClick={handlePurchaseTCSAc}
              CategoryName={PurchaseTCS_AcName}
              CategoryCode={newPurchaseTCSAc}
              tabIndex={26}
            />
            <label htmlFor="SaleTCSAc">Sale TCS A/c</label>
            <AccountMasterHelp
              Name="SaleTCSAc"
              onAcCodeClick={handleSaleTCSAc}
              CategoryName={SaleTCS_AcName}
              CategoryCode={newSaleTCSAc}
              tabIndex={27}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="OTHER_AMOUNT_AC">Other A/c</label>
            <AccountMasterHelp
              Name="OTHER_AMOUNT_AC"
              onAcCodeClick={handleOTHER_AMOUNT_AC}
              CategoryName={OtherAcName}
              CategoryCode={newOTHER_AMOUNT_AC}
              tabIndex={29}
            />
            <label htmlFor="MarketSase">Market Sase A/c</label>
            <AccountMasterHelp
              Name="MarketSase"
              onAcCodeClick={handleMarketSase}
              CategoryName={MarketSaseAcName}
              CategoryCode={newMarketSase}
              tabIndex={30}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="SuperCost">Supercost A/c</label>
            <AccountMasterHelp
              Name="SuperCost"
              onAcCodeClick={handleSuperCost}
              CategoryName={SupercostAcName}
              CategoryCode={newSuperCost}
              tabIndex={31}
            />
            <label htmlFor="Packing">Packing A/c</label>
            <AccountMasterHelp
              Name="Packing"
              onAcCodeClick={handlePacking}
              CategoryName={PackingAcName}
              CategoryCode={newPacking}
              tabIndex={32}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="Hamali">Hamali A/c</label>
            <AccountMasterHelp
              Name="Hamali"
              onAcCodeClick={handleHamali}
              CategoryName={HamaliAcName}
              CategoryCode={newHamali}
              tabIndex={33}
            />
            <label htmlFor="TransportTDS_Ac">Transport TDS A/c</label>
            <AccountMasterHelp
              Name="TransportTDS_Ac"
              onAcCodeClick={handleTransportTDS_Ac}
              CategoryName={TransportTDS_AcName}
              CategoryCode={newTransportTDS_Ac}
              tabIndex={34}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="TransportTDS_AcCut">
              Transport TDS Cut by Us A/c
            </label>
            <AccountMasterHelp
              Name="TransportTDS_AcCut"
              onAcCodeClick={handleTransportTDS_AcCut}
              CategoryName={TransportTDS_CutAcName}
              CategoryCode={newTransportTDS_AcCut}
              tabIndex={35}
            />
            <label htmlFor="Mill_Payment_date">Mill Payment Date:</label>
            <input
              type="text"
              id="Mill_Payment_date"
              Name="Mill_Payment_date"
              value={formData.Mill_Payment_date}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="dispatchType">Dispatch Type:</label>
            <input
              id="dispatchType"
              Name="dispatchType"
              value={formData.dispatchType}
              onChange={handleChange}
            />
            <label htmlFor="ReturnSaleCGST">Return Sale CGST</label>
            <AccountMasterHelp
              Name="ReturnSaleCGST"
              onAcCodeClick={handleReturnSaleCGST}
              CategoryName={ReturnSaleCGST_AcName}
              CategoryCode={newReturnSaleCGST}
              tabIndex={38}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="ReturnSaleSGST">Return Sale SGST</label>
            <AccountMasterHelp
              Name="ReturnSaleSGST"
              onAcCodeClick={handleReturnSaleSGST}
              CategoryName={ReturnSaleSGSTAc_Name}
              CategoryCode={newReturnSaleSGST}
              tabIndex={39}
            />
            <label htmlFor="ReturnSaleIGST">Return Sale IGST</label>
            <AccountMasterHelp
              Name="ReturnSaleIGST"
              onAcCodeClick={handleReturnSaleIGST}
              CategoryName={ReturnSaleIGSTName}
              CategoryCode={newReturnSaleIGST}
              tabIndex={40}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="ReturnPurchaseCGST">Return Purchase CGST</label>
            <AccountMasterHelp
              Name="ReturnPurchaseCGST"
              onAcCodeClick={handleReturnPurchaseCGST}
              CategoryName={ReturnPurchaseCGSTName}
              CategoryCode={newReturnPurchaseCGST}
              tabIndex={41}
            />
            <label htmlFor="ReturnPurchaseSGST">Return Purchase SGST</label>
            <AccountMasterHelp
              Name="ReturnPurchaseSGST"
              onAcCodeClick={handleReturnPurchaseSGST}
              CategoryName={ReturnPurchaseSGST}
              CategoryCode={newReturnPurchaseSGST}
              tabIndex={42}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="ReturnPurchaseIGST">Return Purchase IGST</label>
            <AccountMasterHelp
              Name="ReturnPurchaseIGST"
              onAcCodeClick={handleReturnPurchaseIGST}
              CategoryName={ReturnPurchaseIGSTName}
              CategoryCode={newReturnPurchaseIGST}
              tabIndex={43}
            />
            <label htmlFor="SaleTDSAc">Sale TDS Ac</label>
            <AccountMasterHelp
              Name="SaleTDSAc"
              onAcCodeClick={handleSaleTDSAc}
              CategoryName={SaleTDSAcName}
              CategoryCode={newSaleTDSAc}
              tabIndex={44}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="PurchaseTDSAc">Purchase TDS Ac</label>
            <AccountMasterHelp
              Name="PurchaseTDSAc"
              onAcCodeClick={handlePurchaseTDSAc}
              CategoryName={PurchaseTDSAcName}
              CategoryCode={newPurchaseTDSAc}
              tabIndex={45}
            />
            <label htmlFor="PurchaseTDSRate">Purchase TDS Rate:</label>
            <input
              type="text"
              id="PurchaseTDSRate"
              Name="PurchaseTDSRate"
              value={formData.PurchaseTDSRate}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="SaleTDSRate">Sale TDS Rate:</label>
            <input
              type="text"
              id="SaleTDSRate"
              Name="SaleTDSRate"
              value={formData.SaleTDSRate}
              onChange={handleChange}
            />
            <label htmlFor="BalanceLimit">TCS SALE Balance Limit:</label>
            <input
              type="text"
              id="BalanceLimit"
              Name="BalanceLimit"
              value={formData.BalanceLimit}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="RateDiffAc">Rate Diff Ac</label>
            <AccountMasterHelp
              Name="RateDiffAc"
              onAcCodeClick={handleRateDiffAc}
              CategoryName={RateDiffAcName}
              CategoryCode={newRateDiffAc}
              tabIndex={49}
            />
            <label htmlFor="DODate">Do Date:</label>
            <input
              type="date"
              id="DODate"
              Name="DODate"
              value={formData.DODate}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="DOPages">DOPages:</label>
            <input
              type="text"
              id="DOPages"
              Name="DOPages"
              value={formData.DOPages}
              onChange={handleChange}
            />
            <label htmlFor="TCSPurchaseBalanceLimit">
              TCS Purchase Balance Limit
            </label>
            <input
              type="text"
              id="TCSPurchaseBalanceLimit"
              Name="TCSPurchaseBalanceLimit"
              value={formData.TCSPurchaseBalanceLimit}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="TDSPurchaseBalanceLimit">
              TDS Purchase Balance Limit
            </label>
            <input
              type="text"
              id="TDSPurchaseBalanceLimit"
              Name="TDSPurchaseBalanceLimit"
              value={formData.TDSPurchaseBalanceLimit}
              onChange={handleChange}
            />
            <label htmlFor="PurchaseSaleTcs">Purchase TCS %:</label>
            <input
              type="text"
              id="PurchaseSaleTcs"
              Name="PurchaseSaleTcs"
              value={formData.PurchaseSaleTcs}
              onChange={handleChange}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="TCSTDSSaleBalanceLimit">
              TDS SALE Balance Limit
            </label>
            <input
              type="text"
              id="TCSTDSSaleBalanceLimit"
              Name="TCSTDSSaleBalanceLimit"
              value={formData.TCSTDSSaleBalanceLimit}
              onChange={handleChange}
            />
            <label htmlFor="DepreciationAC">Depreciation A/c</label>
            <AccountMasterHelp
              Name="DepreciationAC"
              onAcCodeClick={handleDepreciationAC}
              CategoryName={DepreciationAcName}
              CategoryCode={newDepreciationAC}
              tabIndex={58}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="InterestRate">Interest TDS Rate:</label>
            <input
              type="text"
              id="InterestRate"
              Name="InterestRate"
              value={formData.InterestRate}
              onChange={handleChange}
            />
            <label htmlFor="InterestTDSAc">Interest TDS Ac</label>
            <AccountMasterHelp
              Name="InterestTDSAc"
              onAcCodeClick={handleInterestTDSAc}
              CategoryName={InterestTDS_AcName}
              CategoryCode={newInterestTDSAc}
              tabIndex={60}
            />
          </div>

          <div className="CompanyParameters-form-group">
            <label htmlFor="BankPaymentAc">Bank Payment Ac</label>
            <AccountMasterHelp
              Name="BankPaymentAc"
              onAcCodeClick={handleBankPaymentAc}
              CategoryName={BankPaymentAcName}
              CategoryCode={newBankPaymentAc}
              tabIndex={61}
            />
          </div>

          <div className="button-container">
            <button type="submit">Save Settings</button>
          </div>
        </form>
      </div>
    </>
  );
};
export default CompanyParameters;
