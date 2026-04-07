import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import './Dashboard.css';

const PendingStudents = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false
  });

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/pending-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPendingStudents(response.data.students);
      }
    } catch (err) {
      console.error('Error fetching pending students:', err);
      setError('Failed to load pending students');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (studentId, studentName) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Student",
      message: `Approve registration for ${studentName}?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const token = sessionStorage.getItem('token');
          const response = await axios.put(
            `${API_BASE_URL}/api/pending-students/${studentId}/approve`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            showToast(`${studentName} approved successfully!`, "success");
            setPendingStudents(prev => prev.filter(s => s.id !== studentId));
          }
        } catch (err) {
          showToast("Failed to approve student", "error");
        }
      },
      isDanger: false
    });
  };

  const handleReject = (studentId, studentName) => {
    setConfirmModal({
      isOpen: true,
      title: "Reject Student",
      message: `Reject and delete registration for ${studentName}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const token = sessionStorage.getItem('token');
          const response = await axios.delete(
            `${API_BASE_URL}/api/pending-students/${studentId}/reject`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.success) {
            showToast(`${studentName} rejected and removed`, "info");
            setPendingStudents(prev => prev.filter(s => s.id !== studentId));
          }
        } catch (err) {
          showToast("Failed to reject student", "error");
        }
      },
      isDanger: true
    });
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading pending students...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />
      <div className="admin-header">
        <h1>Pending Student Approvals</h1>
        <p className="subtitle">Review and approve new student registrations</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {pendingStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <h3>No Pending Approvals</h3>
          <p>All student registrations have been reviewed</p>
        </div>
      ) : (
        <div className="content-card">
          <div className="card-header">
            <h2>Pending Students ({pendingStudents.length})</h2>
          </div>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Email</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map(student => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="student-name">{student.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{student.department_name || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">Sem {student.semester || '1'}</span>
                    </td>
                    <td>{student.email}</td>
                    <td>{new Date(student.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleApprove(student.id, student.name)}
                          className="btn btn-success btn-sm"
                          title="Approve Student"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(student.id, student.name)}
                          className="btn btn-danger btn-sm"
                          title="Reject Student"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingStudents;
