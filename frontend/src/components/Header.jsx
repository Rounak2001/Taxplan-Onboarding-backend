import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 30 }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: '#059669', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>T</span>
                </div>
                <span style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>Taxplan Advisor</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.first_name ? `${user.first_name} ${user.last_name}` : 'Consultant'}</span>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>{user?.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#fff',
                            border: 'none',
                            background: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#dc2626';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
