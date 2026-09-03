import React, { useState } from 'react';
import { 
  Buildings, Trash, Wallet, 
  Tag, Calendar, MagnifyingGlass, Funnel, Plus, ListNumbers
} from "@phosphor-icons/react";

const FinExpenses = ({ expenses, onAction, readOnly = false }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleDelete = async (id) => {
    if (window.confirm('Remove this expense record?')) {
      await onAction('DELETE', `/expenses/${id}`);
    }
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'utilities': return <Buildings size={16} weight="duotone" />;
      case 'maintenance': return <Wallet size={16} weight="duotone" />;
      case 'supplies': return <ListNumbers size={16} weight="duotone" />;
      default: return <Tag size={16} weight="duotone" />;
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fin-animate">
      {/* Top Banner and Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#f5f3ff', color: '#6366f1', borderRadius: '16px', padding: '16px', display: 'flex' }}>
            <Wallet size={32} weight="duotone" />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Operational Expenses</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>Rs. {totalExpense.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#ecfdf5', color: '#10b981', borderRadius: '16px', padding: '16px', display: 'flex' }}>
            <Calendar size={32} weight="duotone" />
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Recorded Entries</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{expenses.length} Records</div>
          </div>
        </div>
      </div>

      {/* Interactive Toolbar: Search, Filters */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="fin-search-box" style={{ flex: 1, minWidth: '280px' }}>
          <MagnifyingGlass size={20} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search expenses by title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 16px' }}>
          <Funnel size={18} color="#64748b" />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 700, color: '#0f172a', cursor: 'pointer', fontSize: '14px' }}
          >
            <option value="all">All Categories</option>
            <option value="utilities">Utilities</option>
            <option value="maintenance">Maintenance</option>
            <option value="supplies">Supplies</option>
            <option value="events">Events</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Expense Card Grid */}
      <div className="fin-expense-grid">
        {filteredExpenses.map(e => (
          <div key={e.id} className={`fin-expense-card ${e.category || 'other'}`}>
            <div className="fin-expense-main">
              <div className="fin-expense-category">
                {getCategoryIcon(e.category)}
                <span>{e.category}</span>
              </div>
              <div className="fin-expense-title">{e.title}</div>
              <div className="fin-expense-date">
                <Calendar size={14} />
                {new Date(e.expense_date || e.created_at).toLocaleDateString()}
              </div>
              {e.description && (
                <p className="fin-sub" style={{ marginTop: '12px', lineHeight: '1.5', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  {e.description}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%', justifyContent: 'space-between' }}>
              <div className="fin-expense-amount">Rs. {(e.amount || 0).toLocaleString()}</div>
              {!readOnly && (
                <button 
                  className="fin-expense-delete-btn"
                  onClick={() => handleDelete(e.id)}
                  title="Remove Expense"
                >
                  <Trash size={16} weight="bold" />
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <div style={{ gridColumn: '1/-1', background: 'white', borderRadius: '24px', padding: '48px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: 'var(--fin-shadow-md)' }}>
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>No expense records match your query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinExpenses;
