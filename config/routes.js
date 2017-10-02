// Server Routes
// ============

// Bring in the scrape function from our scripts directory
var scrape = require('../public/assets/scripts/scrape');

// Bring headlines and notes from the controller
var headlinesController = require('../controllers/articles');
var notesController = require('../controllers/notes');

module.exports = function(router) {
    // This route renders the homepage
    router.get("/", function (req, res) {
        res.render("home");
    });

    router.get("/saved", function (req, res) {
        res.render("saved");
    });

    router.get('/api/fetch', function (req, res) {
        headlinesController.fetch(function (err, docs) {
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