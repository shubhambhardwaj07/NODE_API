const express = require("express");
const { body } = require("express-validator");
const feedController = require("../controllers/feed");

const router = express.Router();
//feed/posts
router.get("/posts", feedController.getPosts);
router.post(
  "/post",
  [body("title").trim(), body("content").trim()],
  feedController.createPost
);

module.exports = router;
