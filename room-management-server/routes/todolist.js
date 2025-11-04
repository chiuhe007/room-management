const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const controller = require('../controllers/todolistController');

router.use(verifyToken);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.get('/user', controller.getUserInfo);
module.exports = router;
