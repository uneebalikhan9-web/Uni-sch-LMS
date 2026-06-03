import React, { useState } from 'react';
import { S } from './RDStyles';
import { MagnifyingGlass, Funnel, DownloadSimple, DotsThreeVertical } from '@phosphor-icons/react';
import RDActionModal from './RDActionModal';
import { useToast } from '../../../components/Toast';

const RDDataTable = ({ title, activeTab, data = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortReversed, setSortReversed] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  // Action Modal State
  const [modalType, setModalType] = useState(null); // 'view', 'edit', 'delete'
  const [selectedItem, setSelectedItem] = useState(null);
  const [localData, setLocalData] = useState(data);

  // Sync props data to local state for simulated edits
  React.useEffect(() => { setLocalData(data); }, [data]);

  const { showToast } = useToast();
  const getHeaders = () => {
    switch(activeTab) {
      case 'faculty':  return ['Name', 'Designation', 'Department', 'Load', 'Status'];
      case 'students': return ['Academic Year', 'Intake', 'Retention', 'Avg GPA', 'Growth'];
      case 'research': return ['Active Course / Research', 'Instructor', 'Enrolled', 'Academic Year', 'Impact'];
      case 'compliance': return ['Accreditation', 'Body', 'Valid Until', 'Last Audit', 'Risk'];
      default: return ['Item', 'Detail', 'Metric', 'Date', 'Status'];
    }
  };

  const headers = getHeaders();

  // Filter & Sort Logic
  const filteredData = localData.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const displayedData = sortReversed ? [...filteredData].reverse() : filteredData;

  const handleDownload = () => {
    if (displayedData.length === 0) return alert('No data to download!');
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + displayedData.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = (type, item) => {
    setActiveMenu(null);
    setSelectedItem(item);
    setModalType(type);
  };

  const handleSaveEdit = (updatedItem) => {
    setLocalData(prev => prev.map(item => item === selectedItem ? updatedItem : item));
    setModalType(null);
    showToast('Record updated successfully (Local State)', 'success');
  };

  const handleDelete = (itemToDelete) => {
    setLocalData(prev => prev.filter(item => item !== itemToDelete));
    setModalType(null);
    showToast('Record deleted successfully (Local State)', 'success');
  };

  return (
    <div style={S.card}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
        <div>
          <h2 style={{...S.cardTitle, marginBottom:'4px'}}>{title}</h2>
          <p style={{margin:0, fontSize:'0.85rem', color:'#64748b'}}>Institutional records and metrics for {activeTab}</p>
        </div>
        <div style={{display:'flex', gap:'12px'}}>
          <div style={{position:'relative'}}>
             <MagnifyingGlass size={18} style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}} />
             <input 
               placeholder="Search..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               style={{padding:'10px 15px 10px 40px', borderRadius:'12px', border:'1px solid #e2e8f0', fontSize:'0.85rem'}} 
             />
          </div>
          <button onClick={() => setSortReversed(!sortReversed)} style={{padding:'10px', background: sortReversed ? '#e2e8f0' : '#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', cursor:'pointer'}} title="Reverse Sorting"><Funnel size={20} color="#64748b" /></button>
          <button onClick={handleDownload} style={{padding:'10px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', cursor:'pointer'}} title="Download CSV"><DownloadSimple size={20} color="#64748b" /></button>
        </div>
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={S.table}>
          <thead>
            <tr>
              {headers.map(h => <th key={h} style={S.th}>{h}</th>)}
              <th style={{...S.th, textAlign:'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.length > 0 ? displayedData.map((item, i) => (
              <tr key={i} style={S.tr}>
                {Object.values(item).map((val, idx) => (
                  <td key={idx} style={{...S.td, ...(idx === 0 ? S.tdFirst : {}), ...(idx === Object.values(item).length - 1 ? S.tdLast : {})}}>
                    {typeof val === 'string' && val.includes('%') ? (
                       <span style={{color:'#1e3a8a', fontWeight:'800'}}>{val}</span>
                    ) : val}
                  </td>
                ))}
                <td style={{...S.td, ...S.tdLast, textAlign:'right', position: 'relative'}}>
                  <button 
                    onClick={() => setActiveMenu(activeMenu === i ? null : i)}
                    style={{background:'none', border:'none', cursor:'pointer'}}
                  >
                    <DotsThreeVertical size={18} color="#64748b" />
                  </button>
                  {activeMenu === i && (
                    <div style={{
                      position: 'absolute',
                      right: '30px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '4px',
                      minWidth: '120px'
                    }}>
                      <button onClick={() => handleAction('view', item)} style={{textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#1e3a8a'}}>View Details</button>
                      <button onClick={() => handleAction('edit', item)} style={{textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#10b981'}}>Edit Record</button>
                      <button onClick={() => handleAction('delete', item)} style={{textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#ef4444'}}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={headers.length + 1} style={{textAlign:'center', padding:'60px', color:'#94a3b8', fontSize:'0.9rem'}}>
                  No records found in the {activeTab} nexus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {modalType && (
        <RDActionModal 
          type={modalType} 
          item={selectedItem} 
          onClose={() => setModalType(null)} 
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default RDDataTable;
