import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadDocument } from '../services/api';

const QUALIFICATION_REQUIREMENTS = {
    'Chartered Accountant (CA)': [
        { name: 'CA Degree Certificate', required: true },
        { name: 'ICAI Membership Certificate', required: true }
    ],
    'Company Secretary (CS)': [
        { name: 'CS Degree Certificate', required: true },
        { name: 'ICSI Membership Certificate', required: true }
    ],
    'Cost & Management Accountant (CMA)': [
        { name: 'CMA Degree Certificate', required: true }
    ],
    'Advocate (Tax Law)': [
        { name: 'LLB Degree Certificate', required: true },
        { name: 'Bar Council Enrollment Certificate', required: true }
    ],
    'GST Practitioner (GSTP)': [
        { name: 'GST Practitioner Certificate', required: true }
    ],
    'Graduate': [
        { name: 'Graduate Degree Certificate', required: true },
        { name: 'Post Graduate Degree Certificate', required: false }
    ]
};

const DocumentUpload = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [qualificationType, setQualificationType] = useState('');
    const [files, setFiles] = useState({});
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleQualificationChange = (e) => {
        setQualificationType(e.target.value);
        setFiles({}); // Reset files when qualification changes
        setError(null);
        setSuccess(false);
    };

    const handleFileChange = (documentType, file) => {
        setFiles(prev => ({ ...prev, [documentType]: file }));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSubmit = async () => {
        if (!qualificationType) {
            setError("Please select a qualification type.");
            return;
        }

        const requiredDocs = QUALIFICATION_REQUIREMENTS[qualificationType];
        const missingDocs = requiredDocs
            .filter(doc => doc.required && !files[doc.name])
            .map(doc => doc.name);

        if (missingDocs.length > 0) {
            setError(`Please upload all required documents: ${missingDocs.join(', ')}`);
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Upload each file sequentially (or parallel)
            // Only upload files that have been selected
            const uploadPromises = requiredDocs
                .filter(doc => files[doc.name])
                .map(doc => {
                    const formData = new FormData();
                    formData.append('qualification_type', qualificationType);
                    formData.append('document_type', doc.name);
                    formData.append('file', files[doc.name]);

                    return uploadDocument(formData);
                });

            await Promise.all(uploadPromises);
            setSuccess(true);
            setTimeout(() => {

                navigate('/onboarding/face-verification');
                alert("Documents uploaded successfully!");
            }, 500);

        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload documents. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 py-12 bg-emerald-100">
            <div className="w-full max-w-4xl p-10 md:p-16 bg-white/80 backdrop-blur-3xl border border-emerald-100/80 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] relative z-10">

                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Professional Documents
                </h1>
                <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mb-12">
                    Select your qualification and upload the required proof.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                        Documents uploaded successfully!
                    </div>
                )}

                {/* Qualification Selector */}
                <div className="mb-8">
                    <label className="block text-slate-700 font-bold mb-3 text-lg">Qualification Type</label>
                    <select
                        value={qualificationType}
                        onChange={handleQualificationChange}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                    >
                        <option value="">-- Select Your Qualification --</option>
                        {Object.keys(QUALIFICATION_REQUIREMENTS).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Dynamic File Inputs */}
                {qualificationType && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-[fadeIn_0.5s_ease-out_forwards]">
                        {QUALIFICATION_REQUIREMENTS[qualificationType].map(doc => (
                            <div key={doc.name} className="group relative p-6 h-48 rounded-3xl bg-white border-2 border-dashed border-emerald-200 hover:border-emerald-500 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                                        {doc.name}
                                        {!doc.required && <span className="ml-2 text-sm text-slate-400 font-normal">(Optional)</span>}
                                    </h3>
                                    <p className="text-slate-400 text-sm">PDF, JPG or PNG</p>
                                </div>

                                <label className="cursor-pointer w-full">
                                    <div className={`py-3 px-6 rounded-xl border transition-all text-center font-bold ${files[doc.name]
                                        ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                                        }`}>
                                        {files[doc.name] ? (
                                            <span className="truncate block">{files[doc.name].name}</span>
                                        ) : 'Choose File'}
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange(doc.name, e.target.files[0])}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center border-t border-emerald-200/60 pt-10">
                    <button
                        onClick={handleLogout}
                        className="px-10 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all text-lg font-bold"
                    >
                        Sign Out
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!qualificationType || uploading || success}
                        className="w-full md:w-auto px-16 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-slate-900 text-white hover:from-emerald-500 hover:to-slate-800 shadow-[0_15px_40px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all text-xl font-extrabold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {uploading ? 'Uploading...' : 'Submit Documents'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DocumentUpload;