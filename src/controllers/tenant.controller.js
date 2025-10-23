const Tenant = require("../models/tenant.model");
const Entry = require("../models/entries.model");



// GET /api/profile/:id
exports.getTenantProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findById(id).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const visits = await Entry.find({ tenant: id }).lean();

    const totalVisits = visits.length;
    const visitedUnits = [...new Set(visits.map((v) => v.unitVisited))];
    const remarks = visits.map((v) => v.remarks).filter(Boolean);

    res.json({
      success: true,
      data: {
        tenant,
        totalVisits,
        visitedUnits,
        remarks,
        status: tenant.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/units
exports.getUnitsGrid = async (req, res) => {
  try {
    const units = Array.from({ length: 1921 - 101 + 1 }, (_, i) => ({
      unitNumber: 101 + i,
      tenantHistory: [], // placeholder
    }));

    res.json({ success: true, units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const totalEntries = await Entry.countDocuments();

    res.json({
      success: true,
      data: {
        stats: {
          totalTenants,
          totalEntries,
          activeVisitors: 12, // placeholder
        },
        searchPlaceholder: "Search by name or unit number...",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
