var router = require('express').Router();

router.use('/new', require('./new'));
router.use('/update', require('./update'));
router.use('/changePassword', require('./changePassword'));
router.use('/photo', require('./photo'));
router.use('/recommendations', require('./recommendations'));

module.exports = router;