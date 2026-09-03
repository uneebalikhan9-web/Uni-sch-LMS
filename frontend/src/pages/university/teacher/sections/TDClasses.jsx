import { Buildings, BookOpen, Users, GraduationCap, Trash, CheckCircle } from "@phosphor-icons/react";
import { S } from "./TDStyles";

export default function TDClasses({ teacherClasses, courses, selectedClassId, setSelectedClassId, fetchClassCourses, handleManageGrades, handleGenerateReport }) {
  if (!selectedClassId) {
    return (
      <div style={S.tableCard} className="table-container animate-fadeIn">
        <div style={S.tableHeader}>
          <div>
            <h2 style={S.tableTitle}><Buildings size={28} weight="duotone" color="var(--primary-color, #4f46e5)" style={{ verticalAlign:'middle', marginRight:'12px' }} />My Classes</h2>
            <p style={S.tableSubtitle}>Classes assigned to you by the HOD</p>
          </div>
        </div>
        <div style={S.classesGrid}>
          {teacherClasses.map(cls => (
            <div key={cls.id} style={S.classCard} className="metric-card" onClick={() => { setSelectedClassId(cls.id); fetchClassCourses(cls.id); }}>
              <div style={S.classCardHeader}>
                <span style={S.classYearBadge}>{cls.academic_year}</span>
                <span style={S.classStudentCount}><Users size={14} /> {cls.student_count || 0}</span>
              </div>
              <h3 style={S.className}>{cls.name}</h3>
              <p style={S.classSection}><Buildings size={16} weight="duotone" /> Section: {cls.section}</p>
              <div style={S.classFooter}>
                <span style={S.classCoursesCount}><BookOpen size={12} /> {cls.course_count || 0} courses</span>
              </div>
            </div>
          ))}
        </div>
        {teacherClasses.length === 0 && (
          <div style={S.emptyState}>
            <GraduationCap size={48} weight="duotone" />
            <p>No classes assigned yet. Contact your HOD to get classes assigned.</p>
          </div>
        )}
      </div>
    );
  }

  const cls = teacherClasses.find(c => c.id === selectedClassId);
  return (
    <div className="animate-fadeIn">
      <button onClick={() => setSelectedClassId(null)} style={S.backButton}>← Back to Classes</button>
      <div style={S.tableCard} className="table-container">
        <div style={S.tableHeader}>
          <div>
            <h2 style={S.tableTitle}>{cls?.name}</h2>
            <p style={S.tableSubtitle}>Manage courses for this class</p>
          </div>
        </div>
        <div style={S.coursesList}>
          <h4 style={S.listSubtitle}>Active Courses</h4>
          {courses.length > 0 ? (
            <table style={S.table}>
              <thead>
                <tr style={S.tableHeadRow}>
                  <th style={S.th}>COURSE TITLE</th>
                  <th style={S.th}>DESCRIPTION</th>
                  <th style={S.th}>STUDENTS</th>
                  <th style={{ ...S.th, textAlign:'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id} style={S.tableRow}>
                    <td style={S.tdName}>{course.title}</td>
                    <td style={S.td}>{course.description || "—"}</td>
                    <td style={S.td}>{course.enrolled_students || 0}</td>
                    <td style={{ ...S.td, textAlign:'right' }}>
                      <div style={S.actionGroup}>
                        <button onClick={() => handleManageGrades(course)} style={S.iconBtn} title="Manage Grades"><GraduationCap size={16} /></button>
                        {course.status !== 'completed' && (
                          <button onClick={() => handleGenerateReport(course.id, course.title)}
                            style={{ ...S.iconBtn, color:'#22c55e', fontSize:'10px', padding:'6px 10px', gap:'4px', display:'flex', alignItems:'center', background:'#dcfce7', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:600 }}
                            title="Mark Complete & Generate Report">
                            <CheckCircle size={14} weight="fill" /> Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={S.emptyMessage}>No courses in this class yet.</p>}
        </div>
      </div>
    </div>
  );
}
