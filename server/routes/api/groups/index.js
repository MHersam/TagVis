var router = require('express').Router();

router.use('/new', require('./new'));
router.use('/leave', require('./leave'));
router.use('/join', require('./join'));
router.use('/all', require('./all'));
router.use('/findOne', require('./findOne'));
router.use('/update', require('./update'));
router.use('/addDocuments', require('./addDocuments'));
router.use('/removeDocuments', require('./removeDocuments'));

module.exports = router;