import React from "react";
import TextField from "@mui/material/TextField";

function SearchBar({ value, onChange,onSearchClick }) {
  return (
    <div className="controls">
      <TextField
        id="search"
        label="Search"
        variant="outlined"
        value={value}
        onChange={onChange}
        placeholder="Search...."
        onClick={onSearchClick} 
        style={{float:'right',borderRadius:"50px",width:"40%"}}
      />
    </div>
  );
}

export default SearchBar;