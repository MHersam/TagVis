var router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/graphs', require('./graphs'));
router.use('/documents', require('./documents'));
router.use('/sessions', require('./sessions'));
router.use('/groups', require('./groups'));
router.use('/users', require('./users'));

module.exports = router;