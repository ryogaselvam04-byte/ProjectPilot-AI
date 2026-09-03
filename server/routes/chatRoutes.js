const express = require('express');
const { getHistory, sendMessage, clearHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/history', getHistory);
router.post('/', sendMessage);
router.delete('/history', clearHistory);

module.exports = router;
