var router = require('express').Router();

router.use('/bibliographic', require('./bibliographic'));
router.use('/tags', require('./tags'));
router.use('/direct-citation', require('./direct-citation'));
router.use('/insert', require('./insert'));

module.exports = router;