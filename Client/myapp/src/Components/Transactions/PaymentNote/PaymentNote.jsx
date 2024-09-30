import React, { useState, useEffect, useRef } from "react";
import ActionButtonGroup from "../../../Common/CommonButtons/ActionButtonGroup";
import NavigationButtons from '../../../Common/CommonButtons/NavigationButtons';
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";
import { useNavigate, useLocation } from 'react-router-dom';
import './PaymentNote.css';
import axios, { isCancel } from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API;

var bankCode = ""
var bankName = ""
var paymentToCode = ""
var paymentToName = ""

const PaymentNote = () => {
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
    const yearCode = sessionStorage.getItem('Year_Code')
    const navigate = useNavigate();
    //In utility page record doubleClicked that recod show for edit functionality
    const location = useLocation();

    const dateInputRef = useRef(null);
    const changeNoRef = useRef(null);

    const selectedRecord = location.state?.selectedRecord;
    const initialFormData = {
        doc_no: '',
        doc_date: new Date().toISOString().split("T")[0],
        bank_ac: '',
        payment_to: '',
        amount: '',
        narration: '',
        Company_Code: companyCode,
        Year_Code: yearCode,
        Created_By: '',
        Modified_By: '',
        ba: '',
        pt: '',
}
    const [formData, setFormData] = useState(initialFormData);
    const [bankAc, setBank] = useState('')
    const [paymentTo, setPaymentTo] = useState('')

    useEffect(() => {
        if (isEditing) {
          if (dateInputRef.current) {
            dateInputRef.current.focus();
          }
        }
        else if(isCancel){
            if (changeNoRef.current) {
                changeNoRef.current.focus();
              }
        }
      }, [isEditing, isCancel]);
    // Handle change for all inputs
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => {
            // Create a new object based on existing state
            const updatedFormData = { ...prevState, [name]: value };
            return updatedFormData;
        });
    };

    const handleDateChange = (event, fieldName) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [fieldName]: event.target.value,
        }));
      };

    const handleBankAc = (code, accoid) => {
        setBank(code);
        setFormData({
          ...formData,
          bank_ac: code,
          ba: accoid,
        });
      };

      const handlePaymentTo = (code, accoid) => {
        setPaymentTo(code);
        setFormData({
          ...formData,
          payment_to: code,
          pt: accoid,
        });
      };

    const fetchLastRecord= () => {
        fetch(`${API_URL}/getNextDocNo_PaymentNote?Company_Code=${companyCode}&Year_Code=${yearCode}`)
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
                    doc_no: data.next_doc_no 
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
        fetchLastRecord();
        setFormData (initialFormData)
        paymentToCode = ""
        paymentToName = ""
        bankCode = ""
        bankName = ""
    }

    const handleSaveOrUpdate = () => {
        if (isEditMode) {
            axios
                .put(
                    `${API_URL}/update-PaymentNote`, formData
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
                })
                .catch((error) => {
                    handleCancel();
                    console.error("Error updating data:", error);
                });
        } else {
            axios
                .post(`${API_URL}/insert-PaymentNote`, formData)
                .then((response) => {
                    console.log("Data saved successfully:", response.data);
                    toast.success("Record Created successfully!");
                    setIsEditMode(false);
                    setAddOneButtonEnabled(true);
                    setEditButtonEnabled(true);
                    setDeleteButtonEnabled(true);
                    setBackButtonEnabled(true);
                    setSaveButtonEnabled(false);
                    setCancelButtonEnabled(false);
                    setUpdateButtonClicked(true);
                    setIsEditing(false);
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
    const handleCancel = () => {
        axios.get(`${API_URL}/getLast_PaymentNote?Company_Code=${companyCode}&Year_Code=${yearCode}`)
            .then((response) => {
                const data = response.data;
                if (response.data && !response.data.error) {
                paymentToName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].PaymentToName
                : '';
                bankName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].BankCashName : '';
                paymentToCode = data.lastPaymentNoteData.payment_to
                bankCode=data.lastPaymentNoteData.bank_ac


                setFormData({
                    ...formData,
                    ...data.lastPaymentNoteData,
                });
            }
                else if (response.data.error) {
                    console.log('Displaying error toast');  
                    toast.error(response.data.error);
                }
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

    const handleDelete = async () => {
        const isConfirmed = window.confirm(`Are you sure you want to delete this Doc No ${formData.doc_no}?`);

        if (isConfirmed) {
            setIsEditMode(false);
            setAddOneButtonEnabled(true);
            setEditButtonEnabled(true);
            setDeleteButtonEnabled(true);
            setBackButtonEnabled(true);
            setSaveButtonEnabled(false);
            setCancelButtonEnabled(false);

            try {
                const deleteApiUrl = `${API_URL}/delete-PaymentNote?doc_no=${formData.doc_no}&Company_Code=${companyCode}&Year_Code=${yearCode}`;
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
        navigate ("/PaymentNote-utility")
    }
    //Handle Record DoubleCliked in Utility Page Show that record for Edit
    const handlerecordDoubleClicked = async() => {
        try {
            const response = await axios.get(`${API_URL}/PaymentNoteById?Company_Code=${companyCode}&Year_Code=${yearCode}&doc_no=${selectedRecord.payment_Note_Data
                .doc_no}`);
            if (response.data && !response.data.error) {
                const data = response.data;
                 paymentToName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].PaymentToName : '';
                 bankName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].BankCashName : '';
                 paymentToCode = data.payment_Note_Data_By_Id.payment_to;
                 bankCode = data.payment_Note_Data_By_Id.bank_ac;

                setFormData({
                    ...formData,
                    ...data.payment_Note_Data_By_Id,
                });
                setIsEditing(false);
            } else if (response.data.error) {
                console.log('Displaying error toast');  
                toast.error(response.data.error);
            }
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
        if(selectedRecord){
            handlerecordDoubleClicked();
        }else{
            handleAddOne()
        }
    }, [selectedRecord]);

//change No functionality to get that particular record
const handleKeyDown = async (event) => {
    if (event.key === 'Tab') {
        const changeNoValue = event.target.value;
        try {
            const response = await axios.get(`${API_URL}/PaymentNoteById?Company_Code=${companyCode}&Year_Code=${yearCode}&doc_no=${changeNoValue}`);
            if (response.data && !response.data.error) {
                const data = response.data;
                 paymentToName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].PaymentToName : '';
                 bankName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].BankCashName : '';
                 paymentToCode = data.payment_Note_Data_By_Id.payment_to;
                 bankCode = data.payment_Note_Data_By_Id.bank_ac;

                setFormData({
                    ...formData,
                    ...data.payment_Note_Data_By_Id,
                });
                setIsEditing(false);
            } else if (response.data.error) {
                console.log('Displaying error toast');  
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.response?.data?.error || "An unexpected error occurred while fetching the data.");
        }
    }
};


    //Navigation Buttons
    const handleFirstButtonClick = async () => {
        try {
            const response = await axios.get(`${API_URL}/getFirst_PaymentNote?Company_Code=${companyCode}&Year_Code=${yearCode}`);
            if (response.data && !response.data.error) {
                const data = response.data;
                 paymentToName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].PaymentToName : '';
                 bankName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].BankCashName : '';
                 paymentToCode = data.firstPaymentNoteData.payment_to;
                 bankCode = data.firstPaymentNoteData.bank_ac;

                setFormData({
                    ...formData,
                    ...data.firstPaymentNoteData,
                });
                setIsEditing(false);
            } else if (response.data.error) {
                console.log('Displaying error toast');  
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handlePreviousButtonClick = async () => {
        try {
            // Use formData.Company_Code as the current company code
            const response = await axios.get(`${API_URL}/getPrevious_PaymentNote?Company_Code=${companyCode}&Year_Code=${yearCode}&doc_no=${formData.doc_no}`);
            if (response.data && !response.data.error) {
                const data = response.data;
                 paymentToName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].PaymentToName : '';
                 bankName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].BankCashName : '';
                 paymentToCode = data.previousPaymentNoteData.payment_to;
                 bankCode = data.previousPaymentNoteData.bank_ac;

                setFormData({
                    ...formData,
                    ...data.previousPaymentNoteData,
                });
                setIsEditing(false);
            } else if (response.data.error) {
                console.log('Displaying error toast');  
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handleNextButtonClick = async () => {
        try {
            const response = await axios.get(`${API_URL}/getNext_PaymentNote?Company_Code=${companyCode}&Year_Code=${yearCode}&doc_no=${formData.doc_no}`);
            if (response.data && !response.data.error) {
                const data = response.data;
                 paymentToName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].PaymentToName : '';
                 bankName = data.paymentNoteLabels.length > 0 ? data.paymentNoteLabels[0].BankCashName : '';
                 paymentToCode = data.nextPaymentNoteData.payment_to;
                 bankCode = data.nextPaymentNoteData.bank_ac;

                setFormData({
                    ...formData,
                    ...data.nextPaymentNoteData,
                });
                setIsEditing(false);
            } else if (response.data.error) {
                console.log('Displaying error toast');  
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

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
                        handleLastButtonClick={handleCancel}
                        highlightedButton={highlightedButton}
                        isEditing={isEditing}
                        isFirstRecord={formData.Company_Code === 1}

                    />
                </div>
            </div>

<div className="form-container">
                <form>

                    <h2>Payment Note</h2>
                    <br />
                    <div className="form-group ">
                        <label htmlFor="changeNo">Change No:</label>
                        <input
                            tabIndex={1}
                            type="text"
                            id = "changeNo"
                            Name = "changeNo"
                            onKeyDown={handleKeyDown}
                            disabled={!addOneButtonEnabled}
                            ref={changeNoRef}
                           
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="doc_no">Entry No:</label>
                        <input
                            tabIndex={2}
                            type="text"
                            id = "doc_no"
                            Name = "doc_no"
                            value={formData.doc_no}
                            onChange={handleChange}
                            disabled={true}
                            
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="doc_date">Date:</label>
                        <input
                            tabIndex={3}
                            type="date"
                            id = "doc_date"
                            Name = "doc_date"
                            value={formData.doc_date}
                            onChange={(e) => handleDateChange(e, "doc_date")}
                            disabled={!isEditing && addOneButtonEnabled}
                            ref={dateInputRef}
                            
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bank_ac">Cash/Bank:</label>
                        <AccountMasterHelp
                            onAcCodeClick={handleBankAc}
                            CategoryName={bankName}
                            CategoryCode={bankCode}
                            name="bank_ac"
                            tabIndexHelp={4}
                            disabledFeild={!isEditing && addOneButtonEnabled}
              />
                    </div>
                    <div className="form-group">
                        <label htmlFor="payment_to">Payment To:</label>
                        <AccountMasterHelp
                            onAcCodeClick={handlePaymentTo}
                            CategoryName={paymentToName}
                            CategoryCode={paymentToCode}
                            name="payment_to"
                            tabIndexHelp={5}
                            disabledFeild={!isEditing && addOneButtonEnabled}
              />
                    </div>
                    <div className="form-group">
                        <label htmlFor="amount">Amount:</label>
                        <input
                            tabIndex={6}
                            type="text"
                            id = "amount"
                            Name = "amount"
                            value={formData.amount}
                            onChange={handleChange}
                            disabled={!isEditing && addOneButtonEnabled}
                            
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="narration">Narration:</label>
                        <input
                            tabIndex={7}
                            type="text"
                            id = "narration"
                            Name = "narration"
                            value={formData.narration}
                            onChange={handleChange}
                            disabled={!isEditing && addOneButtonEnabled}
                            
                        />
                    </div>
</form>
            </div>

        </>    );};


export default PaymentNote
