import React, { useState } from 'react';
import { 
  MagnifyingGlass, Funnel, Receipt, Eye, CheckCircle, 
  Clock, GraduationCap, Buildings, Phone, User
} from '@phosphor-icons/react';

export default function AdmissionsApplicants({ applicants, onPrintChallan, onClearFee }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredApplicants = (applicants || []).filter(app => {
    const matchesSearch = 
      (app.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.father_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.phone || '').includes(searchTerm) ||
      (app.bform_number || '').includes(searchTerm) ||
      (app.cnic || '').includes(searchTerm);

    const matchesGrade = gradeFilter === 'All' || app.target_class === gradeFilter;

    let matchesStatus = true;
    if (statusFilter === 'pending_fee') {
      matchesStatus = (app.status === 'pending_fee' || app.status === 'pending' || app.fee_status === 'pending') && app.status !== 'admitted' && app.status !== 'approved';
    } else if (statusFilter === 'fee_verified') {
      matchesStatus = (app.status === 'fee_verified' || app.fee_status === 'paid') && app.status !== 'admitted' && app.status !== 'approved';
    } else if (statusFilter === 'admitted') {
      matchesStatus = app.status === 'admitted' || app.status === 'approved';
    }

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const gradesList = [
    'All', 'Playgroup', 'Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3',
    'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'O-Levels', 'A-Levels'
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header & Filter Bar */}
      <div style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
              Student Applicants Directory
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Showing {filteredApplicants.length} registered applicant(s)
            </p>
          </div>
        </div>

        {/* Filters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <MagnifyingGlass 
              size={16} 
              color="#94a3b8" 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input 
              type="text" 
              placeholder="Search by student, father, B-Form..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px 14px 10px 40px', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                fontSize: '0.85rem', 
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f8fafc'
              }}
            />
          </div>

          {/* Grade Filter */}
          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#334155',
                fontWeight: '600'
              }}
            >
              {gradesList.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Target Grades' : `Grade: ${g}`}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#f8fafc',
                color: '#334155',
                fontWeight: '600'
              }}
            >
              <option value="All">All Admission Statuses</option>
              <option value="pending_fee">🟡 Pending Fee Clearance</option>
              <option value="fee_verified">🔵 Fee Verified (In Review)</option>
              <option value="admitted">🟢 Officially Admitted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student Name</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Father / Guardian</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Target Grade</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Branch</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Fee Status</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase' }}>Stage</th>
                <th style={{ padding: '14px 18px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No applicants match your search filters.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    {/* Student Name */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '800', fontSize: '0.9rem'
                        }}>
                          {app.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0f172a' }}>{app.full_name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>B-Form: {app.bform_number || app.cnic || '—'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Father Info */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '600', color: '#334155' }}>{app.father_name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{app.phone || app.father_phone || '—'}</div>
                    </td>

                    {/* Target Grade */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: '#f1f5f9',
                        color: '#334155',
                        fontWeight: '700',
                        fontSize: '0.78rem'
                      }}>
                        {app.target_class || 'General'}
                      </span>
                    </td>

                    {/* Branch */}
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      {app.campus_name || 'Main Campus'}
                    </td>

                    {/* Fee Status */}
                    <td style={{ padding: '14px 18px' }}>
                      {app.fee_status === 'paid' ? (
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontWeight: '800', fontSize: '0.75rem' }}>
                          ● Paid
                        </span>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#fef3c7', color: '#92400e', fontWeight: '800', fontSize: '0.75rem' }}>
                          ● Pending
                        </span>
                      )}
                    </td>

                    {/* Stage */}
                    <td style={{ padding: '14px 18px' }}>
                      {app.status === 'admitted' || app.status === 'approved' ? (
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontWeight: '800', fontSize: '0.75rem' }}>
                          Admitted in Class
                        </span>
                      ) : app.status === 'fee_verified' || app.fee_status === 'paid' ? (
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', fontWeight: '800', fontSize: '0.75rem' }}>
                          In Principal Review
                        </span>
                      ) : (
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#fffbeb', color: '#b45309', fontWeight: '800', fontSize: '0.75rem' }}>
                          Inquiry Desk
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onPrintChallan(app)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Receipt size={14} weight="bold" /> Challan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
