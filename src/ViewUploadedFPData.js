import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";

export default function UploadFPData() {
  const [dark, setDark] = useState(false);
  const [fpData, setFpData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { id ,fileName} = useParams();
  
  useEffect(() => {
    const fetchFPData = async () => {
      try {
        setLoading(true);

        // GET request with file_id as query parameter
        const response = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/viewFPData.php?file_id=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        setFpData(data);
      } catch (err) {
        console.error("Error fetching FP Data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFPData();
  }, [id]);

  if (loading) return <p>Loading FP data...</p>;
  if (!fpData || !fpData.particulars) return <p>No data found</p>;

  return (
    <Container
      fluid
      className="p-3"
      style={{
        backgroundColor: dark ? "#212529" : "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          backgroundColor: dark ? "#2c2c2c" : "#fff",
          margin: "0 auto",
          maxWidth: "900px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: dark ? "#343a40" : "#f47c2c",
            padding: "0.8rem 2rem",
          }}
        >
        <div className="d-flex align-items-center">
  {/* Left */}
  <h4 style={{ color: "white", margin: 0 }}>
    View FP Uploaded Excel Data
  </h4>

  {/* Center */}
  <div className="mx-auto">
    {fileName && (
      <span style={{ color: "white", fontSize: "14px" }}>
        File Name: <b>{fileName}</b>
      </span>
    )}
  </div>

  {/* Right */}
  <Button
    variant="light"
    size="sm"
    onClick={() => setDark(!dark)}
  >
    {dark ? "☀️ Light" : "🌙 Dark"}
  </Button>
</div>
        </div>

        {/* Body */}
        <div className="p-4 card-body">
        <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  }}
>
  <table
    style={{
      borderCollapse: "collapse",
      width: "80%",
      fontSize: "15px",
      fontFamily: "Calibri, sans-serif",
    }}
  >
    <thead>
      <tr>
        {[
          "Perticulars",
          "Weight / Area / Mandays",
          "Material / Site / Transport Cost",
        ].map((head, i) => (
          <th
            key={i}
            style={{
              backgroundColor: "#f7945d",
              color: "#000",
              border: "2px solid #000",
              padding: "6px",
              textAlign: "center",
              fontWeight: "bold",
              fontColor: "white",
            }}
          >
            {head}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {fpData.particulars.map((row, index) => (
        <tr key={index}>
          {/* Particulars */}
          <td
            style={{
              border: "1px solid #666",
              padding: "5px 8px",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            {row.name} :
          </td>

          {/* Weight */}
          <td
            style={{
              border: "1px solid #666",
              padding: "5px 8px",
              textAlign: "right",
              fontWeight: "bold",
            }}
          >
            {row.weight || "0"}
          </td>

          {/* Cost */}
          <td
            style={{
              border: "1px solid #666",
              padding: "5px 8px",
              textAlign: "right",
              fontWeight: "bold",
            }}
          >
            {row.cost ? row.cost.toLocaleString("en-IN") : "0"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        </div>
      </div>
    </Container>
  );
}