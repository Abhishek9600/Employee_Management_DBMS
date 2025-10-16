import React, { useState, useEffect } from 'react';
import { testAPI, testDB, employeeAPI } from '../services/api';

const DebugPanel = () => {
  const [apiStatus, setApiStatus] = useState('unknown');
  const [dbStatus, setDbStatus] = useState('unknown');
  const [testEmployee, setTestEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const checkConnections = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Test API connection
      await testAPI();
      setApiStatus('connected');
    } catch (error) {
      console.error('API connection error:', error);
      setApiStatus('disconnected');
      setErrorMessage(`API error: ${error.message}`);
    }

    try {
      // Test database connection
      await testDB();
      setDbStatus('connected');
    } catch (error) {
      console.error('Database connection error:', error);
      setDbStatus('disconnected');
      setErrorMessage(`Database error: ${error.message}`);
    }

    setLoading(false);
  };

  const createTestEmployee = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const testEmployeeData = {
        first_name: 'Test',
        last_name: 'User',
        email: `test${Date.now()}@company.com`,
        phone: '123-456-7890',
        hire_date: new Date().toISOString().split('T')[0],
        job_title: 'Test Engineer',
        department_id: 2,
        salary: 50000,
        address: 'Test Address',
        city: 'Test City',
        state: 'TS',
        postal_code: '12345',
        country: 'Test Country',
      };

      const response = await employeeAPI.create(testEmployeeData);
      setTestEmployee(response.data.data);
      alert('Test employee created successfully!');
    } catch (error) {
      console.error('Create test employee error:', error);
      setErrorMessage(`Failed to create test employee: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnections();
  }, []);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-3">Debug Panel</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div
          className={`p-3 rounded-lg ${
            apiStatus === 'connected'
              ? 'bg-green-100 text-green-800'
              : apiStatus === 'disconnected'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <strong>API Status:</strong>{' '}
          {apiStatus === 'connected'
            ? 'Connected'
            : apiStatus === 'disconnected'
            ? 'Disconnected'
            : '⏳ Checking...'}
        </div>

        <div
          className={`p-3 rounded-lg ${
            dbStatus === 'connected'
              ? 'bg-green-100 text-green-800'
              : dbStatus === 'disconnected'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          <strong>Database Status:</strong>{' '}
          {dbStatus === 'connected'
            ? 'Connected'
            : dbStatus === 'disconnected'
            ? 'Disconnected'
            : '⏳ Checking...'}
        </div>

        <div className="p-3 rounded-lg bg-blue-100 text-blue-800">
          <strong>Frontend:</strong> Running
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={checkConnections}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Connections'}
        </button>

        <button
          onClick={createTestEmployee}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Create Test Employee
        </button>

        <button
          onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Open API Health
        </button>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {testEmployee && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <strong>Test Employee Created:</strong> {testEmployee.first_name}{' '}
          {testEmployee.last_name} (ID: {testEmployee.id})
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
