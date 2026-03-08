import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Lock, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isReg, setIsReg] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true); 
    const [form, setForm] = useState({ username: '', password: '' });

    // Base URL updated to your Laptop's Network IP for Mobile Access
    const API_BASE_URL = 'http://10.140.83.66:8000/api';

    useEffect(() => {
        document.body.style.backgroundColor = isDarkMode ? '#050811' : '#f8fafc';
    }, [isDarkMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Dynamic URL based on Login or Register mode
        const url = isReg ? `${API_BASE_URL}/register` : `${API_BASE_URL}/login`;
        
        try {
            const res = await axios.post(url, form);
            
            if (isReg) {
                alert("Account Created! You can now login.");
                setIsReg(false);
                setForm({ username: '', password: '' });
            } else {
                // Save session and move to dashboard
                localStorage.setItem('user', res.data.username); 
                navigate('/dashboard');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Invalid Credentials or Connection Error";
            alert(errorMessage);
            console.error("Auth Error:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#050811] text-slate-200' : 'bg-slate-50 text-slate-800'} relative overflow-hidden`}>
            
            {/* Theme Toggle Button */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'}`}
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative w-full max-w-[420px] z-10 flex flex-col items-center">
                
                {/* Brand Header */}
                <div className="flex items-center justify-center mb-8 space-x-3 w-full">
                    <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                        <Zap className="text-white w-5 h-5 fill-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className={`text-xl font-black tracking-tight leading-none uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Health Intelligence</h1>
                        <p className={`text-[9px] tracking-[0.2em] font-bold uppercase mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Real-time Health Monitoring</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className={`w-full p-8 rounded-[32px] transition-all duration-500 relative ${isDarkMode ? 'bg-[#0B1224] border border-white/5 shadow-[0_0_40px_-10px_rgba(79,70,229,0.15)]' : 'bg-white border border-slate-200 shadow-2xl'}`}>
                    
                    {isDarkMode && <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>}
                    
                    <div className="mb-8">
                        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {isReg ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isReg ? 'Sign up to start monitoring your health data.' : 'Log in to access your health analytics dashboard.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2 text-left">
                            <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Username</label>
                            <div className="relative group">
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
                                <input 
                                    type="text" 
                                    placeholder="Enter username"
                                    value={form.username}
                                    onChange={(e) => setForm({...form, username: e.target.value})}
                                    className={`w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                                        isDarkMode 
                                        ? 'bg-[#050811] border border-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500' 
                                        : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                                    }`}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDarkMode ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
                                <input 
                                    type="password" 
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({...form, password: e.target.value})}
                                    className={`w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                                        isDarkMode 
                                        ? 'bg-[#050811] border border-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500' 
                                        : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                                    }`}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-6 py-4 rounded-2xl text-white text-sm font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                                loading ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-[#6366f1] to-[#4F46E5] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                            }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isReg ? 'Create My Account' : 'Sign In to Dashboard'}</span>
                                    {!isReg && <ArrowUpRight className="w-4 h-4" />}
                                </>
                            )}
                        </button>
                    </form>

                    <div className={`mt-8 pt-6 text-center text-xs border-t ${isDarkMode ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                        {isReg ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                        <button 
                            onClick={() => setIsReg(!isReg)}
                            className="text-indigo-500 hover:text-indigo-400 font-bold bg-transparent border-none cursor-pointer transition-colors"
                        >
                            {isReg ? 'Login here' : 'Register here'}
                        </button>
                    </div>
                </div>

                <div className={`mt-8 flex items-center justify-center space-x-2 transition-all opacity-60 hover:opacity-100 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Secure Protocol v2.0</span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;