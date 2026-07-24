import { useState, useEffect, useCallback } from 'react';

const API_URL = "http://localhost/student_information_system/server/api";

const INITIAL_FORM_STATE = {
  id: '',
  student_number: '',
  first_name: '',
  last_name: '',
  email: '',
  course: '',
  year_level: '1st Year'
};

function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Success Modal Prompt
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '' });

  const [message, setMessage] = useState({ text: '', type: '' });

  // Error Banner Helper
  const showNotification = useCallback((text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  }, []);

  // Universal Centralized API Helper (Replaces duplicate fetch blocks)
  const sendRequest = async (endpoint, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (body) options.body = JSON.stringify(body);

      const response = await fetch(`${API_URL}/${endpoint}`, options);
      const data = await response.json();

      return { ok: response.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Unable to connect to the server. Please check your network or server status." } };
    }
  };

  // Fetch Function
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await sendRequest("read.php");

    if (ok) {
      setStudents(Array.isArray(data) ? data : []);
    } else {
      showNotification(data.message || "Failed to load students.");
    }
    setLoading(false);
  }, [showNotification]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validation Method
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/i;
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    const studentNumRegex = /^20\d{2}-\d{4}$/;

    const studentNumber = formData.student_number.trim();
    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();
    const email = formData.email.trim();

    // 1. Student Number Validation
    if (!studentNumber) {
      newErrors.student_number = "Student Number is required.";
    } else if (!studentNumRegex.test(studentNumber)) {
      newErrors.student_number = "Format must be YYYY-XXXX (e.g., 2026-0000).";
    } else if (students.some(s => s.student_number.toLowerCase() === studentNumber.toLowerCase() && String(s.id) !== String(formData.id))) {
      newErrors.student_number = "This Student Number is already registered.";
    }

    // 2. First Name Validation
    if (!firstName) {
      newErrors.first_name = "First Name is required.";
    } else if (!nameRegex.test(firstName)) {
      newErrors.first_name = "First Name must contain letters only.";
    }

    // 3. Last Name Validation
    if (!lastName) {
      newErrors.last_name = "Last Name is required.";
    } else if (!nameRegex.test(lastName)) {
      newErrors.last_name = "Last Name must contain letters only.";
    }

    // 4. Duplicate Full Name Check
    if (firstName && lastName && nameRegex.test(firstName) && nameRegex.test(lastName)) {
      const isDuplicateName = students.some(
        s => s.first_name.toLowerCase() === firstName.toLowerCase() &&
             s.last_name.toLowerCase() === lastName.toLowerCase() &&
             String(s.id) !== String(formData.id)
      );
      if (isDuplicateName) {
        newErrors.first_name = "A student with this full name already exists.";
        newErrors.last_name = "A student with this full name already exists.";
      }
    }

    // 5. Strict Email Validation
    if (!email) {
      newErrors.email = "Email Address is required.";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Email must be a valid .com address (e.g., user@gmail.com).";
    } else if (students.some(s => s.email.toLowerCase() === email.toLowerCase() && String(s.id) !== String(formData.id))) {
      newErrors.email = "This Email Address is already in use.";
    }

    // 6. Course Validation
    if (!formData.course.trim()) {
      newErrors.course = "Course is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const endpoint = isEditing ? "update.php" : "create.php";
    const method = isEditing ? "PUT" : "POST";
    const studentFullName = `${formData.first_name} ${formData.last_name}`;

    const { ok, data } = await sendRequest(endpoint, method, formData);

    if (ok) {
      setSuccessModalData({
        title: isEditing ? "Record Updated!" : "Student Added!",
        message: `Student ${formData.student_number} (${studentFullName}) ${isEditing ? 'updated' : 'added'} successfully.`
      });
      setShowSuccessModal(true);
      resetForm();
      fetchStudents();
    } else {
      showNotification(data.message || "Operation failed.");
    }

    setSubmitting(false);
  };

  const handleEditClick = (student) => {
    setIsEditing(true);
    setErrors({});
    setFormData({ ...student });
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    const { first_name, last_name, student_number, id } = studentToDelete;
    const { ok, data } = await sendRequest("delete.php", "DELETE", { id });

    if (ok) {
      setSuccessModalData({
        title: "Record Deleted!",
        message: `Student ${student_number} (${first_name} ${last_name}) deleted successfully.`
      });
      setShowSuccessModal(true);
      fetchStudents();
    } else {
      showNotification(data.message || "Failed to delete student.");
    }

    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setIsEditing(false);
  };

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.student_number?.toLowerCase().includes(term) ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(term) ||
      student.course?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white shadow-md py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">Student Information System</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {/* Responsive Error Notification Banner */}
        {message.text && (
          <div className="mb-6 p-4 rounded-lg shadow-sm font-medium bg-rose-100 text-rose-800 border border-rose-200 text-sm md:text-base break-words">
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Component */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 h-fit">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">
              {isEditing ? "📝 Edit Student Record" : "➕ Register Student"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Student Number</label>
                <input 
                  type="text" name="student_number" value={formData.student_number} onChange={handleInputChange}
                  placeholder="2026-0000"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.student_number ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-slate-400'
                  }`}
                />
                {errors.student_number && <p className="text-xs text-rose-600 mt-1">{errors.student_number}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">First Name</label>
                  <input 
                    type="text" name="first_name" value={formData.first_name} onChange={handleInputChange}
                    placeholder="First Name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.first_name ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-slate-400'
                    }`}
                  />
                  {errors.first_name && <p className="text-xs text-rose-600 mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name</label>
                  <input 
                    type="text" name="last_name" value={formData.last_name} onChange={handleInputChange}
                    placeholder="Last Name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.last_name ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-slate-400'
                    }`}
                  />
                  {errors.last_name && <p className="text-xs text-rose-600 mt-1">{errors.last_name}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="email@domain.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-slate-400'
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course</label>
                <input 
                  type="text" name="course" value={formData.course} onChange={handleInputChange}
                  placeholder="Course"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.course ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-slate-400'
                  }`}
                />
                {errors.course && <p className="text-xs text-rose-600 mt-1">{errors.course}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Year Level</label>
                <select 
                  name="year_level" value={formData.year_level} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="pt-4 flex gap-2">
                <button 
                  type="submit" disabled={submitting}
                  className="flex-1 py-2 px-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : isEditing ? "Update Record" : "Save Record"}
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

          {/* Directory Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-slate-800">📋 Student Records Directory</h2>
              <input 
                type="text" 
                placeholder="🔍 Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Student ID & Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Course & Year</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-slate-500 font-medium">
                        Loading directory records...
                      </td>
                    </tr>
                  ) : filteredStudents.length > 0 ? (
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
                        No student records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-800">{studentToDelete.first_name} {studentToDelete.last_name}</strong>?
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
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Success Modal Prompt */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-800">{successModalData.title}</h3>
            <p className="text-sm text-slate-600">
              {successModalData.message}
            </p>
            <div className="pt-2">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;