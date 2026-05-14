import {
  Plus, PencilSimple, Trash, CheckCircle, XCircle,
  Check, ArrowsCounterClockwise, ChartBar, BookOpen, Flask,
  FileText, SquaresFour, WarningCircle, Pulse
} from "@phosphor-icons/react";
import { S } from "./PDStyles";

const renderLabIcon = (iconName) => {
  switch (iconName) {
    case 'Flask':    return <Flask        size={18} weight="duotone" />;
    case 'Pulse':    return <Pulse        size={18} weight="duotone" />;
    case 'Code':     return <FileText     size={18} weight="duotone" />;
    case 'Database': return <SquaresFour  size={18} weight="duotone" />;
    case 'Shield':   return <WarningCircle size={18} weight="duotone" />;
    case 'Globe':    return <ChartBar     size={18} weight="duotone" />;
    case 'Layout':   return <SquaresFour  size={18} weight="duotone" />;
    default:         return <Flask        size={18} weight="duotone" />;
  }
};

export default function PDDataTable({
  activeTab, tableData,
  setShowAddModal, setEditingItem,
  onDelete, onApprove, onReject,
  onUpdateCourseStatus, onGenerateReport,
  onOpenClassCourses, onOpenStudentProfile, setActiveTab, setNewCourse,
  courses,
}) {
  const singularTab = (tab) => {
    if (tab === 'classes') return 'class';
    if (tab === 'pending') return 'student';
    if (tab === 'labs')    return 'lab';
    if (tab === 'history') return 'course';
    return tab.slice(0, -1);
  };

  const unimplementedTabs = ['exams', 'finance', 'library', 'feedback', 'lab_reports', 'course_reports', 'timetable', 'history'];
  const showAddButton = activeTab !== 'pending' && !unimplementedTabs.includes(activeTab);

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      {/* Table Header */}
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}>{activeTab.replace('_', ' ')}</h2>
          <p style={S.tableSubtitle}>{tableData.length} {activeTab.replace('_', ' ')} total</p>
        </div>
        <div style={S.tableActions}>
          {showAddButton && (
            <button onClick={() => setShowAddModal(true)} style={S.addBtn} className="add-btn">
              <Plus size={18} weight="bold" /> Add New
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr style={S.tableHeadRow}>
              <th style={S.th}>{activeTab === 'lab_reports' ? 'STUDENT / LAB' : 'NAME / TITLE'}</th>
              {activeTab === 'students'    && <th style={S.th}>ROLL NO</th>}
              {activeTab === 'students'    && <th style={S.th}>SEM</th>}
              {activeTab === 'lab_reports' && <th style={S.th}>DATE</th>}
              {activeTab === 'labs'        && <th style={S.th}>URL</th>}
              <th style={S.th}>{activeTab === 'lab_reports' ? 'DURATION' : 'EMAIL / DETAIL'}</th>
              {(activeTab === 'classes' || activeTab === 'courses') && <th style={S.th}>TEACHER</th>}
              {activeTab === 'courses' && <th style={S.th}>STATUS</th>}
              <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={`${activeTab}-${item.id || index}`} style={S.tableRow}>
                {/* Name / Title cell */}
                <td style={S.tdName}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {activeTab === 'labs' && renderLabIcon(item.icon)}
                    {activeTab === 'lab_reports' ? (
                      <>
                        {item.student_name}
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{item.lab_name}</div>
                      </>
                    ) : (
                      <div
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          cursor: (activeTab === 'classes' || activeTab === 'students') ? 'pointer' : 'default' 
                        }}
                        onClick={() => {
                          if (activeTab === 'classes') onOpenClassCourses(item);
                          if (activeTab === 'students') onOpenStudentProfile(item);
                        }}
                      >
                        <span style={activeTab === 'students' ? { color: '#7c3aed', fontWeight: 700 } : {}}>{item.name || item.title}</span>
                        {activeTab === 'classes' && (
                          <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <BookOpen size={10} weight="fill" /> {item.course_count || 0} Courses
                          </span>
                        )}
                        {activeTab === 'students' && (
                          <span style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            View Profile
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {activeTab === 'students' && <td style={S.td}>{item.roll_number || <span style={{ color: '#94a3b8' }}>Pending</span>}</td>}
                {activeTab === 'students' && <td style={S.td}>{item.semester || 1}</td>}
                {activeTab === 'lab_reports' && <td style={S.td}>{new Date(item.date).toLocaleDateString()}</td>}
                {activeTab === 'labs' && <td style={S.td}>{item.url || '—'}</td>}

                <td style={S.td}>
                  {activeTab === 'lab_reports'
                    ? `${item.time_spent || 0} mins`
                    : item.email || item.section || (item.description || '').substring(0, 40)}
                </td>

                {(activeTab === 'classes' || activeTab === 'courses') && <td style={S.td}>{item.teacher_name || '—'}</td>}
                {activeTab === 'courses' && (
                  <td style={S.td}>
                    <span style={{ ...S.statusBadge, background: item.status === 'active' ? '#dcfce7' : '#fee2e2', color: item.status === 'active' ? '#166534' : '#991b1b' }}>
                      {item.status || 'active'}
                    </span>
                  </td>
                )}

                {/* Actions */}
                <td style={{ ...S.td, textAlign: 'right' }}>
                  {activeTab === 'pending' ? (
                    <div style={S.actionGroup}>
                      <button style={S.approveBtn} className="approve-btn" onClick={() => onApprove(item.id, item.name)}>
                        <CheckCircle size={14} weight="fill" /> Approve
                      </button>
                      <button style={S.rejectBtn} className="reject-btn" onClick={() => onReject(item.id, item.name)}>
                        <XCircle size={14} weight="fill" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div style={S.actionGroup}>
                      {activeTab === 'courses' && (
                        <button style={{ ...S.iconBtn, color: '#22c55e' }} title="Complete Course" onClick={() => onUpdateCourseStatus(item.id, 'completed')}>
                          <Check size={16} weight="bold" />
                        </button>
                      )}
                      {activeTab === 'history' && (
                        <>
                          <button style={{ ...S.iconBtn, color: '#7c3aed' }} title="Re-activate" onClick={() => onUpdateCourseStatus(item.id, 'active')}>
                            <ArrowsCounterClockwise size={16} weight="bold" />
                          </button>
                          <button style={{ ...S.iconBtn, color: '#22c55e' }} title="Generate Report" onClick={() => onGenerateReport(item.id, item.title)}>
                            <ChartBar size={16} weight="bold" />
                          </button>
                        </>
                      )}
                      {activeTab === 'classes' && (
                        <button style={{ ...S.iconBtn, color: '#7c3aed' }} title="Add Course to Class"
                          onClick={() => {
                            setActiveTab('courses');
                            setNewCourse(prev => ({ ...prev, class_id: item.id }));
                            setShowAddModal(true);
                          }}
                        >
                          <Plus size={16} weight="bold" />
                        </button>
                      )}
                      {activeTab !== 'lab_reports' && (
                        <button style={S.iconBtn} onClick={() => { setEditingItem(item); setShowAddModal(true); }}>
                          <PencilSimple size={16} />
                        </button>
                      )}
                      <button style={S.deleteBtn} onClick={() => onDelete(item.id, activeTab === 'history' ? 'course' : singularTab(activeTab))}>
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr>
                <td colSpan="8" style={{ ...S.td, textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                  No {activeTab.replace('_', ' ')} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
