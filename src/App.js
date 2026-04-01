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
import AddProjectPage from './AddProjectPage';
import EditProjectFilePage from './EditProjectFilePage';
import SampleTable from './SampleTable';
import TabsSampleTable from './TabsSampleTable';
import CompanyList from './CompanyList';
import EditCustomer from './EditCustomer';
import Login from './Login';
import MultipleEditUser from './MultipleEditUser';
import AddCompany from './AddCompany';
import EditCompany from './EditCompany';

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
import PPCAssemblyMaterialSwap from './PPCAssemblyMaterialSwap';
import PPCAssemblyMaterialSwapDetails from './PPCAssemblyMaterialSwapDetails';
import PPCElectricalReceivedMaterialList from './PPCElectricalReceivedMaterialList';
import PPCElectricalReceivedMaterialDetails  from './PPCElectricalReceivedMaterialDetails';
import PPCRfdMaterialStock  from './PPCRfdMaterialStock';
import SheetmetalProduction  from './SheetmetalProduction';
import MarkDispatch  from './MarkDispatch';
import SecondDCLabourGrid from './SecondDCLabourGrid';
import SecondDCLabourDetails from './SecondDCLabourDetails';
import EditAssemblyChallanClose from './EditAssemblyChallanClose';
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
import AssemblyDcDetails from './AssemblyDcDetails';
import FabDcList from './FabDcList';
import FoundDcList from './FoundDcList';
import SmetalDcList from './SmetalDcList';
import PowderDcList from './PowderDcList';
import AllDcDetails from './AllDcDetails';
import PowderDcDetails from './PowderDcDetails';
import StoreMaterialAndStock from './StoreMaterialAndStock';
import AssignStockFileReq  from './AssignStockFileReq';
import AssignRfdMaterial  from './AssignRfdMaterial';
import AssignRfdMaterialDetails  from './AssignRfdMaterialDetails';


import AssignStockFileReqDetails from './AssignStockFileReqDetails';
import AssignMiscStockReq  from './AssignMiscStockReq';
import AssignMiscStockReqDetails  from './AssignMiscStockReqDetails';
import ToolKit  from './ToolKit';
import ViewToolkitEntry  from './ViewToolkitEntry';
import GrnApproveList  from './GrnApproveList';
import GrnRawApproved  from './GrnRawApproved';
import GrnAsslyApprove  from './GrnAsslyApprove';
import ChallanCloseList from './ChallanCloseList';
import ChallanClose from './ChallanClose';
import NewDcClose from './NewDcClose';
import SushamDashboard from './SushamDashboard';
import ChampionDashboard from './ChampionDashboard';
import SushamProjectList from './SushamProjectList';
import SushamProjectListDetails from './SushamProjectListDetails';
import ChampionsProjectList from './ChampionsProjectList';
import ChampionProjectListDetails from './ChampionProjectListDetails';
import OutsideEmployee from './OutsideEmployee';
import AssignEmployeeMonthly from './AssignEmployeeMonthly';
import EditUserHr from './EditUserHr';
import LabourReport from './LabourReport';
import FpDataReport from './FpDataReport';
import OwnerPoReport from './OwnerPoReport';
import StateWiseReport from './StateWiseReport';
import CategoryWiseReport from './CategoryWiseReport';
import FileCategoryWiseReport from './FileCategoryWiseReport';
import SummaryWisePoReport from './SummaryWisePoReport';
import VendorWiseReport from './VendorWiseReport';
import TransportReport from './TransportReport';
import StockAssignReport from './StockAssignReport';
import MMSSDatsheet from './MMSSDatsheet';
import MSSDatasheet from './MSSDatasheet';
import ProductDatasheet from './ProductDatasheet';
import AllowanceMaster from './AllowanceMaster';
import ProjectDataSheet from './ProjectDatasheet';
import DispatchScheduleList from './DispatchScheduleList';
import VerifyMaterial from './VerifyMaterial';
import PerformDispatch from './PerformDispatch';
import DispatchDetails from './DispatchDetails';
import VendorDc from './VendorDc';
import SecondChallanDetails from './SecondChallanDetails';
import Dashboard1 from './Dashboard1';
import MarketingDashboard from './MarketingDashboard';
import StoreDashboard from './StoreDashboard';
import DesignDashboard from './DesignDashboard';
// import PurchaseDashboard from './PurchaseDashboard';
import PPCDashboard from './PPCDashboard';
import PurchaseDashboard from './PurchaseDashboard';
import AssemblyDashboard from './AssemblyDashboard';
import ElectricalDashboard from './ElectricalDashboard';
import ProjectDashboard from './ProjectDashboard';
import FATDashboard from './FATDashboard';
import StockAssignedMisc from './StockAssignedMisc';
import PrintDispatchNew from './PrintDispatchNew';
import DispatchPrintDetail from './DispatchPrintDetail';
import DispatchPrintPage from "./DispatchPrintPage";
import DownloadMarketingExcel from './DownloadMarketingExcel';
import DownloadMarketingExcelDetails from './DownloadMarketingExcelDetails';












