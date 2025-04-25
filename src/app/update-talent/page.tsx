//this is the file to update details. Gets auto populated with the details from the talent table
"use client";

import { useState, useRef, useEffect } from "react";
//import { redirect } from "next/navigation";
import PhoneInput, { Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { validateEmail, validatePassword } from '../lib/validator';
import Navbar from "../components/navbar";

export default function TalentDashboard() {
    
    // State for form data
    const [formData, setFormData] = useState({
        name: "",
        email1: "",
        email2: "",
        password: "",
        repeat_password: "",
        contact: "",
        whatsapp: "",
        skills: [] as string[],
        preferred_contact: [] as string[],
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(100);
    const [showPassword, setShowPassword] = useState(false);
    const [ showPasswordFields, setShowPasswordFields ] = useState(false);
    const [ showConfirmation, setShowConfirmation ] = useState(false);

    // Add state for skills dropdown
    const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // List of available skills
    const availableSkills = [
        "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
        "Python", "Django", "Flask", "Java", "Spring Boot",
        "C#", ".NET", "PHP", "Laravel", "Vue.js",
        "Angular", "Ruby", "Ruby on Rails", "SQL", "MongoDB",
        "AWS", "Azure", "Docker", "Kubernetes", "DevOps",
        "Mobile Development", "iOS", "Android", "React Native",
        "UI/UX Design", "HTML", "CSS", "Tailwind CSS", "Bootstrap",
        "GraphQL", "REST API", "Microservices", "Git", "CI/CD"
    ];

    // Add useEffect for success message timeout
    useEffect(() => {
        let timer: NodeJS.Timeout;
        let progressTimer: NodeJS.Timeout;
        
        if (success) {
            setProgress(100);
            //setShowConfirmation(false); //ensures the modal closes when success shows
            progressTimer = setInterval(() => {
                setProgress(prev => Math.max(0, prev - 1));
            }, 100);
            
            timer = setTimeout(() => {
                setSuccess(false);
                setProgress(100);
            }, 10000);
        }
        
        return () => {
            clearTimeout(timer);
            clearInterval(progressTimer);
        };
    }, [success]);

    //use effect to fetch users
    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const response = await fetch('/api/talent', {
              credentials: 'include'
            });
            
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
            
            const { data } = await response.json(); // Get the full response
            
              setFormData(prev => ({
                ...prev, //prev is the previous form data
                name: data.name || "",
                email1: data.email1 || "",
                email2: data.email2 === "nil" || data.email2 === "NIL" ? "" : data.email2 || "",
                contact: data.contact === "NIL" ? "" : data.contact || "",
                whatsapp: data.whatsapp === "NIL" ? "" : data.whatsapp || "",
                skills: data.skills?.[0] === "NIL" ? [] : data.skills || [],
                preferred_contact: data.preferred_contact?.[0] === "NIL" ? [] : data.preferred_contact || []
              }));
              setSelectedSkills(data.skills || []);
          } catch (error) {
            console.error("Failed to fetch user data", error);
            window.location.href = "/login-et"; // Use window.location instead of redirect
          }
        };
      
        fetchUserData();
      }, []);
    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSkillsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Handle skill selection
    const handleSkillToggle = (skill: string) => {
        setSelectedSkills(prev => {
            const newSkills = prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill];
            
            // Update formData with the new skills array
            setFormData(prevForm => ({
                ...prevForm,
                skills: newSkills  // Directly use the array
            }));

            return newSkills;
        });
    };

    // Validate names
    const validateName = (name: string): boolean => {
        const regex = /^[A-Za-z\s]+$/; // allows letters and spaces
        return regex.test(name) && name.length >= 4;
    };

    // Handle phone number change
    const handlePhoneChange = (value: Value) => {
        setFormData({ ...formData, contact: value || "" });
    };

    // Handle whatsapp number change
    const handleWhatsappChange = (value: Value) => {
        setFormData({ ...formData, whatsapp: value || "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Update name validation
        if (name === "name") {
            if (!validateName(value)) {
                setError("Names should only contain letters and spaces.");
                return;
            }
        }
        // Update primary email1
        if (name === "email1") {
            const emailValidation = validateEmail(value);
            if (!emailValidation.isValid) {
                setError(emailValidation.error || "Invalid email format");
                return;
            }
        }
        
        // Secondary email2 validation (only if provided)
        if (name === "email2") {  
            if (value){// Only validate if there's a value
                const emailValidation = validateEmail(value);
                if (!emailValidation.isValid) {
                    setError(emailValidation.error || "Invalid email format");
                } else {
                    setError("");
                }
            } else {
                setError("");
            }
        }

        setFormData({ ...formData, [name]: value });
        //setError(""); // Clear any previous errors
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        if (name === "preferred_contact") {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked
                    ? [...prevState.preferred_contact, value]
                    : prevState.preferred_contact.filter(item => item !== value),
            }));
        }
    };

    //first confirmation handle
    const handleSubmitConfirmation = (e: React.FormEvent) => {
        e.preventDefault();
        
        //validate name
        if (formData.name.length < 4) {
            setError("Name must be at least 4 characters long");
            return;
        }
        //validate at least one preferred contact
        if (formData.preferred_contact.length === 0) {
            setError("At least one preferred contact must be selected");
            return;
        }
        // Validate form 
        const primaryEmailValidation = validateEmail(formData.email1);
        if (!primaryEmailValidation.isValid) {
            setError(primaryEmailValidation.error || "Invalid primary email format");
            return;
        }
    
        if (formData.email2) {
            const secondaryEmailValidation = validateEmail(formData.email2);
            if (!secondaryEmailValidation.isValid) {
                setError(secondaryEmailValidation.error || "Invalid secondary email format");
                return;
            }
        }
    
        //validate password
        if (showPasswordFields) {
            if (formData.password !== formData.repeat_password) {
            setError("Passwords do not match");
            return;
            }
            try {
            const passwordValidation = validatePassword(formData.password, formData.email1);
            if (!passwordValidation.isValid) {
                setError(passwordValidation.error || "Invalid password format");
                return;
            }
            } catch (error) {
            setError("An unexpected error occurred while validating the password.");
            return;
            }
        }
    
        // If validation passes, show confirmation
        setShowConfirmation(true);
    };

    const handleSubmitFinal = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            // Prepare update data - exclude password if empty
            const updateData = {
                ...formData,
                // Only include password fields if they have values
                ...(formData.password ? { 
                    password: formData.password,
                    repeat_password: formData.repeat_password 
                } : {})
            };

            const res = await fetch("/api/talent", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            //clear form data
            setFormData({
                name: "",
                email1: "",
                email2: "",
                password: "",
                repeat_password: "",
                contact: "",
                whatsapp: "",
                skills: [],
                preferred_contact: [],      
            });
            setSelectedSkills([]); //clear selected skills

            setShowConfirmation(false); //closes the modal first
            setSuccess(true);
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

    const handleLogout = () => {
        // Add logout logic here
        window.location.href = "/login-et";
    };    

    // Update the skills section in the form render
    const renderSkillsField = () => (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-black mb-1">
                Skills
            </label>
            <div
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B] cursor-pointer min-h-[42px]"
                onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
            >
                {selectedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedSkills.map(skill => (
                            <span
                                key={skill}
                                className="bg-[#F6931B] text-black px-2 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSkillToggle(skill);
                                    }}
                                    className="hover:text-red-600"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <span className="text-gray-500">Select your skills</span>
                )}
            </div>
            {isSkillsDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                        {availableSkills.map(skill => (
                            <div
                                key={skill}
                                className={`px-3 py-2 cursor-pointer rounded-md text-black ${
                                    selectedSkills.includes(skill)
                                        ? 'bg-[#F6931B] text-black'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleSkillToggle(skill)}
                            >
                                {skill}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Render different sections based on activeSection
  
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden mt-20">
                    {/* Header with Logout */}
                    <div className="bg-white p-4 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-black">Give Us Your Details</h2>
                        <button 
                            onClick={handleLogout} 
                            className="bg-[#F6931B] text-black px-4 py-2 rounded-md hover:bg-black hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </div>
    
                    {/* Success Message */}
                    {success && (
                        <div className="p-4">
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded relative">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="font-bold">Success!</p>
                                </div>
                                <p className="mt-2">Your details have been submitted successfully!</p>
                                <div className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-100" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
    
                    {/* Form Content */}
                    <div className="p-6 sm:p-8">
                        <form onSubmit={handleSubmitConfirmation} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name (Minimum 4 characters)
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        placeholder="Enter Your full name"
                                        onChange={handleChange}
                                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition-colors"
                                        required
                                    />
                                </div>
    
                                {/* Primary Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Primary Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email1"
                                        value={formData.email1}
                                        placeholder="Enter Primary Email"
                                        onChange={handleChange}
                                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition-colors"
                                        required
                                    />
                                </div>
    
                                {/* Secondary Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Secondary Email (if applicable)
                                    </label>
                                    <input
                                        type="email"
                                        name="email2"
                                        value={formData.email2}
                                        placeholder="Enter Secondary Email"
                                        onChange={handleChange}
                                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition-colors"
                                    />
                                </div>
    
                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                                    <PhoneInput
                                        international
                                        defaultCountry="UG"
                                        value={formData.contact === "NIL" ? "" : formData.contact}
                                        onChange={handlePhoneChange}
                                        placeholder="Enter Phone Number"
                                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition-colors"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <PhoneInput
                                        international
                                        defaultCountry="UG"
                                        value={formData.whatsapp === "NIL" ? "" : formData.whatsapp}
                                        onChange={handleWhatsappChange}
                                        placeholder="Enter WhatsApp Number"
                                        className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition-colors"
                                        style={{
                                            '--PhoneInputCountryFlag-height': '1em',
                                            '--PhoneInputCountryFlag-width': '1.5em',
                                            '--PhoneInputCountrySelectArrow-color': '#F6931B',
                                        }}
                                        required
                                    />
                                </div>
    
                                {/* Skills */}
                                <div className="md:col-span-2">
                                    {renderSkillsField()}
                                </div>
    
                                {/* Preferred Contact Method - KEPT EXACTLY AS IS */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Preferred Contact Method (select at least one)
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
                                                    className="appearance-none h-5 w-5 rounded border-2 border-gray-300 checked:bg-[#F6931B] checked:border-[#F6931B] relative transition-colors duration-200 before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:w-2 before:h-3 before:border-r-2 before:border-b-2 before:border-white before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:opacity-0 checked:before:opacity-100"
                                                />
                                                <span className="text-black text-sm md:text-base">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
    
                            {/* Password Fields - KEPT EXACTLY AS IS */}
                            {showPasswordFields && (
                            <>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-black mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B] pr-10"
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
    
                                <div className="relative">
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Repeat New Password
                                    </label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="repeat_password"
                                        value={formData.repeat_password}
                                        onChange={handleChange}
                                        placeholder="Repeat new password"
                                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B] pr-10"
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
                            </>
                            )}
    
                            <button
                                type="button"
                                onClick={() => setShowPasswordFields(!showPasswordFields)}
                                className="text-[#F6931B] hover:text-black text-sm mb-4"
                            >
                                {showPasswordFields ? 'Cancel password change' : 'Change password'}
                            </button>
    
                            {error && (
                                <p className="text-red-600 text-center">{error}</p>
                            )}
    
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#F6931B] text-black px-4 py-3 rounded-md hover:bg-black hover:text-[#F6931B] transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    "Update Details"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
    
            {/* Confirmation Modal */}
            {showConfirmation && !success && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-black">Please Confirm Your Details</h3>
                        
                        <div className="space-y-3 mb-6">
                            <div>
                                <p className="font-semibold text-black">Name:</p>
                                <p className="text-gray-700">{formData.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-black">Primary Email:</p>
                                <p className="text-gray-700">{formData.email1}</p>
                            </div>
                            {formData.email2 && (
                                <div>
                                    <p className="font-semibold text-black">Secondary Email:</p>
                                    <p className="text-gray-700">{formData.email2}</p>
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-black">Contact:</p>
                                <p className="text-gray-700">{formData.contact}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-black">WhatsApp:</p>
                                <p className="text-gray-700">{formData.whatsapp}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-black">Skills:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="bg-[#F6931B] text-black px-2 py-1 rounded-md text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-black">Preferred Contact Methods:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.preferred_contact.map(method => (
                                        <span key={method} className="bg-[#F6931B] text-black px-2 py-1 rounded-md text-sm">
                                            {method}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
    
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitFinal}
                                disabled={loading}
                                className="px-4 py-2 bg-[#F6931B] text-black rounded-md hover:bg-black hover:text-[#F6931B] transition-colors flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    "Confirm and Update"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
