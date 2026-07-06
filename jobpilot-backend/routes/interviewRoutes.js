const express = require('express');
const {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  updateInterviewStatus,
  addFeedback,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');
const {
  createInterviewValidator,
  updateInterviewValidator,
  updateInterviewStatusValidator,
  addFeedbackValidator,
  mongoIdValidator,
} = require('../validators/interviewValidator');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .post(createInterviewValidator, createInterview)
  .get(getInterviews);

router.route('/:id')
  .get(mongoIdValidator, getInterviewById)
  .put(updateInterviewValidator, updateInterview)
  .delete(mongoIdValidator, deleteInterview);

router.patch('/:id/status', updateInterviewStatusValidator, updateInterviewStatus);
router.patch('/:id/feedback', addFeedbackValidator, addFeedback);

module.exports = router;