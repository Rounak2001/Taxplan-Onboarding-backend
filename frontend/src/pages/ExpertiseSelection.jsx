import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { saveExpertise } from '../services/api';

const EXPERTISE_DATA = {
    'GST': [
        'GST Registration', 'GST Return Filing by Accountant', 'GST NIL Return Filing',
        'GST LUT Form', 'GST Notice', 'GST Annual Return Filing (GSTR-9)',
        'GST Registration for Foreigners', 'GST Amendment', 'GST Revocation', 'GSTR-10'
    ],
    'INCOME TAX': [
        'Income Tax E-Filing', 'Business Tax Filing', 'Partnership Firm / LLP ITR',
        'Company ITR Filing', 'Trust / NGO Tax Filing', '15CA - 15CB Filing',
        'TAN Registration', 'TDS Return Filing', 'Income Tax Notice', 'Revised ITR Return (ITR-U)'
    ],
    'REGISTRATIONS': [
        'Startup India', 'Trade License', 'FSSAI Registration', 'FSSAI License',
        'Halal License & Certification', 'ICEGATE Registration', 'Import Export Code',
        'Legal Entity Identifier Code', 'ISO Registration', 'PF Registration',
        'ESI Registration', 'Professional Tax Registration', 'RCMC Registration',
        'TN RERA Registration for Agents', '12A and 80G Registration', '12A Registration',
        '80G Registration', 'APEDA Registration', 'Barcode Registration', 'BIS Registration',
        'Certificate of Incumbency', 'Darpan Registration', 'Digital Signature',
        'Shop Act Registration', 'Drug License', 'Udyam Registration',
        'FCRA Registration', 'Fire License'
    ],
    'TDS': [
        'TDS Registration', 'TDS Deduction & Computation', 'TDS Payment (Challan)',
        'TDS Returns Filing', 'TDS Certificates Issuance', 'PAN–TDS Reconciliation',
        'TDS Compliance & Notices', 'Interest, Late Fee & Penalty Handling',
        'Form 26Q / 24Q Corrections', 'Advisory & Consulting'
    ]
};

const ExpertiseSelection = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // State: { "GST": ["Registration", "Filing"], "INCOME TAX": [...] }
    const [selections, setSelections] = useState({});
    const [expandedDomain, setExpandedDomain] = useState(null); // 'GST' or null
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleDomain = (domain) => {
        setExpandedDomain(expandedDomain === domain ? null : domain);
    };

    const handleCheckboxChange = (domain, service) => {
        setSelections(prev => {
            // Identify currently active domain (if any)
            const currentDomains = Object.keys(prev).filter(key => prev[key] && prev[key].length > 0);
            const activeDomain = currentDomains.length > 0 ? currentDomains[0] : null;

            // If user selects from a NEW domain, clear previous selections
            if (activeDomain && activeDomain !== domain) {
                return { [domain]: [service] };
            }

            // Otherwise, toggle within the same domain
            const domainSelections = prev[domain] || [];
            if (domainSelections.includes(service)) {
                // Remove service
                const newDomainSelections = domainSelections.filter(s => s !== service);
                // Clean up state: remove domain key if empty (optional, but keeps state clean)
                if (newDomainSelections.length === 0) {
                    const { [domain]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [domain]: newDomainSelections };
            } else {
                // Add service
                return { ...prev, [domain]: [...domainSelections, service] };
            }
        });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleNext = async () => {
        // Transform state to API format
        // { expertise: [ { domain: 'GST', services: [...] }, ... ] }
        const expertisePayload = Object.keys(selections).map(domain => ({
            domain,
            services: selections[domain]
        })).filter(item => item.services.length > 0);

        if (expertisePayload.length === 0) {
            setError("Please select at least one service.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await saveExpertise({ expertise: expertisePayload });
            navigate('/onboarding/pan-verification');
        } catch (err) {
            console.error("Failed to save expertise", err);
            setError("Failed to save your selections. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate total selected count
    const totalSelected = Object.values(selections).flat().length;

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 py-12 bg-emerald-100">
            <div className="w-full max-w-5xl p-8 md:p-12 bg-white/90 backdrop-blur-3xl border border-emerald-100/50 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] relative z-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Select Your Services
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
                        Select Your Domain. You can select only one domain and multiple services under that domain.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Categories Accordion */}
                <div className="space-y-4 mb-12">
                    {Object.keys(EXPERTISE_DATA).map((domain) => {
                        const isExpanded = expandedDomain === domain;
                        const domainSelectionCount = (selections[domain] || []).length;

                        return (
                            <div key={domain} className={`border rounded-2xl transition-all duration-300 ${isExpanded ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-emerald-300'
                                }`}>
                                {/* Accordion Header */}
                                <button
                                    onClick={() => toggleDomain(domain)}
                                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <h3 className={`text-xl font-bold ${isExpanded ? 'text-emerald-800' : 'text-slate-800'}`}>
                                            {domain}
                                        </h3>
                                        {domainSelectionCount > 0 && (
                                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                                                {domainSelectionCount} Selected
                                            </span>
                                        )}
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Accordion Content */}
                                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {EXPERTISE_DATA[domain].map((service) => {
                                            const isSelected = (selections[domain] || []).includes(service);
                                            return (
                                                <label
                                                    key={service}
                                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                        ? 'bg-emerald-100 border-emerald-300'
                                                        : 'bg-white border-slate-100 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1 w-5 h-5 accent-emerald-600 rounded focus:ring-emerald-500"
                                                        checked={isSelected}
                                                        onChange={() => handleCheckboxChange(domain, service)}
                                                    />
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-emerald-900' : 'text-slate-600'}`}>
                                                        {service}
                                                    </span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center border-t border-emerald-200/60 pt-8">
                    <button
                        onClick={handleLogout}
                        className="px-8 py-3 rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold"
                    >
                        Sign Out
                    </button>

                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="text-right hidden md:block">
                            <p className="text-sm text-slate-400 font-medium">Total Services</p>
                            <p className="text-xl font-extrabold text-slate-900">{totalSelected}</p>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={loading || totalSelected === 0}
                            className="flex-1 md:flex-none px-12 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-slate-900 text-white hover:from-emerald-500 hover:to-slate-800 shadow-lg shadow-emerald-500/20 transition-all text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Next Step'}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpertiseSelection;