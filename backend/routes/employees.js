const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // PostgreSQL connection pool

// Get all employees
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*, 
        d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY e.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
});

// Get an employee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        e.*, 
        d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch employee' });
  }
});

// Create a new employee
router.post('/', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    hire_date,
    job_title,
    department_id,
    salary,
    address,
    city,
    state,
    postal_code,
    country,
    status = 'active'  // ADDED: status field with default
  } = req.body;

  console.log('🆕 CREATE EMPLOYEE - Request data:', { status, ...req.body });

  try {
    const result = await pool.query(
      `INSERT INTO employees 
      (first_name, last_name, email, phone, hire_date, job_title, 
       department_id, salary, address, city, state, postal_code, country, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [first_name, last_name, email, phone, hire_date, job_title, 
       department_id, salary, address, city, state, postal_code, country, status]
    );

    console.log('EMPLOYEE CREATED - Status:', result.rows[0].status);

    res.status(201).json({ success: true, data: result.rows[0] });
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

    if (error.code === '23514') { // Check constraint violation
      return res.status(400).json({
        success: false,
        error: 'Invalid status value. Must be: active, inactive, or on_leave'
      });
    }

    res.status(500).json({ success: false, error: 'Failed to create employee' });
  }
});

// Update an employee - COMPLETELY FIXED
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    hire_date,
    job_title,
    department_id,
    salary,
    address,
    city,
    state,
    postal_code,
    country,
    status  // CRITICAL: Added status field
  } = req.body;

  console.log('🔄 UPDATE REQUEST - Employee ID:', id);
  console.log('📦 Request body includes status:', { status });
  console.log('📋 Full request body:', req.body);

  try {
    // Check if employee exists first
    const employeeCheck = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [id]
    );

    if (employeeCheck.rows.length === 0) {
      console.log('Employee not found');
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    console.log('Current employee status:', employeeCheck.rows[0].status);

    const result = await pool.query(
      `UPDATE employees
       SET first_name=$1, last_name=$2, email=$3, phone=$4, hire_date=$5, 
           job_title=$6, department_id=$7, salary=$8, address=$9, city=$10, 
           state=$11, postal_code=$12, country=$13, status=$14, 
           updated_at=CURRENT_TIMESTAMP
       WHERE id=$15
       RETURNING *`,
      [
        first_name, last_name, email, phone, hire_date, job_title, 
        department_id, salary, address, city, state, postal_code, 
        country, status, id  // Now includes status parameter
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    console.log('UPDATE SUCCESSFUL - New status:', result.rows[0].status);
    console.log('Updated employee data:', result.rows[0]);

    res.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    
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

    if (error.code === '23514') { // Check constraint violation
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status value. Must be: active, inactive, or on_leave' 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to update employee',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ 
      success: true, 
      message: 'Employee deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, error: 'Failed to delete employee' });
  }
});

module.exports = router;