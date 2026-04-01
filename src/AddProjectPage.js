import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const API_ROOT =
  "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/addproject";
const MASTER_API = `${API_ROOT}/addproject_data_api.php`;
const STATIC_AMBASSADORS = ["VVD", "AGP", "SVJ", "RPK", "PAL", "VDK", "HMT"];
const ALLOWED_UPLOAD_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];

const INITIAL_PROJECT_STATE = {
  custId: "",
  shippingAddrId: "",
  billingAddrId: "",
  shippingContactPerson: "",
  billingContactPerson: "",
  shippingName: "",
  shippingContactNumber: "",
  shippingEmail: "",
  billingName: "",
  billingContactNumber: "",
  billingEmail: "",
  customerAmbassador: "",
  customerAmbassador1: ""
};

const createCommercialState = () => ({
  ABG: false,
  PBG: false,
  PBG1: false,
  PC: false,
  PC1: false,
  ADV: false,
  AVT1: false,
  bankGno1: "",
  bankGamt1: "",
  BGDate1: "",
  BGEDate1: "",
  BCdate1: "",
  file11: null,
  bankGno2: "",
  bankGamt2: "",
  BGDate2: "",
  BGEDate2: "",
  BCdate2: "",
  file12: null,
  bankGno3: "",
  bankGamt3: "",
  BGDate3: "",
  BGEDate3: "",
  BCdate3: "",
  file13: null,
  poreceiveDate1: "",
  dispatchDate1: "",
  penalty1: "",
  poreceiveDate2: "",
  dispatchDate2: "",
  penalty2: "",
  Advanceamt1: "",
  Advanceamt2: ""
});

const createFileRow = (id) => ({
  id,
  fileName: "",
  fileTypeId: "",
  parentFileNo: "",
  quotationNumber: "",
  quotationDate: "",
  productId: "",
  projectDescription: "",
  storeLocation: "",
  unitLocation: "",
  finacialYear: "",
  po_number: "",
  po_date: "",
  po_amount: "",
  lb_amount: "0",
  cashAmount: "0",
  taxType: "",
  comment: "",
  amcFrom: "",
  amcTo: "",
  amcVisit: "",
  amcMonths: [],
  mae: "",
  eea: "",
  relatedFileChoice: "",
  file: null,
  fileExists: null,
  saving: false,
  saved: false
});

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const getTaxPercent = (taxValue) => {
  if (!taxValue) {
    return 0;
  }
  const parts = String(taxValue).split("-");
  return Number(parts[1] || 0);
};

const getFileTypeId = (fileTypeValue) => String(fileTypeValue || "").split("-")[0];
const isAmcFile = (row) => getFileTypeId(row.fileTypeId) === "2";
const isLabourFile = (row) => getFileTypeId(row.fileTypeId) === "4";
const hasPoNumber = (row) => Boolean(String(row.po_number || "").trim());
const shouldRequireQuotationDate = (row) => Boolean(String(row.quotationNumber || "").trim());
const poFieldDisabled = (row) => !hasPoNumber(row);
const relatedFileLabel = (row) =>
  isLabourFile(row) ? "Do you want to add Concerned Supply file?" : "Do you want to add Concerned Labour file?";

const isAllowedFile = (file) => {
  if (!file?.name) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return ALLOWED_UPLOAD_EXTENSIONS.includes(ext);
};

const parseOptionHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<select>${html}</select>`, "text/html");
  return Array.from(doc.querySelectorAll("option"))
    .map((option) => ({
      value: option.getAttribute("value") || "",
      label: option.textContent?.trim() || ""
    }))
    .filter((option) => option.label);
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.text();
}

const ADD_PROJECT_PAGE_STYLES = `
.add-project-page {
  --ap-navy: #0f172a;
  --ap-navy-mid: #1e3a5f;
  --ap-accent: #2563eb;
  --ap-accent-soft: rgba(37, 99, 235, 0.14);
  --ap-border: #e2e8f0;
  --ap-muted: #64748b;
  --ap-surface: #ffffff;
  background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 40%, #f8fafc 100%);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.add-project-page .form-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ap-muted);
  margin-bottom: 0.35rem;
}
.add-project-page .form-control,
.add-project-page .form-select {
  border-radius: 8px;
  border-color: var(--ap-border);
  font-size: 0.9375rem;
}
.add-project-page .form-control:focus,
.add-project-page .form-select:focus {
  border-color: var(--ap-accent);
  box-shadow: 0 0 0 3px var(--ap-accent-soft);
}
.ap-surface {
  background: var(--ap-surface);
  border-radius: 12px;
  border: 1px solid var(--ap-border);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.ap-hero {
  background: linear-gradient(125deg, #0f172a 0%, #1e3a5f 42%, #1d4ed8 100%);
  color: #fff;
  border: none !important;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.18) !important;
}
.ap-hero .ap-hero-kicker { color: rgba(255,255,255,0.72) !important; }
.ap-hero .ap-hero-title { color: #fff; font-weight: 700; letter-spacing: -0.02em; }
.ap-hero .ap-hero-desc { color: rgba(255,255,255,0.78) !important; font-size: 0.95rem; max-width: none; }
.ap-hero .badge { background: rgba(255,255,255,0.14) !important; color: #fff; font-weight: 600; border: 1px solid rgba(255,255,255,0.22); }
.ap-hero .badge.bg-success { background: rgba(34, 197, 94, 0.22) !important; border-color: rgba(34, 197, 94, 0.4); color: #bbf7d0 !important; }
.ap-hero .btn-primary {
  background: #fff;
  color: #0f172a;
  border: none;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
}
.ap-hero .btn-primary:hover { background: #e2e8f0; color: #0f172a; }
.ap-hero .btn-primary:disabled { opacity: 0.65; }
.ap-hero .btn-success {
  border-radius: 8px;
  font-weight: 600;
  padding: 0.5rem 1.1rem;
  border: none;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.35);
}
.ap-hero .btn-success:disabled { opacity: 0.55; }
.ap-steps {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.14);
}
.ap-step {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.88);
  background: rgba(255,255,255,0.08);
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
}
.ap-step i { opacity: 0.95; font-size: 0.95rem; }
.ap-summary-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ap-muted);
}
.ap-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.45rem;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid var(--ap-border);
  font-size: 0.78rem;
  min-height: 100%;
}
.ap-summary-row span {
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.ap-summary-row strong { color: var(--ap-navy); font-variant-numeric: tabular-nums; white-space: nowrap; font-size: 0.82rem; }
.ap-section-header {
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%) !important;
  border-bottom: 1px solid var(--ap-border) !important;
  padding-top: 1.2rem !important;
  padding-bottom: 0.95rem !important;
}
.ap-section-header h5 {
  font-weight: 700;
  color: var(--ap-navy);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}
.ap-section-header h5 .bi { color: var(--ap-accent); font-size: 1.15rem; }
.ap-nested-card {
  border-radius: 10px !important;
  border: 1px solid var(--ap-border) !important;
  background: #fafbfc !important;
}
.ap-nested-card h6 { font-weight: 700; color: var(--ap-navy); font-size: 0.95rem; }
.ap-ambassador-strip .form-check {
  margin-bottom: 0.35rem;
  padding: 0.4rem 0.7rem;
  background: #fff;
  border: 1px solid var(--ap-border);
  border-radius: 8px;
}
.ap-ambassador-strip .form-check-label { font-weight: 600; font-size: 0.875rem; color: var(--ap-navy); }
.ap-file-row {
  border-radius: 12px !important;
  border: 1px solid var(--ap-border) !important;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}
