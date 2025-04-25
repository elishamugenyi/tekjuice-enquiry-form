//page that collects sign up details from users.
"use client";

import { useState } from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import Image from "next/image";
import Link from "next/link";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-gray-100 pt-20">
      <Navbar />
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left Side: Text Content */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl sm:text-4xl text-[#F6931B] font-bold mb-6">Welcome to Tek Juice!</h1>
            <p className="mb-8 text-lg sm:text-xl leading-relaxed text-gray-700">
              We create opportunities through technology by offering strategic consultancy and talent solutions 
              that empower businesses to scale efficiently.
            </p>
            
            <h2 className="text-2xl text-[#F6931B] font-semibold mb-6">Our Services:</h2>
            
            <div className="space-y-8">
              {/* Tek Talent Africa */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0 p-4 rounded-lg">
                  <Image 
                    src="/talent.svg"
                    alt="Talent Icon"
                    width={60}
                    height={60}
                  />
                </div>
                <div>
                  <h3 className="text-xl text-[#F6931B] font-semibold mb-3">Tek Talent Africa</h3>
                  <p className="text-gray-700">
                    A premier platform connecting global businesses with top African tech talent. 
                    We source, vet, and place skilled professionals through our African offices, 
                    ensuring world-class quality and global readiness.
                  </p>
                </div>
              </div>
  
              {/* Outsourcing Tech Teams */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0 p-4 rounded-lg">
                  <Image 
                    src="/outsourcing.svg"
                    alt="Outsourcing Icon"
                    width={60}
                    height={60}
                  />
                </div>
                <div>
                  <h3 className="text-xl text-[#F6931B] font-semibold mb-3">Outsourcing Tech Teams</h3>
                  <p className="text-gray-700">
                    We help companies build, manage, and scale remote tech teams by providing 
                    dedicated developers, engineers, and IT specialists tailored to your business needs.
                  </p>
                </div>
              </div>
  
              {/* Managed Support Services */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0 p-4 rounded-lg">
                  <Image 
                    src="/support.svg"
                    alt="Support Icon"
                    width={60}
                    height={60}
                  />
                </div>
                <div>
                  <h3 className="text-xl text-[#F6931B] font-semibold mb-3">Managed Support Services</h3>
                  <p className="text-gray-700">
                    We offer ongoing technical and IT support to help businesses maintain their digital infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
    
          {/* Right Side: Sign Up Options */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#F6931B] mb-4">Join Our Network</h2>
              <p className="text-gray-600 text-lg">Choose how you'd like to connect with us</p>
            </div>
            
            <div className="w-full max-w-md space-y-6">
              <Link 
                href="/talent" 
                className="block w-full px-8 py-4 text-xl font-semibold text-center text-white bg-[#F6931B] rounded-lg shadow-md hover:bg-black hover:text-[#F6931B] transition-all duration-300 transform hover:scale-105"
              >
                Join as Talent
              </Link>
              
              <Link 
                href="/login-et" 
                className="block w-full px-8 py-4 text-xl font-semibold text-center text-white bg-black rounded-lg shadow-md hover:bg-[#F6931B] hover:text-black transition-all duration-300 transform hover:scale-105"
              >
                Login to Update Details
              </Link>
            </div>
            
            {/* <div className="mt-10 text-center">
              <p className="text-gray-500">Not sure which option to choose?</p>
              <Link href="/contact" className="text-[#F6931B] hover:underline">Contact Us</Link>
            </div> */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}