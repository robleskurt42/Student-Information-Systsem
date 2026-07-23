import { useState, useEffect } from 'react';

function App() {
  // State variables
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    student_number: '',
    first_name: '',
    last_name: '',
    email: '',
    course: '',
    year_level: '1st Year'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Base URL ng PHP Backend mo sa XAMPP
  const API_URL = "http://localhost/student_information_system/server/api";

  // Load students kapag nag-open ang page
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch function (READ)
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/read.php`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      showNotification("Cannot connect to the backend server.", "error");
    }
  };

  // Notification helper
  const showNotification = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Form Submission (CREATE and UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation (Hiningi rin sa PDF ninyo!)
    if (
      !formData.student_number ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.course
    ) {
      showNotification("Please fill in all the required fields.", "error");
      return;
    }

    const endpoint = isEditing ? "update.php" : "create.php";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (response.ok) {
        showNotification(resData.message, "success");
        resetForm();
        fetchStudents();
      } else {
        showNotification(resData.message || "An error occurred.", "error");
      }
    } catch (error) {
      showNotification("Failed to send request to the server.", "error");
    }
  };

  // Set student details to Form for Editing (UPDATE)
  const handleEditClick = (student) => {
    setIsEditing(true);
    setFormData({
      id: student.id,
      student_number: student.student_number,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      course: student.course,
      year_level: student.year_level
    });
  };

  // Show Confirmation Prompt (DELETE requirement)
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Actual Delete Execution
  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      const response = await fetch(`${API_URL}/delete.php`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: studentToDelete.id,
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        showNotification("Student was successfully deleted.", "success");
        fetchStudents();
      } else {
        showNotification(resData.message, "error");
      }
    } catch (error) {
      showNotification("Failed to delete the record.", "error");
    } finally {
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  // Reset form to default
  const resetForm = () => {
    setFormData({
      id: '',
      student_number: '',
      first_name: '',
      last_name: '',
      email: '',
      course: '',
      year_level: '1st Year'
    });
    setIsEditing(false);
  };

  // Client-side Search Logic
  const filteredStudents = (students && Array.isArray(students) ? students : []).filter((student) =>
    student.student_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${student.first_name} ${student.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    student.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation Header */}
      <header className="bg-slate-800 text-white shadow-md py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">Student Information System</h1>
          <span className="bg-slate-700 px-3 py-1 rounded text-xs text-slate-300">Prelim Project</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {/* Alerts / Notifications */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg shadow-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form (CREATE & UPDATE Section) */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
              {isEditing ? "📝 Edit Student Record" : "➕ Add New Student"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Student Number</label>
                <input 
                  type="text" name="student_number" value={formData.student_number} onChange={handleInputChange}
                  placeholder="Enter ID" required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                  <input 
                    type="text" name="first_name" value={formData.first_name} onChange={handleInputChange}
                    placeholder="First Name" required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                  <input 
                    type="text" name="last_name" value={formData.last_name} onChange={handleInputChange}
                    placeholder="Last Name" required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="name@example.com" required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course</label>
                <input 
                  type="text" name="course" value={formData.course} onChange={handleInputChange}
                  placeholder="Enter Course" required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Year Level</label>
                <select 
                  name="year_level" value={formData.year_level} onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="pt-4 flex gap-2">
                <button 
                  type="submit" 
                  className="flex-1 py-2 px-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition"
                >
                  {isEditing ? "Update Student" : "Register Student"}
                </button>
                {isEditing && (
                  <button 
                    type="button" onClick={resetForm}
                    className="py-2 px-4 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Area (READ & SEARCH Section) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-100">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">📋 Student Directory</h2>
              <input 
                type="text" 
                placeholder="🔍 Search name, course or student id..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
              />
            </div>

            {/* Organized Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Student ID / Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Course & Year</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <span className="block font-bold text-slate-800">{student.student_number}</span>
                          <span className="text-xs text-slate-500">{student.first_name} {student.last_name}</span>
                        </td>
                        <td className="px-4 py-3 align-middle">{student.email}</td>
                        <td className="px-4 py-3 align-middle">
                          <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold mr-1">{student.course}</span>
                          <span className="text-xs">{student.year_level}</span>
                        </td>
                        <td className="px-4 py-3 text-right align-middle space-x-1">
                          <button 
                            onClick={() => handleEditClick(student)}
                            className="px-3 py-1 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-md font-semibold text-xs transition"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(student)}
                            className="px-3 py-1 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-md font-semibold text-xs transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-400">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Confirmation Modal (DELETE Prompt Requirement) */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Are you sure?</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-800">{studentToDelete.first_name} {studentToDelete.last_name}</strong> ({studentToDelete.student_number})? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => { setShowDeleteModal(false); setStudentToDelete(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;