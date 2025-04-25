"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import PhoneInput, { Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { validateEmail, validatePassword } from '../lib/validator';

export default function TalentDashboard() {
    // State for form data
    const [formData, setFormData] = useState({
        name: "",
        email1: "",
        email2: "NIL", // Default value for hidden field
        password: "",
        repeat_password: "",
        contact: "",
        whatsapp: "NIL", // Default value for hidden field
        skills: ["NIL"], // Default value for hidden field
        preferred_contact: ["NIL"], // Default value for hidden field
    });


    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(100);
    const [showPassword, setShowPassword] = useState(false);
    const [ showConfirmation, setShowConfirmation ] = useState(false);

    // Add state for skills dropdown
    //const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
    //const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    //const dropdownRef = useRef<HTMLDivElement>(null);

    // List of available skills
    /* const availableSkills = [
        "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
        "Python", "Django", "Flask", "Java", "Spring Boot",
        "C#", ".NET", "PHP", "Laravel", "Vue.js",
        "Angular", "Ruby", "Ruby on Rails", "SQL", "MongoDB",
        "AWS", "Azure", "Docker", "Kubernetes", "DevOps",
        "Mobile Development", "iOS", "Android", "React Native",
        "UI/UX Design", "HTML", "CSS", "Tailwind CSS", "Bootstrap",
        "GraphQL", "REST API", "Microservices", "Git", "CI/CD"
    ]; */



    // Add useEffect for success message timeout
    useEffect(() => {
        let timer: NodeJS.Timeout;
        let progressTimer: NodeJS.Timeout;
        
        if (success) {
            setProgress(100);
            //setShowConfirmation(false); //ensuers the modal closes when success shows
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

    // Handle click outside to close dropdown
    /* useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSkillsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); */

    // Handle skill selection
    /* const handleSkillToggle = (skill: string) => {
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
    }; */

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

        setFormData({ ...formData, [name]: value });
        setError(""); // Clear any previous errors
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
        if (!formData.contact) {
            setError("contact number is required")
            return;
        }

        // Validate form 
        const primaryEmailValidation = validateEmail(formData.email1);
        if (!primaryEmailValidation.isValid) {
            setError(primaryEmailValidation.error || "Invalid primary email format");
            return;
        }

    
        //validate password
        if (formData.password !== formData.repeat_password) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        try {
            const passwordValidation = validatePassword(formData.password, formData.email1);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error || "Invalid password format");
                setLoading(false);
                return;
            }
        }   catch (error) {
            setError("An unexpected error occurred while validating the password.");
            setLoading(false);
            return;
        }
    
        // If validation passes, show confirmation
        setShowConfirmation(true);
    };

    const handleSubmitFinal = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const res = await fetch("/api/talent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            //clear form data
            setFormData({
                name: "",
                email1: "",
                email2: "NIL",
                password: "",
                repeat_password: "",
                contact: "",
                whatsapp: "NIL",
                skills: ["NIL"],
                preferred_contact: ["NIL"],      
            });

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

    // Update the skills section in the form render
    /* const renderSkillsField = () => (
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
    ); */

    // Render different sections based on activeSection
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            
            <main className="flex-grow">
                <div className="max-w-md mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-20">
                        <div className="p-6 sm:p-8">
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900">Join Our Talent Network</h1>
                                <p className="text-gray-600 mt-2">Fill in your basic details to get started</p>
                            </div>

                            {/* Success Message */}
                            {success && (
                                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Your details have been submitted successfully!</span>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmitConfirmation} className="space-y-5">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Minimum 4 characters, letters only</p>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email1"
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className="w-full text-black  px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition"
                                        required
                                    />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            onChange={handleChange}
                                            className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-gray-500 hover:text-[#F6931B]"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Repeat Password Field */}
                                <div>
                                    <label htmlFor="repeat_password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Repeat Password
                                    </label>
                                    <input
                                        id="repeat_password"
                                        type={showPassword ? "text" : "password"}
                                        name="repeat_password"
                                        onChange={handleChange}
                                        className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition"
                                        required
                                    />
                                </div>

                                {/* Contact Field */}
                                <div>
                                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <PhoneInput
                                        international
                                        defaultCountry="UG"
                                        value={formData.contact}
                                        onChange={handlePhoneChange}
                                        id="contact"
                                        className="w-full text-black p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] transition"
                                        style={{
                                            '--PhoneInputCountryFlag-height': '1em',
                                            '--PhoneInputCountryFlag-width': '1.5em',
                                            '--PhoneInputCountrySelectArrow-color': '#F6931B',
                                        }}
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-[#F6931B] text-white font-medium rounded-lg hover:bg-[#e07d0a] focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:ring-offset-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        "Join Waitlist"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {showConfirmation && !success && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Your Details</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                                        <p className="text-gray-900">{formData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-gray-900">{formData.email1}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                        <p className="text-gray-900">{formData.contact}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowConfirmation(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F6931B] transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitFinal}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#F6931B] rounded-lg hover:bg-[#e07d0a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F6931B] transition disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        Confirm Submission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}


