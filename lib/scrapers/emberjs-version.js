var BaseKlass = require('./_base'),
    util      = require('util'),
    RSVP      = require('rsvp');


function VersionScraper() {
    BaseKlass.apply(this, arguments);

    this.name     = 'emberjs-version';
    this.url      = 'http://www.emberjs.com';
    this.version  = '0.0.3';
    this.promise  = null;
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
    var self = this;

    if(!this.promise || RSVP.allSettled([this.promise])) {
        this.promise = this.scrape.call(this, undefined).then(function(notice) {
            if(self.previous === null) {
                self.log('Setting initial value \"' + notice + '\"');
            }
            else if(self.previous !== notice) {
                self.emit('change', '<strong>New version of Ember released!</strong> ' + notice);
            }

            self.previous = notice;
        });
    }

    setTimeout(function() {
        setImmediate(this.schedule.bind(self));
    }, this.interval);

    return this;
};



module.exports = VersionScraper;
