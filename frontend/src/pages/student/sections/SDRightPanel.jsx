import React from 'react';
import { Bell, Clock } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDRightPanel({ user, courses, attendanceStats }) {
  return (
    <aside style={S.rightPanel} className="right-panel">
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
          <div style={S.notificationItem}>
            <div style={S.notificationDot}></div>
            <div>
              <p style={S.notificationText}>New grade posted in Applied Physics</p>
              <span style={S.notificationTime}>2 hours ago</span>
            </div>
          </div>
          <div style={S.notificationItem}>
            <div style={S.notificationDot}></div>
            <div>
              <p style={S.notificationText}>Assignment due tomorrow: Math Quiz</p>
              <span style={S.notificationTime}>5 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      <div style={S.upcomingCard}>
        <h4 style={S.upcomingTitle}>Upcoming</h4>
        <div style={S.upcomingItem} className="upcoming-item">
          <Clock size={20} color="#4f46e5" weight="duotone" />
          <span>Maths Quiz tomorrow at 10:00 AM</span>
        </div>
        <div style={S.upcomingItem} className="upcoming-item">
          <Clock size={14} color="#4f46e5" />
          <span>Physics Lab at 2:00 PM</span>
        </div>
      </div>
    </aside>
  );
}
