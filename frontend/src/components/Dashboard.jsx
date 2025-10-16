import React, { useState, useEffect, useCallback } from 'react';
import { employeeAPI, departmentAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    activeEmployees: 0,
    totalSalary: 0,
    recentHires: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeesRes, departmentsRes] = await Promise.all([
        employeeAPI.getAll(),
        departmentAPI.getAll()
      ]);

      const employees = employeesRes.data.data;
      const departments = departmentsRes.data.data;
      
      // Calculate statistics
      const totalSalary = employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);
      const activeEmployees = employees.filter(emp => emp.status === 'active').length;
      
      // Get recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHires = employees.filter(emp => new Date(emp.hire_date) > thirtyDaysAgo).length;
      
      // Get 5 most recent employees
      const sortedEmployees = [...employees]
        .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
        .slice(0, 5);

      // Process department data
      const deptStats = departments.map(dept => {
        const deptEmployees = employees.filter(emp => emp.department_id === dept.id);
        const deptSalary = deptEmployees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);
        
        return {
          id: dept.id,
          name: dept.name,
          employeeCount: deptEmployees.length,
          totalSalary: deptSalary,
          color: getDepartmentColor(dept.name)
        };
      });

      setStats({
        totalEmployees: employees.length,
        totalDepartments: departments.length,
        activeEmployees,
        totalSalary,
        recentHires
      });
      
      setRecentEmployees(sortedEmployees);
      setDepartmentData(deptStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getDepartmentColor = (deptName) => {
    const colors = {
      'IT': '#3B82F6',
      'HR': '#10B981',
      'Finance': '#8B5CF6',
      'Marketing': '#F59E0B',
      'Sales': '#EF4444',
      'Operations': '#6B7280'
    };
    return colors[deptName] || '#6B7280';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddEmployee = () => {
    navigate('/employees/new');
  };

  const handleManageEmployees = () => {
    navigate('/employees');
  };

  const handleGenerateReport = () => {
    alert('Report generation coming soon!');
  };

  const handleMarkAttendance = () => {
    alert('Attendance system coming soon!');
  };

  const StatCard = ({ title, value, subtitle, icon, trend, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center mt-2 text-sm ${
              trend.value > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.value > 0 ? '↗' : '↘'}</span>
              <span className="ml-1">{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const DepartmentProgress = ({ department }) => {
    const percentage = (department.employeeCount / stats.totalEmployees) * 100;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{department.name}</span>
          <span className="text-gray-600">{department.employeeCount} employees</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: department.color
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatCurrency(department.totalSalary)}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome to your employee management system</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleManageEmployees}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Manage Employees
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            subtitle="Across all departments"
            icon="👥"
            trend={{ value: 12, label: "from last month" }}
            color="text-blue-600"
          />
          <StatCard
            title="Active Employees"
            value={stats.activeEmployees}
            subtitle={`${Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}% of total`}
            icon="✅"
            color="text-green-600"
          />
          <StatCard
            title="Monthly Salary"
            value={formatCurrency(stats.totalSalary)}
            subtitle="Total payroll"
            icon="💰"
            trend={{ value: 8, label: "increase" }}
            color="text-orange-600"
          />
          <StatCard
            title="Recent Hires"
            value={stats.recentHires}
            subtitle="Last 30 days"
            icon="🆕"
            color="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Department Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Department Overview</h2>
                <span className="text-sm text-gray-500">{stats.totalDepartments} departments</span>
              </div>
              <div className="space-y-4">
                {departmentData.map(dept => (
                  <DepartmentProgress key={dept.id} department={dept} />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Hires</h2>
              <div className="space-y-4">
                {recentEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {employee.first_name[0]}{employee.last_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{employee.job_title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Hired {new Date(employee.hire_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(employee.salary)}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {employee.department_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={handleAddEmployee}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <span className="text-blue-600">➕</span>
                    </div>
                    <div className="ml-3 text-left">
                      <p className="font-medium text-gray-900">Add Employee</p>
                      <p className="text-sm text-gray-500">Create new employee record</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-blue-600">→</span>
                </button>

                <button 
                  onClick={handleGenerateReport}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <span className="text-green-600">📊</span>
                    </div>
                    <div className="ml-3 text-left">
                      <p className="font-medium text-gray-900">Generate Report</p>
                      <p className="text-sm text-gray-500">Export employee data</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-green-600">→</span>
                </button>

                <button 
                  onClick={handleMarkAttendance}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <span className="text-purple-600">⏰</span>
                    </div>
                    <div className="ml-3 text-left">
                      <p className="font-medium text-gray-900">Mark Attendance</p>
                      <p className="text-sm text-gray-500">Record daily attendance</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-purple-600">→</span>
                </button>
              </div>
            </div>

            {/* Salary Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Salary Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Salary</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(stats.totalEmployees > 0 ? stats.totalSalary / stats.totalEmployees : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Highest Paid Dept</span>
                  <span className="font-semibold text-gray-900">
                    {departmentData.length > 0 ? departmentData.reduce((max, dept) => 
                      dept.employeeCount > 0 && (dept.totalSalary / dept.employeeCount) > (max.avg || 0) ? 
                      { name: dept.name, avg: dept.totalSalary / dept.employeeCount } : max, 
                      { name: 'N/A', avg: 0 }
                    ).name : 'N/A'}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Payroll Budget</span>
                    <span className="text-gray-900">85% used</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;