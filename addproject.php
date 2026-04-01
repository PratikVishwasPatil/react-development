<!-- Author : Pradnya Bhosale, Digvijay Jadhav, Ajit Sutar, Bhumika Lad
Version     : 1
Source      :  
Start Date  : 21-12-2018
Last Updated date   : 27-09-2019 
Purpose : After adding customer, we can add the project against the customer name, need to add the product type, and billing , shipping address, enter file details, po details, quotation details.To append more files, ajax file addPOdetailsClone.php is used.
File used to insert data are: project_master, file_master, po_version, quotation_version-->

<?php 
    //db connection file
   include_once('../database/db_connection.php');
   include('../dashboard/getReminderData1.php');
   $userName = $_SESSION['shortName'];
   $employee_id = $_SESSION['employee_id'];
//    echo $employee_id;
//    die;
   $fy=$_SESSION['FY'];
   header('Access-Control-Allow-Origin: *'); // Or specify 'http://localhost:3000'
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
?>

<!DOCTYPE html>
<html lang="en">

<!-- Head Starts -->
<head>
    <title>Add Project</title>
    <!-- Meta Files -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimal-ui">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!-- Favicon icon -->
    <link rel="icon" href="../files/assets/images/favicon.ico" type="image/x-icon">
    <!-- Google font-->     
    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500" rel="stylesheet">
    <!-- Required Fremwork -->
    <link rel="stylesheet" type="text/css" href="../files/bower_components/bootstrap/css/bootstrap.min.css">
    <!-- waves.css -->
    <link rel="stylesheet" href="../files/assets/pages/waves/css/waves.min.css" type="text/css" media="all">
    <!-- sweet alert framework -->
    <link rel="stylesheet" type="text/css" href="../files/bower_components/sweetalert/css/sweetalert.css">
    <!-- themify-icons line icon -->
    <link rel="stylesheet" type="text/css" href="../files/assets/icon/themify-icons/themify-icons.css">
    <!-- ico font -->
    <link rel="stylesheet" type="text/css" href="../files/assets/icon/icofont/css/icofont.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" type="text/css" href="../files/assets/icon/font-awesome/css/font-awesome.min.css">
    <!-- animation nifty modal window effects css -->
    <link rel="stylesheet" type="text/css" href="../files/assets/css/component.css">
    <!-- Style.css -->
    <link rel="stylesheet" type="text/css" href="../files/assets/css/style.css">
    <!-- Style.css -->
    <link rel="stylesheet" type="text/css" href="../files/assets/css/jquery.mCustomScrollbar.css">
    <!-- Custom Scrollbar -->
    <link rel="stylesheet" href="../files/bower_components/select2/css/select2.min.css" />
    <!-- ckeditor -->
    <script src="./ckeditor/ckeditor.js"></script>
    <link rel="stylesheet" type="text/css" href="../files/assets/css/common.css">
    <style>
    .header-navbar .navbar-wrapper .navbar-container .nav-left a, .header-navbar .navbar-wrapper .navbar-container .nav-right a {
padding: 0 0.0rem !important;
}
@font-face {
        font-family: 'maven-pro-medium';
        src: url(../files/assets/fonts/Maven_Pro/MavenPro-Medium.ttf) format("opentype");
        }

        * {
            font-family: 'maven-pro-medium';
        }

    .select{
        border: 1px solid #cccccc !important;
        height: 35px !important;
    }

    .pcoded .pcoded-header[header-theme="theme4"]{
        background: #ff630d !important;
    }

    .pcoded .pcoded-navbar[active-item-theme="theme4"] .pcoded-item > li.active > a, .pcoded .pcoded-navbar[active-item-theme="theme4"] .pcoded-item > li:hover > a {
        background: #ff630d !important;
    }

    .btn-primary, .sweet-alert button.confirm, .wizard > .actions a {
        background: #ff630d !important;
        border-color: #ff630d !important;
    }

    .card-header{
        margin-bottom: 0px !important;
        padding-bottom: 0px !important;
    }

    .page-header{
        height: 103px !important;
    }

    .select2-container--open .select2-dropdown--below{
            margin-top:10px
        }
        .select2-container--default .select2-selection--single .select2-selection__rendered {
            color: #fff;
        }

        
        .select2-container--default .select2-selection--single .select2-selection__rendered {
        background-color: #fff
        }
        .select2-container--default .select2-selection--single .select2-selection__rendered {
        color: #1f1c1c;
        }

        .select2-container--default .select2-results__option--highlighted[aria-selected] {
        background-color: #e16a4a;
        }

         /* add css for sarchable dropdown */
         .select2-container--default .select2-selection--single .select2-selection__rendered{
            padding:0px; 
        }

        .select2-container .select2-selection--single .select2-selection__rendered {
            display: initial;
        }

        .select2-container .select2-selection--single {
            height: 38px;
            padding: 7px;
        }
        .main-body .page-wrapper {
                padding: 0.5rem !important;
                -webkit-transition: all ease-in 0.3s;
                transition: all ease-in 0.3s;
            }
            .card .card-header {
                background-color: transparent;
                border-bottom: none;
                padding: 0px !important;
                position: relative;
                -webkit-box-shadow: 0px 1px 20px 0px rgba(69, 90, 100, 0.08);
                box-shadow: 0px 1px 20px 0px rgba(69, 90, 100, 0.08);
            }
            .card .card-header h5 {
                margin-bottom: 0px;
                color: #37474f;
                font-size: 15px;
                font-weight: 500;
                display: inline-block;
                margin-right: 10px;
                margin-top: 12px;
                margin-left: 19px !important;
                margin-bottom: 14px !important;
                line-height: 1.4;
                position: relative;
            }
            .card .card-block {
                    padding-bottom: 0px !important;
                    margin-bottom: -15px;
                }
            .select2-container .select2-selection--single {
                height: 30px !important;
                padding: 2px !important;
            }
            .form-material textarea {
                    height: 45px !important;
                }
                .card {
                box-shadow: 0px 4px 7px 0px rgba(0,0,0,0.75);
            }

            .form-material .form-default.form-static-label .float-label {
                    color: #131313;
                } 

        .float-label {
            top: -15px !important;
            font-size: 14px !important;
        }

        .form-material .form-control {
            height: 28px !important;
        }

        .form-group {
            margin-bottom: 15px !important;
        }
        .body p{
            color:black !important;
        }
        .card-block{
            padding-bottom: 0px !important;
        }

        .card{
            margin-bottom: 15px !important;
        }

.select2-selection--multiple{
    height: 30px !important;
    padding: 0 !important;
    margin-top: -11px !important;
}

.select2-selection {
  overflow: hidden;
  white-space: pre;
  text-overflow: ellipsis;
  -webkit-appearance: none;
}

.md-modal, .md-effect-1{
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.82);
    border-radius: 5px;
    width:300px;
}


    /* Written By Digvijay */
    .navbar{
        border-bottom: 1px solid #808080d9 !important;
    }
    span.pcoded-mtext {
        color: black !important;
    }
    .header-navbar .navbar-wrapper .navbar-container .header-notification .profile-notification {
        width: auto;
        margin: 0;
        padding: 0;
    }
    #header{
        background:none;
        margin-top:2px;
    }
    .card-header{
        text-transform: uppercase !important;
        box-shadow: none !important;
    }
    .card-header h5{
        font-weight: 600 !important;
        color: black !important;
    }
    /* Written By Digvijay */

    .wrapper {
                    position: relative;
                    overflow: auto;
                    border: 1px solid black;
                    white-space: nowrap; 
                }


                
        .table-bordered th {
            border: 1px solid black !important;
        }

        .table-bordered td {
            border: 1px solid #74797d !important;
        }

        .table thead th {
            background: #fd8e51eb !important;
            color: black !important;
        }

        .table td {
            color: black !important;
        }

        .ti-filter{
            margin-top: 5px;
            color: #000f7d;
        }  

        .table td, .table th {
            padding: 0rem 0.5rem;
        }
        @media only screen and (min-device-width: 320px) and (max-device-width: 768px) {
            .select2-container{
                margin-bottom: 20px !important;
            }
        }

    </style>
</head>
<!-- Head Ends -->

<!-- Body Starts -->
<body>

    <!-- Pre-loader start -->
    <div class="theme-loader">
        <div class="loader-track">
            <div class="preloader-wrapper">
                <div class="spinner-layer spinner-blue">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>
                <div class="spinner-layer spinner-red">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>

                <div class="spinner-layer spinner-yellow">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>

                <div class="spinner-layer spinner-green">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Pre-loader end -->


    <div id="pcoded" class="pcoded">
        <div class="pcoded-overlay-box"></div>
        <div class="pcoded-container navbar-wrapper">
        <nav class="navbar header-navbar pcoded-header" style="background:white">
                <div class="navbar-wrapper">
                    <div class="navbar-logo">
                        <a class="mobile-menu waves-effect waves-light" id="mobile-collapse" href="#!">
                        <i class="ti-menu"></i>
                        </a>
                        <div class="mobile-search waves-effect waves-light">
                            <div class="header-search">
                                <div class="main-search morphsearch-search">
                                    <div class="input-group">
                                        <span class="input-group-prepend search-close"><i class="ti-close input-group-text"></i></span>
                                        <input type="text" class="form-control" placeholder="Enter Keyword">
                                        <span class="input-group-append search-btn"><i class="ti-search input-group-text"></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <a href="#" style="font-size: large;margin-left: 10px;">
                        <img src="../img/logo.png" class="img-responsive" style="width:160px;">
                        </a>
                        <a class="mobile-options waves-effect waves-light">
                            <i class="ti-more"></i>
                        </a>
                    </div>

                    <div class="navbar-container container-fluid">
                        <ul class="nav-left">
                            <li>
                            <button class="btn" class="btn btn-success" id="header"><i class="ti-menu"></i></button>
                            </li>
                            <!-- <li class="header-search">
                                <div class="main-search morphsearch-search">
                                    <div class="input-group">
                                        <span class="input-group-prepend search-close"><i class="ti-close input-group-text"></i></span>
                                        <input type="text" class="form-control" placeholder="Enter Keyword">
                                        <span class="input-group-append search-btn"><i class="ti-search input-group-text"></i></span>
                                    </div>
                                </div>
                            </li> -->
                            <li>
                                <a href="#!" onclick="javascript:toggleFullScreen()" class="waves-effect waves-light">
                                    <i class="ti-fullscreen"></i>
                                </a>
                            </li>
                            <li>
                                <h5 style="margin-top:15px;color:black;">Add Project</h5>
                            </li>
                        </ul>
                        
                        <ul class="nav-right">
                        <li style="margin-top:3px;">
                                    <span><a href="../dashboard/dashboard.php" style="color:black"> <i class="fa fa-calendar"></i> -</a></span>
                                    <span><a href="#" style="color:black"><?php echo $fy?></a></span>
                            </li> 
                            <li style="margin-top:3px;">
                                    <span><a href="../dashboard/dashboard.php"style="color:black"> <i class="fa fa-home"></i>/</a></span>
                                    <span><a href="#" style="color:black">Marketing/Project/Add Project</a></span>
                            </li> 
                            <li class="user-profile header-notification">
                                <a href="#!" class="waves-effect waves-light">
                                    <img src="../files/assets/images/man.png" class="img-radius" alt="User-Profile-Image">
                                    <span style="color:black"><?php echo $userName?></span>
                                    <i class="ti-angle-down"></i>
                                </a>
                                <ul class="show-notification profile-notification">
                                    <li class="waves-effect waves-light">
                                        <a href="../index.php">
                                            <i class="ti-layout-sidebar-left"></i> Logout
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
        </nav>


            <!-- Main-container starts-->
            <div class="pcoded-main-container">
                <div class="pcoded-wrapper">
                <nav class="" id="sideNavebar">
                        
                    </nav>

                    <div class="pcoded-content">
                        <!-- Page-header start -->
                        <!-- <div class="page-header">
                            <div class="page-block">
                                <div class="row align-items-center">
                                    <div class="col-md-8">
                                        <div class="page-header-title">
                                            <h5 class="m-b-10">Project</h5>
                                            <p class="m-b-0">Add Project</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <ul class="breadcrumb">
                                            <li class="breadcrumb-item">
                                                <a href="../dashboard/dashboard.php"> <i class="fa fa-home"></i> </a>
                                            </li>
                                            <li class="breadcrumb-item"><a href="addproject.php">Project</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div> -->
