import React, { useState } from 'react';
import { MagnifyingGlass, Plus, Funnel, Books } from '@phosphor-icons/react';

const BookCatalog = ({ books, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const currentBooks = (books || []).filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'All' || book.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="catalog-section animate-fadeIn">
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
          <MagnifyingGlass size={20} color="#64748b" weight="bold" />
          <input 
            type="text" 
            placeholder="Search by title, author or ISBN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontWeight: 600, color: '#0f172a' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Issued">Issued</option>
            <option value="Reserved">Reserved</option>
          </select>
          <button className="primary-btn" onClick={onAdd}>
            <Plus size={18} weight="bold" /> Add Book
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
          <thead>
            <tr>
              <th>ID / ISBN</th>
              <th>Book Title</th>
              <th>Author</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBooks.map((book) => (
              <tr key={book.id}>
                <td style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>{book.isbn}</td>
                <td style={{ fontWeight: 800, color: '#0f172a' }}>{book.title}</td>
                <td style={{ fontWeight: 600, color: '#475569' }}>{book.author}</td>
                <td><span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{book.rack_location}</span></td>
                <td>
                  <span className={`status-badge status-${book.status.toLowerCase()}`}>
                    {book.status}
                  </span>
                </td>
                <td>
                  <button style={{ background: 'transparent', border: 'none', color: '#0891b2', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default BookCatalog;
