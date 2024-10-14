import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButtonGroup from '../../../Common/CommonButtons/ActionButtonGroup';
import NavigationButtons from "../../../Common/CommonButtons/NavigationButtons";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './JournalVoucher.css'
import AccountMasterHelp from "../../../Helper/AccountMasterHelp";

import { HashLoader } from 'react-spinners';
const companyCode = sessionStorage.getItem('Company_Code')
const Year_Code = sessionStorage.getItem('Year_Code')

const API_URL = process.env.REACT_APP_API;

var newDebit_ac
var lblacname

var globalTotalAmount=0.00
var globalCreditTotalAmount=0.00

var globalDeditTotalAmount=0.00

const JournalVoucher = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
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
    
    const [Debitcode, setDebitcode] = useState("");
    const [Debitcodeid, setDebitcodeid] = useState("");
    const [Debitcodename, setCreditcodecodename] = useState("");
    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState({});
    const [users, setUsers] = useState([]);
   
    const [tenderDetails, setTenderDetails] = useState({});
    const [lastTenderDetails, setLastTenderDetails] = useState([]);
    const [lastTenderData, setLastTenderData] = useState({});
    
    const [formDataDetail, setFormDataDetail] = useState({

        credit_ac:0,
        amount: 0,
        narration: 0,
        narration2: "",
        detail_id: 1,
        debit_ac:0,
        da:0,

        drcr:"C",
        

        
        Unit_Code: 0,
        
        Voucher_No:0,
        Voucher_Type:"",
        Adjusted_Amount:0.00,
        Tender_No:0,
        TenderDetail_ID:0,
        drpFilterValue:"",
        ca:0,
        uc:0,
        tenderdetailid:0,
        AcadjAccode:0,
        AcadjAmt:0.00,
        ac:0,
        TDS_Rate:0.00,
        TDS_Amt:0.00,
        GRN:"",
        TReceipt:"",
        
       
       
        
        
        
    });


    
    const navigate = useNavigate();
    //In utility page record doubleClicked that recod show for edit functionality
    const location = useLocation();
    const selectedRecord = location.state?.selectedRecord;
    const initialFormData = {
        tran_type: '',
        doc_no: '',
        doc_date: '',
       
        total: 0,
        company_code: companyCode,
        year_code: YearCode,
        
        tranid: 0,
        Created_By: '',
        Modified_By: '',
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
        let TranType='JV';
        fetch(`${API_URL}/get-lastreceiptpayment-navigation?Company_Code=${companyCode}&tran_type=${TranType}&Year_Code=${Year_Code}`)
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
    
    
    const handleAddOne = async () => {
        
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
        globalCreditTotalAmount=""
        globalDeditTotalAmount=""
        let tran_type='JV'
        console.log('tran_type',tran_type)
        setFormData(prevData => ({
            ...prevData,
            tran_type: "JV",
        }));
        
    }


    const handleSaveOrUpdate = () => {
        debugger
        let Total=parseFloat(globalCreditTotalAmount) - parseFloat(globalDeditTotalAmount)
        if (Total != "0") 
            {
              alert('difference must zero!!!');
             return;
            }
        let head_data = {
            ...formData,
           /// total:globalTotalAmount,
            //   gst_code: gstCode || GSTCode,
          };

          const detail_data = users.map((user) => ({
            rowaction: user.rowaction,
            detail_id :user.detail_id,
            debit_ac :user.debit_ac,
            drcr:user.drcr,
            amount :user.amount,
            narration :user.narration,
            trandetailid:user.trandetailid,
            da :user.da,
            Company_Code: companyCode,
            Year_Code: Year_Code,
            Tran_Type:"JV",
            tranid:formData.tranid
    
          }));
          
          
        
        if (isEditMode) {
            
            delete head_data.tranid
            
           
            const requestData = {
                head_data,
                detail_data,
              };
            delete requestData.tranid_1
           

            console.log('requestData',requestData)  
            axios
                .put(
                    `${API_URL}/update-receiptpayment?tranid=${formData.tranid}`, requestData
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
            const requestData = {
                head_data,
                detail_data,
              };
            //  delete head_data.lot_no;
            delete head_data.tranid;
            console.log('requestData',requestData)  
            axios
                .post(`${API_URL}/insert-receiptpayment`, requestData)
                .then((response) => {
                    console.log("Data saved successfully:", response.data);
                    toast.success("Data Created successfully!");
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
    const handleCancel = async () => {
        debugger;
        
        const response = await axios.get(`${API_URL}/get-lastreceiptpayment-navigation?Company_Code=${companyCode}&Year_Code=${YearCode}&tran_type=${formData.tran_type}`)
        if (response.status === 200) {
                const data = response.data;
                const { last_head_data, last_details_data, labels } = data;
                const detailsArray = Array.isArray(last_details_data) ? last_details_data : [];
                console.log('detailsArray',detailsArray)

               

                const itemNameMap = labels.reduce((map, label) => {
                    if (label.debit_ac !== undefined && label.debitacname) {
                        map[label.debit_ac] = label.debitacname;
                    }
                    return map;
                }, {});

                const enrichedDetails = detailsArray.map((detail) => ({
                    ...detail,
                    //creditacname: itemNameMap[detail.credit_ac] || "",
                    AcName:itemNameMap[detail.debit_ac] || "",
                   
                }));
               // const newUsers = [...users];
               const CredittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);
    
            const DebittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);
    
            globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount);
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.last_head_data,
                    total:globalTotalAmount,
                  }));
                
                setLastTenderData(data.last_head_data || {});
                setLastTenderDetails(enrichedDetails || []);
               // console.log('Tender Details',lastTenderDetails)
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
        let Total=parseFloat(globalCreditTotalAmount) - parseFloat(globalDeditTotalAmount)
        if (Total != "0") 
            {
              alert('difference must zero!!!');
             return;
            }
        const isConfirmed = window.confirm(`Are you sure you want to delete this Entry NO ${formData.doc_no}?`);

        if (isConfirmed) {
            setIsEditMode(false);
            setAddOneButtonEnabled(true);
            setEditButtonEnabled(true);
            setDeleteButtonEnabled(true);
            setBackButtonEnabled(true);
            setSaveButtonEnabled(false);
            setCancelButtonEnabled(false);

            try {
                const deleteApiUrl = `${API_URL}/delete_data_by_tranid?tranid=${formData.tranid}&company_code=${companyCode}&year_code=${YearCode}&doc_no=${formData.doc_no}&Tran_Type=${formData.tran_type}`;
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
        navigate ("/JVHead-utility")
    }
    //Handle Record DoubleCliked in Utility Page Show that record for Edit
    const handlerecordDoubleClicked = async() => {
        debugger
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
            
                const response = await axios.get(`
                    ${API_URL}/getreceiptpaymentByid?Company_Code=${companyCode}&tranid=${selectedRecord.receipt_payment_head_data.tranid}&tran_type=${selectedRecord.receipt_payment_head_data.tran_type}&doc_no=${selectedRecord.receipt_payment_head_data.doc_no}&Year_Code=${Year_Code}`);
                const data = response.data;
                
                const { labels, receipt_payment_head, receipt_payment_details } = data;
                
                const DetailsArray = Array.isArray(receipt_payment_details) ? receipt_payment_details : [];

                const itemNameMap = labels.reduce((map, label) => {
                    if (label.debit_ac !== undefined && label.debitacname) {
                        map[label.debit_ac] = label.debitacname;
                       
                        
                    }
                    return map;
                }, {});

                const enrichedDetails = DetailsArray.map((detail) => ({
                    ...detail,
                    //creditacname: itemNameMap[detail.credit_ac] || "",
                    AcName:itemNameMap[detail.debit_ac] || "",
                   
                }));
                const CredittotalItemAmount = enrichedDetails.reduce((total, user) => {
                    const amount = parseFloat(user.amount);
                    return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
                }, 0);
                globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);
        
                const DebittotalItemAmount = enrichedDetails.reduce((total, user) => {
                    const amount = parseFloat(user.amount);
                    return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
                }, 0);
                globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);
                globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)


                setFormData((prevData) => ({
                    ...prevData,
                    ...receipt_payment_head,
                    total:globalTotalAmount,
                }));
               

                setLastTenderData(receipt_payment_head || {});
                setLastTenderDetails([]); 
                setLastTenderDetails(enrichedDetails);
                

                setIsEditing(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            
       }

    useEffect(() => {
        if(selectedRecord){
            handlerecordDoubleClicked();
        }else{
            handleAddOne()
        }
    }, [selectedRecord]);

    useEffect(() => {
        debugger
        if (selectedRecord) {
            setUsers(
                lastTenderDetails.map((detail) => ({
                    rowaction: "Normal",
                    Company_Code: companyCode,
                    Year_Code: Year_Code,
                    Tran_Type:'JV',
                    debit_ac: detail.debit_ac ,
                    AcName:detail.AcName,
                    drcr:detail.drcr,
                    amount: detail.amount ,
                    narration: detail.narration ,
                    detail_id: detail.detail_id ,
                    da:detail.da || "",
                    trandetailid:detail.trandetailid,
                    id:detail.trandetailid
     

                }))

            );
            console.log(lastTenderDetails)
        }
    }, [selectedRecord, lastTenderDetails]);

    useEffect(() => {
        debugger
        setUsers(
            lastTenderDetails.map((detail) => ({
                rowaction: "Normal",
                
                Company_Code: companyCode,
                Year_Code: Year_Code,
                Tran_Type:'JV',
                debit_ac: detail.debit_ac ,
                AcName:detail.AcName,
                drcr:detail.drcr,
                amount: detail.amount ,
                narration: detail.narration ,
                detail_id: detail.detail_id ,
                da:detail.da || "",
                trandetailid:detail.trandetailid,
                id:detail.trandetailid
                
    
            }))
        );
        console.log('lastTenderDetails',lastTenderDetails)
    }, [lastTenderDetails]);




    const handleAccode =(code,accoid,name) =>{
        setDebitcode(code);
        setDebitcodeid(accoid);
        setCreditcodecodename(name)
    
         setFormDataDetail({
           ...formDataDetail,
           debit_ac: code,
           da:accoid,
          
           lblacname:name,


         });
     
     }

//change No functionality to get that particular record
    const handleKeyDown = async (event) => {
        if (event.key === 'Tab') {
            const changeNoValue = event.target.value;
            try {
                const response = await axios.get(`${API_URL}/getreceiptpaymentByid?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${formData.tran_type}&doc_no=${changeNoValue}`);
                const data = response.data;
                const { labels, receipt_payment_head, receipt_payment_details } = data;
                const DetailsArray = Array.isArray(receipt_payment_details) ? receipt_payment_details : [];
                

                const itemNameMap = labels.reduce((map, label) => {
                    if (label.debit_ac !== undefined && label.debitacname) {
                        map[label.debit_ac] = label.debitacname;
                                               
                    }
                    return map;
                }, {});

                const enrichedDetails = DetailsArray.map((detail) => ({
                    ...detail,
                    //creditacname: itemNameMap[detail.credit_ac] || "",
                    AcName:itemNameMap[detail.debit_ac] || "",
                    
                }));

                const CredittotalItemAmount = enrichedDetails.reduce((total, user) => {
                    const amount = parseFloat(user.amount);
                    return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
                }, 0);
                globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);
        
                const DebittotalItemAmount = enrichedDetails.reduce((total, user) => {
                    const amount = parseFloat(user.amount);
                    return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
                }, 0);
                globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);
        
                globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)
                setFormData((prevData) => ({
                    ...prevData,
                    ...data.receipt_payment_head,
                    total:globalTotalAmount,
                  }));
                setLastTenderData(data.receipt_payment_head || {});
                setLastTenderDetails(enrichedDetails || []);

                setIsEditing(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    //Navigation Buttons
    const handleFirstButtonClick = async () => {
        try {
            const response = await fetch(`${API_URL}/get-firstreceiptpayment-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${formData.tran_type}`);
            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();
                const { labels, first_head_data, first_details_data } = data;

                const DetailsArray = Array.isArray(first_details_data) ? first_details_data : [];

                const itemNameMap = labels.reduce((map, label) => {
                    if (label.debit_ac !== undefined && label.debitacname) {
                        map[label.debit_ac] = label.debitacname;
                       
                        
                    }
                    return map;
                }, {});

                const enrichedDetails = DetailsArray.map((detail) => ({
                    ...detail,
                    //creditacname: itemNameMap[detail.credit_ac] || "",
                    AcName:itemNameMap[detail.debit_ac] || "",
                   
                }));
                const CredittotalItemAmount = enrichedDetails.reduce((total, user) => {
                    const amount = parseFloat(user.amount);
                    return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
                }, 0);
                globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);
        
                const DebittotalItemAmount = enrichedDetails.reduce((total, user) => {
                    const amount = parseFloat(user.amount);
                    return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
                }, 0);
                globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);
                globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)


                setFormData((prevData) => ({
                    ...prevData,
                    ...first_head_data,
                    total:globalTotalAmount,
                }));
               

                setLastTenderData(first_head_data || {});
                setLastTenderDetails([]); 
                setLastTenderDetails(enrichedDetails);
                

            } else {
                console.error("Failed to fetch first record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handlePreviousButtonClick = async () => {
        try {
            debugger
            // Use formData.Company_Code as the current company code
            const response = await fetch(`${API_URL}/get-previousreceiptpayment-navigation?currentDocNo=${formData.doc_no}&Company_Code=${companyCode}&Year_Code=${YearCode}&tran_type=${formData.tran_type}`);

            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();

                const { labels, previous_head_data, previous_details_data } = data;

            const DetailsArray = Array.isArray(previous_details_data) ? previous_details_data : [];

            const itemNameMap = labels.reduce((map, label) => {
                if (label.debit_ac !== undefined && label.debitacname) {
                    map[label.debit_ac] = label.debitacname;
                
                }
                return map;
            }, {});

            const enrichedDetails = DetailsArray.map((detail) => ({
                ...detail,
                //creditacname: itemNameMap[detail.credit_ac] || "",
                AcName:itemNameMap[detail.debit_ac] || "",
               
            }));
            const CredittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);
    
            const DebittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);
            globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)

            setFormData((prevData) => ({
                ...prevData,
                ...previous_head_data,
                total:globalTotalAmount,
            }));

            setLastTenderData(previous_head_data || {});
            setLastTenderDetails([]); 
            setLastTenderDetails(enrichedDetails);
               

            } else {
                console.error("Failed to fetch previous record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handleNextButtonClick = async () => {
        debugger
        try {
            const response = await fetch(`${API_URL}/get-nextreceiptpayment-navigation?currentDocNo=${formData.doc_no}&Company_Code=${companyCode}&Year_Code=${YearCode}&tran_type=${formData.tran_type}`);

            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();
                // Assuming setFormData is a function to update the form data
                const { labels, next_head_data, next_details_data } = data;
                const DetailsArray = Array.isArray(next_details_data) ? next_details_data : [];

            
            const itemNameMap = labels.reduce((map, label) => {
                if (label.debit_ac !== undefined && label.debitacname) {
                    map[label.debit_ac] = label.debitacname;
                }
                return map;
            }, {});

            const enrichedDetails = DetailsArray.map((detail) => ({
                ...detail,
                //creditacname: itemNameMap[detail.credit_ac] || "",
                AcName:itemNameMap[detail.debit_ac] || "",
              
            }));
            const CredittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);
    
            const DebittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);
            globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)


            setFormData((prevData) => ({
                ...prevData,
                ...next_head_data,
                total:globalTotalAmount,
            }));

            setLastTenderData(next_head_data || {});
            setLastTenderDetails([]); 
            setLastTenderDetails(enrichedDetails);
               

                
            } else {
                console.error("Failed to fetch next record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    };

    const handleLastButtonClick = async () => {
        try {
            const response = await fetch(`${API_URL}/get-lastreceiptpayment-navigation?Company_Code=${companyCode}&Year_Code=${Year_Code}&tran_type=${formData.tran_type}`);
            if (response.ok) { // response.ok checks if status is in the range 200-299
                const data = await response.json();
                // Access the first element of the array
                const { labels, last_head_data, last_details_data } = data;
                const DetailsArray = Array.isArray(last_details_data) ? last_details_data : [];

          
            const itemNameMap = labels.reduce((map, label) => {
                if (label.debit_ac !== undefined && label.debitacname) {
                    map[label.debit_ac] = label.debitacname;
                   
                    
                }
                return map;
            }, {});

            const enrichedDetails = DetailsArray.map((detail) => ({
                ...detail,
                //creditacname: itemNameMap[detail.credit_ac] || "",
                AcName:itemNameMap[detail.debit_ac] || "",
                
            }));
            const CredittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);
    
            const DebittotalItemAmount = enrichedDetails.reduce((total, user) => {
                const amount = parseFloat(user.amount);
                return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
            }, 0);
            globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);
            globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)


            setFormData((prevData) => ({
                ...prevData,
                ...last_head_data,
                total:globalTotalAmount,
            }));

            setLastTenderData(last_head_data || {});
            setLastTenderDetails([]); 
            setLastTenderDetails(enrichedDetails);
               
               

               
            } else {
                console.error("Failed to fetch last record:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error during API call:", error);
        }
    }

    //declaring details function
    const handleChangeDetail = (event) => {
        const { name, value } = event.target;
        let updatedFormDataDetail = { ...formDataDetail, [name]: value };

        setFormDataDetail(updatedFormDataDetail);
    };

    const openPopup = () => {
        setShowPopup(true);
        const selectedValue = formData.tran_type;
        
    };

    const clearForm = () => {
        setFormDataDetail({
        debit_ac: "",    
        credit_ac: "",
        Unit_Code: 0,
        amount: 0,
        narration: "",
        narration2: "",
        detail_id: 1,
        Voucher_No:0,
        Voucher_Type:"",
        Adjusted_Amount:0.00,
        Tender_No:0,
        TenderDetail_ID:0,
        drpFilterValue:"",
        ca:0,
        uc:0,
        da:0,
        tenderdetailid:0,
        AcadjAccode:0,
        AcadjAmt:0.00,
        ac:0,
        TDS_Rate:0.00,
        TDS_Amt:0.00,
        GRN:"",
        TReceipt:""

        });
    };
    
    const deleteModeHandler = async(userToDelete) => {
        debugger
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

        const newUsers = [...users, updatedUsers];
       
        const CredittotalItemAmount = updatedUsers.reduce((total, user) => {
            const amount = parseFloat(user.amount);
            if (user.rowaction !== "delete") {
                // Add to the total if `drcr` is not "D" (assuming "C" stands for credit)
                return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
            }
            
            // Always return the total, even if the condition does not pass
            return total;
        }, 0);
        globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);

        const DebittotalItemAmount = updatedUsers.reduce((total, user) => {
            const amount = parseFloat(user.amount);
            if (user.rowaction !== "delete") {
                // Add to the total if `drcr` is not "D" (assuming "C" stands for credit)
                return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
            }
            
            // Always return the total, even if the condition does not pass
            return total;
        }, 0);
        globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);

        globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)

        setFormData((prevData) => ({
            ...prevData,
            
            total:globalTotalAmount,
        }));
        




        // Update users state, delete mode, and selected user
        setUsers(updatedUsers);
        setDeleteMode(true); // Assuming you need to set delete mode to true
        setSelectedUser(userToDelete);
    };

    //close popup function
    const closePopup = () => {
        setShowPopup(false);
        setSelectedUser({});
        clearForm();
    };

     
    const updateUser = async () => {
        debugger
        const updatedUsers = users.map((user) => {
            if (user.id === selectedUser.id) {
                const updatedRowaction = user.rowaction === "Normal" ? "update" : user.rowaction;

                return {
                    ...user,
                    
                    rowaction: updatedRowaction,
                    debit_ac: Debitcode ,
                    AcName:Debitcodename,
                    drcr:formDataDetail.drcr,
                    
                    amount: formDataDetail.amount ,
                    narration: formDataDetail.narration ,
                    detail_id: user.detail_id ,
                    da:Debitcodeid || "",

                };
            } else {
                return user;
            }
        });
       

        const CredittotalItemAmount = updatedUsers.reduce((total, user) => {
            const amount = parseFloat(user.amount);
            return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
        }, 0);
        globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);

        const DebittotalItemAmount = updatedUsers.reduce((total, user) => {
            const amount = parseFloat(user.amount);
            return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
        }, 0);
        globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);

        globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)


        setFormData((prevData) => ({
            ...prevData,
            total:globalTotalAmount,
        }));

        setUsers(updatedUsers);
        
        
        closePopup();
    };


    
    const addUser = async () => {
        debugger
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1,
             AcName:Debitcodename,
            ...formDataDetail,
           
            
            rowaction: "add",
        };
        console.log('newuser',newUser)
        const newUsers = [...users, newUser];
       
        const CredittotalItemAmount = newUsers.reduce((total, user) => {
            const amount = parseFloat(user.amount);
            return user.drcr === "D" ? total : total + (isNaN(amount) ? 0 : amount);
        }, 0);
        globalCreditTotalAmount = CredittotalItemAmount.toFixed(2);

        const DebittotalItemAmount = newUsers.reduce((total, user) => {
            const amount = parseFloat(user.amount);
            return user.drcr === "C" ? total : total + (isNaN(amount) ? 0 : amount);
        }, 0);
        globalDeditTotalAmount = DebittotalItemAmount.toFixed(2);

        globalTotalAmount=parseFloat(globalCreditTotalAmount) + parseFloat(globalDeditTotalAmount)

        setFormData((prevData) => ({
            ...prevData,
            
            total:globalTotalAmount,
        }));
        
        
        // Calculate subTotal based on all users including newUser
            
       setUsers([...users,newUser])
       closePopup();
       

    };
    
    const editUser = (user) => {
        debugger
        
        setSelectedUser(user);
        
        //setVoucherNoState(user.Voucher_No)
       setDebitcode(user.debit_ac);
       setDebitcodeid(user.da);
       setCreditcodecodename(user.AcName)
        setFormDataDetail({
        debit_ac: user.debit_ac || "",
        lblacname:user.AcName,
        //Debitcodename:user.AcName,
        drcr:user.drcr,
        
        amount: user.amount || "",
        narration: user.narration || "",
        detail_id: user.trandetailid,
        da:user.da || "",
        trandetailid:user.trandetailid,
        id:user.trandetailid,
        });
       
        openPopup();
    };


    const openDelete = async(user) => {
        debugger
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

        <div className="JVform-container" style={{maxWidth:"1200px"}}>
                <form>

                            <h2>Journal Voucher</h2>
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

                                <label htmlFor="doc_no">Doc no:</label>
                                <input
                                    type="text"
                                    id = "doc_no"
                                    Name = "doc_no"
                                    value={formData.doc_no}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                />
                               
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
                                
                               
                </form>
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
                                            <div className="debitCreditNote-col-Ewaybillno">
                                                <div className="debitCreditNote-form-group">
                                                <label className="debitCreditNote-form-label">
                                                Ac_ac:
                                                </label>
                                                <AccountMasterHelp
                                                Name = "debit_ac"
                                                onAcCodeClick={handleAccode}
                                                CategoryName={lblacname || Debitcodename}
                                                CategoryCode={newDebit_ac || formDataDetail.debit_ac}
                                                tabIndex={4}
                                                disabledFeild = {!isEditing && addOneButtonEnabled}
                                                />
                                                 </div>
                                                 </div>
                                                    
                                                    <div className="debitCreditNote-col-Ewaybillno">
                                                    <div className="debitCreditNote-form-group">
                                            <label htmlFor="drcr">drcr:</label>
                                              <select
                                                id="drcr"
                                                name="drcr"
                                                value={ formDataDetail.drcr }
                                                onChange={handleChangeDetail}
                                                disabled={!isEditing && addOneButtonEnabled}
                                                >
                                                
                                                <option value="C">Credit</option>
                                                <option value="D">Debit</option>
                                                
                                                </select>
                                                </div>
                                                </div>
                                           
                                           
                                            <div className="debitCreditNote-col-Ewaybillno">
                                                <div className="debitCreditNote-form-group">
                                                <label className="debitCreditNote-form-label">
                                             Amount:
                                            </label>
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
                                           
                                            <div className="debitCreditNote-col-Ewaybillno">
                                                <div className="debitCreditNote-form-group">
                                                <label className="debitCreditNote-form-label">
                                            Narration:
                                            </label>

                                                <textarea
                                                    name="narration"
                                                    value={formDataDetail.narration}
                                                    onChange={handleChangeDetail}
                                                    autoComplete="off"
                                                    tabIndex="12"
                                                    disabled={!isEditing && addOneButtonEnabled}
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

                    <table className="table mt-4 table-bordered" style={{marginLeft:"700px"}}>
                        <thead>
                            <tr>
                                <th>Actions</th>
                                <th>ID</th>
                                <th>AcCode</th>
                                <th>AcName</th>
                                <th>DRCR</th>
                                <th>amount</th>
                                <th>narration</th>
                                <th>trandetailid</th>
                                <th>Debitid</th>
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
                                   
                                    <td>{user.detail_id}</td>
                                    <td>{user.debit_ac}</td>
                                    <td>{user.AcName}</td>
                                    <td>{user.drcr}</td>
                                    <td>{user.amount}</td>
                                    <td>{user.narration}</td>
                                    <td>{user.trandetailid}</td>
                                    <td>{user.da}</td>
                                    <td>{user.rowaction}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
        </div>

                <div className="form-group ">
                                <label htmlFor="total">Total:</label>
                                <input
                                    type="text"
                                    id = "total"
                                    Name = "total"
                                    value={formData.total}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                />
                                 
                                <label htmlFor="total">Credit Total:</label>
                                <input
                                    type="text"
                                    id = "total"
                                    Name = "total"
                                    value={globalCreditTotalAmount}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                />
                              
                                <label htmlFor="total">Debit Total:</label>
                                <input
                                    type="text"
                                    id = "total"
                                    Name = "total"
                                    value={globalDeditTotalAmount}
                                    onChange={handleChange}
                                    disabled={!isEditing && addOneButtonEnabled}
                                />
                </div>
        </div>
        
        


    </>   
     );};
    export default JournalVoucher