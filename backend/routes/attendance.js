const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  markAttendance,
  getAttendanceSummary,
  getEmployeeAttendance
} = require('../controllers/attendanceController');

router.get('/', getAllAttendance);
router.post('/mark', markAttendance);
router.get('/summary', getAttendanceSummary);
router.get('/employee/:employee_id', getEmployeeAttendance);

module.exports = router;