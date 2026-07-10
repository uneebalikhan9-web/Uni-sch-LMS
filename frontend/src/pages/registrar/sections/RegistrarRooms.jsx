import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { Building, Plus, PencilSimple, Trash, Check, X, Spinner } from '@phosphor-icons/react';

const RegistrarRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Form fields
  const [building, setBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('lecture');
  const [capacity, setCapacity] = useState(30);
  const [isAC, setIsAC] = useState(false);
  const [hasProjector, setHasProjector] = useState(false);
  const [hasSmartBoard, setHasSmartBoard] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [notes, setNotes] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setBuilding('');
    setRoomNumber('');
    setRoomType('lecture');
    setCapacity(30);
    setIsAC(false);
    setHasProjector(false);
    setHasSmartBoard(false);
    setIsAvailable(true);
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setBuilding(room.building);
    setRoomNumber(room.room_number);
    setRoomType(room.room_type);
    setCapacity(room.capacity);
    setIsAC(room.is_air_conditioned === 1);
    setHasProjector(room.has_projector === 1);
    setHasSmartBoard(room.has_smart_board === 1);
    setIsAvailable(room.is_available === 1);
    setNotes(room.notes || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        building,
        room_number: roomNumber,
        room_type: roomType,
        capacity: parseInt(capacity),
        is_air_conditioned: isAC,
        has_projector: hasProjector,
        has_smart_board: hasSmartBoard,
        is_available: isAvailable,
        notes
      };

      if (editingRoom) {
        await axios.put(`${API_BASE_URL}/api/rooms/${editingRoom.id}`, payload, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/api/rooms`, payload, { headers });
      }
      setModalOpen(false);
      fetchRooms();
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room? It might be in use by classes.')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRooms();
    } catch (error) {
      alert('Error deleting room');
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '80vh', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={28} weight="duotone" color="var(--reg-primary, var(--primary-color, #4f46e5))" />
            Classroom & Room Management
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Manage campus lecture halls, computer labs, and auditorium capacities.</p>
        </div>
        
        <button onClick={openAddModal} className="action-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
          <Plus size={20} weight="bold" />
          Add Room
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px' }}><Spinner size={40} className="spinner" /></div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <Building size={60} weight="thin" color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569' }}>No classrooms registered yet</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 20px 0' }}>Register the university's lecture halls and labs.</p>
          <button onClick={openAddModal} className="action-btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Create Room</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {rooms.map((room) => (
            <div key={room.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative', transition: 'all 0.2s' }} className="card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                    {room.room_type}
                  </span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
                    {room.room_number}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    {room.building}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => openEditModal(room)} style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}><PencilSimple size={16} /></button>
                  <button onClick={() => handleDelete(room.id)} style={{ background: '#fef2f2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}><Trash size={16} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  Cap: {room.capacity}
                </span>
                {room.is_air_conditioned === 1 && (
                  <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    AC
                  </span>
                )}
                {room.has_projector === 1 && (
                  <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#6d28d9', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    Projector
                  </span>
                )}
                {room.has_smart_board === 1 && (
                  <span style={{ fontSize: '11px', background: '#fff7ed', color: '#c2410c', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    Smart Board
                  </span>
                )}
              </div>

              {room.notes && (
                <p style={{ fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #cbd5e1', margin: 0 }}>
                  {room.notes}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: room.is_available === 1 ? '#10b981' : '#ef4444', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: room.is_available === 1 ? '#10b981' : '#ef4444' }}></div>
                {room.is_available === 1 ? 'Available for booking' : 'Unavailable'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{editingRoom ? 'Edit Classroom Details' : 'Add New Classroom'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Building / Block *</label>
                <input type="text" value={building} onChange={(e) => setBuilding(e.target.value)} required placeholder="e.g. Science Block, Sector C" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Room Number / Name *</label>
                <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} required placeholder="e.g. Room-102, Lab-3" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Room Type *</label>
                  <select value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="lecture">Lecture Hall</option>
                    <option value="lab">Computer/Sci Lab</option>
                    <option value="seminar">Seminar Room</option>
                    <option value="auditorium">Auditorium</option>
                    <option value="exam_hall">Exam Hall</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Capacity *</label>
                  <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required min={1} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Facilities & Status</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={isAC} onChange={(e) => setIsAC(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    Air Conditioned
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={hasProjector} onChange={(e) => setHasProjector(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    Projector
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={hasSmartBoard} onChange={(e) => setHasSmartBoard(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    Smart Board
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    Available for Booking
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Notes / Remarks</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific configurations (e.g. 50 PC seats, CISCO router lab)" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', minHeight: '80px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: 'white', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', border: 'none', cursor: 'pointer' }}>Save Room</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarRooms;