<!-- Page-header end -->
<div class="pcoded-inner-content">
    <!-- Main-body start -->
    <div class="main-body">
        <div class="page-wrapper">
            <!-- Page-body start -->
             <!-- Form Elements Starts-->
            <div class="page-body"><!-- div page body start -->
                <div class="row"><!-- div row start -->         
                    <div class="col-sm-12"><!-- div start -->
                        <div class="card"><!-- card start -->

                        <div class="card-header" style="height:43px">
                            <h5>Project Details</h5>
                        </div>
                            <!-- card block start -->
                            <div class="card-block">
                            <form method="POST" enctype="multipart/form-data" id="projectData23" class="form-material" novalidate>
                                <div class="form-group row" style="margin-top:-8px"> 

                                    <div class="col-sm-4">
                                        <select name="custId" id="custId" class="js-example-basic-single col-md-12" onChange="getSubCat(this.value);" required>
                                            <option value="" selected disabled>Select Company Name</option>
                                            <?php 
                                            $selectCustName = mysqli_query($con, "Select DISTINCT * From customer_master WHERE COMPANY_CAT_ID LIKE '%1%' order by CUSTOMER_NAME ASC");
                                            while($custRow = mysqli_fetch_assoc($selectCustName))
                                            {
                                            echo "<option value=".$custRow['CUSTOMER_ID']."> ".$custRow['CUSTOMER_NAME'] ."</option>";
                                            }
                                            ?>
                                        </select>
                                    </div>

                                    <div class="col-sm-4">
                                        <select name="shippingAddrId" onchange="shippingPersonDetails(this)" class="js-example-basic-single col-md-12"id="shippingAddress" required>
                                            <option value="opt1" selected>Select Shipping Address</option>
                                            <!-- <option value="opt2">Address 1</option>
                                            <option value="opt3">Address 2</option>
                                            <option value="opt4">Address 3</option>  -->
                                        </select>
                                        
                                    </div>

                                    <div class="col-sm-4">
                                        <select name="billingAddrId" onchange="BillingPersonalDeatils()" class="js-example-basic-single col-md-12" id="billingAddress" required>
                                            <option value="opt1" selected>Select Billing Address</option>
                                            <!-- <option value="opt2">Address 1</option>
                                            <option value="opt3">Address 2</option>
                                            <option value="opt4">Address 3</option> -->
                                        </select>
                                    </div>
                                </div>

    
                                <div style="">
                                
                                <div class="form-group row">
                                    <div class="col-sm-6" >
                                        <!-- <div class="form-group form-primary ">
                                            <input type="text" class="form-control" id="shippingContactPerson" name="shippingContactPerson">
                                            <span class="form-bar"></span>
                                            <label class="float-label">Shipping Person Name</label>
                                        </div>     -->
                                        <select name="shippingContactPerson" onchange="shipping(this)" id="shippingContactPerson" class="js-example-basic-single col-md-12">
                                        <option selected>Select Shipping Person Name</option>
                                        </select>
                                    </div>
                                    <div class="col-sm-6" >
                                        <select id="billingContactPerson" name="billingContactPerson" class="js-example-basic-single col-md-12" onchange="billing(this)">
                                        <option selected> Select Billing Person Name</option>
                                        </select>
                                    </div>
                                 </div>
                                  
                                 <div class="form-group row " style="margin-top: 30px;" id="add_details">
                                 
                                    <div class="col-sm-3 prsn_contact">
                                        <div class="form-group form-default form-static-label ">
                                            <input type="text" class="form-control form-control-normal" id="shippingContactNumber" name="shippingContactNumber"  onkeypress="return isNumberKey(event)">
                                            
                                            <span class="form-bar"></span>
                                            <label class="float-label">Shipping Person Contact</label>
                                        </div>    
                                    </div>
                                    <div class="col-sm-3 prsn_contact">
                                        <div class="form-group form-default form-static-label">
                                            <input type="text" class="form-control form-control-normal" id="shippingEmail" name="shippingEmail">
                                            
                                            <span class="form-bar"></span>
                                            <label class="float-label">Shipping Person Email</label>
                                        </div>    
                                    </div>

                                    
                                    <div class="col-sm-3 prsn_contact1">
                                        <div class="form-group form-default form-static-label">
                                            <input type="text" class="form-control form-control-normal" id="billingContactNumber" name="billingContactNumber"  onkeypress="return isNumberKey(event)">
                                            <span class="form-bar"></span>
                                            <label class="float-label">Billing Person Contact</label>
                                        </div>    
                                    </div>
                                    <div class="col-sm-3 prsn_contact1">
                                        <div class="form-group form-default form-static-label ">
                                            <input type="text" class="form-control form-control-normal" id="billingEmail" name="billingEmail"> 
                                            <span class="form-bar"></span>
                                            <label class="float-label">Billing Person Email</label>
                                        </div>    
                                    </div>
                                 </div>

                                 <div class="form-group row" style="margin-top:-10px">

                                    <div class="col-sm-2" style="color: black;">
                                        Customer Ambassador : 
                                    </div>
                                    <!-- <div class="col-sm-4">
                                        
                                        <div class="form-radio " style="float: left;margin-left: -50px;" id="ambassador">
                                            <div class="radio radio-outline radio-inline">
                                                <label>
                                                    <input type="radio" class ="custAmbassador" name="customerAmbassador" id="agp" value="AGP" required <?php echo ($customerAmbassador=='AGP')?"checked":"" ;?>>
                                                    <i class="helper"></i>AGP
                                                </label>
                                            </div>

                                            <div class="radio radio-outline radio-inline">
                                                <label>
                                                    <input type="radio" class="custAmbassador" name="customerAmbassador" id="svj" value="SVJ" <?php echo ($customerAmbassador=='SVJ')?"checked":"" ;?>>
                                                    <i class="helper"></i>SVJ
                                                </label>
                                            </div>

                                            <div class="radio radio-outline radio-inline">
                                                <label>
                                                    <input type="radio" class="custAmbassador" name="customerAmbassador" id="rpk" value="RPK" <?php echo ($customerAmbassador=='RPK')?"checked":"" ;?>>
                                                    <i class="helper"></i>RPK
                                                </label>
                                            </div>

                                            <div class="radio radio-outline radio-inline">
                                                <label>
                                                    <input type="radio" class="custAmbassador" name="customerAmbassador" id="otherAmbassador" value="OTHER" <?php echo ($customerAmbassador=='OTHER')?"checked":"" ;?>>
                                                    <i class="helper"></i>OTHER
                                                </label>
                                            </div>

                                        </div>  
                                    </div> -->
                                    <div class="col-sm-4">
                                        <div class="form-radio " style="float: left;" id="ambassador">
                                            <?php 
                                                $getAmbassador = mysqli_query($con,"select * from employeemaster where Ambassador='1'");
                                                while($rows = mysqli_fetch_assoc($getAmbassador))
                                                {
                                                    ?>
                                                        <div class="radio radio-outline radio-inline">
                                                            <label>
                                                                <input type="radio" class ="custAmbassador" name="customerAmbassador" id="agp" value="<?php echo $rows['shortname'];?>">
                                                                <i class="helper"></i><?php echo $rows['shortname'];?>
                                                            </label>
                                                        </div>
                                                    <?php
                                                }


                                            ?>
                                            
                                                        <!-- <div class="radio radio-outline radio-inline">
                                                            <label>
                                                                <input type="radio" class ="custAmbassador" name="customerAmbassador" id="otherAmbassador" value="OTHER">
                                                                <i class="helper"></i>OTHER
                                                            </label>
                                          
                                        </div> -->
                                    </div>
                                    <div class="col-sm-4"  id="otherCustAmbassadorInput" style="display:none">
                                        <div class="form-group form-default form-static-label">
                                            <!-- <input type="text" id="otherAmbassador" class="form-control" name="customerAmbassador1" value="<?php echo $ambassadorOther;?>">
                                            <span class="form-bar"></span>
                                            <label class="float-label">Mention Customer Ambassador Name</label> -->
                                            <select name="customerAmbassador1" id="otherAmbassador1" class="js-example-basic-single col-md-12" required>
                                                <option value="" selected disabled>Select Customer Ambassador Name</option>
                                                <?php 
                                                $selectProductName = mysqli_query($con, "Select employeeId,name From employeemaster as e inner join user_department_permissions as u on e.employeeId = u.USER_ID where u.DEPARTMENT_ID = 1");
                                                while($productRow = mysqli_fetch_assoc($selectProductName))
                                                {
                                                echo "<option value=".$productRow['name']."> ".$productRow['name'] ."</option>";
                                                }
                                            ?>
                                        </select>
                                        </div>
                                    </div>
                                </div>
                               
                                </div>

                                </div>
                                </form>



                                
                            </div> <!-- card block end -->
                                   
                        </div><!-- card end -->
                       
                    </div><!-- div end -->
                    
        <!-- Po card start -->
        <div id="filedetails"></div>
        <form method="POST" enctype="multipart/form-data" id="projectData" class="form-material" novalidate style="width:100%">
        <div class="col-md-12" >
         <div class="card" calss="card_id_unique" >
            <div class="card-header" style="height:46px">
                <h5>File Details</h5>
                <span align="right">
                <!-- <button type="button" class="btn btn-primary clone-btn-right clone">
                    <i class="icofont icofont-plus"></i>
                </button>
                <button type="button" class="btn btn-default clone-btn-right delete">
                    <i class="icofont icofont-minus"></i>
                </button> -->
                    <a href="javascript:void(0);" id="appendInuts"  ><img class="img-responsive" src="../files/assets/images/plus.png" alt="Add PO" style="margin-top: -76px; margin-right: 10px;">
                    </a>
                    <!-- <a href="javascript:void(0);"  ><img class="img-responsive" src="../files/assets/images/minus.png" alt="Remove PO" style="width: 50px;  margin-top:-15px"></a> -->
                </span>

            </div>
            <!-- card block start -->
            <div class="card-block">
                <!-- <form method="POST" enctype="multipart/form-data" id="filedata"> -->
                    <div id="filedata" enctype="multipart/form-data">
                        <input type="hidden" id="custid1" name="custid">
                        <input type="hidden" id="shippingAdd" name="shippingAdd">
                        <input type="hidden" id="billingAdd" name="billingAdd">
                        <input type="hidden" id="shippingPerson" name="shippingPerson">
                        <input type="hidden" id="billingPerson" name = "billingPerson">
                        <input type="hidden" id="shippingContact" name="shippingContact">
                        <input type="hidden" id="billingContact" name="billingContact">
                        <input type="hidden" id="shippingemail" name="shippingemail">
                        <input type="hidden" id="billingemail" name="billingemail">
                        <input type="hidden" id="projectidset" name="projectidset">
                        <div id="tobeclonedLayout">
                            <div class="form-group row">                                    
                                <div class="col-sm-2">
                                    <div class="form-group form-default form-static-label">
                                        <input type="text" class="form-control" id="fileName" name="fileName[]" onkeyup="fileSearch()"onclick="showAlertMessage(this.id)" required onkeyup="this.value = this.value.toUpperCase();" style="margin-top: 2px;">
                                        <span class="form-bar"></span>
                                        <label class="float-label">File Name</label>
                                    </div>    
                                </div>
                                <div class="col-sm-2">
                                    <div class="form-group form-default form-static-label">
                                        <!-- fileTypeValidation(); -->
                                        <select name="fileTypeId[]" class="js-example-basic-single" id="poType" onchange="getParentFileNo(this.value);getvalue(this);">
                                                <option value="" selected disabled>File Type</option>
                                                <?php 
                                                $selectProductName = mysqli_query($con, "select * from file_type_master");
                                                while($productRow = mysqli_fetch_assoc($selectProductName))
                                                {
                                                echo "<option value=".$productRow['FILE_TYPE_ID'].'-'.$productRow['FILE_TYPE_MAPPING']."> ".$productRow['FILE_TYPE_NAME'] ."</option>";
                                                }
                                            ?>
                                        </select>
                                        <span class="form-bar"></span>
                                        <label class="float-label">File Type</label>
                                    </div> 
                                </div>
                                <div class="col-sm-3" id="change1">
                                    <div class="form-group form-default form-static-label">
                                        <!-- <select name="productId" class="form-control select" required>
                                                <option value="" selected disabled>Parent file No.</option>
                                            <?php 
                                                $selectProductName = mysqli_query($con, "select * from file_type_master");
                                                while($productRow = mysqli_fetch_assoc($selectProductName))
                                                {
                                                echo "<option value=".$productRow['	FILE_TYPE_MAPPING']."> ".$productRow['FILE_TYPE_NAME'] ."</option>";
                                                }
                                            ?>
                                        </select> -->
                                        <select name="parentFileNo[]" id="parentFileNo" class="js-example-basic-single col-md-12 cities"></select>
                                        <span class="form-bar"></span>
                                        <label class="float-label">Reference File Name</label>
                                    </div>
                                </div>
                                <div class="col-sm-3" id="change2">
                                    <div class="form-group form-default form-static-label">
                                        <input type="text" class="form-control"  id="quotationNumber" name="quotationNumber[]">
                                        <span class="form-bar"></span>
                                        <label class="float-label">Quotation Number</label>
                                    </div>    
                                </div>
                                <div class="col-sm-2">
                                    <div class="form-group form-default form-static-label">
                                        <input type="date" class="form-control" id="quotationDate" name="quotationDate[]">
                                        <span class="form-bar"></span>
                                        <label class="float-label">Quotation Date</label>
                                    </div>    
                                </div>
                                <div class="col-sm-2" style="display:none" id="change3">
                                        <select name="finacialYear[]" id="finacialYear12" class="js-example-basic-single col-md-12 cities">
                                      
                                            <?php
                                                $getFy=mysqli_query($con,"select * from financial_year fy order by id desc");
                                                while($rowFy=mysqli_fetch_assoc($getFy))
                                                {
                                                    if($rowFy['status']==1)
                                                    {
                                                        $optionS='selected';
                                                    }
                                                    else
                                                    {
                                                        $optionS='';
                                                    }
                                                    ?>
                                                        <option value="<?php echo $rowFy['financial_year']?>"><?php echo $rowFy['financial_year']?></option>
                                                    <?php
                                                }
                                            ?>              
                                           
                                            <!-- <option value='23-24'>23-24</option>
                                            <option value='24-25'>24-25</option>
                                            <option value='25-26'>25-26</option>
                                            <option value='26-27'>26-27</option>
                                            <option value='27-28'>27-28</option>
                                            <option value='28-29'>28-29</option>
                                            <option value='29-30'>29-30</option> -->
                                        </select>
                                </div>

                            </div>
                             
                            <div id="HideAMC">
                                <div class="form-group row">
                                    <div class="col-md-3">
                                        <select name="productId[]" id="productId3" class="js-example-basic-single col-md-12" required>
                                                <option value="" selected disabled>Product Type</option>
                                                <?php 
                                                $selectProductName = mysqli_query($con, "Select * From product_master");
                                                while($productRow = mysqli_fetch_assoc($selectProductName))
                                                {
                                                echo "<option value=".$productRow['PRODUCT_ID']."> ".$productRow['PRODUCT_NAME'] ."</option>";
                                                }
                                            ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group form-primary "> 
                                            <textarea class="form-control" id="projectDescription" name="projectDescription[]" required></textarea>
                                            <span class="form-bar"></span>
                                            <label class="float-label">Product description</label>
                                        </div>
                                    </div>
                                    <div class="col-sm-3">
                                        <div class="form-group form-default form-static-label" style="    padding-top: 6px;">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text" class="form-control form-control-normal" id="storeLocation" name="storeLocation[]">
                                                <span class="form-bar"></span>
                                                <label class="float-label">Store Location</label>
                                            </div>    
                                            
                                            <!-- <select name="storeLocation[]" data-placeholder="Store Location" id="storeLocation" class="js-example-basic-multiple col-md-12" multiple="multiple" required >
                                                <option value="" selected disabled>Store Location</option>
                                                <?php 
                                                $selectCustName = mysqli_query($con, "Select DISTINCT * From store_location_master");
                                                while($custRow = mysqli_fetch_assoc($selectCustName))
                                                {
                                                echo "<option value=".$custRow['id']."> ".$custRow['store_location'] ."</option>";
                                                }
                                                ?>
                                            </select>
                                            <span class="form-bar"></span>
                                            <label class="float-label">Store Location</label> -->
                                        </div>
                                    </div>
                                    <div class="col-sm-3">
                                        <div class="form-group form-primary ">
                                            <input type="text" class="form-control form-control-normal" id="unitLocation" name="unitLocation[]"> 
                                            <span class="form-bar"></span>
                                            <label class="float-label">Unit Location</label>
                                        </div>    
                                    </div>
                                </div>  
                                <div class="showBorder">
                                </div>
                                <div class="form-group row">
                                        <div class="col-sm-3">
                                            <select name="finacialYear[]" id="finacialYear" class="js-example-basic-single col-md-12 cities">
                                          
                                         
                                            <?php
                                                $getFy=mysqli_query($con,"select * from financial_year fy order by id desc");
                                                while($rowFy=mysqli_fetch_assoc($getFy))
                                                {
                                                    if($rowFy['status']==1)
                                                    {
                                                        $optionS='selected';
                                                    }
                                                    else
                                                    {
                                                        $optionS='';
                                                    }
                                                    ?>
                                                        <option value="<?php echo $rowFy['financial_year']?>"><?php echo $rowFy['financial_year']?></option>
                                                    <?php
                                                }
                                            ?>              
                                                <!-- <option value='23-24'>23-24</option>
                                                <option value='24-25'>24-25</option>
                                                <option value='25-26'>25-26</option>
                                                <option value='26-27'>26-27</option>
                                                <option value='27-28'>27-28</option>
                                                <option value='28-29'>28-29</option>
                                                <option value='29-30'>29-30</option> -->
                                                <!-- <option value='18-19'>18-19</option>
                                                <option value='18-19'>18-19</option>
                                                <option value='18-19'>18-19</option>
                                                <option value='18-19'>18-19</option> -->


                                            </select>
                                        
                                        </div> 
                                        <div class="col-sm-3">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text"  class="form-control" id="po_number1" name="po_number[]" >
                                                <span class="form-bar"></span>
                                                <label class="float-label">PO Number</label>
                                            </div> 
                                        </div>    
                                            
                                        <div class="col-sm-3">
                                            <div class="form-group form-default form-static-label">
                                                <input type="date" class="form-control" id="po_date1"  name="po_date[]">
                                                <span class="form-bar"></span>
                                                <label class="float-label" >PO Date</label>
                                            </div>
                                        </div> 

                                        <div class="col-sm-3">
                                            <input type="file" class="file"  name="file[]" id="file1"/>
                                        </div>            
                                    
                                </div>
                                <div class="form-group row">
                                        <div class="col-sm-2">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text" class="form-control rupee poBasicAmount1" id="poAmounts1" name="po_amount[]" onkeyup="poamountcal();" onkeypress="return isNumberKey(event);Comma(event)"style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" required>
                                                <span class="form-bar"></span>
                                                <label class="float-label">PO Basic Amount</label>
                                            </div>    
                                        </div>
                                        <input type="hidden" class="POAMOUNTDetails" name="poamountdetails[]" id="poamountdetails1">
                                        <div class="col-sm-2">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text"  class="form-control rupee cashAmount" onkeyup="poamountcal();" onkeypress="return isNumberKey(event);Comma(event)"id="Amt_cash"value="0"style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="AMT_cash[]" >
                                                <span class="form-bar"></span>
                                                <label class="float-label">Amount In Cash</label>
                                            </div> 
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text"  class="form-control rupee" id="orderAmt"value="0"style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="Order_Amt[]" >
                                                <span class="form-bar"></span>
                                                <label class="float-label">Order Amount</label>
                                            </div>
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text" class="form-control rupee labourAmount" id="LBamounts1" name="lb_amount[]"onkeypress="return isNumberKey(event);Comma(event)" value="0" style="margin-left:1px; height:30px; border:0px solid #000000; border-bottom-width:1px;background-color:transparent;">
                                                <span class="form-bar"></span>
                                                <label class="float-label">Freight Charges</label>
                                            </div>
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-default form-static-label">
                                                <select name="taxType[]" id="taxTypes1" class="form-control select">
                                                    <option value="9-18" selected> CGST(9%)+SGST(9%)</option>
                                                <?php 
                                                    $selectTaxName = mysqli_query($con, "select * from tax_master");
                                                    while($taxRow = mysqli_fetch_assoc($selectTaxName))
                                                    {
                                                    echo "<option value=".$taxRow['TAX_ID'].'-'.$taxRow['TAX_PERCENTAGE']."> ".$taxRow['TAX_NAME'] ."</option>";
                                                    }
                                                ?>
                                                </select>
                                                <span class="form-bar"></span>
                                                <label class="float-label">Type</label>
                                            </div>
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text" class="form-control taxamt rupee" id="taxAmounts1" name="taxAmount[]" style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;"readonly>
                                                <span class="form-bar"></span>
                                                <label class="float-label">Tax Amount</label>
                                            </div>
                                        </div>
                                        
                                </div>      
                                <div class="form-group row">
                                   
                                    <div class="col-sm-9">
                                        <div class="form-group form-default form-static-label">
                                            <textarea class="form-control"  placeholder="" id="cashComment" rows="1" cols="10" name="cashComment[]" required></textarea>
                                            <span class="form-bar"></span>
                                            <label class="float-label" style="margin-top:0px">Comment</label>
                                        </div>  
                                    </div>
                                    <div class="col-sm-3">
                                        <div class="form-group form-default form-static-label">
                                            <input type="text" class="form-control poTaxAmount1 rupee" id="poTaxAmount1s1" style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="po_Taxamount[]" readonly>
                                            <span class="form-bar"></span>
                                            <label class="float-label">PO Amount With Tax</label>
                                        </div>
                                    </div>
                                </div>          
                              <!-- ----------Payment Terms--------------- -->
                                <!-- <div class="form-group row">
                                    <div class="col-sm-7">
                                    <div class="form-group form-default form-static-label">
                                                <textarea class="form-control" placeholder="" id="payterms" row="2" col="12" name="payterms[]"></textarea>
                                                <span class="form-bar"></span>
                                                <label class="float-lable">Payment Terms</label>
                                    </div> 
                                    </div>
                                    <div class="col-sm-5">
                                    </div>
                                </div> -->
                                <!-- ---------------------- -->
                                <div class="form-group row">
                                    <div class="col-md-6">
                                        <div class="border-checkbox-section">      
                                        
                                            <label class="from-inline" id="MSg">Do you want to add Concerned Labour file</label>
                                            <div class="custom-control custom-radio radio-inline">
                                                <input type="radio" class="custom-control-input" data-modal="myModal" id="defaultChecked"    name="defaultExampleRadios">
                                                <label class="custom-control-label" for="defaultChecked">Yes</label>
                                            </div>
                                            <div class="custom-control custom-radio radio-inline">
                                                <input type="radio" class="custom-control-input" id="defaultChecked1"    name="defaultExampleRadios">
                                                <label class="custom-control-label" for="defaultChecked1">No</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="dynamicappendS"></div>
                                </div>
                                <div id="dynamicappend">    
                                </div>
                            </div>   
                            <div id="showAMC" style="display:none">
                                <div class="form-group row">
                                    <div class="col-sm-2">
                                        Product Type :
                                    </div>
                                    <div class="col-sm-4">
                                        AMC Duration :
                                    </div>
                                    <div class="col-sm-6">
                                        AMC Visit    :
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <input type="hidden" id="projectidset11" name="projectidset11">
                                    <div class="col-sm-2">
                                        <select name="productId[]" id="productId" class="js-example-basic-single col-md-12" required>
                                                <option value="" selected disabled>Product Type</option>
                                                <?php 
                                                $selectProductName = mysqli_query($con, "Select * From product_master");
                                                while($productRow = mysqli_fetch_assoc($selectProductName))
                                                {
                                                echo "<option value=".$productRow['PRODUCT_ID']."> ".$productRow['PRODUCT_NAME'] ."</option>";
                                                }
                                            ?>
                                        </select>
                                    </div>
                                    <div class="col-sm-2">
                                        <div class="form-group form-default form-static-label">
                                            <input type="month" class="form-control rupee" id="AmcFrom" style="border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="AMCFrom" placeholder=""required>
                                            <span class="form-bar"></span>
                                            <label class="float-label">AMC Start Date</label>
                                        </div>
                                    </div>
                                    <div class="col-sm-2">
                                        <div class="form-group form-default form-static-label">
                                            <input type="month" class="form-control rupee" id="AmcFrom" style="border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="AMCto" placeholder="" required>
                                            <span class="form-bar"></span>
                                            <label class="float-label">AMC Expire Date</label>
                                        </div>
                                    </div>
                                    <div class="col-sm-2">
                                        <div class="form-group form-default form-static-label">
                                            <input type="text" class="form-control" onkeyup="getTotalVisit(this.value)"id="AmcVisit" style=" border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="AMCVisit" placeholder=""pattern="^[0-9]*$" required>
                                            <span class="form-bar"></span>
                                            <label class="float-label">Total Visit NO</label>
                                        </div>
                                    </div>
                                    <div class="col-sm-4">
                                        <div class="col-sm-12" id="appendDate">
                                            
                                        </div>
                                    </div>
                                </div>
                                <div class="">
                                    <div class="view" style="margin-bottom: 25px;">
                                        <div class="wrapper">
                                            <table class="table table-bordered" id="mytable" style="margin-bottom:0px;">
                                                <thead>
                                                    <tr>
                                                        <th style="background: #bddff7;">PO NO</th>
                                                        <th style="background: #bddff7;">PO Date</th>
                                                        <th style="background: #bddff7;">PO Basic Amount</th>
                                                        <th style="background: #bddff7;">Tax</th>
                                                        <th style="background: #bddff7;">Tax Amount</th>
                                                        <th style="background: #bddff7;">Po Amount</th>
                                                        <th style="background: #bddff7;">Unit Location</th>
                                                        <th style="background: #bddff7;">Document Attach</th>
                                                        <th style="background: #bddff7;"></th>
                                                    </tr>
                                                </thead>
                                                
                                                <tbody>
                                                
                                                    <td><input type="text"  id="po_number" name="po_number[]"></td>
                                                    <td><input type="date" id="po_date" name="po_date[]"><input type="hidden" id="LBamount" value="0"></td>
                                                    
                                                    <td><input type="text"class="rupee poBasicAmount1" id="poAmount" name="po_amount[]" ></td>
                                                    <td><select name="taxType[]" id="taxType" style=" height: 27px;">
                                                    <option value="9-18" selected> CGST(9%)+SGST(9%)</option>
                                                <?php 
                                                    $selectTaxName = mysqli_query($con, "select * from tax_master");
                                                    while($taxRow = mysqli_fetch_assoc($selectTaxName))
                                                    {
                                                    echo "<option value=".$taxRow['TAX_ID'].'-'.$taxRow['TAX_PERCENTAGE']."> ".$taxRow['TAX_NAME'] ."</option>";
                                                    }
                                                ?>
                                                </select></td>
                                                    <td><input type="text" class="taxamt rupee" id="taxAmount" name="taxAmount[]"></td>
                                                    <td><input type="text" class="poTaxAmount1 rupee" id="poTaxAmount1"></td>
                                                    <td><input type="text" class="unit_loc" id="unit_loc" name="unitLocationAMC1[]"></td>
                                                    <td><input type="file" name="file[]" id="file"></td>
                                                    <td><button type="button" onclick="showdatas()"id="appendRow">Add</button></td>
                                                
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group row">
                                        <div class="col-sm-6">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text" class="form-control" id="MAE" style=" border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="MAE" placeholder=""pattern="^[0-9]*$" required>
                                                <span class="form-bar"></span>
                                                <label class="float-label">Marketing Allocated Expense(60% of PO Basic)</label>
                                            </div>
                                        </div>
                                        <div class="col-sm-6">
                                            <div class="form-group form-default form-static-label">
                                                <input type="text" class="form-control" id="EEA" style=" border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="EEA" placeholder=""pattern="^[0-9]*$" required>
                                                <span class="form-bar"></span>
                                                <label class="float-label">Expected Estimation AMC</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                    </div>
                    </div>
                      <!--End Of to be cloned Layout  -->
                <!-- </form> -->
             <div class="">        
                        <div class="col-sm-12">
                            <div class="card">
                                <div class="card-block">
                                <!-- <form method="POST" novalidate> -->
                                    <div class="form-group row" style="margin-left: 0px;margin-right: 0px;" >
                                    
                                        <div class="col-md-6"style="border: 1px solid grey;padding-top:19px">
                                            <div class="row">
                                                <div class="col-sm-2">
                                                    Material :
                                                </div>
                                                <div class="col-sm-10"> 
                                                <div class="border-checkbox-section">
                                                    <div class="border-checkbox-group border-checkbox-group-primary"style="" id="ABG1">
                                                    <input class="border-checkbox" type="checkbox" id="ABG" name="boundType[]" style="display:none" value="ABG" onclick="showdata3()">
                                                    <label class="border-checkbox-label" for="ABG">ABG</label>
                                                    </div>

                                                    <div class="border-checkbox-group border-checkbox-group-primary"style="" id="PBG1">
                                                    <input class="border-checkbox" type="checkbox" id="PBG" name="boundType[]" style="display:none" value="PBG"onclick="showdata3()">
                                                    <label class="border-checkbox-label" for="PBG">PBG</label>
                                                    </div> 
                                                        
                                                    <div class="border-checkbox-group border-checkbox-group-primary"style="" id="PC1">
                                                    <input class="border-checkbox" type="checkbox" id="PC" name="boundType[]" style="display:none" value="PC"onclick="showdata3()">
                                                    <label class="border-checkbox-label" for="PC">Penalty Clause</label>
                                                    </div>

                                                    <div class="border-checkbox-group border-checkbox-group-primary"style="" id="ADV1">
                                                    <input class="border-checkbox" type="checkbox" id="AVT" name="boundType[]" style="display:none" value="ADV"onclick="showdata3()">
                                                    <label class="border-checkbox-label" for="AVT">Advance</label>
                                                    </div> 
                                                        
                                                </div>
                                                </div>
                                            </div>
                                            <br>
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <div class="form-group form-primary form-static-label">
                                                        <input type="text" class="form-control rupee" id="poBasicAmtM" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;"name="poBasicAmtM" value="0" readonly>
                                                        <span class="form-bar"></span>
                                                        <label class="float-label" style=" color:black" ><b>Total PO Basic Amount</b></label>
                                                    </div> 
                                                </div>
                                                <div class="col-sm-4">
                                                    <div class="form-group form-primary form-static-label">
                                                        <input type="text" class="form-control rupee" id="poTotalTaxAmtM" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;"name="poTotalAmtM" value="0" readonly>
                                                        <span class="form-bar"></span>
                                                        <label class="float-label"style="color:black">Total Tax Amount</label>
                                                    </div> 
                                                </div>
                                                <div class="col-sm-4">
                                                    <div class="form-group form-primary form-static-label">
                                                        <input type="text" class="form-control rupee" id="poTotalAmtM" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;"name="poTotalAmtM" readonly>
                                                        <span class="form-bar"></span>
                                                        <label class="float-label" style=" color:black">Total Amount With Tax</label>
                                                    </div> 
                                                </div>
                                            </div>
                                       
                                            <div class="row">
                                                <div class="form-group row" style="display:none;margin-top: -10px;margin-left:5px" id="show14">
                                                        <div class="col-sm-12">
                                                            <P style="text-decoration: underline;">ADVANCE BANK GUARANTEE</P>
                                                            <div class="row">
                                                                <div class="col-sm-2">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="text" class="form-control" id="bankGno" name="bankGno1" placeholder=""  pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.No</label>
                                                                    </div>
                                                                </div>
                                                                <!-- <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;     margin-top: 13px;   height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt[]" placeholder=""pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Amt</label>
                                                                    </div>
                                                                </div> -->
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="BGDate" name="BGDate1" style="font-size:13px">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Date</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="todate" name="BGEDate1"style="font-size:13px;" placeholder="po recevice date">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G. Exp. Date</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="enddate" name="BCdate1"style="font-size:13px;"placeholder="end date">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">
                                                                        Bank Claim Date</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;     margin-top: 13px;   height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt1" placeholder=""pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Amt</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                <input type="file" class="file" name="file11" id="file"/>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                <div class="form-group row" style="display:none;margin-top: -13px;margin-left:5px" id="show15">
                                                    <div class="col-sm-12">
                                                        <P style="text-decoration: underline;">PERFORMANCE BANK GUARANTEE</P>
                                                        <!-- <div class="row">
                                                            <div class="col-sm-2">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control" id="bankGno" name="bankGno[]" placeholder=""  pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Bank G.No</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-3">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;     margin-top: 13px;   height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt[]" placeholder=""pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Bank G.Amt</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-3">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="todate" name="porecDate[]" style="font-size:13px;"placeholder="po recevice date">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Po Recevice Date</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-3">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="enddate" name="enddate[]" style="font-size:13px;"placeholder="end date">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">End Date</label>
                                                                </div>
                                                            </div>
                                                        </div> -->
                                                        <div class="row">
                                                                <div class="col-sm-2">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="text" class="form-control" id="bankGno" name="bankGno2" placeholder=""  pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.No</label>
                                                                    </div>
                                                                </div>
                                                                <!-- <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;     margin-top: 13px;   height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt[]" placeholder=""pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Amt</label>
                                                                    </div>
                                                                </div> -->
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="BGDate" name="BGDate2" style="font-size:13px">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Date</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="todate" name="BGEDate2"style="font-size:13px;" placeholder="po recevice date">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G. Exp. Date</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="enddate" name="BCdate2"style="font-size:13px;"placeholder="end date">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">
                                                                        Bank Claim Date</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;     margin-top: 13px;   height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt2" placeholder=""pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Amt</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                <input type="file" class="file" name="file12" id="file"/>
                                                                </div>
                                                            </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row" style="display:none;margin-top: -13px;margin-left:5px" id="penaultyClause">
                                                    <div class="col-sm-12">
                                                        <P style="text-decoration: underline;">PENAULTY CLAUSE</P>
                                                        <div class="row">
                                                            <div class="col-sm-4">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="dispatchDate" name="dispatchDate1">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Final Dispatch Date</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-4">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control" id="penalty" name="penalty1" placeholder="penalty"pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Penalty Clause in(%)</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-4">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="poreceiveDate" name="poreceiveDate1">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">PO receive date</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row" style="display:none;margin-top: -13px;margin-left:5px" id="advanceShow">
                                                    <div class="col-sm-12">
                                                        <P style="text-decoration: underline;">ADVANCE AMAOUNT</P>
                                                        <div class="row">
                                                            <div class="col-sm-12">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control rupee" id="Advanceamt" style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="Advanceamt1" pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Advance Amount</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        </div>
                                        <div class="col-md-6"style="border: 1px solid grey;padding-top:19px">
                                            <div class="row">
                                                <div class="col-sm-2">
                                                    Labour :
                                                </div>
                                                <div class="col-sm-10">
                                                <div class="border-checkbox-section">      
                                                    <div class="border-checkbox-group border-checkbox-group-primary">
                                                    <input class="border-checkbox" type="checkbox" id="GD1" name="boundType[]" style="" value="PBG1" onclick="showdata3()">
                                                    <label class="border-checkbox-label" for="GD1">PBG</label>
                                                    </div>
                                                    <div class="border-checkbox-group border-checkbox-group-primary">
                                                    <input class="border-checkbox" type="checkbox" id="GD2" name="boundType[]" style="" value="PC1" onclick="showdata3()">
                                                    <label class="border-checkbox-label" for="GD2">Penalty Clause</label>
                                                    </div>
                                                    <div class="border-checkbox-group border-checkbox-group-primary">
                                                    <input class="border-checkbox" type="checkbox" id="GD3" name="boundType[]" style="" value="AVT1" onclick="showdata3()">
                                                    <label class="border-checkbox-label" for="GD3">Advance</label>
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                            <br>
                                            <div class="row">
                                                    <div class="col-sm-4">
                                                        <div class="form-group form-primary form-static-label">
                                                            <input type="text" class="form-control rupee" id="poBasicAmtL" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;"name="poBasicAmt" value="0"readonly>
                                                            <span class="form-bar"></span>
                                                            <label class="float-label" style=" color:black" ><b>Total PO Basic Amount</b></label>
                                                        </div> 
                                                    </div>
                                                    <div class="col-sm-4">
                                                        <div class="form-group form-primary form-static-label">
                                                            <input type="text" class="form-control rupee" id="poTotalTaxAmtL" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;"name="poTotalAmt" value="0"readonly>
                                                            <span class="form-bar"></span>
                                                            <label class="float-label"style="color:black">Total Tax Amount</label>
                                                        </div> 
                                                    </div>
                                                    <div class="col-sm-4">
                                                        <div class="form-group form-primary form-static-label">
                                                            <input type="text" class="form-control rupee" id="poTotalAmtL" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;"name="poTotalAmt" value="0" readonly>
                                                            <span class="form-bar"></span>
                                                            <label class="float-label" style=" color:black">Total Amount With Tax</label>
                                                        </div> 
                                                    </div>
                                            </div>
                                          
                                            <div class="row">
                                            <div class="form-group row" style="display:none;margin-top: -13px;margin-left:5px" id="show16">
                                                    <div class="col-sm-12">
                                                        <P style="text-decoration: underline;">PERFORMANCE BANK GUARANTEE</P>
                                                        <!-- <div class="row">
                                                            <div class="col-sm-2">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control" id="bankGno" name="bankGno[]" placeholder=""  pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Bank G.No</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-3">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;     margin-top: 13px;   height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt[]" placeholder=""pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Bank G.Amt</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-4">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="todate" name="porecDate[]" style="font-size:13px;"placeholder="po recevice date">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Po Recevice Date</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-3">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="enddate" name="enddate[]" placeholder="end date">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">End Date</label>
                                                                </div>
                                                            </div>
                                                        </div> -->
                                                        <div class="row">
                                                                <div class="col-sm-2">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="text" class="form-control" id="bankGno" name="bankGno3" placeholder=""  pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.No</label>
                                                                    </div>
                                                                </div>
                                                                <!-- <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;     margin-top: 13px;   height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt[]" placeholder=""pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Amt</label>
                                                                    </div>
                                                                </div> -->
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="BGDate" name="BGDate3" style="font-size:13px">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Date</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="todate" name="BGEDate3"style="font-size:13px;" placeholder="po recevice date">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G. Exp. Date</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                        <input type="date" class="form-control" id="enddate" name="BCdate3"style="font-size:13px;"placeholder="end date">
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">
                                                                        Bank Claim Date</label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="row">
                                                                <div class="col-sm-3">
                                                                    <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control rupee" id="bankGamt" style="margin-left: 1px;margin-top: 13px;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="bankGamt3" placeholder=""pattern="^[0-9]*$" required>
                                                                        <span class="form-bar"></span>
                                                                        <label class="float-label">Bank G.Amt</label>
                                                                    </div>
                                                                </div>
                                                                <div class="col-sm-3">
                                                                <input type="file" class="file" name="file13" id="file"/>
                                                                </div>
                                                            </div>
                                                    </div>
                                                </div>
                                        </div>
                                        <div class="form-group row" style="display:none;margin-top: -13px;margin-left:5px" id="penaultyClause1">
                                                    <div class="col-sm-12">
                                                        <P style="text-decoration: underline;">PENAULTY CLAUSE</P>
                                                        <div class="row">
                                                            <div class="col-sm-4">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="dispatchDate" name="dispatchDate2">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Final Dispatch Date</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-4">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control" id="penalty" name="penalty2" placeholder="penalty"pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Penalty Clause in(%)</label>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-4">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="date" class="form-control" id="poreceiveDate" name="poreceiveDate2">
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">PO receive date</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group row" style="display:none;margin-top: -13px;margin-left:5px" id="advanceShow1">
                                                    <div class="col-sm-12">
                                                        <P style="text-decoration: underline;">ADVANCE AMAOUNT</P>
                                                        <div class="row">
                                                            <div class="col-sm-12">
                                                                <div class="form-group form-default form-static-label">
                                                                    <input type="text" class="form-control rupee" id="Advanceamt" style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" name="Advanceamt2" pattern="^[0-9]*$" required>
                                                                    <span class="form-bar"></span>
                                                                    <label class="float-label">Advance Amount</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            </div>
                                  
                                        
                                        <div>
                                    <div class="form-group row"style="">
                                        <div class="col-sm-2" id="change3">
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-primary form-static-label">
                                                <i class="fa fa-rupee"></i><input type="text" class="form-control rupee" id="poBasicAmt" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;    width: 90%;"name="poBasicAmt" readonly>
                                                <span class="form-bar"></span>
                                                <label class="float-label" style="-webkit-text-stroke-width: medium; color:black" ><b>Total PO Basic Amount</b></label>
                                            </div> 
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-primary form-static-label">
                                                <i class="fa fa-rupee"></i><input type="text" class="form-control rupee" id="poTotalTaxAmt" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;    width: 90%;"name="poTotalAmt" readonly>
                                                <span class="form-bar"></span>
                                                <label class="float-label"style="-webkit-text-stroke-width: medium; color:black">Total Tax Amount</label>
                                            </div> 
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-primary form-static-label">
                                                <i class="fa fa-rupee"></i><input type="text" class="form-control rupee" id="TotalCashAmount" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;    width: 90%;"name="TotalCashAmount" readonly>
                                                <span class="form-bar"></span>
                                                <label class="float-label" style="-webkit-text-stroke-width: medium; color:black">Total Amount With Cash</label>
                                            </div> 
                                        </div>
                                        <div class="col-sm-2">
                                            <div class="form-group form-primary form-static-label">
                                                <i class="fa fa-rupee"></i><input type="text" class="form-control rupee" id="poTotalAmt" style="margin-left: 1px;font-weight: bold;height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;    width: 90%;"name="poTotalAmt" readonly>
                                                <span class="form-bar"></span>
                                                <label class="float-label" style="-webkit-text-stroke-width: medium; color:black">Total Amount With Tax</label>
                                            </div> 
                                        </div>
                                        
                                    </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div><!-- div row end -->
            </div> 
             <!--Card Block End  -->
