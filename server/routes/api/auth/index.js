var router = require('express').Router();

router.use('/mendeley', require('./mendeley'));
router.use('/token', require('./token'));
router.use('/tagvis', require('./tagvis'));
router.use('/zotero', require('./zotero'));

module.exports = router;