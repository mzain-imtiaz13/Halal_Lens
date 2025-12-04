const express = require("express");
const router = express.Router();

const firebaseAuth = require("../middlewares/auth.middleware");
const UserController = require("../controllers/user.controller");

// used by web/app to purchase monthly/yearly
router.get("/disable", firebaseAuth, UserController.disableAccount);

module.exports = router;
