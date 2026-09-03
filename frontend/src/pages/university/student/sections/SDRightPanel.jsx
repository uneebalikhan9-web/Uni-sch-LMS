import React from 'react';
import { Bell, Clock } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDRightPanel({ user, courses, attendanceStats, grades = [], assignments = [], timetable = [], rightPanelOpen, setRightPanelOpen }) {
  // 1. Build dynamic notifications
  const notifications = [];
  
  // Add posted grades
  grades.forEach(cg => {
    if (cg.grades && Array.isArray(cg.grades)) {
      cg.grades.forEach(g => {
        notifications.push({
          id: `grade-${g.id}`,
          text: `Grade posted in ${cg.course_title || 'Course'}: ${g.grade_letter} (${g.marks_obtained}/${g.max_marks})`,
          timeText: g.exam_date ? new Date(g.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
          timestamp: g.exam_date ? new Date(g.exam_date).getTime() : 0
        });
      });
    }
  });

  // Add posted assignments
  assignments.forEach(a => {
    notifications.push({
      id: `assign-post-${a.id}`,
      text: `Assignment posted: ${a.title} (${a.course_title || 'Course'})`,
      timeText: a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
      timestamp: a.created_at ? new Date(a.created_at).getTime() : 0
    });
  });

  // Sort by date (descending)
  notifications.sort((a, b) => b.timestamp - a.timestamp);
  
  // Take top 3
  const activeNotifications = notifications.slice(0, 3);

  // 2. Build dynamic upcoming items
  const upcomingItems = [];

  // Add pending assignments
  assignments
    .filter(a => !a.marks_obtained && !a.submitted_at)
    .forEach(a => {
      upcomingItems.push({
        id: `assign-due-${a.id}`,
        text: `Due: ${a.title} on ${new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        timestamp: new Date(a.due_date).getTime()
      });
    });

  // Add timetable entries
  timetable.forEach(entry => {
    upcomingItems.push({
      id: `class-${entry.id}`,
      text: `${entry.course_title || 'Class'} (${entry.day_of_week} at ${entry.start_time})`,
      timestamp: 9999999999999 // Place classes secondary to due assignments
    });
  });

  // Sort upcoming items
  upcomingItems.sort((a, b) => a.timestamp - b.timestamp);

  // Take top 3
  const activeUpcoming = upcomingItems.slice(0, 3);

  return (
    <aside style={{
      ...S.rightPanel,
      transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'visible',
      padding: 0,
    }} className={`right-panel ${rightPanelOpen ? '' : 'collapsed'}`}>
      
      {/* Close button centered on left edge of right panel */}
      <button
        onClick={() => setRightPanelOpen(false)}
        style={{
          position: 'absolute',
          left: '-18px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          background: 'var(--primary-color, #4f46e5)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px 0 0 10px',
          width: '18px',
          height: '60px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '-4px 0 14px rgba(var(--primary-rgb, 79, 70, 229),0.35)',
          fontSize: '18px',
          fontWeight: '800',
          lineHeight: 1,
        }}
        className="sidebar-toggle-btn right-close-btn"
        title="Close profile panel"
      >
        ›
      </button>

      {/* Inner Scrollable Container */}
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 24px',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }} className="hidden-scrollbar">
        <div style={S.profileCard}>
          <div style={S.avatar}>{user.name.charAt(0)}</div>
          <h3 style={S.profileName}>{user.name}</h3>
          <span style={S.idBadge}>{user.roll_number || 'ID Pending'}</span>
          <div style={{fontSize: '0.8rem', color: '#64748b', marginBottom: '12px'}}>
            Semester {user.semester || 1}
          </div>
          
          <div style={S.profileStats}>
            <div style={S.profileStat} className="profile-stat">
              <span>Courses</span>
              <strong>{courses.length}</strong>
            </div>
            <div style={S.profileStat} className="profile-stat">
              <span>Attendance</span>
              <strong>{attendanceStats.percentage || 0}%</strong>
            </div>
          </div>
        </div>

        <div style={S.notificationCard}>
          <div style={S.notificationHeader} className="notification-header">
            <h4>Notifications</h4>
            <Bell size={16} color="#64748b" />
          </div>
          <div style={S.notificationList}>
            {activeNotifications.length > 0 ? (
              activeNotifications.map(n => (
                <div key={n.id} style={S.notificationItem}>
                  <div style={S.notificationDot}></div>
                  <div>
                    <p style={S.notificationText}>{n.text}</p>
                    <span style={S.notificationTime}>{n.timeText}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                All caught up! No notifications.
              </div>
            )}
          </div>
        </div>

        <div style={S.upcomingCard}>
          <h4 style={S.upcomingTitle}>Upcoming</h4>
          {activeUpcoming.length > 0 ? (
            activeUpcoming.map(item => (
              <div key={item.id} style={S.upcomingItem} className="upcoming-item">
                <Clock size={16} color="var(--primary-color, #4f46e5)" weight="duotone" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4' }}>{item.text}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No upcoming schedules or assignments.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
