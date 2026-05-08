import React from 'react';
import { Buildings, Users, IdentificationCard, Armchair } from '@phosphor-icons/react';

const ExamsSeating = () => {
  const rooms = [
    { id: 1, name: 'Main Hall A', capacity: 200, used: 184, type: 'Examination Hall' },
    { id: 2, name: 'Library Floor 2', capacity: 120, used: 0, type: 'Quiet Zone' },
    { id: 3, name: 'Lab 04', capacity: 60, used: 58, type: 'Computer Lab' },
    { id: 4, name: 'Room 302', capacity: 40, used: 38, type: 'Classroom' }
  ];

  return (
    <div className="exams-seating-section">
      <div className="ex-metrics" style={{ marginBottom: 24 }}>
        <div className="ex-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#f5f3ff', padding: 12, borderRadius: 12, color: '#4f46e5' }}><Buildings size={24} weight="duotone" /></div>
            <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Total Rooms</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>14 Active</p>
            </div>
        </div>
        <div className="ex-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 12, color: '#10b981' }}><Armchair size={24} weight="duotone" /></div>
            <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Seat Capacity</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>850 Units</p>
            </div>
        </div>
      </div>

      <div className="ex-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {rooms.map(room => (
          <div key={room.id} className="ex-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{room.name}</h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', background: '#f1f5f9', borderRadius: 20 }}>{room.type}</span>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                <span style={{ color: '#64748b' }}>Occupancy</span>
                <span style={{ fontWeight: 700 }}>{room.used} / {room.capacity}</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(room.used / room.capacity) * 100}%`, height: '100%', background: room.used > room.capacity * 0.9 ? '#ef4444' : '#4f46e5', borderRadius: 4 }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ border: 'none', background: 'transparent', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Edit Seating Plan</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamsSeating;
