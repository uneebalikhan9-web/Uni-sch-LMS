import React from 'react';
import { IdentificationCard, Buildings, BookOpen, User, ClipboardText, PlusCircle } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDRegistration({ 
  registrationTab, 
  setRegistrationTab, 
  availableClasses, 
  expandedClassId, 
  setExpandedClassId, 
  fetchClassSubjects, 
  handleRegisterClass, 
  registering, 
  myClassSubjects, 
  handleEnrollCourse, 
  courses, 
  availableCourses, 
  enrolling,
  setSelectedCourse,
  setActivePage
}) {
  return (
    <div className="animate-fadeIn">
      <h2 style={S.sectionTitle}>
        <IdentificationCard size={28} weight="duotone" color="#4f46e5" style={{verticalAlign:'middle', marginRight:'12px'}} />
        Registration Center
      </h2>
      
      {/* Tabs */}
      <div style={S.tabContainer}>
        <button 
          onClick={() => setRegistrationTab('class')}
          style={{
            ...S.tabBtn,
            color: registrationTab === 'class' ? '#0f172a' : '#94a3b8',
            borderBottom: registrationTab === 'class' ? '3px solid #4f46e5' : '3px solid transparent',
          }}
        >
          Class Registration
        </button>
        <button 
          onClick={() => setRegistrationTab('courses')}
          style={{
            ...S.tabBtn,
            color: registrationTab === 'courses' ? '#0f172a' : '#94a3b8',
            borderBottom: registrationTab === 'courses' ? '3px solid #4f46e5' : '3px solid transparent',
          }}
        >
          Browse All Courses
        </button>
      </div>

      {registrationTab === 'class' ? (
        /* CLASS REGISTRATION TAB */
        availableClasses.length === 0 ? (
          <div style={S.emptyState}>
            <Buildings size={48} weight="duotone" color="#94a3b8" />
            <p>No classes available for registration.</p>
          </div>
        ) : (
          <div style={S.classesGrid}>
            {availableClasses.map(cls => (
              <div key={cls.id} style={{
                ...S.classCard,
                border: expandedClassId === cls.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={S.className}>{cls.name}</h3>
                    <p style={S.classInfo}>Section: {cls.section}</p>
                  </div>
                  {cls.is_registered > 0 && (
                    <span style={{ 
                      background: '#dcfce7', 
                      color: '#166534', 
                      fontSize: '10px', 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontWeight: 700 
                    }}>✓ REGISTERED</span>
                  )}
                </div>
                <p style={S.classTeacher}>
                  <User size={14} /> {cls.teacher_name || 'TBD'}
                </p>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {!cls.is_registered ? (
                    <button 
                      onClick={() => handleRegisterClass(cls.id)} 
                      disabled={registering} 
                      style={{
                        ...S.registerBtn,
                        flex: 1,
                        opacity: registering ? 0.6 : 1,
                        background: '#0f172a'
                      }}
                    >
                      {registering ? 'Processing...' : 'Register Now'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (expandedClassId === cls.id) {
                          setExpandedClassId(null);
                        } else {
                          setExpandedClassId(cls.id);
                          fetchClassSubjects(cls.id);
                        }
                      }}
                      style={{
                        ...S.registerBtn,
                        flex: 1,
                        background: expandedClassId === cls.id ? '#4f46e5' : '#f1f5f9',
                        color: expandedClassId === cls.id ? '#fff' : '#475569',
                        border: expandedClassId === cls.id ? 'none' : '1px solid #e2e8f0'
                      }}
                    >
                      {expandedClassId === cls.id ? 'Hide Courses' : 'View Courses'}
                    </button>
                  )}
                </div>

                {/* Course List within a Class */}
                {expandedClassId === cls.id && (
                  <div style={{ 
                    marginTop: '16px', 
                    paddingTop: '16px', 
                    borderTop: '1px solid #f1f5f9',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Available Courses
                    </h4>
                    {myClassSubjects.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No courses found for this class.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {myClassSubjects.map(sub => (
                          <div key={sub.id} style={{ 
                            background: '#f8fafc', 
                            padding: '10px', 
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid #f1f5f9'
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{sub.title}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{sub.teacher_name || 'Instructor TBD'}</div>
                            </div>
                            
                            {/* Enrollment Status Handler */}
                            {sub.enrollment_status === 'approved' ? (
                              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>✓ Enrolled</span>
                            ) : sub.enrollment_status === 'pending' ? (
                              <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 700, fontStyle: 'italic' }}>⏳ Pending</span>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleEnrollCourse(sub.id); }}
                                style={{
                                  background: '#fff',
                                  border: '1.5px solid #4f46e5',
                                  color: '#4f46e5',
                                  fontSize: '0.75rem',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* BROWSE COURSES TAB */
          <div>
            {/* My Applications Section */}
            {courses.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ ...S.sectionTitle, fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardText size={20} weight="duotone" color="#4f46e5" />
                  My Course Applications
                </h3>
                <div style={S.coursesGrid}>
                  {courses.map(course => (
                    <div key={course.id} style={{ ...S.courseCard, border: course.status === 'pending' ? '1px dashed #f59e0b' : '1px solid #e2e8f0' }}>
                      <div style={S.courseCardHeader}>
                        <div style={{ ...S.courseIcon, background: course.status === 'pending' ? '#fffbeb' : '#f0f9ff' }}>
                          <BookOpen size={24} weight="bold" color={course.status === 'pending' ? '#f59e0b' : '#3b82f6'} />
                        </div>
                        <span style={{ 
                          ...S.availableTag, 
                          background: course.status === 'pending' ? '#fffbeb' : '#dcfce7',
                          color: course.status === 'pending' ? '#92400e' : '#166534',
                          border: course.status === 'pending' ? '1px solid #fcd34d' : '1px solid #b9f6ca'
                        }}>
                          {course.status === 'pending' ? '⏳ Pending' : '✓ Enrolled'}
                        </span>
                      </div>
                      <h3 style={S.courseTitle}>{course.title}</h3>
                      <div style={S.courseFooter}>
                        <User size={14} /> {course.teacher_name || 'Instructor TBD'}
                      </div>
                      {course.status === 'pending' && (
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
                          Waiting for teacher's approval...
                        </p>
                      )}
                      {course.status === 'approved' && (
                        <button 
                          onClick={() => { setSelectedCourse(course); setActivePage('course-detail'); }}
                          style={{ ...S.enrollBtn, marginTop: '16px' }}
                        >
                          View Course Details
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ height: '1px', background: '#e2e8f0', margin: '40px 0' }}></div>
              </div>
            )}

            <h3 style={{ ...S.sectionTitle, fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} weight="duotone" color="#4f46e5" />
              Available Courses
            </h3>
            {availableCourses.length === 0 ? (
              <div style={S.emptyState}>
                <BookOpen size={48} weight="duotone" color="#94a3b8" />
                <p>No new courses available for enrollment.</p>
              </div>
            ) : (
              <div style={S.coursesGrid}>
                {availableCourses.map(course => (
                  <div key={course.id} style={S.courseCard}>
                    <div style={S.courseCardHeader}>
                      <div style={S.courseIcon}>
                        <BookOpen size={24} weight="bold" color="#fff" />
                      </div>
                      <span style={S.availableTag}>Available</span>
                    </div>
                    <h3 style={S.courseTitle}>{course.title}</h3>
                    <p style={S.courseDesc}>{course.description || 'No description available.'}</p>
                    <div style={S.courseFooter}>
                      <User size={14} /> {course.teacher_name || 'Instructor TBD'}
                    </div>
                    <button 
                      onClick={() => handleEnrollCourse(course.id)} 
                      disabled={enrolling}
                      style={{...S.enrollBtn, opacity: enrolling ? 0.6 : 1}}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
      )}
    </div>
  );
}
