import { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import { 
  Buildings, UserCircle, IdentificationCard, ChartLine, 
  Calendar, MapPin, Users, ChalkboardTeacher, ArrowRight, 
  Sparkle, ShieldCheck, CaretRight, X, Spinner, MagnifyingGlass,
  BookOpen, Phone, EnvelopeSimple, Student, User, WarningCircle, CheckCircle
} from "@phosphor-icons/react";
import { S } from "./SAStyles";
import API_BASE_URL from "../../../config/api";

export default function SAOverview({ 
  overview = {}, 
  departmentStats = [], 
  setActiveTab,
  isSchool = true 
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // In-Place Branch Details Modal State
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBranchDetails = async (branch) => {
    setSelectedBranch(branch);
    setLoadingDetails(true);
    setActiveSubTab('overview');
    setSearchQuery('');
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/superadmin/campuses/${branch.id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBranchDetails(data.details);
      } else {
        setBranchDetails(null);
      }
    } catch (err) {
      console.error('Error fetching branch details:', err);
      setBranchDetails(null);
    }
    setLoadingDetails(false);
  };

  useEffect(() => {
    if (chartRef.current && departmentStats.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: departmentStats.map(c => c.campus_name || c.name || 'Branch'),
          datasets: [
            { 
              label: 'Enrolled Students', 
              data: departmentStats.map(c => c.students || 0), 
              backgroundColor: 'rgba(79, 70, 229, 0.85)',
              hoverBackgroundColor: 'rgba(79, 70, 229, 1)',
              borderRadius: 8,
              barPercentage: 0.5,
            },
            { 
              label: 'Faculty Teachers', 
              data: departmentStats.map(c => c.teachers || 0), 
              backgroundColor: 'rgba(147, 51, 234, 0.85)',
              hoverBackgroundColor: 'rgba(147, 51, 234, 1)',
              borderRadius: 8,
              barPercentage: 0.5,
            },
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { 
              position: 'top',
              labels: { 
                font: { family: "'Plus Jakarta Sans', sans-serif", weight: 700, size: 12 },
                usePointStyle: true,
                padding: 16
              } 
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 10
            }
          }, 
          scales: { 
            y: { 
              beginAtZero: true, 
              grid: { color: 'rgba(226, 232, 240, 0.6)' },
              ticks: { font: { weight: 600 } }
            },
            x: { 
              grid: { display: false },
              ticks: { font: { weight: 700 } }
            }
          } 
        }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [departmentStats]);

  const branchesCount = departmentStats.length || overview.totalCampuses || 0;
  const totalStudents = overview.totalStudents || departmentStats.reduce((sum, b) => sum + (b.students || 0), 0);
  const totalTeachers = overview.totalTeachers || departmentStats.reduce((sum, b) => sum + (b.teachers || 0), 0);

  // Filtered lists for modal search
  const filteredTeachers = (branchDetails?.teachers || []).filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone?.includes(searchQuery)
  );

  const filteredStudents = (branchDetails?.students || []).filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.father_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.program_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClasses = (branchDetails?.classes || []).filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.room_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={S.overviewContainer}>
      
      {/* 1. TOP STATS KPI CARDS */}
      <div style={S.statsGrid} className="stats-grid">
        {[
          ['Total Active Branches', branchesCount, 'var(--primary-color, #4f46e5)', <Buildings size={24} weight="duotone" />],
          ['Enrolled Students', totalStudents, '#ec4899', <IdentificationCard size={24} weight="duotone" />],
          ['Faculty & Teachers', totalTeachers, '#2563eb', <ChalkboardTeacher size={24} weight="duotone" />],
          ['Principals & Heads', overview.totalPrincipals || 0, '#7c3aed', <UserCircle size={24} weight="duotone" />],
          ['Classes & Programs', overview.totalCourses || 0, '#0891b2', <ChartLine size={24} weight="duotone" />],
        ].map(([label, val, color, icon]) => (
          <div key={label} style={S.metricCard} className="metric-card">
            <div style={S.metricIconWrapper(color)}>{icon}</div>
            <div>
              <p style={S.metricLabel}>{label}</p>
              <h2 style={{ ...S.metricValue, color }}>{val.toLocaleString()}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 2. COLLEGE BRANCHES & CAMPUS NETWORK (SHOWCASE GRID) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        padding: '24px 28px',
        marginBottom: '28px',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
              }}>
                <Buildings size={20} weight="fill" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {isSchool ? 'College Campuses & Branches Network' : 'Institutional Campuses & Departments'}
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 46px', fontSize: '0.85rem', color: '#64748b' }}>
              Click any branch to view its complete student roster, teaching faculty, and class details.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '6px 12px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
              ● {branchesCount} Branches Active
            </span>
          </div>
        </div>

        {/* Branches Cards Grid */}
        {departmentStats.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px'
          }}>
            {departmentStats.map((branch) => {
              const name = branch.campus_name || branch.name || 'Main Campus';
              const location = branch.location || 'Gulberg, Lahore';
              const studentsCount = branch.students || 0;
              const teachersCount = branch.teachers || 0;
              const isActive = branch.is_active !== false && branch.is_active !== 0;

              return (
                <div
                  key={branch.id}
                  style={{
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '16px',
                    border: '1.5px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => fetchBranchDetails(branch)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'var(--primary-color, #4f46e5)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(79, 70, 229, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Card Top: Icon, Name & Status */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(129, 140, 248, 0.18))',
                        color: 'var(--primary-color, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', flexShrink: 0
                      }}>
                        <Buildings size={24} weight="duotone" />
                      </div>

                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: isActive ? '#ecfdf5' : '#fef2f2',
                        color: isActive ? '#059669' : '#dc2626',
                        border: '1px solid ' + (isActive ? '#a7f3d0' : '#fecaca')
                      }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: isActive ? '#10b981' : '#ef4444',
                          boxShadow: isActive ? '0 0 8px #10b981' : 'none'
                        }}></span>
                        {isActive ? 'Active Branch' : 'Inactive'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                      {name}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      <MapPin size={14} weight="fill" color="#94a3b8" />
                      <span>{location}</span>
                    </div>
                  </div>

                  {/* Card Middle: Stats Pills */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    background: '#ffffff',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ padding: '6px', borderRadius: '8px', background: '#e0e7ff', color: '#4338ca' }}>
                        <Users size={16} weight="bold" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{studentsCount}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Students</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ padding: '6px', borderRadius: '8px', background: '#f3e8ff', color: '#7e22ce' }}>
                        <ChalkboardTeacher size={16} weight="bold" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{teachersCount}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Teachers</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Explore Button Link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--primary-color, #4f46e5)'
                  }}>
                    <span>View Branch Details (Popup)</span>
                    <CaretRight size={16} weight="bold" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <Buildings size={44} weight="duotone" style={{ color: '#cbd5e1', marginBottom: '10px' }} />
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>No Branches Found</div>
            <div style={{ fontSize: '0.85rem' }}>Configure school branches and wings from the College Campuses tab.</div>
          </div>
        )}
      </div>

      {/* 3. CHART & PERFORMANCE */}
      <div style={S.chartCard}>
        <div style={S.chartHeader}>
          <div>
            <h3 style={S.chartTitle}>Student Enrollment & Faculty Distribution</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Branch-wise student and faculty strength comparison</p>
          </div>
          <div style={S.chartLegend}>
            <span style={S.legendItem}><span style={{ ...S.legendDot, background: 'var(--primary-color, #4f46e5)' }}></span> Students</span>
            <span style={S.legendItem}><span style={{ ...S.legendDot, background: '#9333ea' }}></span> Teachers</span>
          </div>
        </div>
        <div style={{ height: '280px', position: 'relative' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. IN-PLACE INTERACTIVE BRANCH DETAILS POPUP MODAL       */}
      {/* ======================================================== */}
      {selectedBranch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0'
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '22px 28px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Buildings size={26} weight="duotone" color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.3px' }}>
                    {selectedBranch.campus_name || selectedBranch.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.8rem', color: '#c7d2fe' }}>
                    <MapPin size={14} weight="fill" />
                    <span>{selectedBranch.location || 'Gulberg, Lahore'}</span>
                    <span>•</span>
                    <span style={{ color: '#4ade80', fontWeight: '700' }}>✓ Active Campus</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedBranch(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            {loadingDetails ? (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                <Spinner size={36} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary-color, #4f46e5)' }} />
                <p style={{ marginTop: '12px', fontWeight: '700', fontSize: '0.9rem' }}>Loading Branch Roster & Statistics...</p>
              </div>
            ) : branchDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                
                {/* Stats Ribbon */}
                <div style={{
                  padding: '16px 28px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px'
                }}>
                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Enrolled Students</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {branchDetails.stats?.total_students || 0}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Faculty Teachers</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {branchDetails.stats?.total_teachers || 0}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Class Sections</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {branchDetails.stats?.total_classes || 0}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Branch Principal</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: branchDetails.principal ? '#166534' : '#b45309', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {branchDetails.principal ? branchDetails.principal.name : 'Not Assigned'}
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs Bar & Search */}
                <div style={{
                  padding: '12px 28px',
                  background: '#ffffff',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'overview', label: 'Overview & Head', icon: Buildings },
                      { id: 'teachers', label: 'Teachers (' + (branchDetails.teachers?.length || 0) + ')', icon: ChalkboardTeacher },
                      { id: 'students', label: 'Students (' + (branchDetails.students?.length || 0) + ')', icon: Student },
                      { id: 'classes',  label: 'Classes (' + (branchDetails.classes?.length || 0) + ')', icon: BookOpen },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const active = activeSubTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveSubTab(tab.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            background: active ? 'var(--primary-color, #4f46e5)' : '#f1f5f9',
                            color: active ? '#ffffff' : '#64748b',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Icon size={16} weight={active ? 'bold' : 'regular'} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {activeSubTab !== 'overview' && (
                    <div style={{ position: 'relative', minWidth: '220px' }}>
                      <MagnifyingGlass size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text"
                        placeholder="Filter list..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 36px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Sub-Tab Content Area */}
                <div style={{ padding: '24px 28px', overflowY: 'auto', maxHeight: '50vh', flex: 1 }}>
                  
                  {/* TAB 1: OVERVIEW & HEAD */}
                  {activeSubTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {/* Principal Profile Card */}
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '16px',
                          padding: '20px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Branch Leadership
                          </div>
                          {branchDetails.principal ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem', fontWeight: '800'
                              }}>
                                {branchDetails.principal.name.charAt(0)}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
                                  {branchDetails.principal.name}
                                </h4>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                  {branchDetails.principal.email}
                                </div>
                                <div style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontWeight: '700', fontSize: '0.75rem' }}>
                                  ✓ Appointed Principal
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                              <User size={32} weight="duotone" style={{ color: '#cbd5e1', marginBottom: '6px' }} />
                              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>No Principal Assigned</div>
                            </div>
                          )}
                        </div>

                        {/* Location & Contact Info */}
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '16px',
                          padding: '20px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Campus Profile
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                            <div><strong style={{ color: '#0f172a' }}>Campus Location:</strong> <span style={{ color: '#475569' }}>{selectedBranch.location || 'Gulberg, Lahore'}</span></div>
                            <div><strong style={{ color: '#0f172a' }}>Active Status:</strong> <span style={{ color: '#166534', fontWeight: '700' }}>✓ Live & Enrolling</span></div>
                            <div><strong style={{ color: '#0f172a' }}>Total Staff:</strong> <span style={{ color: '#475569' }}>{(branchDetails.teachers?.length || 0) + (branchDetails.principal ? 1 : 0)} personnel</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TEACHERS LIST */}
                  {activeSubTab === 'teachers' && (
                    <div>
                      {filteredTeachers.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                          {filteredTeachers.map(teacher => (
                            <div key={teacher.id} style={{
                              background: '#ffffff',
                              borderRadius: '14px',
                              padding: '16px',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: '#f3e8ff', color: '#7e22ce',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.1rem', fontWeight: '800', flexShrink: 0
                              }}>
                                {teacher.name.charAt(0)}
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {teacher.name}
                                </h5>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {teacher.email}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#7e22ce', fontWeight: '700', marginTop: '4px' }}>
                                  {teacher.designation || 'Faculty Teacher'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          No teachers found matching your search.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: STUDENTS LIST */}
                  {activeSubTab === 'students' && (
                    <div>
                      {filteredStudents.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '10px 14px', color: '#64748b', fontWeight: '700' }}>ROLL NO</th>
                                <th style={{ padding: '10px 14px', color: '#64748b', fontWeight: '700' }}>STUDENT NAME</th>
                                <th style={{ padding: '10px 14px', color: '#64748b', fontWeight: '700' }}>FATHER NAME</th>
                                <th style={{ padding: '10px 14px', color: '#64748b', fontWeight: '700' }}>GRADE / CLASS</th>
                                <th style={{ padding: '10px 14px', color: '#64748b', fontWeight: '700' }}>CONTACT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--primary-color, #4f46e5)' }}>{s.roll_number || '—'}</td>
                                  <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0f172a' }}>{s.name}</td>
                                  <td style={{ padding: '10px 14px', color: '#475569' }}>{s.father_name || '—'}</td>
                                  <td style={{ padding: '10px 14px' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', fontWeight: '700', color: '#334155', fontSize: '0.78rem' }}>
                                      {s.class_name || s.program_name || 'Class Grade'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{s.father_number || s.phone || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          No students found matching your search.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: CLASSES LIST */}
                  {activeSubTab === 'classes' && (
                    <div>
                      {filteredClasses.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                          {filteredClasses.map(cls => (
                            <div key={cls.id} style={{
                              background: '#ffffff',
                              borderRadius: '14px',
                              padding: '16px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                                  {cls.name}
                                </h5>
                                <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca', fontWeight: '700', fontSize: '0.75rem' }}>
                                  {cls.section || 'Sec A'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Year: <strong>{cls.academic_year || '2026-2027'}</strong>
                              </div>
                              {cls.room_number && (
                                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                                  Room: <strong>{cls.room_number}</strong>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                          No classes configured for this branch yet.
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                <WarningCircle size={32} />
                <p>Could not load branch details.</p>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ padding: '16px 28px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedBranch(null)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
