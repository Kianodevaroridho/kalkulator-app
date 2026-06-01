import React from 'react';

export default function HistoryPanel({ isOpen, onClose, history, onSelectExpression, onSelectResult, onClearHistory }) {
  return (
    <div className={`history-drawer ${isOpen ? 'open' : ''}`}>
      <div className="history-header">
        <h3>Calculation History</h3>
        <button className="close-history-btn" onClick={onClose} aria-label="Close History">
          &times;
        </button>
      </div>

      <div className="history-body">
        {history.length === 0 ? (
          <div className="empty-history">
            <svg className="empty-history-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="48" height="48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No calculations yet</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, idx) => (
              <div key={idx} className="history-item">
                <div className="history-expr" onClick={() => onSelectExpression(item.expr)} title="Load expression to display">
                  {item.expr}
                </div>
                <div className="history-res-row">
                  <span className="history-equals">=</span>
                  <span className="history-res" onClick={() => onSelectResult(item.res)} title="Load result to display">
                    {item.res}
                  </span>
                </div>
                <div className="history-actions">
                  <button 
                    className="history-action-btn"
                    onClick={() => onSelectExpression(item.expr)}
                  >
                    Use Formula
                  </button>
                  <button 
                    className="history-action-btn"
                    onClick={() => onSelectResult(item.res)}
                  >
                    Use Result
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-footer">
          <button className="clear-history-btn" onClick={onClearHistory}>
            Clear History
          </button>
        </div>
      )}
    </div>
  );
}
