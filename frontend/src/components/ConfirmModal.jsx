import React from 'react';
import './ConfirmModal.css';
import { Warning, X } from "@phosphor-icons/react";

/**
 * Custom Confirm Modal to replace window.confirm()
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} title - Modal title
 * @param {string} message - Content message
 * @param {function} onConfirm - Success callback
 * @param {function} onCancel - Cancel callback
 * @param {string} confirmText - Label for confirm button
 * @param {string} cancelText - Label for cancel button
 * @param {boolean} isDanger - If true, confirm button will be red
 */
const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  isDanger = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fadeIn">
      <div className="confirm-modal animate-slideUp">
        <div className="modal-header">
          <div className={`modal-icon ${isDanger ? 'bg-danger' : 'bg-primary'}`}>
            <Warning size={24} weight="bold" color="white" />
          </div>
          <button className="modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn-confirm ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
