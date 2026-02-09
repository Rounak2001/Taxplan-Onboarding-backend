import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PANVerification = () => {
    const { logout } = useAuth(); // Removed user from destructuring as we aren't using profile data anymore
    const navigate = useNavigate();

    // State for inputs
    const [pan, setPan] = useState('');
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Keep for inline simple errors if needed

    // Modal State
    const [showModal, setShowModal] = useState({ show: false, type: 'success', message: '', title: '' });

    const closeModal = () => {
        if (showModal.type === 'success') {
            navigate('/onboarding/documentation');
        } else {
            // For failure, we force logout as per requirement
            logout().then(() => navigate('/'));
        }
        setShowModal({ ...showModal, show: false });
    };

    const handleVerify = async () => {
        // Validation
        if (!pan || pan.length !== 10) {
            setError('Please enter a valid 10-character PAN number.');
            return;
        }
        if (!fullName || fullName.length < 2) {
            setError('Please enter a valid Full Name.');
            return;
        }

        // Simple regex for DD/MM/YYYY
        // Matches 01-31 / 01-12 / 1900-2099
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        if (!dob || !dateRegex.test(dob)) {
            setError('Please enter Date of Birth in DD/MM/YYYY format (e.g., 14/02/2003).');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/api/sandbox/verify-pan/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    pan: pan.toUpperCase(),
                    full_name: fullName,
                    dob: dob
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Success Modal
                setShowModal({
                    show: true,
                    type: 'success',
                    title: 'Verification Successful',
                    message: 'Your PAN details have been successfully verified against the NSDL database.'
                });
            } else {
                // Failure Modal
                const errorMsg = data.error || 'Verification failed. Details do not match.';
                setShowModal({
                    show: true,
                    type: 'error',
                    title: 'Verification Failed',
                    message: errorMsg
                });
            }

        } catch (err) {
            setError('Network error or server unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Modal Component
    const Modal = () => {
        if (!showModal.show) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${showModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {showModal.type === 'success' ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                    </div>

                    <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">{showModal.title}</h3>
                    <p className="text-center text-slate-500 mb-8">{showModal.message}</p>

                    <button
                        onClick={closeModal}
                        className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all ${showModal.type === 'success'
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 pl-4 pr-4'
                            }`}
                    >
                        {showModal.type === 'success' ? 'Continue' : 'Close & Logout'}
                    </button>

                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 py-12 bg-emerald-100">
            <Modal />
            <div className="w-full max-w-2xl p-10 md:p-12 bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] animate-[fadeIn_0.5s_ease-out_forwards] relative z-10">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">PAN Verification</h1>
                    <p className="text-slate-500">
                        Enter your details exactly as they appear on your PAN Card.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* PAN Input */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Permanent Account Number (PAN)</label>
                        <input
                            type="text"
                            value={pan}
                            onChange={(e) => setPan(e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-lg uppercase tracking-widest text-slate-900 placeholder-slate-300"
                        />
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Full Name (As per PAN)</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="YOUR NAME"
                            className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-lg text-slate-900 placeholder-slate-300"
                        />
                    </div>

                    {/* DOB Input */}
                    <div>
                        <label className="block text-slate-700 font-bold mb-2 ml-1">Date of Birth</label>
                        <input
                            type="text"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            placeholder="DD/MM/YYYY"
                            maxLength={10}
                            className="w-full px-6 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-lg text-slate-900 placeholder-slate-300"
                        />
                        <p className="text-xs text-slate-500 mt-2 ml-1">
                            Format: DD/MM/YYYY (e.g. 14/02/2003)
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-slate-900 text-white hover:from-emerald-500 hover:to-slate-800 shadow-lg shadow-emerald-500/20 transition-all text-lg font-bold disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </>
                        ) : (
                            'Verify & Proceed'
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-4">
                        By verifying, you consent to checking your details against the NSDL database.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PANVerification;
