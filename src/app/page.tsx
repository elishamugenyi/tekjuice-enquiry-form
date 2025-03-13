//page that collects enquiries from users.

"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/navbar";
import Image from "next/image";
  

export default function Enquiry() {
    
    //this interface defines the types of the data being submitted.
    interface formData {
        name: string;
        company: string;
        email: string;
        contact: string;
        location: string;
        services: string[]; // Ensure it's recognized as a string array
        about_you: string;
        preferred_contact: string[];
        know_us: string[];
        
    }
    
    const [formData, setFormData] = useState<formData>({
        name: "",
        company: "",
        email: "",
        contact: "",
        location: "",
        services: [],
        about_you: "",
        preferred_contact: [],
        know_us: [],
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
    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format validation
        return regex.test(email);
    }
    //validate country dial codes
    const countryDialCodes = [
        {code: "+1", name:"USA", flag: "🇺🇸" },
        { code: "+44", name: "UK", flag: "🇬🇧" },
        { code: "+256", name: "Uganda", flag: "🇺🇬" },
        { code: "+254", name: "Kenya", flag: "🇰🇪" },
        { code: "+971", name: "UAE", flag: "🇦🇪" },
        { code: "+234", name: "Nigeria", flag: "🇳🇬" },
        { code: "+27", name: "South Africa", flag: "🇿🇦" },
        { code: "+221", name: "Senegal", flag: "🇸🇳" },
        { code: "+233", name: "Ghana", flag: "🇬🇭" },
    ];
    //add state for selected dial code
    const [dialCode, setDialCode] = useState("+256");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value } = e.target;
        //update name validation
        if(name === "name") {
            if(!validateName(value)) {
                setError("Names should only contain letters and spaces.");
                return;
            }
        }
        //update email
        if (name === "email") {
            if(!validateEmail(value)) {
                setError("Please enter a valid email address.")
                return;
            }
        }
        //validate contact
        if (name === "contact") {
            if (value.startsWith("0")) {
                setError("Contact number should not start with a zero");
                return;
            }
        }
        setFormData({ ...formData, [name]: value });
        setError("");//clear any previous errors.
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        // Restrict `name` to only the keys that are arrays
        if (name === "services" || name === "preferred_contact" || name === "know_us") {
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

        //validate social media selection
        if(formData.services.length === 0) {
            setError("Please select at least one social media platform")
            return;
        }
        setLoading(true);
        setError("");

        // Append "Other" input value to the `services` array if "Other" is selected
        const updatedServices = [...formData.services];
        if (formData.services.includes("Other") && otherService.trim()) {
            updatedServices.push(otherService.trim()); // Add the "Other" input value
        }

        // Append "Other" input value to the `know_us` array if "Others" is selected
        const updatedKnowUs = [...formData.know_us];
        if (formData.know_us.includes("Others") && otherKnowUs.trim()) {
            updatedKnowUs.push(otherKnowUs.trim()); // Add the "Other" input value
        }

        try {
            const res = await fetch("/api/enquiry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    contact: `${dialCode}${formData.contact}`, //combines dial code and contact
                    services: updatedServices, //send the object instead of an array.
                    know_us: updatedKnowUs,
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
        <Navbar />
        <div className="max-w-6xl w-full bg-white shadow-lg rounded-lg overflow-hidden flex">
          {/* Left Side: Text Content */}
          <div className="w-1/2 p-8 bg-white text-black">
            <h1 className="text-3xl text-[#F6931B] font-bold mb-4">Tek Juice Enquiry Form</h1>
            <p className="mb-4">
              <strong>Welcome to Tek Juice!</strong><br /> 
              We create opportunities through technology 
              by <strong>offering strategic consultancy and talent solutions</strong> that 
              empower businesses to scale efficiently.
            </p>
            <h2 className="text-xl text-[#F6931B] font-semibold mb-2">Our Services:</h2>
            <ul className="list-disc list-inside mb-4">
              <li>
                <strong>Tek Talent Africa</strong>
                 – A premier platform connecting global businesses
                with top African tech talent. We source, vet, and 
                place skilled professionals through our African 
                offices, ensuring world-class quality and global 
                readiness.
              </li>
              <li>
                <strong>Outsourcing Tech Teams</strong>
                 – We help companies <strong>build, manage, and scale 
                 remote tech teams</strong> by providing <strong>dedicated 
                 developers, engineers, and IT specialists</strong> 
                 tailored to your business needs. Whether 
                 you need a full tech team or specific expertise, 
                 we handle recruitment, onboarding, and management 
                 to ensure seamless operations.

              </li>
              <li>
                <strong>Managed Support Services</strong>
                 – We offer <strong>ongoing technical and IT support</strong>
                to help businesses maintain their digital 
                infrastructure.
                Our <strong>managed support</strong> includes <strong>system monitoring, 
                troubleshooting, software updates, cybersecurity, 
                and round-the-clock technical assistance</strong>, ensuring 
                business continuity and efficiency.

              </li>
            </ul>
            <p className="mb-4">
              Submit your enquiry, and our team will get back to you within 24-48 hours!
            </p>
            <p>
              For more information, visit us at:{' '}
              <a href="[Website URL]" className="underline">
                [Website URL]
              </a>
            </p>
            <p>
              Email us at:{' '}
              <a href="mailto:tekjuicedigitalmarketing@gmail.com" className="underline">
                tekjuicedigitalmarketing@gmail.com
              </a>
            </p>
            <p>
              Call us at: <span className="underline">+44 7974 810717</span>
            </p>
          </div>
  
          {/* Right Side: Form */}
          <div className="w-1/2 p-8">
          {success ? (
                <p className="text-green-600 font-bold text-center">✅ Your Details have been submitted! We’ll contact you soon. Reload page to submit another enquiry.</p>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-black">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter Your full name"
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Company Name */}
                <div>
                    <label className="block text-sm font-medium text-black">
                        Company Name (if applicable)
                    </label>
                    <input
                        type="text"
                        name="company"
                        placeholder="Enter Company Name."
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-black">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Your Email"
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label className="block text-sm font-medium text-black">Contact</label>
                    <div className="flex gap-2">
                        {/* Dial Code Dropdown with Flag */}
                        <div className="flex items-center border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#3182CE] focus:border-transparent">
                            <select
                                value={dialCode}
                                onChange={(e) => setDialCode(e.target.value)}
                                className="p-3 text-[#1A1A1A] bg-transparent outline-none"
                            >
                                {countryDialCodes.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.flag} {country.code} {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Contact Input */}
                        <input
                            name="contact"
                            type="tel"
                            placeholder="757xxxxxx"
                            value={formData.contact}
                            onChange={handleChange}
                            className="flex-1 p-3 border border-[#E2E8F0] rounded-lg placeholder-[#A0AEC0] text-[#1A1A1A] focus:ring-2 focus:ring-[#3182CE] focus:border-transparent"
                            required
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-black">
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        placeholder="Enter Your Location."
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* Services */}
                <div>
                    <label className="block text-sm font-medium text-[#4A5568] mb-4">What services are you interested in? (Select all that apply)</label>
                    <div className="flex flex-col gap-4">
                        {[
                        { name: "services", value:"Hiring vetted African tech talent (Tek Talent)", label:"Hiring vetted African tech talent (Tek Talent)"},
                        { name:"services", value: "Outsourcing part or all of your Tech team",label:"Outsourcing part or all of your Tech team"},
                        { name:"services",value: "Other", label:"Other (Please Specify)"}
                        ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F7FAFC]">
                            <input
                            type="checkbox"
                            name={option.name}
                            value={option.value}
                            onChange={handleCheckboxChange}
                            checked={formData.services.includes(option.value)}
                            className="form-checkbox h-5 w-5 text-[#3182CE] rounded focus:ring-[#3182CE]"
                            />
                            <span className="text-[#4A5568] text-sm md:text-base">{option.label}</span>
                        </label>
                        
                        ))}
                        {formData.services.includes('Other') && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={otherService}
                                    onChange={(e) => setOtherService(e.target.value)}
                                    className="w-full px-3 py-2 text-gray-600 border 
                                    border-gray-300 rounded-md shadow-sm 
                                    focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Specify other services"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Tell us more about your needs */}
                <div>
                    <label className="block text-sm font-medium text-black">
                        Tell us more about your needs:
                    </label>
                    <textarea
                        id="about_you"
                        name="about_you"
                        value={formData.about_you}
                        onChange={handleChange}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>

                {/* Preferred Contact Method */}
                <div>
                    <label className="flex text-sm font-medium text-black">
                        Preferred Contact Method
                    </label>
                    <div className="mt-2 flex gap-4">
                        {[
                            { name: "preferred_contact", value: "Email", label: "Email" },
                            { name: "preferred_contact", value: "Phone", label: "Phone" },
                            { name: "preferred_contact", value: "WhatsApp", label: "WhatsApp" }
                        ].map((option) => (
                            <label key={option.value} className="flex items-center space-x-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F7FAFC]">
                                <input
                                    type="checkbox"
                                    name={option.name}
                                    value={option.value}
                                    onChange={handleCheckboxChange}
                                    checked={formData.preferred_contact.includes(option.value)}
                                    className="form-checkbox h-5 w-5 text-[#3182CE] rounded focus:ring-[#3182CE]"
                                />
                                <span className="text-[#4A5568] text-sm md:text-base">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* How did you hear about Tek Juice? */}
                <div>
                    <label className="block text-sm font-medium text-black">
                        How did you hear about Tek Juice?
                    </label>
                    <div className="mt-2 flex flex-col gap-4">
                        {[
                            { name: "know_us", value: "Social media", label: "Social media" },
                            { name: "know_us", value: "Website", label: "Website" },
                            { name: "know_us", value: "Referral", label: "Referral" },
                            { name: "know_us", value: "Others", label: "Other (Please Specify)" },
                        ].map((option) => (
                            <label key={option.value} className="flex items-center space-x-3 p-3 border border-[#E2E8F0] rounded-lg hover:bg-[#F7FAFC]">
                                <input
                                    type="checkbox"
                                    name={option.name}
                                    value={option.value}
                                    onChange={handleCheckboxChange}
                                    checked={formData.know_us.includes(option.value)}
                                    className="form-checkbox h-5 w-5 text-[#3182CE] rounded focus:ring-[#3182CE]"
                                />
                                <span className="text-[#4A5568] text-sm md:text-base">{option.label}</span>
                            </label>
                        ))}
                        {formData.know_us.includes("Others") && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={otherKnowUs}
                                    onChange={(e) => setOtherKnowUs(e.target.value)}
                                    className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Specify"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#F6931B] text-black 
                        px-4 py-2 rounded-md hover:bg-black 
                        hover:text-[#F6931B] focus:outline-none 
                        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                </div>
            </form>
            )}
          </div>
        </div>
      </div>
    );
}

