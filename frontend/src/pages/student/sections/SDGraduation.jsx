import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { 
  GraduationCap, FileText, CheckCircle, Clock, Info, ShieldCheck, Download
} from '@phosphor-icons/react';
import { S } from './SDStyles';
import { useToast } from '../../../components/Toast';

export default function SDGraduation({ user }) {
  const [transcript, setTranscript] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchGraduationData();
  }, []);

  const fetchGraduationData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const transcriptRes = await axios.get(`${API_BASE_URL}/api/graduation/transcript/${user.student_id}`, { headers });
      if (transcriptRes.data.success) {
        setTranscript(transcriptRes.data.transcript);
        setTotalCredits(transcriptRes.data.total_credits_passed);
      }

      const statusRes = await axios.get(`${API_BASE_URL}/api/graduation/my-application`, { headers });
      if (statusRes.data.success && statusRes.data.application) {
        setApplicationStatus(statusRes.data.application.status);
      }
    } catch (error) {
      console.error('Error fetching graduation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyGraduation = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/graduation/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Application submitted successfully!', 'success');
        fetchGraduationData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application', 'error');
    }
  };

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Informative Banner */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: '#22c55e', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
          <GraduationCap size={22} weight="duotone" />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#14532d', margin: '0 0 6px 0' }}>Graduation & Transcript Hub</h4>
          <p style={{ fontSize: '13px', color: '#166534', lineHeight: '1.6', margin: 0, fontWeight: '600' }}>
            View your unofficial academic transcript and track your earned credit hours. 
            If you are in your final semester, you can apply for graduation here. The Registrar will audit your credits and CGPA.
          </p>
        </div>
        
        {applicationStatus ? (
           <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#16a34a', padding: '10px 20px', borderRadius: '12px', border: '2px solid #16a34a', fontWeight: 700 }}>
             Status: {applicationStatus.toUpperCase()}
           </div>
        ) : (
          <button 
            onClick={handleApplyGraduation}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)' }}
          >
            <CheckCircle size={18} weight="bold"/> Apply For Graduation
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
         <div style={{...S.metricCard, background: '#f8fafc', border: '1px solid #e2e8f0'}}>
           <div style={S.metricIconWrapper('#3b82f6')}><FileText weight="duotone" /></div>
           <div style={S.metricContent}>
             <p style={S.metricLabel}>Total Earned Credits</p>
             <h2 style={{ ...S.metricValue, color: '#0f172a' }}>{totalCredits}</h2>
             <span style={S.metricTrend}>All passed courses</span>
           </div>
         </div>
      </div>

      {/* Transcript Table */}
      <div className="section" style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', margin: 0 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>Unofficial Academic Transcript</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading transcript...</div>
        ) : (
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>SEMESTER</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>COURSE CODE</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>COURSE TITLE</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'center', borderBottom: '1px solid #edf2f7' }}>CREDIT HOURS</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'center', borderBottom: '1px solid #edf2f7' }}>GRADE</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'center', borderBottom: '1px solid #edf2f7' }}>GPA</th>
                </tr>
              </thead>
              <tbody>
                {transcript.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>Semester {t.enrollment_semester}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>{t.course_code}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{t.course_title}</td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>{t.credit_hours}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800',
                        background: t.grade ? (t.grade === 'F' ? '#fee2e2' : '#dcfce7') : '#f1f5f9',
                        color: t.grade ? (t.grade === 'F' ? '#b91c1c' : '#166534') : '#64748b'
                      }}>
                        {t.grade || 'Enrolled'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>{t.gpa || '-'}</td>
                  </tr>
                ))}
                {transcript.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No courses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