.ap-file-row-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.15rem;
  background: linear-gradient(90deg, #f8fafc 0%, #fff 100%);
  border-bottom: 1px solid var(--ap-border);
}
.ap-file-row-body { padding: 1.15rem; }
.ap-commercial-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid var(--ap-border);
}
.add-project-page .ap-commercial-toggles .form-check {
  margin: 0;
  padding: 0.45rem 0.75rem;
  background: #fff;
  border: 1px solid var(--ap-border);
  border-radius: 8px;
}
.add-project-page .ap-commercial-toggles .form-check-label { font-size: 0.82rem; font-weight: 600; color: var(--ap-navy); }
.ap-subcard {
  border-radius: 10px !important;
  border: 1px solid var(--ap-border) !important;
  margin-top: 1rem;
  background: #fafbfc !important;
}
.ap-subcard .card-body h6 {
  font-weight: 700;
  color: var(--ap-navy);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--ap-border);
}
.ap-loading {
  min-height: 70vh;
  background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 100%);
}
.ap-loading-inner {
  padding: 2rem 2.5rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid var(--ap-border);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}
.ap-file-details-card .card-header h5 small {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ap-muted);
  text-transform: none;
  letter-spacing: 0;
  margin-top: 0.35rem;
}
.ap-subsection-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--ap-muted);
  margin-top: 1rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--ap-border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ap-subsection-title:first-child {
  margin-top: 0;
}
.ap-footer-summary {
  border-top: 3px solid var(--ap-accent);
  box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.06);
}
.ap-footer-summary .btn-success {
  min-width: 200px;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.65rem 1.25rem;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
}
`;

function AddProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState({
    customers: [],
    ambassadors: [],
    marketing_employees: [],
    file_types: [],
    financial_years: [],
    products: [],
    tax_types: []
  });
  const [projectId, setProjectId] = useState("");
  const [savingHeader, setSavingHeader] = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [savingContacts, setSavingContacts] = useState({
    shipping: false,
    billing: false
  });
  const [addressOptions, setAddressOptions] = useState({
    shipping: [],
    billing: []
  });
  const [personOptions, setPersonOptions] = useState({
    shipping: [],
    billing: []
  });
  const [parentFileOptions, setParentFileOptions] = useState({});
  const [project, setProject] = useState({ ...INITIAL_PROJECT_STATE });
  const [rows, setRows] = useState([createFileRow(1)]);
  const [commercial, setCommercial] = useState(createCommercialState());
  const [postSaveModalOpen, setPostSaveModalOpen] = useState(false);

  const defaultFinancialYear = useMemo(() => {
    const selected = masterData.financial_years.find((item) => Number(item.status) === 1);
    return selected?.financial_year || masterData.financial_years[0]?.financial_year || "";
  }, [masterData.financial_years]);

  const defaultTaxType = useMemo(() => {
    const selected = masterData.tax_types[0];
    return selected ? `${selected.TAX_ID}-${selected.TAX_PERCENTAGE}` : "9-18";
  }, [masterData.tax_types]);

  useEffect(() => {
    document.title = "Add Project";
  }, []);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const payload = {
          actions: [
            "customers",
            "ambassadors",
            "marketing_employees",
            "file_types",
            "financial_years",
            "products",
            "tax_types"
          ]
        };

        const data = await fetchJson(MASTER_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        setMasterData({
          customers: data.data.customers || [],
          ambassadors: data.data.ambassadors || [],
          marketing_employees: data.data.marketing_employees || [],
          file_types: data.data.file_types || [],
          financial_years: data.data.financial_years || [],
          products: data.data.products || [],
          tax_types: data.data.tax_types || []
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load Add Project master data");
      } finally {
        setLoading(false);
      }
    };

    loadMasterData();
  }, []);

  useEffect(() => {
    if (!defaultFinancialYear && !defaultTaxType) {
      return;
    }

    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        finacialYear: row.finacialYear || defaultFinancialYear,
        taxType: row.taxType || defaultTaxType
      }))
    );
  }, [defaultFinancialYear, defaultTaxType]);

  const resetAddProjectForm = useCallback(() => {
    setProjectId("");
    setProject({ ...INITIAL_PROJECT_STATE });
    setAddressOptions({ shipping: [], billing: [] });
    setPersonOptions({ shipping: [], billing: [] });
    setParentFileOptions({});
    setCommercial(createCommercialState());
    setRows([
      {
        ...createFileRow(1),
        finacialYear: defaultFinancialYear,
        taxType: defaultTaxType
      }
    ]);
    setPostSaveModalOpen(false);
    setTimeout(() => {
      const el = document.getElementById("fileName-1");
      if (el) {
        el.focus();
      }
    }, 100);
  }, [defaultFinancialYear, defaultTaxType]);

  const handlePostSaveAddNew = () => {
    resetAddProjectForm();
  };

  const handlePostSaveGoToList = () => {
    setPostSaveModalOpen(false);
    navigate("/marketing/project/project-list");
  };

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const basic = parseNumber(row.po_amount);
        const freight = parseNumber(row.lb_amount);
        const cash = parseNumber(row.cashAmount);
        const tax = (basic * getTaxPercent(row.taxType)) / 100;
        const total = basic + tax;
        const fileTypeId = String(row.fileTypeId || "").split("-")[0];

        acc.basic += basic;
        acc.freight += freight;
        acc.cash += cash;
        acc.tax += tax;
        acc.total += total;

        if (fileTypeId === "4") {
          acc.labour += total;
        } else {
          acc.material += total;
        }

        return acc;
      },
      { basic: 0, freight: 0, cash: 0, tax: 0, total: 0, material: 0, labour: 0 }
    );
  }, [rows]);

  const loadCustomerAddresses = async (customerId) => {
    if (!customerId) {
      setAddressOptions({ shipping: [], billing: [] });
      setPersonOptions({ shipping: [], billing: [] });
      return;
    }

    try {
      const data = await fetchJson(MASTER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions: ["shipping_addresses", "billing_addresses"],
          customer_id: customerId
        })
      });

      setAddressOptions({
        shipping: data.data.shipping_addresses || [],
        billing: data.data.billing_addresses || []
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load shipping and billing addresses");
    }
  };

  const loadContactPeople = async (type, addressId) => {
    if (!addressId) {
      setPersonOptions((prev) => ({ ...prev, [type]: [] }));
      return;
    }

    try {
      const endpoint =
        type === "shipping"
          ? `${API_ROOT}/getShippingPersonName.php?shippingAddressId=${encodeURIComponent(addressId)}`
          : `${API_ROOT}/getBillingPersonalDetails.php?billingid=${encodeURIComponent(addressId)}`;

      const html = await fetchText(endpoint);
      const options = parseOptionHtml(html).filter(
        (option) => option.value !== "" && option.value !== "opt1"
      );

      setPersonOptions((prev) => ({ ...prev, [type]: options }));
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load ${type} contact persons`);
    }
  };

  const handleProjectChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmbassadorSelection = async (value) => {
    setProject((prev) => ({
      ...prev,
      customerAmbassador: value,
      customerAmbassador1: value === "OTHER" ? prev.customerAmbassador1 : ""
    }));

    if (projectId) {
      return;
    }

    const shouldCreateFile = window.confirm("Do you want to create file for this project?");
    if (!shouldCreateFile) {
      return;
    }

    await saveProjectHeader({
      customerAmbassador: value
    });
  };

  const handleCustomerChange = async (event) => {
    const customerId = event.target.value;
    setProject((prev) => ({
      ...prev,
      custId: customerId,
      shippingAddrId: "",
      billingAddrId: "",
      shippingContactPerson: "",
      billingContactPerson: "",
      shippingName: "",
      shippingContactNumber: "",
      shippingEmail: "",
      billingName: "",
      billingContactNumber: "",
      billingEmail: ""
    }));
    await loadCustomerAddresses(customerId);
  };

  const handleAddressChange = async (type, value) => {
    setProject((prev) => ({
      ...prev,
      [type === "shipping" ? "shippingAddrId" : "billingAddrId"]: value,
      [type === "shipping" ? "shippingContactPerson" : "billingContactPerson"]: "",
      [type === "shipping" ? "shippingName" : "billingName"]: "",
      [type === "shipping" ? "shippingContactNumber" : "billingContactNumber"]: "",
      [type === "shipping" ? "shippingEmail" : "billingEmail"]: ""
    }));
    await loadContactPeople(type, value);
  };

  const handlePersonChange = async (type, value) => {
    const options = personOptions[type];
    const selected = options.find((option) => option.value === value);

    setProject((prev) => ({
      ...prev,
      [type === "shipping" ? "shippingContactPerson" : "billingContactPerson"]: value,
      [type === "shipping" ? "shippingName" : "billingName"]:
        value === "other" ? "" : selected?.label || value
    }));

    if (!value || value === "other") {
      return;
    }

    try {
      if (type === "shipping") {
        const result = await fetchText(
          `${API_ROOT}/getShippingDetails.php?shippingAddressId=${encodeURIComponent(value)}`
        );
        const [phone = "", email = "", storeLocation = ""] = result.split("::");

        setProject((prev) => ({
          ...prev,
          shippingName: selected?.label || value,
          shippingContactNumber: phone,
          shippingEmail: email
        }));

        setRows((prevRows) =>
          prevRows.map((row) => ({
            ...row,
            storeLocation: row.storeLocation || storeLocation
          }))
        );
      } else {
        const body = new URLSearchParams({
          billingPersonID: value,
          shippingAddressId: project.shippingAddrId || ""
        });
        const result = await fetchText(`${API_ROOT}/getBillingDetails.php`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString()
        });
        const [phone = "", emailBlob = ""] = result.split("::");
        const email = (emailBlob || "").split("-")[0] || "";

        setProject((prev) => ({
          ...prev,
          billingName: selected?.label || value,
          billingContactNumber: phone,
          billingEmail: email
        }));
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load ${type} contact details`);
    }
  };

  const updateContactProfile = async (type) => {
    const isShipping = type === "shipping";
    const payload = new URLSearchParams(
      isShipping
        ? {
            shippingName: project.shippingName,
            shippingContact12: project.shippingContactNumber,
            shippingEmail12: project.shippingEmail,
            custID: project.custId,
            shippingAddress: project.shippingAddrId
          }
        : {
            billingName: project.billingName,
            billingContact12: project.billingContactNumber,
            billingEmail12: project.billingEmail,
            custID: project.custId,
            billingAddress: project.billingAddrId
          }
    );

    if (!project.custId || !(isShipping ? project.shippingAddrId : project.billingAddrId)) {
      toast.error(`Select customer and ${type} address first`);
      return;
    }

    setSavingContacts((prev) => ({ ...prev, [type]: true }));
    try {
      const endpoint = isShipping
        ? `${API_ROOT}/shippingProfileDataAdd.php`
        : `${API_ROOT}/billingProfileDataAdd.php`;

      await fetchText(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString()
      });

      toast.success(
        isShipping ? "Shipping contact updated successfully" : "Billing contact updated successfully"
      );
      await loadContactPeople(type, isShipping ? project.shippingAddrId : project.billingAddrId);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update ${type} contact`);
    } finally {
      setSavingContacts((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleRowChange = (rowId, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
              ...(field === "fileName" ? { fileExists: null, saved: false } : {}),
              ...(field !== "fileName" ? { saved: false } : {})
            }
          : row
      )
    );
  };

  const handleRowFileChange = (rowId, file) => {
    if (file && !isAllowedFile(file)) {
      toast.error("Invalid File Extension. Upload only PDF and Image file.");
      return;
    }
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === rowId ? { ...row, file, saved: false } : row))
    );
  };

  const handleCommercialChange = (field, value) => {
    setCommercial((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommercialFileChange = (field, file) => {
    if (file && !isAllowedFile(file)) {
      toast.error("Invalid File Extension. Upload only PDF and Image file.");
      return;
    }
    setCommercial((prev) => ({ ...prev, [field]: file || null }));
  };

  const toggleCommercialFlag = (flag) => {
    setCommercial((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleAmcVisitChange = (rowId, value) => {
    const visitCount = Math.max(0, Math.min(5, parseInt(value || "0", 10) || 0));
    if (parseInt(value || "0", 10) > 5) {
      toast.error("Please enter valid visit count");
    }

    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }
        const existingMonths = row.amcMonths || [];
        const nextMonths = Array.from({ length: visitCount }, (_, index) => existingMonths[index] || "");
        return {
          ...row,
          amcVisit: value,
          amcMonths: nextMonths
        };
      })
    );
  };

  const handleAmcMonthChange = (rowId, monthIndex, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }
        const nextMonths = [...(row.amcMonths || [])];
        nextMonths[monthIndex] = value;
        return {
          ...row,
          amcMonths: nextMonths
        };
      })
    );
  };

  const addRelatedFileRow = (sourceRow) => {
    const nextId = rows.length + 1;
    const nextType = isLabourFile(sourceRow)
      ? masterData.file_types.find((item) => String(item.FILE_TYPE_ID) !== "4")
      : masterData.file_types.find((item) => String(item.FILE_TYPE_ID) === "4");

    const nextRow = {
      ...createFileRow(nextId),
      finacialYear: sourceRow.finacialYear || defaultFinancialYear,
      taxType: sourceRow.taxType || defaultTaxType,
      productId: sourceRow.productId,
      projectDescription: sourceRow.projectDescription,
      storeLocation: sourceRow.storeLocation,
      unitLocation: sourceRow.unitLocation,
      fileTypeId: nextType
        ? `${nextType.FILE_TYPE_ID}-${nextType.FILE_TYPE_MAPPING}`
        : ""
    };

    setRows((prevRows) => [...prevRows, nextRow]);
    toast.info("Related file row added. Complete and save it separately.");
  };

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        ...createFileRow(prevRows.length + 1),
        finacialYear: defaultFinancialYear,
        taxType: defaultTaxType,
        storeLocation:
          prevRows.find((row) => row.storeLocation)?.storeLocation || ""
      }
    ]);
  };

  const removeRow = (rowId) => {
    setRows((prevRows) => (prevRows.length === 1 ? prevRows : prevRows.filter((row) => row.id !== rowId)));
    setParentFileOptions((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const checkFileName = async (row) => {
    if (!row.fileName.trim()) {
      return;
    }

    try {
      const payload = {
        actions: ["file_name_count"],
        file_name: row.fileName.trim()
      };
      const result = await fetchJson(MASTER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const count = Number(result.data.file_name_count?.count || 0);

      setRows((prevRows) =>
        prevRows.map((item) =>
          item.id === row.id ? { ...item, fileExists: count > 0 } : item
        )
      );

      if (count > 0) {
        toast.error(`File number ${row.fileName} already exists`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to validate file number");
    }
  };

  const loadParentFiles = async (rowId, fileTypeValue) => {
    if (!fileTypeValue) {
      setParentFileOptions((prev) => ({ ...prev, [rowId]: [] }));
      return;
    }

    try {
      const result = await fetchJson(MASTER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actions: ["parent_files"],
          file_type_value: fileTypeValue
        })
      });

      setParentFileOptions((prev) => ({
        ...prev,
        [rowId]: result.data.parent_files || []
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reference file list");
    }
  };

  const saveProjectHeader = async (overrides = {}) => {
    const payloadData = {
      ...project,
      ...overrides
    };

    if (
      !payloadData.custId ||
      !payloadData.shippingAddrId ||
      !payloadData.billingAddrId ||
      !payloadData.customerAmbassador
    ) {
      toast.error("Select customer, shipping address, billing address, and customer ambassador");
      return;
    }

    setSavingHeader(true);
    try {
      const body = new URLSearchParams({
        custId: payloadData.custId,
        shippingAddrId: payloadData.shippingAddrId,
        billingAddrId: payloadData.billingAddrId,
        shippingContactPerson: payloadData.shippingContactPerson || "",
        billingContactPerson: payloadData.billingContactPerson || "",
        customerAmbassador: payloadData.customerAmbassador || "",
        customerAmbassador1: payloadData.customerAmbassador1 || ""
      });

      const result = await fetchText(`${API_ROOT}/saveprojectfile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });

      if (!result || result === "0") {
        throw new Error("Project header could not be saved");
      }

      setProjectId(result.trim());
      toast.success(`Project header created. Project ID: ${result.trim()}`);
      setTimeout(() => {
        const firstFileInput = document.getElementById("fileName-1");
        if (firstFileInput) {
          firstFileInput.focus();
        }
      }, 150);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save project header");
    } finally {
      setSavingHeader(false);
    }
  };

  const validateCommercialData = () => {
    if (commercial.ABG) {
      if (!commercial.bankGno1 || !commercial.bankGamt1 || !commercial.BGDate1 || !commercial.BGEDate1) {
        toast.error("Complete all ABG details before final save");
        return false;
      }
      if (commercial.file11 && !isAllowedFile(commercial.file11)) {
        toast.error("ABG document must be jpg, jpeg, png, or pdf");
        return false;
      }
    }

    if (commercial.PBG) {
      if (!commercial.bankGno2 || !commercial.bankGamt2 || !commercial.BGDate2 || !commercial.BGEDate2) {
        toast.error("Complete all PBG details before final save");
        return false;
      }
      if (commercial.file12 && !isAllowedFile(commercial.file12)) {
        toast.error("PBG document must be jpg, jpeg, png, or pdf");
        return false;
      }
    }

    if (commercial.PBG1) {
      if (!commercial.bankGno3 || !commercial.bankGamt3 || !commercial.BGDate3 || !commercial.BGEDate3) {
        toast.error("Complete all PBG1 details before final save");
        return false;
      }
      if (commercial.file13 && !isAllowedFile(commercial.file13)) {
        toast.error("PBG1 document must be jpg, jpeg, png, or pdf");
        return false;
      }
    }

    if (commercial.PC && (!commercial.poreceiveDate1 || !commercial.dispatchDate1 || !commercial.penalty1)) {
      toast.error("Complete all PC details before final save");
      return false;
    }

    if (commercial.PC1 && (!commercial.poreceiveDate2 || !commercial.dispatchDate2 || !commercial.penalty2)) {
      toast.error("Complete all PC1 details before final save");
      return false;
    }

    if (commercial.ADV && !commercial.Advanceamt1) {
      toast.error("Enter advance amount for ADV");
      return false;
    }

    if (commercial.AVT1 && !commercial.Advanceamt2) {
      toast.error("Enter advance amount for AVT1");
      return false;
    }

    return true;
  };

  const validateRowData = (row, options = {}) => {
    const { requirePoDocument = true } = options;

    if (!projectId) {
      toast.error("Create the project header first");
      return false;
    }

    if (!row.fileName || !row.fileTypeId || !row.productId) {
      toast.error(`Complete required file metadata in File Row ${row.id}`);
      return false;
    }

    if (row.fileExists) {
      toast.error(`File Row ${row.id} has a duplicate file number`);
      return false;
    }

    if (shouldRequireQuotationDate(row) && !row.quotationDate) {
      toast.error(`Quotation date is required in File Row ${row.id}`);
      return false;
    }

    if (hasPoNumber(row)) {
      const missingPoFields = [];

      if (!row.po_date) {
        missingPoFields.push("PO date");
      }
      if (!row.po_amount) {
        missingPoFields.push("PO basic amount");
      }
      if (!row.taxType) {
        missingPoFields.push("tax type");
      }
      if (requirePoDocument && !row.file) {
        missingPoFields.push("PO document");
      }

      if (missingPoFields.length > 0) {
        toast.error(`${missingPoFields.join(", ")} required in File Row ${row.id}`);
        return false;
      }
    }

    if (isAmcFile(row)) {
      const visitCount = parseInt(row.amcVisit || "0", 10) || 0;
      const validMonths = (row.amcMonths || []).filter(Boolean).length;
      if (!row.amcFrom || !row.amcTo) {
        toast.error(`AMC start and end dates are required in File Row ${row.id}`);
        return false;
      }
      if (visitCount < 1 || visitCount > 5) {
        toast.error(`AMC visit count must be between 1 and 5 in File Row ${row.id}`);
        return false;
      }
      if (validMonths !== visitCount) {
        toast.error(`Please select all AMC visit months in File Row ${row.id}`);
        return false;
      }
    }

    if (row.file && !isAllowedFile(row.file)) {
      toast.error(`Invalid document type in File Row ${row.id}`);
      return false;
    }

    return true;
  };

  const saveRow = async (row) => {
    const ok = validateRowData(row, { requirePoDocument: false });
    if (!ok) {
      return false;
    }

    try {
      setRows((prevRows) =>
        prevRows.map((item) =>
          item.id === row.id ? { ...item, saved: true } : item
        )
      );
      toast.success(`File Row ${row.id} validated`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error(`Failed to validate File Row ${row.id}`);
      return false;
    }
  };

  const saveAllRows = async () => {
    if (!projectId) {
      toast.error("Create the project header first");
      return;
    }

    for (const row of rows) {
      const ok = validateRowData(row, { requirePoDocument: true });
      if (!ok) {
        return;
      }
    }

    if (!validateCommercialData()) {
      return;
    }

    const employeeId =
      sessionStorage.getItem("employeeId") ||
      sessionStorage.getItem("userId") ||
      "";

    const rowsPayload = rows.map((row) => ({
      id: row.id,
      fileName: row.fileName,
      fileTypeId: row.fileTypeId,
      parentFileNo: row.parentFileNo,
      quotationNumber: row.quotationNumber,
      quotationDate: row.quotationDate,
      productId: row.productId,
      projectDescription: row.projectDescription,
      storeLocation: row.storeLocation,
      unitLocation: row.unitLocation,
      finacialYear: row.finacialYear,
      po_number: row.po_number,
      po_date: row.po_date,
      po_amount: row.po_amount,
      lb_amount: row.lb_amount,
      cashAmount: row.cashAmount,
      taxType: row.taxType,
      comment: row.comment,
      amcFrom: row.amcFrom,
      amcTo: row.amcTo,
      amcVisit: row.amcVisit,
      amcMonths: row.amcMonths,
      mae: row.mae,
      eea: row.eea
    }));

    const commercialPayload = {
      ...commercial,
      file11: undefined,
      file12: undefined,
      file13: undefined
    };

    const formData = new FormData();
    formData.append("projectidset11", projectId);
    formData.append("projectId", projectId);
    formData.append("custId", project.custId);
    formData.append("shippingAddrId", project.shippingAddrId);
    formData.append("billingAddrId", project.billingAddrId);
    formData.append("shippingContactPerson", project.shippingContactPerson || "");
    formData.append("billingContactPerson", project.billingContactPerson || "");
    formData.append("shippingName", project.shippingName || "");
    formData.append("billingName", project.billingName || "");
    formData.append("shippingContactNumber", project.shippingContactNumber || "");
    formData.append("shippingEmail", project.shippingEmail || "");
    formData.append("billingContactNumber", project.billingContactNumber || "");
    formData.append("billingEmail", project.billingEmail || "");
    formData.append("employeeId", employeeId);
    formData.append("rowsPayload", JSON.stringify(rowsPayload));
    formData.append("commercialPayload", JSON.stringify(commercialPayload));

    rows.forEach((row) => {
      if (row.file) {
        formData.append(`rowFile_${row.id}`, row.file);
      }
    });
    if (commercial.file11) {
      formData.append("commercial_file11", commercial.file11);
    }
    if (commercial.file12) {
      formData.append("commercial_file12", commercial.file12);
    }
    if (commercial.file13) {
      formData.append("commercial_file13", commercial.file13);
    }

    setFinalSubmitting(true);
    try {
      const response = await fetch(`${API_ROOT}/finalsave.php`, {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Final save failed");
      }

      setRows((prevRows) => prevRows.map((row) => ({ ...row, saved: true })));
      if (Array.isArray(result.duplicates) && result.duplicates.length > 0) {
        toast.warn(`Saved with skipped duplicate file names: ${result.duplicates.join(", ")}`);
      }
      setPostSaveModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save project");
    } finally {
      setFinalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{ADD_PROJECT_PAGE_STYLES}</style>
        <div className="add-project-page ap-loading d-flex align-items-center justify-content-center px-3">
          <div className="ap-loading-inner text-center">
            <Spinner animation="border" variant="primary" />
            <div className="mt-3 fw-semibold text-secondary">Loading Add Project…</div>
            <div className="small text-muted mt-1">Fetching customers, addresses, and master data</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{ADD_PROJECT_PAGE_STYLES}</style>
      <Container fluid className="add-project-page py-4 px-2 px-sm-3 px-lg-4 w-100" style={{ maxWidth: "100%" }}>
        <ToastContainer position="bottom-right" />

        <Modal
          show={postSaveModalOpen}
          onHide={() => {}}
          centered
          backdrop="static"
          keyboard={false}
          contentClassName="border-0 shadow"
        >
          <Modal.Header closeButton={false} className="border-0 pb-0">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <span className="text-success">
                <i className="bi bi-check-circle-fill" aria-hidden />
              </span>
              Project saved
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2">
            <p className="mb-0 text-secondary">
              Do you want to add a <strong className="text-dark">new project</strong>? Choose an option below.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 d-flex flex-wrap gap-2 justify-content-end">
            <Button variant="outline-secondary" onClick={handlePostSaveGoToList}>
              <i className="bi bi-list-ul me-2" aria-hidden />
              No, go to project list
            </Button>
            <Button variant="primary" onClick={handlePostSaveAddNew}>
              <i className="bi bi-plus-lg me-2" aria-hidden />
              Yes, add new project
            </Button>
          </Modal.Footer>
        </Modal>

        <Row className="g-3 mb-4">
          <Col lg={12}>
            <Card className="ap-surface ap-hero h-100">
              <Card.Body className="p-4">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                  <div>
                    <div className="text-uppercase small fw-semibold ap-hero-kicker">Marketing · Project</div>
                    <h2 className="mb-2 ap-hero-title">Add Project</h2>
                    <p className="mb-0 ap-hero-desc">
                      Set up the project header and contacts, complete each file row and commercial terms, then review the{" "}
                      <strong className="text-white">financial summary</strong> at the bottom and click{" "}
                      <strong className="text-white">Final Save Project</strong>.
                    </p>
                    <div className="ap-steps d-flex flex-wrap gap-2">
                      <span className="ap-step">
                        <i className="bi bi-1-circle-fill" aria-hidden />
                        Header &amp; contacts
                      </span>
                      <span className="ap-step">
                        <i className="bi bi-2-circle-fill" aria-hidden />
                        File rows
                      </span>
                      <span className="ap-step">
                        <i className="bi bi-3-circle-fill" aria-hidden />
                        Commercial terms
                      </span>
                      <span className="ap-step">
                        <i className="bi bi-check2-circle" aria-hidden />
                        Final save
                      </span>
                    </div>
                  </div>
                  <div className="d-flex flex-column flex-sm-row flex-wrap align-items-stretch align-items-sm-center gap-2">
                    <Badge bg={projectId ? "success" : "secondary"} className="px-3 py-2 fs-6 align-self-center">
                      {projectId ? `Project ID: ${projectId}` : "Step 1: Save header"}
                    </Badge>
                    <Button variant="primary" onClick={saveProjectHeader} disabled={savingHeader}>
                      {savingHeader ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2" aria-hidden />
                          Save Project Header
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="ap-surface mb-4">
          <Card.Header className="ap-section-header px-4">
            <h5>
              <i className="bi bi-building" aria-hidden />
              Project details
            </h5>
          </Card.Header>
        <Card.Body className="px-4 pb-4">
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Company Name</Form.Label>
                <Form.Select value={project.custId} onChange={handleCustomerChange}>
                  <option value="">Select Company Name</option>
                  {masterData.customers.map((customer) => (
                    <option key={customer.CUSTOMER_ID} value={customer.CUSTOMER_ID}>
                      {customer.CUSTOMER_NAME}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Shipping Address</Form.Label>
                <Form.Select
                  value={project.shippingAddrId}
                  onChange={(event) => handleAddressChange("shipping", event.target.value)}
                >
                  <option value="">Select Shipping Address</option>
                  {addressOptions.shipping.map((address) => (
                    <option key={address.ADDRESS_ID} value={address.ADDRESS_ID}>
                      {address.DETAIL_ADDRESS || address.address_label || `Address #${address.ADDRESS_ID}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Billing Address</Form.Label>
                <Form.Select
                  value={project.billingAddrId}
                  onChange={(event) => handleAddressChange("billing", event.target.value)}
                >
                  <option value="">Select Billing Address</option>
                  {addressOptions.billing.map((address) => (
                    <option key={address.ADDRESS_ID} value={address.ADDRESS_ID}>
                      {address.DETAIL_ADDRESS || address.address_label || `Address #${address.ADDRESS_ID}`}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Shipping Contact Person</Form.Label>
                <Form.Select
                  value={project.shippingContactPerson}
                  onChange={(event) => handlePersonChange("shipping", event.target.value)}
                >
                  <option value="">Select Shipping Person</option>
                  {personOptions.shipping.map((person) => (
                    <option key={`${person.value}-${person.label}`} value={person.value}>
                      {person.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Billing Contact Person</Form.Label>
                <Form.Select
                  value={project.billingContactPerson}
                  onChange={(event) => handlePersonChange("billing", event.target.value)}
                >
                  <option value="">Select Billing Person</option>
                  {personOptions.billing.map((person) => (
                    <option key={`${person.value}-${person.label}`} value={person.value}>
                      {person.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mt-1">
            <Col lg={6}>
              <Card className="h-100 ap-nested-card">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-truck text-primary me-2" aria-hidden />
                      Shipping contact
                    </h6>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => updateContactProfile("shipping")}
                      disabled={savingContacts.shipping}
                    >
                      {savingContacts.shipping ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-repeat me-1" aria-hidden />
                          Update
                        </>
                      )}
                    </Button>
                  </div>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          value={project.shippingName}
                          onChange={(event) => handleProjectChange("shippingName", event.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                          value={project.shippingContactNumber}
                          onChange={(event) =>
                            handleProjectChange("shippingContactNumber", event.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          value={project.shippingEmail}
                          onChange={(event) => handleProjectChange("shippingEmail", event.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="h-100 ap-nested-card">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0">
                      <i className="bi bi-receipt text-primary me-2" aria-hidden />
                      Billing contact
                    </h6>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => updateContactProfile("billing")}
                      disabled={savingContacts.billing}
                    >
                      {savingContacts.billing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-repeat me-1" aria-hidden />
                          Update
                        </>
                      )}
                    </Button>
                  </div>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          value={project.billingName}
                          onChange={(event) => handleProjectChange("billingName", event.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                          value={project.billingContactNumber}
                          onChange={(event) =>
                            handleProjectChange("billingContactNumber", event.target.value)
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          value={project.billingEmail}
                          onChange={(event) => handleProjectChange("billingEmail", event.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mt-1 align-items-end">
            <Col lg={12}>
              <Form.Group>
                <Form.Label>Customer ambassador</Form.Label>
                <div className="d-flex flex-wrap gap-2 gap-md-3 mt-2 ap-ambassador-strip">
                  {STATIC_AMBASSADORS.map((value) => (
                    <Form.Check
                      inline
                      key={value}
                      type="radio"
                      name="customerAmbassador"
                      id={`ambassador-${value}`}
                      label={value}
                      checked={project.customerAmbassador === value}
                      onChange={() => handleAmbassadorSelection(value)}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="ap-surface ap-file-details-card">
        <Card.Header className="ap-section-header px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0">
            <i className="bi bi-folder2-open" aria-hidden />
            File details
            <small>One card per file line — validate each row, then use final save at the bottom.</small>
          </h5>
          <Button variant="primary" size="sm" className="rounded-pill px-3" onClick={addRow}>
            <i className="bi bi-plus-lg me-1" aria-hidden />
            Add file row
          </Button>
        </Card.Header>
        <Card.Body className="px-4 pb-4">
          {!projectId && (
            <Alert variant="warning" className="border-0 shadow-sm">
              <div className="fw-semibold mb-1">
                <i className="bi bi-info-circle me-2" aria-hidden />
                Save the project header first
              </div>
              <div className="small mb-0">
                After the header is created, fill in each file row, use <strong>Validate Row</strong> to check a line, then review the{" "}
                <strong>financial summary</strong> at the bottom and click <strong>Final Save Project</strong> to submit all rows and commercial data together.
              </div>
            </Alert>
          )}

          <div className="d-grid gap-4">
            {rows.map((row) => {
              const taxAmount = (parseNumber(row.po_amount) * getTaxPercent(row.taxType)) / 100;
              const totalAmount = parseNumber(row.po_amount) + taxAmount;
              const rowParentOptions = parentFileOptions[row.id] || [];
              const amcRow = isAmcFile(row);
              const poEnabled = hasPoNumber(row);
              const labourLabel = relatedFileLabel(row);
              const materialAllocatedExpense = formatCurrency(parseNumber(row.po_amount) * 0.6);

              return (
                <Card key={row.id} className="ap-file-row border-0">
                  <Card.Body className="p-0">
                    <div className="ap-file-row-head">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="fw-bold text-dark">
                          <i className="bi bi-file-earmark-text text-primary me-2" aria-hidden />
                          File row {row.id}
                        </span>
                        {row.saved && (
                          <Badge bg="success" className="rounded-pill">
                            <i className="bi bi-check2 me-1" aria-hidden />
                            Validated
                          </Badge>
                        )}
                        {row.fileExists === true && (
                          <Badge bg="danger" className="rounded-pill">
                            Duplicate file no.
                          </Badge>
                        )}
                        {amcRow && (
                          <Badge bg="info" className="text-dark rounded-pill">
                            AMC
                          </Badge>
                        )}
                        {isLabourFile(row) && (
                          <Badge bg="secondary" className="rounded-pill">
                            Labour
                          </Badge>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-pill px-3"
                          onClick={() => saveRow(row)}
                          disabled={finalSubmitting}
                        >
                          <i className="bi bi-check2-circle me-1" aria-hidden />
                          Validate row
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="rounded-pill px-3"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length === 1}
                        >
                          <i className="bi bi-trash me-1" aria-hidden />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="ap-file-row-body">
                    <div className="ap-subsection-title">
                      <i className="bi bi-tag" aria-hidden />
                      File &amp; product
                    </div>
                    <Row className="g-3">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>File Name</Form.Label>
                          <Form.Control
                            id={`fileName-${row.id}`}
                            value={row.fileName}
                            onChange={(event) =>
                              handleRowChange(row.id, "fileName", event.target.value.toUpperCase())
                            }
                            onBlur={() => checkFileName(row)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>File Type</Form.Label>
                          <Form.Select
                            value={row.fileTypeId}
                            onChange={async (event) => {
                              const value = event.target.value;
                              handleRowChange(row.id, "fileTypeId", value);
                              handleRowChange(row.id, "parentFileNo", "");
                              await loadParentFiles(row.id, value);
                            }}
                          >
                            <option value="">Select File Type</option>
                            {masterData.file_types.map((fileType) => (
                              <option
                                key={fileType.FILE_TYPE_ID}
                                value={`${fileType.FILE_TYPE_ID}-${fileType.FILE_TYPE_MAPPING}`}
                              >
                                {fileType.FILE_TYPE_NAME}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Reference File Name</Form.Label>
                          <Form.Select
                            value={row.parentFileNo}
                            onChange={(event) =>
                              handleRowChange(row.id, "parentFileNo", event.target.value)
                            }
                          >
                            <option value="">Select Parent File</option>
                            {rowParentOptions.map((parent) => (
                              <option key={parent.FILE_ID} value={parent.FILE_ID}>
                                {parent.FILE_NAME}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Product Type</Form.Label>
                          <Form.Select
                            value={row.productId}
                            onChange={(event) =>
                              handleRowChange(row.id, "productId", event.target.value)
                            }
                          >
                            <option value="">Select Product Type</option>
                            {masterData.products.map((product) => (
                              <option key={product.PRODUCT_ID} value={product.PRODUCT_ID}>
                                {product.PRODUCT_NAME}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="ap-subsection-title">
                      <i className="bi bi-file-text" aria-hidden />
                      Quotation &amp; period
                    </div>
                    <Row className="g-3 mt-1">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Quotation Number</Form.Label>
                          <Form.Control
                            value={row.quotationNumber}
                            onChange={(event) =>
                              handleRowChange(row.id, "quotationNumber", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Quotation Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={row.quotationDate}
                            disabled={!shouldRequireQuotationDate(row)}
                            required={shouldRequireQuotationDate(row)}
                            onChange={(event) =>
                              handleRowChange(row.id, "quotationDate", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Financial Year</Form.Label>
                          <Form.Select
                            value={row.finacialYear}
                            onChange={(event) =>
                              handleRowChange(row.id, "finacialYear", event.target.value)
                            }
                          >
                            <option value="">Select Financial Year</option>
                            {masterData.financial_years.map((year) => (
                              <option key={year.id || year.financial_year} value={year.financial_year}>
                                {year.financial_year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="g-3 mt-1">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Product Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={row.projectDescription}
                            onChange={(event) =>
                              handleRowChange(row.id, "projectDescription", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Store Location</Form.Label>
                          <Form.Control
                            value={row.storeLocation}
                            onChange={(event) =>
                              handleRowChange(row.id, "storeLocation", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>{amcRow ? "Unit Location" : "Unit Location"}</Form.Label>
                          <Form.Control
                            value={row.unitLocation}
                            onChange={(event) =>
                              handleRowChange(row.id, "unitLocation", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {!amcRow ? (
                      <>
                        <div className="ap-subsection-title">
                          <i className="bi bi-receipt-cutoff" aria-hidden />
                          Purchase order
                        </div>
                        <Row className="g-3 mt-1">
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Number</Form.Label>
                              <Form.Control
                                value={row.po_number}
                                onChange={(event) =>
                                  handleRowChange(row.id, "po_number", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={row.po_date}
                                disabled={!poEnabled}
                                required={poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "po_date", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Document</Form.Label>
                              <Form.Control
                                type="file"
                                disabled={poFieldDisabled(row)}
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(event) =>
                                  handleRowFileChange(row.id, event.target.files?.[0] || null)
                                }
                              />
                              <Form.Text className="text-muted">PDF or image (jpg, png)</Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Basic Amount</Form.Label>
                              <Form.Control
                                value={row.po_amount}
                                disabled={!poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "po_amount", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="g-3 mt-1">
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>Freight Charges</Form.Label>
                              <Form.Control
                                value={row.lb_amount}
                                disabled={!poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "lb_amount", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>Amount In Cash</Form.Label>
                              <Form.Control
                                value={row.cashAmount}
                                disabled={!poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "cashAmount", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="ap-subsection-title">
                          <i className="bi bi-percent" aria-hidden />
                          Tax &amp; totals
                        </div>
                        <Row className="g-3 mt-1">
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Tax Type</Form.Label>
                              <Form.Select
                                value={row.taxType}
                                disabled={!poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "taxType", event.target.value)
                                }
                              >
                                <option value="">Select Tax Type</option>
                                {masterData.tax_types.map((tax) => (
                                  <option key={tax.TAX_ID} value={`${tax.TAX_ID}-${tax.TAX_PERCENTAGE}`}>
                                    {tax.TAX_NAME}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Tax Amount</Form.Label>
                              <Form.Control readOnly value={formatCurrency(taxAmount)} />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>PO Amount With Tax</Form.Label>
                              <Form.Control readOnly value={formatCurrency(totalAmount)} />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row className="g-3 mt-1">
                          <Col md={12}>
                            <Form.Group>
                              <Form.Label>Comment</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={row.comment}
                                onChange={(event) =>
                                  handleRowChange(row.id, "comment", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    ) : (
                      <>
                        <Card className="ap-nested-card mt-3">
                          <Card.Body>
                            <div className="small text-uppercase text-muted fw-semibold mb-3" style={{ letterSpacing: "0.05em" }}>
                              <i className="bi bi-calendar-range me-2 text-primary" aria-hidden />
                              AMC contract
                            </div>
                            <Row className="g-3">
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>AMC Start Date</Form.Label>
                                  <Form.Control
                                    type="month"
                                    value={row.amcFrom}
                                    onChange={(event) =>
                                      handleRowChange(row.id, "amcFrom", event.target.value)
                                    }
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>AMC Expire Date</Form.Label>
                                  <Form.Control
                                    type="month"
                                    value={row.amcTo}
                                    onChange={(event) =>
                                      handleRowChange(row.id, "amcTo", event.target.value)
                                    }
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Total Visit No</Form.Label>
                                  <Form.Control
                                    value={row.amcVisit}
                                    onChange={(event) =>
                                      handleAmcVisitChange(row.id, event.target.value)
                                    }
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Marketing Allocated Expense</Form.Label>
                                  <Form.Control
                                    readOnly
                                    value={row.mae || materialAllocatedExpense}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Expected Estimation AMC</Form.Label>
                                  <Form.Control
                                    value={row.eea}
                                    onChange={(event) =>
                                      handleRowChange(row.id, "eea", event.target.value)
                                    }
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={9}>
                                <Form.Label>AMC Visit Months</Form.Label>
                                <Row className="g-2">
                                  {(row.amcMonths || []).map((month, monthIndex) => (
                                    <Col md={3} key={`${row.id}-amc-${monthIndex}`}>
                                      <Form.Control
                                        type="month"
                                        value={month}
                                        onChange={(event) =>
                                          handleAmcMonthChange(row.id, monthIndex, event.target.value)
                                        }
                                      />
                                    </Col>
                                  ))}
                                </Row>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>

                        <div className="ap-subsection-title">
                          <i className="bi bi-receipt-cutoff" aria-hidden />
                          Purchase order
                        </div>
                        <Row className="g-3 mt-1">
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Number</Form.Label>
                              <Form.Control
                                value={row.po_number}
                                onChange={(event) =>
                                  handleRowChange(row.id, "po_number", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Date</Form.Label>
                              <Form.Control
                                type="date"
                                value={row.po_date}
                                disabled={!poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "po_date", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Document</Form.Label>
                              <Form.Control
                                type="file"
                                disabled={poFieldDisabled(row)}
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(event) =>
                                  handleRowFileChange(row.id, event.target.files?.[0] || null)
                                }
                              />
                              <Form.Text className="text-muted">PDF or image (jpg, png)</Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>PO Basic Amount</Form.Label>
                              <Form.Control
                                value={row.po_amount}
                                disabled={!poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "po_amount", event.target.value)
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="ap-subsection-title">
                          <i className="bi bi-percent" aria-hidden />
                          Tax &amp; totals
                        </div>
                        <Row className="g-3 mt-1">
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Tax Type</Form.Label>
                              <Form.Select
                                value={row.taxType}
                                disabled={!poEnabled}
                                onChange={(event) =>
                                  handleRowChange(row.id, "taxType", event.target.value)
                                }
                              >
                                <option value="">Select Tax Type</option>
                                {masterData.tax_types.map((tax) => (
                                  <option key={tax.TAX_ID} value={`${tax.TAX_ID}-${tax.TAX_PERCENTAGE}`}>
                                    {tax.TAX_NAME}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Tax Amount</Form.Label>
                              <Form.Control readOnly value={formatCurrency(taxAmount)} />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>PO Amount With Tax</Form.Label>
                              <Form.Control readOnly value={formatCurrency(totalAmount)} />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    )}

                    <div className="ap-subsection-title">
                      <i className="bi bi-link-45deg" aria-hidden />
                      Linked file
                    </div>
                    <Card className="ap-nested-card mt-1">
                      <Card.Body className="py-3">
                        <div className="fw-semibold mb-2 text-secondary small text-uppercase">{labourLabel}</div>
                        <div className="d-flex flex-wrap gap-3 align-items-center">
                          <Form.Check
                            inline
                            type="radio"
                            id={`related-no-${row.id}`}
                            name={`related-file-choice-${row.id}`}
                            label="No"
                            checked={row.relatedFileChoice !== "yes"}
                            onChange={() => handleRowChange(row.id, "relatedFileChoice", "no")}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            id={`related-yes-${row.id}`}
                            name={`related-file-choice-${row.id}`}
                            label="Yes"
                            checked={row.relatedFileChoice === "yes"}
                            onChange={() => {
                              handleRowChange(row.id, "relatedFileChoice", "yes");
                              addRelatedFileRow(row);
                            }}
                          />
                        </div>
                      </Card.Body>
                    </Card>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <Card className="ap-surface mt-4">
        <Card.Header className="ap-section-header px-4">
          <h5>
            <i className="bi bi-shield-check" aria-hidden />
            Commercial conditions
          </h5>
        </Card.Header>
        <Card.Body className="px-4 pb-4">
          <Row className="g-3 align-items-start">
            <Col xs={12}>
              <div className="small text-muted fw-semibold text-uppercase mb-2" style={{ letterSpacing: "0.06em" }}>
                Applicable terms
              </div>
              <div className="ap-commercial-toggles">
                {["ABG", "PBG", "PBG1", "PC", "PC1", "ADV", "AVT1"].map((flag) => (
                  <Form.Check
                    key={flag}
                    type="checkbox"
                    id={`commercial-${flag}`}
                    label={flag === "PC" ? "Penalty clause" : flag === "PC1" ? "Penalty clause 2" : flag}
                    checked={commercial[flag]}
                    onChange={() => toggleCommercialFlag(flag)}
                  />
                ))}
              </div>
            </Col>
            <Col xs={12}>
              <Alert variant="light" className="mb-0 border ap-nested-card">
                <div className="fw-semibold text-dark mb-1">
                  <i className="bi bi-lightbulb text-warning me-2" aria-hidden />
                  How this works
                </div>
                <div className="small text-secondary mb-0">
                  Tick the conditions that apply. Extra fields appear below. Everything in this section is saved when you click{" "}
                  <strong>Final Save Project</strong> (with your file rows).
                </div>
              </Alert>
            </Col>
          </Row>

          {commercial.ABG && (
            <Card className="ap-subcard mt-3">
              <Card.Body>
                <h6>
                  <i className="bi bi-bank me-2 text-primary" aria-hidden />
                  ABG details
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee No</Form.Label>
                      <Form.Control value={commercial.bankGno1} onChange={(e) => handleCommercialChange("bankGno1", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Amount</Form.Label>
                      <Form.Control value={commercial.bankGamt1} onChange={(e) => handleCommercialChange("bankGamt1", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Date</Form.Label>
                      <Form.Control type="date" value={commercial.BGDate1} onChange={(e) => handleCommercialChange("BGDate1", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Exp Date</Form.Label>
                      <Form.Control type="date" value={commercial.BGEDate1} onChange={(e) => handleCommercialChange("BGEDate1", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Claim Date</Form.Label>
                      <Form.Control type="date" value={commercial.BCdate1} onChange={(e) => handleCommercialChange("BCdate1", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Upload Bank Document</Form.Label>
                      <Form.Control type="file" onChange={(e) => handleCommercialFileChange("file11", e.target.files?.[0] || null)} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {commercial.PBG && (
            <Card className="ap-subcard mt-3">
              <Card.Body>
                <h6>
                  <i className="bi bi-bank2 me-2 text-primary" aria-hidden />
                  PBG details
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee No</Form.Label>
                      <Form.Control value={commercial.bankGno2} onChange={(e) => handleCommercialChange("bankGno2", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Amount</Form.Label>
                      <Form.Control value={commercial.bankGamt2} onChange={(e) => handleCommercialChange("bankGamt2", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Date</Form.Label>
                      <Form.Control type="date" value={commercial.BGDate2} onChange={(e) => handleCommercialChange("BGDate2", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Exp Date</Form.Label>
                      <Form.Control type="date" value={commercial.BGEDate2} onChange={(e) => handleCommercialChange("BGEDate2", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Claim Date</Form.Label>
                      <Form.Control type="date" value={commercial.BCdate2} onChange={(e) => handleCommercialChange("BCdate2", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Upload Bank Document</Form.Label>
                      <Form.Control type="file" onChange={(e) => handleCommercialFileChange("file12", e.target.files?.[0] || null)} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {commercial.PBG1 && (
            <Card className="ap-subcard mt-3">
              <Card.Body>
                <h6>
                  <i className="bi bi-bank me-2 text-primary" aria-hidden />
                  PBG1 details
                </h6>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee No</Form.Label>
                      <Form.Control value={commercial.bankGno3} onChange={(e) => handleCommercialChange("bankGno3", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Amount</Form.Label>
                      <Form.Control value={commercial.bankGamt3} onChange={(e) => handleCommercialChange("bankGamt3", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Date</Form.Label>
                      <Form.Control type="date" value={commercial.BGDate3} onChange={(e) => handleCommercialChange("BGDate3", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Exp Date</Form.Label>
                      <Form.Control type="date" value={commercial.BGEDate3} onChange={(e) => handleCommercialChange("BGEDate3", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Guarantee Claim Date</Form.Label>
                      <Form.Control type="date" value={commercial.BCdate3} onChange={(e) => handleCommercialChange("BCdate3", e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Upload Bank Document</Form.Label>
                      <Form.Control type="file" onChange={(e) => handleCommercialFileChange("file13", e.target.files?.[0] || null)} />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {(commercial.PC || commercial.PC1) && (
            <Row className="g-3 mt-2">
              {commercial.PC && (
                <Col lg={6}>
                  <Card className="ap-subcard mt-2">
                    <Card.Body>
                      <h6>
                        <i className="bi bi-exclamation-triangle me-2 text-warning" aria-hidden />
                        Penalty clause
                      </h6>
                      <Row className="g-3">
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>PO Receive Date</Form.Label>
                            <Form.Control type="date" value={commercial.poreceiveDate1} onChange={(e) => handleCommercialChange("poreceiveDate1", e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Dispatch Date</Form.Label>
                            <Form.Control type="date" value={commercial.dispatchDate1} onChange={(e) => handleCommercialChange("dispatchDate1", e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Penalty Clause in(%)</Form.Label>
                            <Form.Control value={commercial.penalty1} onChange={(e) => handleCommercialChange("penalty1", e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              {commercial.PC1 && (
                <Col lg={6}>
                  <Card className="ap-subcard mt-2">
                    <Card.Body>
                      <h6>
                        <i className="bi bi-exclamation-triangle me-2 text-warning" aria-hidden />
                        Penalty clause 2
                      </h6>
                      <Row className="g-3">
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>PO Receive Date</Form.Label>
                            <Form.Control type="date" value={commercial.poreceiveDate2} onChange={(e) => handleCommercialChange("poreceiveDate2", e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Dispatch Date</Form.Label>
                            <Form.Control type="date" value={commercial.dispatchDate2} onChange={(e) => handleCommercialChange("dispatchDate2", e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Penalty Clause in(%)</Form.Label>
                            <Form.Control value={commercial.penalty2} onChange={(e) => handleCommercialChange("penalty2", e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          )}

          {(commercial.ADV || commercial.AVT1) && (
            <Row className="g-3 mt-2">
              {commercial.ADV && (
                <Col lg={6}>
                  <Card className="ap-subcard mt-2">
                    <Card.Body>
                      <h6>
                        <i className="bi bi-cash-stack me-2 text-success" aria-hidden />
                        Advance amount (ADV)
                      </h6>
                      <Form.Group>
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          value={commercial.Advanceamt1}
                          onChange={(e) => handleCommercialChange("Advanceamt1", e.target.value)}
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              {commercial.AVT1 && (
                <Col lg={6}>
                  <Card className="ap-subcard mt-2">
                    <Card.Body>
                      <h6>
                        <i className="bi bi-cash-stack me-2 text-success" aria-hidden />
                        Advance amount (AVT1)
                      </h6>
                      <Form.Group>
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          value={commercial.Advanceamt2}
                          onChange={(e) => handleCommercialChange("Advanceamt2", e.target.value)}
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </Card.Body>
      </Card>

      <Card className="ap-surface ap-footer-summary mt-4 mb-3">
        <Card.Body className="p-4">
          <Row className="g-4 align-items-stretch">
            <Col xs={12}>
              <div className="ap-summary-title mb-1">Financial summary</div>
              <p className="small text-muted mb-3">
                Totals reflect the file rows above (PO basics, tax, material vs labour split, and cash lines).
              </p>
              <Row className="g-2">
                <Col xs={12} sm={6} md={2}>
                  <div className="ap-summary-row">
                    <span className="text-secondary">Total basic</span>
                    <strong>₹ {formatCurrency(totals.basic)}</strong>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={2}>
                  <div className="ap-summary-row">
                    <span className="text-secondary">Total tax</span>
                    <strong>₹ {formatCurrency(totals.tax)}</strong>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={2}>
                  <div className="ap-summary-row">
                    <span className="text-secondary">Total with tax</span>
                    <strong>₹ {formatCurrency(totals.total)}</strong>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={2}>
                  <div className="ap-summary-row">
                    <span className="text-secondary">Material total</span>
                    <strong>₹ {formatCurrency(totals.material)}</strong>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={2}>
                  <div className="ap-summary-row">
                    <span className="text-secondary">Labour total</span>
                    <strong>₹ {formatCurrency(totals.labour)}</strong>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={2}>
                  <div className="ap-summary-row">
                    <span className="text-secondary">Cash amount</span>
                    <strong>₹ {formatCurrency(totals.cash)}</strong>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col xs={12} className="ap-footer-actions d-flex flex-column flex-md-row flex-wrap align-items-stretch align-items-md-center justify-content-md-between gap-3 pt-2 pt-md-3 mt-2 mt-md-0 border-top">
              <div className="flex-grow-1" style={{ minWidth: "min(100%, 280px)" }}>
                <div className="fw-semibold text-dark mb-1">Submit project</div>
                <p className="small text-muted mb-0">
                  Saves project header data, all file rows, PO uploads, and commercial conditions in one request.
                </p>
              </div>
              <div className="d-flex flex-column align-items-stretch align-items-md-end gap-2">
                <Button variant="success" size="lg" className="w-100" style={{ maxWidth: "22rem" }} onClick={saveAllRows} disabled={!projectId || finalSubmitting}>
                  {finalSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-upload me-2" aria-hidden />
                      Final Save Project
                    </>
                  )}
                </Button>
                {!projectId && (
                  <p className="small text-warning mb-0 text-md-end">
                    <i className="bi bi-lock me-1" aria-hidden />
                    Save the project header first to enable final save.
                  </p>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      </Container>
    </>
  );
}

export default AddProjectPage;
