import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const headerStyle = {
  backgroundColor: "#fd7e14",
  color: "#000",
  fontWeight: "600",
};

const ManufacturingBillingView = () => {
  const [data, setData] = useState({});
  const [file, setFile] = useState(null);

  const formatAmount = (val) => {
    if (!val || val === "") return "0";
    return Number(val).toLocaleString("en-IN");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(
      "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/account/getAccountBillingData.php"
    );
    setData(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select file");

    const fd = new FormData();
    fd.append("filename[]", file);

    await fetch(
      "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/account/ajaxUploadAccountData.php",
      { method: "POST", body: fd }
    );

    fetchData();
    setFile(null);
  };

  return (
    <div className="container-fluid mt-3">

      {/* Upload Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form onSubmit={handleSubmit} className="d-flex gap-2">
          <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Button style={{ background: "#fd7e14", border: "none" }} type="submit">
            Submit
          </Button>
        </Form>

        <span className="badge bg-primary fs-6">
          Date : {formatDate(data?.date)}
        </span>
      </div>

      <div className="row">
        {/* LEFT */}
        <div className="col-md-9">

          {/* SUPPLY */}
          <table className="table table-bordered">
            <thead>
              <tr>
                <th colSpan="4" style={headerStyle}>
                  Supply Billing (S+SM)
                </th>
              </tr>
              <tr>
                <th>Latest Invoice</th>
                <th>Domestic (D)</th>
                <th>SEZ (E)</th>
                <th>Export (Ex)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bill No</td>
                <td>{data.supply_domestic_bill_no}</td>
                <td>{data.supply_sez_bill_no}</td>
                <td>{data.supply_export_bill_no}</td>
              </tr>
              <tr>
                <td>Bill Date</td>
                <td>{formatDate(data.supply_domestic_bill_date)}</td>
                <td>{formatDate(data.supply_sez_bill_date)}</td>
                <td>{formatDate(data.supply_export_bill_date)}</td>
              </tr>
              <tr>
                <td>Amount</td>
                <td className="text-end">{formatAmount(data.supply_domestic_bill_amount)}</td>
                <td className="text-end">{formatAmount(data.supply_sez_bill_amount)}</td>
                <td className="text-end">0</td>
              </tr>
              <tr className="fw-bold">
                <td>TOTAL Amount</td>
                <td colSpan="3" className="text-end">
                  {formatAmount(data.supply_total_amount)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* LABOUR */}
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th colSpan="4" style={headerStyle}>Labor (SL1) Billing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bill No</td>
                <td>{data.labour_domestic_bill_no}</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Bill Date</td>
                <td>{formatDate(data.labour_domestic_bill_date)}</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Amount</td>
                <td className="text-end">{formatAmount(data.labour_domestic_bill_amount)}</td>
                <td className="text-end">0</td>
                <td className="text-end">0</td>
              </tr>
              <tr className="fw-bold">
                <td>TOTAL Amount</td>
                <td className="text-end">{formatAmount(data.labour_bill_total_amount)}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* AMC */}
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th colSpan="4" style={headerStyle}>AMC (SA) Billing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bill No</td>
                <td>{data.amc_domestic_bill_no}</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Bill Date</td>
                <td>{formatDate(data.amc_domestic_bill_date)}</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Amount</td>
                <td className="text-end">{formatAmount(data.amc_domestic_bill_amount)}</td>
                <td className="text-end">0</td>
                <td className="text-end">0</td>
              </tr>
              <tr className="fw-bold">
                <td>TOTAL Amount</td>
                <td className="text-end">{formatAmount(data.amc_bill_total_amount)}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* GRAND TOTAL */}
          <table className="table table-bordered mt-3">
            <tbody>
              <tr className="fw-bold">
                <td>TOTAL Billing</td>
                <td className="text-end">{formatAmount(data.total_billing)}</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RIGHT DETAILS */}
        <div className="col-md-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th style={headerStyle}>Details</th>
                <th style={headerStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pure Site Expense</td>
                <td className="text-end">{formatAmount(data.pure_site_expenses)}</td>
              </tr>
              <tr>
                <td>Site Advance</td>
                <td className="text-end">{formatAmount(data.site_advance)}</td>
              </tr>
              <tr>
                <td>Site Wages</td>
                <td className="text-end">{formatAmount(data.site_wages)}</td>
              </tr>
              <tr className="fw-bold">
                <td>Total Site Expense</td>
                <td className="text-end">{formatAmount(data.total_site_expenses)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingBillingView;
