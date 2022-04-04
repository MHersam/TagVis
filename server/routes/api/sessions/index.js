var router = require('express').Router();

router.use('/new', require('./new'));
router.use('/remove', require('./remove'));
router.use('/all', require('./all'));
router.use('/graph', require('./graph'));
router.use('/update', require('./update'));
router.use('/documents', require('./documents'));

module.exports = router;