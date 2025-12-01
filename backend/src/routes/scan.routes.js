// routes/scan.routes.js
const express = require("express");
const router = express.Router();

const ScanController = require("../controllers/scan.controller");
const firebaseAuth = require("../middlewares/auth.middleware");

// both endpoints require authenticated Firebase user
router.get("/check", firebaseAuth, ScanController.checkScan);
router.post("/consume", firebaseAuth, ScanController.consumeScan);

module.exports = router;
