//DASHBOARD THAT DISPLAYS USERS FROM BRAND/USERS TABLE AND INFLUENCERS FROM INFLUENCERS TABLE.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SkeletonLoader from '@/app/components/skeletonLoader';
import Image from 'next/image';



const Dashboard = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"talent" | "enquiry">("talent"); //track active tab
  const [talent, setTalent] = useState<any[]>([]); //added talent state
  const [enquiry, setEnquiry] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null); //Set success delete message.
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string | null>(null); //set the update success message.
  const [ page, setPage ] = useState(1); //current page
  const [ limit, setLimit ] = useState(10); //10 Records per page
  const [total, setTotal] = useState(0); //Total records 
  const [filteredAllData, setFilteredData] = useState<any[]>([]); //store filtered data for display
  const [isProfileOpen, setIsProfileOpen] = useState(false); //for profile menu


  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Unauthorized. Please log in.');
      router.push('/login');
      return;
    }

    // Verify admin token
    fetch('/api/admin/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAdminData(data.admin); //set admin data including role
          fetchData(); // Fetch data after successful authentication
        } else {
          setError('Invalid or expired token.');
          router.push('/login');
        }
      })
      .catch(() => {
        setError('An error occurred.');
        router.push('/login');
      });
  }, [router]);

  //render buttons based on role
  const renderActions = (record: any) => {
    if (adminData?.role === 'admin') {
      return (
        <>
          <button className="text-blue-500 hover:text-blue-900 mr-2" onClick={() => openViewModal(record)}>View</button>
          <button className="text-green-600 hover:text-green-900 mr-2" onClick={() => openEditModal(record)}>Edit</button>
          <button className="text-red-600 hover:text-red-900 mr-2" onClick={() => handleDelete(record)}>Delete</button>
        </>
      );
    } else if (adminData?.role === 'manager') {
      return (
        <button className="text-blue-500 mr-2" onClick={() => openViewModal(record)}>View</button>
      );
    }
    return null;
  };
  useEffect(() => {
    fetchData();
  }, [page, limit, activeTab]); //add page and limit as dependencies.

  // Function to fetch data based on active tab
  const fetchData = () => {
    setLoading(true);
    const endpoint = `/api/admin/${activeTab}?page=${page}&limit=${limit}`;
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (activeTab === "talent") {
            setTalent(data.data || []); //set talent data
          } else {
              setEnquiry(data.data || []); // Set enquiry data
          }
          setTotal(data.total); //sets total records
        } else {
          setError('Failed to fetch data.');
        }
      })
      .catch(() => setError('An error occurred while fetching data.'))
      .finally(() => setLoading(false));
  };

  //fetch all data for search 
  const fetchAllDataForSearch = async() => {
    setLoading(true);
    const endpoint = `/api/admin/search?query=${searchQuery}&type=${activeTab}`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setFilteredData(data.data); //store filtered data
        setTotal(data.data.length); //update total records
      } else {
        setError('Failed to fetch search results.');
      }
    } catch (error) {
      setError('An error occured while searching.');
    } finally {
      setLoading(false);
    }
  };

  //Handle search query change
  useEffect(() => {
    if (searchQuery) {
      fetchAllDataForSearch(); //Fetch all data for search within the current tab.
    } else {
      fetchData(); //Fetch paginated data if no search query
    }
  }, [searchQuery]);

  // effect to handle click outside of the profile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (isProfileOpen && target && !target.closest('.relative')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  //Determine which data to display --added
  const displayData = searchQuery ? 
    filteredAllData.slice((page - 1) * limit, page * limit) : 
    activeTab === "talent" ? talent : enquiry;

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/login'); // Redirects to login page after log out
  };

  // Function to delete a record (works for both talent and enquiry)
  const handleDelete = async (record: any) => {
    const identifier = activeTab === "talent" ? record.email1 : record.email;
    const message = `Are you sure you want to delete this ${activeTab} record?`;
    
    if (!window.confirm(message)) return;

    try {
      const endpoint = `/api/admin/${activeTab}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [activeTab === "talent" ? "email1" : "email"]: identifier 
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDeleteSuccessMessage(data.message);
        // Update the correct state based on activeTab
        if (activeTab === "talent") {
          setTalent(talent.filter((t) => t.email1 !== identifier));
        } else {
          setEnquiry(enquiry.filter((e) => e.email !== identifier));
        }
        setTimeout(() => setDeleteSuccessMessage(null), 3000);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to delete record");
    }
  };

  // Open View Modal
  const openViewModal = (record: any) => {
    setSelectedUser(record);
    setIsViewModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (record: any) => {
    setEditedUser({ ...record });
    setIsEditModalOpen(true);
  };

  // Handle Edit Form Change
  const handleEditChange = (e: any) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  // Update Record (works for both talent and enquiry)
  const handleUpdate = async () => {
    try {
      const endpoint = `/api/admin/${activeTab}`;
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedUser,
          // For talent records, ensure we're sending all required fields
          ...(activeTab === "talent" && { 
            name: editedUser.name,
            email1: editedUser.email1,
            email2: editedUser.email2,
            contact: editedUser.contact,
            whatsapp: editedUser.whatsapp,
          })
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUpdateSuccessMessage(data.message);
        // Update the correct state based on activeTab
        if (activeTab === "talent") {
          setTalent(talent.map((t) => t.id === editedUser.id ? editedUser : t));
        } else {
          setEnquiry(enquiry.map((e) => e.id === editedUser.id ? editedUser : e));
        }
        setIsEditModalOpen(false);
        setTimeout(() => setUpdateSuccessMessage(null), 3000);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to update record");
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full text-gray-700 bg-white p-4 sm:p-6">
     
    {/* Header */}
    <header className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-b-lg shadow-sm sticky top-0 z-10">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image
          src="/logo.png"
          width={200}
          height={200}
          alt="Tek Juice"
          className="object-contain"
        />
      </div>

      {/* Right side controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
        {/* Table Selection */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="table-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Select Table:
          </label>
          <select
            id="table-select"
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value as "talent" | "enquiry");
              setPage(1);
              setSearchQuery("");
            }}
            className="block p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] text-sm"
          >
            <option value="talent">Talent</option>
            <option value="enquiry">Enquiry</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B] shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#F6931B]"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <svg
              className="h-6 w-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-orange-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Success Message */}
    {deleteSuccessMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">
        <span className="block sm:inline">{deleteSuccessMessage}</span>
      </div>
    )}
    {/*Update Success Message*/}
    {updateSuccessMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm">
        <span className="block sm:inline">{updateSuccessMessage}</span>
      </div>
    )}

    {/* Admin Data */}
    {adminData && (
      <div className="mb-4 text-sm sm:text-base">
        <p>Welcome back, {adminData.email}!</p>
      </div>
    )}

    {/* Loading State */}
    {loading ? (
      <div>
        Loading...
        <SkeletonLoader /> {/* Used skeleton to keep layout while fetching data and searches */}
      </div>
    ) : (
      <div className="border border-gray-300 rounded-lg overflow-auto mb-8">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base">Name</th>
              {activeTab === "enquiry" && (
                <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base">Company</th>
              )}
              <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base">
                {activeTab === "enquiry" ? "Email" : "Primary Email"}
              </th>
              <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base">Contact</th>
              {activeTab === "talent" && (
                <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base">WhatsApp</th>
              )}
              <th className="py-2 px-2 sm:px-4 text-left text-sm sm:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{record.name}</td>
                {activeTab === "enquiry" && (
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{record.company || "N/A"}</td>
                )}
                <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">
                  {activeTab === "enquiry" ? record.email : record.email1}
                </td>
                <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{record.contact || "N/A"}</td>
                {activeTab === "talent" && (
                  <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{record.whatsapp || "N/A"}</td>
                )}
                <td className="py-2 px-2 sm:px-4 text-sm sm:text-base">{renderActions(record)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-2 sm:p-4">
          <div className="mb-2 sm:mb-0">
            <span className="text-gray-700 text-sm sm:text-base">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm sm:text-base"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page * limit >= total}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )}

    {/* View Modal */}
    {isViewModalOpen && selectedUser && (
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-30 p-4 z-20">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 text-center 
               text-[#F6931B] bg-white py-2 px-4 rounded-t-lg`}>
            {activeTab === "enquiry" ? "Enquiry" : "Talent"} Details
          </h2>
          <div className="space-y-3">
            {/* Common Fields */}
            <div className="bg-gray-100 p-3 rounded-lg shadow">
              <p className="text-gray-700 text-sm sm:text-base">
                <strong>Name:</strong> {selectedUser.name}
              </p>
            </div>
            
            {activeTab === "enquiry" ? (
              <>
                {/* Enquiry Specific Fields */}
                <div className="bg-gray-100 p-3 rounded-lg shadow">
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>Company:</strong> {selectedUser.company || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg shadow">
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg shadow">
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>Location:</strong> {selectedUser.location || "N/A"}
                  </p>
                </div>
                {selectedUser.services && (
                  <div className="bg-gray-100 p-3 rounded-lg shadow">
                    <p className="text-gray-700 text-sm sm:text-base">
                      <strong>Services:</strong> {Array.isArray(selectedUser.services) ? selectedUser.services.join(", ") : selectedUser.services}
                    </p>
                  </div>
                )}
                {selectedUser.about_you && (
                  <div className="bg-gray-100 p-3 rounded-lg shadow">
                    <p className="text-gray-700 text-sm sm:text-base">
                      <strong>About You:</strong> {selectedUser.about_you}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Talent Specific Fields */}
                <div className="bg-gray-100 p-3 rounded-lg shadow">
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>Primary Email:</strong> {selectedUser.email1}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg shadow">
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>Secondary Email:</strong> {selectedUser.email2 || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg shadow">
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>Contact:</strong> {selectedUser.contact || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg shadow">
                  <p className="text-gray-700 text-sm sm:text-base">
                    <strong>WhatsApp:</strong> {selectedUser.whatsapp || "N/A"}
                  </p>
                </div>
                {selectedUser.skills && (
                  <div className="bg-gray-100 p-3 rounded-lg shadow">
                    <p className="text-gray-700 text-sm sm:text-base">
                      <strong>Skills:</strong> {Array.isArray(selectedUser.skills) ? selectedUser.skills.join(", ") : selectedUser.skills}
                    </p>
                  </div>
                )}
              </>
            )}
            
            {/* Common Additional Fields */}
            {selectedUser.preferred_contact && (
              <div className="bg-gray-100 p-3 rounded-lg shadow">
                <p className="text-gray-700 text-sm sm:text-base">
                  <strong>Preferred Contact:</strong> {Array.isArray(selectedUser.preferred_contact) ? selectedUser.preferred_contact.join(", ") : selectedUser.preferred_contact}
                </p>
              </div>
            )}
            {selectedUser.created_at && (
              <div className="bg-gray-100 p-3 rounded-lg shadow">
                <p className="text-gray-700 text-sm sm:text-base">
                  <strong>Created At:</strong> {new Date(selectedUser.created_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-6">
            <button
              className="
                bg-[#F6931B] text-white px-6 py-2 rounded-lg 
                hover:bg-white hover:text-[#F6931B] 
                hover:border hover:border-[#F6931B] 
                transition-colors duration-300 text-sm sm:text-base"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Modal */}
    {isEditModalOpen && editedUser && (
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className=
                {`text-xl sm:text-2xl font-bold mb-4 text-center 
                  text-[#F6931B] bg-white py-2 px-4 rounded-t-lg`}>Edit {activeTab === "enquiry" ? "Enquiry" : "Talent"}</h2>
            <label className="block text-black text-sm font-medium">
              Name
              <input
                name="name"
                value={editedUser.name}
                onChange={handleEditChange}
                className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]"
              />
            </label>
            
            {activeTab === "enquiry" ? (
              <>
                <label className="block text-black text-sm font-medium">
                  Company
                  <input
                    name="company"
                    value={editedUser.company}
                    onChange={handleEditChange}
                    className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]"
                  />
                </label>
                <label className="block text-black text-sm font-medium">
                  Email
                  <input
                    name="email"
                    value={editedUser.email}
                    onChange={handleEditChange}
                    className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block text-black text-sm font-medium">
                  Primary Email
                  <input
                    name="email1"
                    value={editedUser.email1}
                    onChange={handleEditChange}
                    className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]"
                  />
                </label>
                <label className="block text-black text-sm font-medium">
                  Secondary Email
                  <input
                    name="email2"
                    value={editedUser.email2}
                    onChange={handleEditChange}
                    className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]"
                  />
                </label>
                <label className="block text-black text-sm font-medium">
                  WhatsApp
                  <input
                    name="whatsapp"
                    value={editedUser.whatsapp}
                    onChange={handleEditChange}
                    className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]"
                  />
                </label>
              </>
            )}
            
            <label className="block text-black text-sm font-medium">
              Contact
              <input
                name="contact"
                value={editedUser.contact}
                onChange={handleEditChange}
                className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6931B] focus:border-[#F6931B]"
              />
            </label>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="
                bg-[#F6931B] text-white px-6 py-2 
                rounded-lg hover:bg-white hover:text-[#F6931B] 
                hover:border hover:border-[#F6931B] 
                transition-colors duration-300 text-sm sm:text-base"
              onClick={handleUpdate}
            >
              Save
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded text-sm sm:text-base"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
  );
};

export default Dashboard;