import React, { useState, useEffect } from 'react';
import { HOD_STYLES as S } from './HODStyles';
import API_BASE_URL from '../../../../config/api';
import { Plus, GraduationCap, Users, ChalkboardTeacher, CheckCircle, Clock } from '@phosphor-icons/react';

const HODFYPManagement = () => {
  const [projects, setProjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    domain: 'Artificial Intelligence & Machine Learning',
    abstract: '',
    supervisor_id: '',
    program_id: '',
    batch_year: 2026
  });

  const fetchFYPData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [fypRes, tchRes, prgRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/fyp`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/teachers`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/degree-plans`, { headers }).then(r => r.json())
      ]);

      if (fypRes.success) setProjects(fypRes.data || []);
      if (tchRes.success) setTeachers(tchRes.teachers || tchRes.data || []);
      if (prgRes.success) setPrograms(prgRes.data || prgRes.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFYPData();
  }, []);

  const handleCreateFYP = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/fyp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newProject)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setNewProject({ title: '', domain: 'Artificial Intelligence & Machine Learning', abstract: '', supervisor_id: '', program_id: '', batch_year: 2026 });
        fetchFYPData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return S.badge('rgba(16, 185, 129, 0.2)', '#10B981');
      case 'mid_defense':
      case 'final_defense':
        return S.badge('rgba(245, 158, 11, 0.2)', '#F59E0B');
      default:
        return S.badge('rgba(59, 130, 246, 0.2)', '#60A5FA');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Final Year Projects (FYP) & Thesis Management</h2>
          <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0 0' }}>Project allocations, supervisor assignments, milestone defense schedules</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={18} weight="bold" /> Register FYP Group
        </button>
      </div>

      <div style={S.grid4}>
        <div style={S.statCard('#3B82F6')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Active Projects</span>
            <GraduationCap size={22} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', margin: '12px 0 4px 0' }}>{projects.length}</div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Batch 2026 Capstones</span>
        </div>

        <div style={S.statCard('#10B981')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Assigned Supervisors</span>
            <ChalkboardTeacher size={22} color="#10B981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', margin: '12px 0 4px 0' }}>{teachers.length}</div>
          <span style={{ fontSize: '12px', color: '#34D399' }}>Faculty Advisors</span>
        </div>

        <div style={S.statCard('#F59E0B')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Upcoming Defenses</span>
            <Clock size={22} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', margin: '12px 0 4px 0' }}>Mid Defense</div>
          <span style={{ fontSize: '12px', color: '#FCD34D' }}>Week 12 Scheduled</span>
        </div>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Project Title & Domain</th>
              <th style={S.th}>Faculty Supervisor</th>
              <th style={S.th}>Program</th>
              <th style={S.th}>Group Size</th>
              <th style={S.th}>Batch</th>
              <th style={S.th}>Stage & Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ ...S.td, textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No FYP projects registered yet. Click "Register FYP Group" above.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id}>
                  <td style={S.td}>
                    <div style={{ fontWeight: '600', color: '#FFFFFF' }}>{p.title}</div>
                    <div style={{ fontSize: '12px', color: '#38BDF8' }}>{p.domain}</div>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ChalkboardTeacher size={18} color="#94A3B8" />
                      <span>{p.supervisor_name || 'Dr. Tariq Mahmood'}</span>
                    </div>
                  </td>
                  <td style={S.td}>{p.program_name || 'BS Computer Science'}</td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={16} color="#94A3B8" />
                      <span>{p.total_members || 3} Members</span>
                    </div>
                  </td>
                  <td style={S.td}>{p.batch_year || 2026}</td>
                  <td style={S.td}>
                    <span style={getStatusBadge(p.status)}>{(p.status || 'in_progress').replace('_', ' ').toUpperCase()}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '540px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Register New FYP Project Group</h3>
            <form onSubmit={handleCreateFYP} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Autonomous Disease Diagnosis"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Technical Domain</label>
                  <input
                    type="text"
                    value={newProject.domain}
                    onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Faculty Supervisor</label>
                  <select
                    value={newProject.supervisor_id}
                    onChange={(e) => setNewProject({ ...newProject, supervisor_id: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                  >
                    <option value="">-- Select Supervisor --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Project Abstract & Scope</label>
                <textarea
                  rows="3"
                  value={newProject.abstract}
                  onChange={(e) => setNewProject({ ...newProject, abstract: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#374151', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={S.btnPrimary}>
                  Save FYP Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODFYPManagement;
