// src/components/ui/dialog.js
import React from 'react';

export const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
};

export const DialogTrigger = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

export const DialogContent = ({ children }) => (
  <div className="dialog-content">{children}</div>
);

export const DialogHeader = ({ children }) => (
  <div className="dialog-header">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="dialog-title">{children}</h2>
);