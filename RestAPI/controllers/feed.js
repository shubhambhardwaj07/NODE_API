const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const user = require("../models/user");

exports.getPosts = (req, res, next) => {
  // if using mondodg or file storage to serve all posts

  //we could add pagination with query param  http.com/feed/posts?page=1
  //   const currentPage = req.query.page || 1;
  //   const perpage = 2;
  //   let totalItems;
  //   Post.find()
  //     .countDocuments()
  //     .then((count) => {
  //       totalItems = count;
  //       return Post.find()
  //         .skip((currentPage - 1) * perpage)
  //         .limit(perPage);
  //     })
  //     .then((posts) => {
  //       res.status(200).json({
  //         posts: posts,
  //         totalItems: totalItems,
  //       });
  //     })
  //     .catch();
  // pagination end
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
  if (!req.file) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path; //use this below
  //when we use images we cant use content-type as application/json
  //so we have to switch back to so do the below in react code
  //   const formData = new FormData()
  //   formData.append('title',postData.title)
  //   formData.append('content',postData.content)
  //   formData.append('image',postData.image)
  //   formData.append('title',postData.title)
  //and just remove header form front end and just give body: formDaata

  const title = req.body.title;
  const content = req.body.content;
  let creator;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/duck.jpg",
    creator: req.userId,
    createdAt: new Date(),
  });
  // create post in db
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
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

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      //here throwing wont do trick
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  //would be there due to multer
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() === req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "updated", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      //here throwing wont do trick
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      //check logged in user

      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() === req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return user.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId); //clearing the relation
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "post deleted success" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__filename, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log("deletion of imagepath faikled");
  });
};
