import React, { useState, useEffect } from "react";
import { Container, Button, Form, Card, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PrintCompletedDispatchDetails = () => {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [printData, setPrintData] = useState(null);
  const { file_id } = useParams();

  // Fetch available dates for the dropdown
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/printCompletedDispatchDetailsApi.php?file_id=${file_id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status && Array.isArray(result.data)) {
          setDateOptions(result.data);
          // Set the first date as default
          if (result.data.length > 0) {
            setSelectedDate(result.data[0]);
          }
        } else {
          toast.warning("No dates available");
        }
      } catch (err) {
        console.error("Error fetching dates:", err);
        toast.error("Error loading dates");
      } finally {
        setLoading(false);
      }
    };

    if (file_id) {
      fetchDates();
    }
  }, [file_id]);

  // Fetch print data when date changes
  useEffect(() => {
    const fetchPrintData = async () => {
      if (!selectedDate || !file_id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/printApi.php?file=${file_id}&date=${selectedDate}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "success" && result.data) {
          setPrintData(result.data);
        } else {
          toast.warning("No data available for selected date");
          setPrintData(null);
        }
      } catch (err) {
        console.error("Error fetching print data:", err);
        toast.error("Error loading print data");
        setPrintData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrintData();
  }, [selectedDate, file_id]);

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle print button click
  const handlePrint = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!printData) {
      toast.error("No data to print");
      return;
    }

    window.print();
    toast.success("Print initiated");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: dark ? "#212529" : "#f8f9fa",
        }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
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
            maxWidth: "1200px",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: dark ? "#343a40" : "#f47c2c",
              padding: "0.8rem 2rem",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h4 style={{ color: "white", margin: 0 }}>
                {printData?.file_name || file_id || "File Details"}
              </h4>
              <Button
                variant="light"
                size="sm"
                onClick={() => setDark(!dark)}
              >
                {dark ? "☀️ Light" : "🌙 Dark"}
              </Button>
            </div>
          </div>

          {/* Date Selector and Print Button */}
          <div className="p-4" style={{ backgroundColor: dark ? "#2c2c2c" : "#fff" }}>
            <div className="d-flex gap-3 align-items-center justify-content-between flex-wrap">
              <div className="d-flex gap-2 align-items-center" style={{ flex: 1 }}>
                <Form.Select
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{
                    maxWidth: "300px",
                    backgroundColor: dark ? "#343a40" : "#fff",
                    color: dark ? "#fff" : "#000",
                    borderColor: dark ? "#495057" : "#ced4da",
                  }}
                >
                  <option value="">Select Date</option>
                  {dateOptions.map((date, index) => (
                    <option key={index} value={date}>
                      {date}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <Button
                variant="warning"
                onClick={handlePrint}
                disabled={!selectedDate || !printData}
                style={{
                  backgroundColor: "#f47c2c",
                  borderColor: "#f47c2c",
                  color: "white",
                  fontWeight: "bold",
                  padding: "0.5rem 2rem",
                }}
              >
                <i className="bi bi-printer-fill me-2"></i>
                Print
              </Button>
            </div>
          </div>

          {/* Preview/Print Section */}
          {printData ? (
            <div
              className="p-4"
              id="printable-section"
              style={{
                backgroundColor: dark ? "#1a1a1a" : "#ffffff",
                color: dark ? "#fff" : "#000",
              }}
            >
              {/* Company Header */}
              <div className="text-center mb-4">
                <div
                  style={{
                    backgroundColor: "#f47c2c",
                    width: "100px",
                    height: "60px",
                    margin: "0 auto 15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "40px",
                      background:
                        "radial-gradient(circle, white 30%, transparent 31%)",
                      backgroundSize: "8px 8px",
                    }}
                  ></div>
                </div>
                <h3 style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  {printData.company_info.name}
                </h3>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {printData.company_info.address}
                </p>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {printData.company_info.phone}
                </p>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {printData.company_info.email}
                </p>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  {printData.company_info.website}
                </p>
                <p style={{ margin: "5px 0 0 0", fontSize: "14px", fontWeight: "bold" }}>
                  {printData.company_info.gstin}
                </p>
                <hr style={{ border: "2px solid #000", margin: "10px 0" }} />
              </div>

              {/* File Details */}
              <div className="mb-3">
                <Table
                  bordered
                  size="sm"
                  style={{
                    backgroundColor: dark ? "#2c2c2c" : "#fff",
                    color: dark ? "#fff" : "#000",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ width: "50%", padding: "8px", fontWeight: "500" }}>
                        File : {printData.file_name}
                      </td>
                      <td style={{ width: "25%", padding: "8px", fontWeight: "500" }}>
                        Type : {printData.type}
                      </td>
                      <td style={{ width: "25%", padding: "8px", fontWeight: "500" }}>
                        Date : {printData.date}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {/* Data Table */}
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                }}
              >
                <Table
                  bordered
                  hover
                  style={{
                    marginBottom: 0,
                    backgroundColor: dark ? "#2c2c2c" : "#fff",
                    color: dark ? "#fff" : "#000",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: dark ? "#343a40" : "#f8f9fa" }}>
                      <th style={{ textAlign: "center", padding: "10px" }}>Sr No</th>
                      <th style={{ textAlign: "center", padding: "10px" }}>Type</th>
                      <th style={{ textAlign: "left", padding: "10px" }}>Description</th>
                      <th style={{ textAlign: "center", padding: "10px" }}>WW (mm)</th>
                      <th style={{ textAlign: "center", padding: "10px" }}>H/L (mm)</th>
                      <th style={{ textAlign: "center", padding: "10px" }}>PLAN</th>
                      <th style={{ textAlign: "center", padding: "10px" }}>SENT</th>
                      <th style={{ textAlign: "center", padding: "10px" }}>BUNDLES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printData.items.map((item, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {item.sr_no}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {item.type}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {item.description}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {item.ww_mm || ""}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {item.hl_mm || ""}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {item.plan}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {item.sent}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          {item.bundles || ""}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Total Row */}
                    <tr style={{ fontWeight: "bold", backgroundColor: dark ? "#1a1a1a" : "#f8f9fa" }}>
                      <td colSpan="5" style={{ textAlign: "right", padding: "8px" }}>
                        Total
                      </td>
                      <td style={{ textAlign: "center", padding: "8px" }}></td>
                      <td style={{ textAlign: "center", padding: "8px" }}>
                        {printData.totals.total_sent}
                      </td>
                      <td style={{ textAlign: "center", padding: "8px" }}>
                        {printData.totals.total_bundles}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center" style={{ color: dark ? "#fff" : "#000" }}>
              <p>No data available. Please select a date.</p>
            </div>
          )}
        </div>
      </Container>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={dark ? "dark" : "light"}
      />

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-section,
            #printable-section * {
              visibility: visible;
            }
            #printable-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .p-4:first-child {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default PrintCompletedDispatchDetails;