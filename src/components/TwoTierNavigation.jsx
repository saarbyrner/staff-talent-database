import React, { useState } from 'react';
import SlimSidebar from './SlimSidebar';
import AdministrationPanel from './AdministrationPanel';

// Example color logic (replace with real club/league color logic)
const getUserColor = (userType) => {
  if (userType === 'club') return '#1a73e8'; // blue
  if (userType === 'league') return '#43a047'; // green
  return '#333';
};

export default function TwoTierNavigation({ userType = 'club' }) {
  const [active, setActive] = useState(null);
  const color = getUserColor(userType);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', position: 'relative' }}>
      <SlimSidebar active={active} onSelect={setActive} color={color} />
      {active === 'settings' && (
        <div style={{ transition: 'transform 0.2s', zIndex: 10 }}>
          <AdministrationPanel color={color} />
        </div>
      )}
      {/* Main content would go here */}
    </div>
  );
}