//tejasvi mam 
import DesignUploadExcel from './DesignUploadExcel';
import DesignUploadExcelDeatils from './DesignUploadExcelDeatils';
import PPCBasicEleWork from './PPCBasicEleWork';
import UploadFPFileList from './UploadFPFileList';
import UploadFPData from "./UploadFPData";
import ViewUploadedFPData from "./ViewUploadedFPData";
import ViewFPData from "./ViewFPData";
import ManufacturingData from './ManufacturingData';
import PendingApprovalDispatch from './PendingApprovalDispatch';
import PendingApprovalDispatchDetails from './PendingApprovalDispatchDetails';
import DispatchForPrint from './DispatchForPrint';
import DispatchForPrintDetails from './DispatchForPrintDetails';
import CompleteDispatch from './CompleteDispatch';
import CompleteDispatchDetails from './CompleteDispatchDetails';
import RejectedDispatch from './RejectedDispatch';
import RejectedDispatchDetails from './RejectedDispatchDetails';
import PrintCompletedDispatchFile from './PrintCompletedDispatchFile';
import PrintCompletedDispatchFileDetails from './PrintCompletedDispatchFileDetails';
import PPCAssconsumptionRpt from './PPCAssconsumptionRpt';
import PPCAssChallenClose from './PPCAssChallenClose';
import FileSplit from './FileSplit';
import FileSplitDetails from './FileSplitDetails';
import AccBillwiseDebitorsData from './AccBillwiseDebitorsData';
import AccUploadAccExcel from './AccUploadAccExcel';
import AccUploadAccBillData from './AccUploadAccBillData';
import Projectlist from './Projectlist';
import ManufacturingDataYearly from './ManufacturingDataYearly';
import MarketingManufacturingData from "./MarketingManufacturingData";
import RptPOOrderPendingMaterial from './RptPOOrderPendingMaterial';
import RptGrn from './RptGrn';
import RptDispatchTransport from './RptDispatchTransport';
import RptVividh from './RptVividh';
import PPCAssCompareMaterialToMasterDetails from "./PPCAssCompareMaterialToMasterDetails";
import PPCAssCompareMaterialToMaster from "./PPCAssCompareMaterialToMaster";
import PPCExtraMaterialRequisition from "./PPCExtraMaterialRequisition";
// import PPCAssectricalExtraMaterialRequisition from "./PPCAssectricalExtraMaterialRequisition";
// import PPCElectricalExtraMaterialRequisition from "./PPCElectricalExtraMaterialRequisition";


// suparn
import PPCEleconsumptionRpt from './PPCEleconsumptionRpt';
import PPCEledispatchRpt from './PPCEledispatchRpt';
import PPCAddEleMake from "./PPCAddEleMake";
import DesignMaterialStock from "./DesignMaterialStock";
import PPCBasicEleWorkDetails from "./PPCBasicEleWorkDetails";
import PPCElectricalCompareMaterialToMaster from "./PPCElectricalCompareMaterialToMaster";
import PPCElectricalCompareMaterialToMasterDetails from "./PPCElectricalCompareMaterialToMaterDetails";
import PPCElectricalConsumedMaterial from "./PPCElectricalConsumedMaterial";
import PPCElectricalConsumedMaterialDetails from "./PPCElectricalConsumedMaterialDetails";
import PPCElectricalMaterialSwap from "./PPCElectricalMaterialSwap";
import PPCElectricalMaterialSwapDetails from "./PPCElectricalMaterialSwapDetails";
import PPCElectricalSendRfdMaterialToPackagingList from "./PPCElectricalSendRfdMaterialToPackagingList";
import FilewiseIncentiveReport from './FilewiseIncentiveReport';
import ExpenseWeeklyReport from './ExpenseWeeklyReport';
import AllConsumptionsummReport from './AllConsumptionsummReport';
import ExpenseTrackerSummeryReport from './ExpenseTrackerSummeryReport';

import NewAnalysisProjectAnalysis from './NewAnalysisProjectAnalysis';
import NewAnalysisAccountVsProjectAnalysis from './NewAnalysisAccountVsProjectAnalysis';
import NewAnalysisProjectAnalysisDetails from './NewAnalysisProjectAnalysisDetails';
import NewAnalysisExpenseTrackerDaily from './NewAnalysisExpenseTrackerDaily';
import NewAnalysisPPCDashboard from './NewAnalysisPPCDashboard';
import PPCAssectricalExtraMaterialRequisition from "./PPCAssectricalExtraMaterialRequisition";

