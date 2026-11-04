const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createTransaction,
  getMyTransactions,
  updateTransactionStatus,
} = require('../controllers/transactionController');

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/', protect, getMyTransactions);
router.patch('/:id', protect, updateTransactionStatus);

module.exports = router;

