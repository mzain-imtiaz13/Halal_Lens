// controllers/scan.controller.js

const ScanService = require("../services/scan.service");

const ScanController = {
  // GET /api/scans/check
  checkScan: async (req, res) => {
    try {
      const firebaseUid = req.user.uid;
      const result = await ScanService.checkScanAllowed(firebaseUid);
      return res.json(result);
    } catch (err) {
      console.error("Error in checkScan:", err);
      return res.status(500).json({ message: "Failed to check scan limit." });
    }
  },

  // POST /api/scans/consume
  consumeScan: async (req, res) => {
    try {
      const firebaseUid = req.user.uid;
      const result = await ScanService.consumeScan(firebaseUid);
      return res.json(result);
    } catch (err) {
      console.error("Error in consumeScan:", err);
      return res
        .status(500)
        .json({ message: "Failed to consume scan, please try again." });
    }
  },
};

module.exports = ScanController;
