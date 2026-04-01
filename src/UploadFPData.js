import React, { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UploadFPData() {
  const [dark, setDark] = useState(false);
  const [file, setFile] = useState(null);
  const { id: fileId, fileName } = useParams();
  const [fpData, setFpData] = useState(null);
  //console.log("fileName",fileName);
  const location = useLocation();
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
  //  const path = location.pathname;
 // const fileId = path.split('/marketing/project/UploadFPDat /')[1];
    e.preventDefault();
    if (!file) {
      alert("Please upload an Excel file first!");
      return;
    }

    // ✅ Example: send file to backend
    const formData = new FormData();
   // formData.append("file", file);
    // formData.append("fileID", fileId);           // required
    // formData.append("filename[]", selectedFile);
 
    formData.append("fileID", fileId);           // required
    formData.append("filename[]", file);

    fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadFPFile.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        // alert("FP Data uploaded successfully!");
        // showToast(`FP Data uploaded successfully!`);
                            toast.success('FP Data uploaded successfully!');
        
        fetch(`https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/viewFPData.php?file_id=${fileId}`)
        .then((res) => res.json())
        .then((resData) => {
          setFpData(resData);
        });
        console.log("Response:", data);
      })
      .catch((err) => {
        console.error("Upload error:", err);
        // alert("Upload failed!");
                            toast.error('Upload failed!');

      });

      // try {
      //   const res = await fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/uploadFPFile.php", {
      //     method: "POST",
      //     body: formData
      //   });
      //   const data = await res.json();
      //   console.log("Upload result:", data);
      
      //   if (data.status === "completed") {
      //     alert("Upload success!");
      //   } else {
      //     alert("Upload failed!");
      //   }
      // } catch (err) {
      //   console.error("Upload error:", err);
      // }
  };

  return (
    <Container
      fluid
      className="p-0"
      style={{
        backgroundColor: dark ? "#212529" : "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <div className="p-0">
        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 0 10px #ccc",
            backgroundColor: dark ? "#2c2c2c" : "#fff",
            margin: "0 auto",
            maxWidth: "600px",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: dark ? "#343a40" : "#eee",
              padding: "0.5rem 2rem",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
    <h4 style={{ color: dark ? "white" : "black", margin: 0 }}>
      Upload Excel File
    </h4>

    <Button
      variant="light"
      size="sm"
      onClick={() => setDark(!dark)}
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </Button>
  </div>
  <div
    className="d-flex justify-content-between align-items-center mt-1"
    style={{ fontSize: "0.9rem", color: dark ? "#ccc" : "#555" }}
  >
    <span>Please upload your FP Excel file</span>

    {fileName && (
      <span>
        File Name: <b>{fileName}</b>
      </span>
    )}
  </div> </div>

          {/* Body */}
          <div className="p-4 card-body">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Upload Excel File</Form.Label>
                <Form.Control type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
              </Form.Group>

              <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                <Button type="submit" className="px-4 btn btn-primary btn-sm">
                  Submit
                </Button>
                <Button
                  type="button"
                  className="px-4 btn btn-danger btn-sm"
                  onClick={() => setFile(null)}
                >
                  Reset
                </Button>
              </div>
            </Form>
            {fpData && fpData.particulars && (
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
        width: "90%",
        fontSize: "13px",
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
                border: "2px solid #000",
                padding: "6px",
                textAlign: "center",
                fontWeight: "bold",
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
            <td style={{ border: "1px solid #666", padding: "5px 8px" }}>
              {row.name} :
            </td>

            <td
              style={{
                border: "1px solid #666",
                padding: "5px 8px",
                textAlign: "right",
              }}
            >
              {row.weight || "0"}
            </td>

            <td
              style={{
                border: "1px solid #666",
                padding: "5px 8px",
                textAlign: "right",
              }}
            >
              {row.cost ? row.cost.toLocaleString("en-IN") : "0"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
          </div>
        </div>
      </div>
    </Container>
  );
}
