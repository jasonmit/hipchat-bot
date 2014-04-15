var events = require('events'),
    request = require('request'),
    cheerio = require('cheerio'),
    RSVP = require('rsvp'),
    util = require('util');

var defaultName = 'Base scraper';

function BaseScraper() {
    this.name = defaultName;

    // holds the previous value parsed from the body
    this.previous = null;
    this.interval = 1000 * 60 * 10; // 10-minutes
    this.version = '0.0.0';

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
};


/**
  Converts the body to a jQuery-like DOM tree

  @method httpRequest
*/

BaseScraper.prototype.httpRequest = function(url) {
    return new RSVP.Promise(function(resolve, reject) {
        request(url, function(err, resp, body) {
            if(err || resp.statusCode !== 200) {
                reject.apply(this, [err, resp]);
            } else {
                resolve.apply(this, [cheerio.load(body), err, resp, body]);
            }
        }.bind(this));
    }.bind(this));
};


module.exports = BaseScraper;
