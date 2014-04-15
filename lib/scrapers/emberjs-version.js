var BaseKlass = require('./_base'),
    util = require('util'),
    request = require('request'),
    cheerio = require('cheerio'),
    RSVP = require('rsvp');


function VersionScraper() {
    BaseKlass.apply(this, arguments);

    this.name = 'emberjs-version';
    this.url = 'http://www.emberjs.com';
    this.version = '0.0.2';
    this._promise = null;
}

util.inherits(VersionScraper, BaseKlass);


/**
  Reads the DOM and attempts to scrape out the version

  @method scrape
*/
VersionScraper.prototype.scrape = function() {
    return new RSVP.Promise(function(resolve, reject) {
        request(this.url, function(err, resp, body) {
            if (err || (resp && resp.statusCode !== 200)) {
                reject(err);
                return;
            }

            var $ = cheerio.load(body),
                value = $('.info').eq(0).text().split(/\n/)[1].trim();

            if(typeof(value) === 'string' && value.length && !isNaN(value[0])) {
                value = value.substring(0, value.length - 1);
                resolve(value);
            } else {
                reject('Unable to scrape proper value', value);
            }
        });
    }.bind(this));
};


/**
  Schedules the parser to run every 10-minutes (default)

  @method schedule
*/
VersionScraper.prototype.schedule = function() {
    if(!this._promise || RSVP.allSettled([this._promise])) {
        this._promise = this.scrape.call(this, undefined).then(function(notice) {
            if(this.previous === null) {
                console.log('[' + this.name + '] Setting initial value \"' + notice + '\"');
                this.previous = notice;
            }
            else if(this.previous && this.previous !== notice) {
                this.emit('change', '<strong>New version of Ember released!</strong> ' + notice);
            }
        }.bind(this));
    }

    setTimeout(function() {
        setImmediate(this.schedule.bind(this));
    }.bind(this), this.interval);
};



module.exports = VersionScraper;
