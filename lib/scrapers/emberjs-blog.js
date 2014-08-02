var BaseKlass = require('./_base'),
    util      = require('util'),
    RSVP      = require('rsvp');


function BlogScraper() {
    BaseKlass.apply(this, arguments);

    this.name     = 'emberjs-blog';
    this.baseUrl  = 'http://emberjs.com';
    this.url      = this.baseUrl + '/blog/';
    this.version  = '0.0.3';
    this.promise  = null;
}

util.inherits(BlogScraper, BaseKlass);


/**
  Reads the DOM and attempts to scrape out the most recent blog title

  @method scrape
*/
BlogScraper.prototype.scrape = function() {
    return this.httpRequest(this.url).then(function($, error, response) {
        var value = $('.blog-post-summary h2').eq(0).text().trim(),
            link  = $('.blog-post-summary h2 a').eq(0).attr('href');

        if(typeof(value) === 'string' && typeof(link) === 'string') {
            return util.format('%s <a href=\"%s%s\">Read more</a>', value, this.baseUrl, link);
        }

        throw 'Unable to scrape proper value';
    }.bind(this));
};


/**
  Schedules the parser to run every 10-minutes (default)

  @method schedule
*/
BlogScraper.prototype.schedule = function() {
    if(!this.promise || RSVP.allSettled([this.promise])) {
        this.promise = this.scrape.call(this, undefined).then(function(notice) {
            if(this.previous === null) {
                this.log('Setting initial value \"' + notice + '\"');
            }
            else if(this.previous && this.previous !== notice) {
                this.emit('change', '<strong>New Ember.js blog post!</strong>: ' + notice);
            }

            this.previous = notice;
        }.bind(this));
    }

    setTimeout(function() {
        setImmediate(this.schedule.bind(this));
    }.bind(this), this.interval);

    return this;
};


module.exports = BlogScraper;
