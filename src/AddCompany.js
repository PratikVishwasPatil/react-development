import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Accordion, Card, Form, Button, Row, Col, Badge, Spinner
} from 'react-bootstrap';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const BASE_URL = 'http://erp.suryaequipments.com/Surya_React/surya_dynamic_api/company';

// ─── helpers ─────────────────────────────────────────────────────────────────
const isNumberKey = (e) => {
  const ch = e.which || e.keyCode;
  return !(ch !== 46 && ch > 31 && (ch < 48 || ch > 57));
};

const emptyShipping = () => ({
  contactPerson: '', personEmail: '', contactNumber: '',
  designation: '', storeLocation: [],
  country: '', state: '', city: '',
  gstin: '', pan: '', address: '',
});

const emptyBilling = () => ({
  contactPerson: '', personEmail: '', contactNumber: '',
  designation: '', location: '',
  country: '', state: '', city: '',
  gstin: '', pan: '', address: '',
});

// GSTIN → PAN auto-fill (only auto-fills if PAN field is empty)
const panFromGst = (gst) => (gst.length >= 12 ? gst.substring(2, 12) : '');

// ─── FloatInput ───────────────────────────────────────────────────────────────
function FloatInput({ label, value, onChange, type = 'text', onKeyPress, readOnly, pattern, style, maxLength }) {
  return (
    <div className="surya-float" style={style}>
      <input
        className="surya-input"
        type={type}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        readOnly={readOnly}
        pattern={pattern}
        maxLength={maxLength}
        autoComplete="off"
      />
      <span className="form-bar" />
      <label className="float-label">{label}</label>
    </div>
  );
}