<!-- Po Div end -->
             </div><!-- div page body end -->                            

          

            <!-- <button type="button" class="btn btn-default waves-effect" data-toggle="modal" data-target="#default-Modal">Upload PO</button> -->

             
            
            <!-- animation modal Dialogs start -->
            <div class="md-modal md-effect-1" id="modal-1">
                <div class="md-content">
                    <h3 style="font-size: large;">Add Project</h3>
                    <div>
                        <p style="text-align:center">Do you really want to save this information?</p>
                       
                        <div style="text-align:center">
                            <button type="submit" name="save" class="btn btn-primary">Save</button>&nbsp;&nbsp;
                            <button type="button" class="btn btn-primary waves-effect md-close">Close</button>
                            
                        </div> 
                    </div>
                </div>
            </div>   

            <button type="button" class="btn btn-primary waves-effect md-trigger" data-modal="modal-2" style="margin-left:30px;display:none;margin-top: -20px;" id="projectSubmit1">Submit1</button>
            <div class="md-modal md-effect-1" id="modal-2">
                <div class="md-content">
                    <h3 style="font-size: large;">Add Project</h3>
                    <div>
                        <p style="text-align:center">Do you want to Add Files For This project</p>
                        <div style="text-align:center">
                            <button type="button" name="savefile" id ="savefile"class="btn btn-primary">Save</button>&nbsp;&nbsp;
                            <button type="button" class="btn btn-primary waves-effect md-close">Close</button>
                        </div> 
                    </div>
                </div>
            </div> 
            <button type="button" style="display:none" class="btn btn-primary waves-effect md-trigger" id="billingButton" data-modal="billingModel">Launch modal</button>

            <div class="md-modal md-effect-1" id="billingModel">
                <div class="md-content">
                    <h3>Billing Contact Details</h3>
                    <div>
                        <div class="form-group form-default form-static-label">
                            <label class="float-label">Contact Person Name</label>
                            <input type="text" class="form-control" placeholder="" id="billingName" name="billingContactPerson[]" required="">
                            <span class="form-bar"></span>
                        </div>
                        <div class="form-group form-default form-static-label">
                            <label class="float-label">Contact No.</label>
                            <input type="text" class="form-control" placeholder="" id="billingContact12" name="billingContactPerson[]" required="">
                            <span class="form-bar"></span>
                        </div>
                        <div class="form-group form-default form-static-label">
                            <label class="float-label">Contact Email</label>
                            <input type="text" class="form-control" placeholder="" id="billingEmail12" name="billingContactPerson[]" required="">
                            <span class="form-bar"></span>
                        </div>
                        <div style="text-align:center">
                            <button type="button" name="billingProfileSave" id ="billingProfileSave"class="btn btn-primary md-close">Save</button>&nbsp;&nbsp;
                            <!-- <button type="button" class="btn btn-primary waves-effect md-close">Close</button> -->
                        </div> 
                    </div>
                </div>
            </div> 

                  <button type="button" style="display:none" class="btn btn-primary waves-effect md-trigger" id="shippingButton" data-modal="shippingModel">Launch modal</button>

            <div class="md-modal md-effect-1" id="shippingModel">
                <div class="md-content">
                    <h3>Shipping Contact Details</h3>
                    <div>
                        <div class="form-group form-default form-static-label">
                            <label class="float-label">Contact Person Name</label>
                            <input type="text" class="form-control" placeholder="" id="shippingName" name="shippingContactPerson[]" required="">
                            <span class="form-bar"></span>
                        </div>
                        <div class="form-group form-default form-static-label">
                            <label class="float-label">Contact Person Contact</label>
                            <input type="text" class="form-control" placeholder="" id="shippingContact12" name="shippingContactPerson[]" required="">
                            <span class="form-bar"></span>
                        </div>
                        <div class="form-group form-default form-static-label">
                            <label class="float-label">Contact Person Email</label>
                            <input type="text" class="form-control" placeholder="" id="shippingEmail12" name="shippingContactPerson[]" required="">
                            <span class="form-bar"></span>
                        </div>
                        <div style="text-align:center">
                            <button type="button" name="shippingProfileSave" id ="shippingProfileSave"class="btn btn-primary md-close">Save</button>&nbsp;&nbsp;
                            <!-- <button type="button" class="btn btn-primary waves-effect md-close">Close</button> -->
                        </div> 
                    </div>
                </div>
            </div>                       
            </form>
                                                                               
        </div>
        <center><button class="btn btn-primary waves-effect md-trigger" data-modal="modal-1" style="margin-left:30px;margin-top: -20px;" id="projectSubmit">Submit</button></center>
        <br/>
        <!-- <button class="btn btn-default waves-effect">Cancel</button>   -->
    </div>

