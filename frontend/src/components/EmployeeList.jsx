import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI, departmentAPI } from '../services/api';
import EmployeeForm from './EmployeeForm';
import DebugPanel from './DebugPanel';
import SearchFilter from './SearchFilter';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Memoized filter function to avoid dependency issues
  const filterEmployees = useCallback(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.job_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (filterDepartment) {
      filtered = filtered.filter(employee => 
        employee.department_id === parseInt(filterDepartment)
      );
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(employee => 
        employee.status === filterStatus
      );
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, filterDepartment, filterStatus]);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      const errorMessage = error.userMessage || error.message || 'Failed to load employees. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees, fetchDepartments]);

  // Filter employees when dependencies change
  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'department') {
      setFilterDepartment(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await employeeAPI.delete(id);
      await fetchEmployees();
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      const errorMessage = error.userMessage || error.message || 'Failed to delete employee. Please try again.';
      alert(`Delete failed: ${errorMessage}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const refreshList = () => {
    fetchEmployees();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterStatus('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Debug Panel */}
      <DebugPanel />
      
      {/* Header with Add Button */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Employee List</h2>
          <p className="text-sm text-gray-600">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={refreshList}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={handleAddEmployee}
            disabled={actionLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center disabled:opacity-50"
          >
            <span className="mr-2">➕</span>
            Add Employee
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b">
        <SearchFilter 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filterDepartment={filterDepartment}
          onFilterChange={handleFilterChange}
          departments={departments}
        />
        
        {(searchTerm || filterDepartment || filterStatus) && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">
              Filters active: 
              {searchTerm && ` Search: "${searchTerm}"`}
              {filterDepartment && ` Department: ${departments.find(d => d.id == filterDepartment)?.name}`}
              {filterStatus && ` Status: ${filterStatus}`}
            </span>
            <button 
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchEmployees}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Overlay for Actions */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Processing...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Employees Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {employee.first_name[0]}{employee.last_name[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {employee.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee.email}</div>
                  <div className="text-sm text-gray-500">{employee.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee.job_title}</div>
                  <div className="text-sm text-gray-500">
                    Hired: {new Date(employee.hire_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {employee.department_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${employee.salary?.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : employee.status === 'on_leave'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status?.replace('_', ' ') || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEditEmployee(employee)}
                    disabled={actionLoading}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id, `${employee.first_name} ${employee.last_name}`)}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty State */}
      {filteredEmployees.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          {employees.length === 0 
            ? "No employees found. Add your first employee to get started."
            : "No employees match your search criteria."
          }
        </div>
      )}

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          isEdit={!!editingEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeList;