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


// ---------- Create New Visit Entry ----------
exports.createEntry = async (req, res) => {
  try {
    const { tenantId, unitVisited, remarks } = req.body;

    console.log("📝 Creating visit entry...");

    if (!tenantId || !unitVisited) {
      return res
        .status(400)
        .json({ success: false, message: "tenantId and unitVisited are required" });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    const entry = await Entry.create({
      tenant: tenant._id,
      unitVisited,
      remarks: remarks || "Visit recorded",
    });

    console.log("📝 Visit entry created:", entry._id);

    res.json({
      success: true,
      message: "Entry created successfully",
      data: {
        _id: entry._id,
        tenant: `${tenant.firstName} ${tenant.lastName}`,
        unitVisited: entry.unitVisited,
        remarks: entry.remarks,
        timestamp: entry.timestamp,
      },
    });
  } catch (error) {
    console.error("❌ Error creating entry:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


// ---------- Get All Entries by Unit ----------
exports.getEntriesByUnit = async (req, res) => {
  try {
    const { unitNumber } = req.params;

    console.log(`📝 Fetching entries for unit ${unitNumber}...`);
    const entries = await Entry.find({ unitVisited: unitNumber })
      .populate("tenant", "firstName lastName dob idLastFour status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      unit: unitNumber,
      totalEntries: entries.length,
      data: entries.map((e) => ({
        visitor: `${e.tenant.firstName} ${e.tenant.lastName}`,
        dob: e.tenant.dob,
        idLastFour: e.tenant.idLastFour,
        status: e.tenant.status,
        remarks: e.remarks,
        visitedAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching entries by unit:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}


exports.getAllVisits = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // 🔍 Optional search (matches tenant name or ID last four)
    const searchFilter = search
      ? {
          $or: [
            { "tenant.firstName": { $regex: search, $options: "i" } },
            { "tenant.lastName": { $regex: search, $options: "i" } },
            { "tenant.idLastFour": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // 🧩 Fetch entries with populated tenant info
    const entries = await Entry.aggregate([
      {
        $lookup: {
          from: "tenants",
          localField: "tenant",
          foreignField: "_id",
          as: "tenant",
        },
      },
      { $unwind: "$tenant" },
      { $match: searchFilter },
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          unitVisited: 1,
          remarks: 1,
          timestamp: 1,
          "tenant.firstName": 1,
          "tenant.lastName": 1,
          "tenant.dob": 1,
          "tenant.idLastFour": 1,
          "tenant.status": 1,
        },
      },
    ]);

    const total = await Entry.countDocuments();

    res.json({
      success: true,
      data: entries.map((e) => ({
        id: e._id,
        visitor: `${e.tenant.firstName || ""} ${e.tenant.lastName || ""}`.trim(),
        dob: e.tenant.dob,
        idLastFour: e.tenant.idLastFour,
        status: e.tenant.status,
        unitVisited: e.unitVisited,
        remarks: e.remarks,
        visitedAt: e.timestamp,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error in getAllVisits:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching visits",
    });
  }
};