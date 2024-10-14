import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import UTRLotnoHelp from "../../../Helper/UTRLotnoHelp";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from '../../../Common/CommonButtons/ActionButtonGroup';
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import SystemHelpMaster from "../../../Helper/SystemmasterHelp";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./UTREntry.css"
import { HashLoader } from 'react-spinners';
import { z } from "zod";


const stringToNumber = z
    .string()
    .refine(value => !isNaN(Number(value)), { message: "This field must be a number" })
    .transform(value => Number(value));

var lblBankname
var newbank_ac
var lblmillname
var newmill_code
var newLot_no
var selectedfilter = ""
var globalTotalAmount=0.00

const API_URL = process.env.REACT_APP_API;
const companyCode = sessionStorage.getItem("Company_Code");
const Year_Code = sessionStorage.getItem("Year_Code");

const UTREntry = () => {
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
    const companyCode = sessionStorage.getItem('Company_Code')
    const YearCode = sessionStorage.getItem("Year_Code");
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState({});
    const [users, setUsers] = useState([]);
    const [tenderDetails, setTenderDetails] = useState({});
    const [deleteMode, setDeleteMode] = useState(false);
    const [Tenderno, setTenderno] = useState("");
    const [bancode, setbankcode] = useState("");
    const [bankid, setbankid] = useState("");
    const [millcode, setmillcode] = useState("");
    const [millid, setmillid] = useState("");
    const [lastTenderDetails, setLastTenderDetails] = useState([]);
    const [lastTenderData, setLastTenderData] = useState({});

    const [accountCode, setAccountCode] = useState("");
    const navigate = useNavigate();
    const [formDataDetail, setFormDataDetail] = useState({

        grade_no: "",
        amount: null,
        lotCompany_Code: 0,
        lotYear_Code: 0,
        Adjusted_Amt: null,
        Detail_Id: 1,
        ln:null,


    });
    //In utility page record doubleClicked that recod show for edit functionality
    const location = useLocation();
    const selectedRecord = location.state?.selectedRecord;
    const initialFormData = {
        doc_no: '',
        doc_date: new Date().toISOString().split('T')[0],
        bank_ac: 0,
        mill_code: 0,
        amount: 0.00,
        utr_no: '',
        narration_header: '',
        narration_footer: '',
        Company_Code: companyCode,
        Year_Code: YearCode,
        Branch_Code: '',
        Created_By: '',
        Modified_By: '',
        IsSave: '',
        Lott_No: 0,
        utrid: 0,
        ba: 0,
        mc: 0,
        Processed: 0,
        SelectedBank: '',
        messageId: '',
        bankTransactionId: '',
        isPaymentDone: '',
        EntryType: '',
        PaymentType: '',
        paymentData: '',
        IsDeleted: 0,

}
const handlebank_ac =(code,accoid) =>{
   setbankcode(code);
   setbankid(accoid);


    setFormData({
      ...formData,
      bank_ac: code,
      ba:accoid,
    });

}
const handlemill_code =(code,accoid) =>{
   setmillcode(code);
   setmillid(accoid);

    setFormData({
      ...formData,
      mill_code: code,
      mc:accoid
    });

}
    const [formData, setFormData] = useState(initialFormData);
    // Handle change for all inputs
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => {
            // Create a new object based on existing state
            const updatedFormData = { ...prevState, [name]: value };
            return updatedFormData;
        });
    };
    const fetchLastRecord= () => {
        fetch(`${API_URL}/get-lastutrdata?Company_Code=${companyCode}&Year_Code=${YearCode}`)
            .then(response => {
                console.log("response", response)
                if (!response.ok) {
                    throw new Error('Failed to fetch last record');
                }
                return response.json();
            })
            .then(data => {
                // Set the last company code as the default value for Company_Code
                setFormData(prevState => ({
                    ...prevState,
                    doc_no: data.last_head_data.doc_no + 1,
                }));
            })
            .catch(error => {
                console.error('Error fetching last record:', error);
            });
    };

    const handleAddOne = () => {
        setAddOneButtonEnabled(false);
        setSaveButtonEnabled(true);
        setCancelButtonEnabled(true);
        setEditButtonEnabled(false);
        setDeleteButtonEnabled(false);
        setIsEditing(true);
        fetchLastRecord()
        setFormData (initialFormData)
        setLastTenderDetails([])
        globalTotalAmount=""
    }

    const handleSaveOrUpdate = () => {
        setIsLoading(true);
        debugger
        let head_data = {
            ...formData,
            //   gst_code: gstCode || GSTCode,
          };

          const detail_data = users.map((user) => ({
            rowaction: user.rowaction,
            utrdetailid: user.utrdetailid,
            lot_no: user.lot_no ,
            grade_no: user.grade_no,
            amount: user.amount,
            lotCompany_Code: user.lotCompany_Code,
            Detail_Id: 1,
            Company_Code: companyCode,
            Year_Code: Year_Code,
            lotYear_Code: user.lotYear_Code,
            LTNo: 0,
            Adjusted_Amt: user.Adjusted_Amt,
            ln:user.ln,
          }));
          
          
        const totalItemAmount = detail_data.reduce((total, user) => {
              return total + parseFloat(user.amount);
          }, 0);
        globalTotalAmount = totalItemAmount.toFixed(2);
        const HeadAmount = parseFloat(head_data.amount).toFixed(2);
        const tolerance = 0.01; // Allowable difference
        const difference = Math.abs(parseFloat(HeadAmount) - parseFloat(globalTotalAmount));

        if (difference > tolerance) {
            alert('Difference must be zero');
            return;
        }
        if(HeadAmount!=globalTotalAmount)
        {
            alert('Diff must be Zero')
            return;
        }

        if (isEditMode) {
            delete head_data.lot_no;
            delete head_data.utrid;
            const requestData = {
                head_data,
                detail_data,
              };
              
              
            console.log('requestData',requestData)  
            axios
                .put(
                    `${API_URL}/update-utr?utrid=${formData.utrid}`, requestData
                )
                .then((response) => {
                    console.log("Data updated successfully:", response.data);
                    toast.success("Record update successfully!");
                    setIsEditMode(false);
                    setAddOneButtonEnabled(true);
                    setEditButtonEnabled(true);
                    setDeleteButtonEnabled(true);
                    setBackButtonEnabled(true);
                    setSaveButtonEnabled(false);
                    setCancelButtonEnabled(false);
                    setUpdateButtonClicked(true);
                    setIsEditing(false);
                    setIsLoading(false);
                    setTimeout(()=>{
                        window.location.reload()
                    },1000)

                })
                .catch((error) => {
                    handleCancel();
                    console.error("Error updating data:", error);
                });
        } else {
            const requestData = {
                head_data,
                detail_data,
              };
              delete head_data.lot_no;
              delete head_data.utrid;
    
            axios
                .post(`${API_URL}/insert-utr`, requestData)
                .then((response) => {
                    console.log("Data saved successfully:", response.data);
                    toast.success("_____ Create successfully!");
                    setIsEditMode(false);
                    setAddOneButtonEnabled(true);
                    setEditButtonEnabled(true);
                    setDeleteButtonEnabled(true);
                    setBackButtonEnabled(true);
                    setSaveButtonEnabled(false);
                    setCancelButtonEnabled(false);
                    setUpdateButtonClicked(true);
                    setIsEditing(false);
                    setIsLoading(false);
                    setTimeout(()=>{
                        window.location.reload()
                    },1000)
                })
                .catch((error) => {
                    console.error("Error saving data:", error);
                });
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
    const handleCancel = async () => {
        debugger
        const response = await axios.get(`${API_URL}/get-lastutrdata?Company_Code=${companyCode}&Year_Code=${YearCode}`)
        if (response.status === 200) {
                const data = response.data;
                const { last_head_data, last_details_data, labels } = data;
                const detailsArray = Array.isArray(last_details_data) ? last_details_data : [];
                console.log('detailsArray',detailsArray)

                lblBankname = data.labels.bankAcName;
                lblmillname = data.labels.millName;
                newbank_ac = data.last_head_data.bank_ac;
                newmill_code = data.last_head_data.mill_code;
                newLot_no=data.last_details_data.lot_no;


                setFormData((prevData) => ({
                    ...prevData,
                    ...data.last_head_data,
                  }));
                  setUsers([...users,
                    data.last_details_data,

                   ]);
                const newUsers = [...users];
                const totalItemAmount = newUsers.reduce((total, user) => {
                return total + parseFloat(user.amount);
                    }, 0);
                globalTotalAmount = totalItemAmount.toFixed(2);
                setLastTenderData(data.last_head_data || {});
                setLastTenderDetails(detailsArray);
                console.log('Tender Details',lastTenderDetails)
        }
        else {
            toast.error(
                "Failed to fetch last data:",
                response.status,
                response.statusText
              );
            }
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

    const handleDelete = async () => {
        const isConfirmed = window.confirm(`Are you sure you want to delete this UtrEntry ${formData.doc_no}?`);

        if (isConfirmed) {
            setIsEditMode(false);
            setAddOneButtonEnabled(true);
            setEditButtonEnabled(true);
            setDeleteButtonEnabled(true);
            setBackButtonEnabled(true);
            setSaveButtonEnabled(false);
            setCancelButtonEnabled(false);

            try {
                const deleteApiUrl = `${API_URL}/delete_data_by_utrid?utrid=${formData.utrid}&Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${formData.doc_no}`;
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

    const handleBack = () => {
        navigate ("/utrentry-Utility")
    }
    const openPopup = () => {
        setShowPopup(true);
    };

    //close popup function
    const closePopup = () => {
        setShowPopup(false);
        setSelectedUser({});
        clearForm();
    };

    const addUser = async () => {
        ;
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
            lot_no:newLot_no,
            // item_code: itemSelect,
            // ic: itemSelectAccoid,
            // Brand_Code: brandCode,
            ...formDataDetail,

            rowaction: "add",
        };
        // Calculate subTotal based on all users including newUser
        const newUsers = [...users, newUser];

        const totalItemAmount = newUsers.reduce((total, user) => {
            return total + parseFloat(user.amount);
        }, 0);
        globalTotalAmount = totalItemAmount.toFixed(2);
        




       setUsers(newUsers)
        closePopup();
    };

    const clearForm = () => {
        setFormDataDetail({
            lot_no: 0,
            grade_no: "",
            amount: null,
            lotCompany_Code: 0,
            lotYear_Code: 0,
            Adjusted_Amt: null,
            ln:null,

        });
    };

    const editUser = (user) => {
        ;
        setSelectedUser(user);
        console.log('selectedUser',selectedUser)
        setTenderno(user.lot_no)
        console.log('tender',Tenderno)
        setFormDataDetail({

            grade_no: user.grade_no || "",
            amount: user.amount || "",
            lotCompany_Code: user.lotCompany_Code || "",
            lotYear_Code: user.lotYear_Code || "",
            Adjusted_Amt: user.Adjusted_Amt || "",
            ln:user.ln || "",
        });

        openPopup();
    };

    useEffect(() => {
        console.log("Tenderno In UseEffect", Tenderno)
        setTenderno(Tenderno)
    },[Tenderno])


    //Functionality After delete record undo deleted record.
    const openDelete = async(user) => {
        let updatedUsers;

        // Set delete mode and selected user
        setDeleteMode(true);
        setSelectedUser(user);

        // Determine action based on edit mode and row action
        if (isEditMode && user.rowaction === "delete") {
            updatedUsers = users.map((u) =>
                u.id === user.id ? { ...u, rowaction: "Normal" } : u
            );
        } else {
            updatedUsers = users.map((u) =>
                u.id === user.id ? { ...u, rowaction: "add" } : u
            );
        }

        // Update formDataDetail with updatedUsers and subTotal
        setFormDataDetail({
            ...formDataDetail,

        });

        // Update users state
        setUsers(updatedUsers);

        // Clear selected user
        setSelectedUser({});
    };

    const deleteModeHandler = async(userToDelete) => {
        ;
        let updatedUsers;

        if (isEditMode && userToDelete.rowaction === "add") {
            updatedUsers = users.map((u) =>
                u.id === userToDelete.id ? { ...u, rowaction: "DNU" } : u
            );
        } else if (isEditMode) {
            updatedUsers = users.map((u) =>
                u.id === userToDelete.id ? { ...u, rowaction: "delete" } : u
            );
        } else {
            updatedUsers = users.map((u) =>
                u.id === userToDelete.id ? { ...u, rowaction: "DNU" } : u
            );
        }

          // Update formDataDetail with updatedUsers and subTotal
          setFormDataDetail({
            ...formDataDetail,  // Spread existing formDataDetail fields
            ...updatedUsers.find(u => u.id === u.id),  // Spread only the updated user fields

        });



        // Update users state, delete mode, and selected user
        setUsers(updatedUsers);
        setDeleteMode(true); // Assuming you need to set delete mode to true
        setSelectedUser(userToDelete);
    };
    //Handle Record DoubleCliked in Utility Page Show that record for Edit
    const handlerecordDoubleClicked = async() => {
        try {
            

            const response = await axios.get(`${API_URL}/getutrByid?Company_Code=${companyCode}&Year_Code=${Year_Code}&doc_no=${selectedRecord.utr_head_data.doc_no}`);
            const data = response.data;
            console.log('utr_head_data',data.utr_head)
            lblBankname = data.labels.bankAcName;
            lblmillname = data.labels.millName;
            newbank_ac = data.utr_head.bank_ac;
            newmill_code = data.utr_head.mill_code;

            setFormData((prevData) => ({
                ...prevData,
                ...data.utr_head,
              }));
              setLastTenderData(data.utr_head || {});
              setLastTenderDetails(data.utr_details || []);

              const totalItemAmount = data.utr_details.reduce((total, user) => {
                return total + parseFloat(user.amount);
            }, 0);
            globalTotalAmount = totalItemAmount.toFixed(2);

            setIsEditing(false);
        } catch (error) {
            console.error('Error fetching data:', error);
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
    }

    useEffect(() => {
        if (selectedRecord) {
            handlerecordDoubleClicked();
        } else {
            handleAddOne();
        }
    }, [selectedRecord]);

    //Update User On Grid
    //detail Grid Functionality......
    useEffect(() => {
        if (selectedRecord) {
            setUsers(
                lastTenderDetails.map((detail) => ({
                    rowaction: "Normal",

                    utrdetailid: detail.utrdetailid,
                    lot_no: detail.lot_no || Tenderno,
                    grade_no: detail.grade_no,
                    amount: detail.amount,
                    lotCompany_Code: detail.lotCompany_Code,
                    Detail_Id: detail.Detail_Id,
                    Company_Code: companyCode,
                    Year_Code: Year_Code,
                    lotYear_Code: detail.lotYear_Code,
                    LTNo: 0,
                    Adjusted_Amt: detail.Adjusted_Amt,
                    ln:detail.ln,
                    id:detail.utrdetailid

                }))

            );
            console.log(lastTenderDetails)
        }
    }, [selectedRecord, lastTenderDetails]);

    useEffect(() => {
        setUsers(
            lastTenderDetails.map((detail) => ({
                rowaction: "Normal",
                utrdetailid: detail.utrdetailid,
                lot_no: detail.lot_no ,
                grade_no: detail.grade_no,
                amount: detail.amount,
                lotCompany_Code: detail.lotCompany_Code,
                Detail_Id: detail.Detail_Id,
                Company_Code: companyCode,
                Year_Code: Year_Code,
                lotYear_Code: detail.lotYear_Code,
                LTNo: 0,
                Adjusted_Amt: detail.Adjusted_Amt,
                ln:detail.ln,
                id:detail.utrdetailid
            }))
        );
        console.log('lastTenderDetails',lastTenderDetails)
    }, [lastTenderDetails]);



    const updateUser = async () => {
        debugger
        const updatedUsers = users.map((user) => {
            if (user.id === selectedUser.id) {
                const updatedRowaction = user.rowaction === "Normal" ? "update" : user.rowaction;

                return {
                    
                    rowaction: updatedRowaction,
                    lot_no: user.lot_no,
                    grade_no: user.grade_no,
                    amount: user.amount,
                    lotCompany_Code: user.lotCompany_Code,
                    lotYear_Code: user.lotYear_Code,
                    Adjusted_Amt: user.Adjusted_Amt,
                    ln:user.ln,
                    ...user,
                    ...formDataDetail,

                };
            } else {
                return user;
            }
        });
        setFormDataDetail({
            ...updatedUsers,
            lot_no:Tenderno,
        });

        setUsers(updatedUsers);
        
        const totalItemAmount = updatedUsers.reduce((total, user) => {
        return total + parseFloat(user.amount);
            }, 0);
        globalTotalAmount = totalItemAmount.toFixed(2);
        closePopup();
    };

    const handlePurcno = (Tenderno, Tenderid) => {
        setTenderno(Tenderno);


        setFormData({
          ...formData,
          lot_no: Tenderno,
        });
      };
      const handleTenderDetailsFetched = (details) => {

        console.log('data',details.last_details_data[0])

        setTenderDetails(details.last_details_data[0])


                const newData = {

                    grade_no: details.last_details_data[0].Grade,

                    lotCompany_Code: details.last_details_data[0].Company_Code,
                    lotYear_Code: details.last_details_data[0].Year_Code,
                    ln:details.last_details_data[0].tenderid,
                    Adjusted_Amt: details.last_details_data[0].Packing,
                    lot_no:details.last_details_data[0].Tender_No,



                }


                setFormDataDetail(prevState=>(
                {
                    ...prevState,
                    ...newData,
                })
                )

            return newData;


        }
        //Calulate millamount



//change No functionality to get that particular record
    const handleKeyDown = async (event) => {
        if (event.key === 'Tab') {
            const changeNoValue = event.target.value;
            try {
                const response = await axios.get(`${API_URL}/getutrByid?Company_Code=${companyCode}&doc_no=${changeNoValue}&Year_Code=${Year_Code}`);
                const data = response.data;
                lblBankname = data.labels.bankAcName;
                lblmillname = data.labels.millName;
                newbank_ac = data.last_head_data.bank_ac;
                newmill_code = data.last_head_data.mill_code;

                setFormData((prevData) => ({
                    ...prevData,
                    ...data.last_head_data,
                  }));
                setLastTenderData(data.last_head_data || {});
                setLastTenderDetails(data.last_details_data || []);

                setIsEditing(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };
    const handleChangeDetail = (event) => {
        const { name, value } = event.target;
        let updatedFormDataDetail = { ...formDataDetail, [name]: value };

        setFormDataDetail(updatedFormDataDetail);
    };

    //Navigation Buttons
    const handleFirstButtonClick = async () => {
        try {
            
            const response = await fetch(`${API_URL}/get-firstutr-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}`);
            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();
                // Access the first element of the array
                lblBankname = data.labels.bankAcName;
                lblmillname = data.labels.millName;
                newbank_ac = data.first_head_data.bank_ac;
                newmill_code = data.first_head_data.mill_code;

                setFormData((prevData) => ({
                    ...prevData,
                    ...data.first_head_data,
                  }));
                setLastTenderData(data.first_head_data || {});
                setLastTenderDetails(data.first_details_data || []);
                
               

                const totalItemAmount = data.first_details_data.reduce((total, user) => {
                    return total + parseFloat(user.amount);
                }, 0);
                globalTotalAmount = totalItemAmount.toFixed(2);

            } else {
                console.error("Failed to fetch first record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handlePreviousButtonClick = async () => {
        try {
            debugger;
            // Use formData.Company_Code as the current company code
            const response = await fetch(`${API_URL}/get-previousutr-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&currentDocNo=${formData.doc_no}`);

            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();

                lblBankname = data.labels.bankAcName;
                lblmillname = data.labels.millName;
                newbank_ac = data.previous_head_data.bank_ac;
                newmill_code = data.previous_head_data.mill_code;

                setFormData((prevData) => ({
                    ...prevData,
                    ...data.previous_head_data,
                  }));
                setLastTenderData(data.previous_head_data || {});
                setLastTenderDetails(data.previous_details_data || []);
               

                const totalItemAmount = data.previous_details_data.reduce((total, user) => {
                    return total + parseFloat(user.amount);
                }, 0);
                globalTotalAmount = totalItemAmount.toFixed(2);

            } else {
                console.error("Failed to fetch previous record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handleNextButtonClick = async () => {
        try {
            const response = await fetch(`${API_URL}/get-nextutr-navigation?currentDocNo=${formData.doc_no}&Company_Code=${companyCode}&Year_Code=${Year_Code}`);

            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();
                // Assuming setFormData is a function to update the form data
                lblBankname = data.labels.bankAcName;
                lblmillname = data.labels.millName;
                newbank_ac = data.next_head_data.bank_ac;
                newmill_code = data.next_head_data.mill_code;

                setFormData((prevData) => ({
                    ...prevData,
                    ...data.next_head_data,
                  }));
                setLastTenderData(data.next_head_data || {});
                setLastTenderDetails(data.next_details_data || []);
               

                const totalItemAmount = data.next_details_data.reduce((total, user) => {
                    return total + parseFloat(user.amount);
                }, 0);
                globalTotalAmount = totalItemAmount.toFixed(2);
            } else {
                console.error("Failed to fetch next record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handleLastButtonClick = async () => {
        try {
            const response = await fetch(`${API_URL}/get-lastutrdata?Company_Code=${companyCode}&Year_Code=${Year_Code}`);
            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();
                // Access the first element of the array
                lblBankname = data.labels.bankAcName;
                lblmillname = data.labels.millName;
                newbank_ac = data.last_head_data.bank_ac;
                newmill_code = data.last_head_data.mill_code;

                setFormData((prevData) => ({
                    ...prevData,
                    ...data.last_head_data,
                  }));
                setLastTenderData(data.last_head_data || {});
                setLastTenderDetails(data.last_details_data || []);
               

                const totalItemAmount = data.last_details_data.reduce((total, user) => {
                    return total + parseFloat(user.amount);
                }, 0);
                globalTotalAmount = totalItemAmount.toFixed(2);
            } else {
                console.error("Failed to fetch last record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    }

    return (
        <>
            <div className="container">
                <ToastContainer />
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
                <div>
                    {/* Navigation Buttons */}
                    <NavigationButtons
                        handleFirstButtonClick={handleFirstButtonClick}
                        handlePreviousButtonClick={handlePreviousButtonClick}
                        handleNextButtonClick={handleNextButtonClick}
                        handleLastButtonClick={handleLastButtonClick}
                        highlightedButton={highlightedButton}
                        isEditing={isEditing}
                        isFirstRecord={formData.Company_Code === 1}

                    />
                </div>
            </div>

        <div className="form-container">
            <form>

                    <h2>UTR Entry</h2>
                    <br />
                    <div className="form-group ">
                        <label htmlFor="changeNo">Change No:</label>
                        <input
                            type="text"
                            id = "changeNo"
                            Name = "changeNo"
                            onKeyDown={handleKeyDown}
                            disabled={!addOneButtonEnabled}
                        />
                    </div>
                        <div className="form-group ">
                        <label htmlFor="doc_no">Entry No:</label>
                        <input
                            type="text"
                            id = "doc_no"
                            Name = "doc_no"
                            value={formData.doc_no}
                            onChange={handleChange}
                            disabled={!isEditing && addOneButtonEnabled}
                        />
                        </div>
                        <div className="form-group ">
                        <label htmlFor="doc_date">Doc Date:</label>
                        <input
                            type="date"
                            id = "doc_date"
                            Name = "doc_date"
                            value={formData.doc_date}
                            onChange={handleChange}
                            disabled={!isEditing && addOneButtonEnabled}
                        />
                        </div>
                        <div className="form-group ">
                        <label htmlFor="bank_ac" >
                        Bank Code
                        </label>
                        <AccountMasterHelp
                            Name = "bank_ac"
                            onAcCodeClick={handlebank_ac}
                            CategoryName={lblBankname}
                            CategoryCode={newbank_ac || formData.bank_ac}
                            tabIndex={3}
                            disabledFeild = {!isEditing && addOneButtonEnabled}
                       />
                       </div>
                       <div className="form-group ">
                        <label htmlFor="mill_code" >
                                Mill Code:
                            </label>
                            <AccountMasterHelp
                                Name = "mill_code"
                                onAcCodeClick={handlemill_code}
                                CategoryName={lblmillname}
                                CategoryCode={newmill_code}
                                tabIndex={4}
                                disabledFeild = {!isEditing && addOneButtonEnabled}
                            />
                            </div>
                            <div className="form-group ">
                            <label htmlFor="amount"> Amount:</label>

                            <input
                                type="text"
                                id = "amount"
                                Name = "amount"
                                value={formData.amount}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                            />
                            </div>
                            <div className="form-group ">
                                <label htmlFor="utr_no">UTR NO:</label>
                                <input
                                    type="text"
                                    id = "utr_no"
                                    Name = "utr_no"
                                    value={formData.utr_no}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                />
                            </div>
                            <div className="form-group ">
                                <label htmlFor="narration_header">Narration Header:</label>
                                <input
                                    type="text"
                                    id = "narration_header"
                                    Name = "narration_header"
                                    value={formData.narration_header}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                />
                             </div>
                             <div className="form-group ">
                                <label htmlFor="narration_footer">Narration Footer:</label>
                                <input
                                    type="text"
                                    id = "narration_footer"
                                    Name = "narration_footer"
                                    value={formData.narration_footer}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                />
                            </div>
                            <div className="form-group ">

                            <label htmlFor="IsSave">Is Save:</label>
                            <input
                                type="checkbox"
                                id = "IsSave"
                                Name = "IsSave"
                                value={formData.IsSave}
                                onChange={handleChange}
                                disabled={!isEditing && addOneButtonEnabled}
                            />
                            </div>
                            <div className="form-group ">

                            </div>

                                 <div className="form-group ">
                                    <label htmlFor="SelectedBank">Default Bank:</label>
                                    <select
                                        id="SelectedBank"
                                        name="SelectedBank"
                                        value={formData.SelectedBank}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        >
                                        <option value="Bank1">Bank1</option>
                                        <option value="Bank2">Bank2</option>
                                        <option value="Bank3">Bank3</option>


                                    </select>

                                <label htmlFor="EntryType">Default Entry:</label>
                                <select
                                        id="EntryType"
                                        name="EntryType"
                                        value={formData.EntryType}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        >
                                        <option value="FB">From Bank</option>
                                        <option value="FS">From Software</option>
                                    </select>
                                    <label htmlFor="PaymentType">Payment Type:</label>
                                    <select
                                        id="PaymentType"
                                        name="PaymentType"
                                        value={formData.PaymentType}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                        >
                                        <option value="EMPT">Select</option>
                                        <option value="RTGS">RTGS</option>
                                        <option value="IMPS">IMPS</option>
                                        <option value="NEFT">NEFT</option>
                                        <option value="IFT">IFT</option>
                                    </select>
                                    </div>
                                <div className="form-group ">
                                    <label htmlFor="paymentData">Payment Detail:</label>
                                    <input
                                        type="text"
                                        id = "paymentData"
                                        Name = "paymentData"
                                        value={formData.paymentData}
                                        onChange={handleChange}
                                        disabled={!isEditing && addOneButtonEnabled}
                                    />

                                </div>
            </form>
        </div>
        {isLoading && (
                    <div className="loading-overlay">
                        <div className="spinner-container">
                            <HashLoader color="#007bff" loading={isLoading} size={80} />
                        </div>
                    </div>
                )}

<div className="container mt-4">
                    <button
                        className="btn btn-primary"
                        onClick={openPopup}
                        disabled={!isEditing}
                        tabIndex="16"
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                openPopup();
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
                    {showPopup && (
                        <div
                            className="modal"

                            role="dialog"
                            style={{ display: "block"}}
                        >
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
                                            style={{ marginLeft: "80%", width: "60px", height: "30px" }}
                                        >
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <form>


                                            <label className="debitCreditNote-form-label">
                                            lot_no:
                                            </label>
                                            <div className="debitCreditNote-col-Ewaybillno">
                                                <div className="debitCreditNote-form-group">
                                                <UTRLotnoHelp

                                                   onAcCodeClick={handlePurcno}
                                                   name="lot_no"
                                                   Tenderno={newLot_no || tenderDetails.Tender_No || Tenderno}

                                                   tabIndexHelp={98}
                                                   disabledFeild={!isEditing && addOneButtonEnabled}
                                                    Millcode={formData.mill_code}
                                                    onTenderDetailsFetched={
                                                       handleTenderDetailsFetched

                                                    }
                                                    />
                                                    
                                                </div>
                                            </div>
                                            <div className="debitCreditNote-col-Ewaybillno">
                                              <div className="debitCreditNote-form-group">
                                            <input
                                                        type="text"
                                                        tabIndex="5"
                                                        className="debitCreditNote-form-control"
                                                        name="lotCompany_Code"
                                                        autoComplete="off"
                                                        value={formDataDetail.lotCompany_Code || tenderDetails.Company_Code}
                                                        onChange={handleChangeDetail}
                                                    />
                                                     <input
                                                        type="text"
                                                        tabIndex="5"
                                                        className="debitCreditNote-form-control"
                                                        name="lotYear_Code"
                                                        autoComplete="off"
                                                        value={formDataDetail.lotYear_Code || tenderDetails.Year_Code}
                                                        onChange={handleChangeDetail}
                                                    />
                                                    </div>
                                                    </div>



                                            <label className="debitCreditNote-form-label">
                                            lot_no:
                                            </label>
                                            <div className="debitCreditNote-col-Ewaybillno">
                                                <div className="debitCreditNote-form-group">
                                                    <input
                                                        type="text"
                                                        tabIndex="5"
                                                        className="debitCreditNote-form-control"
                                                        name="grade_no"
                                                        autoComplete="off"
                                                        value={formDataDetail.grade_no}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </div>
                                            </div>
                                            <label className="debitCreditNote-form-label">
                                            amount:
                                            </label>
                                            <div className="debitCreditNote-col-Ewaybillno">
                                                <div className="debitCreditNote-form-group">
                                                    <input
                                                        type="text"
                                                        tabIndex="5"
                                                        className="debitCreditNote-form-control"
                                                        name="amount"
                                                        autoComplete="off"
                                                        value={formDataDetail.amount}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </div>
                                            </div>
                                            <label className="debitCreditNote-form-label">
                                            Adjusted Amount:
                                            </label>
                                            <div className="debitCreditNote-col-Ewaybillno">
                                                <div className="debitCreditNote-form-group">
                                                    <input
                                                        type="text"
                                                        tabIndex="5"
                                                        className="debitCreditNote-form-control"
                                                        name="Adjusted_Amt"
                                                        autoComplete="off"
                                                        value={formDataDetail.Adjusted_Amt}
                                                        onChange={handleChangeDetail}
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                        {selectedUser.id ? (
                                            <button className="btn btn-primary" onClick={updateUser} onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    updateUser();
                                                }
                                            }}>
                                                Update User
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary" onClick={addUser} onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    addUser();
                                                }
                                            }}>
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

                    <table className="table mt-4 table-bordered">
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>ID</th>
                                <th>lot_no</th>
                                <th>grade no</th>
                                <th>amount</th>
                                <th>lotCompany_Code</th>
                                <th>lotYear_Code</th>
                                <th>Adjusted_Amt</th>
                                <th>Tenderid</th>
                                <th>Rowaction</th>
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
                                                            deleteModeHandler(user)
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
                                    <td>{user.id}</td>
                                    <td>{user.lot_no}</td>
                                    <td>{user.grade_no}</td>
                                    <td>{user.amount}</td>
                                    <td>{user.lotCompany_Code}</td>
                                    <td>{user.lotYear_Code}</td>
                                    <td>{user.Adjusted_Amt}</td>
                                    <td>{user.ln}</td>
                                    <td>{user.rowaction}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="form-group ">
                <label htmlFor="globalTotalAmount">Total Amount:</label>
                    <input
                    type="text"
                    tabIndex="5"
                    className="debitCreditNote-form-control"
                    name="globalTotalAmount"
                    autoComplete="off"
                    value={globalTotalAmount}
                    onChange={handleChangeDetail}
                />
                    </div>                

    </>
    );};export default UTREntry
