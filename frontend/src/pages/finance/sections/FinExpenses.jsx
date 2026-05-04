import React from 'react';
import { 
  Buildings, Trash, Wallet, 
  Tag, Calendar
} from "@phosphor-icons/react";

const FinExpenses = ({ expenses, onAction }) => {
  
  const handleDelete = async (id) => {
    if (window.confirm('Remove this expense record?')) {
      await onAction('DELETE', `/expenses/${id}`);
    }
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'utilities': return <Buildings size={20} />;
      case 'maintenance': return <Wallet size={20} />;
      default: return <Tag size={20} />;
    }
  };

  return (
    <div className="fin-animate">
      <div className="fin-section-header">
        <h2>Campus Expenses</h2>
      </div>

      <div className="fin-expense-grid">
        {expenses.map(e => (
          <div key={e.id} className="fin-expense-card">
            <div className="fin-expense-main">
              <div className="fin-expense-category">{e.category}</div>
              <div className="fin-expense-title">{e.title}</div>
              <div className="fin-expense-date">
                <Calendar size={14} style={{verticalAlign: 'middle', marginRight: '4px'}} />
                {new Date(e.expense_date || e.created_at).toLocaleDateString()}
              </div>
              <p className="fin-sub" style={{marginTop: '8px'}}>{e.description}</p>
            </div>
            <div style={{textAlign: 'right'}}>
              <div className="fin-expense-amount">₹{(e.amount || 0).toLocaleString()}</div>
              <button 
                className="fin-icon-btn del" 
                style={{marginTop: '12px'}}
                onClick={() => handleDelete(e.id)}
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <div className="fin-empty-row" style={{gridColumn: '1/-1', background: 'white', borderRadius: '16px'}}>
            <p style={{padding: '2rem'}}>No expense records found. Click 'Add New' to record an expense.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinExpenses;
