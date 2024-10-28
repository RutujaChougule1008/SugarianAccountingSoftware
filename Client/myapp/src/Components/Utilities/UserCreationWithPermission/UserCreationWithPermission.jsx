import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ActionButtonGroup from '../../../Common/CommonButtons/ActionButtonGroup';
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import { Button } from "react-bootstrap";


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
    
    const fetchProgramNames = () => {
        axios.get(`${API_URL}/getProgramNames`)
            .then((response) => {
                const fetchedPrograms = response.data.programNames.map((programName, index) => ({
                    Detail_Id: index + 1,
                    Program_Name: programName,
                    canView: "N",
                    canSave: "N",
                    canEdit: "N",
                    canDelete: "N",
                    DND: "N",
                    
                }));
                setPermissions(fetchedPrograms);
            })
            .catch((error) => console.error("Error fetching program names:", error));
    };

    useEffect(() => {
        fetchProgramNames();
    }, []);

    const handleUserChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    // Toggle permission checkboxes with "Y" or "N" values
    const handlePermissionChange = (Detail_Id, field) => {
        setPermissions((prevPermissions) =>
            prevPermissions.map((perm) =>
                perm.Detail_Id === Detail_Id
                    ? { ...perm, [field]: perm[field] === "Y" ? "N" : "Y" }
                    : perm
            )
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
                    User_Id: data.next_doc_no
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

    const handleSave = () => {
        const requestData = {
            user_data: userData,
            permission_data: permissions,
        };

        axios.post(`${API_URL}/insert-user`, requestData)
            .then(() => {
                toast.success("User and permissions inserted successfully!");
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
            })
            .catch((error) => {
                console.error("Error saving data:", error);
                toast.error("Error occurred while saving data");
            });
    };

    const handleSaveOrUpdate = () => {

      const updatedPermissions = permissions.map((perm) => ({
        ...perm,
        Year_Code: yearCode,
        Company_Code: companyCode
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
              toast.success(`User and permissions ${isEditMode ? "updated" : "inserted"} successfully!`);
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
              }
          })
          .catch((error) => {
              console.error(`Error ${isEditMode ? "updating" : "saving"} data:`, error);
              toast.error(`Error occurred while ${isEditMode ? "updating" : "saving"} data`);
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
                setUserData((prevData) => ({
                    ...prevData,
                    ...data.lastUserData
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
                handleDelete={""}
                deleteButtonEnabled={deleteButtonEnabled}
                handleCancel={handleCancel}
                cancelButtonEnabled={cancelButtonEnabled}
                handleBack={""}
                backButtonEnabled={backButtonEnabled}
                permissions={permissions}
            />
            <div>
                {/* Navigation Buttons */}
                <NavigationButtons
                    handleFirstButtonClick={""}
                    handlePreviousButtonClick={""}
                    handleNextButtonClick={""}
                    handleLastButtonClick={handleCancel}
                    highlightedButton={highlightedButton}
                    isEditing={isEditing}
                />
            </div>

            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <TextField
                        label="User Id"
                        name="User_Id"
                        variant="outlined"
                        value={userData.User_Id}
                        onChange={handleUserChange}
                        fullWidth
                        disabled
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="userfullname"
                        name="userfullname"
                        variant="outlined"
                        value={userData.userfullname}
                        onChange={handleUserChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="User Name"
                        name="User_Name"
                        variant="outlined"
                        value={userData.User_Name}
                        onChange={handleUserChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="User Password"
                        name="User_Password"
                        variant="outlined"
                        type="password"
                        value={userData.User_Password}
                        onChange={handleUserChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="Email Id"
                        name="EmailId"
                        variant="outlined"
                        type="EmailId"
                        value={userData.EmailId}
                        onChange={handleUserChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="Email Password"
                        name="EmailPassword"
                        variant="outlined"
                        type="password"
                        value={userData.EmailPassword}
                        onChange={handleUserChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="Mobile No"
                        name="Mobile"
                        variant="outlined"
                        type="Mobile"
                        value={userData.Mobile}
                        onChange={handleUserChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={3}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>User Type</InputLabel>
                        <Select
                            name="User_Type"
                            value={userData.User_Type}
                            onChange={handleUserChange}
                            label="User Type"
                        >
                            <MenuItem value="A">Admin</MenuItem>
                            <MenuItem value="U">User</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>User Security</InputLabel>
                        <Select
                            name="User_Security"
                            value={userData.User_Security}
                            onChange={handleUserChange}
                            label="User Security"
                        >
                            <MenuItem value="Y">Yes</MenuItem>
                            <MenuItem value="N">No</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="Payments Password"
                        name="PaymentsPassword"
                        variant="outlined"
                        value={userData.PaymentsPassword}
                        onChange={handleUserChange}
                        fullWidth
                    />
                </Grid>
                <Button>Update Password</Button>
            </Grid>

            <h3>Permissions</h3>
            <table className="table mt-4 table-bordered">
                <thead>
                    <tr>
                        <th>Detail ID</th>
                        <th>Program Name</th>
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
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permission.canView === "Y"}
                                    onChange={() => handlePermissionChange(permission.Detail_Id, "canView")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permission.canSave === "Y"}
                                    onChange={() => handlePermissionChange(permission.Detail_Id, "canSave")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permission.canEdit === "Y"}
                                    onChange={() => handlePermissionChange(permission.Detail_Id, "canEdit")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permission.canDelete === "Y"}
                                    onChange={() => handlePermissionChange(permission.Detail_Id, "canDelete")}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={permission.DND === "Y"}
                                    onChange={() => handlePermissionChange(permission.Detail_Id, "DND")}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="btn btn-success mt-4" onClick={handleSave}>
                Save User and Permissions
            </button>
        </div>
    );
};

export default UserCreationWithPermission;
