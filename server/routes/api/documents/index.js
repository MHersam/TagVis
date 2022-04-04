var router = require('express').Router();

router.use('/all', require('./all'));
router.use('/suggestions', require('./suggestions'));
router.use('/update', require('./update'));
router.use('/add', require('./add'));
router.use('/remove', require('./remove'));
router.use('/semanticScholarLookup', require('./semanticScholarLookup'));
router.use('/referenced-papers', require('./referenced-papers'));

module.exports = router;