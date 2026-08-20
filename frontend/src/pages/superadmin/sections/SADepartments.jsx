import { useState } from "react";
import { 
  Plus, PencilSimple, Trash, Buildings, ShieldCheck, CheckCircle, 
  Eye, User, ChalkboardTeacher, Student, BookOpen, MagnifyingGlass,
  Phone, EnvelopeSimple, CalendarBlank, X, Spinner, WarningCircle
} from "@phosphor-icons/react";
import { S } from "./SAStyles";
import API_BASE_URL from "../../../config/api";

export default function SADepartments({ 
  isSchool = false,
  departments, 
  editingItem, setEditingItem,
  showAddModal, setShowAddModal,
  newDepartment, setNewDepartment,
  onAdd, onDelete
}) {
  // Branch Details Drill-Down State
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'teachers' | 'students' | 'classes'
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
    <>
      {isCollege && (
        <div style={{
          marginBottom: '20px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.05)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            flexShrink: 0
          }}>
            <Buildings size={24} weight="duotone" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.92rem', color: '#1e3a8a' }}>Lancers Tech Configured Branches</strong>
              <span style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '12px',
                background: '#dcfce7',
                color: '#166534',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={12} weight="bold" /> Powered by Lancers Tech
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: '1.4' }}>
              All school wings and branches are provisioned and secured by Lancers Tech. Click any branch below to view its complete students, faculty, and leadership details.
            </p>
          </div>
        </div>
      )}

      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <div>
            <h2 style={S.tableTitle}>{isSchool ? 'College Campuses & Wings' : 'Faculties & Departments'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {isSchool ? 'Click any branch to inspect full faculty, student roster, and class statistics' : 'Manage university academic departments'}
            </p>
          </div>
          {!isCollege && (
            <button 
              onClick={() => { setEditingItem(null); setShowAddModal(true); }} 
              style={S.addBtn} className="add-btn"
            >
              <Plus size={18} weight="bold" />
              <span>Add Faculty</span>
            </button>
          )}
        </div>
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>{isSchool ? 'BRANCH / WING NAME' : 'NAME'}</th>
                <th style={S.th}>LOCATION</th>
                <th style={S.th}>STUDENTS</th>
                <th style={S.th}>TEACHERS</th>
                <th style={S.th}>STATUS</th>
                <th style={{...S.th, textAlign: 'right'}}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(c => (
                <tr 
                  key={c.id} 
                  style={{...S.tr, cursor: 'pointer', transition: 'background 0.2s ease'}}
                  onClick={() => fetchBranchDetails(c)}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={S.tdName}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: '#eff6ff', color: 'var(--primary-color, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Buildings size={20} weight="duotone" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{c.name}</div>
                        {c.dept_code && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {c.dept_code}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>{c.location || '—'}</td>
                  <td style={S.td}>
                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem' }}>
                      {c.student_count || 0}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>students</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem' }}>
                      {c.teacher_count || 0}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>teachers</span>
                  </td>
                  <td style={S.td}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle size={13} weight="fill" /> Active Branch
                    </span>
                  </td>
                  <td style={{...S.td, textAlign: 'right'}}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); fetchBranchDetails(c); }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: 'var(--primary-color, #4f46e5)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      >
                        <Eye size={16} weight="bold" /> View Details
                      </button>

                      {!isCollege && (
                        <>
                          <button 
                            style={S.editBtn} className="edit-btn"
                            onClick={(e) => { e.stopPropagation(); setEditingItem({...c}); setShowAddModal(true); }}
                            title="Edit Department"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button 
                            style={S.deleteBtn} className="delete-btn"
                            onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                            title="Delete Department"
                          >
                            <Trash size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{...S.td, textAlign: 'center', padding: '60px', color: '#94a3b8'}}>
                    No branches assigned yet. Please contact Lancers Tech support to configure branches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BRANCH 360° DETAILS MODAL ── */}
      {selectedBranch && (
        <div style={S.overlay} onClick={() => setSelectedBranch(null)}>
          <div 
            style={{
              ...S.modal,
              maxWidth: '920px',
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.15)', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Buildings size={26} weight="duotone" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.3px' }}>
                      {selectedBranch.name}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📍 {selectedBranch.location || 'Location Not Specified'}</span>
                      {selectedBranch.dept_code && <span>• Code: {selectedBranch.dept_code}</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  border: '1px solid rgba(74, 222, 128, 0.3)'
                }}>
                  ● Live Operational Branch
                </span>
                <button 
                  onClick={() => setSelectedBranch(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#ffffff',
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {loadingDetails ? (
              <div style={{ padding: '80px', textAlign: 'center' }}>
                <Spinner size={40} className="spin" color="var(--primary-color, #4f46e5)" />
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Fetching live branch data...</p>
              </div>
            ) : branchDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                
                {/* Metric Strip */}
                <div style={{
                  padding: '16px 28px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px'
                }}>
                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Enrolled Students</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {branchDetails.stats?.total_students || 0}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Teaching Faculty</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {branchDetails.stats?.total_teachers || 0}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active Classes</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {branchDetails.stats?.total_classes || 0}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Branch Head</div>
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
                      { id: 'teachers', label: `Teachers (${branchDetails.teachers?.length || 0})`, icon: ChalkboardTeacher },
                      { id: 'students', label: `Students (${branchDetails.students?.length || 0})`, icon: Student },
                      { id: 'classes',  label: `Classes (${branchDetails.classes?.length || 0})`, icon: BookOpen },
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
                            gap: '6px',
                            transition: 'all 0.2s'
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
                          border: '1px solid #e2e8f0',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Sub-Tab Content */}
                <div style={{ padding: '24px 28px', flex: 1 }}>
                  
                  {/* TAB 1: OVERVIEW & LEADERSHIP */}
                  {activeSubTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                      
                      {/* Principal / Headmaster Card */}
                      <div style={{
                        padding: '24px',
                        background: branchDetails.principal ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)' : '#fefce8',
                        borderRadius: '18px',
                        border: '1px solid',
                        borderColor: branchDetails.principal ? '#bbf7d0' : '#fef08a'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                          <div style={{
                            width: '52px', height: '52px', borderRadius: '16px',
                            background: branchDetails.principal ? '#dcfce7' : '#fef08a',
                            color: branchDetails.principal ? '#166534' : '#854d0e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <User size={28} weight="duotone" />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Branch Leadership</span>
                            <h4 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                              {branchDetails.principal ? branchDetails.principal.name : 'No Principal Assigned'}
                            </h4>
                          </div>
                        </div>

                        {branchDetails.principal ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                              <EnvelopeSimple size={18} color="#64748b" />
                              <span>{branchDetails.principal.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                              <Phone size={18} color="#64748b" />
                              <span>{branchDetails.principal.phone || 'Phone not available'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                              <CalendarBlank size={18} color="#64748b" />
                              <span>Appointed on: {new Date(branchDetails.principal.created_at).toLocaleDateString()}</span>
                            </div>
                            <div style={{ marginTop: '8px' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                background: '#dcfce7',
                                color: '#166534',
                                fontWeight: '700',
                                fontSize: '0.78rem'
                              }}>
                                ● Active Headmaster
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: '#854d0e', lineHeight: '1.5' }}>
                              This branch currently does not have a designated Principal. You can appoint a Principal from the <strong>"Principals & Heads"</strong> tab on the left sidebar.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Branch Specs Card */}
                      <div style={{
                        padding: '24px',
                        background: '#ffffff',
                        borderRadius: '18px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                          Branch Specifications
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.88rem' }}>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Branch ID</span>
                            <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>#{branchDetails.branch?.id}</div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Provisioned Date</span>
                            <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                              {new Date(branchDetails.branch?.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Location</span>
                            <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{branchDetails.branch?.location || 'Lahore'}</div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Network Security</span>
                            <div style={{ fontWeight: '700', color: '#166534', marginTop: '2px' }}>Lancers Tech SSL</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: TEACHERS LIST */}
                  {activeSubTab === 'teachers' && (
                    <div>
                      {filteredTeachers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px' }}>
                          <ChalkboardTeacher size={48} weight="duotone" color="#cbd5e1" style={{ marginBottom: '10px' }} />
                          <h4 style={{ margin: '0 0 4px', color: '#64748b' }}>No Teachers Found</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>No teaching faculty found matching your search.</p>
                        </div>
                      ) : (
                        <div style={S.tableContainer}>
                          <table style={S.table}>
                            <thead>
                              <tr>
                                <th style={S.th}>TEACHER NAME</th>
                                <th style={S.th}>EMAIL</th>
                                <th style={S.th}>PHONE</th>
                                <th style={S.th}>STATUS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTeachers.map(t => (
                                <tr key={t.id} style={S.tr}>
                                  <td style={S.tdName}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: '#f5f3ff', color: '#7c3aed', fontWeight: '800',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
                                      }}>
                                        {t.name?.charAt(0) || 'T'}
                                      </div>
                                      <span style={{ fontWeight: '700' }}>{t.name}</span>
                                    </div>
                                  </td>
                                  <td style={S.td}>{t.email}</td>
                                  <td style={S.td}>{t.phone || '—'}</td>
                                  <td style={S.td}>
                                    <span style={{
                                      padding: '3px 8px', borderRadius: '12px',
                                      fontSize: '0.74rem', fontWeight: '700',
                                      background: '#ecfdf5', color: '#166534'
                                    }}>
                                      Active Faculty
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: STUDENTS LIST */}
                  {activeSubTab === 'students' && (
                    <div>
                      {filteredStudents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px' }}>
                          <Student size={48} weight="duotone" color="#cbd5e1" style={{ marginBottom: '10px' }} />
                          <h4 style={{ margin: '0 0 4px', color: '#64748b' }}>No Students Found</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>No enrolled students found matching your search.</p>
                        </div>
                      ) : (
                        <div style={S.tableContainer}>
                          <table style={S.table}>
                            <thead>
                              <tr>
                                <th style={S.th}>ROLL NUMBER</th>
                                <th style={S.th}>STUDENT NAME</th>
                                <th style={S.th}>FATHER NAME</th>
                                <th style={S.th}>PROGRAM / CLASS</th>
                                <th style={S.th}>CONTACT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map(s => (
                                <tr key={s.id} style={S.tr}>
                                  <td style={S.td}>
                                    <span style={{ fontWeight: '700', padding: '2px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', fontSize: '0.8rem' }}>
                                      {s.roll_number || `STU-${s.id}`}
                                    </span>
                                  </td>
                                  <td style={S.tdName}>
                                    <span style={{ fontWeight: '700' }}>{s.name}</span>
                                  </td>
                                  <td style={S.td}>{s.father_name || '—'}</td>
                                  <td style={S.td}>
                                    <span style={{ fontWeight: '600', color: 'var(--primary-color, #4f46e5)' }}>
                                      {s.class_name || s.program_name || 'General Grade'}
                                    </span>
                                  </td>
                                  <td style={S.td}>{s.phone || s.email || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: CLASSES & SECTIONS */}
                  {activeSubTab === 'classes' && (
                    <div>
                      {filteredClasses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px' }}>
                          <BookOpen size={48} weight="duotone" color="#cbd5e1" style={{ marginBottom: '10px' }} />
                          <h4 style={{ margin: '0 0 4px', color: '#64748b' }}>No Classes Configured</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>No active classes found for this branch.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                          {filteredClasses.map(c => (
                            <div key={c.id} style={{
                              padding: '18px',
                              borderRadius: '16px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '10px',
                                  background: '#eff6ff', color: '#2563eb',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                  <BookOpen size={20} weight="duotone" />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{c.name}</h4>
                              </div>
                              <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div><strong>Section:</strong> {c.section || 'A'}</div>
                                <div><strong>Room:</strong> {c.room_number || 'Main Building'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                <WarningCircle size={40} color="#f59e0b" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontWeight: '700' }}>Could not load branch details.</p>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{
              padding: '16px 28px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setSelectedBranch(null)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--primary-color, #4f46e5)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add/Edit Department Modal (Only for Universities / non-school) */}
      {!isCollege && showAddModal && (
        <div style={S.overlay} onClick={() => { setShowAddModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>{editingItem ? 'Edit Department' : 'Add New Department'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.modalClose}>×</button>
            </div>
            <form onSubmit={onAdd} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Department Name</label>
                <input 
                  placeholder="e.g., Department of Computer Science" required 
                  value={editingItem ? editingItem.name : newDepartment.name} 
                  onChange={e => editingItem 
                    ? setEditingItem({...editingItem, name: e.target.value}) 
                    : setNewDepartment({...newDepartment, name: e.target.value})} 
                  style={S.input}
                />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Location</label>
                <input 
                  placeholder="e.g., Block A, Main Campus" 
                  value={editingItem ? editingItem.location : newDepartment.location} 
                  onChange={e => editingItem 
                    ? setEditingItem({...editingItem, location: e.target.value}) 
                    : setNewDepartment({...newDepartment, location: e.target.value})} 
                  style={S.input}
                />
              </div>
              {editingItem && (
                <div style={S.checkboxGroup}>
                  <input 
                    type="checkbox" id="activeCheckbox"
                    checked={editingItem.is_active} 
                    onChange={e => setEditingItem({...editingItem, is_active: e.target.checked})} 
                    style={S.checkbox}
                  />
                  <label htmlFor="activeCheckbox" style={S.checkboxLabel}>Active Department</label>
                </div>
              )}
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn}>
                  {editingItem ? 'Update Faculty' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
