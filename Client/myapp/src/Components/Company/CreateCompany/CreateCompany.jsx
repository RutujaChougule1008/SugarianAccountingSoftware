import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { TextField, Button, Box, Grid, Typography } from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API;

function CompanyCreation() {
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
  const [signature, setSignature] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoURL, setLogoURL] = useState(null);

  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureURL, setSignatureURL] = useState(null);
  const [logoFileName, setLogoFileName] = useState("");
  const [signatureFileName, setSignatureFileName] = useState("");

  const navigate = useNavigate();
  const initialFormData = {
    Company_Name_E: "",
    Address_E: "",
    Address_R: "",
    City_E: "",
    Company_Code: "",
    Company_Name_R: "",
    City_R: "",
    State_E: "",
    State_R: "",
    PIN: "",
    Mobile_No: "",
    Created_By: "",
    Modified_By: "",
    Pan_No: "",
    Group_Code: "",
    CST: "",
    TIN: "",
    PHONE: "",
    FSSAI_No: "",
    GST: "",
    Logo: null,
    Signature: null,
    LogoFileName: "",
    SignatureFileName: "",
  };
  // Define state variable to hold form data
  const [formData, setFormData] = useState(initialFormData);
  const lastFocusableElementRef = useRef(null);
  const addButtonRef = useRef(null);

  //Records Double CLiked
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;

  useEffect(() => {
    fetchLastCompany_Code();
    window.sessionStorage.setItem("username", "Pankaj");
  }, []);

  const fetchLastCompany_Code = () => {
    fetch(`${API_URL}/get_last_company_code`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last company code");
        }
        return response.json();
      })
      .then((data) => {
        setFormData((prevState) => ({
          ...prevState,
          Company_Code: data.last_company_code + 1,
        }));
      })
      .catch((error) => {
        console.error("Error fetching last company code:", error);
      });
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);

    if (!isEditing) {
      addButtonRef.current.focus();
    }
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "Address_E" && e.key === "Enter" && value.trim() !== "") {
      const saveButton = document.getElementById("save");
      if (saveButton) {
        saveButton.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    // Handle Tab key press
    if (
      e.key === "Tab" &&
      lastFocusableElementRef.current &&
      document.activeElement === lastFocusableElementRef.current
    ) {
      e.preventDefault();
      document.getElementById("Company_Name_E").focus();
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoURL(reader.result);
      };
      reader.onerror = () => {
        setLogoURL(null);
        setLogoFileName("");
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoURL(null);
      setLogoFileName("");
    }
  };

  const handleSignatureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSignatureFile(file);
      setSignatureFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureURL(reader.result);
      };
      reader.onerror = () => {
        setSignatureURL(null);
        setSignatureFileName("");
      };
      reader.readAsDataURL(file);
    } else {
      setSignatureFile(null);
      setSignatureURL(null);
      setSignatureFileName("");
    }
  };
  const handleAddOne = () => {
    // Reset UI controls
    setAddOneButtonEnabled(false);
    setSaveButtonEnabled(true);
    setCancelButtonEnabled(true);
    setEditButtonEnabled(false);
    setDeleteButtonEnabled(false);
    setIsEditing(true);
    fetchLastCompany_Code();

    // Clear logo and signature previews
    setLogoURL(null);
    setSignatureURL(null);
    setLogoFileName(null);
    setSignatureFileName(null);
    setFormData({
      ...initialFormData,
      Logo: null,
      Signature: null,
    });
  };

  const handleSaveOrUpdate = () => {
    const formData1 = new FormData();
    // Append all text fields from state to formData
    Object.keys(formData).forEach((key) => {
      // Append only if it's not the Logo or Signature fields
      if (
        key !== "Logo" &&
        key !== "Signature" &&
        key !== "LogoFileName" &&
        key !== "SignatureFileName"
      ) {
        formData1.append(key, formData[key]);
      }
    });

    // Note: The file objects should be directly taken from file input state (not URLs)
    if (logoFile) {
      formData1.append("logo", logoFile);
      formData1.append("LogoFileName", logoFile.name);
    }
    if (signatureFile) {
      formData1.append("signature", signatureFile);
      formData1.append("SignatureFileName", signatureFile.name);
    }
    // Define API endpoint and method based on edit mode
    const apiUrl = isEditMode
      ? `${API_URL}/update_company?company_code=${formData1.get(
          "Company_Code"
        )}`
      : `${API_URL}/create_company`;
    const method = isEditMode ? "put" : "post";

    // Make the API request
    axios({
      method: method,
      url: apiUrl,
      data: formData1,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        console.log(
          `${isEditMode ? "Updated" : "Saved"} successfully:`,
          response.data
        );
        window.alert(
          `${isEditMode ? "Data updated" : "Data saved"} successfully!`
        );
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setBackButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error saving/updating data:", error);
        window.alert(
          `Error: ${
            error.response?.data?.message || "Could not save/update data"
          }`
        );
      });
  };

  const handleEdit = () => {
    axios
      .get(
        `${API_URL}/get_company_by_code?company_code=${formData.Company_Code}`
      )
      .then((response) => {
        const data = response.data;
        const isLockedNew = data.isLocked;
        const isLockedByUserNew = data.LockedbyUser;

        if (isLockedNew) {
          window.alert(`This record is locked by ${isLockedByUserNew}`);
          return;
        } else {
          axios.put(
            `${API_URL}/lock_unlock_record?company_code=${formData.Company_Code}`,
            {
              isLocked: true,
              LockedbyUser: "Pankaj",
            }
          );
        }
        setFormData({
          ...formData,
          ...data,
        });
        setIsEditMode(true);
        setAddOneButtonEnabled(false);
        setSaveButtonEnabled(true);
        setCancelButtonEnabled(true);
        setEditButtonEnabled(false);
        setDeleteButtonEnabled(false);
        setBackButtonEnabled(true);
        setIsEditing(true);
      })
      .catch((error) => {
        window.alert(
          "This record is already deleted! Showing the previous record."
        );

        // Fetch the previous record if the current one is not available
        const prevCompanyCode = parseInt(formData.Company_Code) - 1;
        axios
          .get(`${API_URL}/get_company_by_code?company_code=${prevCompanyCode}`)
          .then((response) => {
            const data = response.data;
            setFormData({
              ...formData,
              ...data,
            });
            // Set URLs for logos and signatures if available
            if (data.Logo) {
              setLogoURL(`data:image/jpeg;base64,${data.Logo}`);
            } else {
              setLogoURL(null); // Ensure the logo is cleared if none is found
            }

            if (data.Signature) {
              setSignatureURL(`data:image/jpeg;base64,${data.Signature}`);
            } else {
              setSignatureURL(null); // Ensure the signature is cleared if none is found
            }
            setIsEditMode(true);
            setAddOneButtonEnabled(false);
            setSaveButtonEnabled(true);
            setCancelButtonEnabled(true);
            setEditButtonEnabled(false);
            setDeleteButtonEnabled(false);
            setBackButtonEnabled(true);
            setIsEditing(true);
          })
          .catch((error) => {
            console.error(
              "Error fetching previous record data after deletion:",
              error
            );
          });
      });
  };

  const handleCancel = () => {
    axios
      .get(`${API_URL}/get_last_company_data`)
      .then((response) => {
        const data = response.data;
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
          Logo: data.Logo ? `data:image/jpeg;base64,${data.Logo}` : null,
          Signature: data.Signature
            ? `data:image/jpeg;base64,${data.Signature}`
            : null,
          isLocked: false,
          LockedbyUser: "",
        }));

        if (data.Logo) {
          setLogoURL(`data:image/jpeg;base64,${data.Logo}`);
          setLogoFileName(data.name);
        } else {
          setLogoURL(null);
        }

        if (data.Signature) {
          setSignatureURL(`data:image/jpeg;base64,${data.Signature}`);
          setSignatureFileName(data.name);
        } else {
          setSignatureURL(null);
        }
        setIsEditing(false);
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setBackButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        setCancelButtonClicked(true);
      })
      .catch((error) => {
        console.error("Error fetching last company data:", error);
        window.alert("Failed to fetch the latest company data.");
      });
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this Company Code ${formData.Company_Code}?`
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
        const deleteApiUrl = `${API_URL}/delete_company?company_code=${formData.Company_Code}`;
        const response = await axios.delete(deleteApiUrl);

        if (response.status === 200) {
          console.log("Company deleted successfully");
          window.alert("Record deleted successfully");

          setLogoURL(null);
          setSignatureURL(null);
          const prevRecordResponse = await axios.get(
            `${API_URL}/get_previous_company_data?company_code=${formData.Company_Code}`
          );

          if (prevRecordResponse.status === 200) {
            const prevRecordData = prevRecordResponse.data;
            setFormData(prevRecordData);

            if (prevRecordData.Logo) {
              setLogoURL(`data:image/jpeg;base64,${prevRecordData.Logo}`);
            }
            if (prevRecordData.Signature) {
              setSignatureURL(
                `data:image/jpeg;base64,${prevRecordData.Signature}`
              );
            }
          } else {
            console.error(
              "Failed to fetch previous record data after deletion!",
              prevRecordResponse.status,
              prevRecordResponse.statusText
            );
          }
        } else if (response.status === 404) {
          window.alert("Record is already deleted!");
        } else {
          console.error(
            "Company Not Found!",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        window.location.reload();
        console.error("Error during API call:", error);
      }
    } else {
      console.log("Deletion cancelled");
    }
  };

  const handleBack = () => {
    navigate("/create-utility");
  };

  const handleFirstButtonClick = async () => {
    try {
      const response = await fetch(`${API_URL}/get_first_navigation`);
      if (response.ok) {
        const data = await response.json();
        const firstCompanyData = data;
        setFormData({
          ...formData,
          ...data,
        });
        setLogoURL(
          firstCompanyData.Logo
            ? `data:image/jpeg;base64,${firstCompanyData.Logo}`
            : null
        );
        setSignatureURL(
          firstCompanyData.Signature
            ? `data:image/jpeg;base64,${firstCompanyData.Signature}`
            : null
        );
      } else {
        console.error(
          "Failed to fetch first company data:",
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
      const response = await fetch(
        `${API_URL}/get_previous_navigation?current_company_code=${formData.Company_Code}`
      );

      if (response.ok) {
        const data = await response.json();
        const previousCompanyData = data;
        console.log("previousCompanyCreation", data);
        setFormData({
          ...formData,
          ...data,
        });
        setLogoURL(
          previousCompanyData.Logo
            ? `data:image/jpeg;base64,${previousCompanyData.Logo}`
            : null
        );
        setSignatureURL(
          previousCompanyData.Signature
            ? `data:image/jpeg;base64,${previousCompanyData.Signature}`
            : null
        );
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

  const handleNextButtonClick = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get_next_navigation?current_company_code=${formData.Company_Code}`
      );

      if (response.ok) {
        const data = await response.json();
        const nextCompanyData = data;
        setFormData({
          ...formData,
          ...data,
        });
        setLogoURL(
          nextCompanyData.Logo
            ? `data:image/jpeg;base64,${nextCompanyData.Logo}`
            : null
        );
        setSignatureURL(
          nextCompanyData.Signature
            ? `data:image/jpeg;base64,${nextCompanyData.Signature}`
            : null
        );
      } else {
        console.error(
          "Failed to fetch next company creation data:",
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
      const response = await fetch(`${API_URL}/get_last_navigation`);
      if (response.ok) {
        const data = await response.json();
        const last_Navigation = data;
        setFormData({
          ...formData,
          ...data,
        });
        setLogoURL(
          last_Navigation.Logo
            ? `data:image/jpeg;base64,${last_Navigation.Logo}`
            : null
        );
        setSignatureURL(
          last_Navigation.Signature
            ? `data:image/jpeg;base64,${last_Navigation.Signature}`
            : null
        );
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

  const handlerecordDoubleClicked = () => {
    fetch(
      `${API_URL}/get_company_by_code?company_code=${selectedRecord.Company_Code}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last company data");
        }
        return response.json();
      })
      .then((data) => {
        setFormData({
          ...formData,
          ...data,
        });
        setLogoURL(data.Logo ? `data:image/jpeg;base64,${data.Logo}` : null);
        setSignatureURL(
          data.Signature ? `data:image/jpeg;base64,${data.Signature}` : null
        );
      })
      .catch((error) => {
        console.error("Error fetching last company data:", error);
      });

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

  //Validation Checks
  const validateNumericInput = (e) => {
    e.target.value = e.target.value.replace(/[^0-9.]/g, "");
  };

  return (
    <div>
      <Typography
        sx={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#1976d2",
          marginBottom: 2,
        }}
      >
        Company Creation
      </Typography>

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
          addButtonRef={addButtonRef}
        />
        <NavigationButtons
          handleFirstButtonClick={handleFirstButtonClick}
          handlePreviousButtonClick={handlePreviousButtonClick}
          handleNextButtonClick={handleNextButtonClick}
          handleLastButtonClick={handleLastButtonClick}
          highlightedButton={highlightedButton}
          isEditing={isEditing}
          isFirstRecord={formData.Company_Code === 4}
        />
      </div>
      <br />
      <div className="container" onKeyDown={handleKeyDown}>
        <div>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    disabled={!isEditing && addOneButtonEnabled}
                    startIcon={<UploadIcon />}
                  >
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={!isEditing && addOneButtonEnabled}
                    />
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6}>
                  {logoURL && (
                    <img src={logoURL} alt="Logo Preview" width="100" />
                  )}

                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#1976d2",
                      marginBottom: 2,
                    }}
                  >
                    {formData.LogoFileName || logoFileName}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    disabled={!isEditing && addOneButtonEnabled}
                    startIcon={<UploadIcon />}
                  >
                    Upload Signature
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleSignatureChange}
                      disabled={!isEditing && addOneButtonEnabled}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {signatureURL && (
                    <img
                      src={signatureURL}
                      alt="Signature Preview"
                      width="100"
                    />
                  )}
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      color: "#1976d2",
                      marginBottom: 2,
                    }}
                  >
                    {formData.SignatureFileName || signatureFileName}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={2}>
                  <TextField
                    label="Company Code"
                    variant="outlined"
                    name="Company_Code"
                    value={formData.Company_Code}
                    onChange={handleInputChange}
                    fullWidth
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={10}>
                  <TextField
                    label="Company Name"
                    variant="outlined"
                    name="Company_Name_E"
                    value={formData.Company_Name_E}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Regional Name"
                variant="outlined"
                name="Company_Name_R"
                value={formData.Company_Name_R}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={!isEditing && addOneButtonEnabled}
              />
              <TextField
                label="Company Address"
                variant="outlined"
                name="Address_E"
                value={formData.Address_E}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={2}
                disabled={!isEditing && addOneButtonEnabled}
              />
              <TextField
                label="Regional Address"
                variant="outlined"
                name="Address_R"
                value={formData.Address_R}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={2}
                disabled={!isEditing && addOneButtonEnabled}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    variant="outlined"
                    name="City_E"
                    value={formData.City_E}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State"
                    variant="outlined"
                    name="State_E"
                    value={formData.State_E}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Pin"
                    variant="outlined"
                    name="PIN"
                    value={formData.PIN}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City (R)"
                    variant="outlined"
                    name="City_R"
                    value={formData.City_R}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State (R)"
                    variant="outlined"
                    name="State_R"
                    value={formData.State_R}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="GST"
                    variant="outlined"
                    name="GST"
                    value={formData.GST}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Mobile"
                    variant="outlined"
                    name="Mobile_No"
                    value={formData.Mobile_No}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                    inputProps={{
                      inputMode: "decimal",
                      pattern: "[0-9]*[.,]?[0-9]+",
                      maxLength: 10,
                      onInput: validateNumericInput,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="CST"
                    variant="outlined"
                    name="CST"
                    value={formData.CST}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="TIN"
                    variant="outlined"
                    name="TIN"
                    value={formData.TIN}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Phone"
                    variant="outlined"
                    name="PHONE"
                    value={formData.PHONE}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                    inputProps={{
                      inputMode: "decimal",
                      pattern: "[0-9]*[.,]?[0-9]+",
                      maxLength: 10,
                      onInput: validateNumericInput,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="PAN No"
                    variant="outlined"
                    name="Pan_No"
                    value={formData.Pan_No}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="FSSAI No"
                    variant="outlined"
                    name="FSSAI_No"
                    value={formData.FSSAI_No}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    disabled={!isEditing && addOneButtonEnabled}
                  />
                </Grid>
              </Grid>
            </Box>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompanyCreation;
