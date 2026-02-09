import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Success = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Placeholder for a "Start" action
    const handleProceed = () => {

     navigate('/onboarding/expertise');
};

    return (
        /* Body Background: Clean white with subtle slate gradient */
        <div className="min-h-screen w-full flex items-center justify-center p-6 py-12 bg-emerald-100">
            
            {/* Main Card: White glass effect with emerald/black accents - Scale optimized for laptop */}
            <div className="w-full max-w-5xl p-10 md:p-16 bg-emerald-50/60 backdrop-blur-3xl border border-emerald-100/50 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(16,185,129,0.1)] animate-[fadeIn_0.5s_ease-out_forwards] relative z-10">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-slate-900 text-white font-bold text-3xl shadow-xl shadow-emerald-500/20">
                        TA
                    </div>
                    {/* Dark Text Title */}
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Onboarding Roadmap
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Welcome, <span className="text-emerald-600 font-bold">{user?.full_name || 'Consultant'}</span>.
                        Please review the mandatory process below to activate your account.
                    </p>
                </div>

                {/* Process Steps Container */}
                <div className="relative">
                    {/* Connecting Line: Slate color for visibility on white */}
                    <div className="absolute left-[27px] top-10 bottom-10 w-0.5 bg-slate-200 hidden md:block z-0"></div>

                    <div className="space-y-12">
                        {/* Step 1: Expertise */}
                        <div className="flex flex-col md:flex-row items-start gap-8 relative group">
                            {/* Number Circle: White bg with Green Border */}
                            <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-bold text-2xl shrink-0 z-10 shadow-lg shadow-emerald-100 transition-transform group-hover:scale-110">1</div>
                            
                            {/* Content Box: White with subtle border */}
                            <div className="flex-1 p-8 rounded-2xl bg-emerald-50/80 border-slate-200 hover:border-emerald-500/30 hover:shadow-lg transition-all shadow-sm">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Select Domain Expertise</h3>
                                <p className="text-slate-500 text-lg mb-6">Choose your primary area of consultation (GST, Income Tax, etc.).</p>
                                <div className="flex flex-wrap gap-3">
                                    {['GST', 'Income Tax', 'TDS', 'Registration'].map((tag) => (
                                        <span key={tag} className="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Documentation */}
                        <div className="flex flex-col md:flex-row items-start gap-8 relative group">
                            <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center font-bold text-2xl shrink-0 z-10 shadow-lg shadow-slate-200 transition-transform group-hover:scale-110">2</div>
                            <div className="flex-1 p-8 rounded-2xl bg-emerald-50/80 border-slate-200 hover:border-slate-400/30 hover:shadow-lg transition-all shadow-sm">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">PAN Verification & Qualification Upload</h3>
                                <p className="text-slate-500 text-lg">Verify Pan and Upload valid educational certificates and professional documents.</p>
                            </div>
                        </div>

                        {/* Step 3: Identity Verification */}
                        <div className="flex flex-col md:flex-row items-start gap-8 relative group">
                            <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 flex items-center justify-center font-bold text-2xl shrink-0 z-10 shadow-lg shadow-emerald-100 transition-transform group-hover:scale-110">3</div>
                            <div className="flex-1 p-8 rounded-2xl bg-emerald-50/80 border-slate-200 hover:border-emerald-500/30 hover:shadow-lg transition-all shadow-sm">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Identity Verification</h3>
                                <ul className="text-lg text-slate-500 space-y-4">
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Recent passport-size photograph</li>
                                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Live Photo Verification</li>
                                </ul>
                            </div>
                        </div>

                        {/* Step 4: Assessment */}
                        <div className="flex flex-col md:flex-row items-start gap-8 relative group">
                            <div className="w-14 h-14 rounded-full bg-white border-2 border-amber-500 text-amber-600 flex items-center justify-center font-bold text-2xl shrink-0 z-10 shadow-lg shadow-amber-100 transition-transform group-hover:scale-110">4</div>
                            <div className="flex-1 p-8 rounded-2xl bg-emerald-50/80 border-slate-200 hover:border-amber-500/30 hover:shadow-lg transition-all shadow-sm">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Skill Assessment Test</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="p-5 rounded-xl border bg-emerald-50/80 border-slate-200">
                                        <span className="block text-amber-600 font-bold mb-1 uppercase text-xs tracking-widest">Part A</span>
                                        <span className="block text-xl text-slate-900 font-semibold">Multiple Choice</span>
                                        <span className="text-slate-500 text-base">45 Qs • 30s each</span>
                                    </div>
                                    <div className="p-5 rounded-xl border bg-emerald-50/80 border-slate-200">
                                        <span className="block text-red-500 font-bold mb-1 uppercase text-xs tracking-widest">Part B</span>
                                        <span className="block text-xl text-slate-900 font-semibold">Video Response</span>
                                        <span className="text-slate-500 text-base">5 Qs • Verbal Answer • 1m 30s each </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 5: Email Credentials */}
                        <div className="flex flex-col md:flex-row items-start gap-8 relative group">
                            <div className="w-14 h-14 rounded-full bg-white border-2 border-emerald-600 text-emerald-600 flex items-center justify-center font-bold text-2xl shrink-0 z-10 shadow-lg shadow-emerald-100 transition-transform group-hover:scale-110">5</div>
                            <div className="flex-1 p-8 rounded-2xl bg-emerald-50/80 border-slate-200 hover:border-emerald-500/30 hover:shadow-lg transition-all shadow-sm">
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Receive Login Credentials</h3>
                                <p className="text-slate-500 text-lg">
                                    Upon successful verification, credentials will be sent to: <span className="text-emerald-600 font-bold underline decoration-emerald-200">{user?.email || 'advaitasanoj@gmail.com'}</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-20 flex flex-col md:flex-row gap-6 justify-center">
                    <button onClick={handleLogout} className="px-12 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all text-lg font-bold">Sign Out</button>
                    <button onClick={handleProceed} className="px-16 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-slate-900 text-white hover:from-emerald-500 hover:to-slate-800 shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all text-xl font-extrabold flex items-center justify-center gap-3">
                        Start Process
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                </div>
            </div>

            {/* Background Orbs: Green and Grey/Black */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-emerald-500/5 rounded-full blur-[180px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-slate-900/5 rounded-full blur-[180px]"></div>
            </div>
        </div>
    );
};

export default Success;