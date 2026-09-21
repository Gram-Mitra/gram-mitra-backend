const express = require('express');
const { reportProblem, getProblems } = require('../controllers/problem.controller');

const router = express.Router();

router.post('/', reportProblem);
router.get('/', getProblems);

module.exports = router;