</div>
<!-- Page-body end -->

                        <!-- </div> -->
                                <div id="styleSelector" style="display:none"> </div>
                                
                    <!-- </div> -->
                </div>
            </div>
            <!-- Main-container ends-->

        </div>
        </div>
    </div>
    </div>
    
    <div class="row">
        <div class="col-md-12">
        <div class="loading" style="display:none">
            <img src="../img/process.gif" class="img-resposive" style="height:150px">
        </div>
        <div class="lossConnection" style="display:none">
            <img src="../img/noconnection.gif" class="img-responsive" style="width: 450px;">
        </div>
        </div>
    </div>

    <!-- Required Jquery -->
    <script type="text/javascript" src="../files/bower_components/jquery/js/jquery.min.js"></script>
    <script type="text/javascript" src="../files/bower_components/jquery-ui/js/jquery-ui.min.js"></script>
    <script type="text/javascript" src="../files/bower_components/popper.js/js/popper.min.js"></script>
    <script type="text/javascript" src="../files/bower_components/bootstrap/js/bootstrap.min.js"></script>
    <!-- waves js -->
    <script src="../files/assets/pages/waves/js/waves.min.js"></script>
    <!-- jquery slimscroll js -->
    <script type="text/javascript" src="../files/bower_components/jquery-slimscroll/js/jquery.slimscroll.js"></script>
    <!-- modernizr js -->
    <script type="text/javascript" src="../files/bower_components/modernizr/js/modernizr.js"></script>
    <script type="text/javascript" src="../files/bower_components/modernizr/js/css-scrollbars.js"></script>
    <!-- data-table js -->
    <script src="../files/bower_components/datatables.net/js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/1.10.8/js/jquery.dataTables.min.js"></script>
    <script src="../files/assets/pages/data-table/extensions/fixed-colums/js/dataTables.fixedColumns.min.js"></script>
    <!-- Custom js -->
    <script src="../files/assets/pages/data-table/extensions/fixed-colums/js/fixed-column-custom.js"></script>
    <script src="../files/assets/js/pcoded.min.js"></script>
    <script src="../files/assets/js/jquery.mCustomScrollbar.concat.min.js"></script>
    <!-- Select JS -->
    <script type="text/javascript" src="../files/assets/pages/advance-elements/select2-custom.js"></script>
    <!-- Multiselect -->
    <script type="text/javascript" src="../files/bower_components/multiselect/js/jquery.multi-select.js"></script>
    <!-- Select 2 js -->
    <script type="text/javascript" src="../files/bower_components/select2/js/select2.full.min.js"></script>
    <!-- Multiselect js -->
    <script type="text/javascript" src="../files/bower_components/multiselect/js/jquery.multi-select.js"></script>
    <!-- Developed Scripts -->
    <script type="text/javascript" src="../files/assets/js/script.js"></script>
    <script type="text/javascript" src="../database/config.js"></script>
    <script src="../js/excel-bootstrap-table-filter-bundle.js"></script>
    <!-- CDN for Toaster message -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/css/toastr.css" rel="stylesheet"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.0.1/js/toastr.js"></script>
    <!-- sweet alert js -->
    <script type="text/javascript" src="../files/bower_components/sweetalert/js/sweetalert.min.js"></script>
    <script type="text/javascript" src="../files/assets/js/modal.js"></script>
    <!-- modalEffects js nifty modal window effects -->
    <script src="../files/assets/js/classie.js"></script>
    <script type="text/javascript" src="../files/assets/js/modalEffects.js"></script>

    <script>
        $('#shippingProfileSave').click(function(){
            var shippingName = $('#shippingName').val();
            var shippingContact12 = $('#shippingContact12').val();
            var shippingEmail12  = $('#shippingEmail12').val();
            var custID   = $('#custId').val();
            var shippingAddress = $('#shippingAddress').val();

            if(shippingName == '' || shippingContact12=='' || shippingEmail12=='')
            {
                alert('Please insert all data');
            }
            else
            {
                $.ajax({
                    type : 'POST',
                    url  : 'shippingProfileDataAdd.php',
                    data : {shippingName : shippingName,shippingContact12:shippingContact12,shippingEmail12 : shippingEmail12,custID : custID,shippingAddress:shippingAddress},
                    success : function(data){
                        // alert('data save successfully');
                        toastr.options.positionClass = "toast-bottom-right";toastr.success("Contact Person Save Successfully");

                        var shippingAddressId = $("#shippingAddress option:selected").val();
    
                        $('#shippingAdd').val(shippingAddressId);
                        $.ajax
                            ({
                                url		: "getShippingPersonName.php?shippingAddressId="+shippingAddressId,
                                success	: function(result)
                                {   
                                        $('#shippingContactPerson').html(result);
                                }
                            })
                    }
                })
            }
        })


        $('#billingProfileSave').click(function(){
            var billingName = $('#billingName').val();
            var billingContact12 = $('#billingContact12').val();
            var billingEmail12  = $('#billingEmail12').val();
            var custID   = $('#custId').val();
            var billingAddress = $('#billingAddress').val();

            if(billingName == '' || billingContact12=='' || billingEmail12=='')
            {
                alert('Please insert all data');
            }
            else
            {
                $.ajax({
                    type : 'POST',
                    url  : 'billingProfileDataAdd.php',
                    data : {billingName : billingName,billingContact12:billingContact12,billingEmail12 : billingEmail12,custID : custID,billingAddress:billingAddress},
                    success : function(data){
                        alert('data save successfully');
                        var billingAddressId = $("#billingAddress option:selected").val();
    
                        $('#billingAdd').val(billingAddressId);
                        $.ajax
                        ({
                            url : "getBillingPersonalDetails.php?billingid="+billingAddressId,
                            success : function(data)
                            {
                                $('#billingContactPerson').html(data);
                            }
                        })
                    }
                })
            }
        })
    </script>

    <script>
        $(document).ready(function(){
        //     $('#finacialYear').val("24-25").change();
        //     $('#finacialYear12').val("24-25").change();
        //     $('#fileName').prop('readonly', true);
        //     debugger
        //     $('select option[value="24-25"]').attr("selected",true);
        //     // on load default financial year i 19-20
        //    financial_year();
        })
        function financial_year()
        {
            // var $newOption1 = $("<option selected='selected'></option>").val('19-20').text('19-20');
            //     $("#finacialYear12").append($newOption1).trigger('change');
            //     var $newOption2 = $("<option selected='selected'></option>").val('19-20').text('19-20');
            // $('#finacialYear').append($newOption1).trigger('change');
            //  $('select option[value="19-20"]').attr("selected",true);

//             $('#finacialYear12 option').each(function() {
//     if (this.selected)
//     //    alert('this option is selected');
//      else
//     //    alert('this is not');
// });
        }
        //other customer ambassador 
    $(function() {
        $('.custAmbassador').click(function() {
           // var checkRes = (this.checked ? 'true1' : 'false1'); 
            var checkRes = $("input[name='customerAmbassador']:checked","#ambassador").val();
           console.log(checkRes)
            if(checkRes == "OTHER"){
                var valid= valid_fun();
               if(valid == true)
               {
               
                    $("#otherCustAmbassadorInput").show();
               }
               else{
                alert("Please enter Company name, Shipping address and Billing address ");
                   return false;
               }
            }
            if(checkRes != "OTHER"){
                debugger
                $("#otherCustAmbassadorInput").hide();
               var valid= valid_fun();
               if(valid == true)
               {
                $('#projectSubmit1').trigger('click');
                $('#fileName').prop('readonly', false);
                $( "#fileName" ).focus();
               }
               else{
                alert("Please enter Company name, Shipping address and Billing address ");
                return false;
               }

                
            }
        });
        $('#otherAmbassador1').change(function(){
           debugger
                $('#projectSubmit1').trigger('click');
                $('#fileName').prop('readonly', false);
                $( "#fileName" ).focus();
           
             
        });
    });

        function showAlertMessage(ele)
        {
            debugger
            // alert(ele);
            if($("#"+ele).attr("readonly"))
            {
                alert('Please Insert Shipping And Billing Address');
            }
            // document.getElementById(ele).value= "Ajit";
        }
        function valid_fun()
        {debugger
            var custId = $('#custId').val();
            var shippind_add = $('#shippingAddress').val();
            var billing_add = $('#billingAddress').val();

            if( (custId == '' || custId == null) || (shippind_add == '' || shippind_add == 'opt1') || (billing_add == '' || billing_add == 'opt1'))
            {
                return false;
            }
            else
            {
               
                return true;
            }
        }
    </script>
    <script>
    $('#projectSubmit').on('click',function(){
        debugger
       var custId = $('#custId').val();
       var filename =$('#fileName').val();

       if(custId == null && (filename == '' || filename == null))
       {
        $('#modal-1').hide();
        alert("Please fill the file data");
       }
    //    var shippind_add = $('#shippingAddress').val();
    //    var billing_add = $('#billingAddress').val();
    //    var product_type = $('#productId3').val()  ;
    //    var product_desc = $("#projectDescription").val()  ;
    //    var store_location = $('#storeLocation').val()   ;
    //    var po_basic = $('#poAmounts1').val()  ;
    //    var comment = $('#cashComment').val();

    //     if(custId != '' && shippind_add != '' && billing_add != '' && product_type != '' && product_desc != '' && store_location != '' && po_basic != ''|| comment != '')

    //    {console.log(custId);
    //    console.log(shippind_add);
    //    console.log(billing_add);
    //    console.log(product_type);
    //    console.log(product_desc);
    //    console.log(store_location);

    //    console.log(po_basic);
    //    console.log(comment);}
    //    else{
    //        $('#modal-1').hide();
           
    //        alert("Please fill the required data");
    //        if(custId == null)
    //        {
    //         $('#select2-custId-container').focus();
    //        }
    //        else if(shippind_add == 'opt1')
    //        {
    //         $('#shippingAddress').focus();
    //        }
    //        else if(billing_add == 'opt1')
    //        {
    //          $('#billingAddress').focus();
    //        }
    //        else if(product_type == null)
    //        {
    //         $('#productId3').focus()  ;
    //        }
    //    }

    })
    </script>
    <script>
        
        // $(document).ready(function(){
        //     $('select').select2({
        //         minimumResultsForSearch: -1,
        //         placeholder: function(){
        //             $(this).data('placeholder');
        //         }
        //     });
        // })
    //upload po- only images and pdf file can upload
        $('#file').change(function () 
        {
            var ext = this.value.match(/\.(.+)$/)[1];
            switch (ext) 
            {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'PNG':
                case 'pdf':
                    $('#uploadButton').attr('disabled', false);
                    break;
                default:
                    toastr.options.positionClass = "toast-bottom-right";toastr.error("Invalid File Extension. Upload only PDF and Image file.");
                    this.value = '';
            }
        });

    //upload po- only images and pdf file can upload on add more card
        function fileUploadType(id){
            var ext = $('#file_'+id).val().match(/\.(.+)$/)[1];
            switch (ext) {
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'PNG':
                case 'pdf':
                    $('#uploadButton').attr('disabled', false);
                    break;
                default:
                    toastr.options.positionClass = "toast-bottom-right";toastr.error("Invalid File Extension. Upload only PDF and Image file.");
                    $('#file_'+id).val('');
            }
        }
        var appendid = 1;

        function showdatas()
        {
            
            $('#mytable tr:last').after('<tr id="trid_'+appendid+'"><td><input type="text" id="po_number_'+appendid+'" name="po_number[]"></td><td><input type="date" id="po_date_'+appendid+'" name="po_date[]"></td><td><input type="text" id="poAmount_'+appendid+'" class="rupee poBasicAmount1" onkeypress="return isNumberKey(event)" onkeyup = "taxTypeChange12('+appendid+');" style="margin-left: 1px;    height: 30px;border: 0px solid #000000;border-bottom-width: 1px;background-color: transparent;" value=""  name="po_amount[]""></td><td><select name="taxType[]" id="taxType_'+appendid+'" onchange="taxTypeChange12('+appendid+');"><option value="9-18" selected> CGST(9%)+SGST(9%)</option><option value=4-0> +NIL CT-3</option><option value=5-0> +NIL SEZ</option><option value=6-5> +ED</option><option value=7-> +ServiceTax</option><option value=8-0> No Tax</option><option value=9-18> CGST(9%)+SGST(9%)</option><option value=10-18> IGST(18%)</option></select></td><td><input type="text" class="taxamt rupee" id="taxAmount_'+appendid+'" name="taxAmount[]"></td><td><input type="text" class="poTaxAmount1 rupee" id="poTaxAmount1_'+appendid+'" name="po_Taxamount[]" ></td><td><input type="text" name="unitLocationAMC1[]" id="UnitName_'+appendid+'"></td><td><input type="file" name="file[]" id="files"></td><td></td></tr>');
            appendid ++;
        }
        function getParentFileNo(val)
		{
            //alert(val);
            debugger
            $.ajax({
            type: "POST",
            url: "./getParentFileNo.php",
            data:'parentFileNo='+val,
            success: function(data)
            {
                $("#parentFileNo").html(data);
            }
            });
            financial_year();
        }

        function getTotalVisit(ele)
        {
            alert(ele);
            if(ele >5)
            {
                alert('Please enter valid visit count');
            }
            
            else
            {
                for(var i=1 ;i<=ele;i++)
                {
                    $('#appendDate').append('<div id="month_'+i+'"><input type="month" style="margin-right:20px" name="AMCMonth[]"/><input type="button" value="remove" id="'+i+'" onclick="removedatepicker(this)"></div>');
                }
            }   
        } 
        function removedatepicker(ele)
        {
            var id = ele.id;
            $('#month_'+id).remove();
            // $(this).remove();
        } 
    var filetypearray =[];
    function total_amount()
    {
        debugger
        var sum=0;
        var sum1=0;
        var sum2=0;
        var material=0;
        var material1 =0;
        var labour = 0;
        var taxm = 0;
        var taxl = 0;
        var totalpo = 0;
        var totalpol = 0;
        var cashamt  = 0;
        var amount34 = 0;
        var cashAmount = 0;

       
        $('.poBasicAmount1').filter(':input:visible').each(function (i,obj){
            
            debugger
            var data1 = this.value; 
            if(filetypearray[i] == 1)
            {
                if(data1 =="")
                {
                    data1 = 0;
                }
                else
                {
                    data1 = parseFloat(data1);
                }
                material += parseFloat(data1);
             
                x=material.toString();
                var afterPoint = '';
                if(x.indexOf('.') > 0)
                afterPoint = x.substring(x.indexOf('.'),x.length);
                x = Math.floor(x);
                x=x.toString();
                var lastThree = x.substring(x.length-3);
                var otherNumbers = x.substring(0,x.length-3);
                if(otherNumbers != '')
                    lastThree = ',' + lastThree;
                //var res112 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                var res112 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poBasicAmtM').val(res112);
            }
            if(filetypearray[i] == 4)
            {
                if(data1 =="")
                {
                    data1 = 0;
                }
                else
                {
                    data1 = parseFloat(data1);
                }
                labour += parseFloat(data1);
                
                x=labour.toString();
                var afterPoint = '';
                if(x.indexOf('.') > 0)
                afterPoint = x.substring(x.indexOf('.'),x.length);
                x = Math.floor(x);
                x=x.toString();
                var lastThree = x.substring(x.length-3);
                var otherNumbers = x.substring(0,x.length-3);
                if(otherNumbers != '')
                    lastThree = ',' + lastThree;
                //var res1122 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                var res1122 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poBasicAmtL').val(res1122);
            }
            if($.isNumeric(data1)) 
            {
                sum1 += parseFloat(data1);
            }
            var allocatedExpenses = 0;
            allocatedExpenses = sum1 / 100 * 60;
            $('#MAE').val(allocatedExpenses);
            x=sum1.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
            //var res11 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            var res11 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            $("#poBasicAmt").val(res11);
            
            

        });
        $('.taxamt').filter(':input:visible').each(function (i,obj){
            var data2 = this.value;
            var amount2 = data2.replace(/[,]/g , ''); 
            if(filetypearray[i] == 1)
            {
                if(amount2 =="")
                {
                    amount2 = 0;
                }
                else
                {
                    amount2 = parseFloat(amount2);
                }
                taxm += parseFloat(amount2);
                x=taxm.toString();
                var afterPoint = '';
                if(x.indexOf('.') > 0)
                afterPoint = x.substring(x.indexOf('.'),x.length);
                x = Math.floor(x);
                x=x.toString();
                var lastThree = x.substring(x.length-3);
                var otherNumbers = x.substring(0,x.length-3);
                if(otherNumbers != '')
                    lastThree = ',' + lastThree;
                //var res89 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                var res89 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poTotalTaxAmtM').val(res89);
            }
            if(filetypearray[i] == 4)
            {
                if(amount2 =="")
                {
                    amount2 = 0;
                }
                else
                {
                    amount2 = parseFloat(amount2);
                }
                taxl += parseFloat(amount2);
                x=taxl.toString();
                var afterPoint = '';
                if(x.indexOf('.') > 0)
                afterPoint = x.substring(x.indexOf('.'),x.length);
                x = Math.floor(x);
                x=x.toString();
                var lastThree = x.substring(x.length-3);
                var otherNumbers = x.substring(0,x.length-3);
                if(otherNumbers != '')
                    lastThree = ',' + lastThree;
               // var res891 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                var res891 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
                $('#poTotalTaxAmtL').val(res891);
            }
            if($.isNumeric(amount2)) 
            {
                sum2 += parseFloat(amount2);
            }
            x=sum2.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
           // var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            
            $("#poTotalTaxAmt").val(res);
        });
        $('.poTaxAmount1').filter(':input:visible').each(function(i, obj){
            debugger
            var data = this.value;
            var amount = data.replace(/[,]/g , ''); 
            if(filetypearray[i] == 1)
            {
                if(amount =="")
                {
                    amount = 0;
                }
                else
                {
                    amount = Number(amount);
                }
                totalpo = totalpo + Number(amount);
                x=totalpo.toString();
                var afterPoint = '';
                if(x.indexOf('.') > 0)
                afterPoint = x.substring(x.indexOf('.'),x.length);
                x = Math.floor(x);
                x=x.toString();
                var lastThree = x.substring(x.length-3);
                var otherNumbers = x.substring(0,x.length-3);
                if(otherNumbers != '')
                    lastThree = ',' + lastThree;
               // var total23 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
               var total23 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poTotalAmtM').val(total23);
            }
            if(filetypearray[i] == 4)
            {
                if(amount =="")
                {
                    amount = 0;
                }
                else
                {
                    amount = parseFloat(amount);
                }
                totalpol += parseFloat(amount);
                x=totalpol.toString();
                var afterPoint = '';
                if(x.indexOf('.') > 0)
                afterPoint = x.substring(x.indexOf('.'),x.length);
                x = Math.floor(x);
                x=x.toString();
                var lastThree = x.substring(x.length-3);
                var otherNumbers = x.substring(0,x.length-3);
                if(otherNumbers != '')
                    lastThree = ',' + lastThree;
               // var total231 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                var total231 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poTotalAmtL').val(total231);
            }
            if($.isNumeric(amount)) 
            {
                sum += parseFloat(amount);
            }
            // var cashamount = $('#TotalCashAmount').val();
            // if(cashamount == '')
            // {

            // }
            // else
            // {
            //     var amount45 = cashamount.replace(/[,]/g , ''); 
            //     amount34 = Number(amount45); 
            //     sum = sum +Number(amount34);
            // }
            x=sum.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
            //var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            $("#poTotalAmt").val(res);

        });
        $('.cashAmount').filter(':input:visible').each(function(i, obj){
            debugger
            var cashamt = 0;
            
            var cash = this.value;
            if(cash !='')
            {
                cashamt = Number(cash);
                // var cashamt2 = $('#TotalCashAmount').val();
                // var casamt = cashamt2.replace(/[,]/g , '');
                // // cashamt = cashamt + Number(casamt);
                // var pobasicamt = $('#poTotalAmt').val();
                // var poamt = pobasicamt.replace(/[,]/g , '');
                // poamt = Number(poamt);

                // var poBasicwithCash = poamt + cashamt;
                // cashamt = cashamt + Number(casamt);
                if($.isNumeric(cashamt)) 
                {
                    cashAmount += parseFloat(cashamt);
                }
                x=cashAmount.toString();
                var afterPoint = '';
                if(x.indexOf('.') > 0)
                afterPoint = x.substring(x.indexOf('.'),x.length);
                x = Math.floor(x);
                x=x.toString();
                var lastThree = x.substring(x.length-3);
                var otherNumbers = x.substring(0,x.length-3);
                if(otherNumbers != '')
                lastThree = ',' + lastThree;
                //var res11 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                var res11 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $("#TotalCashAmount").val(res11);
                // x=poBasicwithCash.toString();
                // var afterPoint = '';
                // if(x.indexOf('.') > 0)
                // afterPoint = x.substring(x.indexOf('.'),x.length);
                // x = Math.floor(x);
                // x=x.toString();
                // var lastThree = x.substring(x.length-3);
                // var otherNumbers = x.substring(0,x.length-3);
                // if(otherNumbers != '')
                // lastThree = ',' + lastThree;
                // var res111 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                // $("#poTotalAmt").val(res111);
            }
            
            


        });
        

    }
       
        
        //add more po datials function for selection file type
        function getParentFileNo1(id,val)
		{
            var array = val.split("-");
            filetypearray.push(array[0]);
            // alert(filetypearray);
            //debugger
            $.ajax({
            type: "POST",
            url: "./getParentFileNo.php",
            data:'parentFileNo='+val,
                success: function(data)
                {
                    $('#parentFileNo1_'+id+'').html(data);
                }
            });
        } 

        function checkProjectDetails()
        {
            alert('working is');
        }

        function getParentFileNo2(id,val)
		{
            debugger
            var array = val.split("-");
            filetypearray.push(array[0]);
            $.ajax({
            type: "POST",
            url: "./getParentFileNo.php",
            data:'parentFileNo='+val,
                success: function(data)
                {
                    $('#parentFileNo_'+id+'').html(data);
                }
            });
        } 
        
        $('#savefile').click(function(){
            debugger
            $( "#fileName" ).focus();
            var data = $('#projectData23').find('select, textarea, input').serialize();
            // alert(data);
            $.ajax({
                type: "POST",
                url : "./saveprojectfile.php",
                data : data,
                success :function(data)
                {
                    $('#model-2').hide();
                    $('#modal-2').hide();
                    $('#projectidset').val(data);
                    $('#projectidset11').val(data);
                    toastr.success('Project File Added Successfully Please proceed to add File Data');
                    jQuery("html,body").animate({scrollTop: 310}, 1000);


                    
                }
            })
        })

        //on tax selection tax amount and total amount should get calculated
        // function taxTypeChange(val)
        $('#taxType').on('change', function(){
            debugger
            var potype        = $('#poType').val();
            var potype = potype.split('-');
            var potypee1 = potype[0];

            var poBasicAmount = $('#poAmount').val();
            // if(potypee1 == 1)
            // {
            //     // $('#poBasicAmtM').val(poBasicAmount);
            //     var poamt = $('#poBasicAmtM').val();
            //     var po = Number(poamt);
            //     var poBasicAmount11 = Number(poBasicAmount);
            //     poBasicAmount1 = po + poBasicAmount11;

            //     $('#poBasicAmtM').val(poBasicAmount1);
                
            // }
            // if(potypee1 == 4)
            // {
            //     var poamt = $('#poBasicAmtL').val();
            //     var po = Number(poamt);
            //     var poBasicAmount11 = Number(poBasicAmount);
            //     poBasicAmount1 = po + poBasicAmount11;
            //     $('#poBasicAmtL').val(poBasicAmount1);
            //     // $('#poBasicAmtL').val(poBasicAmount);
            // }
            var labamt        = $('#LBamount').val();
            var integer = $.trim(poBasicAmount);
            var val = $('#taxType').val();
            var val1 = val.split('-');

            var rem = integer.replace('Rs. ','');
            var rem1 = rem.replace(',','');
            var remStr1 = parseInt(rem1);
            var lab   = parseInt(labamt);
            var remStr = remStr1 + lab;
            // if(val == 'cgstSgst')
            // {
                if(val1[1] != 0)
                {
                    var taxpercent = val1[1]/100;
                    var taxAmt = (remStr * taxpercent);
                    var taxAmt1 = taxAmt.toFixed(2);
                    // alert(taxAmt1)
                    x=taxAmt1.toString();

                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                   // var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
                    $('#taxAmount').val(res);
                    var poAmountWithTax = remStr + taxAmt;
                    x1=poAmountWithTax.toString();
                    var afterPoint = '';
                    if(x1.indexOf('.') > 0)
                    afterPoint = x1.substring(x1.indexOf('.'),x1.length);
                    x1 = Math.floor(x1);
                    x1=x1.toString();
                    var lastThree = x1.substring(x1.length-3);
                    var otherNumbers = x1.substring(0,x1.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                    $('#poTaxAmount1').val(res1);
                    {
                        // var amount = $('#poTotalTaxAmtM').val();
                        // var amt = Number(amount);
                        // var total  = amt + taxAmt
                        // // $('#poTotalTaxAmtM').val(total);
                    }
                    // if(potypee1 == 1)
                    // {
                    //     var amount = $('#poTotalTaxAmtM').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtM').val(total);
                    //     var totalpoamt = total + poBasicAmount1;
                    //     $('#poTotalAmtM').val(totalpoamt);
                    // }
                    // if(potypee1 == 4)
                    // {
                    //     var amount = $('#poTotalTaxAmtL').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtL').val(total);
                    // }
                    $('#poAmount').val(poBasicAmount);
                    total_amount(potypee1);
                }
                else{
                    $('#taxAmount').val('0');
                    x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    //var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                    $('#poTaxAmount1').val(res99);
                    //$("#poTotalAmt").val(remStr);
                    total_amount(potypee1);
                }        
        })
        $('#poType').on('change', function(){
            var potype= $("#poType").val();
            var potype = potype.split('-');
            var potypee1 = potype[0];
            if(potypee1 == 4){
               var  msg = 'Do you want to add Concerned Supply file';
            }else{
                var msg = 'Do you want to add Concerned Labour file';
            }
       
           $("#MSg").html(msg);
        });
        $('#taxTypes1').on('change', function(){
            debugger
            var potype        = $('#poType').val();
            var potype = potype.split('-');
            var potypee1 = potype[0];

            var poBasicAmount = $('#poAmounts1').val();
            // if(potypee1 == 1)
            // {
            //     // $('#poBasicAmtM').val(poBasicAmount);
            //     var poamt = $('#poBasicAmtM').val();
            //     var po = Number(poamt);
            //     var poBasicAmount11 = Number(poBasicAmount);
            //     poBasicAmount1 = po + poBasicAmount11;

            //     $('#poBasicAmtM').val(poBasicAmount1);
                
            // }
            // if(potypee1 == 4)
            // {
            //     var poamt = $('#poBasicAmtL').val();
            //     var po = Number(poamt);
            //     var poBasicAmount11 = Number(poBasicAmount);
            //     poBasicAmount1 = po + poBasicAmount11;
            //     $('#poBasicAmtL').val(poBasicAmount1);
            //     // $('#poBasicAmtL').val(poBasicAmount);
            // }
            var labamt        = $('#LBamounts1').val();
            var integer = $.trim(poBasicAmount);
            var val = $('#taxTypes1').val();
            var val1 = val.split('-');

            var rem = integer.replace('Rs. ','');
            var rem1 = rem.replace(',','');
            var remStr1 = parseInt(rem1);
            var lab   = parseInt(labamt);
            var remStr = remStr1 + lab;
            // if(val == 'cgstSgst')
            // {
                if(val1[1] != 0)
                {
                    var taxpercent = val1[1]/100;
                    var taxAmt = (remStr * taxpercent);
                    x=taxAmt.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    //var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                    $('#taxAmounts1').val(res);
                    var poAmountWithTax = remStr + taxAmt;
                    x1=poAmountWithTax.toString();
                    var afterPoint = '';
                    if(x1.indexOf('.') > 0)
                    afterPoint = x1.substring(x1.indexOf('.'),x1.length);
                    x1 = Math.floor(x1);
                    x1=x1.toString();
                    var lastThree = x1.substring(x1.length-3);
                    var otherNumbers = x1.substring(0,x1.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
                    $('#poTaxAmount1s1').val(res1);
                    {
                        // var amount = $('#poTotalTaxAmtM').val();
                        // var amt = Number(amount);
                        // var total  = amt + taxAmt
                        // // $('#poTotalTaxAmtM').val(total);
                    }
                    // if(potypee1 == 1)
                    // {
                    //     var amount = $('#poTotalTaxAmtM').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtM').val(total);
                    //     var totalpoamt = total + poBasicAmount1;
                    //     $('#poTotalAmtM').val(totalpoamt);
                    // }
                    // if(potypee1 == 4)
                    // {
                    //     var amount = $('#poTotalTaxAmtL').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtL').val(total);
                    // }
                    $('#poAmounts1').val(poBasicAmount);
                    total_amount(potypee1);
                }
                else{
                    $('#taxAmounts1').val('0');
                    x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res91 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                    $('#poTaxAmount1s1').val(res91);
                    //$("#poTotalAmt").val(remStr);
                    total_amount(potypee1);
                }        
        })

        //get value of file type
        function getvalue(ele)
        {
            
            var id = ele.value;
            var type = id.split('-');
            filetypearray.push(type[0]);
            // alert(filetypearray);
            if(type[0]==2)
            {
                $('#change1, #change2').removeClass('col-sm-3').addClass('col-sm-2');
                $('#change3').show();
                $('#HideAMC').hide();
                $('#showAMC').show();
            }
            else
            {
                $('#change1, #change2').removeClass('col-sm-3').addClass('col-sm-3');
                $('#change3').hide();
                $('#showAMC').hide();
                $('#HideAMC').show();
            }

            $('#poamountdetails').val(type[0])
        }
        function poamountcal()
        {
            debugger
            var potype         = $('#poType').val();
            var potype         = potype.split('-');
            var potypee1       = potype[0];
            var poBasicAmount = $('#poAmounts1').val();
            if(poBasicAmount == '')
            {
                poBasicAmount = '0';
            }
            var integer = $.trim(poBasicAmount);
            var frieght = $('#LBamounts1').val();
            var frieght1 = Number(frieght);
            var cashAmt = $('#Amt_cash').val();
            if(cashAmt == '')
            {
                cashAmt = '0';
            }
            $('#Amt_cash').val(cashAmt);
            var integer1 = $.trim(cashAmt);
            var val = $('#taxTypes1').val();
            var val1 = val.split('-');
            console.log(val1[1])
            var rem = integer.replace('Rs. ','');
            var rem1 = rem.replace(',','');
            var remStr = parseInt(rem1);

            var remCash = parseInt(cashAmt);
            var cashpo = remStr - remCash;
            var cashpo1 = cashpo + frieght1;
            cashpo = Number(cashpo);
            if(val1[1] != 0)
            {
            var taxpercent = val1[1]/100;
            var taxAmt = (cashpo1 * taxpercent);
            var taxStr = parseInt(taxAmt);
            taxStr = taxStr.toFixed(2);
            x=taxStr.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
            lastThree = ',' + lastThree;
            //var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            var ress = Number(res);
            
            $('#taxAmounts1').val(res);
            var poAmountWithTax = cashpo1 + taxAmt;
            x=poAmountWithTax.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
            lastThree = ',' + lastThree;
            var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            //var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            $('#poTaxAmount1s1').val(res1);       
          
            $('#poAmounts1').val(remStr.toFixed());

            x=cashpo.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
           // var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
           $('#orderAmt').val(res);
            total_amount(potypee1);
        }
        else
        {
            $('#taxAmounts1').val('0');
            x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            $('#poTaxAmount1s1').val(res99);
            //$("#poTotalAmt").val(remStr);
            total_amount(potypee1);
        }
        }
       $('#poAmount').on('keyup', function(){
           debugger
        var potype        = $('#poType').val();
        var potype = potype.split('-');
        var potypee1 = potype[0];
        var poBasicAmount = $('#poAmount').val();

        var integer = $.trim(poBasicAmount);
        var val = $('#taxType').val();
        var val1 = val.split('-');
        console.log(val1[1])
        var rem = integer.replace('Rs. ','');
        var rem1 = rem.replace(',','');
        var remStr = parseInt(rem1);
        if(val1[1] != 0)
        {
           var taxpercent = val1[1]/100;
           var taxAmt = (remStr * taxpercent);
           var taxStr = taxAmt.toFixed(2)
           x=taxStr.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
           $('#taxAmount').val(res);
           var poAmountWithTax = remStr + taxAmt;
           x=poAmountWithTax.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
           $('#poTaxAmount1').val(res1);
                    // if(potypee1 == 1)
                    // {
                    //     var amount = $('#poTotalTaxAmtM').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtM').val(total);
                    //     var totalpoamt = total + poBasicAmount1;
                    //     $('#poTotalAmtM').val(totalpoamt);
                    // }
                    // if(potypee1 == 4)
                    // {
                    //     var amount = $('#poTotalTaxAmtL').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtL').val(total);
                    // }
           $('#poAmount').val(remStr.toFixed());
           total_amount(potypee1);
       }
    else
       {
           $('#taxAmount').val('0');
                    x=remStr;
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
           $('#poTaxAmount1').val(res99);
           //$("#poTotalAmt").val(remStr);
           total_amount(potypee1);
       }
       
   })
   function calculatePOAmt(id)
   {
        debugger

        var id = id.id;
       
        var str = id
        var array = str.split("_");
        var id1 = array[1];
        var potype        = $('#poTypeML_'+id1).val();
        var potype = potype.split('-');
        var potypee1 = potype[0];
       
       var poBasicAmount = $('#'+id).val();
       if(poBasicAmount=='')
       {
           poBasicAmount = '0';
       }
       var cashAmt = $('#Amt_cash_'+id1).val();
       if(cashAmt == '')
       {
           cashAmt = '0';
       }
       var frieght = $('#LBamountML_'+id1).val();
       var freight1 = Number(frieght);
       var integer1 = $.trim(cashAmt);
       var integer = $.trim(poBasicAmount);
       var val = $('#taxTypeML_'+id1).val();
       var val1 = val.split('-');
       console.log(val1[1])
       var rem = integer.replace('Rs. ','');
       var rem1 = rem.replace(',','');
       var remStr = parseInt(rem1);
       var cashpo = Number(integer1);
       var cashAmt1 = remStr - cashpo;
       var cashAmt2 = cashAmt1 + freight1;
       if(val1[1] != 0)
       {
          var taxpercent = val1[1]/100;
          var taxAmt = (cashAmt2 * taxpercent);
          var taxStr = taxAmt.toFixed(2);
          x=taxStr.toString();
           var afterPoint = '';
           if(x.indexOf('.') > 0)
           afterPoint = x.substring(x.indexOf('.'),x.length);
           x = Math.floor(x);
           x=x.toString();
           var lastThree = x.substring(x.length-3);
           var otherNumbers = x.substring(0,x.length-3);
           if(otherNumbers != '')
               lastThree = ',' + lastThree;
           var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
         //  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
          $('#taxAmountML_'+id1).val(res);
          var poAmountWithTax = cashAmt2 + taxAmt;
          x=poAmountWithTax.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
            var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
            //var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
          $('#poTaxAmount1ML_'+id1).val(res1);
          $('#poAmountML_'+id1).val(remStr.toFixed());
          total_amount(potypee1);
      }
   else
      {
          $('#taxAmount').val('0');
          x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                   // var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#poTaxAmount1').val(res99);
          //$("#poTotalAmt").val(remStr);
          total_amount(potypee1);
      }
   }

   function calculatePOAmt12(id)
   {
        debugger
        var id       = id.id;
        var str      = id
        var array    = str.split("_");
        var id1      = array[2];
        var potype   = $('#poTypeML_'+id1).val();
        var potype   = potype.split('-');
        var potypee1 = potype[0];
        var frieght  = $('#LBamountML_'+id1).val();
        var freight1 = Number(frieght);
        var poBasicAmount = $('#poAmountML_'+id1).val();
        if(poBasicAmount=='')
        {
            poBasicAmount = '0';
        }
        var cashAmt = $('#Amt_cash_'+id1).val();
        if(cashAmt == '')
        {
            cashAmt = '0';
        }
       var integer1 = $.trim(cashAmt);
       var integer = $.trim(poBasicAmount);
       var val = $('#taxTypeML_'+id1).val();
       var val1 = val.split('-');
       console.log(val1[1])
       var rem = integer.replace('Rs. ','');
       var rem1 = rem.replace(',','');
       var remStr = parseInt(rem1);
       var cashpo = Number(integer1);
       var cashAmt1 = remStr - cashpo;
       var cashAmt2 = cashAmt1 + freight1;
       if(val1[1] != 0)
       {
          var taxpercent = val1[1]/100;
          var taxAmt = (cashAmt2 * taxpercent);
        //   taxStr = taxStr.toFixed(2);
          x=taxAmt.toString();
           var afterPoint = '';
           if(x.indexOf('.') > 0)
           afterPoint = x.substring(x.indexOf('.'),x.length);
           x = Math.floor(x);
           x=x.toString();
           var lastThree = x.substring(x.length-3);
           var otherNumbers = x.substring(0,x.length-3);
           if(otherNumbers != '')
               lastThree = ',' + lastThree;
          // var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
           var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#taxAmountML_'+id1).val(res);
          var poAmountWithTax = cashAmt2 + taxAmt;
          x=poAmountWithTax.toString();
                   var afterPoint = '';
                   if(x.indexOf('.') > 0)
                   afterPoint = x.substring(x.indexOf('.'),x.length);
                   x = Math.floor(x);
                   x=x.toString();
                   var lastThree = x.substring(x.length-3);
                   var otherNumbers = x.substring(0,x.length-3);
                   if(otherNumbers != '')
                       lastThree = ',' + lastThree;
                   var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#poTaxAmount1ML_'+id1).val(res1);
          $('#poAmountML_'+id1).val(remStr.toFixed());
          total_amount(potypee1);
      }
   else
      {
          $('#taxAmount').val('0');
          x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                  //  var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
          $('#poTaxAmount1').val(res99);
          //$("#poTotalAmt").val(remStr);
          total_amount(potypee1);
      }
   }
   function poAmountCalculation(id)
    {
        var id = id.id;
        debugger
        var str = id
        var array = str.split("_");
        var id1 = array[1];
        var potype        = $('#poType_'+id1).val();
        var potype = potype.split('-');
        var potypee1 = potype[0];
        // $('#'+id).on('keyup', function(){
       var poBasicAmount = $('#'+id).val();
       if(poBasicAmount == '')
       {
           poBasicAmount = '0';
       }
       var cashAmt = $('#Amt_cash_'+id1).val();
       if(cashAmt == '')
       {
           cashAmt = '0';
       }
       var frieght = $('#LBamount1_'+id1).val();
       var frieght1 = Number(frieght);
       var integer = $.trim(poBasicAmount);
       var integer1 = $.trim(cashAmt);
       var val = $('#taxType_'+id1).val();
       var val1 = val.split('-');
       console.log(val1[1])
       var rem = integer.replace('Rs. ','');
       var rem1 = rem.replace(',','');
       var remStr = parseInt(rem1);
       var cashpo = Number(integer1);
       var cashamt1 = remStr - cashpo;
       var cashamt2 = cashamt1 + frieght1;
       if(val1[1] != 0)
       {
          var taxpercent = val1[1]/100;
          var taxAmt = (cashamt2 * taxpercent);
          x=taxAmt.toString();
           var afterPoint = '';
           if(x.indexOf('.') > 0)
           afterPoint = x.substring(x.indexOf('.'),x.length);
           x = Math.floor(x);
           x=x.toString();
           var lastThree = x.substring(x.length-3);
           var otherNumbers = x.substring(0,x.length-3);
           if(otherNumbers != '')
               lastThree = ',' + lastThree;
           var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#taxAmount_'+id1).val(res);
          var poAmountWithTax = cashamt2 + taxAmt;
          x=poAmountWithTax.toString();
                   var afterPoint = '';
                   if(x.indexOf('.') > 0)
                   afterPoint = x.substring(x.indexOf('.'),x.length);
                   x = Math.floor(x);
                   x=x.toString();
                   var lastThree = x.substring(x.length-3);
                   var otherNumbers = x.substring(0,x.length-3);
                   if(otherNumbers != '')
                       lastThree = ',' + lastThree;
                   var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#poTaxAmount1_'+id1).val(res1);
          x=cashamt1.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
           $('#orderAmt_'+id1).val(res);
                    // if(potypee1 == 1)
                    // {
                    //     var amount = $('#poTotalTaxAmtM').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtM').val(total);
                    // }
                    // if(potypee1 == 4)
                    // {
                    //     var amount = $('#poTotalTaxAmtL').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtL').val(total);
                    // }
          $('#poAmount_'+id1).val(remStr.toFixed());
          total_amount(potypee1);
      }
   else
      {
          $('#taxAmount').val('0');
          x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#poTaxAmount1').val(res99);
          //$("#poTotalAmt").val(remStr);
          total_amount(potypee1);
      }
      
//   });
  }

  function poAmountCalculation12(id)
    {   
        debugger
        var id = id.id;
        debugger
        var str = id
        var array = str.split("_");
        var id1 = array[2];
        var potype        = $('#poType_'+id1).val();
        var potype = potype.split('-');
        var potypee1 = potype[0];
        // $('#'+id).on('keyup', function(){
       var poBasicAmount = $('#poAmount_'+id1).val();
       if(poBasicAmount == '')
       {
           poBasicAmount = '0';
       }
       var cashAmt = $('#Amt_cash_'+id1).val();
       if(cashAmt == '')
       {
           cashAmt = '0';
       }
       var frieght = $('#LBamount1_'+id1).val();
       var frieght1 = Number(frieght);
       var integer = $.trim(poBasicAmount);
       var integer1 = $.trim(cashAmt);
       var val = $('#taxType_'+id1).val();
       var val1 = val.split('-');
       console.log(val1[1])
       var rem = integer.replace('Rs. ','');
       var rem1 = rem.replace(',','');
       var remStr = parseInt(rem1);
       var cashpo = Number(integer1);
       var cashamt1 = remStr - cashpo;
       var cashamt2 = cashamt1 + frieght1;
       if(val1[1] != 0)
       {
          var taxpercent = val1[1]/100;
          var taxAmt = (cashamt2 * taxpercent);
          x=taxAmt.toString();
           var afterPoint = '';
           if(x.indexOf('.') > 0)
           afterPoint = x.substring(x.indexOf('.'),x.length);
           x = Math.floor(x);
           x=x.toString();
           var lastThree = x.substring(x.length-3);
           var otherNumbers = x.substring(0,x.length-3);
           if(otherNumbers != '')
               lastThree = ',' + lastThree;
           var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#taxAmount_'+id1).val(res);
          var poAmountWithTax = cashamt2 + taxAmt;
          x=poAmountWithTax.toString();
                   var afterPoint = '';
                   if(x.indexOf('.') > 0)
                   afterPoint = x.substring(x.indexOf('.'),x.length);
                   x = Math.floor(x);
                   x=x.toString();
                   var lastThree = x.substring(x.length-3);
                   var otherNumbers = x.substring(0,x.length-3);
                   if(otherNumbers != '')
                       lastThree = ',' + lastThree;
                   var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#poTaxAmount1_'+id1).val(res1);
          $('#poAmount_'+id1).val(remStr.toFixed());
          x=cashamt1.toString();
            var afterPoint = '';
            if(x.indexOf('.') > 0)
            afterPoint = x.substring(x.indexOf('.'),x.length);
            x = Math.floor(x);
            x=x.toString();
            var lastThree = x.substring(x.length-3);
            var otherNumbers = x.substring(0,x.length-3);
            if(otherNumbers != '')
                lastThree = ',' + lastThree;
            var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
           $('#orderAmt_'+id1).val(res);
          total_amount(potypee1);
      }
   else
      {
          $('#taxAmount').val('0');
          x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
          $('#poTaxAmount1').val(res99);
          //$("#poTotalAmt").val(remStr);
          total_amount(potypee1);
      }
      
//   });
  }
  function taxTypeChange12(id)
        {
            debugger
            var poBasicAmount = $('#poAmount_'+id+'').val();
            var labourAmount  = $('#LBamount_'+id).val();
            var potype        = $('#poType').val();
            var poAmt2 = $('#poBasicAmtL').val();
            var potype = potype.split('-');
            var potypee1 = potype[0];
            
            var integer = $.trim(poBasicAmount);
            // if(potypee == 1)
            // {
            //     // $('#poBasicAmtM').val(poBasicAmount);
            //     var poamt = $('#poBasicAmtM').val();
            //     var po = Number(poamt);
            //     var poBasicAmount11 = Number(poBasicAmount);
            //     poBasicAmount1 = po + poBasicAmount11;
            //     $('#poBasicAmtM').val(poBasicAmount1);
            //     // var poAmt = $('#poBasicAmtM').val();
            //     // var poAmt1 = parseInt(poBasicAmount) + parseInt(poAmt);
            //     // $('#poBasicAmtM').val(poAmt1);
            // }
            // if(potypee1 == 4)
            // {
            //     var poAmt3 = $('#poBasicAmtL').val();
            //     var poAmt4 = parseInt(poBasicAmount) + parseInt(poAmt3);
            //     $('#poBasicAmtL').val(poAmt4);
            // }
            var val = $('#taxType_'+id+'').val();
            var val1 = val.split('-');
  
            var rem = integer.replace('Rs. ','');
            var rem1 = rem.replace(',','');
            var remStr1 = parseInt(rem1);
            var labamt  = parseInt(labourAmount);

            // var remStr =  remStr1 + labamt;
            var remStr = remStr1;

            if(val1[1] != 0)
            {
                var taxpercent = val1[1]/100;
                var taxAmt = (remStr * taxpercent);
                x=taxAmt.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#taxAmount_'+id+'').val(res);
                var poAmountWithTax = remStr + taxAmt;
                x=poAmountWithTax.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poTaxAmount1_'+id+'').val(res1);
                    // if(potypee1 == 1)
                    // {
                    //     var amount = $('#poTotalTaxAmtM').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtM').val(total);
                    // }
                    // if(potypee1 == 4)
                    // {
                    //     var amount = $('#poTotalTaxAmtL').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtL').val(total);
                    // }
                $('#poAmount_'+id+'').val(poBasicAmount);
                total_amount(potypee1);
            }
            // 
            else
            {
                $('#taxAmount_'+id+'').val('0');
                x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
                $('#poTaxAmount1_'+id+'').val(res99);
                //$("#poTotalAmt").val(remStr);
                total_amount(potypee1);
            }
           
            //total_amount(potypee1);
        }
        //on tax selection tax amount and total amount should get calculated
        function taxTypeChange1(id)
        {
            debugger
            var poBasicAmount = $('#poAmount_'+id+'').val();
            var labourAmount  = $('#LBamount_'+id).val();
            var potype        = $('#poType_'+id).val();
            var poAmt2 = $('#poBasicAmtL').val();
            var potype = potype.split('-');
            var potypee1 = potype[0];
            
            var integer = $.trim(poBasicAmount);
            // if(potypee == 1)
            // {
            //     // $('#poBasicAmtM').val(poBasicAmount);
            //     var poamt = $('#poBasicAmtM').val();
            //     var po = Number(poamt);
            //     var poBasicAmount11 = Number(poBasicAmount);
            //     poBasicAmount1 = po + poBasicAmount11;
            //     $('#poBasicAmtM').val(poBasicAmount1);
            //     // var poAmt = $('#poBasicAmtM').val();
            //     // var poAmt1 = parseInt(poBasicAmount) + parseInt(poAmt);
            //     // $('#poBasicAmtM').val(poAmt1);
            // }
            // if(potypee1 == 4)
            // {
            //     var poAmt3 = $('#poBasicAmtL').val();
            //     var poAmt4 = parseInt(poBasicAmount) + parseInt(poAmt3);
            //     $('#poBasicAmtL').val(poAmt4);
            // }
            var val = $('#taxType_'+id+'').val();
            var val1 = val.split('-');
  
            var rem = integer.replace('Rs. ','');
            var rem1 = rem.replace(',','');
            var remStr1 = parseInt(rem1);
            var labamt  = parseInt(labourAmount);

            var remStr =  remStr1 + labamt;

            if(val1[1] != 0)
            {
                var taxpercent = val1[1]/100;
                var taxAmt = (remStr * taxpercent);
                x=taxAmt.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#taxAmount_'+id+'').val(res);
                var poAmountWithTax = remStr + taxAmt;
                x=poAmountWithTax.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poTaxAmount1_'+id+'').val(res1);
                    // if(potypee1 == 1)
                    // {
                    //     var amount = $('#poTotalTaxAmtM').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtM').val(total);
                    // }
                    // if(potypee1 == 4)
                    // {
                    //     var amount = $('#poTotalTaxAmtL').val();
                    //     var amt = Number(amount);
                    //     var total  = amt + taxAmt
                    //     $('#poTotalTaxAmtL').val(total);
                    // }
                $('#poAmount_'+id+'').val(poBasicAmount);
                total_amount(potypee1);
            }
            // 
            else
            {
                $('#taxAmount_'+id+'').val('0');
                x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
                $('#poTaxAmount1_'+id+'').val(res99);
                //$("#poTotalAmt").val(remStr);
                total_amount(potypee1);
            }
           
            //total_amount(potypee1);
        }
        function taxTypeChange11(id)
        {
            debugger
            var poBasicAmount = $('#poAmountML_'+id+'').val();
            var labourAmount  = $('#LBamountML_'+id).val();
            var potype        = $('#poTypeML_'+id).val();
            var poAmt2 = $('#poBasicAmtL').val();
            var potype = potype.split('-');
            var potypee = potype[0];
            
            var integer = $.trim(poBasicAmount);
            // if(potypee == 1)
            // {
            //     var poAmt = $('#poBasicAmtM').val();
            //     var poAmt1 = parseInt(poBasicAmount) + parseInt(poAmt);
            //     $('#poBasicAmtM').val(poAmt1);
            // }
            // if(potypee1 == 4)
            // {
            //     var poAmt5 = $('#poBasicAmtL').val();
            //     var poAmt6 = parseInt(poBasicAmount) + parseInt(poAmt5);
            //     $('#poBasicAmtL').val(poAmt6);
            // }
            var val = $('#taxTypeML_'+id+'').val();
            var val1 = val.split('-');
  
            var rem = integer.replace('Rs. ','');
            var rem1 = rem.replace(',','');
            var remStr1 = parseInt(rem1);
            var labamt  = parseInt(labourAmount);

            var remStr =  remStr1 + labamt;

            if(val1[1] != 0)
            {
                var taxpercent = val1[1]/100;
                var taxAmt = (remStr * taxpercent);
                x=taxAmt.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
                $('#taxAmountML_'+id+'').val(res);
                var poAmountWithTax = remStr + taxAmt;
                x=poAmountWithTax.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res1 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree ;
                $('#poTaxAmount1ML_'+id+'').val(res1);
                // if(potypee1 == 1)
                //     {
                //         var amount = $('#poTotalTaxAmtM').val();
                //         var amt = Number(amount);
                //         var total  = amt + taxAmt
                //         $('#poTotalTaxAmtM').val(total);
                //     }
                //     if(potypee1 == 4)
                //     {
                //         var amount = $('#poTotalTaxAmtL').val();
                //         var amt = Number(amount);
                //         var total  = amt + taxAmt
                //         $('#poTotalTaxAmtL').val(total);
                //     }
                $('#poAmountML_'+id+'').val(poBasicAmount);
                total_amount(potypee);
            }
            // 
            else
            {
                $('#taxAmountML_'+id+'').val('0');
                x=remStr.toString();
                    var afterPoint = '';
                    if(x.indexOf('.') > 0)
                    afterPoint = x.substring(x.indexOf('.'),x.length);
                    x = Math.floor(x);
                    x=x.toString();
                    var lastThree = x.substring(x.length-3);
                    var otherNumbers = x.substring(0,x.length-3);
                    if(otherNumbers != '')
                        lastThree = ',' + lastThree;
                    var res99 = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                $('#poTaxAmount1ML_'+id+'').val(res99);
                //$("#poTotalAmt").val(remStr);
                total_amount(potypee);
            }
           
            //total_amount(potypee1);
        }
         //validation for no and negative sign
         function isNumberKey(evt)
            {
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (charCode > 31
                && (charCode < 48 || charCode > 57))
                    return false;

                return true;
            }

            function Comma(nStr)
            {
                nStr += '';
                x = nStr.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1))
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
                return x1 + x2;
            }
            
        //Change sub-category according to the selection of category
			function getSubCat(val)
			{
                debugger
                console.log(val)
                $('#custid1').val(val);
				$.ajax({
				type: "POST",
				url: "getCustomerDetails.php",
				data:'customerId='+val,
				success: function(data)
				{
					$("#shippingAddress").html(data);
				}
				});

                $.ajax({
				type: "POST",
				url: "getBillingAddress.php",
				data:'customerId='+val,
				success: function(data)
				{
					$("#billingAddress").html(data);
				}
				});
			}
            function shippingPersonDetails(ele)
            {   
                debugger
                var shippingAddressId = $("#shippingAddress option:selected").val();
    
                $('#shippingAdd').val(shippingAddressId);
                $.ajax
					({
						url		: "getShippingPersonName.php?shippingAddressId="+shippingAddressId,
						success	: function(result)
                        {   
                                $('#shippingContactPerson').html(result);
                        }
                    })
            }
            function BillingPersonalDeatils()
            {
                debugger
                var billingAddressId = $("#billingAddress option:selected").val();
                var shippingAddressId = $("#shippingAddress option:selected").val();

                $('#billingAdd').val(billingAddressId);
                $.ajax
                ({
                    url : "getBillingPersonalDetails.php?billingid="+billingAddressId,
                    success : function(data)
                    {
                        $('#billingContactPerson').html(data);
                    }
                })
            }

            //get customer details on select customer name
          
            function shipping(ele){
                debugger
                var shippingPersonID = ele.value; 
                // var shippingAddressId = $("#shippingAddress option:selected").val();
                // $('#shippingAdd').val(shippingAddressId);
                // console.log(shippingPersonID);
                if(shippingPersonID == 'other')
                {
                    // $('#shippingContactNumber').hide();
                    // $('#shippingEmail').hide();
                    $( "#shippingButton" ).trigger( "click" );
                  
                //    $('#add_details').prepend('<div class="row col-sm-12"><div class="col-sm-3"><div class="form-group form-default form-static-label "><input type="text" class="form-control form-control-normal" id="shippingContactName" name="shippingContactName"  "><span class="form-bar"></span><label class="float-label">Shipping Person Name</label> </div></div> <div class="col-sm-3"><div class="form-group form-default form-static-label "><input type="text" class="form-control form-control-normal" id="shippingContactNumber" name="shippingContactNumber"  onkeypress="return isNumberKey(event)"><span class="form-bar"></span><label class="float-label">Shipping Person Contact</label> </div></div><div class="col-sm-3"><div class="form-group form-default form-static-label"><input type="text" class="form-control form-control-normal" id="shippingEmail" name="shippingEmail"><span class="form-bar"></span><label class="float-label">Shipping Person Email</label></div> </div></div>');
                //    $('div').remove('.prsn_contact');

                }
                else
                {
                    $.ajax
					({
						url		: "getShippingDetails.php?shippingAddressId="+shippingPersonID,
						success	: function(result)
                        {
                            var details_array = result.split('::');

                            // $("#shippingContactPerson").val(details_array[0]);
                            $("#shippingContactNumber").val(details_array[0]);
                            $("#shippingEmail").val(details_array[1]);
                            $("#storeLocation").val(details_array[2]);

                            $('#shippingContact').val(details_array[1]);
                            $('#shippingPerson').val(details_array[0]);
                            $('#shippingemail').val(details_array[2]);    
                        }
					}) 
                }
                
                }
          


            function billing(ele){
                debugger
                var billingPersonID = ele.value;
                var shippingAddressId = $("#shippingAddress option:selected").val();
                // $('#billingAdd').val(billingAddressId);
                if(billingPersonID == 'other')
                {
                    $( "#billingButton" ).trigger( "click" );
                }
                else
                {
                    $.ajax
                        ({
                            // url		: "getBillingDetails.php?billingAddressId="+billingAddressId,
                            url  : "getBillingDetails.php",
                            data : {billingPersonID:billingPersonID,shippingAddressId:shippingAddressId},
                            success	: function(result)
                            {
                                var details_array = result.split('::');
                                var data = details_array[1].split('-');
                                
                                // $('#modal-2').html('thank you');
                                // $('#modal-2 .modal-body p').html('test');
                                // $('#modal-2').show();
                                // alert(result);
                                if(data[1] !="")
                                {
                                    debugger
                                    // $("#billingContactPerson").val(details_array[0]);
                                    $("#billingContactNumber").val(details_array[0]);
                                    $("#billingEmail").val(data[0]);

                                    // $('#billingPerson').val(details_array[]);
                                    $('#billingContact').val(details_array[1]);
                                    $('#billingemail').val(data[0]);
                                    // $('#fileName').prop('readonly', false);
                                    
                                    // $('#projectSubmit1').trigger('click');
                                    // $( "#fileName" ).focus();
                                    // $("#fileName").attr('readonly', false);
                                    
                                    
                                }
                                else{
                                    toastr.options.positionClass = "toast-bottom-right";toastr.error("Please select Shipping Address");

                                }
                                

                                // jQuery("#modal-2").modal('show');

                            }   
                        }) 
                }
            }

        
        function fileSearch(){

            var fileName = $("#fileName").val();
            
            $.ajax({
                    type	: 'GET',
                    url		: 'fetchFileName.php?fileName='+fileName,
                    success	: function(result)
                    {
                    var count = result;
                    console.log(count); 
                    if(count >= 1){
                            toastr.options.positionClass = "toast-bottom-right";toastr.error("File Number Already Exist");
                            $("#fileName").val('');
                    }
                    else{

                    }
                        
                    }
            })

        }

        function fileSearch1(id){

        var fileName = $("#fileName_"+id).val();
        
        $.ajax({
                type	: 'GET',
                url		: 'fetchFileName.php?fileName='+fileName,
                success	: function(result)
                {
                    var count = result;
                    console.log(count); 
                    if(count >= 1){
                            toastr.options.positionClass = "toast-bottom-right";toastr.error("File Number Already Exist");
                            $("#fileName_"+id).val('');
                    }
                    else{

                    }     
                }
            })

        }
        
        //validation for file name to accept only uppercase letter
        function forceInputUppercase(e)
        {
            var start = e.target.selectionStart;
            var end = e.target.selectionEnd;
            e.target.value = e.target.value.toUpperCase();
            e.target.setSelectionRange(start, end);
        }

        document.getElementById("fileName").addEventListener("keyup", forceInputUppercase, false);

        
        
    </script>
    <script>
    function fileTypeValidation()
    {
        //var val1 = val.split('-');
        //console.log('hello');
            var selects = $('.dd');
           
            // selects.click(function() {
                // build array of selected option indexes
                var indexes = [];
               // console.log('hello');
                $.each(selects, function() {
                    indexes.push($(this).children('option:selected').index());
                    //console.log(indexes);
                });
                $.each(selects, function() {
                    var selected = $(this).children('option:selected').index();
                   
                    if(selected != 2){
                        //var x = document.getElementsByClassName("dd").options[2].disabled = true;
                        // var y = $("#selbox").val($("#selbox option:eq(1)").prop('disabled', true));
                        //console.log(y)
                        $.each($(this).children('option'), function(index, item) {
                            var idOfFileType = $(this).val().split('-');
                            //console.log(index)
                            if ($(this).val() && indexes.indexOf(index) > -1 && index != selected) {

                                $(this).prop('disabled', true);
                            } else {
                                //$(this).show();
                                $(this).prop('disabled', false);
                            }
                        });
                    }
                    else{
                        $('.dd').prop('disabled', true);
                    }
                });
            // });
    }

        // var selects = $('.dd');
        // selects.change(function() {
        //     // build array of selected option indexes
            
        // });


    function poTypeChange(id){
        debugger
        console.log(id)
        if(id == 'default'){
                if($('#quotationNumber').val() != ""){
                    $('#quotationDate').attr("required","required");
                }
                else{
                    $('#quotationDate').val("");
                }
                if($('#po_number').val() != ""){
                    $('#poType option:first').attr("disabled",false)
                    $('#po_number').attr("required","required");
                    $('#po_date').attr("required","required");
                    $('#file').attr("required","required");
                    //$('#po_number').attr("disabled",false);
                    $('#po_date').attr("disabled",false);
                    $('#file').attr("disabled",false);
                    $('#poAmount').attr("disabled",false);
                    $('#poAmount').attr("required","required");
                    $('#taxType').attr("required",true);
                   // $('#poTaxAmount').attr("disabled", false);
                }else if($('#po_number').val() == ""){
                    $('#poType option:first').attr("disabled",true)
                    $('#po_number').attr("required",false);
                    $('#po_date').attr("required",false);
                    $('#file').attr("required",false);
                    $('#po_number').val("");
                    $('#po_date').val("");
                    $('#file').val("");
                   // $('#po_number').attr("disabled",true);
                    $('#po_date').attr("disabled",true);
                    $('#file').attr("disabled",true);
                    $('#poAmount').attr("disabled",true);
                    //$('#taxType').attr("disabled", true);
                    $('#poTaxAmount').attr("disabled", true);
                }   
        }else{
            if($('#quotationNumber_'+id+'').val() != ""){
                    $('#quotationDate_'+id+'').attr("required","required");
                }
                else{
                    $('#quotationDate_'+id+'').val("");
                }
            if($('#po_number_'+id+'').val() != ""){
                    $('#poType_'+id+' option:first').attr("disabled",false)
                    $('#po_number_'+id+'').attr("required","required");
                    $('#po_date_'+id+'').attr("required","required");
                    $('#file_'+id+'').attr("required","required");
                   // $('#po_number_'+id+'').attr("disabled",false);
                    $('#po_date_'+id+'').attr("disabled",false);
                    $('#file_'+id+'').attr("disabled",false);
                    $('#poAmount_'+id+'').attr("disabled",false);
                    $('#poAmount_'+id+'').attr("required","required");
                    $('#taxType_'+id+'').attr("disabled", false);
                    $('#taxType_'+id+'').attr("required","required");
                    //$('#poTaxAmount_'+id+'').attr("disabled", false);
                }else if($('#po_number_'+id+'').val() == ""){
                    $('#poType_'+id+' option:first').attr("disabled",true)
                    $('#po_number_'+id+'').attr("required",false);
                    $('#po_date_'+id+'').attr("required",false);
                    $('#file_'+id+'').attr("required",false);
                    $('#po_number_'+id+'').val("");
                    $('#po_date_'+id+'').val("");
                    $('#file_'+id+'').val("");
                   // $('#po_number_'+id+'').attr("disabled",true);
                    $('#po_date_'+id+'').attr("disabled",true);
                    $('#file_'+id+'').attr("disabled",true);
                    $('#poAmount_'+id+'').attr("disabled",true);
                    //$('#taxType_'+id+'').attr("disabled", true);
                    $('#poTaxAmount_'+id+'').attr("disabled", true);
                }   
        }
       
    }
    function poTypeChange1(number,id){
        debugger
        // console.log(number,id)
        // alert(number);
        if(id == 'default'){
                if($('#quotationNumber').val() != ""){
                    $('#quotationDate').attr("required","required");
                }
                else{
                    $('#quotationDate').val("");
                }
                if($('#po_number_'+number).val() != ""){
                    $('#poType_'+number+' option:first').attr("disabled",false)
                    $('#po_number_'+number).attr("required","required");
                    $('#po_date_'+number).attr("required","required");
                    $('#file_'+number).attr("required","required");
                    //$('#po_number').attr("disabled",false);
                    $('#po_date_'+number).attr("disabled",false);
                    $('#file_'+number).attr("disabled",false);
                    $('#poAmount_'+number).attr("disabled",false);
                    $('#poAmount_'+number).attr("required","required");
                    $('#taxType_'+number).attr("required",true);
                   // $('#poTaxAmount').attr("disabled", false);
                }else if($('#po_number_'+number).val() == ""){
                    $('#poType_'+number+'option:first').attr("disabled",true)
                    $('#po_number_'+number).attr("required",false);
                    $('#po_date_'+number).attr("required",false);
                    $('#file_'+number).attr("required",false);
                    $('#po_number_'+number).val("");
                    $('#po_date_'+number).val("");
                    $('#file_'+number).val("");
                   // $('#po_number').attr("disabled",true);
                    $('#po_date_'+number).attr("disabled",true);
                    $('#file_'+number).attr("disabled",true);
                    $('#poAmount_'+number).attr("disabled",true);
                    //$('#taxType').attr("disabled", true);
                    $('#poTaxAmount_'+number).attr("disabled", true);
                }   
        }else{
            if($('#quotationNumber_'+number+'').val() != ""){
                    $('#quotationDate_'+number+'').attr("required","required");
                }
                else{
                    $('#quotationDate_'+number+'').val("");
                }
            if($('#po_number_'+number+'').val() != ""){
                    $('#poType_'+number+' option:first').attr("disabled",false)
                    $('#po_number_'+number+'').attr("required","required");
                    $('#po_date_'+number+'').attr("required","required");
                    $('#file_'+number+'').attr("required","required");
                   // $('#po_number_'+number+'').attr("disabled",false);
                    $('#po_date_'+number+'').attr("disabled",false);
                    $('#file_'+number+'').attr("disabled",false);
                    $('#poAmount_'+number+'').attr("disabled",false);
                    $('#poAmount_'+number+'').attr("required","required");
                    $('#taxType_'+number+'').attr("disabled", false);
                    $('#taxType_'+number+'').attr("required","required");
                    //$('#poTaxAmount_'+number+'').attr("disabled", false);
                }else if($('#po_number_'+number+'').val() == ""){
                    $('#poType_'+number+' option:first').attr("disabled",true)
                    $('#po_number_'+number+'').attr("required",false);
                    $('#po_date_'+number+'').attr("required",false);
                    $('#file_'+number+'').attr("required",false);
                    $('#po_number_'+number+'').val("");
                    $('#po_date_'+number+'').val("");
                    $('#file_'+number+'').val("");
                   // $('#po_number_'+number+'').attr("disabled",true);
                    $('#po_date_'+number+'').attr("disabled",true);
                    $('#file_'+number+'').attr("disabled",true);
                    $('#poAmount_'+number+'').attr("disabled",true);
                    //$('#taxType_'+number+'').attr("disabled", true);
                    $('#poTaxAmount_'+number+'').attr("disabled", true);
                }   
        }
       
    }
    </script>
    <script>
        //validation for no and negative sign
        // function isNumberKey(evt,id)
        //     {
        //         console.log(id);
        //         var charCode = (evt.which) ? evt.which : evt.keyCode;
        //         if (charCode != 46 && charCode > 31
        //         && (charCode < 48 || charCode > 57))
        //             return false;

        //         return true;
        //     }
        function deleteAppendedDiv(divname){
            $(divname).remove()
        }
    </script>
    <script>
        var i = 1;
        $("#appendInuts").click(function(){
            debugger
            $.ajax({
                    url: config_obj.base_url+"/project/addPOdetailsClone.php",
                    type: 'POST',
                    data: {incrementedID : i},
                    success: function (data) 
                    {
                        $('#dynamicappend').append(data);
                        data=$(data).find('input#data');
                        var id = data.prevObject[0].id;
                        
                        $('html, body').animate({
                            scrollTop: $("#"+id).offset().top
                        }, 2000);
                    }
            })
            i++;
        })
    </script>
    <!-- Dynamic Side Nav -->
    <script>

            $.ajax({
                url:config_obj.base_url+"/sideNav/sideNavBar.php",
                type:"POST",
                success: function (result) {
                    $('#sideNavebar').html(result);
                }
            })

    </script>
    <script>
