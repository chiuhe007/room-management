const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');
const roomController = require('../controllers/roomController');


router.get('/', checkinController.getCheckins);
router.post('/', checkinController.createCheckin);
router.delete('/:id', checkinController.deleteCheckin);

router.post('/:id/checkout', checkinController.checkoutCheckin);
module.exports = router;

