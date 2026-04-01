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
import ConsolidatedRfdStock from './ConsolidatedRfdStock';
import StockMaterialAdjust from './StockMaterialAdjust';
import StockMaterialAdjustDetails from './StockMaterialAdjustDetails';
import FileMaterialAdjust from './FileMaterialAdjust';
import FileMaterialAdjustDetails from './FileMaterialAdjustDetails';
import AssignMaterial from './AssignMaterial';
import AssignMaterialDetails from './AssignMaterialDetails';
import MaterialReplaceAdjust from './MaterialReplaceAdjust';
import MaterialReplaceAdjustDetails from './MaterialReplaceAdjustDetails';
import MaterialStockAdjust from './MaterialStockAdjust';
import MaterialStockAdjustDetails from './MaterialStockAdjustDetails';
import PerformRfdMaterial from './PerformRfdMaterial';
import PerformRfdMaterialDetails from './PerformRfdMaterialDetails';
import PerformSecondRfdMaterial from './PerformSecondRfdMaterial';
import PerformSecondRfdMaterialDetails from './PerformSecondRfdMaterialDetails';
// import PPCAssemblyMaterialSwap from './PPCAssemblyMaterialSwap';
// import PPCAssemblyMaterialSwapDetails from './PPCAssemblyMaterialSwapDetails';
// import PPCElectricalReceivedMaterialList from './PPCElectricalReceivedMaterialList';
// import PPCElectricalReceivedMaterialDetails  from './PPCElectricalReceivedMaterialDetails';
import BinCard from './BinCard';
import InwardRegister from './InwardRegister';
import OutwardRegister from './OutwardRegister';
import ReqOutwardRegister from './ReqOutwardRegister';
import RejectedStock from './RejectedStock';
import MaterialDetails from './MaterialDetails';
import AssemblyChalanClose from './AssemblyChalanClose';
import AssemblyChalanCloseEdit from './AssemblyChalanCloseEdit';
import AssignToProductList from './AssignToProductList';
import AssignToProductDetails from './AssignToProductDetails';
import GRNFileInward from './GRNFileInward';
import GRNFileInwardDetails from './GRNFileInwardDetails';
import GRNFileInwardDetails2 from './GRNFileInwardDetails2';
import GRNFileDcInwardDetails from './GRNFileDcInwardDetails';
import WithoutFileInward from './WithoutFileInward';
import WithoutFileInwardTwo from './WithoutFileInwardTwo';
import WithoutFileOutward from './WithoutFileOutward';
import WithoutFileOutwardTwo from './WithoutFileOutwardTwo';
import WithoutFileRequsitionOutward from './WithoutFileRequsitionOutward';
import SecondChalanList from './SecondChalanList';
import AssemblyDcList from './AssemblyDcList';
import FabDcList from './FabDcList';
import FoundDcList from './FoundDcList';
import SmetalDcList from './SmetalDcList';






//tejasvi mam 
// import PPCBasicEleWork from './PPCBasicEleWork';
// import UploadFPFileList from './UploadFPFileList';
// import UploadFPData from "./UploadFPData";
// import ViewUploadedFPData from "./ViewUploadedFPData";
// import ViewFPData from "./ViewFPData";
// import ManufacturingData from './ManufacturingData';
// import PendingApprovalDispatch from './PendingApprovalDispatch';
// import PendingApprovalDispatchDetails from './PendingApprovalDispatchDetails';

// import DispatchForPrint from './DispatchForPrint';
// import DispatchForPrintDetails from './DispatchForPrintDetails';

// import CompleteDispatch from './CompleteDispatch';
// import CompleteDispatchDetails from './CompleteDispatchDetails';

// import RejectedDispatch from './RejectedDispatch';
// import RejectedDispatchDetails from './RejectedDispatchDetails';

// import PrintCompletedDispatchFile from './PrintCompletedDispatchFile';
// import PrintCompletedDispatchFileDetails from './PrintCompletedDispatchFileDetails';

