const pool = require('../config/database');

// Get all departments with employee counts and manager info
const getAllDepartments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.*,
        COUNT(e.id) as employee_count,
        m.first_name as manager_first_name,
        m.last_name as manager_last_name
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id 
      LEFT JOIN employees m ON d.manager_id = m.id
      GROUP BY d.id, m.first_name, m.last_name
      ORDER BY d.name
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        d.*,
        COUNT(e.id) as employee_count,
        m.first_name as manager_first_name,
        m.last_name as manager_last_name
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id 
      LEFT JOIN employees m ON d.manager_id = m.id
      WHERE d.id = $1
      GROUP BY d.id, m.first_name, m.last_name
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Department not found' 
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Create new department
const createDepartment = async (req, res) => {
  try {
    const { name, description, location, manager_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Department name is required'
      });
    }

    const result = await pool.query(
      `INSERT INTO departments (name, description, location, manager_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, description, location, manager_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Department created successfully'
    });
  } catch (error) {
    console.error('Error creating department:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false,
        error: 'Department name already exists' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, manager_id } = req.body;

    const result = await pool.query(
      `UPDATE departments 
       SET name = $1, description = $2, location = $3, manager_id = $4 
       WHERE id = $5 
       RETURNING *`,
      [name, description, location, manager_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Department not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Department updated successfully'
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has employees
    const employeeCheck = await pool.query(
      'SELECT COUNT(*) FROM employees WHERE department_id = $1',
      [id]
    );

    if (parseInt(employeeCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete department with assigned employees'
      });
    }

    const result = await pool.query(
      'DELETE FROM departments WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Department not found' 
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};