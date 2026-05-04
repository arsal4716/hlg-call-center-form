const express = require('express');
const router = express.Router();
const { createLead, getLeads } = require('../controllers/leadController');

router.route('/')
  .post(createLead)
  .get(getLeads);

module.exports = router;