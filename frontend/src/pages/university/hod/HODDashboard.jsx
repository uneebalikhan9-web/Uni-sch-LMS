import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOD_STYLES as S } from './sections/HODStyles';
import API_BASE_URL from '../../../config/api';
import HODCourseOfferings from './sections/HODCourseOfferings';
import HODOBEMapping from './sections/HODOBEMapping';
import HODFYPManagement from './sections/HODFYPManagement';
import RegistrarTeacherWorkload from '../registrar/sections/RegistrarTeacherWorkload';
import { 
  House, 
  BookOpen, 
  ChalkboardTeacher, 
  Clock, 
  Target, 
  GraduationCap, 
  UserCheck, 
  SignOut,
  Bell,
  CheckCircle,
  Users
} from '@phosphor-icons/react';

const HODDashboard = ({ user = { name: "Dean / Department Head" }, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    facultyCount: 0,
    enrolledStudents: 0,
    activeCourses: 0,
    activeSections: 0
  });

  useEffect(() => {
    const fetchHODStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [tchRes, crsRes, secRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/teachers`, { headers }).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/courses`, { headers }).then(r => r.json()),
          fetch(`${API_BASE_URL}/api/course-sections`, { headers }).then(r => r.json())
        ]);

        setStats({
          facultyCount: (tchRes.teachers || tchRes.data || []).length,
          activeCourses: (crsRes.courses || crsRes.data || []).length,
          activeSections: (secRes.data || []).length,
          enrolledStudents: 480
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchHODStats();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Department Overview', icon: House },
    { id: 'offerings', label: 'Course Offerings & Sections', icon: BookOpen },
    { id: 'workload', label: 'Faculty Workload', icon: ChalkboardTeacher },
    { id: 'obe', label: 'OBE / CLO-PLO Mapping', icon: Target },
    { id: 'fyp', label: 'FYP & Thesis Projects', icon: GraduationCap }
  ];

  const handleSignOut = () => {
    sessionStorage.clear();
    navigate('/signin');
  };

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #438FFE 0%, #2563EB 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '800',
            fontSize: '18px'
          }}>
            HOD
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              Dean & HOD Departmental Command Center
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0 0' }}>
              Department of Computer Science & Software Engineering • Fall Term
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            <SignOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={S.navRow}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={S.navTab(active)}
            >
              <Icon size={18} weight={active ? 'bold' : 'regular'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div>
          <div style={S.grid4}>
            <div style={S.statCard('#3B82F6')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Department Faculty</span>
                <ChalkboardTeacher size={22} color="#3B82F6" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', margin: '12px 0 4px 0' }}>{stats.facultyCount}</div>
              <span style={{ fontSize: '12px', color: '#38BDF8' }}>Active Professors & Lecturers</span>
            </div>

            <div style={S.statCard('#10B981')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Active Sections</span>
                <BookOpen size={22} color="#10B981" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', margin: '12px 0 4px 0' }}>{stats.activeSections}</div>
              <span style={{ fontSize: '12px', color: '#34D399' }}>Class Offerings</span>
            </div>

            <div style={S.statCard('#8B5CF6')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>OBE Accreditation</span>
                <Target size={22} color="#8B5CF6" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', margin: '12px 0 4px 0' }}>100%</div>
              <span style={{ fontSize: '12px', color: '#C084FC' }}>CLO-PLO Mapped</span>
            </div>

            <div style={S.statCard('#F59E0B')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>FYP Projects</span>
                <GraduationCap size={22} color="#F59E0B" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', margin: '12px 0 4px 0' }}>Batch '26</div>
              <span style={{ fontSize: '12px', color: '#FCD34D' }}>Final Year Capstones</span>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px' }}>Departmental Overview & Quick Actions</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: '1.6' }}>
              Welcome to the Departmental Command Center. As Dean / HOD, you can orchestrate semester course offerings, assign teaching workloads within HEC limits, supervise Outcome-Based Education (OBE) mappings, and monitor Final Year Project progress.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
              <button style={S.btnPrimary} onClick={() => setActiveTab('offerings')}>
                <BookOpen size={18} /> Manage Course Offerings
              </button>
              <button style={{ ...S.btnPrimary, background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)' }} onClick={() => setActiveTab('obe')}>
                <Target size={18} /> View OBE Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'offerings' && <HODCourseOfferings />}
      {activeTab === 'workload' && <RegistrarTeacherWorkload />}
      {activeTab === 'obe' && <HODOBEMapping />}
      {activeTab === 'fyp' && <HODFYPManagement />}
    </div>
  );
};

export default HODDashboard;
