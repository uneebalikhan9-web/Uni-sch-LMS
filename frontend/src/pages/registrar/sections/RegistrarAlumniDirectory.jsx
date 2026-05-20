import React, { useState } from 'react';
import { 
  GraduationCap, MagnifyingGlass, Funnel, Info, 
  Calendar, Certificate, UserList, CheckCircle
} from '@phosphor-icons/react';

const RegistrarAlumniDirectory = ({ alumni = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  // Dynamic filter for instant results
  const filtered = alumni.filter(a => {
    const matchesSearch = 
      String(a.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(a.program || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = yearFilter === 'all' || String(a.graduation_year) === yearFilter;

    return matchesSearch && matchesYear;
  });

  // Extract unique graduation years for filter dropdown
  const uniqueYears = [...new Set(alumni.map(a => String(a.graduation_year)))].filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Informative Banner explaining the process */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)', border: '1px solid #dcfce7', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: '#10b981', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
          <GraduationCap size={22} weight="duotone" />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Institutional Alumni Archive</h4>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0, fontWeight: '600' }}>
            This register lists all official degree awardees who have successfully graduated from Lancers Tech Institute. This central registry is utilized for background verifications, corporate outreach, and institutional alumni relations.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="section" style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', margin: 0 }}>
        
        {/* Section Header */}
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Official Alumni Registry</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Search and query records of university graduates.</p>
          </div>
          <span className="badge-count" style={{ background: '#ecfdf5', color: '#10b981', fontWeight: '800', fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
            {filtered.length} Graduated Alumni
          </span>
        </div>

        {/* Dynamic Search & Filter Toolbar */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ flex: 1, minWidth: '260px', display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px' }}>
            <MagnifyingGlass size={18} color="#64748b" weight="bold" />
            <input 
              type="text" 
              placeholder="Search alumni by name, ID or degree program..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13.5px', color: '#0f172a', fontWeight: '600' }}
            />
          </div>

          {/* Batch Year Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px' }}>
            <Funnel size={16} color="#64748b" />
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
            >
              <option value="all">All Graduation Years</option>
              {uniqueYears.map(y => (
                <option key={y} value={y}>Batch {y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>ALUMNI ID</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>FULL NAME</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>DEGREE AWARDED</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>GRADUATION BATCH</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>FINAL CGPA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <span className="id-cell" style={{ background: '#f0f9ff', color: '#0284c7', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      {a.id}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div className="name-cell" style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{a.name}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Certificate size={15} color="#10b981" />
                      <span>{a.program || 'N/A'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '13.5px', color: '#0f172a', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                      <Calendar size={14} color="#64748b" />
                      <span>{a.graduation_year}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span className="cgpa-cell" style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '13px' }}>
                      {a.cgpa}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: '#f8fafc', borderRadius: '0 0 20px 20px', textAlign: 'center' }}>
                      <div style={{ background: '#f0f9ff', color: '#0284c7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 15px -3px rgba(2, 132, 199, 0.1)' }}>
                        <GraduationCap size={36} weight="duotone" />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>No Alumni Records</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px', margin: 0, fontWeight: '600', lineHeight: '1.5' }}>
                        No graduated alumni profiles found in the registry matching your query.
                      </p>
                    </div>
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

export default RegistrarAlumniDirectory;
