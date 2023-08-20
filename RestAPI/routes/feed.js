const express = require("express");
const { body } = require("express-validator");
const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const router = express.Router();
//feed/posts
router.get("/posts", isAuth, feedController.getPosts);
router.post(
  "/post",
  [body("title").trim(), body("content").trim()],
  feedController.createPost
);
router.get("/post/:postId", feedController.getPost);

router.put(
  "/post/:postId",
  [body("title").trim(), body("content").trim()],
  feedController.updatePost
);

router.delete("/post/:postId", feedController.deletePost);

module.exports = router;
