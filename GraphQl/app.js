const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const graphqlHTTP = require("express-graphql").graphqlHTTP;
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

// fore imagesss
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image.jpg" ||
    file.mimetype === "image.jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
//''''''''

const app = express();
// app.use(bodyParser.urlencoded()) //x-www-form data
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
//static serving of images
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "error ocured";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

app.use((error, req, res, next) => {
  console.log(error, "global error handled");
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect("url")
  .then()
  .catch((err) => console.log("mongo connect failed"));
app.listen(8080);

//// in front end
// const graphqlQuery = {
//   query: `
//   mutation {
//     createUser(userInput: {email:"test@test.com", name:"shubh", password:"test"}){
//       _id
//       email
//     }
//   }
//   `
// }
// //in body of fetch
// body: JSON.stringify(graphqlQuery)
