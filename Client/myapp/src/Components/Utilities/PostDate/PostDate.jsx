import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PostDate.css'

const API_URL = process.env.REACT_APP_API;

const companyCode = sessionStorage.getItem('Company_Code')
const yearCode = sessionStorage.getItem('Year_Code')

const PostDateManager = () => {
    const [formData, setFormData] = useState({
        Company_Code: companyCode,
        Year_Code: yearCode,
        Post_Date: new Date().toISOString().split("T")[0],
        Inword_Date: new Date().toISOString().split("T")[0],
        Outword_Date: new Date().toISOString().split("T")[0],
        Created_By: '',
        Created_Date: new Date().toISOString().split("T")[0]
    });

    useEffect(() => {
        fetchPostDateRecord();
    }, []);

    const fetchPostDateRecord = async () => {
        try {
            const response = await axios.get(`${API_URL}/get-PostDate-Record`, { params: { Company_Code: companyCode, Year_Code: yearCode } });
            if (response.data.PostDate_data) {
                setFormData(response.data.PostDate_data);
            }
        } catch (error) {
            toast.error('Failed to fetch post date data');
        }
    };

    const handleDateChange = (event, fieldName) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [fieldName]: event.target.value,
        }));
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/create-or-update-PostDate`, formData);
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Failed to save post date data');
        }
    };

    return (
        <div className="PostDate-form-container">
            <ToastContainer />
            <h1>Post Date Management</h1>
            <form onSubmit={handleSubmit}>
                <div className="PostDate-form-group">
                    <label>
                        Post Date:
                        <input type="date" name="Post_Date" value={formData.Post_Date} onChange={(e) => handleDateChange(e, "Post_Date")} />
                    </label>
                </div>
                <div className="PostDate-form-group">
                    <label>
                        Inword Date:
                        <input type="date" name="Inword_Date" value={formData.Inword_Date} onChange={(e) => handleDateChange(e, "Inword_Date")} />
                    </label>
                </div>
                <div className="PostDate-form-group">
                    <label>
                        Outword Date:
                        <input type="date" name="Outword_Date" value={formData.Outword_Date} onChange={(e) => handleDateChange(e, "Outword_Date")} />
                    </label>
                </div>
                <div className="button-container">
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    );
};

export default PostDateManager;
