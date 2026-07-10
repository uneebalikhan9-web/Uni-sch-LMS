import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { BookOpen, Plus, Trash, Eye, X, Spinner, GraduationCap } from '@phosphor-icons/react';

const RegistrarDegreePlans = () => {
  const [plans, setPlans] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  
  // Selected context
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mappedCourses, setMappedCourses] = useState([]);
  
  // Form fields: Degree Plan
  const [programId, setProgramId] = useState('');
  const [version, setVersion] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [minCH, setMinCH] = useState(130);
  const [maxCH, setMaxCH] = useState(140);
  const [coreCH, setCoreCH] = useState('');
  const [electiveCH, setElectiveCH] = useState('');
  const [genEdCH, setGenEdCH] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [approvedByHEC, setApprovedByHEC] = useState(false);

  // Form fields: Map Course
  const [courseId, setCourseId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState(1);
  const [isCore, setIsCore] = useState(true);
  const [isOptional, setIsOptional] = useState(false);
  const [category, setCategory] = useState('core');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [plansRes, programsRes, coursesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/degree-plans`, { headers }),
        axios.get(`${API_BASE_URL}/api/degree-plans/programs`, { headers }),
        axios.get(`${API_BASE_URL}/api/degree-plans/courses`, { headers })
      ]);
      
      if (plansRes.data.success) setPlans(plansRes.data.degreePlans);
      if (programsRes.data.success) setPrograms(programsRes.data.programs);
      if (coursesRes.data.success) setCourses(coursesRes.data.courses);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPlanModal = () => {
    setProgramId('');
    setVersion('');
    setEffectiveFrom(new Date().getFullYear());
    setMinCH(130);
    setMaxCH(140);
    setCoreCH('');
    setElectiveCH('');
    setGenEdCH('');
    setIsActive(true);
    setApprovedByHEC(false);
    setPlanModalOpen(true);
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        program_id: programId,
        version,
        effective_from: effectiveFrom,
        min_credit_hours: minCH,
        max_credit_hours: maxCH,
        core_credit_hours: coreCH ? parseInt(coreCH) : null,
        elective_credit_hours: electiveCH ? parseInt(electiveCH) : null,
        general_education_hours: genEdCH ? parseInt(genEdCH) : null,
        is_active: isActive,
        approved_by_hec: approvedByHEC
      };

      await axios.post(`${API_BASE_URL}/api/degree-plans`, payload, { headers });
      setPlanModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating degree plan');
    }
  };

  const handleViewPlan = async (plan) => {
    setSelectedPlan(plan);
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/degree-plans/${plan.id}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMappedCourses(res.data.courses);
        setViewModalOpen(true);
      }
    } catch (error) {
      alert('Error fetching mapped courses');
    }
  };

  const openMapCourseModal = () => {
    setCourseId('');
    setSemesterNumber(1);
    setIsCore(true);
    setIsOptional(false);
    setCategory('core');
    setCourseModalOpen(true);
  };

  const handleMapCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        course_id: courseId,
        semester_number: parseInt(semesterNumber),
        is_core: isCore,
        is_optional: isOptional,
        category
      };

      await axios.post(`${API_BASE_URL}/api/degree-plans/${selectedPlan.id}/courses`, payload, { headers });
      setCourseModalOpen(false);
      // Refresh mapped courses
      handleViewPlan(selectedPlan);
    } catch (error) {
      alert(error.response?.data?.message || 'Error mapping course');
    }
  };

  const handleRemoveCourse = async (mappingId) => {
    if (!window.confirm('Remove this course from the degree plan curriculum?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/degree-plans/${selectedPlan.id}/courses/${mappingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      handleViewPlan(selectedPlan);
    } catch (error) {
      alert('Error removing course mapping');
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Delete this degree plan and all its curriculum course mappings?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/degree-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error deleting degree plan');
    }
  };

  // Helper to group courses by semester number
  const getCoursesBySemester = (sem) => {
    return mappedCourses.filter(c => c.semester_number === sem);
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '80vh', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={28} weight="duotone" color="var(--reg-primary, var(--primary-color, #4f46e5))" />
            Degree Plans & Curriculum
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Map academic catalogs and credit structures to university degree programs.</p>
        </div>
        
        <button onClick={openPlanModal} className="action-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
          <Plus size={20} weight="bold" />
          Create Plan
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px' }}><Spinner size={40} className="spinner" /></div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <GraduationCap size={60} weight="thin" color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569' }}>No degree plans created yet</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 20px 0' }}>Establish HEC approved credit architectures for your majors.</p>
          <button onClick={openPlanModal} className="action-btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Create Plan</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }} className="card-hover">
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: plan.approved_by_hec === 1 ? '#047857' : '#c2410c', background: plan.approved_by_hec === 1 ? '#ecfdf5' : '#fff7ed', padding: '3px 8px', borderRadius: '6px' }}>
                  {plan.approved_by_hec === 1 ? 'HEC Approved' : 'HEC Pending'}
                </span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '10px 0 4px 0', lineHeight: '1.4' }}>
                  {plan.program_name}
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  Version: <strong>{plan.version}</strong> (From: {plan.effective_from || 'N/A'})
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '12px', fontSize: '12px', color: '#475569' }}>
                <div>Min Credits: <strong>{plan.min_credit_hours} CH</strong></div>
                <div>Max Credits: <strong>{plan.max_credit_hours} CH</strong></div>
                <div>Core: <strong>{plan.core_credit_hours || 'N/A'} CH</strong></div>
                <div>Elective: <strong>{plan.elective_credit_hours || 'N/A'} CH</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button onClick={() => handleViewPlan(plan)} className="action-btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  <Eye size={16} />
                  Curriculum
                </button>
                <button onClick={() => handleDeletePlan(plan.id)} style={{ padding: '10px', borderRadius: '10px', background: '#fef2f2', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {planModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Degree Plan</h3>
              <button onClick={() => setPlanModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Degree Program *</label>
                <select value={programId} onChange={(e) => setProgramId(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                  <option value="">Select Major Program...</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code}) - {p.level}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Curriculum Version *</label>
                  <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} required placeholder="e.g. 2026-Curriculum" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Effective From (Year)</label>
                  <input type="number" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} placeholder="e.g. 2026" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Min Credit Hours *</label>
                  <input type="number" value={minCH} onChange={(e) => setMinCH(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Max Credit Hours *</label>
                  <input type="number" value={maxCH} onChange={(e) => setMaxCH(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Core Credits</label>
                  <input type="number" value={coreCH} onChange={(e) => setCoreCH(e.target.value)} placeholder="e.g. 80" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Elective Credits</label>
                  <input type="number" value={electiveCH} onChange={(e) => setElectiveCH(e.target.value)} placeholder="e.g. 30" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Gen Ed Credits</label>
                  <input type="number" value={genEdCH} onChange={(e) => setGenEdCH(e.target.value)} placeholder="e.g. 20" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', padding: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Is Active Plan
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" checked={approvedByHEC} onChange={(e) => setApprovedByHEC(e.target.checked)} />
                  Approved By HEC
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setPlanModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: 'white', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', border: 'none', cursor: 'pointer' }}>Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PLAN & COURSE MAPPING MODAL */}
      {viewModalOpen && selectedPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Curriculum Mapping</h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{selectedPlan.program_name} (Version: {selectedPlan.version})</span>
              </div>
              <button onClick={() => setViewModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button onClick={openMapCourseModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                <Plus size={16} weight="bold" />
                Map Course
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(semNum => {
                const semCourses = getCoursesBySemester(semNum);
                return (
                  <div key={semNum} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', marginBottom: '12px' }}>
                      Semester {semNum}
                    </h4>

                    {semCourses.length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '16px' }}>No courses mapped for this semester yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {semCourses.map(mc => (
                          <div key={mc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569', width: '70px' }}>{mc.course_code}</span>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{mc.course_title}</span>
                              <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{mc.credit_hours} CH</span>
                              <span style={{ fontSize: '11px', textTransform: 'capitalize', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{mc.category}</span>
                            </div>
                            
                            <button onClick={() => handleRemoveCourse(mc.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAP COURSE MODAL */}
      {courseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Map Course to Semester</h3>
              <button onClick={() => setCourseModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleMapCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Catalog Course *</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                  <option value="">Select course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.code}) - {c.credit_hours} CH</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Recommended Semester *</label>
                  <select value={semesterNumber} onChange={(e) => setSemesterNumber(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>Semester {n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Course Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="core">Core Course</option>
                    <option value="elective">Elective</option>
                    <option value="general">General Education</option>
                    <option value="lab">Lab Course</option>
                    <option value="project">Project</option>
                    <option value="thesis">Thesis</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', padding: '4px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isCore} onChange={(e) => setIsCore(e.target.checked)} />
                  Is Core
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isOptional} onChange={(e) => setIsOptional(e.target.checked)} />
                  Is Optional / Elective
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setCourseModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: 'white', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', border: 'none', cursor: 'pointer' }}>Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarDegreePlans;
