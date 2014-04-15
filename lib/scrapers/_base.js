var events = require('events'),
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
  Initializes the scheduler task

  @method init
*/
BaseScraper.prototype.init = function() {
    if(this.name === defaultName) {
        throw 'Cannot initialize the base scraper';
    }
    else if(typeof(this.schedule) !== 'function') {
        throw 'Schedule must not implemented on ' + this.name;
    }

    console.log('[' + this.name + '] Initializing.');

    this.schedule.call(this, undefined);
};


module.exports = BaseScraper;
