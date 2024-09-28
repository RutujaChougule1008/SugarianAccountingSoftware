import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from "../../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../../Common/CommonButtons/NavigationButtons";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AccountMasterHelp from "../../../../Helper/AccountMasterHelp";
import GroupMasterHelp from "../../../../Helper/GroupMasterHelp";
import GSTStateMasterHelp from "../../../../Helper/GSTStateMasterHelp";
import CityMasterHelp from "../../../../Helper/CityMasterHelp";
import { HashLoader } from "react-spinners";
import CityMaster from "../CityMaster/CityMaster";
import "./AccountMaster.css";
import FinicialMaster from "../FinicialMasters/FinicialMaster";

const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");
const API_URL = process.env.REACT_APP_API;
const GST_API = process.env.GST_PORTAL_API_URL;
const GST_KEY = process.env.GST_PORTAL_API_KEY;
const GST_SECRET_KEY = process.env.GST_PORTAL_API_SECRET_KEY;

var cityName;
var newCity_Code;
var grpName;
var newGroup_Code;
var gstStateName;
var newGSTStateCode;
var newAccoid;
const AccountMaster = () => {
  const [updateButtonClicked, setUpdateButtonClicked] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
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
  const companyCode = sessionStorage.getItem("Company_Code");
  const [accountCode, setAccountCode] = useState("");
  const [accountData, setAccountData] = useState({});
  const [accountDetail, setAccountDetail] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [showCityPopup, setShowCityPopup] = useState(false);
  const cityMasterRef = useRef(null);
  const [cityMasterData, setCityMasterData] = useState("");
  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const groupMasterRef = useRef(null);
  const [groupMasterData, setGroupMasterData] = useState("");
  const [city_data, setCityData] = useState("");

  const navigate = useNavigate();
  //In utility page record doubleClicked that recod show for edit functionality
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const initialFormData = {
    Ac_Code: "",
    Ac_Name_E: "",
    Ac_Name_R: "",
    Ac_type: "P",
    Ac_rate: 0.0,
    Address_E: "",
    Address_R: "",
    City_Code: "",
    Pincode: "",
    Local_Lic_No: "",
    Tin_No: "",
    Cst_no: "",
    Gst_No: "",
    Email_Id: "",
    Email_Id_cc: "",
    Other_Narration: "",
    ECC_No: "",
    Bank_Name: "",
    Bank_Ac_No: "",
    Bank_Opening: 0.0,
    bank_Op_Drcr: "D",
    Opening_Balance: 0.0,
    Drcr: "D",
    Group_Code: "",
    Created_By: "",
    Modified_By: "",
    Short_Name: "",
    Commission: 0.0,
    carporate_party: "N",
    referBy: "",
    OffPhone: "",
    Fax: "",
    CompanyPan: "",
    AC_Pan: "",
    Mobile_No: "",
    Is_Login: "",
    IFSC: "",
    FSSAI: "",
    Branch1OB: 0.0,
    Branch2OB: 0.0,
    Branch1Drcr: "D",
    Branch2Drcr: "D",
    Locked: 0,
    GSTStateCode: "",
    UnregisterGST: 0,
    Distance: 0.0,
    Bal_Limit: 0.0,
    bsid: "",
    cityid: "",
    whatsup_no: "",
    company_code: companyCode,
    adhar_no: "",
    Limit_By: "N",
    Tan_no: "",
    TDSApplicable: "Y",
    PanLink: "",
    Insurance: 0.0,
    MsOms: "",
    loadingbyus: "N",
    payBankAc: "",
    payIfsc: "",
    PayBankName: "",
    FrieghtOrMill: "",
    BeneficiaryName: "",
    payBankAc2: "",
    payIfsc2: "",
    PayBankName2: "",
    BeneficiaryName2: "",
    payBankAc3: "",
    payIfsc3: "",
    PayBankName3: "",
    BeneficiaryName3: "",
    SelectedBank: "",
    VerifyAcNo: "",
    VerifyAcNo2: "",
    VerifyAcNo3: "",
    TransporterId: "",
    PurchaseTDSApplicable: "Y",
  };

  const acTypeRef = useRef(null);

  useEffect(() => {
    if (acTypeRef.current) {
      acTypeRef.current.focus();
    }
  }, []);

  const handleCity_Code = (code, cityId, cityName, pinCode) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      City_Code: code,
      cityid: cityId,
      Pincode: pinCode,
    });
  };
  const handleGroup_Code = (code, bsId) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      Group_Code: code,
      bsid: bsId,
    });
  };
  const handleGSTStateCode = (code) => {
    setAccountCode(code);
    setFormData({
      ...formData,
      GSTStateCode: code,
    });
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formDataDetail, setFormDataDetail] = useState({
    Person_Name: "",
    Person_Mobile: "",
    Person_Email: "",
    Person_Pan: "",
    Other: "",
  });
  // Handle change for all inputs
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => {
      // Create a new object based on existing state
      const updatedFormData = { ...prevState, [name]: value };
      return updatedFormData;
    });
  };

  const handleDetailChange = (event) => {
    const { name, value } = event.target;
    setFormDataDetail((prevState) => {
      // Create a new object based on existing state
      const updatedFormData = { ...prevState, [name]: value };
      return updatedFormData;
    });
  };

  const handleCheckbox = (e, valueType = "string") => {
    const { name, checked } = e.target;

    // Determine the value to set based on the valueType parameter
    const value =
      valueType === "numeric" ? (checked ? 1 : 0) : checked ? "Y" : "N";

    setFormData((prevState) => ({
      ...prevState,
      [name]: value, // Set the appropriate value based on valueType
    }));
  };

  const validateForm = () => {
    if (!formData.Ac_Name_E.trim()) {
      toast.error("Account Name is required.");
      return false;
    }

    if (!formData.City_Code) {
      toast.error("City Code is required.");
      return false;
    }

    if (!formData.Group_Code) {
      toast.error("Group Code is required.");
      return false;
    }

    if (formData.Ac_type === "BR" && !formData.Short_Name.trim()) {
      toast.error("Short Name is required for Brokers.");
      return false;
    }

    if (
      (formData.Ac_type === "P" || formData.Ac_type === "S") &&
      formData.Bank_Opening > 0
    ) {
      toast.error("Bank Opening must be zero for Party or Supplier.");
      return false;
    }

    if (
      formData.Ac_type === "B" &&
      (!formData.Bank_Ac_No.trim() || !formData.IFSC.trim())
    ) {
      toast.error("Bank Account Number and IFSC Code are required for Banks.");
      return false;
    }

    return true;
  };

  console.log(cityMasterData, city_data, cityName);


  const isFieldEnabled = (fieldType) => {
    switch (fieldType) {
      case "Ac_rate":
        return formData.Ac_type === "I" || formData.Ac_type === "F";
      case "Bank_Opening":
      case "bank_Op_Drcr":
      case "Opening_Balance":
      case "Drcr":
        return formData.Ac_type !== "P" && formData.Ac_type !== "S";
      case "Limit_By":
      case "Opening_Balance":
      case "Drcr":
      case "carporate_party":
      case "Local_Lic_No":
      case "Tan_no":
      case "FSSAI":
        return (
          formData.Ac_type !== "B" &&
          formData.Ac_type !== "C" &&
          formData.Ac_type !== "R" &&
          formData.Ac_type !== "F" &&
          formData.Ac_type !== "I" &&
          formData.Ac_type !== "E" &&
          formData.Ac_type !== "O" &&
          formData.Ac_type !== "M" &&
          formData.Ac_type !== "T" &&
          formData.Ac_type !== "BR" &&
          formData.Ac_type !== "RP" &&
          formData.Ac_type !== "CR"
        );
      default:
        return true;
    }
  };
  const handleCheckboxAcGroups = (e, group) => {
    const { checked } = e.target;

    setSelectedGroups((prevSelected) => {
      if (checked) {
        console.log("Adding group to selectedGroups:", group.Category_Code);
        // Add the group to selectedGroups if it's checked
        return [...prevSelected, group.Category_Code];
      } else {
        console.log("Removing group from selectedGroups:", group.Category_Code);
        // Remove the group from selectedGroups if it's unchecked
        return prevSelected.filter(
          (groupCode) => groupCode !== group.Category_Code
        );
      }
    });
    console.log("Selected Groups:", selectedGroups);
  };

  console.log("SelectedGroup", selectedGroups)
  // const handleSearchClick = async () => {
  //   debugger
  //   const apiUrl =
  //     "https://www.ewaybills.com/MVEWBAuthenticate/MVAppSCommonSearchTP";
  //   const cityApiUrl = `${API_URL}/get-citybyName`;
  //   const apiKey = "bk59oPDpaGTtJa4";
  //   const apiSecret = "EajrxDcIWLhGfRHLej7zjw==";
  //   const gstNo = formData.Gst_No;

  //   const requestBody = {
  //     AppSCommonSearchTPItem: [
  //       {
  //         GSTIN: gstNo,
  //       },
  //     ],
  //   };

  //   try {
  //     // Fetch taxpayer details
  //     debugger
  //     const response = await fetch(apiUrl, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         MVApiKey: apiKey,
  //         MVSecretKey: apiSecret,
  //         GSTIN: "27AAECJ8332R1ZV",
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     if (
  //       data.Status === "1" &&
  //       data.lstAppSCommonSearchTPResponse.length > 0
  //     ) {
  //       const taxpayerDetails = data.lstAppSCommonSearchTPResponse[0];
  //       const address = taxpayerDetails.pradr.addr;
  //       const concatenatedAddress = `${address.bno} ${address.bnm} ${address.st} ${address.flno} ${address.loc} ${address.pncd} ${address.stcd}`;
  //       const ac_name = taxpayerDetails.tradeNam;
  //       newGSTStateCode = taxpayerDetails.RequestedGSTIN.substring(0, 2).trim();
  //       const pincode = address.pncd;
  //       const city_name = address.loc;

  //       try {
  //         // Fetch city code based on pincode and city name
  //         const cityResponse = await fetch(
  //           `${cityApiUrl}?city_name_e=${city_name}`
  //         );

  //         if (!cityResponse.ok) {
  //           if (cityResponse.status === 404) {
  //             // City code not found, set empty city code
  //             toast.info(
  //               "City code not found. Other details have been updated."
  //             );
  //             setFormData((prevState) => ({
  //               ...prevState,
  //               Address_E: concatenatedAddress,
  //               Ac_Name_E: ac_name,
  //               GSTStateCode: newGSTStateCode,
  //               Pincode: pincode,
  //               City_Code: "",

  //             }));
  //           } else {
  //             throw new Error(`HTTP error! Status: ${cityResponse.status}`);
  //           }
  //         } else {
  //           const cityData = await cityResponse.json();

  //           console.log(cityData)

  //           setCityData(cityData)

  //           // Update form data with city code and other fetched details
  //           setFormData((prevState) => ({
  //             ...prevState,
  //             Address_E: concatenatedAddress,
  //             Ac_Name_E: ac_name,
  //             GSTStateCode: newGSTStateCode,
  //             Pincode: pincode,
  //             City_Code: cityData.city_code,
  //           }));
  //         }
  //       } catch (cityError) {
  //         console.error("Error fetching city data:", cityError);
  //         toast.error("Error fetching city data.");
  //         // Set form data with empty city code if there’s an error
  //         setFormData((prevState) => ({
  //           ...prevState,
  //           Address_E: concatenatedAddress,
  //           Ac_Name_E: ac_name,
  //           GSTStateCode: newGSTStateCode,
  //           Pincode: pincode,
  //           City_Code: "", // Set city code as empty if there’s an error
  //         }));
  //       }
  //     } else {
  //       // Handle case where no taxpayer details are returned
  //       toast.error("No taxpayer details found.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     toast.error(`Error fetching data: ${error.message}`);
  //   }
  // };

  const handleSearchClick = async () => {
    debugger;
    const apiUrl =
      "https://www.ewaybills.com/MVEWBAuthenticate/MVAppSCommonSearchTP";
    const cityApiUrl = `${API_URL}/get-citybyName`;
    const createCityUrl = `${API_URL}/create-city`;
    const apiKey = "bk59oPDpaGTtJa4";
    const apiSecret = "EajrxDcIWLhGfRHLej7zjw==";
    const gstNo = formData.Gst_No;

    const requestBody = {
      AppSCommonSearchTPItem: [
        {
          GSTIN: gstNo,
        },
      ],
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          MVApiKey: apiKey,
          MVSecretKey: apiSecret,
          GSTIN: "27AAECJ8332R1ZV",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (
        data.Status === "1" &&
        data.lstAppSCommonSearchTPResponse.length > 0
      ) {
        const taxpayerDetails = data.lstAppSCommonSearchTPResponse[0];
        const address = taxpayerDetails.pradr.addr;
        const concatenatedAddress = `${address.bno} ${address.bnm} ${address.st} ${address.flno} ${address.loc} ${address.pncd} ${address.stcd}`;
        const ac_name = taxpayerDetails.tradeNam;
        newGSTStateCode = taxpayerDetails.RequestedGSTIN.substring(0, 2).trim();
        const pincode = address.pncd;
        const city_name = address.loc;

        try {
          const cityResponse = await fetch(
            `${cityApiUrl}?city_name_e=${city_name}`
          );

          if (!cityResponse.ok && cityResponse.status === 404) {
            // City not found, trigger creation of the city
            const newCityData = {
              city_name_e: city_name,
              pincode: pincode,
            };

            const createResponse = await fetch(
              `${createCityUrl}?company_code=${companyCode}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newCityData),
              }
            );

            if (!createResponse.ok) {
              throw new Error(
                `Failed to create city. Status: ${createResponse.status}`
              );
            }

            const createdCity = await createResponse.json();

            setCityData(createdCity);
            toast.success("City created and details updated.");
            setFormData((prevState) => ({
              ...prevState,
              Address_E: concatenatedAddress,
              Ac_Name_E: ac_name,
              GSTStateCode: newGSTStateCode,
              Pincode: pincode,
              City_Code: createdCity.city_code,
            }));
          } else {
            const cityData = await cityResponse.json();

            setCityData(cityData);

            setFormData((prevState) => ({
              ...prevState,
              Address_E: concatenatedAddress,
              Ac_Name_E: ac_name,
              GSTStateCode: newGSTStateCode,
              Pincode: pincode,
              City_Code: cityData.city_code,
            }));
          }
        } catch (cityError) {
          console.error("Error fetching city data:", cityError);
          toast.error("Error fetching city data.");
          setFormData((prevState) => ({
            ...prevState,
            Address_E: concatenatedAddress,
            Ac_Name_E: ac_name,
            GSTStateCode: newGSTStateCode,
            Pincode: pincode,
            City_Code: "",
          }));
        }
      } else {
        toast.error("No taxpayer details found.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`Error fetching data: ${error.message}`);
    }
  };

  const handleAddCity = (event) => {
    debugger;
    event.preventDefault();
    console.log("Clicked");
    setShowCityPopup(true);
  };

  // Function to handle closing the CityMaster popup
  const handleClosePopup = () => {
    setShowCityPopup(false);
  };

  const handleAddGroup = (event) => {
    event.preventDefault();
    setShowGroupPopup(true);
  };

  const handleCloseGroupPopup = () => {
    setShowGroupPopup(false);
  };

  const handleCitySave = async (event) => {
    event.preventDefault();
    if (cityMasterRef.current) {
      const cityData = cityMasterRef.current.getFormData();
      console.log("City Data to Save:", cityData);

      try {
        const response = await axios.post(
          `${API_URL}/create-city?company_code=${companyCode}`,
          cityData
        );
        toast.success("City created successfully!");
        console.log("City saved!", response.data);
        setCityMasterData(response.data);
        setShowCityPopup(false); // Close the popup after saving
      } catch (error) {
        toast.error(
          "Error occurred while creating city: " +
            (error.response?.data?.error || error.message)
        );
        console.error("Error creating city:", error);
      }
    } else {
      console.error("CityMaster is not loaded yet");
    }
  };

  const handleGroupSave = async (event) => {
    event.preventDefault();
    if (groupMasterRef.current) {
      const groupData = groupMasterRef.current.getFormData();
      console.log("Group Data to Save:", groupData);

      try {
        const response = await axios.post(
          `${API_URL}/create-finicial-group?Company_Code=${companyCode}`,
          groupData
        );
        toast.success("Group created successfully!");
        console.log("Group saved!", response.data);
        setGroupMasterData(response.data);
        setShowGroupPopup(false); // Close the popup after saving
      } catch (error) {
        toast.error(
          "Error occurred while creating group: " +
            (error.response?.data?.error || error.message)
        );
        console.error("Error creating group:", error);
      }
    } else {
      console.error("GroupMaster is not loaded yet");
    }
  };

  //Detail Part Functionality

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
      Person_Name: "",
      Person_Mobile: "",
      Person_Email: "",
      Person_Pan: "",
      Other: "",
    });
  };

  useEffect(() => {
    if (selectedRecord) {
      setUsers(
        accountDetail.map((detail) => ({
          Id:
            users.length > 0
              ? Math.max(...users.map((user) => user.Id)) + 1
              : 1,
          id: detail.id,
          Ac_Code: detail.Ac_Code,
          rowaction: "Normal",
          Person_Email: detail.Person_Email,
          Person_Mobile: detail.Person_Mobile,
          Person_Name: detail.Person_Name,
          Person_Pan: detail.Person_Pan,
          Other: detail.Other,
        }))
      );
    }
  }, [selectedRecord, accountDetail]);

  useEffect(() => {
    const updatedUsers = accountDetail.map((detail) => ({
      Id: users.length > 0 ? Math.max(...users.map((user) => user.Id)) + 1 : 1,
      id: detail.id,
      Ac_Code: detail.Ac_Code,
      rowaction: "Normal",
      Person_Email: detail.Person_Email,
      Person_Mobile: detail.Person_Mobile,
      Person_Name: detail.Person_Name,
      Person_Pan: detail.Person_Pan,
      Other: detail.Other,
    }));
    setUsers(updatedUsers);
  }, [accountDetail]);

  const addUser = async () => {
    const newUser = {
      Id: users.length > 0 ? Math.max(...users.map((user) => user.Id)) + 1 : 1,
      ...formDataDetail,
      rowaction: "add",
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    closePopup();
  };

  const updateUser = async () => {
    const updatedUsers = users.map((user) => {
      if (user.Id === selectedUser.Id) {
        const updatedRowaction =
          user.rowaction === "Normal" ? "update" : user.rowaction;
        return {
          ...user,
          Person_Email: formDataDetail.Person_Email,
          Person_Mobile: formDataDetail.Person_Mobile,
          Person_Name: formDataDetail.Person_Name,
          Person_Pan: formDataDetail.Person_Pan,
          Other: formDataDetail.Other,
          rowaction: updatedRowaction,
        };
      } else {
        return user;
      }
    });

    setUsers(updatedUsers);
    closePopup();
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setFormDataDetail({
      Person_Email: user.Person_Email || "",
      Person_Mobile: user.Person_Mobile || "",
      Person_Name: user.Person_Name || "",
      Person_Pan: user.Person_Pan || "",
      Other: user.Other || "",
    });
    openPopup("edit");
  };

  const deleteModeHandler = async (user) => {
    let updatedUsers;
    if (isEditMode && user.rowaction === "add") {
      setDeleteMode(true);
      setSelectedUser(user);
      updatedUsers = users.map((u) =>
        u.Id === user.Id ? { ...u, rowaction: "DNU" } : u
      );
    } else if (isEditMode) {
      setDeleteMode(true);
      setSelectedUser(user);
      updatedUsers = users.map((u) =>
        u.Id === user.Id ? { ...u, rowaction: "delete" } : u
      );
    } else {
      setDeleteMode(true);
      setSelectedUser(user);
      updatedUsers = users.map((u) =>
        u.Id === user.Id ? { ...u, rowaction: "DNU" } : u
      );
    }
    setUsers(updatedUsers);
    setSelectedUser({});
  };

  const openDelete = async (user) => {
    setDeleteMode(true);
    setSelectedUser(user);
    let updatedUsers;
    if (isEditMode && user.rowaction === "delete") {
      updatedUsers = users.map((u) =>
        u.Id === user.Id ? { ...u, rowaction: "Normal" } : u
      );
    } else {
      updatedUsers = users.map((u) =>
        u.Id === user.Id ? { ...u, rowaction: "add" } : u
      );
    }
    setUsers(updatedUsers);
    setSelectedUser({});
  };

  const fetchLastRecord = () => {
    fetch(`${API_URL}/getNextAcCode_AccountMaster?Company_Code=${companyCode}`)
      .then((response) => {
        console.log("response", response);
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        // Set the last company code as the default value for Company_Code
        setFormData((prevState) => ({
          ...prevState,
          Ac_Code: data.next_ac_code,
        }));
      })
      .catch((error) => {
        console.error("Error fetching last record:", error);
      });
  };

  const handleAddOne = () => {
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditing(true);
    fetchLastRecord();
    setFormData(initialFormData);
    setAccountDetail([]);
    newCity_Code = "";
    newGSTStateCode = "";
    newGroup_Code = "";
    cityName = "";
    gstStateName = "";
    grpName = "";
  };

  // const handleSaveOrUpdate = async () => {
  //   if (!validateForm()) {
  //     return;
  //   }

  //   setIsEditing(true);
  //   setIsLoading(true);

  //   const master_data = {
  //     ...formData,
  //   };

  //   if (isEditMode) {
  //     delete master_data.accoid;
  //   }
  //   const contact_data = users.map((user) => ({
  //     rowaction: user.rowaction,
  //     Person_Name: user.Person_Name,
  //     Person_Mobile: user.Person_Mobile,
  //     Company_Code: companyCode,
  //     Person_Email: user.Person_Email,
  //     Person_Pan: user.Person_Pan,
  //     Other: user.Other,
  //     id: user.id,
  //   }));

  //   const acGroupsData = selectedGroups.map((group) => ({
  //     Group_Code: group.Category_Code,
  //     Company_Code: companyCode,
  //     Ac_Code: formData.Ac_Code, 
  //     accoid: formData.accoid
  //   }));

  //   const requestData = {
  //     master_data,
  //     contact_data,
  //   };

  //   if (master_data.Opening_Balance > 0) {
  //     master_data.Opening_Balance = 0;
  //   }
  //   console.log(requestData);

  //   try {
  //     let response;

  //     if (isEditMode) {
  //       const updateApiUrl = `${API_URL}/update-accountmaster?accoid=${newAccoid}`;
  //       response = await axios.put(updateApiUrl, requestData);

  //       toast.success("Data updated successfully!");
        
  //     } else {
  //       response = await axios.post(
  //         `${API_URL}/insert-accountmaster`,
  //         requestData
  //       );
  //       toast.success("Data saved successfully!");
  //       if (response.status === 200) {
  //         try {
  //           const groupApiResponse = await axios.post(`${API_URL}/create-RecordAcGroups?Company_Code=${companyCode}&Ac_Code=${formData.Ac_Code}`, {
  //             acGroups: acGroupsData,
  //           });
  //           if (groupApiResponse.status === 200) {
  //             toast.success("Groups saved successfully!");
  //             setTimeout(() => {
  //               window.location.reload();
  //             }, 1000);
  //           } else {
  //             toast.error("Error saving groups.");
  //           }
  //         } catch (groupError) {
  //           console.error("Error saving groups:", groupError);
  //           toast.error("Error occurred while saving groups.");
  //         }
  //       }
  //       setIsEditMode(false);
  //       setAddOneButtonEnabled(true);
  //       setEditButtonEnabled(true);
  //       setDeleteButtonEnabled(true);
  //       setBackButtonEnabled(true);
  //       setSaveButtonEnabled(false);
  //       setCancelButtonEnabled(false);
  //       setIsEditing(true);

  //       // setTimeout(() => {
  //       //   window.location.reload();
  //       // }, 1000);
  //     }
  //   } catch (error) {
  //     console.error("Error during API call:", error);
  //     toast.error("Error occurred while saving data");
  //   } finally {
  //     setIsEditing(false);
  //     setIsLoading(false);
  //   }
  // };
  const handleSaveOrUpdate = async () => {
    debugger;
    if (!validateForm()) {
      return;
    }

    setIsEditing(true);
    setIsLoading(true);

    const master_data = { ...formData };

    if (isEditMode) {
      delete master_data.accoid;
    }

    const contact_data = users.map((user) => ({
      rowaction: user.rowaction,
      Person_Name: user.Person_Name,
      Person_Mobile: user.Person_Mobile,
      Company_Code: companyCode,
      Person_Email: user.Person_Email,
      Person_Pan: user.Person_Pan,
      Other: user.Other,
      id: user.id,
    }));

    const acGroupsData = selectedGroups.map((groupCode) => ({
      Group_Code: groupCode,
      Company_Code: companyCode,
      Ac_Code: master_data.Ac_Code,
      accoid: master_data.accoid || newAccoid
    })).filter(group => group.Group_Code);

    const requestData = {
      master_data,
      contact_data,
    };

    try {
      let response;

      if (isEditMode) {
        const updateApiUrl = `${API_URL}/update-accountmaster?accoid=${newAccoid}`;
        response = await axios.put(updateApiUrl, requestData);
        toast.success("Data updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/insert-accountmaster`, requestData);
        toast.success("Data saved successfully!");
      }

      if (response.status === 200 || response.status === 201) {
        const groupUpdateData = {
          acGroups: acGroupsData,
          Ac_Code: formData.Ac_Code,
          Company_Code: companyCode,
          accoid: newAccoid 
        };
        await axios.post(`${API_URL}/create-multiple-acgroups`, groupUpdateData);
        toast.success("Groups updated successfully!");
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
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error(`Error occurred while saving data: ${error.message}`);
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
  const handleCancel = () => {
    axios
      .get(`${API_URL}/get-lastaccountdata?Company_Code=${companyCode}`)
      .then((response) => {
        const data = response.data.account_master_data;
        const labels = response.data.account_labels;
        const detailData = response.data.account_detail_data;
        const groupCodes = response.data.group_codes;
        newAccoid = data.accoid;
        newCity_Code = data.City_Code;
        cityName = labels.cityname;
        grpName = labels.groupcodename;
        newGroup_Code = data.Group_Code;
        gstStateName = labels.State_Name;
        newGSTStateCode = data.GSTStateCode;
        console.log(data);
        setFormData({
          ...formData,
          ...data,
        });
        setAccountData(data || {});
        setAccountDetail(detailData || []);

        setSelectedGroups(groupCodes || []);
      })
      .catch((error) => {
        console.error("Error fetching latest data for edit:", error);
      });
    // Reset other state variables
    setIsEditing(false);
    setIsEditMode(false);
    setAddOneButtonEnabled(true);
    setEditButtonEnabled(true);
    setDeleteButtonEnabled(true);
    setBackButtonEnabled(true);
    setSaveButtonEnabled(false);
    setCancelButtonEnabled(false);
    setCancelButtonClicked(true);
  };

  const fetchGroupData = () => {
    axios
      .get(
        `${API_URL}/system_master_help?CompanyCode=${companyCode}&SystemType=G`
      )
      .then((response) => {
        const data = response.data;
        setGroupData(data);
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching latest data for edit:", error);
      });
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this record ${formData.Ac_Code}?`
    );

    if (isConfirmed) {
      setIsEditMode(false);
      setAddOneButtonEnabled(true);
      setEditButtonEnabled(true);
      setDeleteButtonEnabled(true);
      setBackButtonEnabled(true);
      setSaveButtonEnabled(false);
      setCancelButtonEnabled(false);

      try {
        const deleteApiUrl = `${API_URL}/delete_accountmaster?accoid=${newAccoid}&company_code=${companyCode}&Ac_Code=${formData.Ac_Code}`;
        const response = await axios.delete(deleteApiUrl);
        toast.success("Record deleted successfully!");
        handleCancel();
      } catch (error) {
        toast.error("Deletion cancelled");
        console.error("Error during API call:", error);
      }
    } else {
      console.log("Deletion cancelled");
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, []);

  const handleBack = () => {
    navigate("/AccountMaster-utility");
  };

  // const handleAddGroup = () => {
  //   navigate("/financial-groups");
  // };

  // const handleAddCity = () => {
  //   navigate("/city-master");
  // };

  //Handle Record DoubleCliked in Utility Page Show that record for Edit
  const handlerecordDoubleClicked = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/getaccountmasterByid?Company_Code=${companyCode}&Ac_Code=${selectedRecord.Ac_Code}`
      );
      const data = response.data.account_master_data;
      const labels = response.data.account_labels;
      const detailData = response.data.account_detail_data;
      const groupCodes = data.group_codes ?? [];
      newAccoid = data.accoid;
      newCity_Code = data.City_Code;
      cityName = labels.cityname;
      grpName = labels.groupcodename;
      newGroup_Code = data.Group_Code;
      gstStateName = labels.State_Name;
      newGSTStateCode = data.GSTStateCode;
      console.log(data);
      setFormData({
        ...formData,
        ...data,
      });
      setAccountData(data || {});
      setAccountDetail(detailData || []);
      setSelectedGroups(groupCodes);
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
    if (selectedRecord) {
      handlerecordDoubleClicked();
    } else {
      handleAddOne();
    }
  }, [selectedRecord]);

  //change No functionality to get that particular record
  const handleKeyDown = async (event) => {
    if (event.key === "Tab") {
      const changeNoValue = event.target.value;
      try {
        const response = await axios.get(
          `${API_URL}/getaccountmasterByid?Company_Code=${companyCode}&Ac_Code=${changeNoValue}`
        );
        const data = response.data.account_master_data;
        const labels = response.data.account_labels;
        const detailData = response.data.account_detail_data;
        const groupCodes = data.group_codes ?? [];
        newAccoid = data.accoid;
        newCity_Code = data.City_Code;
        cityName = labels.cityname;
        grpName = labels.groupcodename;
        newGroup_Code = data.Group_Code;
        gstStateName = labels.State_Name;
        newGSTStateCode = data.GSTStateCode;
        console.log(data);
        setFormData({
          ...formData,
          ...data,
        });
        setAccountData(data || {});
        setAccountDetail(detailData || []);
        setSelectedGroups(groupCodes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  //Navigation Buttons
  const handleFirstButtonClick = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-firstaccount-navigation?Company_Code=${companyCode}`
      );
      if (response.ok) {
        const data = await response.json();
        // Access the first element of the array
        const acData = data.account_master_data;
        const labels = data.account_labels;
        const detailData = data.account_detail_data;
        const groupCodes = data.group_codes ?? [];
        console.log("acData", acData);
        console.log("labels", labels);
        console.log("detailData", detailData);
        newAccoid = acData.accoid;
        newCity_Code = acData.City_Code;
        cityName = labels.cityname;
        grpName = labels.groupcodename;
        newGroup_Code = acData.Group_Code;
        gstStateName = labels.State_Name;
        newGSTStateCode = acData.GSTStateCode;
        setFormData({
          ...formData,
          ...acData,
        });

        setAccountData(acData || {});
        setAccountDetail(detailData || []);
        setSelectedGroups(groupCodes);
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
        `${API_URL}/get-previousaccount-navigation?current_ac_code=${formData.Ac_Code}&Company_Code=${companyCode}`
      );

      if (response.ok) {
        const data = await response.json();

        const acData = data.account_master_data;
        const labels = data.account_labels;
        const detailData = data.account_detail_data;
        const groupCodes = data.group_codes ?? [];
        console.log("acData", acData);
        console.log("labels", labels);
        console.log("detailData", detailData);
        newAccoid = acData.accoid;
        newCity_Code = acData.City_Code;
        cityName = labels.cityname;
        grpName = labels.groupcodename;
        newGroup_Code = acData.Group_Code;
        gstStateName = labels.State_Name;
        newGSTStateCode = acData.GSTStateCode;
        setFormData({
          ...formData,
          ...acData,
        });

        setAccountData(acData || {});
        setAccountDetail(detailData || []);
        setSelectedGroups(groupCodes);

        console.log("Account Data:", acData);
      console.log("Group Codes:", groupCodes);
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
        `${API_URL}/get-nextaccount-navigation?current_ac_code=${formData.Ac_Code}&Company_Code=${companyCode}`
      );

      if (response.ok) {
        const data = await response.json();
        const acData = data.account_master_data;
        const labels = data.account_labels;
        const detailData = data.account_detail_data;
        const groupCodes = data.group_codes ?? [];
        console.log("acData", acData);
        console.log("labels", labels);
        console.log("detailData", detailData);
        newAccoid = acData.accoid;
        newCity_Code = acData.City_Code;
        cityName = labels.cityname;
        grpName = labels.groupcodename;
        newGroup_Code = acData.Group_Code;
        gstStateName = labels.State_Name;
        newGSTStateCode = acData.GSTStateCode;
        setFormData({
          ...formData,
          ...acData,
        });

        setAccountData(acData || {});
        setAccountDetail(detailData || []);
        setSelectedGroups(groupCodes);
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

  const handleEtender = () => {
    navigate("/eBuySugarian-user-utility");
  };

  return (
    <>
      <ToastContainer />
      {/* <button className="eTenderButton" onClick={handleEtender}>eTender</button> */}
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
          isFirstRecord={formData.company_code === 1}
        />
      </div>

      <div className="ac-master-form-container">
        <form>
          <h2>Account Master</h2>
          <div className="ac-master-form-group ">
            <label htmlFor="changeNo">Change No:</label>
            <input
              type="text"
              id="changeNo"
              Name="changeNo"
              onKeyDown={handleKeyDown}
              disabled={!addOneButtonEnabled}
            />
          </div>
          <div className="ac-master-form-group ">
            <label htmlFor="Ac_Code">Account Code:</label>
            <input
              type="text"
              id="Ac_Code"
              Name="Ac_Code"
              value={formData.Ac_Code}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Ac_type">Type:</label>
            <select
              id="Ac_type"
              name="Ac_type"
              value={formData.Ac_type}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
              ref={acTypeRef}
            >
              <option value="P">Party</option>
              <option value="S">Supplier</option>
              <option value="B">Bank</option>
              <option value="C">Cash</option>
              <option value="R">Relative</option>
              <option value="F">Fixed Assets</option>
              <option value="I">Interest Party</option>
              <option value="E">Income/Expenses</option>
              <option value="O">Trading</option>
              <option value="M">Mill</option>
              <option value="T">Transport</option>
              <option value="BR">Broker</option>
              <option value="RP">Retail Party</option>
              <option value="CR">Cash Retail Party</option>
            </select>
            <label htmlFor="Ac_Name_E">Name Of Account::</label>
            <input
              type="text"
              id="Ac_Name_E"
              Name="Ac_Name_E"
              value={formData.Ac_Name_E}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Ac_Name_R">Regional Name::</label>
            <input
              type="text"
              id="Ac_Name_R"
              Name="Ac_Name_R"
              value={formData.Ac_Name_R}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Ac_rate">
              {formData.Ac_type === "F" ? "Depreciation Rate" : "Interest Rate"}
              :
            </label>
            <input
              type="text"
              id="Ac_rate"
              name="Ac_rate"
              value={formData.Ac_rate}
              onChange={handleChange}
              disabled={!isFieldEnabled("Ac_rate")}
            />
          </div>

          <div className="ac-master-form-group ">
            <label htmlFor="Address_E">Address:</label>
            <input
              type="text"
              id="Address_E"
              Name="Address_E"
              value={formData.Address_E}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Address_R">Address2::</label>
            <input
              type="text"
              id="Address_R"
              Name="Address_R"
              value={formData.Address_R}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="City_Code">City Code:</label>
            <CityMasterHelp
              Name="City_Code"
              onAcCodeClick={handleCity_Code}
              CityName={
                cityMasterData
                  ? cityMasterData.city.city_name_e || ""
                  : city_data
                  ? city_data.city_name_e
                  : cityName || ""
              }
              CityCode={
                cityMasterData
                  ? cityMasterData.city.city_code
                  : city_data 
                  ? city_data.city_code
                  : newCity_Code || ""
              }
              tabIndex={8}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
            
            <div>
              <button onClick={handleAddCity}>Add City</button>
            </div>
            {showCityPopup && (
              <div className="city-master-modal">
                <div className="city-master-modal-content">
                  <button
                    className="city-master-close-btn"
                    onClick={handleClosePopup}
                  >
                    &times;
                  </button>
                  <div className="city-master-popup-wrapper">
                    <CityMaster isPopup={true} ref={cityMasterRef} />{" "}
                    {/* Render CityMaster component */}
                    <div className="popup-action-buttons">
                      <button onClick={handleCitySave} className="save-btn">
                        Save
                      </button>
                      <button onClick={handleClosePopup} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overlay for the modal */}
            {showCityPopup && (
              <div
                className="city-master-modal-overlay"
                onClick={handleClosePopup}
                role="button"
              ></div>
            )}
            <label htmlFor="Pincode">Pin Code::</label>
            <input
              type="text"
              id="Pincode"
              Name="Pincode"
              value={
                cityMasterData ? cityMasterData.city.pincode : formData.Pincode
              }
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="ac-master-form-group ">
            <label htmlFor="Local_Lic_No">Sugar Lic No::</label>
            <input
              type="text"
              id="Local_Lic_No"
              Name="Local_Lic_No"
              value={formData.Local_Lic_No}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("Local_Lic_No") ||
                (!isEditing && addOneButtonEnabled)
              }
            />
            <label htmlFor="Gst_No">GST No::</label>
            <input
              type="text"
              id="Gst_No"
              Name="Gst_No"
              value={formData.Gst_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />

            <svg
              className="search-icon"
              onClick={handleSearchClick}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M10,20a10,10,0,1,1,10-10A10,10,0,0,1,10,20ZM10,2a8,8,0,1,0,8,8A8,8,0,0,0,10,2Z" />
              <path d="M22,22l-5.66-5.66a8,8,0,1,1,1.41-1.41L22,22ZM20.59,21.17,16.66,17.24a9,9,0,1,0-1.41,1.41l3.93,3.93Z" />
            </svg>

            <label htmlFor="Email_Id">Email::</label>
            <input
              type="text"
              id="Email_Id"
              Name="Email_Id"
              value={formData.Email_Id}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Email_Id_cc">CC Email::</label>
            <input
              type="text"
              id="Email_Id_cc"
              Name="Email_Id_cc"
              value={formData.Email_Id_cc}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Other_Narration">Other Narration::</label>
            <textarea
              type="text"
              id="Other_Narration"
              Name="Other_Narration"
              value={formData.Other_Narration}
              rows={2}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>

          <div className="ac-master-form-group "></div>
          <div className="ac-master-form-group ">
            <label htmlFor="Bank_Name">Bank Name::</label>
            <input
              type="text"
              id="Bank_Name"
              Name="Bank_Name"
              value={formData.Bank_Name}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Bank_Ac_No">Bank A/c No::</label>
            <input
              type="text"
              id="Bank_Ac_No"
              Name="Bank_Ac_No"
              value={formData.Bank_Ac_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Bank_Opening">Bank Opening Bal::</label>
            <input
              type="text"
              id="Bank_Opening"
              Name="Bank_Opening"
              value={formData.Bank_Opening}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("Bank_Opening") ||
                (!isEditing && addOneButtonEnabled)
              }
            />
            <label htmlFor="bank_Op_Drcr">Bank Dr/Cr: :</label>
            <select
              id="bank_Op_Drcr"
              Name="bank_Op_Drcr"
              value={formData.bank_Op_Drcr}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("bank_Op_Drcr") ||
                (!isEditing && addOneButtonEnabled)
              }
            >
              <option value="D">Debit</option>
              <option value="C">Credit</option>
            </select>
            <label htmlFor="Opening_Balance">Opening Balance: :</label>
            <input
              type="text"
              id="Opening_Balance"
              Name="Opening_Balance"
              value={formData.Opening_Balance}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("Opening_Balance") ||
                (!isEditing && addOneButtonEnabled)
              }
            />
            <label htmlFor="Drcr">Dr/Cr:</label>
            <select
              id="Drcr"
              Name="Drcr"
              value={formData.Drcr}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("Drcr") || (!isEditing && addOneButtonEnabled)
              }
            >
              <option value="D">Debit</option>
              <option value="C">Credit</option>
            </select>
          </div>
          <div className="ac-master-form-group ">
            <label htmlFor="Group_Code">Group Code:</label>
            <GroupMasterHelp
              Name="Group_Code"
              onAcCodeClick={handleGroup_Code}
              GroupName={
                groupMasterData ? groupMasterData.group.group_Name_E : grpName
              }
              GroupCode={
                groupMasterData
                  ? groupMasterData.group.group_Code
                  : newGroup_Code
              }
              tabIndex={24}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
            <button onClick={handleAddGroup}>Add Group</button>
            {showGroupPopup && (
              <div className="group-master-modal">
                <div className="group-master-modal-content">
                  <button
                    className="group-master-close-btn"
                    onClick={handleCloseGroupPopup}
                  >
                    &times;
                  </button>
                  <div className="group-master-popup-wrapper">
                    <FinicialMaster isPopup={true} ref={groupMasterRef} />{" "}
                    {/* Render GroupMasterHelp component */}
                    <div className="popup-action-buttons">
                      <button onClick={handleGroupSave} className="save-btn">
                        Save
                      </button>
                      <button
                        onClick={handleCloseGroupPopup}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overlay for the modal */}
            {showGroupPopup && (
              <div
                className="group-master-modal-overlay"
                onClick={handleCloseGroupPopup}
                role="button"
              ></div>
            )}
            <label htmlFor="Short_Name">Short Name::</label>
            <input
              type="text"
              id="Short_Name"
              Name="Short_Name"
              value={formData.Short_Name}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Commission">Commission Rate::</label>
            <input
              type="text"
              id="Commission"
              Name="Commission"
              value={formData.Commission}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="carporate_party">Is Carporate Party::</label>
            <input
              type="checkbox"
              id="carporate_party"
              Name="carporate_party"
              checked={formData.carporate_party === "Y"}
              onChange={(e) => handleCheckbox(e, "string")}
              disabled={
                !isFieldEnabled("carporate_party") ||
                (!isEditing && addOneButtonEnabled)
              }
            />
            <label htmlFor="referBy">Ref By::</label>
            <input
              type="text"
              id="referBy"
              Name="referBy"
              value={formData.referBy}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>
          <div className="ac-master-form-group ">
            <label htmlFor="OffPhone">Off. Phone::</label>
            <input
              type="text"
              id="OffPhone"
              Name="OffPhone"
              value={formData.OffPhone}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Fax">TCS/TDS Link::</label>
            <input
              type="text"
              id="Fax"
              Name="Fax"
              value={formData.Fax}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="CompanyPan">Company Pan::</label>
            <input
              type="text"
              id="CompanyPan"
              Name="CompanyPan"
              value={
                formData.CompanyPan ||
                formData.Gst_No.substring(2, formData.Gst_No.length - 3).trim()
              }
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Mobile_No">Mobile No.::</label>
            <input
              type="text"
              id="Mobile_No"
              Name="Mobile_No"
              value={formData.Mobile_No}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="IFSC">Bank IFSC Code::</label>
            <input
              type="text"
              id="IFSC"
              Name="IFSC"
              value={formData.IFSC}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="FSSAI">FSSAI Lic No::</label>
            <input
              type="text"
              id="FSSAI"
              Name="FSSAI"
              value={formData.FSSAI}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("FSSAI") || (!isEditing && addOneButtonEnabled)
              }
            />
          </div>
          <div className="ac-master-form-group ">
            <label htmlFor="Locked">Locked::</label>
            <input
              type="checkbox"
              id="Locked"
              Name="Locked"
              checked={formData.Locked === 1}
              onChange={(e) => handleCheckbox(e, "numeric")}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="GSTStateCode">GST State Code:</label>
            <GSTStateMasterHelp
              Name="GSTStateCode"
              onAcCodeClick={handleGSTStateCode}
              GstStateName={gstStateName}
              GstStateCode={newGSTStateCode}
              tabIndex={44}
              disabledFeild={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="UnregisterGST">Unregister For GST::</label>
            <input
              type="checkbox"
              id="UnregisterGST"
              Name="UnregisterGST"
              checked={formData.UnregisterGST === 1}
              onChange={(e) => handleCheckbox(e, "numeric")}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Distance">Distance::</label>
            <input
              type="text"
              id="Distance"
              Name="Distance"
              value={formData.Distance}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="whatsup_no">whatsApp No::</label>
            <input
              type="text"
              id="whatsup_no"
              Name="whatsup_no"
              value={formData.whatsup_no}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="adhar_no">Adhar No::</label>
            <input
              type="text"
              id="adhar_no"
              Name="adhar_no"
              value={formData.adhar_no}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="Limit_By">Limit::</label>
            <select
              id="Limit_By"
              Name="Limit_By"
              value={formData.Limit_By}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("Limit_By") ||
                (!isEditing && addOneButtonEnabled)
              }
            >
              <option value="Y">By Limit</option>
              <option value="N">No Limit</option>
            </select>
          </div>
          <div className="ac-master-form-group ">
            <label htmlFor="Tan_no">Tan No: :</label>
            <input
              type="text"
              id="Tan_no"
              Name="Tan_no"
              value={formData.Tan_no}
              onChange={handleChange}
              disabled={
                !isFieldEnabled("Tan_no") || (!isEditing && addOneButtonEnabled)
              }
            />
            <label htmlFor="TDSApplicable">TDS Applicable::</label>
            <select
              id="TDSApplicable"
              Name="TDSApplicable"
              value={formData.TDSApplicable}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            >
              <option value="L">Lock</option>
              <option value="Y">Sale TDS By Limit</option>
              <option value="N">Sale TCS By Limit</option>
              <option value="T">TCS Bill 1 Sale</option>
              <option value="S">TDS Bill 1 Sale</option>
              <option value="U">URP</option>
            </select>
            <label htmlFor="PurchaseTDSApplicable">
              Purchase TDS Applicable::
            </label>
            <select
              id="PurchaseTDSApplicable"
              Name="PurchaseTDSApplicable"
              value={formData.PurchaseTDSApplicable}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            >
              <option value="L">Lock</option>
              <option value="Y">Purchase TDS By Limit</option>
              <option value="P">Purchase TDS By 1st Bill</option>
              <option value="N">Purchase TCS By Limit</option>
              <option value="B">Purchase TCS By 1st Bill</option>
              <option value="U">URP</option>
            </select>
            <label htmlFor="PanLink">Pan Link::</label>
            <input
              type="text"
              id="PanLink"
              Name="PanLink"
              value={formData.PanLink}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="loadingbyus">Loading by us:</label>
            <input
              type="checkbox"
              id="loadingbyus"
              Name="loadingbyus"
              checked={formData.loadingbyus === "Y"}
              onChange={(e) => handleCheckbox(e, "string")}
              disabled={!isEditing && addOneButtonEnabled}
            />
            <label htmlFor="TransporterId">Transporter ID::</label>
            <input
              type="text"
              id="TransporterId"
              Name="TransporterId"
              value={formData.TransporterId}
              onChange={handleChange}
              disabled={!isEditing && addOneButtonEnabled}
            />
          </div>

          <div className="ac-master-form-group ">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Group Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {groupData.map((group, index) => (
                  <tr key={group.Category_Code}>
                    <td>{group.Category_Code}</td>
                    <td>{group.Category_Name}</td>
                    <td>
                    <input
          type="checkbox"
          checked={selectedGroups.includes(group.Category_Code)} // Checked state based on group code
          onChange={(e) => handleCheckboxAcGroups(e, group)}
        />
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
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
                      {selectedUser.Id ? "Edit User" : "Add User"}
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
                  <div className="modal-body-acMaster">
                    <form>
                      <label className="ac-master-form-label">
                        Person Name:
                      </label>
                      <div className="ac-master-col-Ewaybillno">
                        <div className="ac-master-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="ac-master-form-control"
                            name="Person_Name"
                            autoComplete="off"
                            value={formDataDetail.Person_Name}
                            onChange={handleDetailChange}
                          />
                        </div>
                      </div>
                      <label className="ac-master-form-label">
                        Person Mobile:
                      </label>
                      <div className="ac-master-col-Ewaybillno">
                        <div className="ac-master-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="ac-master-form-control"
                            name="Person_Mobile"
                            autoComplete="off"
                            value={formDataDetail.Person_Mobile}
                            onChange={handleDetailChange}
                          />
                        </div>
                      </div>
                      <label className="ac-master-form-label">
                        Person Email:
                      </label>
                      <div className="ac-master-col-Ewaybillno">
                        <div className="ac-master-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="ac-master-form-control"
                            name="Person_Email"
                            autoComplete="off"
                            value={formDataDetail.Person_Email}
                            onChange={handleDetailChange}
                          />
                        </div>
                      </div>
                      <label className="ac-master-form-label">
                        Person Pan:
                      </label>
                      <div className="ac-master-col-Ewaybillno">
                        <div className="ac-master-form-group">
                          <input
                            type="text"
                            tabIndex="5"
                            className="ac-master-form-control"
                            name="Person_Pan"
                            autoComplete="off"
                            value={formDataDetail.Person_Pan}
                            onChange={handleDetailChange}
                          />
                        </div>
                      </div>
                      <label className="ac-master-form-label">Other:</label>
                      <div className="ac-master-col-Ewaybillno">
                        <div className="ac-master-form-group">
                          <textarea
                            type="text"
                            tabIndex="5"
                            className="ac-master-form-control"
                            name="Other"
                            autoComplete="off"
                            value={formDataDetail.Other}
                            onChange={handleDetailChange}
                            rows={2}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    {selectedUser.Id ? (
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
                  <th>A/C Code</th>
                  <th>Person Name</th>
                  <th>Person Mobile</th>
                  <th>Person Email</th>
                  <th>Person Pan</th>
                  <th>Other</th>
                  {/* <th>Saledetailid</th> */}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.Id}>
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
                    <td>{formData.Ac_Code}</td>
                    <td>{user.Person_Name}</td>
                    <td>{user.Person_Mobile}</td>
                    <td>{user.Person_Email}</td>
                    <td>{user.Person_Pan}</td>
                    <td>{user.Other}</td>
                    {/* <td>{user.saledetailid}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
export default AccountMaster;
