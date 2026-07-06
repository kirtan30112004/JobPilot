const express = require('express');
const {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  toggleComplete,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');
const {
  createReminderValidator,
  updateReminderValidator,
  mongoIdValidator,
} = require('../validators/reminderValidator');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .post(createReminderValidator, createReminder)
  .get(getReminders);

router.route('/:id')
  .get(mongoIdValidator, getReminderById)
  .put(updateReminderValidator, updateReminder)
  .delete(mongoIdValidator, deleteReminder);

router.patch('/:id/complete', mongoIdValidator, toggleComplete);

module.exports = router;