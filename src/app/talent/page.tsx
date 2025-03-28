//page that collects enquiries from talents.

"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import Image from "next/image";
//import { allCountries } from 'country-telephone-data';
import PhoneInput, { Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
  

export default function Enquiry() {
    
    //this interface defines the types of the data being submitted.
    interface formData {
        name: string;
        email1: string;
        email2: string;
        contact: string;
        whatsapp: string;
        skills: string;
        preferred_contact: string[];
    }
    
    const [formData, setFormData] = useState<formData>({
        name: "",
        email1: "",
        email2: "",
        contact: "",
        whatsapp: "",
        skills: "",
        preferred_contact: [],
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [otherService, setOtherService] = useState(""); // State for "Other" input in Services
    const [otherKnowUs, setOtherKnowUs] = useState(""); // State for "Other" input in Know Us

    //validate names
    const validateName = (name: string): boolean => {
        const regex = /^[A-Za-z\s]+$/; //allows letters and spaces
        return regex.test(name);
    };

    //validate email
    const validateEmail1 = (email1: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
        return regex.test(email1);
    }
    //validate email
    const validateEmail2 = (email2: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
        return regex.test(email2);
    }

    //add state for selected dial code
    const handlePhoneChange = (value: Value) =>{
        setFormData({ ...formData, contact: value || "" });
    };

    //add state for selected dial code for whatsapp
    const handleWhatsappChange = (value: Value) =>{
        setFormData({ ...formData, whatsapp: value || "" });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value } = e.target;
        //update name validation
        if(name === "name") {
            if(!validateName(value)) {
                setError("Names should only contain letters and spaces.");
                return;
            }
        }
        //update primary email1
        if (name === "email") {
            if(!validateEmail1(value)) {
                setError("Please enter a valid email address.")
                return;
            }
        }
        
        // Secondary email2 validation (only if provided)
        if (name === "email2" && value) {  // Only validate if there's a value
            if (!validateEmail2(value)) {
                setError("Please enter a valid secondary email address.");
                return;
            }
        }

        setFormData({ ...formData, [name]: value });
        setError("");//clear any previous errors.
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        // Restrict `name` to only the keys that are arrays
        if (name === "preferred_contact") {
            setFormData((prevState) => {
                const currentArray = prevState[name]; // No need for type assertion now
                return {
                    ...prevState,
                    [name]: checked
                        ? [...currentArray, value] // Add the value to the array
                        : currentArray.filter((item) => item !== value), // Remove the value from the array
                };
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/talent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    //contact: `${dialCode}${formData.contact}`, //combines dial code and contact
                    //services: updatedServices, //send the object instead of an array.
                    //know_us: updatedKnowUs,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Something went wrong");

            setSuccess(true);
        } catch (err) {
            if (err instanceof Error) {//set instance of error
                setError(err.message);
            } else {
                setError("An unexpected error occured.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] pt-20">
          <Navbar />
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
                {/* Stack content vertically on mobile */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side: Text Content - Full width on mobile */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-8 bg-[#F9FAFB] text-black">
                        <h1 className="text-2xl sm:text-3xl text-[#F6931B] font-bold mb-6">Welcome to Tek Juice!</h1>
                        <p className="mb-6 text-lg sm:text-xl leading-relaxed">
                        We create opportunities through technology by offering strategic consultancy and talent solutions 
                        that empower businesses to scale efficiently.
                        </p>
                    
                        <h2 className="text-xl text-[#F6931B] font-semibold mb-4">Our Services:</h2>
                        
                        <ul className="list-none mb-6 space-y-6">
                            {/* Tek Talent Africa */}
                            <li>
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Image 
                                    src="/talent.svg"
                                    alt="Talent Icon"
                                    width={60}
                                    height={60}
                                    className="text-white"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg text-[#F6931B] font-semibold mb-2">Tek Talent Africa</h3>
                                    <p className="text-base">
                                    A premier platform connecting global businesses with top African tech talent. 
                                    We source, vet, and place skilled professionals through our African offices, 
                                    ensuring world-class quality and global readiness.
                                    </p>
                                </div>
                                </div>
                            </li>
            
                            {/* Outsourcing Tech Teams */}
                            <li>
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Image 
                                    src="/outsourcing.svg"
                                    alt="Outsourcing Icon"
                                    width={60}
                                    height={60}
                                    className="text-white"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg text-[#F6931B] font-semibold mb-2">Outsourcing Tech Teams</h3>
                                    <p className="text-base">
                                    We help companies build, manage, and scale remote tech teams by providing 
                                    dedicated developers, engineers, and IT specialists tailored to your business needs. 
                                    Whether you need a full tech team or specific expertise, we handle recruitment, 
                                    onboarding, and management to ensure seamless operations.
                                    </p>
                                </div>
                                </div>
                            </li>
            
                            {/* Managed Support Services */}
                            <li>
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                <div className="flex-shrink-0">
                                    <Image 
                                    src="/support.svg"
                                    alt="Support Icon"
                                    width={60}
                                    height={60}
                                    className="text-white"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg text-[#F6931B] font-semibold mb-2">Managed Support Services</h3>
                                    <p className="text-base">
                                    We offer ongoing technical and IT support to help businesses maintain their digital infrastructure. 
                                    Our managed support includes system monitoring, troubleshooting, software updates, cybersecurity, 
                                    and round-the-clock technical assistance, ensuring business continuity and efficiency.
                                    </p>
                                </div>
                                </div>
                            </li>
                        </ul>
            
                        <p className="mb-6 text-lg leading-relaxed">
                        Submit your enquiry, and our team will get back to you within 24-48 hours!
                        </p>
                        
                        {/* Contact Info - Stacked vertically */}
                        <div className="space-y-4">
                        <h3 className="text-lg font-medium">Visit us:</h3>
                        
                        <div className="flex items-center gap-3">
                            <Image 
                            src="/website.png"
                            alt="Website Icon"
                            width={24}
                            height={24}
                            />
                            <a href="https://www.tekjuice.co.uk" className="text-base">
                            www.tekjuice.co.uk
                            </a>
                        </div>
                
                        <div className="flex items-center gap-3">
                            <Image 
                            src="/telephone.png"
                            alt="Phone Icon"
                            width={24}
                            height={24}
                            />
                            <a href="tel:+447974810717" className="text-base">
                            +44 7974 810717
                            </a>
                        </div>
                
                        <div className="flex items-center gap-3">
                            <Image 
                            src="/email.png"
                            alt="Email Icon"
                            width={24}
                            height={24}
                            />
                            <a href="mailto:info@tekjuice.co.uk" className="text-base">
                            info@tekjuice.co.uk
                            </a>
                        </div>
                        </div>
                    </div>
                
                    {/* Right Side: Form - Full width on mobile, appears after content */}
                    <div className="w-full lg:w-1/2 p-4 sm:p-8 bg-white order-first lg:order-last">
                        <h2 className="text-2xl sm:text-3xl text-black font-bold mb-6">Give Us Your Details</h2>
                        {success ? (
                        <p className="text-green-600 font-bold text-center">
                            ✅ Your Details have been submitted! We'll contact you soon. Reload page to submit another enquiry.
                        </p>
                        ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            {/* Name */}
                            <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter Your full name"
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                                required
                            />
                            </div>
            
                            {/* Primary Email */}
                            <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Primary Email 
                            </label>
                            <input
                                type="email"
                                name="email1"
                                placeholder="Enter Primary Email"
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                                required
                            />
                            </div>
            
                            {/* Secondary Email */}
                            <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Secondary Email (if applicable)
                            </label>
                            <input
                                type="email"
                                name="email2"
                                placeholder="Enter Your Secondary Email"
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                            />
                            </div>
            
                            {/* Phone Number */}
                            <div>
                            <label className="block text-sm font-medium text-black mb-1">Contact</label>
                            <PhoneInput
                                international
                                defaultCountry="UG"
                                value={formData.contact}
                                onChange={handlePhoneChange}
                                placeholder="Enter Phone Number"
                                className="
                                    w-full p-2 border-2 border-gray-300 rounded-lg placeholder-[#F6931B]
                                    text-black focus:outline-none focus:ring-2 focus:ring-[#F6931B] 
                                    focus:border-[#F6931B] hover:border-[#F6931B] transition-colors"
                                style={{
                                '--PhoneInputCountryFlag-height': '1em',
                                '--PhoneInputCountryFlag-width': '1.5em',
                                '--PhoneInputCountrySelectArrow-color': '#F6931B',
                                }}
                                required
                            />
                            </div>
            
                            {/* Whatsapp Number */}
                            <div>
                            <label className="block text-sm font-medium text-black mb-1">Whatsapp</label>
                            <PhoneInput
                                international
                                defaultCountry="UG"
                                value={formData.whatsapp}
                                onChange={handleWhatsappChange}
                                placeholder="Enter Whatsapp Number"
                                className="
                                    w-full p-2 border-2 border-gray-300 rounded-lg placeholder-[#F6931B]
                                    text-black focus:outline-none focus:ring-2 focus:ring-[#F6931B] 
                                    focus:border-[#F6931B] hover:border-[#F6931B] transition-colors"
                                style={{
                                '--PhoneInputCountryFlag-height': '1em',
                                '--PhoneInputCountryFlag-width': '1.5em',
                                '--PhoneInputCountrySelectArrow-color': '#F6931B',
                                }}
                                required
                            />
                            </div>
            
                            {/* Skills */}
                            <div>
                            <label className="block text-sm font-medium text-black mb-1">
                                Skills
                            </label>
                            <textarea
                                id="skills"
                                name="skills"
                                placeholder="Enter Your Skills"
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                                required
                            ></textarea>
                            </div>
            
                            {/* Preferred Contact Method */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Preferred Contact Method
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                    { name: "preferred_contact", value: "Email", label: "Email" },
                                    { name: "preferred_contact", value: "Phone", label: "Phone" },
                                    { name: "preferred_contact", value: "WhatsApp", label: "WhatsApp" }
                                    ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-2">
                                        <input
                                        type="checkbox"
                                        name={option.name}
                                        value={option.value}
                                        onChange={handleCheckboxChange}
                                        checked={formData.preferred_contact.includes(option.value)}
                                        className="
                                            appearance-none h-5 w-5 rounded border-2 border-gray-300 
                                            checked:bg-[#F6931B] checked:border-[#F6931B] relative transition-colors duration-200
                                            before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:w-2 before:h-3 
                                            before:border-r-2 before:border-b-2 before:border-white before:transform 
                                            before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:opacity-0 
                                            checked:before:opacity-100"
                                        />
                                        <span className="text-black text-sm md:text-base">{option.label}</span>
                                    </label>
                                    ))}
                                </div>
                            </div>
            
                            {/* Submit Button */}
                            <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#F6931B] text-black px-4 py-3 rounded-md hover:bg-black hover:text-[#F6931B] transition-colors"
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                            </div>
                        </form>
                        )}
                    </div>
                </div>
          </div>
          <Footer />
        </div>
      );
}

