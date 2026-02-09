import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Webcam from 'react-webcam';
import { uploadFaceVerificationPhoto, verifyFace } from '../services/api';
import { Camera, Upload, CheckCircle, XCircle, RefreshCw, ShieldCheck, User } from 'lucide-react';

export default function FaceVerificationPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const webcamRef = useRef(null);

    // State for steps
    const [step, setStep] = useState(1); // 1: Upload ID, 2: Live Capture, 3: Result

    // Data state
    const [idPhoto, setIdPhoto] = useState(null);
    const [idPhotoPreview, setIdPhotoPreview] = useState(null);
    const [livePhoto, setLivePhoto] = useState(null);

    // Status state
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            // Wait for auth or redirect? 
        }
    }, [user, navigate]);

    // Handle ID Photo Upload
    const handleIdPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdPhoto(file);
            setIdPhotoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const uploadIdPhoto = async () => {
        if (!idPhoto) {
            setError('Please select a photo first');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('uploaded_photo', idPhoto);

        try {
            await uploadFaceVerificationPhoto(user.id, formData);
            setStep(2);
        } catch (err) {
            setError('Failed to upload photo. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle Live Capture
    const captureLivePhoto = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setLivePhoto(imageSrc);
    };

    const verifyIdentity = async () => {
        if (!livePhoto) return;

        setLoading(true);

        try {
            const data = await verifyFace(user.id, {
                live_photo_base64: livePhoto
            });

            setVerificationResult(data);
            setStep(3);
        } catch (err) {
            setError('Verification failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetProcess = () => {
        setStep(1);
        setIdPhoto(null);
        setIdPhotoPreview(null);
        setLivePhoto(null);
        setVerificationResult(null);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-100 relative overflow-hidden">

            {/* Background Orbs to match Login */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-900/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-4xl p-8 md:p-12 bg-emerald-50/80 backdrop-blur-xl border border-emerald-100/50 rounded-[2rem] shadow-xl relative z-10 transition-all duration-500">

                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3 tracking-tight">
                        <div className="p-3 bg-emerald-100/50 rounded-2xl">
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                        Identity Verification
                    </h2>
                    <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
                        Complete your profile verification securely using facial recognition technology.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-12 border-b border-emerald-100/50 pb-8 px-4 md:px-12">
                    {[
                        { num: 1, label: 'Upload ID', icon: Upload },
                        { num: 2, label: 'Live Face', icon: Camera },
                        { num: 3, label: 'Result', icon: CheckCircle }
                    ].map((s, idx) => (
                        <div key={s.num} className="flex flex-col items-center relative group">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold mb-3 transition-all duration-300 shadow-sm
                                ${step >= s.num
                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20 scale-110'
                                    : 'bg-white text-slate-300 border border-slate-100'
                                }`}>
                                <s.icon className={`h-5 w-5 ${step >= s.num ? 'text-white' : 'text-slate-300'}`} />
                            </div>
                            <span className={`text-xs md:text-sm font-semibold tracking-wide transition-colors duration-300 ${step >= s.num ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {s.label}
                            </span>
                            {/* Connector Line */}
                            {idx < 2 && (
                                <div className={`hidden md:block absolute top-6 left-[3rem] w-[calc(100vw/5)] max-w-[12rem] h-[2px] transition-colors duration-500
                                    ${step > s.num ? 'bg-emerald-200' : 'bg-slate-100'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="max-w-xl mx-auto">
                    {/* Step 1: Upload ID */}
                    {step === 1 && (
                        <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-800">Upload Identification Document</h3>
                                <p className="text-slate-500 mt-2">Please upload a clear photo of your government-issued ID (PAN Card, Aadhaar, etc.) ensuring the photo is visible.</p>
                            </div>

                            <div className="relative group">
                                <div className={`flex flex-col items-center justify-center border-3 border-dashed rounded-3xl p-10 transition-all duration-300 
                                    ${idPhotoPreview
                                        ? 'border-emerald-200 bg-emerald-50/50'
                                        : 'border-slate-200 hover:border-emerald-300 hover:bg-white/50'
                                    }`}>

                                    {idPhotoPreview ? (
                                        <div className="relative w-full">
                                            <img src={idPhotoPreview} alt="ID Preview" className="h-64 w-full object-contain rounded-xl shadow-sm" />
                                            <button
                                                onClick={() => { setIdPhoto(null); setIdPhotoPreview(null); }}
                                                className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-2 shadow-lg hover:bg-red-50 border border-red-100 transition-all"
                                            >
                                                <XCircle className="h-6 w-6" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Upload className="h-10 w-10 text-emerald-500" />
                                            </div>
                                            <label className="cursor-pointer text-center block">
                                                <span className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 inline-block mb-3">
                                                    Choose File
                                                </span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleIdPhotoChange} />
                                                <p className="text-sm text-slate-400 font-medium">Supports JPG, PNG up to 5MB</p>
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center border border-red-100 flex items-center justify-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={uploadIdPhoto}
                                disabled={!idPhoto || loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all duration-300 flex justify-center items-center gap-2
                                    ${!idPhoto || loading
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        Proceed to Camera
                                        <Camera className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 2: Live Capture */}
                    {step === 2 && (
                        <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-800">Live Face Check</h3>
                                <p className="text-slate-500 mt-2">Position your face within the frame and look directly at the camera.</p>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-emerald-100/50 w-full max-w-[480px]">
                                    {!livePhoto ? (
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            className="w-full h-auto"
                                            videoConstraints={{ facingMode: "user" }}
                                        />
                                    ) : (
                                        <img src={livePhoto} alt="Live Capture" className="w-full h-auto" />
                                    )}

                                    {/* Overlay Frame */}
                                    {!livePhoto && (
                                        <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-3xl pointer-events-none">
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed border-emerald-400/50 rounded-[40%]"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 mt-8 w-full max-w-[480px]">
                                    {!livePhoto ? (
                                        <button
                                            onClick={captureLivePhoto}
                                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Camera className="h-5 w-5" />
                                            Capture
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setLivePhoto(null)}
                                            className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="h-5 w-5" />
                                            Retake Photo
                                        </button>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center border border-red-100 flex items-center justify-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={verifyIdentity}
                                disabled={!livePhoto || loading}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all duration-300 flex justify-center items-center gap-2
                                    ${!livePhoto || loading
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify Identity
                                        <ShieldCheck className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step 3: Result */}
                    {step === 3 && verificationResult && (
                        <div className={`text-center py-12 px-8 rounded-3xl animate-[fadeIn_0.5s_ease-out]
                            ${verificationResult.match
                                ? 'bg-gradient-to-b from-emerald-50 to-white border border-emerald-100'
                                : 'bg-gradient-to-b from-red-50 to-white border border-red-100'
                            }`}>

                            {verificationResult.match ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <CheckCircle className="h-12 w-12 text-emerald-600" />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-emerald-800 mb-2">Verification Successful</h3>
                                    <div className="bg-emerald-100/50 px-4 py-1 rounded-full border border-emerald-200 mb-6">
                                        <p className="text-emerald-700 font-medium text-sm">
                                            Confidence Match: {verificationResult.similarity.toFixed(1)}%
                                        </p>
                                    </div>
                                    <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
                                        Your identity has been verified successfully. You may now proceed to the dashboard.
                                    </p>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-all w-full md:w-auto"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <XCircle className="h-12 w-12 text-red-600" />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-red-800 mb-2">Verification Failed</h3>
                                    <p className="text-red-600/80 font-medium mb-6">
                                        Faces did not match or were not clear enough.
                                    </p>
                                    <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
                                        Please ensure you are in a well-lit environment and your face is clearly visible in both the ID and camera.
                                    </p>
                                    <button
                                        onClick={resetProcess}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-500/30 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
