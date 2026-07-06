const express = require('express');
const {
  createJob,
  getJobs,
  getJobStats,
  getJobById,
  updateJob,
  updateJobStatus,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const {
  createJobValidator,
  updateJobValidator,
  updateJobStatusValidator,
  getJobsQueryValidator,
  mongoIdValidator,
} = require('../validators/jobValidator');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Stats route must come before /:id to avoid route collision
router.get('/stats', getJobStats);

router.route('/')
  .post(createJobValidator, createJob)
  .get(getJobsQueryValidator, getJobs);

router.route('/:id')
  .get(mongoIdValidator, getJobById)
  .put(updateJobValidator, updateJob)
  .delete(mongoIdValidator, deleteJob);

router.patch('/:id/status', updateJobStatusValidator, updateJobStatus);

module.exports = router;