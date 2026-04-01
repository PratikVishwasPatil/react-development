import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import DynamicForm from './DynamicForm';
import MultipleDynamicForm from './MultipleDynamicForm';
import SampleTable from './SampleTable';
import TabsSampleTable from './TabsSampleTable';
import CompanyList from './CompanyList';
import EditCustomer from './EditCustomer';
import Login from './Login';
import MultipleEditUser from './MultipleEditUser';
import AddCompany from './AddCompany';
import SingleEditUser from './SingleEditUser';
import MarkettingBo from './MarkettingBo';
import ProjectCostGrid from './ProjectCostGrid';
import GetCostChitData from './GetCostChitData';
import CostChit from './CostChit';
import AMCDashboard from './AMCDashboard';
import SMFileList from './SMFileList';
import MiscFileRequiredMaterial from './MiscFileRequiredMaterial';
import AccountsSvc from './AccountsSvc';
import FATList from './FATList';
import SiteDashboard1 from './SiteDashboard1';
import SiteDashboard from './SiteDashboard';
import PendingFilesGrid from './PendingFilesGrid';
import SiteDashboardPage from './SiteDashboardPage';
import ProjectListSite from './ProjectListSite';
import OutsideEmployeeDashboard from './OutsideEmployeeDashboard';
import ViewAssignWorkerList from './ViewAssignWorkerList';
import DisplayDrawings from './DisplayDrawings';
import ViewAllAssignWorkerList from './ViewAllAssignWorkerList';
import ExpenseTrackerDaily from './ExpenseTrackerDaily';
import ExpenseAnalysis from './ExpenseAnalysis';
import AssignWorkersToFile from './AssignWorkersToFile';
import AssignWorkerToFile from './AssignWorkerToFile';
import AddDispatchSchedule from './AddDispatchSchedule';
import ExpenseWeekly from './ExpenseWeekly';
import MatPoChart from './MatPoChart';
import LabourPo from './LabourPo';
import MarketingLab from './MarketingLab';
import Total from './Total';
import DesignProjectList from './DesignProjectList';
import DesignProjectDetails from './DesignProjectDetails';
import SwapPackingList from './SwapPackingList';
import SwapExcelList from './SwapExcelList';
import SwapPackingListDetails from './SwapPackingListDetails';
import SwapExcelListDetails from './SwapExcelListDetails';
import SwapMaterial from './SwapMaterial';
import SwapMaterialListDetails from './SwapMaterialListDetails';
import PPCProjectList from './PPCProjectList';
import PPCProjectListDetails from './PPCProjectListDetails';
import RfdMaterialStock from './RfdMaterialStock';
import RfdMaterialNewStock from './RfdMaterialNewStock';
import RfdMaterialStockDetails from './RfdMaterialStockDetails';
import RfdMaterialNewStockDetails from './RfdMaterialNewStockDetails';
import PPCReceivedMaterial from './PPCReceivedMaterial';
import PPCReceivedMaterialDetails from './PPCReceivedMaterialDetails';
import AssignRfdStock from './AssignRfdStock';
import AssignRfdStockDetails from './AssignRfdStockDetails';

//tejasvi 
// import UploadFPFileList from './UploadFPFileList';
// import UploadFPData from "./UploadFPData";
// import ViewUploadedFPData from "./ViewUploadedFPData";
// import ViewFPData from "./ViewFPData";
// import ManufacturingData from './ManufacturingData';
// import ManufacturingDataYearly from './ManufacturingDataYearly';
// import PPCBasicEleWork from './PPCBasicEleWork';
import PPCAddEleMake from './PPCAddEleMake';
import PPCEleconsumptionRpt from './PPCEleconsumptionRpt';
import PPCEledispatchRpt from './PPCEledispatchRpt';

