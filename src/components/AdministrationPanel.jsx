import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const allItems = [
  { label: 'Manage Athletes' },
  { label: 'Manage Squads' },
  { label: 'Manage Staff Users', clubPath: '/staff/manage-users', leaguePath: '/league/staff/manage-users' },
  { label: 'Manage Games' },
  { label: 'Exports' },
  { label: 'Imports' },
  { label: 'Athlete Labels' },
  { label: 'Athlete Groups' },
  { label: 'Kit Matrix' },
  { label: 'Contacts' },
];

export default function AdministrationPanel({ color, userType = 'club' }) {
  const navigate = useNavigate();
  const location = useLocation();
  // Remove 'Manage Squads' for league user
  const items = userType === 'league'
    ? allItems.filter(item => item.label !== 'Manage Squads')
    : allItems;

  const handleClick = (item) => {
    const path = userType === 'league' ? item.leaguePath : item.clubPath;
    if (path) navigate(path);
  };

  return (
    <aside
      style={{
        background: color,
        color: '#fff',
        width: 280,
        minHeight: '100vh',
        boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0 0 0',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22, margin: '0 0 32px 32px', color: '#fff' }}>
        Administration
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(item => {
          const path = userType === 'league' ? item.leaguePath : item.clubPath;
          const isActive = path && location.pathname === path;
          return (
            <li
              key={item.label}
              style={{
                padding: '12px 32px',
                fontSize: 14, // smaller type
                cursor: path ? 'pointer' : 'default',
                borderRadius: 8,
                fontWeight: isActive ? 700 : 400,
                background: isActive ? 'rgba(255,255,255,0.12)' : 'none',
                color: '#fff',
                transition: 'background 0.2s',
                boxShadow: isActive ? '0 0 8px #fff2' : 'none',
              }}
              onClick={() => handleClick(item)}
              onMouseOver={e => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseOut={e => {
                if (!isActive) e.currentTarget.style.background = 'none';
              }}
            >
              {item.label}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
