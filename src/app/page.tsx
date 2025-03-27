//page that collects enquiries from users.

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
    /*validate country dial codes
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
    ];*/
    //add state for selected dial code
    const handlePhoneChange = (value: Value) =>{
        setFormData({ ...formData, contact: value || "" });
    };

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

        setFormData({ ...formData, [name]: value });
        setError("");//clear any previous errors.
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        // Restrict `name` to only the keys that are arrays
        if (name === "services" || name === "preferred_contact") {
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
                    //contact: `${dialCode}${formData.contact}`, //combines dial code and contact
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] pt-20">
        <Navbar />
        <div className=" flex-grow max-w-6xl w-full rounded-lg overflow-hidden flex my-8 mx-auto">
          {/* Left Side: Text Content */}
            <div className="w-1/2 p-8 bg-[#F9FAFB] text-black">
                <h1 className="text-3xl text-[#F6931B] font-bold mb-8">Welcome to Tek Juice!</h1>
                <p className="mb-4 text-xl leading-relaxed">
                    We create opportunities through technology by{' '}
                    offering strategic consultancy and talent solutions 
                    that empower businesses to scale efficiently.
                </p>
                <h2 className="text-xl text-[#F6931B] font-semibold mb-2">Our Services:</h2>
                <ul className="list-none mb-4 leading-relaxed">
                    {/* Tek Talent Africa */}
                    <li className="mb-4">
                    <div className="flex items-start">
                        <span className="text-[#F6931B] mr-2">
                            <Image 
                                src="/talent.svg" // Icon path in public folder at the root
                                alt="Talent Icon"
                                width={100}
                                height={100}
                                className="text-white"
                            />
                        </span> {/* Icon */}
                        <div>
                        <h3 className="text-lg text-[#F6931B] font-semibold mb-1">Tek Talent Africa</h3>
                        <p className="ml-6">
                            A premier platform connecting global businesses with top African tech talent. 
                            We source, vet, and place skilled professionals through our African offices, 
                            ensuring world-class quality and global readiness.
                        </p>
                        </div>
                    </div>
                    </li>

                    {/* Outsourcing Tech Teams */}
                    <li className="mb-4">
                    <div className="flex items-start">
                        <span className="text-[#F6931B] mr-2">
                            <Image 
                                src="/outsourcing.svg" // Icon Path
                                alt="Outsourcing Icon"
                                width={100}
                                height={100}
                                className="text-white"
                            />
                        </span> {/* Icon */}
                        <div>
                        <h3 className="text-lg text-[#F6931B] font-semibold mb-1">Outsourcing Tech Teams</h3>
                        <p className="ml-6">
                            We help companies{' '}
                            build, manage, and scale remote tech teams by providing{' '}
                            dedicated developers, engineers, and IT specialists tailored 
                            to your business needs. Whether you need a full tech team or specific 
                            expertise, we handle recruitment, onboarding, and management to ensure 
                            seamless operations.
                        </p>
                        </div>
                    </div>
                    </li>

                    {/* Managed Support Services */}
                    <li className="mb-4">
                    <div className="flex items-start">
                        <span className="text-[#F6931B] mr-2">
                            <Image 
                                src="/support.svg" // Icon Path
                                alt="Support Icon"
                                width={100}
                                height={100}
                                className="text-white"
                            />
                        </span> {/* Icon */}
                        <div>
                            <h3 className="text-lg text-[#F6931B] font-semibold mb-1">Managed Support Services</h3>
                            <p className="ml-6">
                                We offer{' '}
                                ongoing technical and IT support to help businesses maintain their digital infrastructure. Our{' '}
                                managed support includes{' '}
                                
                                system monitoring, troubleshooting, software updates, cybersecurity, and round-the-clock technical assistance
                                
                                , ensuring business continuity and efficiency.
                            </p>
                        </div>
                    </div>
                    </li>
                </ul>

                <p className="mb-4 leading-relaxed">
                    Submit your enquiry, and our team will get back to you within 24-48 hours!
                </p>
                <div className="flex flex-col ml-20 gap-4">
                    <h3 className="text-lg font-medium">Visit us:</h3>
                    
                    {/* Website */}
                    <div className="flex items-center">
                        <span className="text-[#F6931B] mr-2">
                            <Image 
                                src="/website.png"
                                alt="Website Icon"
                                width={30}
                                height={30}
                                className="text-white"
                            />
                        </span>
                        <a href="https://www.tekjuice.co.uk">
                            www.tekjuice.co.uk
                        </a>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center">
                        <span className="text-[#F6931B] mr-2">
                            <Image 
                                src="/telephone.png"
                                alt="Phone Icon"
                                width={30}
                                height={30}
                                className="text-white"
                            />
                        </span>
                        <a href="tel:+447974810717">
                            +44 7974 810717
                        </a>
                    </div>

                    {/* Email */}
                    <div className="flex items-center">
                        <span className="text-[#F6931B] mr-2">
                            <Image 
                                src="/email.png"
                                alt="Email Icon"
                                width={30}
                                height={30}
                                className="text-white"
                            />
                        </span>
                        <a href="mailto:info@tekjuice.co.uk">
                            info@tekjuice.co.uk
                        </a>
                    </div>
                </div>
                
            </div>
  
          {/* Right Side: Form */}
          <div className="w-1/2 p-8 mb-5 mt-4 bg-white">
          <h2 className="text-3xl text-black font-bold mb-4 ml-30">Get In Touch</h2>
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 text-black rounded-md shadow-sm focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
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
                        className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
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
                        className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                        required
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label className="block text-sm font-medium text-black">Contact</label>
                    <div className="flex gap-2">
                        {/* Dial Code Dropdown with Flag */}

                        {/* Contact Input */}
                        <PhoneInput
                            international
                            defaultCountry="UG"
                            value={formData.contact}
                            onChange={handlePhoneChange}
                            placeholder="Enter Phone Number"
                            className="
                                flex-1 block p-3 border-2 border-gray-300 rounded-lg 
                                placeholder-[#F6931B] text-black focus:outline-none
                                focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]
                                hover:border-[#F6931B] transition-colors duration-200
                                "
                            style={{
                                '--PhoneInputCountryFlag-height': '1em', // Adjust flag height
                                '--PhoneInputCountryFlag-width': '1.5em', // Adjust flag width 
                                '--PhoneInputCountrySelectArrow-color': '#F6931B', // Customize dropdown arrow color
                                
                            }}
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
                        className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                        required
                    />
                </div>

                {/* Services */}
                <div>
                    <label className="block text-sm font-medium text-black mb-4">What services are you interested in? (Select all that apply)</label>
                    <div className="flex flex-col gap-4">
                        {[
                        { name: "services", value:"Hiring vetted African tech talent (Tek Talent)", label:"Hiring vetted African tech talent (Tek Talent)"},
                        { name:"services", value: "Outsourcing part or all of your Tech team",label:"Outsourcing part or all of your Tech team"},
                        { name:"services",value: "Other", label:"Other (Please Specify)"}
                        ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 p-1 rounded-lg hover:bg-[#F7FAFC]">
                            <input
                            type="checkbox"
                            name={option.name}
                            value={option.value}
                            onChange={handleCheckboxChange}
                            checked={formData.services.includes(option.value)}
                            className="appearance-none h-5 w-5 rounded border-2 border-gray-300 
                                        checked:bg-[#F6931B] checked:border-[#F6931B] relative transition-colors duration-200
                                        before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:w-2 before:h-3 
                                        before:border-r-2 before:border-b-2 before:border-white before:transform 
                                        before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:opacity-0 
                                        checked:before:opacity-100"
                            />
                            <span className="text-black text-sm md:text-base">{option.label}</span>
                        </label>
                        
                        ))}
                        {formData.services.includes('Other') && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={otherService}
                                    onChange={(e) => setOtherService(e.target.value)}
                                    className="w-full px-3 py-2 text-black border 
                                    border-gray-300 rounded-md shadow-sm focus:outline-[#F6931B]
                                    focus:ring-[#F6931B] focus:border-[#F6931B]"
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
                        className="mt-1 block w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
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
                            <label key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#F7FAFC]">
                                <input
                                    type="checkbox"
                                    name={option.name}
                                    value={option.value}
                                    onChange={handleCheckboxChange}
                                    checked={formData.preferred_contact.includes(option.value)}
                                    className="appearance-none h-5 w-5 rounded border-2 border-gray-300 
                                        checked:bg-[#F6931B] checked:border-[#F6931B] relative transition-colors duration-200
                                        before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:w-2 before:h-3 
                                        before:border-r-2 before:border-b-2 before:border-white before:transform 
                                        before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45 before:opacity-0 
                                        checked:before:opacity-100
                                        "
                                />
                                <span className="text-black text-sm md:text-base">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* How did you hear about Tek Juice? */}
                <div>
                    <label className="block text-sm font-medium text-black">
                        How did you hear about Tek Juice?
                    </label>
                    <div className="mt-2">
                        <select
                        name="know_us"
                        value={formData.know_us[0] || ""} // Use the first value if it exists
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            setFormData((prevState) => ({
                            ...prevState,
                            know_us: [selectedValue], // Store the selected value in an array
                            }));
                            if (selectedValue === "Others") {
                            setOtherKnowUs(""); // Reset the "Other" input when "Others" is selected
                            }
                        }}
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                        >
                        <option value="">Select an option</option>
                        <option value="Social media">Social media</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Others">Other (Please Specify)</option>
                        </select>
                    </div>
                    {formData.know_us.includes("Others") && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={otherKnowUs}
                                onChange={(e) => setOtherKnowUs(e.target.value)}
                                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-[#F6931B] focus:ring-[#F6931B] focus:border-[#F6931B]"
                                placeholder="Specify"
                            />
                        </div>
                    )}
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
        <Footer />
      </div>
    );
}

