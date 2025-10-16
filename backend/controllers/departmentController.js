const pool = require('../config/database');

const getAllDepartments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, 
             COUNT(e.id) as employee_count
      FROM departments d 
      LEFT JOIN employees e ON d.id = e.department_id 
      GROUP BY d.id
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

module.exports = {
  getAllDepartments
};