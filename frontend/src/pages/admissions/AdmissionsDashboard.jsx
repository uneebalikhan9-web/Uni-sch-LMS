import React, { useState, useEffect } from 'react';
import { 
  House, Funnel, Users, Checks, Scroll, Calendar, Bell, 
  UserCircle, List, X, SignOut, ChatCircle, GraduationCap, 
  ShieldCheck, UserPlus, Receipt, Printer, CurrencyDollar,
  CheckCircle, Buildings, IdentificationCard, Phone, MapPin
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './admissions.css';

// Modular Sections
import AdmissionsOverview from './sections/AdmissionsOverview';
import AdmissionsPipeline from './sections/AdmissionsPipeline';
import AdmissionsApplicants from './sections/AdmissionsApplicants';

const AdmissionsDashboard = ({ user, onLogout }) => {
  const schoolLogo = user?.logo_url || localStorage.getItem('tenant_logo') || localStorage.getItem('logo_url') || sessionStorage.getItem('tenant_logo');
  const navigate = useNavigate();
  
  // Navigation & UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeNav, setActiveNav] = useState('overview');
  const { showToast } = useToast();
  
  // Data States
  const [stats, setStats] = useState({ totalInquiries: 0, pendingFee: 0, feeVerified: 0, admitted: 0, totalRevenue: 0 });
  const [pipeline, setPipeline] = useState({ pending_fee: [], fee_verified: [], admitted: [], rejected: [] });
  const [applicants, setApplicants] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Walk-in modal & Challan modal states
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [selectedChallanStudent, setSelectedChallanStudent] = useState(null);

  const initialInquiryForm = {
    full_name: '',
    father_name: '',
    dob: '',
    gender: 'Male',
    bform_number: '',
    father_cnic: '',
    phone: '',
    father_phone: '',
    email: '',
    address: '',
    city: 'Lahore',
    target_class: 'Class 1',
    campus_id: user?.campus_id || 1,
    admission_fee: 5000,
    last_qualification: '',
    notes: ''
  };

  const [inquiryForm, setInquiryForm] = useState(initialInquiryForm);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, pipeRes, appRes, campRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admissions/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/pipeline`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/applicants`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/campuses`, { headers }).catch(() => ({ data: { campuses: [] } }))
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (pipeRes.data?.success) setPipeline(pipeRes.data.pipeline);
      if (appRes.data?.success) setApplicants(appRes.data.applicants);
      if (campRes.data?.success && Array.isArray(campRes.data.campuses)) {
        setCampuses(campRes.data.campuses);
        if (campRes.data.campuses.length > 0) {
          setInquiryForm(prev => ({ ...prev, campus_id: prev.campus_id || campRes.data.campuses[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching admission data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Walk-in registration
  const handleSaveInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryForm.full_name || !inquiryForm.father_name || !inquiryForm.target_class) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setSubmittingInquiry(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/admissions/inquiry`,
        inquiryForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showToast('Walk-in applicant registered successfully!', 'success');
        setShowWalkinModal(false);
        
        // Open challan for immediate printing
        const registeredStudent = {
          ...inquiryForm,
          id: res.data.inquiryId,
          created_at: new Date().toISOString(),
          campus_name: campuses.find(c => c.id === parseInt(inquiryForm.campus_id))?.name || 'Main Campus'
        };
        setSelectedChallanStudent(registeredStudent);
        setShowChallanModal(true);

        setInquiryForm(initialInquiryForm);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error creating inquiry:', err);
      showToast(err.response?.data?.message || 'Error registering applicant', 'error');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Handle fast fee clearance from Admissions Desk
  const handleClearFee = async (applicantId) => {
    if (!window.confirm('Confirm receiving admission fee payment for this student?')) return;
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE_URL}/api/admissions/${applicantId}/fee-clearance`,
        { payment_method: 'Admissions Desk Cash' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        showToast('Fee payment recorded & forwarded to Principal!', 'success');
        fetchAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error verifying fee', 'error');
    }
  };

  const handlePrintChallan = (student) => {
    setSelectedChallanStudent(student);
    setShowChallanModal(true);
  };

  const gradesList = [
    'Playgroup', 'Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3',
    'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Matric (Science)', 'Matric (Arts)',
    'FSc (Pre-Medical)', 'FSc (Pre-Engineering)', 'ICS (Computer Science)', 'I.Com (Commerce)', 'FA (Humanities)',
    'O-Levels', 'A-Levels'
  ];

  return (
    <div className="adm-dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      
      {/* SIDEBAR NAVIGATION */}
      <div style={{
        width: isMobile ? (sidebarOpen ? '280px' : '0') : '270px',
        background: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        boxShadow: '10px 0 25px rgba(0,0,0,0.1)'
      }}>
        {/* Brand Header */}
        <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {schoolLogo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <img 
                src={schoolLogo} 
                alt="College Logo" 
                style={{ maxHeight: '48px', maxWidth: '140px', width: 'auto', height: 'auto', objectFit: 'contain' }} 
              />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>
                  Admissions Desk
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  COLLEGE ADMISSIONS
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', color: '#fff', boxShadow: '0 4px 12px rgba(var(--primary-rgb, 79, 70, 229), 0.4)',
                flexShrink: 0
              }}>
                <GraduationCap size={24} weight="duotone" />
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
                  Admissions Desk
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  College Admissions
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nav Links */}
        <div style={{ padding: '16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => { setActiveNav('overview'); if (isMobile) setSidebarOpen(false); }}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: activeNav === 'overview' ? 'var(--primary-color, #4f46e5)' : 'transparent',
              color: activeNav === 'overview' ? '#fff' : '#94a3b8',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
            }}
          >
            <House size={20} weight={activeNav === 'overview' ? 'fill' : 'regular'} /> Overview & Stats
          </button>

          <button
            onClick={() => { setActiveNav('pipeline'); if (isMobile) setSidebarOpen(false); }}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: activeNav === 'pipeline' ? 'var(--primary-color, #4f46e5)' : 'transparent',
              color: activeNav === 'pipeline' ? '#fff' : '#94a3b8',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
            }}
          >
            <Funnel size={20} weight={activeNav === 'pipeline' ? 'fill' : 'regular'} /> Live Funnel & Pipeline
          </button>

          <button
            onClick={() => { setActiveNav('applicants'); if (isMobile) setSidebarOpen(false); }}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none',
              background: activeNav === 'applicants' ? 'var(--primary-color, #4f46e5)' : 'transparent',
              color: activeNav === 'applicants' ? '#fff' : '#94a3b8',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
            }}
          >
            <Users size={20} weight={activeNav === 'applicants' ? 'fill' : 'regular'} /> All Applicants Directory
          </button>
        </div>

        {/* User Card & Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.1)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800'
              }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>{user?.name || 'Admission Officer'}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Admissions Desk</div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px' }}
              title="Sign Out"
            >
              <SignOut size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* TOP BAR */}
        <div style={{
          height: '70px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ background: 'transparent', border: 'none', color: '#0f172a', cursor: 'pointer' }}
              >
                <List size={24} weight="bold" />
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
              {activeNav === 'overview' && 'Admissions Dashboard'}
              {activeNav === 'pipeline' && 'College Admissions Pipeline'}
              {activeNav === 'applicants' && 'Student Applicants Directory'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setShowWalkinModal(true)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--primary-color, #4f46e5)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(var(--primary-rgb, 79, 70, 229), 0.3)'
              }}
            >
              <UserPlus size={18} weight="bold" /> + New Walk-in Admission
            </button>
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Loading Admissions Desk...</div>
              <p style={{ fontSize: '0.85rem' }}>Fetching live school applicants and financial records.</p>
            </div>
          ) : (
            <>
              {activeNav === 'overview' && (
                <AdmissionsOverview 
                  stats={stats} 
                  pipeline={pipeline} 
                  onOpenWalkin={() => setShowWalkinModal(true)}
                  onViewPipeline={() => setActiveNav('pipeline')}
                />
              )}

              {activeNav === 'pipeline' && (
                <AdmissionsPipeline 
                  pipeline={pipeline}
                  onPrintChallan={handlePrintChallan}
                  onClearFee={handleClearFee}
                />
              )}

              {activeNav === 'applicants' && (
                <AdmissionsApplicants 
                  applicants={applicants}
                  onPrintChallan={handlePrintChallan}
                  onClearFee={handleClearFee}
                />
              )}
            </>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* 1. WALK-IN ADMISSION MODAL                                */}
      {/* ======================================================== */}
      {showWalkinModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              borderRadius: '24px 24px 0 0'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                  Register Walk-in Student Admission
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#c7d2fe' }}>
                  Registers applicant details & auto-generates 3-copy Admission Fee Challan.
                </p>
              </div>
              <button 
                onClick={() => setShowWalkinModal(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', color: '#fff', padding: '6px', cursor: 'pointer' }}
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveInquiry} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Section 1: Student Information */}
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-color, #4f46e5)', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  Student Personal Profile
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Student Full Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Muhammad Hamza"
                      value={inquiryForm.full_name}
                      onChange={e => setInquiryForm({ ...inquiryForm, full_name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Gender</label>
                    <select
                      value={inquiryForm.gender}
                      onChange={e => setInquiryForm({ ...inquiryForm, gender: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Date of Birth</label>
                    <input 
                      type="date" 
                      value={inquiryForm.dob}
                      onChange={e => setInquiryForm({ ...inquiryForm, dob: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>B-Form / CNIC Number</label>
                    <input 
                      type="text" 
                      placeholder="35201-XXXXXXX-X"
                      value={inquiryForm.bform_number}
                      onChange={e => setInquiryForm({ ...inquiryForm, bform_number: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Father / Guardian Details */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-color, #4f46e5)', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  Parent / Guardian Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Father Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Tariq Mehmood"
                      value={inquiryForm.father_name}
                      onChange={e => setInquiryForm({ ...inquiryForm, father_name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Father CNIC</label>
                    <input 
                      type="text" 
                      placeholder="35201-XXXXXXX-X"
                      value={inquiryForm.father_cnic}
                      onChange={e => setInquiryForm({ ...inquiryForm, father_cnic: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Phone / WhatsApp *</label>
                    <input 
                      required
                      type="text" 
                      placeholder="0300-XXXXXXX"
                      value={inquiryForm.phone}
                      onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value, father_phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Residential Address</label>
                    <input 
                      type="text" 
                      placeholder="House #, Street, City"
                      value={inquiryForm.address}
                      onChange={e => setInquiryForm({ ...inquiryForm, address: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Grade & Branch Selection */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-color, #4f46e5)', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  Academic Class & Fee Setup
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Target Grade / Class *</label>
                    <select
                      value={inquiryForm.target_class}
                      onChange={e => setInquiryForm({ ...inquiryForm, target_class: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    >
                      {gradesList.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Branch / Campus</label>
                    <select
                      value={inquiryForm.campus_id || (campuses.length > 0 ? campuses[0].id : 1)}
                      onChange={e => setInquiryForm({ ...inquiryForm, campus_id: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                    >
                      {campuses && campuses.length > 0 ? (
                        campuses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.location ? `(${c.location})` : ''}
                          </option>
                        ))
                      ) : (
                        <option value={user?.campus_id || 1}>Main Branch</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Admission Fee (PKR)</label>
                    <input 
                      type="number" 
                      value={inquiryForm.admission_fee}
                      onChange={e => setInquiryForm({ ...inquiryForm, admission_fee: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  style={{
                    padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1',
                    background: '#ffffff', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInquiry}
                  style={{
                    padding: '10px 24px', borderRadius: '12px', border: 'none',
                    background: 'var(--primary-color, #4f46e5)', color: '#ffffff', fontWeight: '800',
                    fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <Receipt size={18} weight="bold" /> {submittingInquiry ? 'Registering...' : 'Register & Generate Challan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. THREE-COPY PRINTABLE ADMISSION FEE CHALLAN MODAL      */}
      {/* ======================================================== */}
      {showChallanModal && selectedChallanStudent && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '950px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Actions Bar (Hidden on Print) */}
            <div className="no-print" style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                  Official 3-Copy Admission Fee Voucher
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                  Print or save as PDF for Bank, College Accounts & Parent.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary-color, #4f46e5)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={16} weight="bold" /> Print 3-Copy Voucher
                </button>
                <button
                  onClick={() => setShowChallanModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable 3-Copy Layout */}
            <div id="printable-challan" style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              background: '#ffffff'
            }}>
              {['BANK COPY', 'COLLEGE ACCOUNTS COPY', 'PARENT / STUDENT COPY'].map((copyTitle, cIdx) => (
                <div key={copyTitle} style={{
                  border: '1.5px dashed #94a3b8',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#fafafa',
                  fontSize: '11px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {/* Copy Header */}
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}>LANCERS TECH COLLEGE</div>
                    <div style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>ADMISSION FEE CHALLAN</div>
                    <div style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#e2e8f0',
                      color: '#0f172a',
                      fontWeight: '800',
                      fontSize: '9px'
                    }}>
                      {copyTitle}
                    </div>
                  </div>

                  {/* Challan Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Challan No:</span>
                      <strong style={{ color: '#0f172a' }}>ADM-{selectedChallanStudent.id || '001'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Issue Date:</span>
                      <strong>{new Date().toLocaleDateString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Due Date:</span>
                      <strong style={{ color: '#b91c1c' }}>{new Date(Date.now() + 7*86400000).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Student:</span>
                      <strong style={{ color: '#0f172a' }}>{selectedChallanStudent.full_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Father:</span>
                      <strong>{selectedChallanStudent.father_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Target Class:</span>
                      <strong style={{ color: 'var(--primary-color, #4f46e5)' }}>{selectedChallanStudent.target_class}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>B-Form #:</span>
                      <strong>{selectedChallanStudent.bform_number || selectedChallanStudent.cnic || '—'}</strong>
                    </div>
                  </div>

                  {/* Fee Items Table */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span>Admission / Registration</span>
                      <strong>Rs. {(selectedChallanStudent.admission_fee || 5000).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <span>Prospectus & ID Card</span>
                      <strong>Rs. 500</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 2px', fontWeight: '900', fontSize: '12px', color: '#0f172a' }}>
                      <span>TOTAL PAYABLE</span>
                      <span>Rs. {((parseFloat(selectedChallanStudent.admission_fee) || 5000) + 500).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #cbd5e1' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: '18px' }}></div>
                      <span style={{ fontSize: '8px', color: '#64748b', borderTop: '1px solid #94a3b8', display: 'block', paddingTop: '2px' }}>Cashier / Bank</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ height: '18px' }}></div>
                      <span style={{ fontSize: '8px', color: '#64748b', borderTop: '1px solid #94a3b8', display: 'block', paddingTop: '2px' }}>Authorized Officer</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdmissionsDashboard;
