var events      = require('events'),
    request     = require('request'),
    cheerio     = require('cheerio'),
    RSVP        = require('rsvp'),
    util        = require('util'),
    defaultName = 'Base scraper';

function BaseScraper() {
    this.name     = defaultName;
    this.previous = null;
    this.interval = 1000 * 60 * 10; // 10-minutes
    this.version  = '0.0.0';

    events.EventEmitter.call(this);
}

util.inherits(BaseScraper, events.EventEmitter);

/**
  Wraper for logging commands

  @method log
*/
BaseScraper.prototype.log = function(log, type) {
    type = type || 'log';
    console[type]('[' + this.name + '] ' + log);

    return this;
};


/**
  Initializes the scheduler task

  @method init
*/
BaseScraper.prototype.init = function() {
    if(this.name === defaultName) {
        throw 'Cannot initialize the base scraper';
    }
    else if(typeof(this.schedule) !== 'function') {
        throw 'Schedule must be implemented on ' + this.name;
    }

    console.log(util.format('[%s:%s] Initializing.', this.name, this.version));

    this.schedule.call(this, undefined);

    return this;
};


/**
  Converts the body to a jQuery-like DOM tree

  @method httpRequest
*/

BaseScraper.prototype.httpRequest = function(url) {
    var proxy = this;

    return new RSVP.Promise(function(resolve, reject) {
        request(url, function(err, response, body) {
            if(err || response.statusCode !== 200) {
                reject.apply(proxy, [err, response]);
            } else {
                resolve.apply(proxy, [cheerio.load(body), err, response, body]);
            }
        });
    });
};


module.exports = BaseScraper;
