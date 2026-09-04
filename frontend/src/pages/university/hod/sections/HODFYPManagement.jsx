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
        return S.badge('#dcfce7', '#16a34a');
      case 'mid_defense':
      case 'final_defense':
        return S.badge('#fef3c7', '#d97706');
      default:
        return S.badge('#eff6ff', '#2563eb');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Final Year Projects (FYP) & Thesis Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Project allocations, supervisor assignments, milestone defense schedules</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={18} weight="bold" /> Register FYP Group
        </button>
      </div>

      <div style={S.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Project Title & Domain</th>
                <th style={S.th}>Supervisor</th>
                <th style={S.th}>Batch</th>
                <th style={S.th}>Members</th>
                <th style={S.th}>Milestone Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ ...S.td, textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No FYP capstone projects registered yet. Click "+ Register FYP Group" above to add.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id}>
                    <td style={S.td}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{p.domain}</div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                        <ChalkboardTeacher size={18} color="#6366f1" />
                        <span style={{ fontWeight: '600' }}>{p.supervisor_name || 'Prof. Unassigned'}</span>
                      </div>
                    </td>
                    <td style={S.td}><span style={{ color: '#475569' }}>{p.batch_year || 2026}</span></td>
                    <td style={S.td}>
                      <span style={{ fontWeight: '700', color: '#0f172a' }}>{p.member_count || 3} Students</span>
                    </td>
                    <td style={S.td}>{getStatusBadge(p.status || 'proposed')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FYP Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Register Final Year Project (FYP)</h3>
            <form onSubmit={handleCreateFYP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Drone Navigation Using Deep RL"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Domain / Research Area</label>
                <select
                  value={newProject.domain}
                  onChange={(e) => setNewProject({ ...newProject, domain: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '600', outline: 'none' }}
                >
                  <option value="Artificial Intelligence & Machine Learning">AI & Machine Learning</option>
                  <option value="Cloud Computing & DevOps">Cloud & Distributed Systems</option>
                  <option value="Cybersecurity & Cryptography">Cybersecurity</option>
                  <option value="Internet of Things (IoT) & Embedded">IoT & Embedded</option>
                  <option value="Mobile & Web Engineering">Full Stack Web & Mobile</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Supervisor Faculty</label>
                <select
                  value={newProject.supervisor_id}
                  onChange={(e) => setNewProject({ ...newProject, supervisor_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '600', outline: 'none' }}
                >
                  <option value="">-- Select Faculty Supervisor --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.designation || 'Faculty'})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Degree Program</label>
                <select
                  value={newProject.program_id}
                  onChange={(e) => setNewProject({ ...newProject, program_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '600', outline: 'none' }}
                >
                  <option value="">-- Select Program --</option>
                  {programs.map(pr => <option key={pr.id} value={pr.id}>{pr.name} ({pr.code || 'BS'})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 20px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit" style={S.btnPrimary}>
                  Save Project
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
