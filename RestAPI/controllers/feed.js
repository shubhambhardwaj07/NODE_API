const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "posts",
        content: "new post",
        imageUrl: "images/duck.jpg",
        creator: { name: "shubh" },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
    // return res.status(422).json({
    //   message: "Validation Failed, entered data is incorrect",
    //   errors: errors.array(),
    // });
    //now we are handling errors generally by global handling of errors
  }
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/duck.jpg",
    creator: { name: "shubh" },
    createdAt: new Date(),
  });
  // create post in db
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      //here throwing wont do trick
      next(err);
      //   console("error due to post creation");
    });
};