var bound_array = [];

$('#toggleNav').click(function() {
    // alert('this is function');
    $("i", this).toggleClass("fa fa-filter fa fa-times");
});


$("#header").click(function () {
    $('.collapse').collapse();
    $('.collapse').toggle();
});

$("#mobile-collapse").click(function () {

    $('.collapse').collapse();
    $('.collapse').toggle();
});


var A=1;
var projectidset ;
$('#defaultChecked').click(function() {
        debugger
            var doc; 
            
            var result = confirm("Add Labour file!"); 
            if (result == true) { 

                var file_data = $('#file')[0].files[0];   

                var data1 = new FormData();
                let myForm = document.getElementById('file1').files[0];
                let fileName     = $('#fileName').val();
                projectidset = $('#projectidset').val();
                let fileTypeId   = $('#poType').val();
                let parentFileNo = $('parentFileNo').val();
                let quotationNumber = $('#quotationNumber').val();
                let quotationDate = $('#quotationDate').val();
                let productId  = $('#productId3').val();
                let projectDescription = $('#projectDescription').val();
                let storeLocation = $('#storeLocation').val();
                let unitLocation  = $('#unitLocation').val();
                let finacialYear  = $('#finacialYear').val();
                let po_number     = $('#po_number1').val();
                let po_date       = $('#po_date1').val();
                let poAmount      = $('#poAmounts1').val();
                let poamountdetails = $('poamountdetails1').val();
                let taxType       = $('#taxTypes1').val();
                let cashamt       = $('#Amt_cash').val();
                let comment       = $('#cashComment').val();
                if(fileName == '' || fileName == null)
                {
                    alert("Please Enter File Name");
                    $('#fileName').focus();
                    return false;
                }
                // console.log(data);
                let formData = new FormData();
                data1.append('file', myForm);
                data1.append('fileName',fileName);
                data1.append('incrementedID',A);
                data1.append('projectidset',projectidset);
                data1.append('fileTypeId',fileTypeId);
                data1.append('parentFileNo',parentFileNo);
                data1.append('quotationNumber',quotationNumber);
                data1.append('quotationDate',quotationDate);
                data1.append('productId',productId);
                data1.append('projectDescription',projectDescription);
                data1.append('storeLocation',storeLocation);
                data1.append('unitLocation',unitLocation);
                data1.append('finacialYear',finacialYear);
                data1.append('po_number',po_number);
                data1.append('po_date',po_date);
                data1.append('po_amount',poAmount);
                data1.append('poamountdetails',poamountdetails);
                data1.append('taxType',taxType);
                data1.append('CashAmt',cashamt);
                data1.append('comment',comment);
                var scrolldata = '#filesavescroll_'+A;
                console.log(po_number);
                console.log(formData) ;  
                    $.ajax({  
                            type: "POST",  
                            url: "filesave.php",  
                            data: data1,  
                            contentType: false,
                            cache: false,
                            processData:false,
                            // beforeSend: function(){
                            //     // Show image container
                            //     $(".loading").show();
                            // },
                            success: function(value) {  
                                toastr.success('Project File Add Successfully', 'Add File');
                                $('#dynamicappendS').html(value);
                                $('html, body').animate({
                                    scrollTop: $(scrolldata).offset().top
                                }, 2000);
                            }
                            // ,complete:function(){
                            //     // Hide image container
                            //     // alert('not complete');
                            //     $(".loading").hide();
                            // },
                            // error: function(XMLHttpRequest, textStatus, errorThrown) {
                            //     $('.lossConnection').show();
                            //     setTimeout(function(){ $('.lossConnection').hide() }, 10000);
                            // }
                        });
                        A++;
            } else { 
                doc = "Cancel was pressed."; 
                // alert(doc) 
            } 
});
var B =2;
function saveMaterialFile(id)
{
    debugger
    // alert(id.id);
    // var id = id.id;
    var i =1;
    // var projectID = $('#projectidset').val();
    var doc; 
            var result = confirm("Add Labour file!"); 
            if (result == true) { 
                // var file_data = $("#file_"+id).prop("files")[0]; 
                var filedata = document.getElementById("file_"+id)[0]
                // var projectidset = $('#projectidset').val();
                console.log(filedata); 
                // var data = $("#filedata").serialize();
                // var data = $('#autoAdded'+id).find('select, textarea, input').serialize()+ "&incrementedID=" + B + "&file=" + file_data+"&projectidset="+projectidset;


                  var data1 = new FormData();
                let myForm = document.getElementById('file_'+id).files[0];
                // let myForm = $('#file_'+id).prop('files')[0];
                let fileName     = $('#fileName_'+id).val();    
                let projectidset = $('#projectidset').val();
                let fileTypeId   = $('#poType_'+id).val();
                let parentFileNo = $('parentFileNo_'+id).val();
                let quotationNumber = $('#quotationNumber_'+id).val();
                let quotationDate = $('#quotationDate_'+id).val();
                let productId  = $('#productId_'+id).val();
                let projectDescription = $('#projectDescription_'+id).val();
                let storeLocation = $('#storeLocation_'+id).val();
                let unitLocation  = $('#unitLocation_'+id).val();
                let finacialYear  = $('#finacialYear_'+id).val();
                let po_number     = $('#po_number_'+id).val();
                let po_date       = $('#po_date_'+id).val();
                let poAmount      = $('#poAmount_'+id).val();
                let poamountdetails = $('poamountdetails_'+id).val();
                let taxType       = $('#taxType_'+id).val();
                if(fileName == '' || fileName == null)
                {
                    alert("Please Enter File Name");
                    $('#fileName_'+id).focus();
                    return false;
                }
             
                data1.append('file', myForm);
                data1.append('incrementedID',B);
                data1.append('fileName',fileName);
                data1.append('projectidset',projectidset);
                data1.append('fileTypeId',fileTypeId);
                data1.append('parentFileNo',parentFileNo);
                data1.append('quotationNumber',quotationNumber);
                data1.append('quotationDate',quotationDate);
                data1.append('productId',productId);
                data1.append('projectDescription',projectDescription);
                data1.append('storeLocation',storeLocation);
                data1.append('unitLocation',unitLocation);
                data1.append('finacialYear',finacialYear);
                data1.append('po_number',po_number);
                data1.append('po_date',po_date);
                data1.append('po_amount',poAmount);
                data1.append('poamountdetails',poamountdetails);
                data1.append('taxType',taxType);

                    $.ajax({  
                            type: "POST",  
                            url: "filesave.php",  
                            data: data1,  
                            contentType: false,
                            cache: false,
                            processData:false,
                            // beforeSend: function(){
                            //     // Show image container
                            //     $(".loading").show();
                            // },
                            success: function(value) {  
                                    $('#dynamicappend'+id).html(value);
                                    toastr.success('Project File Add Successfully', 'Add File');
                            }
                            // ,complete:function(data){
                            //     // Hide image container
                            //     $(".loading").hide();
                            // },
                            // error: function(XMLHttpRequest, textStatus, errorThrown) {
                            //     $('.lossConnection').show();
                            //     setTimeout(function(){ $('.lossConnection').hide() }, 10000);
                            // }
                        });
                        B++;
            } else { 
                doc = "Cancel was pressed."; 
                // alert(doc) 
            } 
}
$('#defaultChecked1').click(function() {
            var doc; 
            var result = confirm("Add Labour file!"); 
            var fileName = jQuery('input[name="fileName[]"]').val();
            if(fileName == null || fileName == '')
            {
                alert("Please Enter File Name");
                
                return false;
            }
            if (result == true) { 
              
                var data = $("#filedata").serialize();
                    //  alert(data);
                    // console.log(data);
                    $.ajax({  
                            type: "POST",  
                            url: "filesave.php",  
                            data: data,  
                            success: function(value) {  
                                    // $('#dynamicappend').html(value);
                            }
                        });
            } else { 
                doc = "Cancel was pressed."; 
                // alert(doc) 
            } 
});

