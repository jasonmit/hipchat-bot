var BaseKlass = require('./_base'),
    util = require('util'),
    RSVP = require('rsvp');


function VersionScraper() {
    BaseKlass.apply(this, arguments);

    this.name = 'emberjs-version';
    this.url = 'http://www.emberjs.com';
    this.version = '0.0.2';
    this.promise = null;
}

util.inherits(VersionScraper, BaseKlass);


/**
  Reads the DOM and attempts to scrape out the version

  @method scrape
*/
VersionScraper.prototype.scrape = function() {
    return this.httpRequest(this.url).then(function($, body) {
        var value = $('.info').eq(0).text().split(/\n/)[1].trim();

        if(typeof(value) === 'string' && value.length && !isNaN(value[0])) {
            return value.substring(0, value.length - 1);
        }

        throw "Unable to scope proper value";
    });
};


/**
  Schedules the parser to run every 10-minutes (default)

  @method schedule
*/
VersionScraper.prototype.schedule = function() {
    if(!this.promise || RSVP.allSettled([this.promise])) {
        this.promise = this.scrape.call(this, undefined).then(function(notice) {
            if(this.previous === null) {
                this.log('Setting initial value \"' + notice + '\"');
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
