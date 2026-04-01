import React from "react";
import SiteDashboardGrid from "./SiteDashboard";       // Site Dashboard details
import SiteDashboardPending from "./PendingFilesGrid"; // Pending files grid

const SiteDashboardPage = () => {
  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      {/* First Grid: Site Dashboard */}
      <div style={{ marginBottom: "40px" }}>
        <SiteDashboardGrid />
      </div>

      {/* Second Grid: Pending Files */}
      <div>
        <SiteDashboardPending />
      </div>
    </div>
  );
};

export default SiteDashboardPage;
