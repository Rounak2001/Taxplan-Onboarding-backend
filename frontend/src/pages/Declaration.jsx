import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { acceptDeclaration } from '../services/api';

const Declaration = () => {
    const navigate = useNavigate();
    const { checkAuth, user } = useAuth();

    const [agreements, setAgreements] = useState({
        accuracy: false,
        integrity: false,
        proctoring: false,
        finalDecision: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const allAgreed = Object.values(agreements).every(Boolean);

    const handleCheckboxChange = (key) => {
        setAgreements(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async () => {
        if (!allAgreed) return;

        setLoading(true);
        setError(null);
        try {
            await acceptDeclaration();
            await checkAuth();
            navigate('/onboarding');
        } catch (err) {
            console.error('Error accepting declaration:', err);
            setError('Failed to submit declaration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = {
        display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer',
        background: '#fff', padding: '16px 20px', borderRadius: 12,
        border: '1px solid #e5e7eb', transition: 'border 0.2s, box-shadow 0.2s',
    };

    const titleStyle = { fontWeight: 600, color: '#111827', marginBottom: 4, fontSize: 15 };
    const descStyle = { fontSize: 13, color: '#6b7280', lineHeight: 1.5 };

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header matching Onboarding */}
            <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 30 }}>
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: '#059669', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>T</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>Taxplan Advisor</span>
                    <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9ca3af' }}>{user?.email}</span>
                </div>
            </header>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px 60px' }}>

                {/* Title */}
                <div style={{ marginBottom: 32 }}>
                    <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>Required Step</span>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Consultant Declaration</h1>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>Please read and carefully agree to all terms before proceeding to the assessment platform.</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 14 }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    <label style={{ ...labelStyle, borderColor: agreements.accuracy ? '#059669' : '#e5e7eb', boxShadow: agreements.accuracy ? '0 0 0 1px #059669' : 'none' }}>
                        <input type="checkbox" checked={agreements.accuracy} onChange={() => handleCheckboxChange('accuracy')}
                            style={{ width: 20, height: 20, marginTop: 2, accentColor: '#059669', cursor: 'pointer' }} />
                        <div>
                            <div style={titleStyle}>1. Accuracy of Information</div>
                            <div style={descStyle}>I declare that all personal information, identity documents, and qualifications I have uploaded or will upload are true, accurate, and belong entirely to me. I understand that submitting forged or altered documents will lead to immediate disqualification.</div>
                        </div>
                    </label>

                    <label style={{ ...labelStyle, borderColor: agreements.integrity ? '#059669' : '#e5e7eb', boxShadow: agreements.integrity ? '0 0 0 1px #059669' : 'none' }}>
                        <input type="checkbox" checked={agreements.integrity} onChange={() => handleCheckboxChange('integrity')}
                            style={{ width: 20, height: 20, marginTop: 2, accentColor: '#059669', cursor: 'pointer' }} />
                        <div>
                            <div style={titleStyle}>2. Assessment Integrity</div>
                            <div style={descStyle}>I agree to complete the assessment entirely on my own, without the assistance of any other person, external devices, AI tools, or unauthorized materials.</div>
                        </div>
                    </label>

                    <label style={{ ...labelStyle, borderColor: agreements.proctoring ? '#059669' : '#e5e7eb', boxShadow: agreements.proctoring ? '0 0 0 1px #059669' : 'none' }}>
                        <input type="checkbox" checked={agreements.proctoring} onChange={() => handleCheckboxChange('proctoring')}
                            style={{ width: 20, height: 20, marginTop: 2, accentColor: '#059669', cursor: 'pointer' }} />
                        <div>
                            <div style={titleStyle}>3. Proctoring Consent</div>
                            <div style={descStyle}>I consent to video, audio, and screen-monitoring (proctoring) during the assessment. I understand that any attempts to switch tabs, minimize the window, or obscure my webcam will be logged as violations and may result in my test being flagged or rejected.</div>
                        </div>
                    </label>

                    <label style={{ ...labelStyle, borderColor: agreements.finalDecision ? '#059669' : '#e5e7eb', boxShadow: agreements.finalDecision ? '0 0 0 1px #059669' : 'none' }}>
                        <input type="checkbox" checked={agreements.finalDecision} onChange={() => handleCheckboxChange('finalDecision')}
                            style={{ width: 20, height: 20, marginTop: 2, accentColor: '#059669', cursor: 'pointer' }} />
                        <div>
                            <div style={titleStyle}>4. Final Decision</div>
                            <div style={descStyle}>I acknowledge that the evaluation of my assessment, including video analysis and document verification, is at the sole discretion of the TaxPlan Advisor administrative team, and their passing or disqualification decisions are final.</div>
                        </div>
                    </label>

                </div>

                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!allAgreed || loading}
                        style={{
                            padding: '12px 32px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                            border: 'none', cursor: allAgreed && !loading ? 'pointer' : 'not-allowed',
                            background: allAgreed ? '#059669' : '#e5e7eb',
                            color: allAgreed ? '#fff' : '#9ca3af',
                            transition: 'background 0.2s',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}
                    >
                        {loading ? 'Submitting...' : 'I Agree & Proceed'}
                        <span style={{ fontSize: 16 }}>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Declaration;
