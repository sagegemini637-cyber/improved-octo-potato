// src/components/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'; // Using lucide-react for icons

const LoginPage = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Professional artificial delay for UX (don't blink the UI)
      await new Promise(resolve => setTimeout(resolve, 1200));
      await login(formData);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans antialiased selection:bg-indigo-500/30">
      {/* Left Side: Branding & Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-600">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-slate-900 z-10" />
        {/* Animated Background Grids */}
        <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="relative z-20 m-auto px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">DashSuite Pro</h1>
          </div>
          <h2 className="text-5xl font-extrabold leading-tight mb-6">
            Global Intelligence <br /> <span className="text-indigo-200">Simplified.</span>
          </h2>
          <p className="text-lg text-indigo-100/80 max-w-md leading-relaxed">
            Access 20+ industry-specific dashboards and real-time analytics with enterprise-grade security.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-slate-400">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-300 mb-1.5 transition-colors group-focus-within:text-indigo-400">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="name@company.com"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300 transition-colors group-focus-within:text-indigo-400">Password</label>
                  <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-white pl-11 pr-12 py-3 rounded-xl outline-none transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="••••••••"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full bg-white text-slate-950 font-semibold py-3.5 rounded-xl transition-all hover:bg-indigo-50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex justify-center items-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Sign In to DashSuite"
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Don't have an account? <button className="text-indigo-400 font-medium hover:underline">Contact Administrator</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