function AppWrapper() {
  const [theme, setTheme] = React.useState('light');
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const themeStyles = {
    navBg: theme === 'light' ? 'light' : 'dark',
  };

  // 🔒 Hide Navigation on the Login page
  const hideNavOnRoutes = ['/login'];
  const hideNavigation = hideNavOnRoutes.includes(location.pathname);

  return (
    <div className={`app-container ${theme}`}>
      {!hideNavigation && (
        <Navigation
          theme={theme}
          toggleTheme={toggleTheme}
          themeStyles={themeStyles}
        />
      )}
      <div className="content-container">
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* HR Module */}
          <Route path="/hr/role-management/add-user" element={<DynamicForm />} />
          <Route path="/hr/role-management/user-list" element={<SampleTable />} />
          <Route path="/add-user/:id" element={<SingleEditUser />} />
          <Route path="/nc-list/:id" element={<MultipleEditUser />} />
          <Route path="/allowance-master/:id" element={<SingleEditUser />} />
          <Route path="/edit-record/:id" element={<MultipleEditUser />} />
          <Route path="/hr/role-management/add-student" element={<DynamicForm />} />

          {/* Marketing */}
          <Route path="/marketing/marketing-backoffice" element={<MarkettingBo />} />
          <Route path="/marketing/amc-dashboard" element={<AMCDashboard />} />
          <Route path="/marketing/company/add-company" element={<AddCompany />} />
          <Route path="/marketing/company/company-list" element={<CompanyList />} />
          <Route path="/edit-customer/:customer_id" element={<EditCustomer />} />
          <Route path="/marketing/cost-chit-list" element={<ProjectCostGrid />} />
          <Route path="/marketing/cost-chit" element={<GetCostChitData />} />
          <Route path="/show-cost/:fileid" element={<CostChit />} />
          <Route path="/marketing/sm-file-list-(misc.-supply)" element={<SMFileList />} />
          <Route path="/misc-file-required-material/:fileid" element={<MiscFileRequiredMaterial />} />
          <Route path="/marketing/project/add-project" element={<MultipleDynamicForm />} />

          {/* tejasvi*/}
           {/* <Route path="/marketing/project/Upload-marketing-excel(fp)" element={<UploadFPFileList />}
          />
          <Route path="/marketing/project/UploadFPData/:id" element={<UploadFPData />} />
          <Route path="/marketing/project/View-fp-data" element={<ViewFPData />} />
          <Route path="/marketing/project/ViewUploadedFPData/:id" element={<ViewUploadedFPData />} />

          <Route path="/marketing/Manufacturing-data-new" element={<ManufacturingData />} />
          <Route path="/marketing/Manufacturing-old-data-(2000-2023)" element={<ManufacturingDataYearly />} />  */}
          {/* tejasvi */}

          {/* Project */}
          <Route path="/project/accounts-excel-comparison" element={<AccountsSvc />} />
          <Route path="/project/create-fat-list" element={<FATList />} />
          <Route path="/project/site/site-dashboard---1" element={<SiteDashboard1 />} />
          <Route path="/project/site/site-dashboard" element={<SiteDashboardPage />} />
          <Route path="/project/site/design-uploaded-drawings" element={<ProjectListSite />} />
          <Route path="/display-drawings/:fileid" element={<DisplayDrawings />} />
          <Route path="/project/site/assign-workers-to-file" element={<AssignWorkersToFile />} />
          <Route path="/assign-worker-to-file" element={<AssignWorkerToFile />} />
          <Route path="/project/site/outside-employee-dashboard" element={<OutsideEmployeeDashboard />} />
          <Route path="/project/site/view-assign-workers" element={<ViewAssignWorkerList />} />
          <Route path="/project/site/view-all-assign-workers/:fileid" element={<ViewAllAssignWorkerList />} />
          <Route path="/project/site/expense-tracker-daily" element={<ExpenseTrackerDaily />} />
          <Route path="/expense-analysis/:fileid" element={<ExpenseAnalysis />} />
          <Route path="/project/site/expense-tracker-weekly" element={<ExpenseWeekly />} />
          <Route path="/project/charts/material-po,design-bom-and-mktg-material-cost-allowed-by-file" element={<MatPoChart />} />
          <Route path="/project/charts/labour-po,mktg-allowed-expenses,project-estimated-expenses-for-site-&-as-actual-site-cost-by-site" element={<LabourPo />} />
          <Route path="/project/charts/as-actual-site-cost,total-mktg-allowed,labour-po-&project-estimated-expenses-for-site-by-file" element={<MarketingLab />} />
          <Route path="/project/charts/total-po,total-mktg-allowed-&-total-expenses" element={<Total />} />
          <Route path="/project/allowance-master" element={<DynamicForm />} />
          <Route path="/project/allowance-master-list" element={<SampleTable />} />
          <Route path="/project/project-list" element={<DesignProjectList />} />
          <Route path="/project-details/:fileid" element={<DesignProjectDetails />} />
          <Route path="/project/add-dispatch-schedule" element={<AddDispatchSchedule />} />

          {/* Design */}
          <Route path="/design/swap-packing-list" element={<SwapPackingList />} />
          <Route path="/packing-list/details/:fileid" element={<SwapPackingListDetails />} />
          <Route path="/design/swap-excel-list" element={<SwapExcelList />} />
          <Route path="/excel-list/details/:fileid" element={<SwapExcelListDetails />} />
          <Route path="/design/swap-material" element={<SwapMaterial />} />
          <Route path="/material-swap/details/:fileid" element={<SwapMaterialListDetails />} />

          {/* Store */}
          <Route path="/store/store/add-supplier/vendor" element={<MultipleDynamicForm />} />
          <Route path="/store/store/edit-supplier/vendor" element={<SampleTable />} />

          {/* PPC */}
          <Route path="/ppc/mom/add-mom" element={<MultipleDynamicForm />} />
          <Route path="/ppc/mom/mom-list" element={<SampleTable />} />
          <Route path="/ppc/main-ppc/project-list" element={<PPCProjectList />} />
          <Route path="/ppc-project/details/:fileid" element={<PPCProjectListDetails />} />
          <Route path="/ppc/main-ppc/received-material" element={<PPCReceivedMaterial />} />
          <Route path="/ppc-received-material/details/:fileid" element={<PPCReceivedMaterialDetails />} />
          <Route path="/ppc/main-ppc/rfd-material-stock" element={<RfdMaterialStock />} />
          <Route path="/rfd-material-stock/details/:fileid" element={<RfdMaterialStockDetails />} />
          <Route path="/ppc/main-ppc/rfd-material-new-stock" element={<RfdMaterialNewStock />} />
          <Route path="/rfd-new-stock/details/:fileid" element={<RfdMaterialNewStockDetails />} />
          <Route path="/ppc/main-ppc/assign-rfd-material-stock" element={<AssignRfdStock />} />
          <Route path="/rfd-details/:fileid" element={<AssignRfdStockDetails />} />
{/* 
tejasvi mam */}
        <Route path="/ppc/electrical/add-electrical-make" element={<PPCAddEleMake />} />
        <Route path="/ppc/electrical/electrical-consumption-report" element={<PPCEleconsumptionRpt />} />
        <Route path="/ppc/electrical/electrical-dispatch-report" element={<PPCEledispatchRpt />} />
          <Route path="/ppc/reminder/add-reminder" element={<DynamicForm />} />
          <Route path="/ppc/reminder/reminder-list" element={<SampleTable />} />

          <Route path="/ppc/non-confirmatives/add-nc" element={<MultipleDynamicForm />} />
          <Route path="/ppc/non-confirmatives/nc-list" element={<TabsSampleTable />} />

          {/* ✅ Catch all unmatched routes - redirect to dashboard if logged in, or login if not */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;