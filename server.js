// Dependencies
var express = require("express");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");

// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

//======Set Up=====================================

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Set up port
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Set up an Express Router
var router = express.Router();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/Mongo-Scraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});
//======Set Up=====================================

//Routes
//===================================
// A GET for the Washington Post
app.get("/scrape", function(req, res) {
  request("https://www.washingtonpost.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("article h2").each(function(i, element) {

      var result = {};

      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      //Create a new entry
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Browser scrape complete message
  res.send("Scrape Complete");
});

// Get articles from mongoDB
app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});


// Creat/Replace new note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

//===================================

// Listen on the port
app.listen(PORT, function () {
    console.log("App running on port 3000!" + PORT);
});