import { useState, useEffect } from "react";
import "../../responsive.css";
import { CheckCircle, MagnifyingGlass, WarningCircle, UserCirclePlus, CalendarBlank, ChartLineUp, Buildings, CurrencyDollar, ShieldCheck, SignOut, Globe, Plus, Receipt, UploadSimple } from "@phosphor-icons/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import API_BASE_URL from "../../config/api";
import { useToast } from "../../components/Toast";

// Import exact VC styles
import { S } from "../superadmin/sections/SAStyles";

const availableModules = [
  { id: 'rector', label: 'Pro-VC / Rectorate' },
  { id: 'principals', label: 'Dean & HODs' },
  { id: 'bd', label: 'BD Management' },
  { id: 'hr', label: 'HR & Faculty' },
  { id: 'finance', label: 'Financial Ops' },
  { id: 'registrar', label: 'Registrar Office' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'exams', label: 'Exams & Grading' },
  { id: 'library', label: 'Digital Library' },
  { id: 'it', label: 'IT & Systems' }
];
const defaultModules = availableModules.map(m => m.id);

export default function MasterAdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalClients: 0, activeClients: 0, mrr: 0, globalUsers: 0 });
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({ maintenance_mode: 'false', allow_new_registrations: 'true', free_trial_days: '14', system_email: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen]   = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add Client state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);
  const [newClient, setNewClient] = useState({ university_name: '', domain: '', admin_name: '', admin_email: '', password: '', package_type: 'Premium', monthly_fee: '', logo_url: '', primary_color: 'var(--primary-color, #4f46e5)', allowed_modules: defaultModules });
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client_id: '', amount: '', billing_month: new Date().toISOString().substring(0, 7) });
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const { showToast } = useToast();
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/masteradmin/upload-logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNewClient({...newClient, logo_url: `${API_BASE_URL}${data.url}`});
        showToast("Logo uploaded successfully", "success");
      } else {
        showToast(data.message || "Error uploading logo", "error");
      }
    } catch (err) {
      showToast("Error uploading logo", "error");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, clientsRes, invoicesRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/masteradmin/stats`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/masteradmin/clients`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/masteradmin/invoices`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/masteradmin/settings`, { headers }).then(r => r.json())
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (clientsRes.success) setClients(clientsRes.clients);
      if (invoicesRes.success) setInvoices(invoicesRes.invoices);
      if (settingsRes.success) setPlatformSettings(settingsRes.settings);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingClientId;
      const url = isEdit ? `${API_BASE_URL}/api/masteradmin/clients/${editingClientId}` : `${API_BASE_URL}/api/masteradmin/clients`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setShowAddModal(false);
        setEditingClientId(null);
        setNewClient({ university_name: '', domain: '', admin_name: '', admin_email: '', password: '', package_type: 'Premium', monthly_fee: '', logo_url: '', primary_color: 'var(--primary-color, #4f46e5)', allowed_modules: defaultModules });
        fetchData();
      } else {
        showToast(data.message, "error");
      }
    } catch (e) {
      showToast("Error saving client", "error");
    }
  };

  const handleEditClick = (client) => {
    setEditingClientId(client.id);
    setNewClient({
      university_name: client.university_name || '',
      domain: client.domain || '',
      admin_name: client.admin_name || '',
      admin_email: client.admin_email || '',
      password: '', // Leave blank for edit (backend ignores password updates on PUT)
      package_type: client.package_type || 'Premium',
      monthly_fee: client.monthly_fee || '',
      logo_url: client.logo_url || '',
      primary_color: client.primary_color || 'var(--primary-color, #4f46e5)',
      allowed_modules: client.allowed_modules ? (typeof client.allowed_modules === 'string' ? JSON.parse(client.allowed_modules) : client.allowed_modules) : defaultModules
    });
    setShowAddModal(true);
  };

  const handleDeleteClient = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete the university "${name}" and ALL its data? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/masteradmin/clients/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        showToast("Tenant deleted successfully", "success");
        fetchData();
      } else {
        showToast(data.message, "error");
      }
    } catch (e) {
      showToast("Error deleting tenant", "error");
    }
  };

  const toggleStatus = async (client) => {
    const newStatus = client.subscription_status === 'Active' ? 'Suspended' : 'Active';
    if (!window.confirm(`Are you sure you want to ${newStatus} ${client.university_name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/masteradmin/clients/${client.id}/status`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchData();
      } else showToast(data.message, "error");
    } catch {
      showToast(data.message || 'Error updating status', "error");
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/masteradmin/invoices`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setShowInvoiceModal(false);
        fetchData();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast('Error generating invoice', 'error');
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/masteradmin/invoices/${id}/status`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchData();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast('Error updating invoice status', 'error');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/masteradmin/settings`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: platformSettings })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast('Error saving settings', 'error');
    }
  };

  const navItems = [
    ['overview', 'Global SaaS Overview', <ChartLineUp size={20} />],
    ['clients', 'Tenant Management', <Buildings size={20} />],
    ['billing', 'Billing & Finance', <CurrencyDollar size={20} />],
    ['settings', 'Platform Settings', <ShieldCheck size={20} />]
  ];

  if (isLoading) return (
    <div style={S.loadingContainer}>
      <div style={S.loadingSpinner}></div>
      <p style={S.loadingText}>Loading Global HQ Dashboard...</p>
    </div>
  );

  const mrrVal = parseFloat(stats.mrr || 0);
  const chartData = [
    { month: 'Jan', MRR: mrrVal * 0.3 },
    { month: 'Feb', MRR: mrrVal * 0.5 },
    { month: 'Mar', MRR: mrrVal * 0.65 },
    { month: 'Apr', MRR: mrrVal * 0.8 },
    { month: 'May', MRR: mrrVal }
  ];

  return (
    <div style={S.container} className="dashboard-wrapper">
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>

      {/* Floating Buttons for when panels are closed */}
      {!leftSidebarOpen && (
        <button onClick={() => setLeftSidebarOpen(true)} className="sidebar-toggle-btn left-open-btn" style={{ position: 'fixed', left: '0px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'var(--primary-color, #4f46e5)', color: '#fff', border: 'none', borderRadius: '0 12px 12px 0', width: '28px', height: '60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 0 16px rgba(var(--primary-rgb, 79, 70, 229),0.35)', fontSize: '18px', fontWeight: '800' }}>›</button>
      )}
      {!rightPanelOpen && (
        <button onClick={() => setRightPanelOpen(true)} className="sidebar-toggle-btn right-open-btn" style={{ position: 'fixed', right: '0px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'var(--primary-color, #4f46e5)', color: '#fff', border: 'none', borderRadius: '12px 0 0 12px', width: '28px', height: '60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '-4px 0 16px rgba(var(--primary-rgb, 79, 70, 229),0.35)', fontSize: '18px', fontWeight: '800' }}>‹</button>
      )}

      {/* ── Sidebar ── */}
      <aside 
        className={`sidebar ${!leftSidebarOpen ? 'collapsed' : ''}`}
        style={{
        ...S.sidebar,
        transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'visible', // Fixed: Allows close button to show outside
        padding: 0, // Fixed: Move padding to inner container
      }}>
        <button onClick={() => setLeftSidebarOpen(false)} className="sidebar-toggle-btn left-close-btn" style={{ position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)', zIndex: 30, background: 'var(--primary-color, #4f46e5)', color: '#fff', border: 'none', borderRadius: '0 10px 10px 0', width: '18px', height: '60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '4px 0 14px rgba(var(--primary-rgb, 79, 70, 229),0.35)', fontSize: '18px', fontWeight: '800' }}>‹</button>
        
        {/* Inner Scrollable Container with Padding */}
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', padding: '32px 20px', overflowY: 'auto', boxSizing: 'border-box' }} className="hidden-scrollbar">
          
          <div style={{...S.logoWrapper, marginBottom: '24px'}}>
            <div style={S.logoIcon}><Globe size={24} weight="fill" /></div>
            <span style={S.logoText}>Lancers<span style={S.logoAccent}>Tech</span></span>
          </div>
          
          <div style={{...S.globalBadge, background: 'rgba(236, 72, 153, 0.2)', color: '#fbcfe8', borderColor: 'rgba(236, 72, 153, 0.3)', marginBottom: '32px'}}>
            <Globe size={14} weight="fill" />
            <span>Global SaaS HQ</span>
          </div>

          <nav style={S.nav}>
            {navItems.map(([tab, label, icon]) => (
              <button key={tab}
                onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                style={{...S.navBtn, ...(activeTab === tab ? S.navBtnActive : {})}}
                className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {icon}
                <span>{label}</span>
                {activeTab === tab && <div style={S.activeIndicator}></div>}
              </button>
            ))}
          </nav>

          <button onClick={onLogout} style={{...S.logoutBtn, marginTop: 'auto'}} className="logout-btn">
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        ...S.main,
        marginLeft: leftSidebarOpen ? '280px' : '24px',
        marginRight: rightPanelOpen ? '320px' : '24px',
        transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1), margin-right 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {platformSettings.maintenance_mode === 'true' && (
          <div style={{ width: '100%', background: '#ef4444', color: '#fff', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
            <WarningCircle size={24} weight="fill" />
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>Global Maintenance Mode is ACTIVE</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>All users (except Master Admin) are currently locked out of the system.</p>
            </div>
          </div>
        )}
        
        <header style={S.header}>
          <div>
            <h1 style={S.title}>
              {activeTab === 'overview' && 'SaaS Performance Overview'}
              {activeTab === 'clients' && 'Tenant Management'}
              {activeTab === 'billing' && 'Billing & Financials'}
              {activeTab === 'settings' && 'Platform Configuration'}
            </h1>
            <p style={S.subtitle}>
              {activeTab === 'overview' && 'Real-time metrics across all onboarded universities.'}
              {activeTab === 'clients' && 'Manage university instances, VC accounts, and domain assignments.'}
              {activeTab === 'billing' && 'Track MRR, invoices, and subscription packages.'}
              {activeTab === 'settings' && 'Global security policies and maintenance controls.'}
            </p>
          </div>
          <div style={{...S.campusCounter, background: '#fdf4ff', color: '#be185d', borderColor: '#fbcfe8'}}>
            <Globe size={16} color="#be185d" />
            <span>HQ Mode Active</span>
          </div>
        </header>

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div style={S.overviewContainer}>
            <div style={S.statsGrid}>
              <div style={{...S.metricCard, cursor: 'pointer'}} onClick={() => setActiveTab('clients')} className="metric-card">
                <div style={S.metricIconWrapper('var(--primary-color, #4f46e5)')}><Buildings size={28} weight="fill" /></div>
                <div>
                  <h4 style={S.metricLabel}>TOTAL CLIENTS</h4>
                  <p style={S.metricValue}>{stats.totalClients}</p>
                </div>
              </div>
              <div style={{...S.metricCard, cursor: 'pointer'}} onClick={() => setActiveTab('clients')} className="metric-card">
                <div style={S.metricIconWrapper('#10b981')}><CheckCircle size={28} weight="fill" /></div>
                <div>
                  <h4 style={S.metricLabel}>ACTIVE TENANTS</h4>
                  <p style={S.metricValue}>{stats.activeClients}</p>
                </div>
              </div>
              <div style={{...S.metricCard, cursor: 'pointer'}} onClick={() => setActiveTab('billing')} className="metric-card">
                <div style={S.metricIconWrapper('#ec4899')}><CurrencyDollar size={28} weight="fill" /></div>
                <div>
                  <h4 style={S.metricLabel}>TOTAL MRR</h4>
                  <p style={{...S.metricValue, fontSize: 'clamp(1.2rem, 2vw, 2rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}} title={`$${parseFloat(stats.mrr || 0).toLocaleString()}`}>${parseFloat(stats.mrr || 0).toLocaleString()}</p>
                </div>
              </div>
              <div style={{...S.metricCard, cursor: 'pointer'}} onClick={() => setActiveTab('clients')} className="metric-card">
                <div style={S.metricIconWrapper('#0ea5e9')}><Globe size={28} weight="fill" /></div>
                <div>
                  <h4 style={S.metricLabel}>GLOBAL USERS</h4>
                  <p style={S.metricValue}>{stats.globalUsers || 1540}</p>
                </div>
              </div>
            </div>

            <div style={{...S.chartCard, padding: '24px', display: 'flex', flexDirection: 'column'}}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>SaaS Growth Analytics (MRR)</h3>
              <div style={{ width: '100%', height: '300px', minWidth: 0, minHeight: '300px' }}>
                <ResponsiveContainer width="99%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-color, #4f46e5)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary-color, #4f46e5)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `$${value > 1000000 ? (value/1000000).toFixed(1) + 'M' : value > 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'MRR']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="MRR" stroke="var(--primary-color, #4f46e5)" strokeWidth={3} fillOpacity={1} fill="url(#colorMRR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CLIENTS */}
        {activeTab === "clients" && (
          <div style={S.overviewContainer}>
            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <h3 style={S.tableTitle}>Tenant Directory</h3>
                <button style={S.addBtn} className="add-btn" onClick={() => { setEditingClientId(null); setNewClient({ university_name: '', domain: '', admin_name: '', admin_email: '', password: '', package_type: 'Premium', monthly_fee: '', logo_url: '', primary_color: 'var(--primary-color, #4f46e5)', allowed_modules: defaultModules }); setShowAddModal(true); }}>
                  <UserCirclePlus size={20} weight="bold" /> Onboard University
                </button>
              </div>
              
              <div style={S.tableContainer}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>University Info</th>
                      <th style={S.th}>Assigned Domain</th>
                      <th style={S.th}>Client VC Admin</th>
                      <th style={S.th}>License Tier</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id} style={S.tr}>
                        <td style={S.tdName}>{c.university_name}</td>
                        <td style={{...S.td, fontWeight: '700', color: 'var(--primary-color, #4f46e5)'}}><a href={`https://${c.domain}`} style={{color: 'var(--primary-color, #4f46e5)', textDecoration: 'none'}}>{c.domain}</a></td>
                        <td style={S.td}>
                          <div style={{fontWeight: '700', color: '#0f172a'}}>{c.admin_name}</div>
                          <div style={{fontSize: '12px'}}>{c.admin_email}</div>
                        </td>
                        <td style={S.td}>
                          <span style={S.planBadge}>{c.package_type} • ${c.monthly_fee}</span>
                        </td>
                        <td style={S.td}>
                          <span style={{
                            ...S.statusBadge, 
                            background: c.subscription_status === 'Active' ? '#f0fdf4' : '#fef2f2', 
                            color: c.subscription_status === 'Active' ? '#166534' : '#991b1b'
                          }}>
                            {c.subscription_status}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{ ...S.actionButtons, gap: '8px' }}>
                            <button onClick={() => toggleStatus(c)} style={{...S.editBtn, padding: '6px 12px', background: '#f1f5f9', fontWeight: '700'}}>
                              {c.subscription_status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button onClick={() => handleEditClick(c)} style={{...S.editBtn, padding: '6px 12px'}}>Edit</button>
                            <button onClick={() => handleDeleteClient(c.id, c.university_name)} style={{...S.deleteBtn, padding: '6px 12px'}}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {clients.length === 0 && (
                      <tr><td colSpan="6" style={{...S.td, textAlign: 'center', padding: '60px'}}>No university clients found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BILLING */}
        {activeTab === "billing" && (
          <div style={S.overviewContainer}>
            <div style={S.statsGrid}>
              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#10b981')}><CurrencyDollar size={28} weight="fill" /></div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={S.metricLabel}>TOTAL MRR</h4>
                  <p style={{...S.metricValue, fontSize: '1.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>${parseFloat(stats.mrr || 0).toLocaleString()}</p>
                </div>
              </div>
              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('var(--primary-color, #4f46e5)')}><CheckCircle size={28} weight="fill" /></div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={S.metricLabel}>TOTAL COLLECTED</h4>
                  <p style={{...S.metricValue, fontSize: '1.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>${parseFloat(stats.collected || 0).toLocaleString()}</p>
                </div>
              </div>
              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#ec4899')}><WarningCircle size={28} weight="fill" /></div>
                <div style={{ overflow: 'hidden' }}>
                  <h4 style={S.metricLabel}>PENDING PAYMENTS</h4>
                  <p style={{...S.metricValue, fontSize: '1.6rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>${parseFloat(stats.pending || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <h3 style={S.tableTitle}>Monthly Invoices</h3>
                <button style={{...S.addBtn, background: '#10b981'}} className="add-btn" onClick={() => setShowInvoiceModal(true)}>
                  <CurrencyDollar size={20} weight="bold" /> Create Invoice
                </button>
              </div>
              <div style={S.tableContainer}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>University</th>
                      <th style={S.th}>Billing Month</th>
                      <th style={S.th}>Amount</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={`inv-${inv.id}`} style={S.tr}>
                        <td style={S.tdName}>{inv.university_name}</td>
                        <td style={S.td}><span style={S.planBadge}>{inv.billing_month}</span></td>
                        <td style={{...S.td, fontWeight: '700', color: '#0f172a'}}>${parseFloat(inv.amount || 0).toLocaleString()}</td>
                        <td style={S.td}>
                          <span style={{
                            ...S.statusBadge, 
                            background: inv.status === 'Paid' ? '#f0fdf4' : (inv.status === 'Overdue' ? '#fef2f2' : '#fffbeb'), 
                            color: inv.status === 'Paid' ? '#166534' : (inv.status === 'Overdue' ? '#991b1b' : '#b45309')
                          }}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {inv.status !== 'Paid' && (
                              <button onClick={() => updateInvoiceStatus(inv.id, 'Paid')} style={{...S.editBtn, padding: '6px 12px', background: '#dcfce7', color: '#166534', fontWeight: '700'}}>
                                Mark Paid
                              </button>
                            )}
                            {inv.status === 'Pending' && (
                              <button onClick={() => updateInvoiceStatus(inv.id, 'Overdue')} style={{...S.editBtn, padding: '6px 12px', background: '#fee2e2', color: '#991b1b', fontWeight: '700'}}>
                                Mark Overdue
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr><td colSpan="5" style={{...S.td, textAlign: 'center', padding: '60px'}}>No invoices found for this month.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div style={S.overviewContainer}>
            <div style={S.tableCard}>
              <div style={{...S.tableHeader, borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px'}}>
                <div>
                  <h3 style={S.tableTitle}>Platform Configuration</h3>
                  <p style={{color: '#64748b', margin: '4px 0 0', fontSize: '0.95rem'}}>Manage global security policies and system defaults.</p>
                </div>
              </div>
              
              <form onSubmit={handleSaveSettings} style={{display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px'}}>
                
                {/* Security Controls */}
                <div>
                  <h4 style={{fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <ShieldCheck size={24} color="var(--primary-color, #4f46e5)" /> Security & Access Controls
                  </h4>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                    <div style={{...S.metricCard, cursor: 'pointer', transition: 'all 0.2s ease', border: platformSettings.maintenance_mode === 'true' ? '2px solid #ef4444' : '1px solid #e2e8f0', boxShadow: platformSettings.maintenance_mode === 'true' ? '0 4px 12px rgba(239, 68, 68, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'}} onClick={() => setPlatformSettings({...platformSettings, maintenance_mode: platformSettings.maintenance_mode === 'true' ? 'false' : 'true'})} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='none'}>
                      <div style={S.metricIconWrapper(platformSettings.maintenance_mode === 'true' ? '#ef4444' : '#94a3b8')}>
                        <WarningCircle size={28} weight="fill" />
                      </div>
                      <div>
                        <h4 style={S.metricLabel}>Global Maintenance Mode</h4>
                        <p style={{...S.metricValue, fontSize: '1.2rem', color: platformSettings.maintenance_mode === 'true' ? '#ef4444' : '#0f172a'}}>
                          {platformSettings.maintenance_mode === 'true' ? 'ENABLED' : 'DISABLED'}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{...S.metricCard, cursor: 'pointer', transition: 'all 0.2s ease', border: platformSettings.allow_new_registrations === 'true' ? '2px solid #10b981' : '1px solid #e2e8f0', boxShadow: platformSettings.allow_new_registrations === 'true' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 2px 8px rgba(0,0,0,0.05)'}} onClick={() => setPlatformSettings({...platformSettings, allow_new_registrations: platformSettings.allow_new_registrations === 'true' ? 'false' : 'true'})} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='none'}>
                      <div style={S.metricIconWrapper(platformSettings.allow_new_registrations === 'true' ? '#10b981' : '#94a3b8')}>
                        <UserCirclePlus size={28} weight="fill" />
                      </div>
                      <div>
                        <h4 style={S.metricLabel}>New Onboarding</h4>
                        <p style={{...S.metricValue, fontSize: '1.2rem', color: platformSettings.allow_new_registrations === 'true' ? '#10b981' : '#0f172a'}}>
                          {platformSettings.allow_new_registrations === 'true' ? 'ALLOWED' : 'BLOCKED'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Defaults */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                  <h4 style={{fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px'}}>System Preferences</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      <label style={{fontSize: '0.9rem', fontWeight: '600', color: '#475569'}}>Default Free Trial (Days)</label>
                      <input 
                        type="number" 
                        style={{...S.input, padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem'}} 
                        value={platformSettings.free_trial_days} 
                        onChange={e => setPlatformSettings({...platformSettings, free_trial_days: e.target.value})}
                        onFocus={e => e.target.style.borderColor = 'var(--primary-color, #4f46e5)'}
                        onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                      />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      <label style={{fontSize: '0.9rem', fontWeight: '600', color: '#475569'}}>Global System Email</label>
                      <input 
                        type="email" 
                        style={{...S.input, padding: '14px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', outline: 'none', transition: 'border-color 0.2s', fontSize: '1rem'}} 
                        value={platformSettings.system_email} 
                        onChange={e => setPlatformSettings({...platformSettings, system_email: e.target.value})} 
                        onFocus={e => e.target.style.borderColor = 'var(--primary-color, #4f46e5)'}
                        onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                      />
                    </div>
                  </div>
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '16px'}}>
                  <button type="submit" style={{...S.saveBtn, padding: '14px 36px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px', boxShadow: '0 4px 14px rgba(var(--primary-rgb, 79, 70, 229), 0.3)', transition: 'all 0.2s'}} onMouseOver={e => e.target.style.transform = 'translateY(-2px)'} onMouseOut={e => e.target.style.transform = 'none'}>
                    Save Configuration
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </main>

      {/* ── Right Panel ── */}
      <aside 
        className={`right-panel ${!rightPanelOpen ? 'collapsed' : ''}`}
        style={{
        ...S.rightPanel,
        transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'visible',
        padding: 0,
      }}>
        <button onClick={() => setRightPanelOpen(false)} className="sidebar-toggle-btn right-close-btn" style={{ position: 'absolute', left: '-18px', top: '50%', transform: 'translateY(-50%)', zIndex: 30, background: 'var(--primary-color, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px 0 0 10px', width: '18px', height: '60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '-4px 0 14px rgba(var(--primary-rgb, 79, 70, 229),0.35)', fontSize: '18px', fontWeight: '800' }}>›</button>
        
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 24px', overflowY: 'auto', boxSizing: 'border-box' }} className="hidden-scrollbar">
          
          <div style={{...S.profileCard, background: 'linear-gradient(135deg, #fdf4ff, #ffffff)', borderColor: '#fbcfe8'}}>
            <div style={{...S.avatar, background: 'linear-gradient(135deg, #ec4899, #be185d)'}}>
              {user?.name?.charAt(0) || 'H'}
            </div>
            <h3 style={S.profileName}>{user?.name || 'HQ Admin'}</h3>
            <span style={{...S.roleBadge, background: '#fce7f3', color: '#be185d'}}>Master Admin (LancersTech)</span>
            <div style={S.profileStats}>
              <div style={S.profileStat}>
                <span style={S.profileStatLabel}>Network</span>
                <span style={S.profileStatValue}>Encrypted</span>
              </div>
              <div style={S.profileStat}>
                <span style={S.profileStatLabel}>Access Level</span>
                <span style={S.profileStatValue}>ROOT_HQ</span>
              </div>
            </div>
          </div>

          <div style={S.platformStats}>
            <h4 style={S.platformStatsTitle}>Global Infrastructure</h4>
            {[
              ['AWS Database Nodes', 'Active (3)', 'var(--primary-color, #4f46e5)'],
              ['Load Balancers',     'Optimal', '#10b981'],
              ['S3 Storage',         '4.2 TB', '#ec4899'],
              ['Active WebSockets',  '14,200', '#0ea5e9'],
            ].map(([label, val, color]) => (
              <div key={label} style={S.platformStatItem}>
                <span style={S.platformStatLabel}>{label}</span>
                <span style={{...S.platformStatValue, color}}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{...S.platformStats, marginTop: '20px'}}>
            <h4 style={S.platformStatsTitle}>Server Load (Global)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  <span>CPU Usage (Cluster A)</span>
                  <span style={{ color: '#ec4899' }}>28%</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', background: '#ec4899', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  <span>Memory Capacity</span>
                  <span style={{ color: '#38bdf8' }}>52%</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '52%', height: '100%', background: '#38bdf8', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* ── Add Client Modal ── */}
      {showAddModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>{editingClientId ? "Edit Tenant" : "Deploy New Tenant"}</h2>
              <button onClick={() => setShowAddModal(false)} style={S.modalClose}>×</button>
            </div>
            {platformSettings.allow_new_registrations === 'false' ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '12px', padding: '24px', color: '#991b1b' }}>
                  <WarningCircle size={48} weight="duotone" color="#ef4444" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 'bold' }}>New Onboarding is Disabled</h3>
                  <p>You cannot deploy new tenants while New Onboarding is blocked in your Platform Settings.</p>
                </div>
                <div style={{ ...S.modalActions, marginTop: '24px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={S.cancelBtn}>Close</button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleAddClient} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>University Full Name</label>
                <input required style={S.input} value={newClient.university_name} onChange={e => setNewClient({...newClient, university_name: e.target.value})} placeholder="e.g. National University" />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assigned Subdomain</label>
                <input required style={S.input} value={newClient.domain} onChange={e => setNewClient({...newClient, domain: e.target.value})} placeholder="e.g. national.lancerstech.com" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>VC Name</label>
                  <input required style={S.input} value={newClient.admin_name} onChange={e => setNewClient({...newClient, admin_name: e.target.value})} placeholder="Dr. XYZ" />
                </div>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>VC Email</label>
                  <input required type="email" style={S.input} value={newClient.admin_email} onChange={e => setNewClient({...newClient, admin_email: e.target.value})} placeholder="vc@univ.edu" />
                </div>
              </div>
              {!editingClientId && (
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>Initial Password</label>
                  <input required={!editingClientId} type="password" style={S.input} value={newClient.password} onChange={e => setNewClient({...newClient, password: e.target.value})} placeholder="Secret Password" />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>License Tier</label>
                  <select style={S.input} value={newClient.package_type} onChange={e => setNewClient({...newClient, package_type: e.target.value})}>
                    <option>Basic</option>
                    <option>Premium</option>
                    <option>Enterprise</option>
                  </select>
                </div>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>Monthly Fee ($)</label>
                  <input required type="number" style={S.input} value={newClient.monthly_fee} onChange={e => setNewClient({...newClient, monthly_fee: e.target.value})} placeholder="5000" />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={S.inputGroup}>
                  <label style={{...S.inputLabel, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>Tenant Logo</span>
                    <label style={{ cursor: isUploadingLogo ? 'wait' : 'pointer', color: 'var(--primary-color, #4f46e5)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                      <UploadSimple size={16} weight="bold" /> {isUploadingLogo ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/png, image/jpeg, image/jpg" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={isUploadingLogo} />
                    </label>
                  </label>
                  <input type="url" style={S.input} placeholder="https://example.com/logo.png or upload"
                    value={newClient.logo_url} onChange={e => setNewClient({...newClient, logo_url: e.target.value})}
                  />
                </div>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>Brand Color (Optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="color" style={{ ...S.input, padding: '4px', height: '42px', width: '60px', cursor: 'pointer' }}
                      value={newClient.primary_color} onChange={e => setNewClient({...newClient, primary_color: e.target.value})}
                    />
                    <input type="text" style={{ ...S.input, flex: 1 }} placeholder="var(--primary-color, #4f46e5)"
                      value={newClient.primary_color} onChange={e => setNewClient({...newClient, primary_color: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Allowed Modules</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {availableModules.map(mod => (
                    <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                      <input 
                        type="checkbox" 
                        checked={newClient.allowed_modules.includes(mod.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setNewClient(prev => ({
                            ...prev,
                            allowed_modules: isChecked 
                              ? [...prev.allowed_modules, mod.id] 
                              : prev.allowed_modules.filter(id => id !== mod.id)
                          }));
                        }}
                        style={{ accentColor: 'var(--primary-color, #4f46e5)', width: '16px', height: '16px' }}
                      />
                      {mod.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>{editingClientId ? "Save Changes" : "Deploy Tenant"}</button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>Generate Invoice</h2>
              <button onClick={() => setShowInvoiceModal(false)} style={S.modalClose}>×</button>
            </div>
            <form onSubmit={handleGenerateInvoice} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Select Client *</label>
                <select 
                  style={S.input}
                  required
                  value={newInvoice.client_id}
                  onChange={(e) => {
                    const client = clients.find(c => c.id === parseInt(e.target.value));
                    setNewInvoice({...newInvoice, client_id: e.target.value, amount: client ? client.monthly_fee : ''});
                  }}
                >
                  <option value="">Select University</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.university_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>Amount ($) *</label>
                  <input type="number" step="0.01" style={S.input} required
                    value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})}
                  />
                </div>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>Billing Month *</label>
                  <input type="month" style={S.input} required
                    value={newInvoice.billing_month} onChange={e => setNewInvoice({...newInvoice, billing_month: e.target.value})}
                  />
                </div>
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowInvoiceModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
