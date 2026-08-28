import React from 'react';

// Common Footer component
export default function Footer() {
  return (
    <footer style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.875rem' }}>
      <p>© {new Date().getFullYear()} DigiConnect Civic Portal. All rights reserved.</p>
    </footer>
  );
}