// import ProjectProjectAnalysisNew from "./ProjectProjectAnalysisNew";
// import PPCElectricalAssignRFDMaterial from "./PPCElectricalAssignRFDMaterial";
// import PPCElectricalAssignRFDMaterialCopy from "./PPCElectricalAssignRFDMaterial copy";
import PURCHASEApprovePOList from "./PURCHASEApprovePOList";
import PURCHASEApprovePOListDetails from "./PURCHASEApprovePOListDetails";
import PURCHASERawMaterial from "./PURCHASERawMaterial";
import PURCHASEMaterialList from "./PURCHASEMaterialList";
import PURCHASEElectricalMaterial from "./PURCHASEElectricalMaterial";
import PURCHASEElectricalMaterialDetails from "./PURCHASEElectricalMaterialDetails";
import PURCHASEAssemblyMaterial from "./PURCHASEAssemblyMaterial";
import PURCHASEAssemblyMaterialDetails from "./PURCHASEAssemblyMaterialDetails";
import PURCHASEHardwareMaterial from "./PURCHASEHardwareMaterial";
import PURCHASEHardwareMaterialDetails from "./PURCHASEHardwareMaterialDetails";
import PURCHASEVerbalPO from "./PURCHASEVerbalPO";
import PURCHASEverbalPOMs from "./PURCHASEverbalPOMs";
import PURCHASEUdl from "./PURCHASEUdl";
import PURCHASEUdlDetails from "./PURCHASEUdlDetails";
import PURCHASEDetailsPONew from "./PURCHASEDetailsPONew";
import PURCHASEDetailsInProcessPO from "./PURCHASEDetailsInProcessPOSurya";
import PURCHASEDetailsActivePODetails from "./PURCHASEActivePOGeneratePOSurya";
import PURCHASEHod from "./PURCHASEHod";
import PURCHASEHodDetails from "./PURCHASEHodDetails";
import PURCHASEHodDetailsSusham from "./PURCHASEHodDetailsSusham";
import PURCHASEHodDetailsVividh from "./PURCHASEHodDetailsVividh";
import PURCHASEActivePOViewApprovedSurya from "./PURCHASEActivePOViewApprovedSurya";
import PURCHASEActivePOViewApprovedSusham from "./PURCHASEActivePOViewApprovedSusham";
import PURCHASEActivePOViewApprovedVividh from "./PURCHASEActivePOViewApprovedVividh";
import PURCHASEActivePOGeneratePOSurya from "./PURCHASEActivePOGeneratePOSurya";
import PURCHASEActivePOGeneratePOSusham from "./PURCHASEActivePOGeneratePOSusham";
import PURCHASEActivePOGeneratePOVividh from "./PURCHASEActivePOGeneratePOVividh";
import PURCHASEDetailsInProcessPOSurya from "./PURCHASEDetailsInProcessPOSurya";
import PURCHASEDetailsInProcessPOSusham from "./PURCHASEDetailsInProcessPOSusham";
import PURCHASEDetailsInProcessPOVividh from "./PURCHASEDetailsInProcessPOVividh";
import PURCHASERaisedPO from "./PURCHASERaisedPO";
import PURCHASERaisedPoSurya from "./PURCHASERaisedPoSurya";
import PURCHASERaisedPoSusham from "./PURCHASERaisedPoSusham";
import PURCHASERaisedPoVividh from "./PURCHASERaisedPoVividh";
import PURCHASECancelledPO from "./PURCHASECancelledPO";
import PURCHASECancelledPoDetails from "./PURCHASECancelledPoDetails";
import HRMenuMaster from "./HRMenuMaster";
import HRUserMenuAllocation from "./HRUserMenuAllocation";
import PPCBasicAssemblyWorkList from "./PPCBasicAssemblyWorkList";
import PPCElectricalExtraMaterialRequisition from "./PPCElectricalExtraMaterialRequisition";
import PPCReceivedMaterialAssembly from "./PPCReceivedMaterialAssembly";
import PPCReceivedMaterialDetailsAssembly from "./PPCReceivedMaterialDetailsAssembly";
import PPCGenerateAssemblyList from "./PPCGenerateAssemblyList";
import PPCGenerateAssemblyFileDetails from "./PPCGenerateAssemblyFileDetails";
import PPCGenerateAssemblyData from "./PPCGenerateAssemblyData";
import StockMaterialAdjustApprovalList from './StockMaterialAdjustApprovalList';
import StockMaterialAdjustApprovalDetails from './StockMaterialAdjustApprovalDetails';
import UploadDrawing from './UploadDrawing';
import UploadDrawingDetails from './UploadDrawingDetails';



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
          {/* <Route path="/customers/details/:customer_id" element={<EditCustomer />} /> */}
          <Route path="/customers/details/:customerId" element={<EditCompany />} />
          <Route path="/marketing/cost-chit-list" element={<ProjectCostGrid />} />
          <Route path="/marketing/project/project-data-sheet" element={<ProjectDataSheet />} />

          <Route path="/marketing/cost-chit" element={<GetCostChitData />} />
          <Route path="/show-cost/:fileid" element={<CostChit />} />
          <Route path="/marketing/sm-file-list-(misc.-supply)" element={<SMFileList />} />
          <Route path="/misc-file-required-material/:fileid" element={<MiscFileRequiredMaterial />} />
          <Route path="/marketing/project/add-project" element={<AddProjectPage />} />
          <Route path="/marketing/project/edit-file/:fileId" element={<EditProjectFilePage />} />
          <Route path="/marketing/manufacturing-upload-data-(2000-2024)" element={<ManufacturingDataYearly />} /> 
          <Route path="/marketing/project/View-fp-data" element={<ViewFPData />} />
          <Route path="/marketing/project/ViewUploadedFPData/:id/:fileName" element={<ViewUploadedFPData />} />


          {/* tejasvi mam*/}
            <Route path="/marketing/project/project-list" element={<Projectlist />} />

          {/* <Route
            path="/marketing/manufacturing-data-new"
            element={<MarketingManufacturingData />}
          /> */}
          <Route path="/marketing/Manufacturing-data-new" element={<ManufacturingData />} />
          
          <Route path="/marketing/project/Upload-marketing-excel(fp)" element={<UploadFPFileList />}
                    />
          <Route path="/marketing/project/UploadFPData/:id" element={<UploadFPData />} /> 
          {/* {/* tejasvi mam */}

          {/* Project */}
          <Route path="/project/accounts-excel-comparison" element={<AccountsSvc />} />
          <Route path="/project/create-fat-list" element={<FATList />} />
          <Route path="/project/dispatch/dispatch-schedule" element={<DispatchScheduleList />} />
          <Route path="/project/dispatch/dispatch-for-print-(new)" element={<PrintDispatchNew />} />
