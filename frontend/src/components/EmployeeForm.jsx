import React, { useState, useEffect } from 'react';
import { employeeAPI, departmentAPI } from '../services/api';

// Reusable FormField component to reduce duplication
const FormField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  type = 'text', 
  required = false, 
  placeholder = '',
  children,
  ...props 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && '*'}
    </label>
    {children || (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const EmployeeForm = ({ employee, onSave, onCancel, isEdit = false }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        hire_date: '',
        job_title: '',
        department_id: '',
        salary: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        status: 'active'
    });

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    // Separate effects for better organization
    useEffect(() => {
        fetchDepartments();
    }, []);

    // Enhanced employee data loading with better debugging
    useEffect(() => {
        console.log('🔄 EmployeeForm effect running:', { isEdit, employeeExists: !!employee });
        
        if (isEdit && employee) {
            console.log('📋 Employee data received for editing:', {
                employeeStatus: employee.status,
                fullEmployee: employee
            });

            const newFormData = {
                first_name: employee.first_name || '',
                last_name: employee.last_name || '',
                email: employee.email || '',
                phone: employee.phone || '',
                hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
                job_title: employee.job_title || '',
                department_id: employee.department_id?.toString() || '',
                salary: employee.salary?.toString() || '',
                address: employee.address || '',
                city: employee.city || '',
                state: employee.state || '',
                postal_code: employee.postal_code || '',
                country: employee.country || '',
                status: employee.status || 'active' // CRITICAL: Use employee.status directly
            };

            console.log('🎯 Setting form data with status:', newFormData.status);
            setFormData(newFormData);
        }
    }, [employee, isEdit]);

    // Reset form when switching from edit to add mode
    useEffect(() => {
        if (!isEdit) {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                hire_date: '',
                job_title: '',
                department_id: '',
                salary: '',
                address: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
                status: 'active'
            });
            setErrors({});
        }
    }, [isEdit]);

    // ESC key handler for better UX
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.keyCode === 27) { // ESC key
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onCancel]);

    // Debug formData changes specifically for status
    useEffect(() => {
        console.log('📝 FormData status updated:', formData.status);
    }, [formData.status]);

    const fetchDepartments = async () => {
        try {
            const response = await departmentAPI.getAll();
            setDepartments(response.data.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Enhanced debugging for status changes
        if (name === 'status') {
            console.log('🔄 Status changing:', {
                from: formData.status,
                to: value
            });
        }

        // Special handling for number fields
        let processedValue = value;
        if (name === 'salary') {
            processedValue = value === '' ? '' : parseFloat(value) || 0;
        } else if (name === 'department_id') {
            processedValue = value === '' ? '' : parseInt(value) || null;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.email?.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.hire_date) newErrors.hire_date = 'Hire date is required';
        if (!formData.job_title?.trim()) newErrors.job_title = 'Job title is required';
        if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Valid salary is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('🚀 Form submission starting with status:', formData.status);

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Prepare ALL fields for API - don't skip any
            const submitData = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                phone: formData.phone?.trim() || null,
                hire_date: formData.hire_date,
                job_title: formData.job_title.trim(),
                department_id: formData.department_id ? parseInt(formData.department_id) : null,
                salary: parseFloat(formData.salary) || 0,
                address: formData.address?.trim() || null,
                city: formData.city?.trim() || null,
                state: formData.state?.trim() || null,
                postal_code: formData.postal_code?.trim() || null,
                country: formData.country?.trim() || null,
                status: formData.status // This is crucial
            };

            console.log('📤 Sending data to API:', {
                status: submitData.status,
                fullData: submitData
            });

            let response;
            if (isEdit) {
                response = await employeeAPI.update(employee.id, submitData);
                console.log('✅ Update response:', response.data);
            } else {
                response = await employeeAPI.create(submitData);
                console.log('✅ Create response:', response.data);
            }

            // Show success feedback
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSave();
            }, 1500);

        } catch (error) {
            console.error('❌ Error saving employee:', error);
            
            // Enhanced error logging
            if (error.response) {
                console.error('📊 Server response details:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save employee';
            alert(`Error: ${errorMessage}`);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-labelledby="employee-form-title"
        >
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 id="employee-form-title" className="text-xl font-semibold">
                        {isEdit ? `Edit Employee: ${employee?.first_name} ${employee?.last_name}` : 'Add New Employee'}
                    </h2>
                    {isEdit && (
                        <p className="text-sm text-gray-600 mt-1">
                            Original Status: <span className="font-medium capitalize">{employee?.status || 'active'}</span>
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                            ✅ Employee {isEdit ? 'updated' : 'added'} successfully!
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Field - Enhanced with better visibility */}
                        <div className="md:col-span-2">
                            <FormField
                                label="Employment Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">🟢 Active</option>
                                    <option value="inactive">🔴 Inactive</option>
                                    <option value="on_leave">🟡 On Leave</option>
                                </select>
                            </FormField>
                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                                <div>Currently selected: <strong className="capitalize">{formData.status}</strong></div>
                                {isEdit && employee && (
                                    <div>Original status: <strong className="capitalize">{employee.status}</strong></div>
                                )}
                            </div>
                        </div>

                        {/* First Name */}
                        <FormField
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            error={errors.first_name}
                            required
                            placeholder="Enter first name"
                        />

                        {/* Last Name */}
                        <FormField
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            error={errors.last_name}
                            required
                            placeholder="Enter last name"
                        />

                        {/* Email */}
                        <div className="md:col-span-2">
                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                required
                                placeholder="Enter email address"
                            />
                        </div>

                        {/* Phone */}
                        <FormField
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                        />

                        {/* Hire Date */}
                        <FormField
                            label="Hire Date"
                            name="hire_date"
                            type="date"
                            value={formData.hire_date}
                            onChange={handleChange}
                            error={errors.hire_date}
                            required
                        />

                        {/* Job Title */}
                        <FormField
                            label="Job Title"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleChange}
                            error={errors.job_title}
                            required
                            placeholder="Enter job title"
                        />

                        {/* Department */}
                        <FormField
                            label="Department"
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleChange}
                            error={errors.department_id}
                            required
                        >
                            <select
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.department_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* Salary */}
                        <FormField
                            label="Salary"
                            name="salary"
                            type="number"
                            value={formData.salary}
                            onChange={handleChange}
                            error={errors.salary}
                            required
                            placeholder="Enter salary"
                            min="0"
                            step="0.01"
                        />

                        {/* Address */}
                        <div className="md:col-span-2">
                            <FormField
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter street address"
                            />
                        </div>

                        {/* City */}
                        <FormField
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                        />

                        {/* State */}
                        <FormField
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                        />

                        {/* Postal Code */}
                        <FormField
                            label="Postal Code"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            placeholder="Enter postal code"
                        />

                        {/* Country */}
                        <FormField
                            label="Country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Enter country"
                        />
                    </div>

                    {/* Enhanced Debug Panel */}
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <strong>🔧 Debug Information - STATUS TRACKING:</strong>
                        <div className="mt-1 space-y-1">
                            <div><strong>Form Status:</strong> <code className="bg-yellow-100 px-1">"{formData.status}"</code></div>
                            <div><strong>Employee Prop Status:</strong> <code>"{employee?.status}"</code></div>
                            <div><strong>Is Edit Mode:</strong> <code>{isEdit.toString()}</code></div>
                            <div><strong>Department ID:</strong> <code>"{formData.department_id}"</code></div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Add Employee')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;