function showdata(e,ele)
{   
    debugger
    // alert(e.id);
    if ($('#'+e.id).prop(':checked',false))
    {
        // $("#"+e.id).prop("checked", true);
        document.getElementById(e.id).checked = true;  
        $("input:checked").removeAttr("checked");
 
    }
    else
    {
        // $("#"+e.id).prop("checked", false); 
        document.getElementById(e.id).checked = false; 
        

 

    }
    if(ele == 'ABG')
    {
        $('#show14').show();
        $('#penaultyClause').hide();
        $('#advanceShow').hide();
    }
    else if(ele == 'PBG')
    {
        $('#show15').show();
    }
    else if(ele == 'PC')
    {
        $('#penaultyClause').show();
        $('#show14').hide();
        $('#advanceShow').hide();
    }
    else if(ele == 'ADV')
    {
        $('#advanceShow').show();
        $('#show14').hide();
        $('#penaultyClause').hide();

    }
    else{
        $('#show14').hide();
        $('#penaultyClause').hide();
        $('#advanceShow').hide();
    }
}

function showdata1(id,ele)
{
    bound_array.push(ele);
    if(ele == 'ABG' || ele=='PBG')
    {
        $('#show14'+id).show();
        // $('#penaultyClause'+id).hide();
        // $('#advanceShow'+id).hide();
    }
    else if(ele == 'PC')
    {
        $('#penaultyClause'+id).show();
        // $('#show14'+id).hide();
        // $('#advanceShow'+id).hide();
    }
    else if(ele == 'ADV')
    {
        $('#advanceShow'+id).show();
        // $('#show14'+id).hide();
        // $('#penaultyClause'+id).hide();

    }
    else{
        $('#show14'+id).hide();
        $('#penaultyClause'+id).hide();
        $('#advanceShow'+id).hide();
    }
}
function sameaspo(ele)
{
    var id = ele.value;
    // var quoNumber    = $('#quotationNumber').val();
    // var quoDate      = $('#quotationDate').val();
    // var po_no        = $('#po_number1').val();
    // var po_date      = $('#po_date1').val();
    // var finacialyear = $('#finacialYear').val();
    var quoNumber    = $('#quotationNumberML_1').val();
    var quoDate      = $('#quotationDateML_1').val();
    var po_no        = $('#po_numberML_1').val();
    var po_date      = $('#po_dateML_1').val();
    var finacialyear = $('#finacialYearML_1').val();

    $('#quotationNumberML_'+id).val(quoNumber);
    $('#quotationDateML_'+id).val(quoDate);
    $('#po_numberML_'+id).val(po_no);
    $('#po_dateML_'+id).val(po_date);
    // $('#finacialYearML_'+id).val(finacialyear);
    $('#finacialYearML_'+id).select2().val(finacialyear).trigger('change.select2');
}
function sameaspo1(ele)
{
    debugger
    var id = ele.value;
    var quoNumber = $('#quotationNumber').val();
    var quoDate   = $('#quotationDate').val();
    var po_no     = $('#po_number1').val();
    var po_date   = $('#po_date1').val();
    var finacialyear = $('#finacialYear').val();

    $('#quotationNumber_'+id).val(quoNumber);
    $('#quotationDate_'+id).val(quoDate);
    $('#po_number_'+id).val(po_no);
    $('#po_date_'+id).val(po_date);
    // $('#finacialYear_'+id).val(finacialyear);
    $('#finacialYear_'+id).select2().val(finacialyear).trigger('change.select2');

}
// $(document).ready(function(){

        $('input[type="checkbox"]').click(function(){
            debugger
            if($(this).prop("checked") == true){
                var name = $(this).attr('id');
                // alert(name);
                if(name == 'ABG')
                {
                    $('#show14').show();
                }
                else if(name == 'PBG')
                {
                    $('#show15').show();
                }
                else if(name == 'GD1')
                {
                    $('#show16').show();
                }
                else if(name == 'GD2')
                {
                    $('#penaultyClause1').show();
                }
                else if(name == 'GD3')
                {
                    $('#advanceShow1').show();
                }
                else if(name == 'PC')
                {
                    $('#penaultyClause').show();
                }
                else if(name == 'AVT')
                {
                    $('#advanceShow').show();
                }
                else if(name == 'GD')
                {
                    var quoNumber = $('#quotationNumber').val();
                    var quoDate   = $('#quotationDate').val();
                    var po_no     = $('#po_number').val();
                    var po_date   = $('#po_date').val();

                    $('#quotationNumber_1').val(quoNumber);
                    $('#quotationDate_1').val(quoDate);
                    $('#po_number_1').val(po_no);
                    $('#po_date_1').val(po_date);
                }
                else{

                }
            }
            else if($(this).prop("checked") == false){
                var name = this.id;
                if(name == 'ABG')
                {
                    $('#show14').hide();
                    $('#bankGno').val('');
                    $('#bankGamt').val('');
                    $('#todate').val('');
                    $('#enddate').val('');
                }
                else if(name == 'PBG')
                {
                    $('#show15').hide();
                    $('#bankGno').val('');
                    $('#bankGamt').val('');
                    $('#todate').val('');
                    $('#enddate').val('');
                }
                else if(name == 'GD1')
                {
                    $('#show16').hide();
                    $('#bankGno').val('');
                    $('#bankGamt').val('');
                    $('#todate').val('');
                    $('#enddate').val('');
                }
                else if(name == 'PC')
                {
                    $('#penaultyClause').hide();
                    $('#penaultyClause').val('');
                    $('#dispatchDate').val('');
                }
                else if(name == 'GD2')
                {
                    $('#penaultyClause1').hide();
                    $('#penaultyClause').val('');
                    $('#dispatchDate').val('');
                }
                else if(name == 'GD3')
                {
                    $('#advanceShow1').hide();
                    $('#Advanceamt').val('');
                }
                else if(name == 'AVT')
                {
                    $('#advanceShow').hide();
                    $('#Advanceamt').val('');
                }
                else{

                }

            }
        });
    
    // });