<Route path="/dispatch-print-detail/:id/:fileName" element={<DispatchPrintDetail />} />
<Route path="/dispatch-print-page/:fileId/:fileName/:date/:tname/:vcno/:dname/:dcno"
       element={<DispatchPrintPage />} />
          <Route path="/verify-material/:fileId/:type" element={<VerifyMaterial />} />
          <Route path="/perform-dispatch/:fileId/:type" element={<PerformDispatch />} />
          <Route path="/dispatch-details/:disp_id" element={<DispatchDetails />} />



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
          <Route path="/project/allowance-master" element={<AllowanceMaster />} />
          <Route path="/project/allowance-master-list" element={<SampleTable />} />
          <Route path="/project/project-list" element={<DesignProjectList />} />
          <Route path="/project-details/:fileid" element={<DesignProjectDetails />} />
          <Route path="/project/add-dispatch-schedule" element={<AddDispatchSchedule />} />
          <Route path="/project/dispatch/rfd-material-new-stock" element={<RfdMaterialStock />} />
          {/* <Route path="/rfd-material-stock/details/:fileid" element={<RfdMaterialStockDetails />} /> */}


          {/* tejasvi mam */}
          <Route path="ppc/main-ppc/extra-material-requisition" element={<PPCExtraMaterialRequisition />} />
           <Route path="/design/upload-excel" element={<DesignUploadExcel />} />
          <Route path="/design/upload-excel/details/:fileId/:fileName" element={<DesignUploadExcelDeatils />}/>
          <Route path="/project/dispatch/pending-approve-dispatch" element={<PendingApprovalDispatch />} />
          <Route path="/project/dispatch/pending-approve-dispatch-details/:file_id" element={<PendingApprovalDispatchDetails />} />
          <Route path="/project/dispatch/dispatch-for-print" element={<DispatchForPrint />} />
          <Route path="/project/dispatch/dispatch-for-print-details/:file_id" element={<DispatchForPrintDetails />} />
          <Route path="/project/dispatch/completed-dispatch" element={<CompleteDispatch />} />
          <Route path="/project/dispatch/pending-approve-dispatch" element={<PendingApprovalDispatch />} />
          <Route path="project/dispatch/electrical-dispatch-list" element={<PPCEledispatchRpt />} />
          <Route path="/project/dispatch/completed-dispatch-details/:file_id" element={<CompleteDispatchDetails />} />
          <Route path="/project/dispatch/rejected-dispatch" element={<RejectedDispatch />} />
          <Route path="/project/dispatch/rejected-dispatch-details/:file_id" element={<RejectedDispatchDetails />} />
          <Route path="/project/dispatch/print-completed-dispatch" element={<PrintCompletedDispatchFile  />} />
          <Route path="/project/dispatch/print-completed-dispatch-details/:file_id" element={<PrintCompletedDispatchFileDetails />} />
          <Route path="/project/stock-material-adjust-approval" element={<StockMaterialAdjustApprovalList />} />
          <Route path="/project/stockMaterialAdjustApprovalDetails/:fileId" element={<StockMaterialAdjustApprovalDetails />} />
          {/* Design */}
          <Route path="/design/swap-packing-list" element={<SwapPackingList />} />
          <Route path="/design/download-marketing-excel" element={<DownloadMarketingExcel />} />
          <Route path="/design/download-marketing-excel/details/:fileid" element={<DownloadMarketingExcelDetails />} />

          

          <Route path="/design/view-fp-data" element={<ViewFPData />} />
          <Route path="/design/upload-marketing-excel(fp)" element={<UploadFPFileList />} />
          <Route path="/design/material-master/stock" element={<StoreMaterialAndStock />} /> 


          <Route path="/packing-list/details/:fileid" element={<SwapPackingListDetails />} />
          <Route path="/design/swap-excel-list" element={<SwapExcelList />} />
          <Route path="/excel-list/details/:fileid" element={<SwapExcelListDetails />} />
          <Route path="/design/swap-material" element={<SwapMaterial />} />
          <Route path="/material-swap/details/:fileid" element={<SwapMaterialListDetails />} />
          <Route path="/design/upload-drawing" element={<UploadDrawing />} />
          <Route path="/upload-drawing-details/:fileid" element={<UploadDrawingDetails />} />
          {/* // Correct route definition */}
          <Route path="/mmss-datasheet/:projectId/:fileId" element={<MMSSDatsheet />} />
          <Route path="/mss-datasheet/:projectId/:fileId" element={<MSSDatasheet />} />
          <Route path="/product-datasheet/:projectId/:fileId" element={<ProductDatasheet />} />




          {/* suparn */}
          <Route
            path="/ppc/assembly/received-material"
            element={<PPCReceivedMaterialAssembly />}
          />

          <Route
            path="/ppc-received-material-assembly/details/:fileid"
            element={<PPCReceivedMaterialDetailsAssembly />}
          />

          <Route
            path="/ppc/assembly/generate-assembly"
            element={<PPCGenerateAssemblyList />}
          />

          <Route
            path="/ppc-generate-assembly/file-details/:fileid"
            element={<PPCGenerateAssemblyFileDetails />}
          />

          <Route
            path="/ppc-generate-assembly/file-details/assembly/:fileid/:assemblyid"
            element={<PPCGenerateAssemblyData />}
          />

          <Route
            path="design/material-master/stock"
            element={<DesignMaterialStock />}
          />
          <Route
            path="/ppc/assembly/basic-assembly-work"
            element={<PPCBasicAssemblyWorkList />}
          />
           <Route
            path="/ppc/electrical/extra-material-requisition"
            element={<PPCElectricalExtraMaterialRequisition />}
          />
          <Route
            path="/ppc/main-ppc/rfd-material-stock"
            element={<PPCRfdMaterialStock />}
          />
          <Route
            path="/ppc/sheet-metal-&-production"
            element={<SheetmetalProduction />}
          />
          <Route
            path="/ppc/mark-second-dc-dispatch"
            element={<MarkDispatch />}
          />

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
          <Route path="/store/generated-dc/powder" element={<PowderDcList />} /> 
          <Route path="/store/generated-dc/all-dc-details" element={<AllDcDetails />} /> 
          <Route path="/store/generated-dc/all-powder-dc-details" element={<PowderDcDetails />} /> 
          <Route path="/store/material-master/stock" element={<StoreMaterialAndStock />} /> 
          <Route path="/store/assign-stock/file-req" element={<AssignStockFileReq />} /> 
          <Route path="/file-details-new/:file_id" element={<AssignStockFileReqDetails />} />
          <Route path="/store/assign-misc-stock-req" element={<AssignMiscStockReq />} /> 
          <Route path="/next-page/:file_id" element={<AssignMiscStockReqDetails />} />
          <Route path="/store/toolkit-entry" element={<ToolKit />} /> 
          <Route path="/store/view-toolkit-entry" element={<ViewToolkitEntry />} /> 
          <Route path="/store/grn-approve-list" element={<GrnApproveList />} /> 
          <Route path="/grn_approve/raw/details/:grn_id" element={<GrnRawApproved />} />
          <Route path="/grn_approve/assembly/details/:grn_id" element={<GrnAsslyApprove />} />
          <Route path="/store/challan-close-list" element={<ChallanCloseList />} /> 
          <Route path="/store/challan-close/:file_id" element={<ChallanClose />} />
          <Route path="/store/new-dc-close/:file_id" element={<NewDcClose />} />
          <Route path="/store/vendor-dc" element={<VendorDc />} /> 
          <Route path="/store/second-challan-print/:vendor_id/:file_id/:dc_id" element={<SecondChallanDetails />} 
        />
          <Route path="/store/completed-dispatch" element={<CompleteDispatch />} />
          <Route path="/store/print-completed-dispatch" element={<PrintCompletedDispatchFile  />} />
          <Route path="/store/rejected-dispatch" element={<RejectedDispatch />} />
          <Route path="/store/pending-approve-dispatch" element={<PendingApprovalDispatch />} />









          {/* PPC */}
          <Route path="/ppc/mom/add-mom" element={<MultipleDynamicForm />} />
          <Route path="/ppc/mom/mom-list" element={<SampleTable />} />
          <Route path="/ppc/main-ppc/project-list" element={<PPCProjectList />} />
          <Route path="/ppc-project/details/:fileid" element={<PPCProjectListDetails />} />
          <Route path="/ppc/main-ppc/received-material" element={<PPCReceivedMaterial />} />
          <Route path="/ppc-received-material/details/:fileid" element={<PPCReceivedMaterialDetails />} />
          <Route path="/ppc/main-ppc/rfd-material-stock" element={<get_ReceviedMaterialList_23 />} />
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
          <Route path="/ppc/electrical/add-electrical-make" element={<PPCAddEleMake />} />
          <Route path="/ppc/electrical/electrical-consumption-report" element={<PPCEleconsumptionRpt />} />
          <Route path="/ppc/electrical/electrical-dispatch-report" element={<PPCEledispatchRpt />} /> 
          <Route path="/ppc/reminder/add-reminder" element={<DynamicForm />} />
          <Route path="/ppc/reminder/reminder-list" element={<SampleTable />} />

          <Route path="/ppc/assembly/assembly-consumption-report" element={<PPCAssconsumptionRpt />} />
          <Route path="/ppc/assembly/assembly-challan-close" element={<PPCAssChallenClose />} />
          <Route path="/project/file-split" element={<FileSplit />} />
          <Route path="/project/FileSplitDetails/:id" element={<FileSplitDetails />} />
          <Route
            path="/ppc/electrical/basic-electrical-work"
            element={<PPCBasicEleWork />}
          />
          <Route
            path="/ppc/assembly/material-master/stock"
            element={<DesignMaterialStock />}
          />
          <Route path="ppc/second-dc-labour-entries" element={<SecondDCLabourGrid />} />
          <Route path="/project/ppc/second-dc-labour-details/:fileId" element={<SecondDCLabourDetails />} />
          <Route path="/ppc/assembly/assign-assembly-material" element={<AssignRfdMaterial />} />
          <Route path="/assign-rfd-details/:fileid" element={<AssignRfdMaterialDetails />} />


          <Route path="/ppc/non-confirmatives/add-nc" element={<MultipleDynamicForm />} />
          <Route path="/ppc/non-confirmatives/nc-list" element={<TabsSampleTable />} />
          <Route path="/ppc/assembly/material-swap-assembly" element={<PPCAssemblyMaterialSwap />}/>

          <Route path="/ppc/assembly/material-swap-assembly/details/:fiileId" element={<PPCAssemblyMaterialSwapDetails />}/>
          <Route path="/ppc/electrical/received-material" element={<PPCElectricalReceivedMaterialList />}/>
          <Route path="/ppc/electrical/received_material_list/details/:fileId/:fileName" element={<PPCElectricalReceivedMaterialDetails />}/>
           <Route
            path="/ppc-basic-electrical-work/details/:fileid"
            element={<PPCBasicEleWorkDetails />}
          />
          <Route
            path="ppc/electrical/compare-material-to-master"
            element={<PPCElectricalCompareMaterialToMaster />}
          />
          <Route
            path="/design/compare-material-to-master"
            element={<PPCElectricalCompareMaterialToMaster />}
          />
          <Route
            path="ppc/assembly/edit-assembly-challan-close"
            element={<EditAssemblyChallanClose />}
          />
          <Route
            path="/ppc/assembly/compare-material-to-master"
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
          />

          {/* Susham Routes */}
          <Route
            path="/susham/dashboard"
            element={<SushamDashboard />}
          />
          <Route
            path="/ppc/shusham-dasboard"
            element={<SushamDashboard />}
          />
           <Route
            path="/champion/dashboard"
            element={<ChampionDashboard />}
          />
          <Route
            path="/ppc/champion-dashboard"
            element={<ChampionDashboard />}
          />
          <Route
            path="/susham/project-list"
            element={<SushamProjectList />}
          />
            <Route path="/susham/project-detail/:fileid" element={<SushamProjectListDetails />} />

          <Route
            path="/champion/project-list"
            element={<ChampionsProjectList />}
          />
            <Route path="/champion/project-detail/:fileid" element={<ChampionProjectListDetails />} />

            {/* Account */}
            <Route path="/account/billwise-debitors-data" element={<AccBillwiseDebitorsData />} /> 
            <Route path="/account/upload-accounts-excel--cost-center" element={<AccUploadAccExcel />} /> 
            <Route path="/account/upload-accounts-billing-data" element={<AccUploadAccBillData />} /> 
          {/* ✅ Catch all unmatched routes - redirect to dashboard if logged in, or login if not */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} />


          {/* HR */}
            <Route path="hr/documentation/outside-workers" element={<OutsideEmployee />} />
            <Route path="/hr/documentation/assign-employee-to-file-monthly" element={<AssignEmployeeMonthly />} />
            <Route path="hr/role-management/edit-user-list" element={<EditUserHr />} />
            <Route path="/hr/menu-master" element={<HRMenuMaster />} />
          <Route path="hr/documentation/assign-workers-to-file" element={<AssignWorkersToFile />} />
          <Route path="hr/documentation/view-file-wise-workers(all)" element={<ViewAssignWorkerList />} />


