import React from 'react';

export default function Button({ children, onClick, disabled, className }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition ${className}`}
    >
      {children}
    </button>
  );
}
