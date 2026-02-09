import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding } from '../services/api';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        age: '',
        dob: '',
        phone_number: '',
        address: '',
        practice_type: '',
        business_name: '',
        years_of_experience: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name || formData.full_name.trim().length < 2) {
            newErrors.full_name = 'Full name is required (at least 2 characters)';
        }

        const age = parseInt(formData.age);
        if (!formData.age || age < 18 || age > 100) {
            newErrors.age = 'Age must be between 18 and 100';
        }

        if (!formData.dob) {
            newErrors.dob = 'Date of birth is required';
        }

        if (!formData.phone_number || formData.phone_number.trim().length < 10) {
            newErrors.phone_number = 'Valid phone number is required (at least 10 digits)';
        }

        if (!formData.address || formData.address.trim().length < 10) {
            newErrors.address = 'Please enter a complete address (at least 10 characters)';
        }

        if (!formData.practice_type) {
            newErrors.practice_type = 'Please select a type of practice';
        }

        if (!formData.years_of_experience) {
            newErrors.years_of_experience = 'Years of experience is required';
        }

        if (formData.practice_type && formData.practice_type !== 'Individual' && (!formData.business_name || formData.business_name.trim().length < 2)) {
            newErrors.business_name = 'Business name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const data = await completeOnboarding({
                ...formData,
                age: parseInt(formData.age),
            });
            updateUser(data.user);
            navigate('/success');
        } catch (error) {
            console.error('Onboarding failed:', error);
            if (error.response?.data) {
                // Handle validation errors from backend
                const backendErrors = error.response.data;
                const formattedErrors = {};
                Object.keys(backendErrors).forEach(key => {
                    formattedErrors[key] = Array.isArray(backendErrors[key])
                        ? backendErrors[key][0]
                        : backendErrors[key];
                });
                setErrors(formattedErrors);
            } else {
                alert('Failed to submit details. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Body Background: Clean white with subtle slate gradient */
        <div className="min-h-screen flex items-center justify-center p-6 py-12 bg-emerald-100">

            {/* Main Card: White glass effect with emerald/black accents - Scale optimized for laptop */}
            <div className="w-full max-w-4xl p-10 md:p-16 bg-white/80 backdrop-blur-xl border border-emerald-100/50 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] animate-[fadeIn_0.5s_ease-out_forwards]">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-slate-900 text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
                            TA
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TaxplanAdvisor</h1>
                    </div>
                    {/* Gradient Title: Green to Black */}
                    <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
                        Complete Your Profile
                    </h2>
                    <p className="text-slate-500 text-lg">
                        Please provide your details to complete the onboarding process
                    </p>
                </div>

                {/* Important Note Box: Amber/Yellow theme for visibility on white */}
                <div className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 text-amber-800 text-base leading-relaxed shadow-sm">
                    <svg className="w-6 h-6 mt-1 flex-shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <strong className="block text-amber-900 text-lg mb-1">Important Notice</strong>
                        Accurate details are required. Verification credentials will be sent to: <span className="font-bold text-slate-900 underline decoration-amber-500/50">{user?.email}</span>
                    </div>
                </div>

                {/* Form: Light theme inputs */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="block text-slate-700 font-bold mb-2 ml-1">Full Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className={`w-full p-4 bg-slate-50 border ${errors.full_name ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400`}
                                placeholder="Enter your full name"
                            />
                            {errors.full_name && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.full_name}</p>}
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-slate-700 font-bold mb-2 ml-1">Age <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                className={`w-full p-4 bg-slate-50 border ${errors.age ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400`}
                                placeholder="Min 18"
                            />
                            {errors.age && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.age}</p>}
                        </div>

                        {/* DOB */}
                        <div>
                            <label className="block text-slate-700 font-bold mb-2 ml-1">Date of Birth <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className={`w-full p-4 bg-slate-50 border ${errors.dob ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-500`} // text-slate-500 for date placeholder look
                            />
                            {errors.dob && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.dob}</p>}
                        </div>

                        {/* Phone Number */}
                        <div className="md:col-span-2">
                            <label className="block text-slate-700 font-bold mb-2 ml-1">Phone Number <span className="text-red-500">*</span></label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className={`w-full p-4 bg-slate-50 border ${errors.phone_number ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400`}
                                placeholder="+91 XXXXX XXXXX"
                            />
                            {errors.phone_number && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.phone_number}</p>}
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block text-slate-700 font-bold mb-2 ml-1">Full Address <span className="text-red-500">*</span></label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full p-4 bg-slate-50 border ${errors.address ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none placeholder:text-slate-400`}
                                placeholder="House No, Building, Area, City, Pincode"
                            />
                            {errors.address && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.address}</p>}
                        </div>

                        {/* Practice Details Selection */}
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                            {/* Type of Practice */}
                            <div>
                                <label className="block text-slate-700 font-bold mb-2 ml-1">Type of Practice <span className="text-red-500">*</span></label>
                                <select
                                    name="practice_type"
                                    value={formData.practice_type}
                                    onChange={handleChange}
                                    className={`w-full p-4 bg-slate-50 border ${errors.practice_type ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer`}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Individual">Individual</option>
                                    <option value="LLP">LLP</option>
                                    <option value="Firm">Firm</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Company">Company</option>
                                </select>
                                {errors.practice_type && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.practice_type}</p>}
                            </div>

                            {/* Years of Experience */}
                            <div>
                                <label className="block text-slate-700 font-bold mb-2 ml-1">Years of Experience <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="years_of_experience"
                                    value={formData.years_of_experience}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full p-4 bg-slate-50 border ${errors.years_of_experience ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400`}
                                    placeholder="e.g. 5"
                                />
                                {errors.years_of_experience && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.years_of_experience}</p>}
                            </div>

                            {/* Business Name - Conditional */}
                            {formData.practice_type && formData.practice_type !== 'Individual' && (
                                <div className="md:col-span-2 animate-[fadeIn_0.3s_ease-out_forwards]">
                                    <label className="block text-slate-700 font-bold mb-2 ml-1">
                                        {formData.practice_type} Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        className={`w-full p-4 bg-slate-50 border ${errors.business_name ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400`}
                                        placeholder={`Enter Name of ${formData.practice_type}`}
                                    />
                                    {errors.business_name && <p className="text-red-500 text-sm mt-2 ml-1 font-medium">{errors.business_name}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button: Green to Black Gradient */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-emerald-600 to-slate-900 hover:from-emerald-500 hover:to-slate-800 text-white text-xl font-bold rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="animate-spin h-6 w-6 text-emerald-200" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Submitting Details...
                            </span>
                        ) : (
                            'Submit Profile & Continue'
                        )}
                    </button>
                </form>
            </div>

            {/* Background Orbs: Subtle Green and Grey */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-slate-900/5 rounded-full blur-[150px]"></div>
            </div>
        </div>
    );
};

export default Onboarding;
