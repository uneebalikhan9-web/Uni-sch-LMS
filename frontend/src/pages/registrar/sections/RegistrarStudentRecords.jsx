import React, { useState } from 'react';
import { 
  PencilSimple, Eye, MagnifyingGlass, Funnel, 
  UserList, Student, GraduationCap, WarningOctagon, XCircle
} from '@phosphor-icons/react';

const RegistrarStudentRecords = ({ records, getStatusClass, handleEditRecord, handleViewTranscript }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Local filtering logic for instant response
  const filtered = records.filter(record => {
    const matchesSearch = 
      String(record.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(record.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(record.program || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate live dynamic counts for the stats widgets
  const totalCount = records.length;
  const enrolledCount = records.filter(r => r.status === 'Enrolled').length;
  const graduatedCount = records.filter(r => r.status === 'Graduated').length;
  const suspendedCount = records.filter(r => r.status === 'Suspended').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Directory Quick Insights Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        
        {/* Total Directory Size */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
          <div style={{ background: '#f5f3ff', color: 'var(--primary-color, #4f46e5)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserList size={22} weight="duotone" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Directory Total</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{totalCount} Students</div>
          </div>
        </div>

        {/* Total Active Enrolled */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
          <div style={{ background: '#ecfdf5', color: '#10b981', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Student size={22} weight="duotone" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Enrolled</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{enrolledCount} Active</div>
          </div>
        </div>

        {/* Total Graduated */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
          <div style={{ background: '#f0f9ff', color: '#0284c7', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={22} weight="duotone" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Alumni Graduated</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{graduatedCount} Degrees</div>
          </div>
        </div>

        {/* Total Suspended */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
          <div style={{ background: '#fef2f2', color: '#ef4444', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={22} weight="duotone" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Suspended Accounts</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444' }}>{suspendedCount} Accounts</div>
          </div>
        </div>

      </div>

      {/* Main Section */}
      <div className="section" style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', margin: 0 }}>
        
        {/* Section Title with Live Count */}
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Master Student Directory</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Search and manage academic lifecycle profiles.</p>
          </div>
          <span className="badge-count" style={{ background: '#f5f3ff', color: 'var(--primary-color, #4f46e5)', fontWeight: '800', fontSize: '12px', padding: '6px 14px', borderRadius: '20px' }}>
            {filtered.length} Matches Found
          </span>
        </div>

        {/* Dynamic Local Search & Filter Toolbar */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '260px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', transition: 'all 0.2s' }}>
            <MagnifyingGlass size={18} color="#64748b" weight="bold" />
            <input 
              type="text" 
              placeholder="Search students by name, roll number, program..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13.5px', color: '#0f172a', fontWeight: '600' }}
            />
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px' }}>
            <Funnel size={16} color="#64748b" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
            >
              <option value="all">All Academic Statuses</option>
              <option value="Enrolled">Active Enrolled</option>
              <option value="Graduated">Graduated Alumni</option>
              <option value="Suspended">Suspended Accounts</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>ROLL NUMBER</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>STUDENT NAME</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>PROGRAM</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>ACADEMIC STATUS</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <span className="id-cell" style={{ background: '#f5f3ff', color: 'var(--primary-color, #4f46e5)', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      {record.id}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div className="name-cell" style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{record.name}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    {record.program || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span className={`status-badge ${getStatusClass(record.status)}`} style={{ padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: '800' }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleEditRecord(record.id)} 
                        style={{ border: '1px solid #e2e8f0', background: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'var(--primary-color, #4f46e5)', display: 'inline-flex', transition: 'all 0.2s' }}
                        title="Edit Academic Status"
                      >
                        <PencilSimple size={16} weight="bold" />
                      </button>
                      <button 
                        onClick={() => handleViewTranscript(record.id)} 
                        style={{ border: '1px solid #e2e8f0', background: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#64748b', display: 'inline-flex', transition: 'all 0.2s' }}
                        title="View Official Transcript"
                      >
                        <Eye size={16} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '600' }}>
                    No student records match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrarStudentRecords;
