'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/app/components/navbar";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      // Send the login credentials to the API
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Check if the login was successful
      if (data.success) {
        // Save the token (you could also store it in a cookie)
        localStorage.setItem('adminToken', data.token);

        // Redirect to the admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.3)] w-full max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
            Admin Login
          </h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-500 rounded placeholder-gray-400 text-black text-sm"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-500 rounded placeholder-gray-400 text-black text-sm"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F6931B] text-black 
                px-4 py-2 rounded-md hover:bg-black 
                hover:text-[#F6931B] focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          {/* "Return To Home" Link */}
          <Link
            href="/" // Replace with the path to your home page (enquiry form page)
            className="w-full mt-4 flex items-center justify-center bg-[#F6931B] text-black 
                       px-4 py-2 rounded-md hover:bg-black hover:text-[#F6931B] 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return To Home
          </Link>
        </div>
        
      </div>

    </div>
  );
}