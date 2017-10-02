// Bring in our scrape and makeDate scripts
var scrape = require('../public/assets/scripts/scrape');

var makeDate = require('../public/assets/scripts/date');

var Article = require('../models/Article');

module.exports = {
    fetch: function (cb) {
        var articles = data;
        for (var i = 0; i < articles.length; i++) {
            articles[i].date = makeDate();
            articles[i].saved = false;

        }
        Article.collection.insertMany(articles, {ordered: false}, function (err, docs) {
            cb(err, docs);
        });
    },
    delete: function (query, cb)  {
        Article.remove(query, cb);
    },
    get: function (err, doc) {
        Article.find(query)
            .sort({
                _id: -1
            })
            .exec(function (err, doc) {
                cb(doc);
            });
    },
    udpate: function (query, cb) {
        Article.update({_id: query._id}, {}, cb);
    }
}