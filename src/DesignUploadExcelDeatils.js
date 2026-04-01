import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DesignExcelUpload() {
  const { fileId, fileName } = useParams();

  const [revisions, setRevisions] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState("");
  const [sheetList, setSheetList] = useState([]);
  const [sheetName, setSheetName] = useState("");
  const [tableHtml, setTableHtml] = useState("");
  const [fpUploaded, setFpUploaded] = useState(null);
  const [isForwarded, setIsForwarded] = useState(false);
  const [file, setFile] = useState(null);
const [comment, setComment] = useState("");
const [uploading, setUploading] = useState(false);
  /* =========================
     1️⃣ INITIAL LOAD (Latest Revision)
  ========================= */
  const handleUpload = () => {
    if (!file) {
      alert("Please select file");
      return;
    }
  
    const formData = new FormData();
  
    formData.append("file", file);
    formData.append("FILE_ID", fileId);
    formData.append("excelType", "design_excel");
    formData.append("commentbox", comment); // optional
    setUploading(true);
    fetch(
      "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/design/printableexcelUpload.php",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setUploading(false);
        console.log("✅ Upload Response:", data);
  
        alert(data.status || "Uploaded");
  
        // reload data instead of full page reload
        window.location.reload(); // (or better: re-fetch APIs)
      })
      .catch((err) => {
        console.error("❌ Upload Error:", err);
      });
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  useEffect(() => {
  if (!fileId) return;

  fetch("https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/design/check_fp_status.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      FILE_ID: fileId,
      excel_type: "design_excel",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("✅ FP STATUS:", data);

      setFpUploaded(data.fp_uploaded);
      setIsForwarded(data.forwarded);
    });
}, [fileId]);
  useEffect(() => {
    if (!fileId) return;

    fetch(
      "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/design/revisionwiseData.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          FILE_ID: fileId,
          excel_type: "design_excel",
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ INITIAL DATA:", data);

        const revs = data.revisions || [];
        setRevisions(revs);

        // 🔥 latest revision
        const latestRev =
          data.last_revision ?? (revs.length > 0 ? revs[0] : "0");

        setSelectedRevision(String(latestRev));

        const sheets = data.sheet_list || [];
        setSheetList(sheets);

        if (sheets.length > 0) {
          setSheetName(sheets[0]);
        }
      })
      .catch((err) => console.error("❌ Initial Load Error:", err));
  }, [fileId]);

  /* =========================
     2️⃣ REVISION CHANGE
  ========================= */
  useEffect(() => {
    if (selectedRevision === "") return;

    fetch(
      "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/design/revisionwiseData.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          FILE_ID: fileId,
          revision: selectedRevision,
          excel_type: "design_excel",
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("🔄 Revision Change:", data);

        const sheets = data.sheet_list || [];
        setSheetList(sheets);

        if (sheets.length > 0) {
          setSheetName(sheets[0]);
        }
      })
      .catch((err) => console.error("❌ Revision Load Error:", err));
  }, [selectedRevision, fileId]);

  /* =========================
     3️⃣ TABLE LOAD
  ========================= */
  useEffect(() => {
    if (selectedRevision === "" || sheetName === "") return;

    console.log("🔥 CALL TABLE API:", {
      fileId,
      selectedRevision,
      sheetName,
    });

    fetch(
      "https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/design/getrevisiontable.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          FILE_ID: fileId,
          revision: selectedRevision,
          excel_type: "design_excel",
          sheetname: sheetName,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ TABLE RESPONSE:", data);
        setTableHtml(data.html || "<p>No data</p>");
      })
      .catch((err) => console.error("❌ Table Load Error:", err));
  }, [selectedRevision, sheetName, fileId]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="card p-2">
      {uploading && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: "30px 40px",
        borderRadius: "10px",
        textAlign: "center",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="spinner-border text-danger mb-3"
        style={{ width: "3rem", height: "3rem" }}
      ></div>

      <h5 style={{ margin: 0 }}>Uploading File...</h5>
      <small>Please wait, do not refresh</small>
    </div>
  </div>
)}
      <h5>Upload Design Excel ({fileName})</h5>

      {/* ================= Revision Tabs ================= */}
      <ul className="nav nav-tabs mb-2">
        {revisions.map((rev) => (
          <li key={rev} className="nav-item">
            <button
              className={`nav-link ${
                String(rev) === String(selectedRevision) ? "active" : ""
              }`}
              onClick={() => setSelectedRevision(String(rev))}
            >
              Revision-{rev}
            </button>
          </li>
        ))}
      </ul>

      {/* ================= Sheet Tabs ================= */}
      <ul className="nav nav-pills mb-2">
        {sheetList.map((sheet) => (
          <li key={sheet} className="nav-item">
            <button
              className={`nav-link ${
                sheet === sheetName ? "active" : ""
              }`}
              onClick={() => setSheetName(sheet)}
            >
              {sheet}
            </button>
          </li>
        ))}
      </ul>

      {/* ================= Table ================= */}
      {fpUploaded === false && (
  <h4 style={{ color: "red" }}>
    FP not uploaded, Upload it first & try again
  </h4>
)}

{/* ✅ FP UPLOADED */}
{fpUploaded === true && (
  <>
    {/* TABLE */}
    <div dangerouslySetInnerHTML={{ __html: tableHtml }} />

    {/* ❌ FORWARDED */}
    {isForwarded && (
      <div className="changeEffect" style={{
        padding: "10px",
        textAlign: "center",
        color: "white",
        background: "red"
      }}>
        Sorry Material File Sent to Purchase Dept!!
      </div>
    )}

    {/* ✅ NOT FORWARDED → SHOW UPLOAD */}
    {!isForwarded && (
      <div className="row mt-3">
        <h6>Upload Revision</h6>

        <div className="col-md-4">
  <input
    type="file"
    className="form-control"
    disabled={uploading}
    onChange={handleFileChange}
  />
</div>
        <div className="col-md-4">
        <textarea
  className="form-control"
  placeholder="Enter comment"
  value={comment}
  onChange={(e) => setComment(e.target.value)}
  disabled={uploading}
/>
        </div>

        <div className="col-md-2">
        <button
  className="btn btn-danger"
  onClick={handleUpload}
  disabled={uploading}
>
  Submit
</button>
        </div>
      </div>
    )}
  </>
)}
    </div>
  );
}