// ─── CountryStateCity ─────────────────────────────────────────────────────────
function CountryStateCity({ countryVal, stateVal, cityVal, onCountryChange, onStateChange, onCityChange }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/getCountry.php`)
      .then(r => setCountries((r.data || []).map(c => ({ value: c.country, label: c.country }))))
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!countryVal) { setStates([]); setCities([]); return; }
    axios.post(`${BASE_URL}/getState.php`, new URLSearchParams({ country: countryVal }))
      .then(r => setStates((r.data || []).map(s => ({ value: s.state, label: s.state }))))
      .catch(() => setStates([]));
  }, [countryVal]);

  useEffect(() => {
    if (!stateVal) { setCities([]); return; }
    axios.post(`${BASE_URL}/getCity.php`, new URLSearchParams({ state: stateVal }))
      .then(r => setCities((r.data || []).map(c => ({ value: c.city, label: c.city }))))
      .catch(() => setCities([]));
  }, [stateVal]);

  const selectStyles = {
    control: (b, s) => ({
      ...b,
      borderRadius: 0,
      border: 'none',
      borderBottom: `1.5px solid ${s.isFocused ? '#ff630d' : '#ccc'}`,
      boxShadow: 'none',
      minHeight: 36,
      fontSize: 13,
      background: 'transparent',
    }),
    menu: (b) => ({ ...b, zIndex: 9999, fontSize: 13 }),
    placeholder: (b) => ({ ...b, color: '#aaa', fontSize: 12 }),
    singleValue: (b) => ({ ...b, fontSize: 13 }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (b) => ({ ...b, padding: '0 4px', color: '#aaa' }),
  };

  return (
    <>
      <Col xs={12} sm={4}>
        <div className="surya-select-wrap mb-3">
          <label className="surya-select-label">Country</label>
          <Select
            options={countries}
            value={countries.find(c => c.value === countryVal) || null}
            onChange={opt => onCountryChange(opt ? opt.value : '')}
            placeholder="Select Country"
            isClearable
            styles={selectStyles}
          />
        </div>
      </Col>
      <Col xs={12} sm={4}>
        <div className="surya-select-wrap mb-3">
          <label className="surya-select-label">State</label>
          <Select
            options={states}
            value={states.find(s => s.value === stateVal) || null}
            onChange={opt => onStateChange(opt ? opt.value : '')}
            placeholder="Select State"
            isClearable
            isDisabled={!countryVal}
            styles={selectStyles}
          />
        </div>
      </Col>
      <Col xs={12} sm={4}>
        <div className="surya-select-wrap mb-3">
          <label className="surya-select-label">City</label>
          <Select
            options={cities}
            value={cities.find(c => c.value === cityVal) || null}
            onChange={opt => onCityChange(opt ? opt.value : '')}
            placeholder="Select City"
            isClearable
            isDisabled={!stateVal}
            styles={selectStyles}
          />
        </div>
      </Col>
    </>
  );
}

// ─── ShippingBlock ────────────────────────────────────────────────────────────
function ShippingBlock({ data, index, storeLocations, onUpdate, onRemove, showRemove }) {
  const update = (key, val) => onUpdate(index, key, val);

  const selectStyles = {
    control: (b, s) => ({
      ...b, borderRadius: 0, border: 'none',
      borderBottom: `1.5px solid ${s.isFocused ? '#ff630d' : '#ccc'}`,
      boxShadow: 'none', minHeight: 36, fontSize: 13, background: 'transparent',
    }),
    menu: (b) => ({ ...b, zIndex: 9999, fontSize: 13 }),
    placeholder: (b) => ({ ...b, color: '#aaa', fontSize: 12 }),
    indicatorSeparator: () => ({ display: 'none' }),
    multiValue: (b) => ({ ...b, background: '#fff0e8', borderRadius: 4 }),
    multiValueLabel: (b) => ({ ...b, color: '#ff630d', fontSize: 11 }),
    multiValueRemove: (b) => ({ ...b, color: '#ff630d', ':hover': { background: '#ff630d', color: '#fff' } }),
  };

  return (
    <div className="surya-sub-block mb-3 p-3 rounded-3">
      {showRemove && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="contact-badge">Contact #{index + 1}</span>
          <button className="surya-remove-btn" onClick={() => onRemove(index)}>
            <i className="bi bi-trash3" /> Remove
          </button>
        </div>
      )}
      <Row className="g-3">
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Contact Person Name" value={data.contactPerson}
            onChange={e => update('contactPerson', e.target.value)} />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Email Address" type="email" value={data.personEmail}
            onChange={e => update('personEmail', e.target.value)} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Mobile Number" value={data.contactNumber}
            onChange={e => update('contactNumber', e.target.value)}
            onKeyPress={isNumberKey} maxLength={10} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Designation" value={data.designation}
            onChange={e => update('designation', e.target.value)} />
        </Col>
        <Col xs={12} sm={4} md={2}>
          <div className="surya-select-wrap">
            <label className="surya-select-label">Store Location</label>
            <Select
              isMulti
              options={storeLocations}
              value={data.storeLocation}
              onChange={vals => update('storeLocation', vals || [])}
              placeholder="Select..."
              styles={selectStyles}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

// ─── BillingBlock ─────────────────────────────────────────────────────────────
function BillingBlock({ data, index, onUpdate, onRemove, showRemove }) {
  const update = (key, val) => onUpdate(index, key, val);

  return (
    <div className="surya-sub-block mb-3 p-3 rounded-3">
      {showRemove && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="contact-badge">Contact #{index + 1}</span>
          <button className="surya-remove-btn" onClick={() => onRemove(index)}>
            <i className="bi bi-trash3" /> Remove
          </button>
        </div>
      )}
      <Row className="g-3">
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Contact Person Name" value={data.contactPerson}
            onChange={e => update('contactPerson', e.target.value)} />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Email Address" type="email" value={data.personEmail}
            onChange={e => update('personEmail', e.target.value)} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Mobile Number" value={data.contactNumber}
            onChange={e => update('contactNumber', e.target.value)}
            onKeyPress={isNumberKey} maxLength={10} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Designation" value={data.designation}
            onChange={e => update('designation', e.target.value)} />
        </Col>
        <Col xs={12} sm={4} md={2}>
          <FloatInput label="Billing Location" value={data.location}
            onChange={e => update('location', e.target.value)} />
        </Col>
      </Row>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ activeKey, customerId }) {
  const steps = [
    { key: '0', icon: 'bi-building', label: 'Company' },
    { key: '1', icon: 'bi-truck', label: 'Shipping' },
    { key: '2', icon: 'bi-receipt', label: 'Billing' },
  ];
  return (
    <div className="step-indicator-wrap">
      {steps.map((s, i) => {
        const isActive = activeKey === s.key;
        const isDone = parseInt(activeKey) > parseInt(s.key) || (s.key === '0' && customerId);
        return (
          <React.Fragment key={s.key}>
            <div className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <div className="step-circle">
                {isDone && !isActive
                  ? <i className="bi bi-check2" />
                  : <i className={`bi ${s.icon}`} />}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`step-line ${isDone ? 'done' : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddCompany() {
  const navigate = useNavigate();

  // Company Info
  const [custName, setCustName] = useState('');
  const [custContact, setCustContact] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [companyCat, setCompanyCat] = useState([]);
  const [comments, setComments] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [savingCompany, setSavingCompany] = useState(false);

  // Shipping
  const [storeLocations, setStoreLocations] = useState([]);
  const [shippingContacts, setShippingContacts] = useState([emptyShipping()]);
  const [shippingCountry, setShippingCountry] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingGstin, setShippingGstin] = useState('');
  const [shippingPan, setShippingPan] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingWantMore, setShippingWantMore] = useState(null);
  const [savingShipping, setSavingShipping] = useState(false);

  // Billing
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [billingContacts, setBillingContacts] = useState([emptyBilling()]);
  const [billingCountry, setBillingCountry] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingGstin, setBillingGstin] = useState('');
  const [billingPan, setBillingPan] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingWantMore, setBillingWantMore] = useState(null);
  const [savingBilling, setSavingBilling] = useState(false);

  const [activeKey, setActiveKey] = useState('0');

  useEffect(() => {
    axios.get(`${BASE_URL}/getStoreLocations.php`)
      .then(r => setStoreLocations((r.data || []).map(l => ({ value: l.id, label: l.store_location }))))
      .catch(() => setStoreLocations([]));
  }, []);

  // ── Category toggle ──
  const toggleCat = (val) => {
    setCompanyCat(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    );
  };

  // ── Save Company Info ──
  const handleSaveCompany = async () => {
    if (!custName.trim()) { toast.warning('Company Name is required.'); return; }
    if (!custContact.trim()) { toast.warning('Contact Number is required.'); return; }
    if (companyCat.length === 0) { toast.warning('Please select at least one Company Category.'); return; }
    setSavingCompany(true);
    try {
      const params = new URLSearchParams({
        custName, custContact, custEmail, comments,
        custCat: companyCat.join(','),
      });
      const res = await axios.post(`${BASE_URL}/AddCustomer.php`, params);
      const id = res.data?.customer_id || res.data;
      setCustomerId(id);
      toast.success('Company saved! Now add shipping address.');
      setActiveKey('1');
    } catch {
      toast.error('Failed to save company details.');
    } finally {
      setSavingCompany(false);
    }
  };

  // ── Shipping contact helpers ──
  const updateShippingContact = (index, key, val) =>
    setShippingContacts(prev => prev.map((c, i) => i === index ? { ...c, [key]: val } : c));
  const addShippingContact = () => setShippingContacts(prev => [...prev, emptyShipping()]);
  const removeShippingContact = (index) =>
    setShippingContacts(prev => prev.filter((_, i) => i !== index));

  // ── Save Shipping ──
  const handleSaveShipping = async (wantMore) => {
    if (!customerId) { toast.warning('Please save Company Info first.'); return; }
    if (!shippingCity) { toast.warning('Please select City.'); return; }
    if (!shippingAddress.trim()) { toast.warning('Please enter Shipping Address.'); return; }
    for (const c of shippingContacts) {
      if (!c.contactPerson.trim()) { toast.warning('Please enter all Contact Person Names.'); return; }
      if (c.storeLocation.length === 0) { toast.warning('Please select Store Location for all contacts.'); return; }
    }
    setSavingShipping(true);
    try {
      const params = new URLSearchParams({
        custid: customerId,
        shippingADD: shippingAddress,
        shippingCity, shippingGstin, shippingpan: shippingPan,
      });
      shippingContacts.forEach((c, i) => {
        params.append(`shippingContactperson[${i}]`, c.contactPerson);
        params.append(`shippingEmail[${i}]`, c.personEmail);
        params.append(`shippingContact[${i}]`, c.contactNumber);
        params.append(`shippingDesignation[${i}]`, c.designation);
        params.append(`shippingLocation[${i}]`, c.storeLocation.map(l => l.value).join(','));
      });
      await axios.post(`${BASE_URL}/shippingaddress.php`, params);
      toast.success('Shipping Address saved!');
      setShippingWantMore(wantMore);
      if (wantMore === 'no') setActiveKey('2');
    } catch {
      toast.error('Failed to save shipping address.');
    } finally {
      setSavingShipping(false);
    }
  };

  // ── Same as shipping ──
  const handleSameAsShipping = (checked) => {
    setSameAsShipping(checked);
    if (checked) {
      setBillingContacts([{
        ...emptyBilling(),
        contactPerson: shippingContacts[0]?.contactPerson || '',
        personEmail: shippingContacts[0]?.personEmail || '',
        contactNumber: shippingContacts[0]?.contactNumber || '',
        designation: shippingContacts[0]?.designation || '',
        location: '',
      }]);
      setBillingCountry(shippingCountry);
      setBillingState(shippingState);
      setBillingCity(shippingCity);
      setBillingGstin(shippingGstin);
      setBillingPan(shippingPan);
      setBillingAddress(shippingAddress);
    } else {
      setBillingContacts([emptyBilling()]);
      setBillingCountry(''); setBillingState(''); setBillingCity('');
      setBillingGstin(''); setBillingPan(''); setBillingAddress('');
    }
  };

  // ── Billing contact helpers ──
  const updateBillingContact = (index, key, val) =>
    setBillingContacts(prev => prev.map((c, i) => i === index ? { ...c, [key]: val } : c));
  const addBillingContact = () => setBillingContacts(prev => [...prev, emptyBilling()]);
  const removeBillingContact = (index) =>
    setBillingContacts(prev => prev.filter((_, i) => i !== index));

  // ── Save Billing ──
  const handleSaveBilling = async (wantMore) => {
    if (!customerId) { toast.warning('Please save Company Info first.'); return; }
    if (!billingCity) { toast.warning('Please select City.'); return; }
    if (!billingAddress.trim()) { toast.warning('Please enter Billing Address.'); return; }
    for (const c of billingContacts) {
      if (!c.contactPerson.trim()) { toast.warning('Please enter all Contact Person Names.'); return; }
    }
    setSavingBilling(true);
    try {
      const params = new URLSearchParams({
        custid: customerId,
        billingADD: billingAddress,
        billingCity, billingGstin, billingpan: billingPan,
      });
      billingContacts.forEach((c, i) => {
        params.append(`billingContactPerson[${i}]`, c.contactPerson);
        params.append(`billingEmail[${i}]`, c.personEmail);
        params.append(`billingContact[${i}]`, c.contactNumber);
        params.append(`billingDesignation[${i}]`, c.designation);
        params.append(`billingLocation[${i}]`, c.location);
      });
      await axios.post(`${BASE_URL}/billingaddress.php`, params);
      toast.success('Billing Address saved!');
      setBillingWantMore(wantMore);
      if (wantMore === 'no') {
        navigate('#/marketing/company/company-list');
      }
    } catch {
      toast.error('Failed to save billing address.');
    } finally {
      setSavingBilling(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />

      <div className="surya-page">

        {/* Top Bar */}
        <nav className="surya-topnav">
          <button className="surya-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" />
          </button>
          <div className="surya-nav-content">
            <span className="surya-nav-title">Add Company</span>
            <span className="surya-breadcrumb">Marketing · Company</span>
          </div>
          {customerId && (
            <span className="surya-id-badge">
              <i className="bi bi-check-circle-fill me-1" />#{customerId}
            </span>
          )}
        </nav>

        {/* Step Indicator */}
        <div className="step-bar">
          <StepIndicator activeKey={activeKey} customerId={customerId} />
        </div>

        {/* Main Content */}
        <div className="surya-content">
          <Accordion activeKey={activeKey} onSelect={k => setActiveKey(k)}>

            {/* ── 1. Company Info ── */}
            <Accordion.Item eventKey="0" className="surya-accordion-item">
              <Accordion.Header>
                <div className="acc-header-inner">
                  <span className="acc-icon-wrap orange">
                    <i className="bi bi-building" />
                  </span>
                  <span className="acc-title">Company Info</span>
                  {customerId && <span className="acc-done-badge">Saved</span>}
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Row className="g-3">
                  <Col xs={12} sm={6} md={3}>
                    <FloatInput label="Company Name *" value={custName}
                      onChange={e => setCustName(e.target.value)} />
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <FloatInput label="Contact Number *" value={custContact}
                      onChange={e => setCustContact(e.target.value)}
                      onKeyPress={isNumberKey} maxLength={10} />
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <FloatInput label="Company Email" type="email" value={custEmail}
                      onChange={e => setCustEmail(e.target.value)} />
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <div className="surya-cat-section">
                      <span className="surya-cat-label">Company Category *</span>
                      <div className="surya-cat-chips">
                        {[{ val: '1', label: 'Customer', icon: 'bi-person' },
                          { val: '3', label: 'Supplier', icon: 'bi-box-seam' },
                          { val: '2', label: 'Vendor', icon: 'bi-shop' }].map(cat => (
                          <div
                            key={cat.val}
                            className={`surya-cat-chip ${companyCat.includes(cat.val) ? 'active' : ''}`}
                            onClick={() => toggleCat(cat.val)}
                          >
                            <i className={`bi ${cat.icon}`} />
                            {cat.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={8}>
                    <div className="surya-textarea-wrap">
                      <label className="surya-textarea-label">Comments</label>
                      <Form.Control
                        as="textarea" rows={2} className="surya-textarea"
                        value={comments} onChange={e => setComments(e.target.value)}
                        placeholder="Add any notes or comments..."
                      />
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="d-flex align-items-end">
                    <Button
                      className="surya-btn-primary w-100"
                      onClick={handleSaveCompany}
                      disabled={savingCompany}
                    >
                      {savingCompany
                        ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</>
                        : <><i className="bi bi-floppy me-2" />Save Company</>}
                    </Button>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* ── 2. Shipping Address ── */}
            <Accordion.Item eventKey="1" className="surya-accordion-item">
              <Accordion.Header>
                <div className="acc-header-inner">
                  <span className="acc-icon-wrap blue">
                    <i className="bi bi-truck" />
                  </span>
                  <span className="acc-title">Shipping Address</span>
                  {shippingContacts.length > 1 && (
                    <Badge className="acc-count-badge">{shippingContacts.length} contacts</Badge>
                  )}
                </div>
              </Accordion.Header>
              <Accordion.Body>

                {shippingContacts.map((c, i) => (
                  <ShippingBlock
                    key={i} data={c} index={i}
                    storeLocations={storeLocations}
                    onUpdate={updateShippingContact}
                    onRemove={removeShippingContact}
                    showRemove={shippingContacts.length > 1}
                  />
                ))}

                <button className="surya-add-btn mb-4" onClick={addShippingContact}>
                  <i className="bi bi-plus-circle me-2" />Add Contact Person
                </button>

                <div className="surya-section-divider">
                  <span>Address Details</span>
                </div>

                <Row className="g-3 mt-1">
                  <CountryStateCity
                    countryVal={shippingCountry}
                    stateVal={shippingState}
                    cityVal={shippingCity}
                    onCountryChange={v => { setShippingCountry(v); setShippingState(''); setShippingCity(''); }}
                    onStateChange={v => { setShippingState(v); setShippingCity(''); }}
                    onCityChange={setShippingCity}
                  />

                  {/* GSTIN - independently editable */}
                  <Col xs={12} sm={6} md={3}>
                    <FloatInput
                      label="GSTIN"
                      value={shippingGstin}
                      onChange={e => {
                        const v = e.target.value.toUpperCase();
                        setShippingGstin(v);
                        // Auto-fill PAN only if PAN field is empty
                        if (!shippingPan) {
                          setShippingPan(panFromGst(v));
                        }
                      }}
                      pattern="\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}"
                      maxLength={15}
                    />
                  </Col>

                  {/* PAN - always editable */}
                  <Col xs={12} sm={6} md={3}>
                    <FloatInput
                      label="PAN"
                      value={shippingPan}
                      onChange={e => setShippingPan(e.target.value.toUpperCase())}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      maxLength={10}
                    />
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="surya-textarea-wrap">
                      <label className="surya-textarea-label">Shipping Address *</label>
                      <Form.Control
                        as="textarea" rows={3} className="surya-textarea"
                        value={shippingAddress}
                        onChange={e => setShippingAddress(e.target.value)}
                        placeholder="Enter full shipping address..."
                      />
                    </div>
                  </Col>
                </Row>

                <div className="surya-want-more mt-4">
                  <div className="want-more-text">
                    <i className="bi bi-question-circle me-2" />
                    Add another Shipping Address?
                  </div>
                  <div className="want-more-actions">
                    <button
                      className={`want-btn yes ${shippingWantMore === 'yes' ? 'selected' : ''}`}
                      onClick={() => handleSaveShipping('yes')}
                      disabled={savingShipping}
                    >
                      {savingShipping && shippingWantMore === 'yes'
                        ? <Spinner size="sm" animation="border" />
                        : <><i className="bi bi-plus-circle me-1" />Yes, Add More</>}
                    </button>
                    <button
                      className={`want-btn no ${shippingWantMore === 'no' ? 'selected' : ''}`}
                      onClick={() => handleSaveShipping('no')}
                      disabled={savingShipping}
                    >
                      {savingShipping && shippingWantMore === 'no'
                        ? <Spinner size="sm" animation="border" />
                        : <><i className="bi bi-arrow-right-circle me-1" />No, Continue</>}
                    </button>
                  </div>
                </div>

              </Accordion.Body>
            </Accordion.Item>

            {/* ── 3. Billing Address ── */}
            <Accordion.Item eventKey="2" className="surya-accordion-item">
              <Accordion.Header>
                <div className="acc-header-inner">
                  <span className="acc-icon-wrap green">
                    <i className="bi bi-receipt" />
                  </span>
                  <span className="acc-title">Billing Address</span>
                  {billingContacts.length > 1 && (
                    <Badge className="acc-count-badge green">{billingContacts.length} contacts</Badge>
                  )}
                </div>
              </Accordion.Header>
              <Accordion.Body>

                <div className="surya-same-chip mb-4">
                  <Form.Check
                    type="checkbox"
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onChange={e => handleSameAsShipping(e.target.checked)}
                    label={
                      <span>
                        <i className="bi bi-copy me-2" />
                        Same as Shipping Address
                      </span>
                    }
                  />
                </div>

                {billingContacts.map((c, i) => (
                  <BillingBlock
                    key={i} data={c} index={i}
                    onUpdate={updateBillingContact}
                    onRemove={removeBillingContact}
                    showRemove={billingContacts.length > 1}
                  />
                ))}

                <button className="surya-add-btn mb-4" onClick={addBillingContact}>
                  <i className="bi bi-plus-circle me-2" />Add Contact Person
                </button>

                <div className="surya-section-divider">
                  <span>Address Details</span>
                </div>

                <Row className="g-3 mt-1">
                  <CountryStateCity
                    countryVal={billingCountry}
                    stateVal={billingState}
                    cityVal={billingCity}
                    onCountryChange={v => { setBillingCountry(v); setBillingState(''); setBillingCity(''); }}
                    onStateChange={v => { setBillingState(v); setBillingCity(''); }}
                    onCityChange={setBillingCity}
                  />

                  {/* GSTIN - independently editable */}
                  <Col xs={12} sm={6} md={3}>
                    <FloatInput
                      label="GSTIN"
                      value={billingGstin}
                      onChange={e => {
                        const v = e.target.value.toUpperCase();
                        setBillingGstin(v);
                        // Auto-fill PAN only if PAN field is empty
                        if (!billingPan) {
                          setBillingPan(panFromGst(v));
                        }
                      }}
                      pattern="\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}"
                      maxLength={15}
                    />
                  </Col>

                  {/* PAN - always editable */}
                  <Col xs={12} sm={6} md={3}>
                    <FloatInput
                      label="PAN"
                      value={billingPan}
                      onChange={e => setBillingPan(e.target.value.toUpperCase())}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      maxLength={10}
                    />
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="surya-textarea-wrap">
                      <label className="surya-textarea-label">Billing Address *</label>
                      <Form.Control
                        as="textarea" rows={3} className="surya-textarea"
                        value={billingAddress}
                        onChange={e => setBillingAddress(e.target.value)}
                        placeholder="Enter full billing address..."
                      />
                    </div>
                  </Col>
                </Row>

                <div className="surya-want-more mt-4">
                  <div className="want-more-text">
                    <i className="bi bi-question-circle me-2" />
                    Add another Billing Address?
                  </div>
                  <div className="want-more-actions">
                    <button
                      className={`want-btn yes ${billingWantMore === 'yes' ? 'selected' : ''}`}
                      onClick={() => handleSaveBilling('yes')}
                      disabled={savingBilling}
                    >
                      {savingBilling && billingWantMore === 'yes'
                        ? <Spinner size="sm" animation="border" />
                        : <><i className="bi bi-plus-circle me-1" />Yes, Add More</>}
                    </button>
                    <button
                      className={`want-btn no ${billingWantMore === 'no' ? 'selected' : ''}`}
                      onClick={() => handleSaveBilling('no')}
                      disabled={savingBilling}
                    >
                      {savingBilling && billingWantMore === 'no'
                        ? <Spinner size="sm" animation="border" />
                        : <><i className="bi bi-check-circle me-1" />Finish & Save</>}
                    </button>
                  </div>
                </div>

              </Accordion.Body>
            </Accordion.Item>

          </Accordion>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after {
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }

        /* ── Page Layout ── */
        .surya-page {
          background: #f0f2f5;
          min-height: 100vh;
          padding-bottom: 40px;
        }

        /* ── Top Nav ── */
        .surya-topnav {
          background: #fff;
          border-bottom: 3px solid #ff630d;
          height: 58px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 200;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .surya-back-btn {
          background: #fff5f0;
          border: 1.5px solid #ffd5c0;
          border-radius: 8px;
          color: #ff630d;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .surya-back-btn:hover {
          background: #ff630d;
          color: #fff;
          border-color: #ff630d;
        }
        .surya-nav-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .surya-nav-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
        }
        .surya-breadcrumb {
          font-size: 0.7rem;
          color: #999;
          display: none;
        }
        @media (min-width: 576px) {
          .surya-breadcrumb { display: block; }
          .surya-nav-title { font-size: 1.1rem; }
          .surya-topnav { padding: 0 24px; }
        }
        .surya-id-badge {
          background: #e8f9f0;
          color: #1a7a4a;
          border: 1.5px solid #b3e8ce;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Step Indicator ── */
        .step-bar {
          background: #fff;
          padding: 14px 16px;
          border-bottom: 1px solid #eee;
        }
        .step-indicator-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 400px;
          margin: 0 auto;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #ddd;
          background: #f8f8f8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #aaa;
          transition: all 0.3s;
        }
        .step-item.active .step-circle {
          border-color: #ff630d;
          background: #ff630d;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(255,99,13,0.15);
        }
        .step-item.done .step-circle {
          border-color: #22c55e;
          background: #22c55e;
          color: #fff;
        }
        .step-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .step-item.active .step-label { color: #ff630d; }
        .step-item.done .step-label { color: #22c55e; }
        .step-line {
          flex: 1;
          height: 2px;
          background: #e0e0e0;
          margin: 0 8px;
          margin-bottom: 18px;
          transition: background 0.3s;
        }
        .step-line.done { background: #22c55e; }

        /* ── Content ── */
        .surya-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 768px) {
          .surya-content { padding: 24px; gap: 16px; }
        }

        /* ── Accordion ── */
        .surya-accordion-item {
          border: none !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          margin-bottom: 0 !important;
        }
        .surya-accordion-item .accordion-button {
          background: #fff;
          padding: 14px 16px;
          box-shadow: none !important;
          border-bottom: 1px solid #f0f0f0;
        }
        .surya-accordion-item .accordion-button:not(.collapsed) {
          background: linear-gradient(90deg, #fff7f4 0%, #fff 100%);
          border-bottom: 2px solid #ff630d22;
        }
        @media (min-width: 576px) {
          .surya-accordion-item .accordion-button { padding: 16px 24px; }
        }
        .surya-accordion-item .accordion-body {
          background: #fff;
          padding: 16px;
        }
        @media (min-width: 576px) {
          .surya-accordion-item .accordion-body { padding: 24px; }
        }

        /* Accordion header inner */
        .acc-header-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .acc-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .acc-icon-wrap.orange { background: #fff0e8; color: #ff630d; }
        .acc-icon-wrap.blue   { background: #e8f4ff; color: #2563eb; }
        .acc-icon-wrap.green  { background: #e8f9f0; color: #16a34a; }
        .acc-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a1a;
          flex: 1;
        }
        .accordion-button:not(.collapsed) .acc-title { color: #ff630d; }
        .acc-done-badge {
          background: #e8f9f0;
          color: #16a34a;
          border-radius: 12px;
          padding: 2px 10px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .acc-count-badge {
          background: #dbeafe !important;
          color: #1d4ed8 !important;
          border-radius: 12px;
          padding: 3px 10px;
          font-size: 0.72rem;
          font-weight: 600;
        }

        /* ── Float Input ── */
        .surya-float {
          position: relative;
          margin-bottom: 20px;
          padding-top: 16px;
        }
        .surya-input {
          width: 100%;
          border: none;
          border-bottom: 1.5px solid #d0d0d0;
          border-radius: 0;
          padding: 6px 0 6px;
          font-size: 0.9rem;
          color: #1a1a1a;
          background: transparent;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .surya-input:focus { border-bottom-color: #ff630d; }
        .surya-input[readonly] { color: #666; cursor: default; }
        .form-bar {
          display: block;
          height: 2px;
          width: 0;
          background: #ff630d;
          position: absolute;
          bottom: 0;
          left: 0;
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .surya-input:focus ~ .form-bar { width: 100%; }
        .float-label {
          position: absolute;
          top: 0;
          left: 0;
          font-size: 0.7rem;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          pointer-events: none;
        }

        /* ── Select Wrap ── */
        .surya-select-wrap {
          padding-top: 16px;
          margin-bottom: 4px;
        }
        .surya-select-label {
          display: block;
          font-size: 0.7rem;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        /* ── Textarea ── */
        .surya-textarea-wrap { margin-bottom: 4px; }
        .surya-textarea-label {
          display: block;
          font-size: 0.7rem;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .surya-textarea {
          border: 1.5px solid #d0d0d0 !important;
          border-radius: 8px !important;
          font-size: 0.9rem !important;
          resize: none;
          font-family: 'DM Sans', sans-serif !important;
          width: 100%;
          padding: 10px 12px;
        }
        .surya-textarea:focus {
          border-color: #ff630d !important;
          box-shadow: 0 0 0 3px rgba(255,99,13,0.1) !important;
          outline: none;
        }

        /* ── Category chips ── */
        .surya-cat-section { padding-top: 16px; }
        .surya-cat-label {
          font-size: 0.7rem;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 8px;
        }
        .surya-cat-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .surya-cat-chip {
          border: 1.5px solid #e0e0e0;
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
          user-select: none;
        }
        .surya-cat-chip:hover { border-color: #ff630d; color: #ff630d; background: #fff5f0; }
        .surya-cat-chip.active {
          background: #ff630d;
          border-color: #ff630d;
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(255,99,13,0.3);
        }

        /* ── Sub blocks ── */
        .surya-sub-block {
          background: #fafbfc;
          border: 1.5px solid #eef0f2 !important;
          border-radius: 10px !important;
        }
        .contact-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .surya-remove-btn {
          background: none;
          border: 1.5px solid #fca5a5;
          border-radius: 6px;
          color: #ef4444;
          padding: 4px 10px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .surya-remove-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

        /* ── Add contact btn ── */
        .surya-add-btn {
          background: none;
          border: 1.5px dashed #ccc;
          border-radius: 8px;
          color: #666;
          padding: 8px 18px;
          font-size: 0.83rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }
        .surya-add-btn:hover { border-color: #ff630d; color: #ff630d; background: #fff5f0; }

        /* ── Section divider ── */
        .surya-section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #aaa;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .surya-section-divider::before,
        .surya-section-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #eee;
        }

        /* ── Want more ── */
        .surya-want-more {
          background: #f8f9fb;
          border: 1.5px dashed #e0e4ea;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (min-width: 576px) {
          .surya-want-more {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .want-more-text {
          font-size: 0.87rem;
          font-weight: 600;
          color: #555;
        }
        .want-more-actions { display: flex; gap: 10px; }
        .want-btn {
          border: none;
          border-radius: 8px;
          padding: 9px 18px;
          font-size: 0.83rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .want-btn.yes {
          background: #fff;
          border: 1.5px solid #2563eb;
          color: #2563eb;
        }
        .want-btn.yes:hover, .want-btn.yes.selected {
          background: #2563eb;
          color: #fff;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
        }
        .want-btn.no {
          background: #fff;
          border: 1.5px solid #ff630d;
          color: #ff630d;
        }
        .want-btn.no:hover, .want-btn.no.selected {
          background: #ff630d;
          color: #fff;
          box-shadow: 0 2px 8px rgba(255,99,13,0.25);
        }
        .want-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Primary button ── */
        .surya-btn-primary {
          background: linear-gradient(135deg, #ff630d, #ff8c42) !important;
          border: none !important;
          color: #fff !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          padding: 11px 24px !important;
          font-size: 0.9rem !important;
          transition: all 0.2s !important;
          box-shadow: 0 4px 14px rgba(255,99,13,0.25) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .surya-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(255,99,13,0.35) !important;
        }
        .surya-btn-primary:disabled { opacity: 0.7 !important; }

        /* ── Same as shipping ── */
        .surya-same-chip {
          display: inline-flex;
          align-items: center;
          background: #fff8f5;
          border: 1.5px solid #ffd5c0;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .surya-same-chip .form-check { margin: 0; }
        .surya-same-chip .form-check-input:checked {
          background-color: #ff630d !important;
          border-color: #ff630d !important;
        }
        .surya-same-chip .form-check-label { cursor: pointer; color: #333; font-weight: 500; }

        /* Accordion arrow fix */
        .accordion-button::after { flex-shrink: 0; }
      `}</style>
    </>
  );
}