<Route
  path="/hr/user-menu-allocation"
  element={<HRUserMenuAllocation />}
/>

            {/* suparn */}
            {/* purchase module */}
            <Route
            path="/purchase/approve-po"
            element={<PURCHASEApprovePOList />}
          />

          <Route
            path="/purchase/approve_po/details/:supplier_id/:po_number"
            element={<PURCHASEApprovePOListDetails />}
          />

          <Route
            path="/purchase/purchase-material/raw-material"
            element={<PURCHASERawMaterial />}
          />

          <Route
            path="/purchase/purchase_material/raw_material/details/:fileId/:fileName"
            element={<PURCHASEMaterialList />}
          />

          <Route
            path="/purchase/purchase-material/electrical-material"
            element={<PURCHASEElectricalMaterial />}
          />

          <Route
            path="/purchase/purchase_material/electrical_material/details/:fileId/:fileName"
            element={<PURCHASEElectricalMaterialDetails />}
          />

          <Route
            path="/purchase/purchase-material/assembly-material"
            element={<PURCHASEAssemblyMaterial />}
          />

          <Route
            path="/purchase/purchase_material/assembly_material/details/:fileId/:fileName"
            element={<PURCHASEAssemblyMaterialDetails />}
          />

          <Route
            path="/purchase/purchase-material/hardware-material"
            element={<PURCHASEHardwareMaterial />}
          />

          <Route
            path="/purchase/purchase_material/hardware_material/details/:fileId/:fileName"
            element={<PURCHASEHardwareMaterialDetails />}
          />

          <Route
            path="/purchase/purchase-material/verbal-po"
            element={<PURCHASEVerbalPO />}
          />

          <Route
            path="/purchase/purchase-material/verbal-po(ms-tube,beam-pipe,upright)"
            element={<PURCHASEverbalPOMs />}
          />

          <Route
            path="/purchase/purchase-material/udl-sticker"
            element={<PURCHASEUdl />}
          />

          <Route
            path="/purchase/purchase_material/udl_sticker/details/:fileId/:fileName"
            element={<PURCHASEUdlDetails />}
          />

          <Route
            path="/purchase/po-details/purchase-order(new)"
            element={<PURCHASEDetailsPONew />}
          />

          <Route
            path="/purchase/po_details/in_process_po/Surya/:supplier_id/:po_number"
            element={<PURCHASEDetailsInProcessPOSurya />}
          />
          <Route
            path="/purchase/po_details/in_process_po/Susham/:supplier_id/:po_number"
            element={<PURCHASEDetailsInProcessPOSusham />}
          />
          <Route
            path="/purchase/po_details/in_process_po/Vividh/:supplier_id/:po_number"
            element={<PURCHASEDetailsInProcessPOVividh />}
          />

          <Route
            path="/purchase/po_details/active_po/surya/:supplier_id/:po_id"
            element={<PURCHASEActivePOViewApprovedSurya />}
          />
          <Route
            path="/purchase/po_details/active_po/susham/:supplier_id/:po_id"
            element={<PURCHASEActivePOViewApprovedSusham />}
          />
          <Route
            path="/purchase/po_details/active_po/vividh/:supplier_id/:po_id"
            element={<PURCHASEActivePOViewApprovedVividh />}
          />

          <Route
            path="/purchase/po_details/active_po/generate_po/surya/:supplier_id"
            element={<PURCHASEActivePOGeneratePOSurya />}
          />
          <Route
            path="/purchase/po_details/active_po/generate_po/susham/:supplier_id"
            element={<PURCHASEActivePOGeneratePOSusham />}
          />
          <Route
            path="/purchase/po_details/active_po/generate_po/vividh/:supplier_id"
            element={<PURCHASEActivePOGeneratePOVividh />}
          />

          <Route
            path="/purchase/po-details/approve-purchase-order(purchase-hod)"
            element={<PURCHASEHod />}
          />

          <Route
            path="/purchase/po_details/purchase_hod/details/surya/:supplier_id/:po_id"
            element={<PURCHASEHodDetails />}
          />
          <Route
            path="/purchase/po_details/purchase_hod/details/susham/:supplier_id/:po_id"
            element={<PURCHASEHodDetailsSusham />}
          />
          <Route
            path="/purchase/po_details/purchase_hod/details/vividh/:supplier_id/:po_id"
            element={<PURCHASEHodDetailsVividh />}
          />
          <Route path="/purchase/raised-po" element={<PURCHASERaisedPO />} />

          <Route
            path="/purchase/raised_po/details/surya/:supplier_id/:po_id"
            element={<PURCHASERaisedPoSurya />}
          />
          <Route
            path="/purchase/raised_po/details/susham/:supplier_id/:po_id"
            element={<PURCHASERaisedPoSusham />}
          />
          <Route
            path="/purchase/raised_po/details/vividh/:supplier_id/:po_id"
            element={<PURCHASERaisedPoVividh />}
          />
          <Route
            path="/purchase/cancelled-po"
            element={<PURCHASECancelledPO />}
          />
          <Route
            path="/purchase/cancelled_po/details/:supplier_id/:po_id"
            element={<PURCHASECancelledPoDetails />}
          />
          <Route
            path="purchase/purchase-dashboard"
            element={<PurchaseDashboard />}
          />

           <Route path="/hr/menu-master" element={<HRMenuMaster />} />

            {/* Summary Report */}
            <Route path="summary_reports/labour-report" element={<LabourReport />} />
            <Route path="summary_reports/fp-data-consolidated-report" element={<FpDataReport />} />
            <Route path="summary_reports/owner-wise-yearly-po-report" element={<OwnerPoReport />} />
            <Route path="summary_reports/state-wise-yearly-po-report" element={<StateWiseReport />} />
            <Route path="summary_reports/category-wise-po-report" element={<CategoryWiseReport />} />
            <Route path="summary_reports/file---category-wise-po-report" element={<FileCategoryWiseReport />} />
            <Route path="summary_reports/supplier-wise-po-report" element={<SummaryWisePoReport />} />
            <Route path="summary_reports/vendor-wise-dc-report" element={<VendorWiseReport />} />
            <Route path="summary_reports/transporter-file-wise-report" element={<TransportReport />} />
            <Route path="summary_reports/stock-assigned-summary-report" element={<StockAssignReport />} />

            <Route path="summary_reports/filewise-incentive-report" element={<FilewiseIncentiveReport />} />
            
            <Route path="summary_reports/weekly-expense-report" element={<ExpenseWeeklyReport />} />
            
            <Route path="summary_reports/all-consumption-summary-report" element={<AllConsumptionsummReport />} />

            <Route path="summary_reports/weekly-expense-total-summary-report" element={<ExpenseTrackerSummeryReport />} />

            {/* new analysis */}

            <Route
            path="/new_analysis/project-analysis"
            element={<NewAnalysisProjectAnalysis />}
          />
           <Route
            path="/project/project-analysis-new"
            element={<NewAnalysisProjectAnalysis />}
          />
          <Route
            path="new_analysis/project_analysis/details/:split_FILEID"
            element={<NewAnalysisProjectAnalysisDetails />}
          />
          <Route
            path="/new_analysis/accounts-vs-proj-analysis"
            element={<NewAnalysisAccountVsProjectAnalysis />}
          />
          <Route
            path="/new_analysis/expense-tracker-daily-analysis"
            element={<NewAnalysisExpenseTrackerDaily />}
          />
          <Route
            path="/new_analysis/ppc-dashboard"
            element={<NewAnalysisPPCDashboard />}
          />
          <Route
            path="ppc/assembly/extra-material-requisition"
            element={<PPCAssectricalExtraMaterialRequisition />}
          />

        {/* Dashboard */}
          <Route
            path="dashboard/dashboard"
            element={<Dashboard1 />}
          />
          <Route
            path="dashboard/marketing-dashboard"
            element={<MarketingDashboard />}
          />
          <Route
            path="dashboard/store-dashboard"
            element={<StoreDashboard />}
          />
           <Route
            path="dashboard/design-dashboard"
            element={<DesignDashboard />}
          />
           {/* <Route
            path="dashboard/purchase-dashboard"
            element={<PurchaseDashboard />}
          /> */}
          <Route
            path="dashboard/ppc-dashboard"
            element={<PPCDashboard />}
          />
          <Route
            path="dashboard/purchase-dashboard"
            element={<PurchaseDashboard />}
          />
           <Route
            path="dashboard/assembly-dashboard"
            element={<AssemblyDashboard />}
          />
          <Route
            path="ppc/assembly/assembly-dashboard"
            element={<AssemblyDashboard />}
          />

          <Route
            path="dashboard/electrical-dashboard"
            element={<ElectricalDashboard />}
          />
           <Route
            path="ppc/electrical/electrical-dashboard"
            element={<ElectricalDashboard />}
          />

          <Route
            path="dashboard/project-dashboard"
            element={<ProjectDashboard />}
          />

          
          <Route
            path="dashboard/fat-dashboard"
            element={<FATDashboard />}
          />

          {/* Reports */}
          <Route
            path="reports/stock-assigned-miscellenious"
            element={<StockAssignReport />}
          />

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