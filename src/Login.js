import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [financialYear, setFinancialYear] = useState('');
  const [financialYears, setFinancialYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        const response = await axios.get('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/GetYearsApi.php');
        if (response.data.status === 'success' && Array.isArray(response.data.data)) {
          setFinancialYears(response.data.data);
          
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
          
          let financialYearStart, financialYearEnd;
          if (currentMonth >= 4) {
            financialYearStart = currentYear;
            financialYearEnd = currentYear + 1;
          } else {
            financialYearStart = currentYear - 1;
            financialYearEnd = currentYear;
          }
          
          const currentFY = `${String(financialYearStart).slice(-2)}-${String(financialYearEnd).slice(-2)}`;
          
          const currentFYObj = response.data.data.find(
            year => year.financial_year === currentFY
          );
          
          if (currentFYObj) {
            setFinancialYear(currentFYObj.financial_year);
            localStorage.setItem('selectedFinancialYearId', currentFYObj.id);
            localStorage.setItem('selectedFinancialYear', currentFYObj.financial_year);
          }
        } else {
          console.error('Invalid API response format:', response.data);
          toast.error('Failed to load financial years. Please refresh the page.');
        }
      } catch (error) {
        console.error('Error fetching financial years:', error);
        toast.error('Failed to load financial years. Please check your connection.');
      }
    };
    fetchFinancialYears();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedFinancialYearId = localStorage.getItem('selectedFinancialYearId');
      const selectedFinancialYearObj = financialYears.find(
        year => year.financial_year === financialYear
      );

      const loginData = {
        mobile_number: mobile,
        password: password,
        financial_year_id: selectedFinancialYearObj ? selectedFinancialYearObj.id : storedFinancialYearId,
        financial_year: financialYear
      };

      const response = await axios.post('https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/login.php', loginData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        localStorage.setItem('userToken', response.data.token || '');
        sessionStorage.setItem('userId', response.data.user_id || '');
        sessionStorage.setItem('employeeId', response.data.employeeId || '');
        sessionStorage.setItem('shortname', response.data.shortname || '');
        localStorage.setItem('userMobile', mobile);
        localStorage.setItem('selectedFinancialYear', financialYear);
        localStorage.setItem('selectedFinancialYearId', loginData.financial_year_id);
        
        if (response.data.user_data) {
          localStorage.setItem('userData', JSON.stringify(response.data.user_data));
        }

        toast.success(response.data.message || 'Login successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
      } else {
        toast.error(response.data.message || 'Login failed. Please try again.');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Invalid credentials. Please try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFinancialYearChange = (e) => {
    const selectedYear = e.target.value;
    setFinancialYear(selectedYear);
    
    const selectedYearObj = financialYears.find(year => year.financial_year === selectedYear);
    if (selectedYearObj) {
      localStorage.setItem('selectedFinancialYearId', selectedYearObj.id);
      localStorage.setItem('selectedFinancialYear', selectedYear);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        body {
          overflow-x: hidden;
        }

        .login-container-wrapper {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-left: 10%;
        }

        .building-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .building-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .building-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
        }

        .login-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 390px;
        }

        .login-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          margin-bottom: 150px;
        }

        .login-header {
          background: white;
          padding: 15px 25px 8px; /* 🔽 Reduced from 20px 25px 10px */
          /* 
            🎯 TO MINIMIZE HEIGHT MORE:
            padding: 10px 25px 5px;  → Very compact header
            padding: 15px 25px 8px;  → Current (balanced)
            padding: 20px 25px 10px; → More spacious
          */
        }

        .company-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px; /* 🔽 Reduced from 15px */
          /* 
            🎯 ADJUST SPACE BELOW LOGO:
            margin-bottom: 5px;  → Very compact
            margin-bottom: 10px; → Current (minimal)
            margin-bottom: 15px; → More space
          */
        }

        .logo-icon {
          width: 220px; /* 🔽 Reduced from 250px */
          height: auto;
          object-fit: contain;
          /* 
            🎯 ADJUST LOGO SIZE:
            width: 180px; → Smaller logo
            width: 220px; → Current (balanced)
            width: 250px; → Larger logo
          */
        }

        .login-body {
          padding: 8px 25px 18px; /* 🔽 Reduced from 10px 25px 20px */
          /* 
            🎯 TO MINIMIZE BODY HEIGHT:
            padding: 5px 25px 15px;  → Very compact
            padding: 8px 25px 18px;  → Current (balanced)
            padding: 10px 25px 20px; → More spacious
          */
        }

        .form-group {
          margin-bottom: 16px; /* 🔽 Reduced from 20px */
          /* 
            🎯 ADJUST SPACING BETWEEN FIELDS:
            margin-bottom: 12px; → Very compact
            margin-bottom: 16px; → Current (balanced)
            margin-bottom: 20px; → More spacious
          */
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-control, .form-select {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
          color: #333;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          font-size: 16px;
        }

        .password-toggle:hover {
          color: #3b82f6;
        }

        .form-control.with-icon {
          padding-right: 45px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px; /* 🔽 Reduced from 20px */
          /* 
            🎯 ADJUST SPACE ABOVE LOGIN BUTTON:
            margin-bottom: 12px; → Less space
            margin-bottom: 16px; → Current (balanced)
            margin-bottom: 20px; → More space
          */
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .checkbox-wrapper label {
          font-size: 14px;
          color: #666;
          cursor: pointer;
          user-select: none;
        }

        .btn-login {
          width: 100%;
          padding: 14px;
          background: #ff6b35;
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-login:hover:not(:disabled) {
          background: #ff5722;
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-border {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spinner 0.6s linear infinite;
        }

        @keyframes spinner {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .login-container-wrapper {
            justify-content: center;
            padding-left: 0;
            padding-top: 40px;
          }
        }

        @media (max-width: 576px) {
          .login-content {
            margin: 0 15px;
          }

          .login-header {
            padding: 20px 20px 10px;
          }

          .login-body {
            padding: 10px 20px 20px;
          }

          .logo-icon {
            width: 220px;
          }
        }

        .watermark {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          color: #666;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }

        @media (max-width: 576px) {
          .watermark {
            bottom: 10px;
            right: 10px;
            font-size: 11px;
            padding: 6px 12px;
          }
        }
      `}</style>

      <div className="login-container-wrapper">
        <div className="building-background">
          <img 
            src="http://93.127.167.54/newerp/banner-new2.jpg" 
            alt="Surya Equipments Building"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }}
          />
          <div className="building-overlay"></div>
        </div>

        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="company-logo">
                <img 
                  src="http://93.127.167.54/newerp/LoginLogo.png" 
                  alt="Surya Equipments Pvt. Ltd. Kolhapur"
                  className="logo-icon"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div className="login-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Financial Year</label>
                  <select
                    className="form-select"
                    value={financialYear}
                    onChange={handleFinancialYearChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Financial Year</option>
                    {financialYears.map((year) => (
                      <option key={year.id} value={year.financial_year}>
                        {year.financial_year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    disabled={loading}
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                  />
                </div>

                <div className="form-group">
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control with-icon"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="savePassword"
                    checked={savePassword}
                    onChange={(e) => setSavePassword(e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="savePassword">Save Password</label>
                </div>

                <button 
                  type="submit" 
                  className="btn-login"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border" role="status" aria-hidden="true"></span>
                      {' '}Logging in...
                    </>
                  ) : (
                    'LOGIN'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </>
  );
}

export default Login;