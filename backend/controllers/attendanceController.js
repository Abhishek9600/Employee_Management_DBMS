const pool = require('../config/database');

// Get all attendance records with filters
const getAllAttendance = async (req, res) => {
  try {
    const { date, employee_id, department_id } = req.query;
    
    let query = `
      SELECT 
        a.*,
        e.first_name,
        e.last_name,
        e.email,
        d.name as department_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (date) {
      paramCount++;
      query += ` AND a.date = $${paramCount}`;
      params.push(date);
    }

    if (employee_id) {
      paramCount++;
      query += ` AND a.employee_id = $${paramCount}`;
      params.push(employee_id);
    }

    if (department_id) {
      paramCount++;
      query += ` AND e.department_id = $${paramCount}`;
      params.push(department_id);
    }

    query += ` ORDER BY a.date DESC, e.first_name, e.last_name`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Mark attendance for an employee
const markAttendance = async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status, notes } = req.body;

    if (!employee_id || !date) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID and date are required'
      });
    }

    // Calculate hours worked if both check_in and check_out are provided
    let hours_worked = null;
    if (check_in && check_out) {
      const checkInTime = new Date(`1970-01-01T${check_in}Z`);
      const checkOutTime = new Date(`1970-01-01T${check_out}Z`);
      hours_worked = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
      hours_worked = Math.round(hours_worked * 100) / 100; // Round to 2 decimal places
    }

    const result = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, hours_worked, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (employee_id, date) 
       DO UPDATE SET 
         check_in = EXCLUDED.check_in,
         check_out = EXCLUDED.check_out,
         hours_worked = EXCLUDED.hours_worked,
         status = EXCLUDED.status,
         notes = EXCLUDED.notes
       RETURNING *`,
      [employee_id, date, check_in, check_out, hours_worked, status, notes]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Get attendance summary for a date range
const getAttendanceSummary = async (req, res) => {
  try {
    const { start_date, end_date, department_id } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    let query = `
      SELECT 
        e.id as employee_id,
        e.first_name,
        e.last_name,
        d.name as department_name,
        COUNT(a.id) as total_days,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN a.status = 'half_day' THEN 1 END) as half_days,
        COUNT(CASE WHEN a.status = 'leave' THEN 1 END) as leave_days,
        COALESCE(SUM(a.hours_worked), 0) as total_hours
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date BETWEEN $1 AND $2
      WHERE e.is_active = true
    `;

    const params = [start_date, end_date];
    let paramCount = 2;

    if (department_id) {
      paramCount++;
      query += ` AND e.department_id = $${paramCount}`;
      params.push(department_id);
    }

    query += ` GROUP BY e.id, e.first_name, e.last_name, d.name 
               ORDER BY d.name, e.first_name, e.last_name`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      summary: {
        total_employees: result.rows.length,
        total_present_days: result.rows.reduce((sum, row) => sum + parseInt(row.present_days), 0),
        total_absent_days: result.rows.reduce((sum, row) => sum + parseInt(row.absent_days), 0),
        total_hours: result.rows.reduce((sum, row) => sum + parseFloat(row.total_hours), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Get employee attendance for a specific period
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        a.*,
        e.first_name,
        e.last_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.employee_id = $1
    `;

    const params = [employee_id];
    let paramCount = 1;

    if (start_date && end_date) {
      paramCount++;
      query += ` AND a.date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY a.date DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  getAllAttendance,
  markAttendance,
  getAttendanceSummary,
  getEmployeeAttendance
};