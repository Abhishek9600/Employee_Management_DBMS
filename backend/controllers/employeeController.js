const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*, 
        d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY e.id DESC
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        e.*, 
        d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      first_name, last_name, email, phone, hire_date,
      job_title, department_id, salary, address, city, state, postal_code, country
    } = req.body;

    const result = await pool.query(
      `INSERT INTO employees 
       (first_name, last_name, email, phone, hire_date, job_title, 
        department_id, salary, address, city, state, postal_code, country) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [first_name, last_name, email, phone, hire_date, job_title,
        department_id, salary, address, city, state, postal_code, country]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Error creating employee:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        error: 'Invalid department selected'
      });
    }

    if (error.code === '23502') { // Not null violation
      return res.status(400).json({
        success: false,
        error: 'Required fields are missing'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update employee - robust version
// Update employee - FIXED version
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('📝 Update request for employee ID:', id);
    console.log('📦 Update data received:', updates);

    // Check if employee exists first
    const employeeCheck = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [id]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    // Allowed fields for update
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'hire_date',
      'job_title', 'department_id', 'salary', 'address', 'city',
      'state', 'postal_code', 'country', 'status'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Build SET clause and values
    allowedFields.forEach(field => {
      if (updates[field] !== undefined && updates[field] !== null) {
        updateFields.push(`${field} = $${paramCount}`);
        
        if (field === 'salary') {
          values.push(parseFloat(updates[field]));
        } else if (field === 'department_id') {
          values.push(updates[field] ? parseInt(updates[field]) : null);
        } else {
          values.push(updates[field]);
        }
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    // Add the ID as the last parameter (paramCount is now correct)
    values.push(parseInt(id));

    const query = `
      UPDATE employees
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    console.log('🔧 Executing query:', query);
    console.log('📊 Query values:', values);
    console.log('🎯 Parameter count for ID:', paramCount);

    const result = await pool.query(query, values);

    console.log('✅ Update successful:', result.rows[0]);
    console.log('🔍 STATUS AFTER UPDATE:', result.rows[0].status);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating employee:', error);

    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        error: 'Invalid department ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
