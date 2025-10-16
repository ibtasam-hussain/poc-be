const License = require('../models/tenant.model'); // make sure path is correct
const Entry = require('../models/entries.model');

// GET /api/scan?search=jasso&page=1&limit=10
exports.getScannedDocs = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    // Convert to integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Build search filter (case-insensitive)
    const query = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { uniqueId: { $regex: search, $options: 'i' } },
            { state: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Count total results
    const total = await License.countDocuments(query);

    // Fetch paginated results (latest first)
    const data = await License.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching scanned entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scanned entries: ' + error.message,
    });
  }
};


// GET /api/entries?search=jasso&page=1&limit=10
exports.getEntries = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // 🕵️ Search by license info (joined collection)
    let matchStage = {};
    if (search) {
      matchStage = {
        $or: [
          { "license.firstName": { $regex: search, $options: "i" } },
          { "license.lastName": { $regex: search, $options: "i" } },
          { "license.uniqueId": { $regex: search, $options: "i" } },
          { "license.state": { $regex: search, $options: "i" } },
          { "license.city": { $regex: search, $options: "i" } },
        ],
      };
    }

    // 🧾 Use aggregation to join entries with licenses
    const results = await Entry.aggregate([
      {
        $lookup: {
          from: "licenses", // collection name in MongoDB (usually lowercase + plural)
          localField: "tenantModel",
          foreignField: "_id",
          as: "license",
        },
      },
      { $unwind: "$license" },
      { $match: matchStage },
      { $sort: { timestamp: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    // Count total (for pagination)
    const totalCountAgg = await Entry.aggregate([
      {
        $lookup: {
          from: "licenses",
          localField: "tenantModel",
          foreignField: "_id",
          as: "license",
        },
      },
      { $unwind: "$license" },
      { $match: matchStage },
      { $count: "total" },
    ]);

    const total = totalCountAgg[0]?.total || 0;

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch entries: " + error.message,
    });
  }
};