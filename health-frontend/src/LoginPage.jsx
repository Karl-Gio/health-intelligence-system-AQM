import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isReg, setIsReg] = useState(false);
    const [form, setForm] = useState({ username: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isReg ? 'http://localhost:8000/api/register' : 'http://localhost:8000/api/login';
        
        try {
            // Pinapasa natin ang form object (username at password)
            const res = await axios.post(url, form);
            
            if (isReg) {
                // Pag success ang register, lilitaw ito
                alert("Account Created! You can now login.");
                setIsReg(false); // Babalik sa login view
                setForm({ username: '', password: '' }); // Clear ang inputs
            } else {
                // Pag success ang login, i-save ang username para sa initial letter
                localStorage.setItem('user', res.data.username); 
                navigate('/dashboard');
            }
        } catch (err) {
            // Updated error handling para makita ang feedback mula sa Laravel
            const errorMessage = err.response?.data?.message || "Invalid Credentials or Connection Error";
            alert(errorMessage);
            console.error("Auth Error:", err.response?.data);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'Inter' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '60px', height: '60px', background: '#6366f1', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>⚡</div>
                <h2 style={{ fontWeight: '800', color: '#0f172a' }}>{isReg ? 'Create Account' : 'Welcome Back'}</h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
                    {isReg ? 'Fill in your details to get started' : 'Sign in to access your dashboard'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Username</label>
                        <input 
                            type="text" 
                            placeholder="Enter username" 
                            value={form.username}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                            onChange={(e) => setForm({...form, username: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={form.password}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} 
                            onChange={(e) => setForm({...form, password: e.target.value})} 
                            required 
                        />
                    </div>

                    <button type="submit" style={{ marginTop: '10px', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', transition: '0.3s' }}>
                        {isReg ? 'Create My Account' : 'Sign In to Dashboard'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                    {isReg ? 'Already have an account?' : "Don't have an account yet?"} 
                    <span 
                        onClick={() => setIsReg(!isReg)} 
                        style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                    >
                        {isReg ? 'Login here' : 'Register here'}
                    </span>
                </p>
            </div>
        </div>
    );
};
export default LoginPage;