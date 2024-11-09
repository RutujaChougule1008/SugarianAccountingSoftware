import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  IconButton, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Grid 
} from '@mui/material';
import { 
  AiOutlineUser, 
  AiFillEye, 
  AiFillEyeInvisible,
  AiFillLock
} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import logo from "../../Assets/jklogo.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const API_URL = process.env.REACT_APP_API;

const LoginForm = () => {
  const navigate = useNavigate();
  const UsernameRef = useRef(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginData, setLoginData] = useState({
    Login_Name: '',
    Password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginData.Login_Name || !loginData.Password) {
      toast.error("Both Login Name and Password are required!");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/login`, loginData);
      const { user_data, access_token } = response.data;
      sessionStorage.setItem('user_type', user_data.UserType);
      sessionStorage.setItem('access_token', access_token);
      toast.success("Logged in successfully!");
      setTimeout(() => {
        navigate("/company-list");
      }, 1000);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.error || "Login failed!");
        console.error('Login error:', error.response.data.error);
      } else if (error.request) {
        toast.error("The login request was made but no response was received");
      } else {
        toast.error("An error occurred: " + error.message);
      }
    }
  };

  useEffect(() => {
    UsernameRef.current.focus();
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Container className="login-container">
      <ToastContainer />
      <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
        <img src={logo} alt='' width={100} />
        <Typography variant="h5" gutterBottom>SignIn</Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <Grid container justifyContent="center" alignItems="center" spacing={2}>
          <Grid item xs={7}>
            <TextField
              variant="outlined"
              fullWidth
              label="Username"
              name="Login_Name"
              value={loginData.Login_Name}
              onChange={handleChange}
              inputRef={UsernameRef}
              autoComplete='off'
              InputProps={{
                startAdornment: (
                  <IconButton>
                    <AiOutlineUser />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={7}>
            <TextField
              variant="outlined"
              fullWidth
              label="Password"
              name="Password"
              autoComplete='off'
              type={passwordVisible ? "text" : "password"}
              value={loginData.Password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <IconButton>
                    <AiFillLock />
                  </IconButton>
                ),
                endAdornment: (
                  <IconButton onClick={togglePasswordVisibility}>
                    {passwordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'center' }}>
            <button className="Login-button" type="submit">
              SignIn
            </button>
          </Grid>
        </Grid>
      </form>
     
    </Container>
  );
};

export default LoginForm;