// import PPCAssconsumptionRpt from './PPCAssconsumptionRpt';
// import PPCAssChallenClose from './PPCAssChallenClose';

// import FileSplit from './FileSplit';
// import FileSplitDetails from './FileSplitDetails';

// suparn
// import ManufacturingDataYearly from './ManufacturingDataYearly';
// import PPCEleconsumptionRpt from './PPCEleconsumptionRpt';
// import PPCEledispatchRpt from './PPCEledispatchRpt';
// import MarketingManufacturingData from "./MarketingManufacturingData";
// import PPCAddEleMake from "./PPCAddEleMake";
// import DesignMaterialStock from "./DesignMaterialStock";
// import PPCBasicEleWorkDetails from "./PPCBasicEleWorkDetails";
// import PPCElectricalAssignRFDMaterialCopy from "./PPCElectricalAssignRFDMaterial copy";
// import PPCElectricalCompareMaterialToMaster from "./PPCElectricalCompareMaterialToMaster";
// import PPCElectricalCompareMaterialToMasterDetails from "./PPCElectricalCompareMaterialToMaterDetails";
// import PPCElectricalConsumedMaterial from "./PPCElectricalConsumedMaterial";
// import PPCElectricalConsumedMaterialDetails from "./PPCElectricalConsumedMaterialDetails";
// import PPCElectricalMaterialSwap from "./PPCElectricalMaterialSwap";
// import PPCElectricalMaterialSwapDetails from "./PPCElectricalMaterialSwapDetails";
// import PPCElectricalSendRfdMaterialToPackagingList from "./PPCElectricalSendRfdMaterialToPackagingList";

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
          {/* <Route path="/marketing/manufacturing-upload-data-(2000-2024)" element={<ManufacturingDataYearly />} /> 
          <Route path="/marketing/project/View-fp-data" element={<ViewFPData />} />
          <Route path="/marketing/project/ViewUploadedFPData/:id" element={<ViewUploadedFPData />} /> */}


          {/* tejasvi mam*/}
          {/* <Route
            path="/marketing/manufacturing-data-new"
            element={<MarketingManufacturingData />}
          />
          <Route path="/marketing/Manufacturing-data-new" element={<ManufacturingData />} />
          
          <Route path="/marketing/project/Upload-marketing-excel(fp)" element={<UploadFPFileList />}
                    />
                    <Route path="/marketing/project/UploadFPData/:id" element={<UploadFPData />} />  */}
          {/* {/* tejasvi mam */}

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
          {/* tejasvi mam */}
          {/* <Route path="/project/dispatch/pending-approve-dispatch" element={<PendingApprovalDispatch />} />
          <Route path="/project/dispatch/pending-approve-dispatch-details/:file_id" element={<PendingApprovalDispatchDetails />} />
          <Route path="/project/dispatch/dispatch-for-print" element={<DispatchForPrint />} />
          <Route path="/project/dispatch/dispatch-for-print-details/:file_id" element={<DispatchForPrintDetails />} />
          <Route path="/project/dispatch/completed-dispatch" element={<CompleteDispatch />} />
          <Route path="/project/dispatch/pending-approve-dispatch" element={<PendingApprovalDispatch />} />
          <Route path="/project/dispatch/completed-dispatch-details/:file_id" element={<CompleteDispatchDetails />} />
          <Route path="/project/dispatch/rejected-dispatch" element={<RejectedDispatch />} />
          <Route path="/project/dispatch/rejected-dispatch-details/:file_id" element={<RejectedDispatchDetails />} />
          <Route path="/project/dispatch/print-completed-dispatch" element={<PrintCompletedDispatchFile  />} />
          <Route path="/project/dispatch/print-completed-dispatch-details/:file_id" element={<PrintCompletedDispatchFileDetails />} /> */}

          {/* Design */}
          <Route path="/design/swap-packing-list" element={<SwapPackingList />} />
          <Route path="/packing-list/details/:fileid" element={<SwapPackingListDetails />} />
          <Route path="/design/swap-excel-list" element={<SwapExcelList />} />
          <Route path="/excel-list/details/:fileid" element={<SwapExcelListDetails />} />
          <Route path="/design/swap-material" element={<SwapMaterial />} />
          <Route path="/material-swap/details/:fileid" element={<SwapMaterialListDetails />} />

          {/* suparn */}
          {/* <Route
            path="design/material-master/stock"
            element={<DesignMaterialStock />}
          /> */}

          {/* Store */}
          <Route path="/store/store/add-supplier/vendor" element={<MultipleDynamicForm />} />
          <Route path="/store/store/edit-supplier/vendor" element={<SampleTable />} />
          <Route path="/store/store/bin-card" element={<BinCard />} />
          <Route path="/store/store/inward-register" element={<InwardRegister />} />
          <Route path="/store/store/outward-register" element={<OutwardRegister />} />
          <Route path="/store/store/req.-outward-register" element={<ReqOutwardRegister />} />
          <Route path="/store/store/rejected-stock" element={<RejectedStock />} />
          <Route path="/store/store/material-details" element={<MaterialDetails />} />
          <Route path="/store/store/assembly-challan-close" element={<AssemblyChalanClose />} />
          <Route path="/store/store/edit-assembly-challan-close" element={<AssemblyChalanCloseEdit />} />
          <Route path="/store/store/assign-to-production" element={<AssignToProductList />} />
          <Route path="/material-requisition/details/:fileid" element={<AssignToProductDetails />} />
          <Route path="/store/inward/grn---with-file-inward" element={<GRNFileInward />} />
          <Route path="/grn/raw/details/:po_id" element={<GRNFileInwardDetails />} />
          <Route path="/grn/create/:po_id" element={<GRNFileInwardDetails2 />} />
          <Route path="/grn/assembly/details/:dc_id" element={<GRNFileDcInwardDetails />} />
          <Route path="/store/inward/without-file-inward" element={<WithoutFileInward />} />
          <Route path="/store/inward/without-file-inward(ms-tube,beam-pipe,upright)" element={<WithoutFileInwardTwo />} />
          <Route path="/store/outward/dc-outward" element={<WithoutFileOutward />} /> 
          <Route path="/store/outward/dc-outward(ms-tube,beam-pipe,upright)" element={<WithoutFileOutwardTwo />} />
          <Route path="/store/outward/requisition-outward" element={<WithoutFileRequsitionOutward />} /> 
          <Route path="/store/second-challan-list" element={<SecondChalanList />} /> 
          <Route path="/store/generated-dc/assembly" element={<AssemblyDcList />} /> 
          <Route path="/store/generated-dc/fabrication" element={<FabDcList />} /> 
          <Route path="/store/generated-dc/foundation" element={<FoundDcList />} /> 
          <Route path="/store/generated-dc/sheet-metal" element={<SmetalDcList />} /> 








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
          <Route path="/ppc/main-ppc/consolidated-rfd-stock" element={<ConsolidatedRfdStock />} />
          <Route path="/ppc/main-ppc/after-purchase/stock-material-adjust" element={<StockMaterialAdjust />} />
          <Route path="/ppc/stock-material-adjust/:fileid" element={<StockMaterialAdjustDetails />} />
          <Route path="/ppc/main-ppc/after-purchase/file-material-adjust" element={<FileMaterialAdjust />} />
          <Route path="/ppc/file-material-adjust/:fileid" element={<FileMaterialAdjustDetails />} />
          <Route path="/ppc/main-ppc/before-purchase/assign-material" element={<AssignMaterial />} />
          <Route path="/ppc/assign-material/:fileid" element={<AssignMaterialDetails />} />
          <Route path="/ppc/main-ppc/before-purchase/material-replace-/-adjust" element={<MaterialReplaceAdjust />} />
          <Route path="/ppc/material-replace/:fileid" element={<MaterialReplaceAdjustDetails />} />
          <Route path="/ppc/main-ppc/before-purchase/material-stock-adjust" element={<MaterialStockAdjust />} />
          <Route path="/ppc/material-stock-adjust/:fileid" element={<MaterialStockAdjustDetails />} />
          <Route path="/ppc/main-ppc/perform-rfd-material" element={<PerformRfdMaterial />} />
          <Route path="/ppc/perform-rfd/:fileid" element={<PerformRfdMaterialDetails />} />
          <Route path="/ppc/main-ppc/perform-second-rfd-material" element={<PerformSecondRfdMaterial />} />
          <Route path="/ppc/perform-second-rfd/:fileid" element={<PerformSecondRfdMaterialDetails />} />
{/* 
tejasvi mam */}
        {/* <Route path="/ppc/electrical/add-electrical-make" element={<PPCAddEleMake />} />
        <Route path="/ppc/electrical/electrical-consumption-report" element={<PPCEleconsumptionRpt />} />
        <Route path="/ppc/electrical/electrical-dispatch-report" element={<PPCEledispatchRpt />} />
          <Route path="/ppc/reminder/add-reminder" element={<DynamicForm />} />
          <Route path="/ppc/reminder/reminder-list" element={<SampleTable />} />

          <Route path="/ppc/assembly/assembly-consumption-report" element={<PPCAssconsumptionRpt />} />
<Route path="/ppc/assembly/assembly-challan-close" element={<PPCAssChallenClose />} />
   <Route path="/project/file-split" element={<FileSplit />} />
   <Route path="/project/FileSplitDetails/:id" element={<FileSplitDetails />} />

          <Route path="/ppc/non-confirmatives/add-nc" element={<MultipleDynamicForm />} />
          <Route path="/ppc/non-confirmatives/nc-list" element={<TabsSampleTable />} />
          <Route path="/ppc/assembly/material-swap-assembly" element={<PPCAssemblyMaterialSwap />}/>

          <Route path="/ppc/assembly/material-swap-assembly/details/:fiileId" element={<PPCAssemblyMaterialSwapDetails />}/>
          <Route path="/ppc/electrical/received-material" element={<PPCElectricalReceivedMaterialList />}/>
          <Route path="/ppc/electrical/received_material_list/details/:fileId/:fileName" element={<PPCElectricalReceivedMaterialDetails />}/>
          <Route
            path="/ppc/electrical/basic-electrical-work"
            element={<PPCBasicEleWork />}
          />
           <Route
            path="/ppc-basic-electrical-work/details/:fileid"
            element={<PPCBasicEleWorkDetails />}
          />
<Route
            path="ppc/electrical/compare-material-to-master"
            element={<PPCElectricalCompareMaterialToMaster />}
          />

          <Route
            path="/ppc/electrical/compare_material_to_master/details/:fileId/:fileName"
            element={<PPCElectricalCompareMaterialToMasterDetails />}
          />
          <Route
            path="/ppc/electrical/consumed-material"
            element={<PPCElectricalConsumedMaterial />}
          />

          <Route
            path="/ppc/electrical/consumed_material_list/details/:fileId/:fileName"
            element={<PPCElectricalConsumedMaterialDetails />}
          />
          <Route
            path="/ppc/electrical/material-swap-electrical"
            element={<PPCElectricalMaterialSwap />}
          />

          <Route
            path="/ppc/electrical/material_swap_electrical/details/:fileId"
            element={<PPCElectricalMaterialSwapDetails />}
          />
          <Route
            path="/ppc/electrical/send-rfd-material-to-packing-list"
            element={<PPCElectricalSendRfdMaterialToPackagingList />}
          />
           <Route
            path="/ppc/electrical/electrical-dispatch-report"
            element={<PPCEledispatchRpt />}
          /> */}

          {/* ✅ Catch all unmatched routes - redirect to dashboard if logged in, or login if not */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
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