const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');

router.get('/scanned-docs', tenantController.getScannedDocs);
router.get('/entries', tenantController.getEntries);


module.exports = router;