import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Accordion, Form, Button, Row, Col, Badge, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const BASE_URL = 'https://www.erp.suryaequipments.com/Surya_React/surya_dynamic_api/company';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isNumberKey = (e) => {
  const ch = e.which || e.keyCode;
  return !(ch !== 46 && ch > 31 && (ch < 48 || ch > 57));
};

const panFromGst = (gst) => (gst.length >= 12 ? gst.substring(2, 12) : '');

const emptyShippingContact = () => ({
  id: 0,
  contactPerson: '',
  personEmail: '',
  contactNumber: '',
  designation: '',
  storeLocation: [],
  storeLocationId: 0,
});

const emptyBillingContact = () => ({
  id: 0,
  contactPerson: '',
  personEmail: '',
  contactNumber: '',
  designation: '',
  location: '',
  locationId: 0,
});

const emptyShippingAddress = () => ({
  addressId: 0,
  contacts: [emptyShippingContact()],
  country: '',
  state: '',
  city: '',
  cityId: '',
  gstin: '',
  pan: '',
  address: '',
});

const emptyBillingAddress = () => ({
  addressId: 0,
  contacts: [emptyBillingContact()],
  country: '',
  state: '',
  city: '',
  cityId: '',
  gstin: '',
  pan: '',
  address: '',
});