// function showSubtype(ele)
// {
//     var array = ele.split("-");
//     // alert(array[0]);
//     debugger
//     if(array[0] == '4')
//     {
//         // $('#ruleGroup').show();
//         $('#PBG1').show();
//         $('#ABG1').hide();
//         $('#ADV1').hide();
//         $('#PC1').hide();
//     }
//     else
//     {
//         $('#ABG1').show();
//         $('#ADV1').show();
//         $('#PC1').show();
//         $('#PBG1').show();
//     }
// }

$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});
function numberValidation(e)
{
    var unicode = e.charCode ? e.charCode : e.keyCode;
        if ((unicode == 8) || (unicode == 9) || (unicode > 47 && unicode < 58)) {
            return true;
        }
        else {

            window.alert("This field accepts only Numbers");
            return false;
        }
}
function showSubtype1(id,ele)
{

    var array = ele.split("-");
    filetypearray.push(array[0]);
    // alert(array[0]);
    // alert(filetypearray);
    
    if(array[0] == '4')
    {
        // $('#ruleGroup').show();
        $('#PBG1'+id).show();
        $('#ABG1'+id).hide();
        $('#ADV1'+id).hide();
        $('#PC1'+id).hide();
    }
    else
    {
        $('#ABG1'+id).show();
        $('#ADV1'+id).show();
        $('#PC1'+id).show();
        $('#PBG1'+id).show();
    }
}
</script>
</body>
<!-- Body Ends -->

</html>
<!-- HTML Ends -->

