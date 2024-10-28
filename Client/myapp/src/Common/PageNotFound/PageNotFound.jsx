// src/NotAuthorized.jsx
import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>You Are Not Authorized</h1>
      <p style={styles.message}>
        Sorry, you do not have permission to view this page.
      </p>
      <Button variant="contained" color="primary" onClick={handleBack}>
        Go Back
      </Button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  message: {
    fontSize: "1.2rem",
    marginBottom: "30px",
  },
};

export default NotAuthorized;