// ─── FloatInput ───────────────────────────────────────────────────────────────
function FloatInput({ label, value, onChange, type = 'text', onKeyPress, readOnly, pattern, maxLength, style }) {
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
// FIX: Fully self-contained CSC that resolves cityId on load in edit mode
function CountryStateCity({ countryVal, stateVal, cityVal, cityIdVal, onCountryChange, onStateChange, onCityChange }) {
  const [countries, setCountries] = useState([]);
  const [states,    setStates]    = useState([]);
  const [cities,    setCities]    = useState([]);

  const selectStyles = {
    control: (b, s) => ({
      ...b, borderRadius: 0, border: 'none',
      borderBottom: `1.5px solid ${s.isFocused ? '#ff630d' : '#ccc'}`,
      boxShadow: 'none', minHeight: 36, fontSize: 13, background: 'transparent',
    }),
    menu:               b => ({ ...b, zIndex: 9999, fontSize: 13 }),
    placeholder:        b => ({ ...b, color: '#aaa', fontSize: 12 }),
    singleValue:        b => ({ ...b, fontSize: 13 }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator:  b => ({ ...b, padding: '0 4px', color: '#aaa' }),
  };

  // Load countries once
  useEffect(() => {
    axios.get(`${BASE_URL}/getCountry.php`)
      .then(r => setCountries((r.data || []).map(c => ({ value: c.country, label: c.country }))))
      .catch(() => setCountries([]));
  }, []);

  // Load states whenever country changes
  useEffect(() => {
    if (!countryVal) { setStates([]); setCities([]); return; }
    axios.post(`${BASE_URL}/getState.php`, new URLSearchParams({ country: countryVal }))
      .then(r => setStates((r.data || []).map(s => ({ value: s.state, label: s.state }))))
      .catch(() => setStates([]));
  }, [countryVal]);

  // Load cities whenever state changes
  // FIX: After cities load, if cityVal exists but cityIdVal is missing (edit mode from DB),
  //      resolve the city id automatically and fire onCityChange once
  useEffect(() => {
    if (!stateVal) { setCities([]); return; }
    axios.post(`${BASE_URL}/getCity.php`, new URLSearchParams({ state: stateVal }))
      .then(r => {
        const opts = (r.data || []).map(c => ({ value: c.city, label: c.city, id: c.id }));
        setCities(opts);

        // Resolve cityId when editing and it is not yet set
        if (cityVal && !cityIdVal) {
          const match = opts.find(o => o.value === cityVal);
          if (match) onCityChange(match.value, match.id);
        }
      })
      .catch(() => setCities([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateVal]);

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
            // FIX: match by city name (cityVal) — cityId is internal
            value={cities.find(c => c.value === cityVal) || null}
            onChange={opt => onCityChange(opt ? opt.value : '', opt ? opt.id : '')}
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

// ─── ShippingContactRow ───────────────────────────────────────────────────────
function ShippingContactRow({ data, index, storeLocations, onUpdate, onRemove, showRemove }) {
  const upd = (key, val) => onUpdate(index, key, val);

  const selectStyles = {
    control: (b, s) => ({
      ...b, borderRadius: 0, border: 'none',
      borderBottom: `1.5px solid ${s.isFocused ? '#ff630d' : '#ccc'}`,
      boxShadow: 'none', minHeight: 36, fontSize: 13, background: 'transparent',
    }),
    menu:               b => ({ ...b, zIndex: 9999, fontSize: 13 }),
    placeholder:        b => ({ ...b, color: '#aaa', fontSize: 12 }),
    indicatorSeparator: () => ({ display: 'none' }),
    multiValue:         b => ({ ...b, background: '#fff0e8', borderRadius: 4 }),
    multiValueLabel:    b => ({ ...b, color: '#ff630d', fontSize: 11 }),
    multiValueRemove:   b => ({ ...b, color: '#ff630d', ':hover': { background: '#ff630d', color: '#fff' } }),
  };

  return (
    <div className="surya-sub-block mb-3 p-3 rounded-3">
      {showRemove && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="contact-badge">Contact #{index + 1}</span>
          {/* <button className="surya-remove-btn" onClick={() => onRemove(index)}>
            <i className="bi bi-trash3" /> Remove
          </button> */}
        </div>
      )}
      <Row className="g-3">
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Contact Person Name" value={data.contactPerson}
            onChange={e => upd('contactPerson', e.target.value)} />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Email Address" type="email" value={data.personEmail}
            onChange={e => upd('personEmail', e.target.value)} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Mobile" value={data.contactNumber}
            onChange={e => upd('contactNumber', e.target.value)}
            onKeyPress={isNumberKey} maxLength={10} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Designation" value={data.designation}
            onChange={e => upd('designation', e.target.value)} />
        </Col>
        <Col xs={12} sm={4} md={2}>
          <div className="surya-select-wrap">
            <label className="surya-select-label">Store Location</label>
            <Select
              isMulti
              options={storeLocations}
              value={data.storeLocation}
              onChange={vals => upd('storeLocation', vals || [])}
              placeholder="Select..."
              styles={selectStyles}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}

// ─── BillingContactRow ────────────────────────────────────────────────────────
function BillingContactRow({ data, index, onUpdate, onRemove, showRemove }) {
  const upd = (key, val) => onUpdate(index, key, val);

  return (
    <div className="surya-sub-block mb-3 p-3 rounded-3">
      {showRemove && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="contact-badge">Contact #{index + 1}</span>
          {/* <button className="surya-remove-btn" onClick={() => onRemove(index)}>
            <i className="bi bi-trash3" /> Remove
          </button> */}
        </div>
      )}
      <Row className="g-3">
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Contact Person Name" value={data.contactPerson}
            onChange={e => upd('contactPerson', e.target.value)} />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="Email Address" type="email" value={data.personEmail}
            onChange={e => upd('personEmail', e.target.value)} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Mobile" value={data.contactNumber}
            onChange={e => upd('contactNumber', e.target.value)}
            onKeyPress={isNumberKey} maxLength={10} />
        </Col>
        <Col xs={6} sm={4} md={2}>
          <FloatInput label="Designation" value={data.designation}
            onChange={e => upd('designation', e.target.value)} />
        </Col>
        <Col xs={12} sm={4} md={2}>
          <FloatInput label="Billing Location" value={data.location}
            onChange={e => upd('location', e.target.value)} />
        </Col>
      </Row>
    </div>
  );
}

// ─── StepIndicator ────────────────────────────────────────────────────────────
function StepIndicator({ activeKey }) {
  const steps = [
    { key: '0', icon: 'bi-building', label: 'Company'  },
    { key: '1', icon: 'bi-truck',    label: 'Shipping' },
    { key: '2', icon: 'bi-receipt',  label: 'Billing'  },
  ];
  return (
    <div className="step-indicator-wrap">
      {steps.map((s, i) => {
        const isActive = activeKey === s.key;
        const isDone   = parseInt(activeKey) > parseInt(s.key);
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

// ─── ShippingAddressCard ──────────────────────────────────────────────────────
function ShippingAddressCard({ data, index, storeLocations, onChange, onRemove, showRemove }) {
  const upd = (key, val) => onChange(index, key, val);

  const updateContact = (ci, key, val) => {
    const contacts = data.contacts.map((c, i) => i === ci ? { ...c, [key]: val } : c);
    upd('contacts', contacts);
  };
  const addContact    = () => upd('contacts', [...data.contacts, emptyShippingContact()]);
  const removeContact = (ci) => upd('contacts', data.contacts.filter((_, i) => i !== ci));

  return (
    <div className="surya-address-card mb-4">
      {showRemove && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="address-badge">Address #{index + 1}</span>
          {/* <button className="surya-remove-btn" onClick={() => onRemove(index)}>
            <i className="bi bi-trash3" /> Remove Address
          </button> */}
        </div>
      )}

      {data.contacts.map((c, ci) => (
        <ShippingContactRow
          key={ci} data={c} index={ci}
          storeLocations={storeLocations}
          onUpdate={updateContact}
          onRemove={removeContact}
          showRemove={data.contacts.length > 1}
        />
      ))}

      <button className="surya-add-btn mb-4" onClick={addContact}>
        <i className="bi bi-plus-circle me-2" />Add Contact Person
      </button>

      <div className="surya-section-divider"><span>Address Details</span></div>
      <Row className="g-3 mt-1">
        <CountryStateCity
          countryVal={data.country}
          stateVal={data.state}
          cityVal={data.city}
          cityIdVal={data.cityId}
          onCountryChange={v => { upd('country', v); upd('state', ''); upd('city', ''); upd('cityId', ''); }}
          onStateChange={v  => { upd('state', v);   upd('city', ''); upd('cityId', ''); }}
          onCityChange={(v, id) => { upd('city', v); upd('cityId', id); }}
        />
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="GSTIN" value={data.gstin}
            onChange={e => {
              const v = e.target.value.toUpperCase();
              upd('gstin', v);
              if (!data.pan) upd('pan', panFromGst(v));
            }}
            pattern="\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}"
            maxLength={15} />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="PAN" value={data.pan}
            onChange={e => upd('pan', e.target.value.toUpperCase())}
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" maxLength={10} />
        </Col>
        <Col xs={12} md={6}>
          <div className="surya-textarea-wrap">
            <label className="surya-textarea-label">Shipping Address *</label>
            <Form.Control as="textarea" rows={3} className="surya-textarea"
              value={data.address} onChange={e => upd('address', e.target.value)}
              placeholder="Enter full shipping address..." />
          </div>
        </Col>
      </Row>
    </div>
  );
}

// ─── BillingAddressCard ───────────────────────────────────────────────────────
function BillingAddressCard({ data, index, onChange, onRemove, showRemove }) {
  const upd = (key, val) => onChange(index, key, val);

  const updateContact = (ci, key, val) => {
    const contacts = data.contacts.map((c, i) => i === ci ? { ...c, [key]: val } : c);
    upd('contacts', contacts);
  };
  const addContact    = () => upd('contacts', [...data.contacts, emptyBillingContact()]);
  const removeContact = (ci) => upd('contacts', data.contacts.filter((_, i) => i !== ci));

  return (
    <div className="surya-address-card mb-4">
      {showRemove && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="address-badge">Address #{index + 1}</span>
          {/* <button className="surya-remove-btn" onClick={() => onRemove(index)}>
            <i className="bi bi-trash3" /> Remove Address
          </button> */}
        </div>
      )}

      {data.contacts.map((c, ci) => (
        <BillingContactRow
          key={ci} data={c} index={ci}
          onUpdate={updateContact}
          onRemove={removeContact}
          showRemove={data.contacts.length > 1}
        />
      ))}

      <button className="surya-add-btn mb-4" onClick={addContact}>
        <i className="bi bi-plus-circle me-2" />Add Contact Person
      </button>

      <div className="surya-section-divider"><span>Address Details</span></div>
      <Row className="g-3 mt-1">
        <CountryStateCity
          countryVal={data.country}
          stateVal={data.state}
          cityVal={data.city}
          cityIdVal={data.cityId}
          onCountryChange={v => { upd('country', v); upd('state', ''); upd('city', ''); upd('cityId', ''); }}
          onStateChange={v  => { upd('state', v);   upd('city', ''); upd('cityId', ''); }}
          onCityChange={(v, id) => { upd('city', v); upd('cityId', id); }}
        />
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="GSTIN" value={data.gstin}
            onChange={e => {
              const v = e.target.value.toUpperCase();
              upd('gstin', v);
              if (!data.pan) upd('pan', panFromGst(v));
            }}
            pattern="\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}"
            maxLength={15} />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <FloatInput label="PAN" value={data.pan}
            onChange={e => upd('pan', e.target.value.toUpperCase())}
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" maxLength={10} />
        </Col>
        <Col xs={12} md={6}>
          <div className="surya-textarea-wrap">
            <label className="surya-textarea-label">Billing Address *</label>
            <Form.Control as="textarea" rows={3} className="surya-textarea"
              value={data.address} onChange={e => upd('address', e.target.value)}
              placeholder="Enter full billing address..." />
          </div>
        </Col>
      </Row>
    </div>
  );
}

// ─── Main: EditCompany ────────────────────────────────────────────────────────
export default function EditCompany() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [pageLoading,   setPageLoading]   = useState(true);
  const [custName,      setCustName]      = useState('');
  const [custContact,   setCustContact]   = useState('');
  const [custEmail,     setCustEmail]     = useState('');
  const [companyCat,    setCompanyCat]    = useState([]);
  const [comments,      setComments]      = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  const [storeLocations,    setStoreLocations]    = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([emptyShippingAddress()]);
  const [savingShipping,    setSavingShipping]    = useState(false);

  // FIX: "Same as shipping" state for billing
  const [sameAsShipping, setSameAsShipping] = useState(false);

  const [billingAddresses, setBillingAddresses] = useState([emptyBillingAddress()]);
  const [savingBilling,    setSavingBilling]    = useState(false);

  const [activeKey, setActiveKey] = useState('0');

  // ── Fetch existing data on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!customerId) return;
    const loadAll = async () => {
      setPageLoading(true);
      try {
        // 1. Store locations
        const slRes  = await axios.get(`${BASE_URL}/getStoreLocations.php`);
        const slOpts = (slRes.data || []).map(l => ({ value: l.id, label: l.store_location }));
        setStoreLocations(slOpts);

        // 2. Customer master
        const custRes = await axios.get(`${BASE_URL}/getCustomerById.php?customer_id=${customerId}`);
        const cust    = custRes.data?.data || {};
        setCustName(cust.CUSTOMER_NAME   || '');
        setCustContact(cust.CONTACT_NUMBER || '');
        setCustEmail(cust.EMAIL          || '');
        setComments(cust.COMMENTS        || '');
        setCompanyCat((cust.COMPANY_CAT_ID || '').split(',').filter(Boolean));

        // 3. Shipping addresses
        const shipRes  = await axios.get(`${BASE_URL}/getShippingAddresses.php?customer_id=${customerId}`);
        const shipData = shipRes.data?.data || [];
        if (shipData.length > 0) {
          setShippingAddresses(shipData.map(addr => ({
            addressId: addr.ADDRESS_ID,
            contacts: (addr.contacts || []).map(c => ({
              id:             c.id             || 0,
              contactPerson:  c.name           || '',
              personEmail:    c.email          || '',
              contactNumber:  c.contact_number || '',
              designation:    c.designation    || '',
              // FIX: store_location from DB may be a comma-separated string of ids — match against slOpts
              storeLocation: c.store_location
                ? slOpts.filter(o =>
                    String(c.store_location).split(',').map(s => s.trim()).includes(String(o.value))
                  )
                : [],
              storeLocationId: c.store_id || 0,
            })),
            country: addr.country || '',
            state:   addr.state   || '',
            city:    addr.city    || '',
            cityId:  addr.city_id || '',
            gstin:   addr.GSTN    || '',
            pan:     addr.PAN     || '',
            address: addr.DETAIL_ADDRESS || '',
          })));
        }

        // 4. Billing addresses
        const billRes  = await axios.get(`${BASE_URL}/getBillingAddresses.php?customer_id=${customerId}`);
        const billData = billRes.data?.data || [];
        if (billData.length > 0) {
          setBillingAddresses(billData.map(addr => ({
            addressId: addr.ADDRESS_ID,
            contacts: (addr.contacts || []).map(c => ({
              id:            c.id             || 0,
              contactPerson: c.name           || '',
              personEmail:   c.email          || '',
              contactNumber: c.contact_number || '',
              designation:   c.designation    || '',
              location:      c.store_location || '',
              locationId:    c.store_id       || 0,
            })),
            country: addr.country || '',
            state:   addr.state   || '',
            city:    addr.city    || '',
            cityId:  addr.city_id || '',
            gstin:   addr.GSTN    || '',
            pan:     addr.PAN     || '',
            address: addr.DETAIL_ADDRESS || '',
          })));
        }

      } catch (err) {
        console.error(err);
        toast.error('Failed to load customer data.');
      } finally {
        setPageLoading(false);
      }
    };
    loadAll();
  }, [customerId]);

  // ── Category toggle ───────────────────────────────────────────────────────
  const toggleCat = (val) =>
    setCompanyCat(prev => prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]);

  // ── Save Company ──────────────────────────────────────────────────────────
  const handleSaveCompany = async () => {
    if (!custName.trim())        { toast.warning('Company Name is required.');             return; }
    if (!custContact.trim())     { toast.warning('Contact Number is required.');           return; }
    if (companyCat.length === 0) { toast.warning('Please select at least one Category.'); return; }
    setSavingCompany(true);
    try {
      const params = new URLSearchParams({
        customer_id: customerId,
        custName, custContact, custEmail, comments,
        custCat: companyCat.join(','),
      });
      await axios.post(`${BASE_URL}/updateCustomer.php`, params);
      toast.success('Company info updated!');
      setActiveKey('1');
    } catch {
      toast.error('Failed to update company details.');
    } finally {
      setSavingCompany(false);
    }
  };

  // ── Shipping helpers ──────────────────────────────────────────────────────
  const updateShippingAddress = (index, key, val) =>
    setShippingAddresses(prev => prev.map((a, i) => i === index ? { ...a, [key]: val } : a));
  const addShippingAddress    = () => setShippingAddresses(prev => [...prev, emptyShippingAddress()]);
  const removeShippingAddress = (index) => setShippingAddresses(prev => prev.filter((_, i) => i !== index));

  // ── Save Shipping ─────────────────────────────────────────────────────────
  const handleSaveShipping = async () => {
    for (let i = 0; i < shippingAddresses.length; i++) {
      const addr    = shippingAddresses[i];
      const addrNum = i + 1;

      if (!addr.cityId && !addr.city) {
        toast.warning(`Please select City for Shipping Address #${addrNum}.`);
        return;
      }
      if (!addr.address.trim()) {
        toast.warning(`Please enter Shipping Address #${addrNum}.`);
        return;
      }
      for (const c of addr.contacts) {
        if (!c.contactPerson.trim()) {
          toast.warning(`Please enter Contact Person Name in Shipping Address #${addrNum}.`);
          return;
        }
      }
    }

    setSavingShipping(true);
    try {
      const payload = {
        customer_id: customerId,
        addresses: shippingAddresses.map(addr => ({
          address_id: addr.addressId,
          address:    addr.address,
          country:    addr.country,
          state:      addr.state,
          city:       addr.city,
          city_id:    addr.cityId,
          gstin:      addr.gstin,
          pan:        addr.pan,
          contacts:   addr.contacts.map(c => ({
            id:             c.id,
            contact_person: c.contactPerson,
            email:          c.personEmail,
            contact_number: c.contactNumber,
            designation:    c.designation,
            store_location: c.storeLocation.map(l => l.value).join(','),
            store_id:       c.storeLocationId,
          })),
        })),
      };
      await axios.post(
        `${BASE_URL}/updateShippingAddress.php`,
        JSON.stringify(payload),
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Shipping Address updated!');
      setActiveKey('2');
    } catch {
      toast.error('Failed to update shipping address.');
    } finally {
      setSavingShipping(false);
    }
  };

  // ── Same as Shipping (for billing) ────────────────────────────────────────
  // FIX: Convert shipping contacts → billing contacts shape and copy all address fields
  const handleSameAsShipping = useCallback((checked) => {
    setSameAsShipping(checked);
    if (checked) {
      setBillingAddresses(
        shippingAddresses.map(sa => ({
          addressId: 0,           // always insert as new billing address
          contacts: sa.contacts.map(c => ({
            id:            0,
            contactPerson: c.contactPerson,
            personEmail:   c.personEmail,
            contactNumber: c.contactNumber,
            designation:   c.designation,
            location:      c.storeLocation.map(l => l.label).join(', '),
            locationId:    0,
          })),
          country: sa.country,
          state:   sa.state,
          city:    sa.city,
          cityId:  sa.cityId,
          gstin:   sa.gstin,
          pan:     sa.pan,
          address: sa.address,
        }))
      );
    } else {
      setBillingAddresses([emptyBillingAddress()]);
    }
  }, [shippingAddresses]);

  // ── Billing helpers ───────────────────────────────────────────────────────
  const updateBillingAddress = (index, key, val) =>
    setBillingAddresses(prev => prev.map((a, i) => i === index ? { ...a, [key]: val } : a));
  const addBillingAddress    = () => setBillingAddresses(prev => [...prev, emptyBillingAddress()]);
  const removeBillingAddress = (index) => setBillingAddresses(prev => prev.filter((_, i) => i !== index));

  // ── Save Billing ──────────────────────────────────────────────────────────
  const handleSaveBilling = async () => {
    for (let i = 0; i < billingAddresses.length; i++) {
      const addr    = billingAddresses[i];
      const addrNum = i + 1;

      if (!addr.cityId && !addr.city) {
        toast.warning(`Please select City for Billing Address #${addrNum}.`);
        return;
      }
      if (!addr.address.trim()) {
        toast.warning(`Please enter Billing Address #${addrNum}.`);
        return;
      }
      for (const c of addr.contacts) {
        if (!c.contactPerson.trim()) {
          toast.warning(`Please enter Contact Person Name in Billing Address #${addrNum}.`);
          return;
        }
      }
    }

    setSavingBilling(true);
    try {
      const payload = {
        customer_id: customerId,
        addresses: billingAddresses.map(addr => ({
          address_id: addr.addressId,
          address:    addr.address,
          country:    addr.country,
          state:      addr.state,
          city:       addr.city,
          city_id:    addr.cityId,
          gstin:      addr.gstin,
          pan:        addr.pan,
          contacts:   addr.contacts.map(c => ({
            id:             c.id,
            contact_person: c.contactPerson,
            email:          c.personEmail,
            contact_number: c.contactNumber,
            designation:    c.designation,
            location:       c.location,
            location_id:    c.locationId,
          })),
        })),
      };
      await axios.post(
        `${BASE_URL}/updateBillingAddress.php`,
        JSON.stringify(payload),
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Billing Address updated! Company saved successfully.');
      navigate('/customers');
    } catch {
      toast.error('Failed to update billing address.');
    } finally {
      setSavingBilling(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" style={{ color: '#ff630d', width: 48, height: 48 }} />
          <p style={{ marginTop: 16, color: '#666', fontWeight: 600 }}>Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />

      <div className="surya-page">

        {/* ── Top Nav ── */}
        <nav className="surya-topnav">
          <button className="surya-back-btn" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" />
          </button>
          <div className="surya-nav-content">
            <span className="surya-nav-title">Edit Company</span>
            <span className="surya-breadcrumb">Marketing · Company · Edit</span>
          </div>
          <span className="surya-id-badge">
            <i className="bi bi-pencil-square me-1" />#{customerId}
          </span>
        </nav>

        {/* ── Step Bar ── */}
        <div className="step-bar">
          <StepIndicator activeKey={activeKey} />
        </div>

        {/* ── Content ── */}
        <div className="surya-content">
          <Accordion activeKey={activeKey} onSelect={k => setActiveKey(k)}>

            {/* ── 1. Company Info ── */}
            <Accordion.Item eventKey="0" className="surya-accordion-item">
              <Accordion.Header>
                <div className="acc-header-inner">
                  <span className="acc-icon-wrap orange"><i className="bi bi-building" /></span>
                  <span className="acc-title">Company Info</span>
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
                        {[{ val: '1', label: 'Customer', icon: 'bi-person'   },
                          { val: '3', label: 'Supplier', icon: 'bi-box-seam' },
                          { val: '2', label: 'Vendor',   icon: 'bi-shop'     }].map(cat => (
                          <div key={cat.val}
                            className={`surya-cat-chip ${companyCat.includes(cat.val) ? 'active' : ''}`}
                            onClick={() => toggleCat(cat.val)}>
                            <i className={`bi ${cat.icon}`} />{cat.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={8}>
                    <div className="surya-textarea-wrap">
                      <label className="surya-textarea-label">Comments</label>
                      <Form.Control as="textarea" rows={2} className="surya-textarea"
                        value={comments} onChange={e => setComments(e.target.value)}
                        placeholder="Add any notes or comments..." />
                    </div>
                  </Col>
                  <Col xs={12} md={4} className="d-flex align-items-end">
                    <Button className="surya-btn-primary w-100" onClick={handleSaveCompany} disabled={savingCompany}>
                      {savingCompany
                        ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</>
                        : <><i className="bi bi-floppy me-2" />Update Company</>}
                    </Button>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            {/* ── 2. Shipping Address ── */}
            <Accordion.Item eventKey="1" className="surya-accordion-item">
              <Accordion.Header>
                <div className="acc-header-inner">
                  <span className="acc-icon-wrap blue"><i className="bi bi-truck" /></span>
                  <span className="acc-title">Shipping Addresses</span>
                  {shippingAddresses.length > 1 && (
                    <Badge className="acc-count-badge">{shippingAddresses.length} addresses</Badge>
                  )}
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {shippingAddresses.map((addr, i) => (
                  <ShippingAddressCard
                    key={i} data={addr} index={i}
                    storeLocations={storeLocations}
                    onChange={updateShippingAddress}
                    onRemove={removeShippingAddress}
                    showRemove={shippingAddresses.length > 1}
                  />
                ))}

                <button className="surya-add-btn mb-4" onClick={addShippingAddress}>
                  <i className="bi bi-plus-circle me-2" />Add Another Shipping Address
                </button>

                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button className="surya-btn-secondary" onClick={() => setActiveKey('2')} disabled={savingShipping}>
                    Skip to Billing
                  </Button>
                  <Button className="surya-btn-primary" onClick={handleSaveShipping} disabled={savingShipping}>
                    {savingShipping
                      ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</>
                      : <><i className="bi bi-floppy me-2" />Update Shipping</>}
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            {/* ── 3. Billing Address ── */}
            <Accordion.Item eventKey="2" className="surya-accordion-item">
              <Accordion.Header>
                <div className="acc-header-inner">
                  <span className="acc-icon-wrap green"><i className="bi bi-receipt" /></span>
                  <span className="acc-title">Billing Addresses</span>
                  {billingAddresses.length > 1 && (
                    <Badge className="acc-count-badge green">{billingAddresses.length} addresses</Badge>
                  )}
                </div>
              </Accordion.Header>
              <Accordion.Body>

                {/* FIX: Same as shipping checkbox — mirrors AddCompany UX */}
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

                {billingAddresses.map((addr, i) => (
                  <BillingAddressCard
                    key={i} data={addr} index={i}
                    onChange={updateBillingAddress}
                    onRemove={removeBillingAddress}
                    showRemove={billingAddresses.length > 1}
                  />
                ))}

                <button className="surya-add-btn mb-4" onClick={addBillingAddress}>
                  <i className="bi bi-plus-circle me-2" />Add Another Billing Address
                </button>

                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button className="surya-btn-secondary" onClick={() => navigate(-1)} disabled={savingBilling}>
                    Cancel
                  </Button>
                  <Button className="surya-btn-primary" onClick={handleSaveBilling} disabled={savingBilling}>
                    {savingBilling
                      ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</>
                      : <><i className="bi bi-check-circle me-2" />Save All Changes</>}
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>

          </Accordion>
        </div>
      </div>

      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        .surya-page { background: #f0f2f5; min-height: 100vh; padding-bottom: 40px; }

        /* Top Nav */
        .surya-topnav { background: #fff; border-bottom: 3px solid #ff630d; height: 58px; display: flex; align-items: center; padding: 0 16px; gap: 12px; position: sticky; top: 0; z-index: 200; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .surya-back-btn { background: #fff5f0; border: 1.5px solid #ffd5c0; border-radius: 8px; color: #ff630d; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
        .surya-back-btn:hover { background: #ff630d; color: #fff; border-color: #ff630d; }
        .surya-nav-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
        .surya-nav-title { font-size: 1rem; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
        .surya-breadcrumb { font-size: 0.7rem; color: #999; }
        .surya-id-badge { background: #fff5f0; color: #ff630d; border: 1.5px solid #ffd5c0; border-radius: 20px; padding: 4px 12px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }

        /* Step Bar */
        .step-bar { background: #fff; padding: 14px 16px; border-bottom: 1px solid #eee; }
        .step-indicator-wrap { display: flex; align-items: center; justify-content: center; max-width: 400px; margin: 0 auto; }
        .step-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .step-circle { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #ddd; background: #f8f8f8; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #aaa; transition: all 0.3s; }
        .step-item.active .step-circle { border-color: #ff630d; background: #ff630d; color: #fff; box-shadow: 0 0 0 4px rgba(255,99,13,0.15); }
        .step-item.done   .step-circle { border-color: #22c55e; background: #22c55e; color: #fff; }
        .step-label { font-size: 0.68rem; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
        .step-item.active .step-label { color: #ff630d; }
        .step-item.done   .step-label { color: #22c55e; }
        .step-line { flex: 1; height: 2px; background: #e0e0e0; margin: 0 8px; margin-bottom: 18px; }
        .step-line.done { background: #22c55e; }

        /* Content */
        .surya-content { max-width: 1400px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        @media (min-width: 768px) { .surya-content { padding: 24px; gap: 16px; } }

        /* Accordion */
        .surya-accordion-item { border: none !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.07); margin-bottom: 0 !important; }
        .surya-accordion-item .accordion-button { background: #fff; padding: 14px 16px; box-shadow: none !important; border-bottom: 1px solid #f0f0f0; }
        .surya-accordion-item .accordion-button:not(.collapsed) { background: linear-gradient(90deg, #fff7f4 0%, #fff 100%); border-bottom: 2px solid #ff630d22; }
        .surya-accordion-item .accordion-body { background: #fff; padding: 16px; }
        @media (min-width: 576px) { .surya-accordion-item .accordion-button { padding: 16px 24px; } .surya-accordion-item .accordion-body { padding: 24px; } }
        .acc-header-inner { display: flex; align-items: center; gap: 12px; width: 100%; }
        .acc-icon-wrap { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .acc-icon-wrap.orange { background: #fff0e8; color: #ff630d; }
        .acc-icon-wrap.blue   { background: #e8f4ff; color: #2563eb; }
        .acc-icon-wrap.green  { background: #e8f9f0; color: #16a34a; }
        .acc-title { font-size: 0.95rem; font-weight: 700; color: #1a1a1a; flex: 1; }
        .accordion-button:not(.collapsed) .acc-title { color: #ff630d; }
        .acc-count-badge { background: #dbeafe !important; color: #1d4ed8 !important; border-radius: 12px; padding: 3px 10px; font-size: 0.72rem; font-weight: 600; }
        .accordion-button::after { flex-shrink: 0; }

        /* Address card */
        .surya-address-card { border: 1.5px solid #e8ecf0; border-radius: 12px; padding: 16px; background: #fafbfc; }
        .address-badge { font-size: 0.78rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Float input */
        .surya-float { position: relative; margin-bottom: 20px; padding-top: 16px; }
        .surya-input { width: 100%; border: none; border-bottom: 1.5px solid #d0d0d0; border-radius: 0; padding: 6px 0; font-size: 0.9rem; color: #1a1a1a; background: transparent; outline: none; transition: border-color 0.2s; font-family: 'DM Sans', sans-serif; }
        .surya-input:focus { border-bottom-color: #ff630d; }
        .form-bar { display: block; height: 2px; width: 0; background: #ff630d; position: absolute; bottom: 0; left: 0; transition: width 0.3s ease; border-radius: 2px; }
        .surya-input:focus ~ .form-bar { width: 100%; }
        .float-label { position: absolute; top: 0; left: 0; font-size: 0.7rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; pointer-events: none; }

        /* Select */
        .surya-select-wrap { padding-top: 16px; margin-bottom: 4px; }
        .surya-select-label { display: block; font-size: 0.7rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }

        /* Textarea */
        .surya-textarea-wrap { margin-bottom: 4px; }
        .surya-textarea-label { display: block; font-size: 0.7rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .surya-textarea { border: 1.5px solid #d0d0d0 !important; border-radius: 8px !important; font-size: 0.9rem !important; resize: none; font-family: 'DM Sans', sans-serif !important; width: 100%; padding: 10px 12px; }
        .surya-textarea:focus { border-color: #ff630d !important; box-shadow: 0 0 0 3px rgba(255,99,13,0.1) !important; outline: none; }

        /* Category chips */
        .surya-cat-section { padding-top: 16px; }
        .surya-cat-label { font-size: 0.7rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
        .surya-cat-chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .surya-cat-chip { border: 1.5px solid #e0e0e0; border-radius: 20px; padding: 5px 14px; font-size: 0.8rem; font-weight: 500; cursor: pointer; color: #666; display: flex; align-items: center; gap: 5px; transition: all 0.2s; user-select: none; }
        .surya-cat-chip:hover  { border-color: #ff630d; color: #ff630d; background: #fff5f0; }
        .surya-cat-chip.active { background: #ff630d; border-color: #ff630d; color: #fff; font-weight: 600; box-shadow: 0 2px 8px rgba(255,99,13,0.3); }

        /* Sub blocks */
        .surya-sub-block { background: #f4f5f7; border: 1.5px solid #eef0f2 !important; border-radius: 10px !important; }
        .contact-badge { font-size: 0.75rem; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .surya-remove-btn { background: none; border: 1.5px solid #fca5a5; border-radius: 6px; color: #ef4444; padding: 4px 10px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 4px; }
        .surya-remove-btn:hover { background: #ef4444; color: #fff; border-color: #ef4444; }
        .surya-add-btn { background: none; border: 1.5px dashed #ccc; border-radius: 8px; color: #666; padding: 8px 18px; font-size: 0.83rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; }
        .surya-add-btn:hover { border-color: #ff630d; color: #ff630d; background: #fff5f0; }

        /* Section divider */
        .surya-section-divider { display: flex; align-items: center; gap: 12px; color: #aaa; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .surya-section-divider::before, .surya-section-divider::after { content: ''; flex: 1; height: 1px; background: #eee; }

        /* Buttons */
        .surya-btn-primary { background: linear-gradient(135deg, #ff630d, #ff8c42) !important; border: none !important; color: #fff !important; font-weight: 700 !important; border-radius: 10px !important; padding: 11px 24px !important; font-size: 0.9rem !important; transition: all 0.2s !important; box-shadow: 0 4px 14px rgba(255,99,13,0.25) !important; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .surya-btn-primary:hover:not(:disabled) { transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(255,99,13,0.35) !important; }
        .surya-btn-primary:disabled { opacity: 0.7 !important; }
        .surya-btn-secondary { background: #fff !important; border: 1.5px solid #ddd !important; color: #555 !important; font-weight: 600 !important; border-radius: 10px !important; padding: 11px 24px !important; font-size: 0.9rem !important; transition: all 0.2s !important; }
        .surya-btn-secondary:hover:not(:disabled) { border-color: #ff630d !important; color: #ff630d !important; }

        /* Same as shipping */
        .surya-same-chip { display: inline-flex; align-items: center; background: #fff8f5; border: 1.5px solid #ffd5c0; border-radius: 10px; padding: 10px 16px; font-size: 0.85rem; font-weight: 500; }
        .surya-same-chip .form-check { margin: 0; }
        .surya-same-chip .form-check-input:checked { background-color: #ff630d !important; border-color: #ff630d !important; }
        .surya-same-chip .form-check-label { cursor: pointer; color: #333; font-weight: 500; }
      `}</style>
    </>
  );
}