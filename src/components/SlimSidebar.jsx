import React from 'react';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';

const icons = [
  { key: 'document', icon: <DescriptionOutlined />, label: 'Documents' },
  { key: 'settings', icon: <SettingsOutlined />, label: 'Settings/Admin' },
];

export default function SlimSidebar({ active, onSelect, color }) {
  return (
    <nav
      style={{
        background: color,
        width: 56,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
      }}
    >
      {icons.map(({ key, icon, label }) => (
        <button
          key={key}
          aria-label={label}
          onClick={() => onSelect(key)}
          style={{
            background: 'none',
            border: 'none',
            color: active === key ? '#fff' : 'rgba(255,255,255,0.7)',
            margin: '16px 0',
            fontSize: 24,
            cursor: 'pointer',
            outline: active === key ? '2px solid #fff' : 'none',
            borderRadius: 8,
            boxShadow: active === key ? '0 0 8px #fff' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {icon}
        </button>
      ))}
    </nav>
  );
}
