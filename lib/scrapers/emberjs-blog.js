var BaseKlass = require('./_base'),
    util = require('util'),
    request = require('request'),
    cheerio = require('cheerio'),
    RSVP = require('rsvp');


function BlogScraper() {
    BaseKlass.apply(this, arguments);

    this.name = 'emberjs-blog';
    this.baseUrl = 'http://emberjs.com';
    this.url = this.baseUrl + '/blog/';
    this.version = '0.0.2';
    this._promise = null;
}

util.inherits(BlogScraper, BaseKlass);


/**
  Reads the DOM and attempts to scrape out the most recent blog title

  @method scrape
*/
BlogScraper.prototype.scrape = function() {
    return new RSVP.Promise(function(resolve, reject) {
        request(this.url, function(err, resp, body) {
            if (err || (resp && resp.statusCode !== 200)) {
                reject(err);
                return;
            }

            var $ = cheerio.load(body),
                value = $('.blog-post-summary h2').eq(0).text().trim(),
                link = $('.blog-post-summary h2 a').eq(0).attr('href');

            if(typeof(value) === 'string') {
                resolve(value + ' <a href=\"' + this.baseUrl + link + '\">Read more</a>');
            } else {
                reject('Unable to scrape proper value', value);
            }
        }.bind(this));
    }.bind(this));
};


/**
  Schedules the parser to run every 10-minutes (default)

  @method schedule
*/
BlogScraper.prototype.schedule = function() {
    if(!this._promise || RSVP.allSettled([this._promise])) {
        this._promise = this.scrape.call(this, undefined).then(function(notice) {

            if(this.previous === null) {
                console.log('[' + this.name + '] Setting initial value \"' + notice + '\"');
                this.previous = notice;
            }
            else if(this.previous && this.previous !== notice) {
                this.emit('change', '<strong>New Ember.js blog post!</strong>: ' + notice);
            }

        }.bind(this));
    }

    setTimeout(function() {
        setImmediate(this.schedule.bind(this));
    }.bind(this), this.interval);
};


module.exports = BlogScraper;
