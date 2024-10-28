import React from "react";
import { Button } from "@mui/material";

function Pagination({ pageCount, currentPage, onPageChange }) {
  const visiblePages = 5;
  const halfVisible = Math.floor(visiblePages / 2);

  let startPage = Math.max(currentPage - halfVisible, 1);
  let endPage = Math.min(startPage + visiblePages - 1, pageCount);

  if (endPage - startPage + 1 < visiblePages) {
    startPage = Math.max(endPage - visiblePages + 1, 1);
  }

  const pageButtons = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => (
      <Button
        key={startPage + index}
        onClick={() => onPageChange(startPage + index)}
        variant={currentPage === startPage + index ? "contained" : "outlined"}
        size="small"
        style={{ margin: "0.2rem" }}
      >
        {startPage + index}
      </Button>
    )
  );

  return (
    <div style={{ display: "flex", marginTop: "1rem",float:'right' }}>
      {currentPage > 1 && (
        <Button onClick={() => onPageChange(currentPage - 1)}>Prev</Button>
      )}
      {pageButtons}
      {currentPage < pageCount && (
        <Button onClick={() => onPageChange(currentPage + 1)}>Next</Button>
      )}
    </div>

  );
}

export default Pagination;

