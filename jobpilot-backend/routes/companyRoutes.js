const express = require('express');
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addRecruiter,
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');
const {
  createCompanyValidator,
  updateCompanyValidator,
  mongoIdValidator,
} = require('../validators/companyValidator');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .post(createCompanyValidator, createCompany)
  .get(getCompanies);

router.route('/:id')
  .get(mongoIdValidator, getCompanyById)
  .put(updateCompanyValidator, updateCompany)
  .delete(mongoIdValidator, deleteCompany);

router.post('/:id/recruiters', mongoIdValidator, addRecruiter);

module.exports = router;