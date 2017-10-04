// Server Routes
// ============

var Article = require("../models/Article.js");
var Note = require("../models/Note.js");
var request = require("request");
var cheerio = require("cheerio");



module.exports = function(router) {

// GET request to scrape the NYT website
router.get("/scrape", function(req, res) {

 // First, we grab the body of the html with request
    request("http://www.nytimes.com", function (err, res, body) {
        var $ = cheerio.load(body);
    $(".story-heading").each(function(i, element) {
        if (i < 10) {

        var result = {};

     // Add the text and href of every link, and save them as properties of the result object
     result.title = $(this).children("a").text();
     result.link = $(this).children("a").attr("href");
        }
     // Using our Article model, create a new entry
     // This effectively passes the result object to the entry (and the title and link)
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
 // Tell the browser that we finished scraping the text
 res.redirect("/");
});

// This will get the articles we scraped from the mongoDB
router.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

  /*  router.get("/saved", function (req, res) {
      Article.find({ saved: true })
      .sort({ date: -1 })
      .exec( function(error, data) {
      if (error) throw error;
        res.render("saved", {content: doc});
    });
});
*/

 router.get("/articles/:id", function(req, res) {
   Article.findOne({"_id": req.params.id})
   .populate("note")
   .exec(function(err, doc) {
    if (error) throw err;
     res.json(doc);
   });
});

 router.post("/articles/:id", function(req, res) {
   var newNote = new Note(req.body);
   newNote.save(function(error, doc) {
     if (error) throw error;
     Article.findOneAndUpdate({ "_id": req.params.id}, {"note": doc._id})
     .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
       res.send(doc);
     });
   });
});

 router.post("/saveArticle/:id", function(req,res) {
   Article.findByIdAndUpdate(req.params.id, {$set: { saved: true }})
 .exec( function(err, doc) {
   if (err) throw err;
   res.end();
 });
});

 router.get("/", function(req,res) {
   Article.find({ saved: false })
     .sort({ date: -1 })
     .exec( function(error, doc) {
     if (error) throw error;
     res.render("home", {content: doc});
     });
 });
};

/*    router.get('/api/fetch', function (req, res) {
        articlesController.fetch(function (err, docs) {
            if (!docs || docs.insertCount === 0) {
                res.json({message: 'No new articles today. Check back tomorrow!'});
            }
            else {
                res.json({
                    message: 'Added ' + docs.insertedCount + ' new articles!'
                });
            }
        });
    });
    router.get('/api/articles', function (req, res) {
        var query = {};
        if (req.query.saved) {
            query = req.query;
        }
        articlesController.get(query, function (data) {
            res.json(data);
        });
    });
    router.delete('/api/articles/:id', function (req, res) {
        var query = {};
        query._id = req.params.id;
        articlesController.delete(query, function (err, data) {
            res.json(data);
        });
    });
    router.patch('api/articles', function (req, res) {
        articlesController.update(req.body, function (err, data) {
            res.json(data);
        });
    });
    router.get('api/notes/:article_id?', function (req, res) {
        var query = {};
        if (req.params.article_id) {
            query._id = req.params.article_id;
        }
        notesController.get(query, function (err, data) {
            res.json(data);
        });
    });
    router.delete('/api/notes/:id', function (req, res) {
        var query = {};
        query._id = req.params.id;
        notesController.delete(query, function (err, data) {
            res.json(data);
        });
    });
    router.post('api/notes', function (req, res) {
        notesController.save(req.body, function (data) {
            res.json(data);
        });
    });
}
*/