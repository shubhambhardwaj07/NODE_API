const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth");

const router = express.Router();
//do your own validation
router.put(
  "/signup",
  [body("email").trim(), body("name").trim()],
  authController.signup
);

module.exports = router;
