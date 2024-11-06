import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import { Button } from "react-bootstrap";

var uid;
const UserCreationWithPermission = () => {
  const API_URL = process.env.REACT_APP_API;
  const companyCode = sessionStorage.getItem("Company_Code");
  const yearCode = sessionStorage.getItem("Year_Code");
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
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;
  const permissionsData = location.state?.permissionsData;
  const initialFormData = {
    User_Id: "",
    User_Name: "",
    User_Type: "",
    Password: "",
    EmailId: "",
    EmailPassword: "",
    smtpServerPort: "",
    AuthoGroupID: null,
    Ac_Code: null,
    Company_Code: companyCode,
    Mobile: "",
    LastActivityDate: "",
    RetryAttempts: null,
    IsLocked: true,
    LockedDateTime: "",
    Branch_Code: 1,
    uid: null,
    userfullname: "",
    User_Security: "",
    Bank_Security: "",
    PaymentsPassword: "",
    User_Password: "",
  };
  const [userData, setUserData] = useState(initialFormData);
  const [permissions, setPermissions] = useState([]);

  //   const fetchProgramNames = () => {
  //     axios
  //       .get(`${API_URL}/getProgramNames`)
  //       .then((response) => {
  //         const fetchedPrograms = response.data.programNames.map(
  //           (programName, index) => ({
  //             Detail_Id: index + 1,
  //             Program_Name: programName,
  //             canView: "N",
  //             canSave: "N",
  //             canEdit: "N",
  //             canDelete: "N",
  //             DND: "N",
  //           })
  //         );
  //         setPermissions(fetchedPrograms);
  //       })
  //       .catch((error) => console.error("Error fetching program names:", error));
  //   };
  const fetchProgramNames = () => {
    axios
      .get(`${API_URL}/getProgramNames`)
      .then((response) => {
        const maxLength = Math.max(
          response.data.programNames.length,
          response.data.menuNames.length
        );

        const permissionsList = Array.from(
          { length: maxLength },
          (_, index) => ({
            Detail_Id: index + 1,
            Program_Name: response.data.programNames[index] || null,
            menuNames: response.data.menuNames[index] || null,
            canView: "Y",
            canSave: "Y",
            canEdit: "Y",
            canDelete: "Y",
            DND: "N",
          })
        );

        setPermissions(permissionsList);
      })
      .catch((error) =>
        console.error("Error fetching program and menu names:", error)
      );
  };

  useEffect(() => {
    fetchProgramNames();
  }, []);

  useEffect(() => {
    if (selectedRecord) {
      handlerecordDoubleClicked();
    } else {
      handleAddOne();
    }
  }, [selectedRecord]);

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Toggle permission checkboxes with "Y" or "N" values
  // Toggle permission checkboxes with "Y" or "N" values
const handlePermissionChange = (Detail_Id, field) => {
  setPermissions((prevPermissions) =>
    prevPermissions.map((perm) => {
      if (perm.Detail_Id === Detail_Id) {
        if (field === "DND" && perm[field] === "N") {
          // If DND is being checked, set all other permissions to "N"
          return {
            ...perm,
            DND: "Y",
            canView: "N",
            canSave: "N",
            canEdit: "N",
            canDelete: "N",
          };
        } else if (field === "DND" && perm[field] === "Y") {
          // If DND is being unchecked, set all other permissions to "Y"
          return {
            ...perm,
            DND: "N",
            canView: "Y",
            canSave: "Y",
            canEdit: "Y",
            canDelete: "Y",
          };
        } else {
          // Toggle the specific field normally
          return { ...perm, [field]: perm[field] === "Y" ? "N" : "Y" };
        }
      }
      return perm;
    })
  );
};


  const fetchNextDocNo = () => {
    fetch(`${API_URL}/get-next-user-Id?Company_Code=${companyCode}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch last record");
        }
        return response.json();
      })
      .then((data) => {
        setUserData((prevState) => ({
          ...prevState,
          User_Id: data.next_doc_no,
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
    fetchNextDocNo();
    setUserData(initialFormData);
    fetchProgramNames();
  };

  const handleSaveOrUpdate = () => {
    setIsEditing(true);

    const updatedPermissions = permissions.map((perm) => ({
      ...perm,
      Year_Code: yearCode,
      Company_Code: companyCode,
    }));
    const requestData = {
      user_data: userData,
      permission_data: updatedPermissions,
    };

    const apiUrl = isEditMode
      ? `${API_URL}/update-user?uid=${userData.uid}`
      : `${API_URL}/insert-user`;

    const apiMethod = isEditMode ? axios.put : axios.post;

    apiMethod(apiUrl, requestData)
      .then(() => {
        toast.success(
          `User and permissions ${
            isEditMode ? "updated" : "inserted"
          } successfully!`
        );
        setUserData(initialFormData);
        setPermissions((prevPermissions) =>
          prevPermissions.map((perm) => ({
            ...perm,
            canView: "N",
            canSave: "N",
            canEdit: "N",
            canDelete: "N",
            DND: "N",
          }))
        );

        if (isEditMode) {
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
      })
      .catch((error) => {
        console.error(
          `Error ${isEditMode ? "updating" : "saving"} data:`,
          error
        );
        toast.error(
          `Error occurred while ${isEditMode ? "updating" : "saving"} data`
        );
      });
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
        `${API_URL}/getLastUserWithPermissions?Company_Code=${companyCode}`
      );
      if (response.status === 200) {
        const data = response.data;
        uid = data.lastUserData.uid;
        setUserData((prevData) => ({
          ...prevData,
          ...data.lastUserData,
        }));
        setPermissions(data.lastUserPermissionData || []);
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

  const handleFirstButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/getFirstUserWithPermissions?Company_Code=${companyCode}`
      );
      if (response.status === 200) {
        const data = response.data;
        uid = data.lastUserData.uid;
        setUserData((prevData) => ({
          ...prevData,
          ...data.lastUserData,
        }));
        setPermissions(data.lastUserPermissionData || []);
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

  const handleNextButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/getNextUserWithPermissions?Company_Code=${companyCode}&User_Id=${userData.User_Id}`
      );
      if (response.status === 200) {
        const data = response.data;
        uid = data.lastUserData.uid;
        setUserData((prevData) => ({
          ...prevData,
          ...data.lastUserData,
        }));
        setPermissions(data.lastUserPermissionData || []);
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

  const handlePreviousButtonClick = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/getPreviousUserWithPermissions?Company_Code=${companyCode}&User_Id=${userData.User_Id}`
      );
      if (response.status === 200) {
        const data = response.data;
        uid = data.lastUserData.uid;
        setUserData((prevData) => ({
          ...prevData,
          ...data.lastUserData,
        }));
        setPermissions(data.lastUserPermissionData || []);
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
        `${API_URL}/getUserWithPermissionById?Company_Code=${companyCode}&User_Id=${selectedRecord.User_Id}`
      );
      if (response.status === 200) {
        const data = response.data;
        uid = data.lastUserData.uid;
        setUserData((prevData) => ({
          ...prevData,
          ...data.lastUserData,
        }));
        setPermissions(data.lastUserPermissionData || []);
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

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
        `Are you sure you want to delete this record ${userData.User_Id}?`
    );
    if (isConfirmed) {
        setIsEditMode(false);
        setAddOneButtonEnabled(true);
        setEditButtonEnabled(true);
        setDeleteButtonEnabled(true);
        setBackButtonEnabled(true);
        setSaveButtonEnabled(false);
        setCancelButtonEnabled(false);
        //setIsLoading(true);
        try {
            const deleteApiUrl = `${API_URL}/delete_user?uid=${uid}&Company_Code=${companyCode}`;
            const response = await axios.delete(deleteApiUrl);

            if (response.status === 200) {
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
            // setIsLoading(false)
        }
    } else {
        console.log("Deletion cancelled");
    }
};


  const handleBack = () => {
    navigate("/user-permission-utility");
  };

  return (
    <div>
      <ToastContainer />
      <h2>User Management</h2>
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
        permissions={permissionsData} 
      />
      <div>
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

      <Grid
        container
        spacing={2}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        {[
          { label: "User Id", name: "User_Id", disabled: true },
          { label: "Full Name", name: "userfullname" },
          { label: "User Name", name: "User_Name" },
          { label: "User Password", name: "User_Password", type: "password" },
          { label: "Email Id", name: "EmailId", type: "email" },
          { label: "Email Password", name: "EmailPassword", type: "password" },
          { label: "Mobile No", name: "Mobile" },
          { label: "Payments Password", name: "PaymentsPassword" },
        ].map((field, index) => (
          <Grid
            Grid
            item
            xs={12}
            sm={6}
            key={index}
            style={{ maxWidth: "600px", width: "100%", maxHeight: "60px" }}
          >
            <TextField
              label={field.label}
              name={field.name}
              variant="outlined"
              value={userData[field.name]}
              onChange={handleUserChange}
              fullWidth
              type={field.type || "text"}
              disabled={field.name === "User_Id" ? true : !isEditing}
            />
          </Grid>
        ))}
        <Grid
          item
          xs={12}
          sm={6}
          style={{ maxWidth: "600px", width: "100%", maxHeight: "60px" }}
        >
          <FormControl variant="outlined" fullWidth>
            <InputLabel>User Type</InputLabel>
            <Select
              name="User_Type"
              value={userData.User_Type}
              onChange={handleUserChange}
              label="User Type"
              disabled={!isEditing && addOneButtonEnabled}
            >
              <MenuItem value="A">Admin</MenuItem>
              <MenuItem value="U">User</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          style={{ maxWidth: "600px", width: "100%", maxHeight: "60px" }}
        >
          <FormControl variant="outlined" fullWidth>
            <InputLabel>User Security</InputLabel>
            <Select
              name="User_Security"
              value={userData.User_Security}
              onChange={handleUserChange}
              label="User Security"
              disabled={!isEditing && addOneButtonEnabled}
            >
              <MenuItem value="Y">Yes</MenuItem>
              <MenuItem value="N">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <Button variant="contained" color="primary">
            Update Password
          </Button>
        </Grid>
      </Grid>
      <table className="table mt-4 table-bordered">
        <thead>
          <tr>
            <th>Detail ID</th>
            <th>Program Name</th>
            <th>Menu Name</th>
            <th>Can View</th>
            <th>Can Save</th>
            <th>Can Edit</th>
            <th>Can Delete</th>
            <th>DND</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.Detail_Id}>
              <td>{permission.Detail_Id}</td>
              <td>{permission.Program_Name}</td>
              <td>{permission.menuNames}</td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.canView === "Y"}
                  onChange={() =>
                    handlePermissionChange(permission.Detail_Id, "canView")
                  }
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.canSave === "Y"}
                  onChange={() =>
                    handlePermissionChange(permission.Detail_Id, "canSave")
                  }
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.canEdit === "Y"}
                  onChange={() =>
                    handlePermissionChange(permission.Detail_Id, "canEdit")
                  }
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.canDelete === "Y"}
                  onChange={() =>
                    handlePermissionChange(permission.Detail_Id, "canDelete")
                  }
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.DND === "Y"}
                  onChange={() =>
                    handlePermissionChange(permission.Detail_Id, "DND")
                  }
                  disabled={!isEditing && addOneButtonEnabled}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserCreationWithPermission;
