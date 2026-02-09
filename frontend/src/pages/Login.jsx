import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleAuth } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const data = await googleAuth(credentialResponse.credential);
            login(data.user);

            // Redirect based on onboarding status
            if (data.needs_onboarding) {
                navigate('/onboarding');
            } else {
                navigate('/success');
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        }
    };

    const handleGoogleError = () => {
        console.error('Google Sign-In Failed');
        alert('Google Sign-In failed. Please try again.');
    };
return (
        /* Body Background: Clean white with subtle slate gradient */
        <div className="min-h-screen flex items-center justify-center p-6 bg-emerald-100">
            
            {/* Main Card: White glass effect with green/black accents */}
            <div className="w-full max-w-xl p-10 md:p-16 bg-emerald-50/80 backdrop-blur-xl border border-emerald-100/50 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] animate-[fadeIn_0.5s_ease-out_forwards] relative z-10">
                
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {/* Logo Icon: Green to Black Gradient */}
                        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-slate-900 text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
                            TA
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            TaxplanAdvisor
                        </h1>
                    </div>
                    
                    {/* Gradient Text: Green to Black */}
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-slate-800 bg-clip-text text-transparent mb-4">
                        Consultant Onboarding
                    </h2>
                    
                    <p className="text-slate-500 text-lg">
                        Sign in to begin your registration as a consultant
                    </p>
                </div>

                {/* Divider */}
                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-400 uppercase tracking-widest font-bold border border-slate-100 rounded-full">
                            Continue with
                        </span>
                    </div>
                </div>

                {/* Google Sign In Container - Scaled up */}
                <div className="flex justify-center py-4">
                    <div className="transform scale-110 md:scale-125 transition-transform hover:scale-[1.3] duration-300">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline" // Changed to 'outline' or 'filled_black' looks better on white
                            size="large"
                            width="320"
                            text="signin_with"
                            shape="pill" 
                        />
                    </div>
                </div>
                 
                {/* Footer Note */}
                <p className="text-center text-xs text-slate-400 mt-12 leading-relaxed font-medium">
                    By signing in, you agree to our <br />
                    <span className="text-emerald-600 underline cursor-pointer hover:text-emerald-800 transition-colors">Terms of Service</span> and <span className="text-emerald-600 underline cursor-pointer hover:text-emerald-800 transition-colors">Privacy Policy</span>
                </p>
            </div>

            {/* Background Orbs: Green and Black/Grey */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-900/5 rounded-full blur-[100px]"></div>
            </div>
        </div>
    );

};

export default Login;
