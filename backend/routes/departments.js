const express = require('express');
const router = express.Router();

console.log('Loading department routes...');

// Try to import with debugging
try {
  const controller = require('../controllers/departmentController');
  
  console.log('Department controller imported:', {
    getAllDepartments: typeof controller.getAllDepartments,
    getDepartmentById: typeof controller.getDepartmentById,
    createDepartment: typeof controller.createDepartment,
    updateDepartment: typeof controller.updateDepartment,
    deleteDepartment: typeof controller.deleteDepartment
  });

  // Use the functions
  router.get('/', controller.getAllDepartments);
  router.get('/:id', controller.getDepartmentById);
  router.post('/', controller.createDepartment);
  router.put('/:id', controller.updateDepartment);
  router.delete('/:id', controller.deleteDepartment);

} catch (error) {
  console.error('Error importing department controller:', error);
  
  // Fallback routes
  router.get('/', (req, res) => {
    res.json({ message: 'Departments route - fallback' });
  });
}

module.exports = router;