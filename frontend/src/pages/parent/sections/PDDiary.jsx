import React, { useState, useEffect } from 'react';
import { S } from './PDStyles';
import API_BASE_URL from '../../../config/api';
import { CalendarBlank, CheckCircle, WarningCircle, NotePencil, BookOpen } from '@phosphor-icons/react';

export default function PDDiary({ student }) {
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const token = sessionStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/parent/diary/${student.student_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setDiary(d.diary || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [student]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading diary...</div>;

  return (
    <div className="animate-fadeIn">
      <div style={{ ...S.card, padding: '35px', background: 'linear-gradient(145deg, #ffffff, #f8fafc)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NotePencil size={24} color="#8b5cf6" weight="duotone" /> Digital Diary & Assignments
        </h3>

        {diary.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <BookOpen size={48} weight="duotone" />
            <p style={{ marginTop: '12px', fontWeight: 600 }}>No assignments found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {diary.map((item, idx) => {
              const isPastDue = new Date(item.due_date) < new Date();
              return (
                <div key={idx} className="hover-lift" style={{ padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isPastDue ? '#f1f5f9' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPastDue ? '#64748b' : '#7c3aed', flexShrink: 0 }}>
                    <BookOpen size={24} weight="duotone" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{item.title}</h4>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                        {item.course_title}
                      </span>
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>{item.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                      <CalendarBlank size={16} color={isPastDue ? "#ef4444" : "#10b981"} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: isPastDue ? "#ef4444" : "#10b981" }}>
                        Due: {new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {isPastDue && (
                        <span style={{ marginLeft: '10px', fontSize: '11px', color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>OVERDUE</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
