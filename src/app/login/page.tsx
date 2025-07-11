'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(203, 255, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(203, 255, 0, 0.5); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }
        
        .animate-glow {
          animation: glow 2s infinite;
        }
        
        .lime-gradient {
          background: linear-gradient(135deg, #cbff00 0%, #9fff00 100%);
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(203, 255, 0, 0.4);
          transition: all 0.3s ease;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(203, 255, 0, 0.2), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[#cbff00]/5 to-transparent rotate-12 transform"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[#cbff00]/5 to-transparent -rotate-12 transform"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-24 h-16 bg-white rounded-xl flex items-center justify-center p-3 mx-auto mb-4 shimmer-effect">
            <img 
              src="/logo.png" 
              alt="Digital Marketing Agency Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Digital Marketing Agency</h1>
          <p className="text-gray-400">Access your media analytics dashboard</p>
        </div>

        {/* Login Form */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl animate-slideUp hover-glow">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400 animate-fadeIn">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all hover-lift"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-11 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all hover-lift"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Demo Credentials Info */}
            <div className="p-3 bg-[#cbff00]/10 border border-[#cbff00]/20 rounded-lg">
              <p className="text-xs text-[#cbff00] font-medium mb-1">Demo Credentials:</p>
              <p className="text-xs text-gray-300">Email: admin@digitalagency.com</p>
              <p className="text-xs text-gray-300">Password: password123</p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-black transition-all duration-300 flex items-center justify-center space-x-2 hover-lift ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'lime-gradient hover-glow shimmer-effect'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-gray-400 hover:text-[#cbff00] transition-colors">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-xs animate-fadeIn">
          <p>© 2025 Digital Marketing Agency. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}