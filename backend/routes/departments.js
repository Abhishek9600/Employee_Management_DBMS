const express = require('express');
const router = express.Router();
const { getAllDepartments } = require('../controllers/departmentController');

router.get('/', getAllDepartments);

module.exports = router;