<?php 

     //db connection file
    include_once('../database/db_connection.php');

    if(isset($_POST['save']))
    {   
        
        $custId   = $_POST['custId'];
        $productId = $_POST['productId'];
        $projectidd1 = $_POST['projectidset11'];
        $projectidd = trim($projectidd1);
        // $fileTypeId =$_POST['fileTypeId'];
        $boundCount = 1;
        $filearray = array();
        $fileT     = $_POST['fileTypeId']; 
        $taxType   = $_POST['taxType'];   
        $fileName = $_POST['fileName'];
        $finacialYear = $_POST['finacialYear'];
        echo " financial year -->".
print_r($_POST['finacialYear']);
echo "-------------------";

        $parentTypeId = $_POST['parentFileNo']; 
        // print_r($parentTypeId);
        $bound        = $_POST['boundType'];

        $bankGno1      = $_POST['bankGno1'];
        $bankGamt1     = $_POST['bankGamt1'];
        $BGDate1      = $_POST['BGDate1'];
        $BGEDate1      = $_POST['BGEDate1'];
        $BCdate1       = $_POST['BCdate1'];
        $file11       = $_POST['file11'];

        $bankGno2      = $_POST['bankGno2'];
        $bankGamt2     = $_POST['bankGamt2'];
        $BGDate2      = $_POST['BGDate2'];
        $BGEDate2      = $_POST['BGEDate2'];
        $BCdate2       = $_POST['BCdate2'];
        $file12       = $_POST['file12'];

        $bankGno3      = $_POST['bankGno3'];
        $bankGamt3     = $_POST['bankGamt3'];
        $BGDate3      = $_POST['BGDate3'];
        $BGEDate3      = $_POST['BGEDate3'];
        $BCdate3       = $_POST['BCdate3'];
        $file13       = $_POST['file13'];

        $porecevice1   = $_POST['poreceiveDate1'];
        $porecevice2   = $_POST['poreceiveDate2'];
        // $porecDate    = $_POST['porecDate'];
        // $enddate      = $_POST['enddate'];
        $dispatchDate1 = $_POST['dispatchDate1'];
        $penalty1      = $_POST['penalty1'];
        $Advanceamt1  = $_POST['Advanceamt1'];

        $dispatchDate2 = $_POST['dispatchDate2'];
        $penalty2      = $_POST['penalty2'];
        $Advanceamt2   = $_POST['Advanceamt2'];
        $filenamearray = array();
    
        // AMC varible get form
        $AMCFrom = $_POST['AMCFrom'];
        $AMCto   = $_POST['AMCto'];
        $AMCVisit= $_POST['AMCVisit'];
        $MAE     = $_POST['MAE'];
        $EEA     = $_POST['EEA'];
        // $unitLoactionAMC = $_POST['unitLoactionAMC'];
        $AMCMonth = $_POST['AMCMonth'];

        $cashAmt    = $_POST['AMT_cash'];
        $comment    = $_POST['cashComment'];
        
        $unitLoactionAMC = $_POST['unitLocationAMC1'];
        // print_r($_POST['unitLocationAMC1']);
        $sql = mysqli_query($con,"select * from file_master");
        while($row1 = mysqli_fetch_assoc($sql))
        {
            array_push($filenamearray ,$row1['FILE_NAME']);
        }

        $timestamp = date("Y-m-d H:i:s",time()+19800);

         
        $projectDescription = mysqli_real_escape_string($con,$_POST['projectDescription']);
        
        $shippingAddrId = $_POST['shippingAddrId'];
        $billingAddrId  = $_POST['billingAddrId'];
       
        $shippingContactPerson = $_POST['shippingContactPerson'];
        if($shippingContactPerson == 'other')
        {
            $shippingContactPerson =$_POST['shippingContactName'];
        }
        $shippingContactPerson1 = ltrim($shippingContactPerson," ");//remove starting white space
        $shippingContactNumber = $_POST['shippingContactNumber'];
        $shippingEmail         = $_POST['shippingEmail'];

        $billingContactPerson = $_POST['billingContactPerson'];
        if($billingContactPerson == 'other')
        {
            $billingContactPerson = $_POST['billingContactName'];
        }
        $billingContactPerson1 = ltrim($billingContactPerson," ");//remove starting white space
        $billingContactNumber = $_POST['billingContactNumber'];
        $billingEmail         = $_POST['billingEmail'];

        // $unitLocation = mysqli_real_escape_string($con,$_POST['unitLocation']);
        // $storeocation = mysqli_real_escape_string($con,$_POST['storeLocation']);
        $storeLocation      = $_POST['storeLocation'];
        $unitLocation       = $_POST['unitLocation'];
        $productId          = $_POST['productId'];
        $projectDescription = $_POST['projectDescription'];

        $id =0;
        //update shipping contact person and contact number
        $updateQuery = mysqli_query($con, "UPDATE address_master SET CONTACT_PERSON_NAME = '".$shippingContactPerson1."', CONTACT_NUMBER = '".$shippingContactNumber."', CONTACT_PERSON_EMAIL = '".$shippingEmail."' WHERE ADDRESS_ID = '$shippingAddrId'");

        //update billing contact person and contact number
        $updateQuery = mysqli_query($con, "UPDATE address_master SET CONTACT_PERSON_NAME = '".$billingContactPerson1."', CONTACT_NUMBER = '".$billingContactNumber."', CONTACT_PERSON_EMAIL = '".$billingEmail."' WHERE ADDRESS_ID = '$billingAddrId'");

        echo "<br><br>PRODUCT ID = ".$productId."<br><br>";
        //insert data in project master table
    //    $insertQuery = mysqli_query($con, "INSERT INTO project_master(CUSTOMER_ID, SHIPPING_ADDRESS_ID, BILLING_ADDRESS_ID) VALUES ('".$productId."".$custId."', '".$shippingAddrId."', '".$billingAddrId."')");
        // foreach($_FILES['file']['name'] as $count => $value)
        // echo '<br>';
        // echo "INSERT INTO project_master(PRODUCT_ID, CUSTOMER_ID, SHIPPING_ADDRESS_ID, BILLING_ADDRESS_ID) VALUES ('".$productId."','".$custId."', '".$shippingAddrId."', '".$billingAddrId."')";
        // echo '<br>';
    //    $projectId   = $con->insert_id;
// ---------------------------------------------------------------------------------------------------------------------------
       $po_version_query = '';
       $quotation_version_query = '';
       if(isset($_POST['po_number'])){

       
        foreach ($fileT as $key => $value) {
            # code...
            if($key == 0)
            {
                $po_number1       = $_POST['po_number'][$key];
            }
            $vesion_timestamp1 = date("Y-m-d H:i:s",time()+19800);
            $vesion_timestamp = $vesion_timestamp1."-".$key."-";

            $myString = $fileT[$key];
            $fileTypeNo = explode('-', $myString);
            $FILE_TYPE_ID = $fileTypeNo[0];

            //tax id
            $taxString = $taxType[$key];
            $taxIdBreak = explode('-', $taxString);
            $tax_id = $taxIdBreak[0];
            
            
            $quotationNumber = mysqli_real_escape_string($con,$_POST['quotationNumber'][$key]);
            $quotationDate = mysqli_real_escape_string($con,$_POST['quotationDate'][$key]);

            // $insertFileData = mysqli_query($con, "Insert into file_master(PROJECT_ID, FILE_NAME, FILE_TYPE_ID, PARENT_FILE_ID, FINANCIAL_YEAR, TIMESTAMP) VALUES ('".$projectId."', '".$fileName[$key]."', '".$FILE_TYPE_ID."', '".$parentTypeId[$key]."', '".$finacialYear[$key]."','".$timestamp."')");
            $sqlquery = mysqli_query($con,"select * form file_master");
            while ($row = mysqli_fetch_assoc($sqlquery))
            {
                array_push($filenamearray,$row['FILE_NAME']);
            }
            echo '<br>';
            // print_r($filenamearray);
            echo '<br>';
            
            if (in_array($fileName[$key], $filenamearray)) {
                echo 'filename match<br>';
            }
            else
            {
                if($FILE_TYPE_ID == 4)
                {
                    $insertFileData = mysqli_query($con,"Insert into file_master(PROJECT_ID, FILE_NAME, FILE_TYPE_ID, PARENT_FILE_ID, FINANCIAL_YEAR,PRODUCT_ID,PRODUCT_DESCRIPTION,STORE_LOCATION,UNIT_LOCATION,cashamount,comment,TIMESTAMP) VALUES ('".$projectidd."', '".$fileName[$key]."', '".$FILE_TYPE_ID."', '".$parentTypeId[$id]."', '".$finacialYear[$key]."','".$productId[$key]."','".$projectDescription[$key]."','".$storeLocation[$key]."','".$unitLocation[$key]."','".$cashAmt[$key]."','".$comment[$key]."','".$timestamp."')");

                    $fileId   = $con->insert_id;
                    $id++;
                    $quotation_version_query = mysqli_query($con, "INSERT INTO quotation_version(QUOT_NUMBER, QUOT_DATE, FILE_ID, QUOT_VERSION_NO, VERSION_STATUS, VERSION_TIMESTAMP) VALUES ('".$quotationNumber."','".$quotationDate."', '".$fileId."', '1', '1', '".$vesion_timestamp1."')");

                    // FOR NOTIFICATION
                    $timeW = date("d-m-Y h:m:s", time());
                    $getData_  = mysqli_query($con, "SELECT receiver_user_id,message from notification_new_ WHERE sender_user_id like '%$employee_id%' AND notificationtype like '%Add new project%'");
                  
                    while ($row11 =mysqli_fetch_assoc($getData_))
                    {
                        $receiver_user_id = $row11['receiver_user_id'];
                        $message          = $row11['message'];

                        $message = str_replace('$filename', $fileName[$key], $message);
            
                        $insertQuery_ = "INSERT INTO `notification_new`(`user_id`, `notification`,notificationtype, `status`,`timestamp`) VALUES ('$receiver_user_id','$message','Add new project','0','$timeW')";
                        $resinsertQuery2  = mysqli_query($con, $insertQuery_);
            
                        $checkQuery9 = mysqli_query($con, "SELECT deviceid FROM `employeemaster` WHERE `employeeId` = '$receiver_user_id'");
                    
                        // if($clientname!='')
                        // {
                      
                        // }
                            
                        
                                //   echo "103";
                                while ($row1 = mysqli_fetch_assoc($checkQuery9)) {
                                    //   echo "104";
                                    $dataarray3 = $row1['deviceid'];
                                    
            
                                    // $curl = curl_init();
            
                                    
                                    //      $url='http://68.183.85.175/curl.php';
                                    
                                    //     // 	curl_setopt($curl, CURLOPT_POST, 1);
                                    //     // 	curl_setopt($curl, CURLOPT_URL, $url);
                                    //     // 	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                                    //     // 	$result = curl_exec($curl);
                                    //     // 	curl_close($curl);
            
            
            
                                    // $notification = array();
                                    // $arrNotification = array();
                                    // $arrData = array();
                                    // $arrNotification["body"] = $message;
            
                                    // $arrNotification["title"] = "New File";
                                    // $arrNotification["sound"] = "default";
                                    // $arrNotification["type"] = 1;
            
                                    // $arrNotification["notificationto"] = "student";
                                    // $arrNotification["acttype"] = $activity_type_a;
                                    // $arrNotification["category"] = "LOGOUT";
            
                                    // $regId = $dataarray3;
            
                                    // $device_type = "Android";
                                    // // $url = 'https://fcm.googleapis.com/fcm/send';
                                    // if ($device_type == "Android") {
                                    //     $fields = array(
                                    //         'to' => $regId,
                                    //         'data' => $arrNotification
                                    //     );
                                    // } else {
                                    //     $fields = array(
                                    //         'to' => $regId,
                                    //         'notification' => $arrNotification
                                    //     );
                                    // }
                                  
                                    // curl_setopt($curl, CURLOPT_URL, $url);
                                    // curl_setopt($curl, CURLOPT_POST, true);
                                    // // curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
                                    //  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                                    // // Disabling SSL Certificate support temporarly
                                    // curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
                                    // curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($fields));
                                    // print_r(json_encode($fields));
                                    // // curl_setopt($ch, CURLOPT_TIMEOUT, 180);
                                    // // curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);
                                    // $result = curl_exec($curl);
                                    //  print_r($result);
                                    // if ($result === FALSE) {
                                    //     die('Curl failed: ' . curl_error($curl));
                                    // }
                                    // else
                                    // {
                                    //     echo "True";
                                    // }
                                    
                                    // if (curl_errno($ch)) {
                                    //     $error_msg = curl_error($curl);
                                    // }
                                    // // print_r($error_msg);
            
                                    // curl_close($curl);
            
                                    
                                    
            
                                }
                            
            
                    }
                    // 
               
                }
                else{

                    // echo 'yes';
                    // echo "SELECT receiver_user_id,message from notification_new_ WHERE sender_user_id like '%A$employee_id%' AND notificationtype like '%Add new project%'";
                    // die;
                    if($AMCVisit =='')
                    {
                        $AMCVisit = 0;
                    }
                    $insertFileData = mysqli_query($con,"Insert into file_master(PROJECT_ID, FILE_NAME, FILE_TYPE_ID,FINANCIAL_YEAR,PRODUCT_ID,PRODUCT_DESCRIPTION,STORE_LOCATION,UNIT_LOCATION,AMC_Start_date,AMC_end_date,AMC_visit,Marketing_amount,AMC_amount,employee_id,cashamount,TIMESTAMP) VALUES ('".$projectidd."', '".$fileName[$key]."', '".$FILE_TYPE_ID."','".$finacialYear[$key]."','".$productId[$key]."','".$projectDescription[$key]."','".$storeLocation[$key]."','".$unitLocation[$key]."','".$AMCFrom."','".$AMCto."','".$AMCVisit."','".$MAE."','".$EEA."','".$employee_id."','".$cashAmt[$key]."','".$timestamp."')");
                    echo  "Insert into file_master(PROJECT_ID, FILE_NAME, FILE_TYPE_ID,FINANCIAL_YEAR,PRODUCT_ID,PRODUCT_DESCRIPTION,STORE_LOCATION,UNIT_LOCATION,AMC_Start_date,AMC_end_date,AMC_visit,Marketing_amount,AMC_amount,employee_id,TIMESTAMP) VALUES ('".$projectidd."', '".$fileName[$key]."', '".$FILE_TYPE_ID."','".$finacialYear[$key]."','".$productId[$key]."','".$projectDescription[$key]."','".$storeLocation[$key]."','".$unitLocation[$key]."','".$AMCFrom."','".$AMCto."','".$AMCVisit."','".$MAE."','".$EEA."','".$employee_id."','".$timestamp."')";
                    echo '<br>';
                    $fileId = $con->insert_id;
                    $quotation_version_query = mysqli_query($con, "INSERT INTO quotation_version(QUOT_NUMBER, QUOT_DATE, FILE_ID, QUOT_VERSION_NO, VERSION_STATUS, VERSION_TIMESTAMP) VALUES ('".$quotationNumber."','".$quotationDate."', '".$fileId."', '1', '1', '".$vesion_timestamp1."')");

                    echo "INSERT INTO quotation_version(QUOT_NUMBER, QUOT_DATE, FILE_ID, QUOT_VERSION_NO, VERSION_STATUS, VERSION_TIMESTAMP) VALUES ('".$quotationNumber."','".$quotationDate."', '".$fileId."', '1', '1', '".$vesion_timestamp1."')";



                    // FOR NOTIFICATION
                    $timeW = date("d-m-Y h:m:s", time());
                    $getData_  = mysqli_query($con, "SELECT receiver_user_id,message from notification_new_ WHERE sender_user_id like '%A$employee_id%' AND notificationtype like '%Add new project%'");
                  
                    while ($row11 =mysqli_fetch_assoc($getData_))
                    {
                        $receiver_user_id = $row11['receiver_user_id'];
                        $message          = $row11['message'];

                        $message = str_replace('$filename', $fileName[$key], $message);
            
                        $insertQuery_ = "INSERT INTO `notification_new`(`user_id`, `notification`, `status`,`timestamp`) VALUES ('$receiver_user_id','$message','0','$timeW')";
                        // echo "INSERT INTO `notification_new`(`user_id`, `notification`, `status`,`timestamp`) VALUES ('$receiver_user_id','$message','0','$timeW')";
                        // die;
                        $resinsertQuery2  = mysqli_query($con, $insertQuery_);
            
                        $checkQuery9 = mysqli_query($con, "SELECT deviceid FROM `employeemaster` WHERE `employeeId` = '$receiver_user_id'");
                    
                        // if($clientname!='')
                        // {
                         
                        // }
                            
                        
                                //   echo "103";
                                while ($row1 = mysqli_fetch_assoc($checkQuery9)) {
                                    //   echo "104";
                                    $dataarray3 = $row1['deviceid'];
                                    

                                    //     $curl = curl_init();

                                        $url = 'http://68.183.85.175/curl.php';

                                        $regId = $dataarray3;
                                        $activity_type_a = "Logout";

                                        $arrNotification = array(
                                            "body" => $message,
                                            "title" => "New File",
                                            "sound" => "default",
                                            "type" => 1,
                                            "notificationto" => "student",
                                            "acttype" => $activity_type_a,
                                            "category" => "LOGOUT"
                                        );

                                        $fields = array(
                                            'to' => $regId,
                                            'data' => $arrNotification
                                        );

                                        $jsonData = json_encode($fields);

                                        curl_setopt($curl, CURLOPT_URL, $url);
                                        curl_setopt($curl, CURLOPT_POST, true);
                                        curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                                            'Content-Type: application/json'
                                        ));
                                        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                                        curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonData);

                                        //alert( "Payload Sent to curl.php:\n");
                                        //echo "<script>alert('Payload Sent to curl.php');</script>";
                                        print_r($jsonData);

                                        $result = curl_exec($curl);

                                        if ($result === FALSE) {
                                            die('Curl failed: ' . curl_error($curl));
                                        }

                                        //echo "<script>alert("\nResponse from curl.php:\n");
                                        //echo "<script>alert('Response from curl.php:');</script>";
                                        //echo "<script>alert($result)</script>";

                                        curl_close($curl);

            
                                    // $curl = curl_init();
            
                                    
                                    //      $url='http://68.183.85.175/curl.php';
                                    
                                    //     // 	curl_setopt($curl, CURLOPT_POST, 1);
                                    //     // 	curl_setopt($curl, CURLOPT_URL, $url);
                                    //     // 	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                                    //     // 	$result = curl_exec($curl);
                                    //     // 	curl_close($curl);
            
            
            
                                    // $notification = array();
                                    // $arrNotification = array();
                                    // $arrData = array();
                                    // $arrNotification["body"] = $message;
            
                                    // $arrNotification["title"] = "New File";
                                    // $arrNotification["sound"] = "default";
                                    // $arrNotification["type"] = 1;
            
                                    // $arrNotification["notificationto"] = "student";
                                    // $arrNotification["acttype"] = $activity_type_a;
                                    // $arrNotification["category"] = "LOGOUT";
            
                                    // $regId = $dataarray3;
            
                                    // $device_type = "Android";
                                    // // $url = 'https://fcm.googleapis.com/fcm/send';
                                    // if ($device_type == "Android") {
                                    //     $fields = array(
                                    //         'to' => $regId,
                                    //         'data' => $arrNotification
                                    //     );
                                    // } else {
                                    //     $fields = array(
                                    //         'to' => $regId,
                                    //         'notification' => $arrNotification
                                    //     );
                                    // }
                                  
                                    // curl_setopt($curl, CURLOPT_URL, $url);
                                    // curl_setopt($curl, CURLOPT_POST, true);
                                    // // curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
                                    //  curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                                    // // Disabling SSL Certificate support temporarly
                                    // curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
                                    // curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($fields));
                                    // print_r(json_encode($fields));
                                    // // curl_setopt($ch, CURLOPT_TIMEOUT, 180);
                                    // // curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 60);
                                    // $result = curl_exec($curl);
                                    //  print_r($result);
                                    // if ($result === FALSE) {
                                    //     die('Curl failed: ' . curl_error($curl));
                                    // }
                                    // else
                                    // {
                                    //     echo "True";
                                    // }
                                    
                                    // if (curl_errno($ch)) {
                                    //     $error_msg = curl_error($curl);
                                    // }
                                    // // print_r($error_msg);
            
                                    // curl_close($curl);
            
                                    
                                    
            
                                }
                            
            
                    }
                    // 
                }
            }
        //    $boundName = implode(',', $bound);

            // $fileId   = $con->insert_id;
            print_r($bound);
            if($boundCount == 1)
            {
            foreach($bound as $key =>$value)
            {
                // $fileId   = $con->insert_id;
                
                    if($bound[$key]=='ABG')
                    {
                        $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,bank_guarantee_number,bank_guarantee_amount,bank_G_date,bank_G_Exp_date,bank_G_claim_date,Added_by)values('".$projectidd."','ABG','".$bankGno1."','".$bankGamt1."','".$BGDate1."','".$BGEDate1."','".$BCdate1."','".$employee_id."')");
                        echo "insert into payments_bond_details (project_id,bond_name,bank_guarantee_number,bank_guarantee_amount,bank_G_date,bank_G_Exp_date,bank_G_claim_date,Added_by)values('".$projectidd."','ABG','".$bankGno1."','".$bankGamt1."','".$BGDate1."','".$BGEDate1."','".$BCdate1."','".$employee_id."')";
                        if(isset($_FILES['file11']))
                        {
                            if ($_FILES['file11']["error"] == 0)
                            { 
                                
                                $extension		 = pathinfo($_FILES['file11']['name'], PATHINFO_EXTENSION);
                                $uploadName      = $_FILES['file11']['name'];
                                $path_parts		 = pathinfo($_FILES['file11']["name"]);

                                // echo '<br><br>'.$uploadName.'<br>';
                                $extension		 = $path_parts['extension'];
                                if ($_FILES['file11']["error"] > 0)
                                {
                                    echo "Return Code: " . $_FILES['file11']["error"] . "<br />";
                                }
                                else
                                {

                                    $ids = trim($po_number1);
                                    
                                    if (!file_exists( "./bank_doc/".$ids))
                                    {
                                        // echo 'make a directory';
                                        mkdir("./bank_doc/".$ids);
                                        chmod("./bank_doc/".$ids,0777);
                                    }

                                    //$temp_file_name = $count+1;
                                    $vesion_timestamp = str_replace(" ","-",$vesion_timestamp);
                                    move_uploaded_file($_FILES['file11']['tmp_name'],"./bank_doc/$ids/$uploadName");
                                
                                }
                            }
                        }

                    }
                    elseif($bound[$key]=='PBG')
                    {
                        $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,bank_guarantee_number,bank_guarantee_amount,bank_G_date,bank_G_Exp_date,bank_G_claim_date,Added_by)values('".$projectidd."','PBG','".$bankGno2."','".$bankGamt2."','".$BGDate2."','".$BGEDate2."','".$BCdate2."','".$employee_id."')");
                        echo "insert into payments_bond_details (project_id,bond_name,bank_guarantee_number,bank_guarantee_amount,bank_G_date,bank_G_Exp_date,bank_G_claim_date,Added_by)values('".$projectidd."','PBG','".$bankGno2."','".$bankGamt2."','".$BGDate2."','".$BGEDate2."','".$BCdate2."','".$employee_id."')";
                       
                        if(isset($_FILES['file12']))
                        {
                            // if($_FILES['']['name'] == "") {
                               
                            if ($_FILES['file12']["error"] == 0)
                            { 
                                $extension		 = pathinfo($_FILES['file12']['name'], PATHINFO_EXTENSION);
                                $uploadName      = $_FILES['file12']['name'];
                                $path_parts		 = pathinfo($_FILES['file12']["name"]);

                                // echo '<br><br>'.$uploadName.'<br>';
                                $extension		 = $path_parts['extension'];
                                if ($_FILES['file12']["error"] > 0)
                                {
                                    echo "Return Code: " . $_FILES['file12']["error"] . "<br />";
                                }
                                else
                                {
                                    $ids1 = trim($po_number1);
                                    if (!file_exists( "./bank_doc/".$ids1))
                                    {
                                        mkdir("./bank_doc/".$ids1);
                                        chmod("./bank_doc/".$ids1,0777);
                                    }

                                    //$temp_file_name = $count+1;
                                    $vesion_timestamp = str_replace(" ","-",$vesion_timestamp);
                                    move_uploaded_file($_FILES['file12']['tmp_name'],"./bank_doc/$ids1/$uploadName");
                                
                                }
                            }
                        }
                    }
                    elseif($bound[$key]=='PBG1')
                    {
                        $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,bank_guarantee_number,bank_guarantee_amount,bank_G_date,bank_G_Exp_date,bank_G_claim_date,Added_by)values('".$projectidd."','PBG1','".$bankGno3."','".$bankGamt3."','".$BGDate3."','".$BGEDate3."','".$BCdate3."','".$employee_id."')");
                        // echo "insert into payments_bond_details (project_id,bond_name,bank_guarantee_number,bank_guarantee_amount,bank_G_date,bank_G_Exp_date,bank_G_claim_date,Added_by)values('".$projectidd."','".$bound[$key]."','".$bankGno[$key]."','".$bankGamt[$key]."','".$BGDate[$key]."','".$BGEDate[$key]."','".$BCdate[$key]."','".$employee_id."')";
                        // echo '<br>';
                        // echo '<br>';
                        if(isset($_FILES['file13']))
                        {
                            if ($_FILES['file13']["error"] == 0)
                            { 
                                $extension		 = pathinfo($_FILES['file13']['name'], PATHINFO_EXTENSION);
                                $uploadName      = $_FILES['file13']['name'];
                                $path_parts		 = pathinfo($_FILES['file13']["name"]);

                                // echo '<br><br>'.$uploadName.'<br>';
                                $extension		 = $path_parts['extension'];
                                if ($_FILES['file13']["error"] > 0)
                                {
                                    echo "Return Code: " . $_FILES['file13']["error"] . "<br />";
                                }
                                else
                                {
                                    $ids2 = trim($po_number1);
                                    if (!file_exists( "./bank_doc/".$ids2))
                                    {
                                        mkdir("./bank_doc/".$ids2);
                                        chmod("./bank_doc/".$ids2,0777);
                                    }

                                    //$temp_file_name = $count+1;
                                    $vesion_timestamp = str_replace(" ","-",$vesion_timestamp);
                                    move_uploaded_file($_FILES['file13']['tmp_name'],"./bank_doc/$ids2/$uploadName");
                                
                                }
                            }
                        }
                    }
                    elseif($bound[$key]=='PC')
                    {
                        // echo $dispatchDate1;
                        $startdate = date('Y-m-d', strtotime('-7 days', strtotime($dispatchDate1))); 
                        $autooffdate = date('Y-m-d', strtotime('+1 days', strtotime($dispatchDate1)));
                        $creation_time = date("Y-m-d",time()+19800);
                        $date_reminder = array("SUN","TUE","WED","THR","FIR","SAT");


                        $remainder_name = 'High Alert Come for dispatch date Please Ready for Dispatch'.$fileName[$key];
                        $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,despatch_date,penalty_percentage,actual_po_received_date,Added_by)values('".$projectidd."','PC','".$dispatchDate1."','".$penalty1."','".$porecevice1."','".$employee_id."')");

                        // echo "insert into payments_bond_details (project_id,bond_name,despatch_date,penalty_percentage,Added_by)values('".$projectidd."','".$bound[$key]."','".$dispatchDate1."','".$penalty1."','".$employee_id."')";

                        $sqlRemainder = mysqli_query($con,"insert into reminder_master (reminder_name,reminder_description,priority,autooffdate,reminder_duration,reminder_time,start_from,creation_time)values('$remainder_name','','H','$autooffdate','0','10:00:00','$startdate','$creation_time')");
                        
                        $reminderid = $con->insert_id;
                        foreach ($date_reminder as $key => $value) {
                            # code...
                                $query_second = mysqli_query($con,"INSERT INTO date_reminder (rid, remindday) VALUES ($reminderid, '$value')");
                                

                        }
                        $query_second1 = mysqli_query($con,"INSERT INTO employee_department_reminder (rid, deptid) VALUES ($reminderid, '6')");
                    }
                    elseif($bound[$key]=='PC1')
                    {
                        // echo $dispatchDate[$key];
                        // echo '<br>';
                        // echo $penalty[$key];
                        $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,despatch_date,penalty_percentage,actual_po_received_date,Added_by)values('".$projectidd."','PC1','".$dispatchDate2."','".$penalty2."','".$porecevice2."','".$employee_id."')");

                        //echo "insert into payments_bond_details (project_id,bond_name,despatch_date,penalty_percentage,Added_by)values('".$projectidd."','".$bound[$key]."','".$dispatchDate[$key]."','".$penalty[$key]."','".$employee_id."')";
                    }
                    elseif($bound[$key]=='ADV')
                    {
                        $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,advance_po_amount,Added_by)values('".$projectidd."','ADV','".$Advanceamt1."','".$employee_id."')");

                        
                        echo '<br>';
                        echo "insert into payments_bond_details (project_id,bond_name,advance_po_amount,Added_by)values('".$projectidd."','ADV','".$Advanceamt1."','".$employee_id."')";
                    }
                    elseif($bound[$key]=='AVT1')
                    {
                        $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,advance_po_amount,Added_by)values('".$projectidd."','AVT1','".$Advanceamt2."','".$employee_id."')");
                        // echo '<br>';
                        // echo "insert into payments_bond_details (project_id,bond_name,advance_po_amount,Added_by)values('".$projectidd."','".$bound[$key]."','".$Advanceamt[$key]."','".$employee_id."')";
                    }
                    $boundCount++;
            }
            }

            if($quotationNumber != '' && $quotationDate != '')
            {
                if($fileId =='0' || $fileId =='')
                {

                }
                else
                {
                    
                }
                
            }
            if($FILE_TYPE_ID == 2)
            {
                foreach($AMCMonth as $key =>$value)
                {
                    $sqlAMC = mysqli_query($con,"insert into amc_visit(file_id,visit_date,employee_id,status)values('".$fileId."','".$AMCMonth[$key]."','".$employee_id."','1')");
                    echo "insert into amc_visit(file_id,visit_date,employee_id,status)values('".$fileId."','".$AMCMonth[$key]."','".$employee_id."','1')";
                }
            }
            $poNo1 = $_POST['po_number'];
            if($FILE_TYPE_ID == 2)
            {
                // echo $dispatchDate1;
                $startdate1 = date('Y-m-d', strtotime('-15 days', strtotime($AMCto))); 
                $autooffdate1 = date('Y-m-d', strtotime('+1 days', strtotime($AMCto)));
                $creation_time1 = date("Y-m-d",time()+19800);
                $date_reminder1 = array("SUN","TUE","WED","THR","FIR","SAT");


                $remainder_name = 'AMC Completed This File :'.$fileName[$key];
                // $insertboundData = mysqli_query($con,"insert into payments_bond_details (project_id,bond_name,despatch_date,penalty_percentage,actual_po_received_date,Added_by)values('".$projectidd."','PC','".$dispatchDate1."','".$penalty1."','".$porecevice1."','".$employee_id."')");

                // echo "insert into payments_bond_details (project_id,bond_name,despatch_date,penalty_percentage,Added_by)values('".$projectidd."','".$bound[$key]."','".$dispatchDate1."','".$penalty1."','".$employee_id."')";

                $sqlRemainder = mysqli_query($con,"insert into reminder_master (reminder_name,reminder_description,priority,autooffdate,reminder_duration,reminder_time,start_from,creation_time)values('$remainder_name','','H','$autooffdate1','0','10:00:00','$startdate1','$creation_time1')");
                
                $reminderid1 = $con->insert_id;
                foreach ($date_reminder as $key => $value) {
                    # code...
                        $query_second = mysqli_query($con,"INSERT INTO date_reminder (rid, remindday) VALUES ($reminderid1, '$value')");
                        

                }
                $query_second1 = mysqli_query($con,"INSERT INTO employee_department_reminder (rid, deptid) VALUES ($reminderid1, '11')");
                foreach($fileT as $key => $value)
                {
                    $myString = $fileT[$key];
                    $fileTypeNo = explode('-', $myString);
                    $po_type_id = $fileTypeNo[0];
                    $filename = $fileName[$key];
                }
                
                $fileName1 = $fileName[0];
                echo '<br><br>'.$fileName1.'<br>';
                foreach($poNo1 as $key =>$value)
                {
                    if(isset($_FILES['file'])){
                        if ($_FILES['file']["error"][$key] == 0)
                        {    echo "key=".$key."<br>";
                            $po_number       = $_POST['po_number'][$key];
                            echo 'PO_number'.$po_number.'<br>';
                            $po_date         = $_POST['po_date'][$key];
                            echo '</br>'.$po_date.'<br>';
                            $po_amount       = $_POST['po_amount'][$key];
                            $labourAmt       = $_POST['lb_amount'][$key];
                            $unitLoactionAMC = $_POST['unitLocationAMC1'][$key-1];
                            // $unitLoactionAMC = $_POST['unitLocationAMC1'][$key];

                            print_r($_POST['unitLocationAMC1'][$key]);
                            echo "<br>";
                            $po_amount = trim($po_amount,"Rs");
                           
                           // $po_type_id      = $_POST['po_TypeId'][$key];
                            
                            //$allowedExts	 = array("jpg", "jpeg", "gif", "png", "mp3", "mp4", "wma");
                            $extension		 = pathinfo($_FILES['file']['name'][$key], PATHINFO_EXTENSION);
                            $uploadName      = $_FILES['file']['name'][$key];
                            $path_parts		 = pathinfo($_FILES['file']["name"][$key]);
                            $extension		 = $path_parts['extension'];
                            if ($_FILES['file'])
                            {
                                if ($_FILES['file']["error"][$key] > 0)
                                {
                                    echo "Return Code: " . $_FILES['file']["error"][$key] . "<br />";
                                }
                                else
                                {
                                    if (!file_exists( "./po_files/".$fileName1))
                                    {
                                        mkdir("./po_files/".$fileName1);
                                        chmod("./po_files/".$fileName1,0777);
                                    }
                                    $vesion_timestamp = str_replace(" ","-",$vesion_timestamp);
                                    move_uploaded_file($_FILES['file']['tmp_name'][$key],"./po_files/$fileName1/$uploadName");
                                   
                                }
        
                            }
                            else
                            {
                                echo "Return Code: " . $_FILES['file']["error"][$key] . "<br />";
                            }
                                // }
                            if($po_number != '' && $po_date != '')
                            {
                                    $poPath = $fileName[0].'/'.$uploadName;
                                    $po_version_query .= "INSERT INTO po_version(PO_NUMBER,PO_TYPE_ID, PO_DATE,PO_IMAGE_PATH,PO_AMOUNT,labour_amt,FILE_ID, PO_VERSION_NO, VERSION_STATUS, VERSION_TIMESTAMP, TAX_ID,unit_location) VALUES('".$po_number."','".$po_type_id."','".$po_date."', '".$poPath."','".$po_amount."','".$labourAmt."','".$fileId."', '1', '1', '". $vesion_timestamp1."', '".$tax_id."','".$unitLoactionAMC."');";
                                    echo '<br><br>';
                                    
                                    echo "INSERT INTO po_version(PO_NUMBER,PO_TYPE_ID, PO_DATE,PO_IMAGE_PATH,PO_AMOUNT,labour_amt,FILE_ID, PO_VERSION_NO, VERSION_STATUS, VERSION_TIMESTAMP, TAX_ID,unit_location) VALUES('".$po_number."','".$po_type_id."','".$po_date."', '".$poPath."','".$po_amount."','".$labourAmt."','".$fileId."', '1', '1', '". $vesion_timestamp1."', '".$tax_id."','".$unitLoactionAMC."');";
                            }      
                        }
                    } 
                }
            }
            else
            {
                if (in_array($fileName[$key], $filenamearray)) {
                    echo 'filename match<br>';
                }
                else
                {
            if(isset($_FILES['file'])){
                // if ($_FILES['file']["error"][$key] == 0)
                // {    
                    $po_number       = $_POST['po_number'][$key];
                    echo 'PO_number'.$po_number.'<br>';
                    $po_date         = $_POST['po_date'][$key];
                    echo '</br>'.$po_date.'<br>';
                    $po_amount       = $_POST['po_amount'][$key];
                    $labourAmt       = $_POST['lb_amount'][$key];
                    $po_amount = trim($po_amount,"Rs");
                   
                   // $po_type_id      = $_POST['po_TypeId'][$key];
                    $myString = $fileT[$key];
                    $fileTypeNo = explode('-', $myString);
                    $po_type_id = $fileTypeNo[0];
                    //$allowedExts	 = array("jpg", "jpeg", "gif", "png", "mp3", "mp4", "wma");
                    $extension		 = pathinfo($_FILES['file']['name'][$key], PATHINFO_EXTENSION);
                    $uploadName      = $_FILES['file']['name'][$key];
                    $path_parts		 = pathinfo($_FILES['file']["name"][$key]);
                    $extension		 = $path_parts['extension'];
                    if ($_FILES['file'])
                    {
                        if ($_FILES['file']["error"][$key] > 0)
                        {
                            echo "Return Code: " . $_FILES['file']["error"][$key] . "<br />";
                        }
                        else
                        {
                            if (!file_exists( "./po_files/".$fileName[$key]))
                            {
                                mkdir("./po_files/".$fileName[$key]);
                                chmod("./po_files/".$fileName[$key],0777);
                            }
                            $vesion_timestamp = str_replace(" ","-",$vesion_timestamp);
                            move_uploaded_file($_FILES['file']['tmp_name'][$key],"./po_files/$fileName[$key]/$uploadName");
                        }
                    }
                    else
                    {
                        echo "Return Code: " . $_FILES['file']["error"][$key] . "<br />";
                    }
                        // }
                    if($po_number != '' && $po_date != '' && $fileId !='')
                    {
                            $poPath = $fileName[$key].'/'.$uploadName;
                            $po_version_query .= "INSERT INTO po_version(PO_NUMBER,PO_TYPE_ID, PO_DATE,PO_IMAGE_PATH,PO_AMOUNT,labour_amt,FILE_ID, PO_VERSION_NO, VERSION_STATUS, VERSION_TIMESTAMP, TAX_ID) VALUES('".$po_number."','".$po_type_id."','".$po_date."', '".$poPath."','".$po_amount."','".$labourAmt."','".$fileId."', '1', '1', '". $vesion_timestamp1."', '".$tax_id."');";
                            echo '<br><br>';
                            echo "INSERT INTO po_version(PO_NUMBER,PO_TYPE_ID, PO_DATE,PO_IMAGE_PATH,PO_AMOUNT,FILE_ID, PO_VERSION_NO, VERSION_STATUS, VERSION_TIMESTAMP, TAX_ID) VALUES('".$po_number."','".$po_type_id."','".$po_date."', '".$poPath."','".$po_amount."','".$fileId."', '1', '1', '". $vesion_timestamp1."', '".$tax_id."');";
                    }      
                // }
            } 
        }
        }
             
            }
        }
               
        if($po_version_query != ''){
            $insertedPO_Version = mysqli_multi_query($con,$po_version_query);
        }

        if($insertQuerys && isset($insertedPO_Versions))
        {  
            echo '<script>toastr.options.positionClass = "toast-bottom-right";toastr.success("Project Added Successfully")</script>';
            echo "<script>setTimeout(\"location.href = '../project/projectlist_23.php';\",800);</script>";
        }else if($insertFileData){
            echo '<script>toastr.options.positionClass = "toast-bottom-right";toastr.success("Project Added Successfully")</script>';
            echo "<script>setTimeout(\"location.href = '../project/projectlist_23.php';\",800);</script>";
        }
        
    }
// ----------------------------------------------------------------------------------------------------------------------------------

    
   
?>