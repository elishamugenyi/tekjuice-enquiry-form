"use client";

import { useState } from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
    // Interface for form data
    interface formData {
        email: string;
        password: string;
    }
    
    const [formData, setFormData] = useState<formData>({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(""); // Clear any previous errors
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Add CSRF token to request
            const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('csrf_token='))
                ?.split('=')[1];

            const res = await fetch("/api/admin/user-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken || "",
                },
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password,
                }),
                credentials: 'include', // Include cookies in the request
            });

            const data = await res.json();
            
            if (res.status === 429) {
                throw new Error(data.error || "Too many login attempts. Please try again later.");
            }
            
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setSuccess(true);
            // Redirect to the appropriate page based on user type
            if (data.redirectTo) {
                // Use window.location.replace to prevent back-button navigation
                window.location.replace(data.redirectTo);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] pt-20">
          <Navbar />
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side: Text Content */}
              <div className="w-full lg:w-1/2 p-4 sm:p-8 bg-[#F9FAFB] text-black">
                <h1 className="text-2xl sm:text-3xl text-[#F6931B] font-bold mb-6">Welcome Back!</h1>
                <p className="mb-6 text-lg sm:text-xl leading-relaxed">
                  We're glad to see you again. Log in to access your account and continue your journey with Tek Juice.
                </p>
                
                <h2 className="text-xl text-[#F6931B] font-semibold mb-4">Why Choose Tek Juice?</h2>
                
                <ul className="list-none mb-6 space-y-6">
                  {/* Global Talent Access */}
                  <li>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-shrink-0">
                        <Image 
                          src="/talent.svg"
                          alt="Talent Icon"
                          width={80}
                          height={80}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg text-[#F6931B] font-semibold mb-2">Global Talent Access</h3>
                        <p className="text-base">
                          Connect with top-tier tech talent from across Africa and beyond.
                        </p>
                      </div>
                    </div>
                  </li>
      
                  {/* Seamless Experience */}
                  <li>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-shrink-0">
                        <Image 
                          src="/outsourcing.svg"
                          alt="Outsourcing Icon"
                          width={80}
                          height={80}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg text-[#F6931B] font-semibold mb-2">Seamless Experience</h3>
                        <p className="text-base">
                          Enjoy a smooth and efficient platform designed for your success.
                        </p>
                      </div>
                    </div>
                  </li>
      
                  {/* Secure Platform */}
                  <li>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-shrink-0">
                        <Image 
                          src="/support.svg"
                          alt="Support Icon"
                          width={80}
                          height={80}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg text-[#F6931B] font-semibold mb-2">Secure Platform</h3>
                        <p className="text-base">
                          Your data and privacy are our top priority.
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
        
              {/* Right Side: Login Form */}
              <div className="w-full lg:w-1/2 p-4 sm:p-8 bg-white order-first lg:order-last">
                <h2 className="text-2xl sm:text-3xl text-black font-bold mb-6">Login to Your Account</h2>
                {error && (
                  <p className="text-red-600 font-bold text-center mb-4">
                    {error}
                  </p>
                )}
                {success ? (
                  <p className="text-green-600 font-bold text-center">
                    ✅ Login successful! Redirecting...
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" autoComplete="on">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter Your Email"
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                        required
                        autoComplete="email"
                        maxLength={255}
                      />
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-black mb-1">
                        Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter Your Password"
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B] pr-10"
                        required
                        autoComplete="current-password"
                        minLength={8}
                        maxLength={128}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-[#F6931B] focus:outline-none"
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#F6931B] text-black px-4 py-3 rounded-md hover:bg-black hover:text-[#F6931B] transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </button>
                    </div>
                  </form>
                )}
                <Link href="/" className="text-black text-center hover:text-[#F6931B] mt-10 block">
                  Don't have an account? Sign up here.
                </Link>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      );
}
