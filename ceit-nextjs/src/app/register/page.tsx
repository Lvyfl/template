'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const departments = ['DIT', 'DIET', 'DAFE', 'DCEE', 'DCEA'];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();
  const d = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register({ name, email, password, departmentName });
      const loginResponse = await authAPI.login({ email, password });
      login(loginResponse.data.token, loginResponse.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className={`backdrop-blur-xl ${d ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200 shadow-xl'} border rounded-2xl p-8 transition-colors duration-300`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
              CEIT Admin Portal
            </h1>
            <h2 className={`text-2xl font-semibold ${d ? 'text-orange-400' : 'text-orange-600'}`}>
              Register
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${d ? 'text-white' : 'text-gray-700'}`}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  d ? 'bg-black/40 border border-orange-500/30 text-white placeholder-gray-400' : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${d ? 'text-white' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  d ? 'bg-black/40 border border-orange-500/30 text-white placeholder-gray-400' : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${d ? 'text-white' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                  d ? 'bg-black/40 border border-orange-500/30 text-white placeholder-gray-400' : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${d ? 'text-white' : 'text-gray-700'}`}>
                Department
              </label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all cursor-pointer ${
                  d ? 'bg-black/40 border border-orange-500/30 text-white' : 'bg-gray-50 border border-gray-300 text-gray-900'
                }`}
              >
                <option value="" className={d ? 'bg-gray-900' : 'bg-white'}>Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className={d ? 'bg-gray-900' : 'bg-white'}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className={`px-4 py-3 rounded-lg text-center ${d ? 'bg-red-500/20 border border-red-500 text-red-200' : 'bg-red-50 border border-red-300 text-red-600'}`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none shadow-lg shadow-orange-900/50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className={`text-center mt-6 ${d ? 'text-gray-300' : 'text-gray-500'}`}>
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium transition">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
