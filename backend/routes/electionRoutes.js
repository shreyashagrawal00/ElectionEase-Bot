const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const authMiddleware = require('../middleware/auth');

router.get('/history/:stateName', electionController.getStateHistory);
router.get('/', electionController.getElections);
router.get('/:id', electionController.getElectionById);
router.get('/research', electionController.getCandidateDetails);
router.post('/seed', electionController.seedElections); // Protected in real apps

module.exports = router;
