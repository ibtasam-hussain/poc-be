const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant.controller');

router.get("/profile/:id", tenantController.getTenantProfile);
router.get("/units", tenantController.getUnitsGrid);
router.get("/dashboard", tenantController.getDashboard);
router.get("/entries/:unitNumber", tenantController.getEntriesByUnit);
router.post("/entries", tenantController.createEntry);
router.get("/entries", tenantController.getAllVisits);


module.exports = router;