var fs = require('fs'),
    RSVP = require('rsvp');


RSVP.on('error', function(reason) {
  console.assert(false, reason);
});


try { var settings = require(__dirname + '/../settings.json'); }
catch (err) { console.error('Missing settings.json or invalid format.'.red); }


function initialize() {
    console.log('Initializing service has started!');

    var actionsPromise = new RSVP.Promise(function(resolve, reject) {
        fs.readdir(__dirname + '/actions', function(err, files) {
            if(err) { reject(err); }

            var actions = files.map(function(fn) {
                var action = require(__dirname + '/actions/' + fn),
                    name = action.name || fn.substring(0, fn.indexOf('.'));

                action.settings = settings[name] || {};
                return { name: name, action: action };
            });

            resolve(actions);
        });
    });

    var scrapersPromise = new RSVP.Promise(function(resolve, reject) {
        fs.readdir(__dirname + '/scrapers', function(err, files) {
            if(err) { reject(err); }

            var scrapers = {};
            files.forEach(function(name) {
                /* base class is prefxed with _ */
                if(name.indexOf('_') !== 0) {
                    var Scraper = require(__dirname + '/scrapers/' + name),
                        scraperInstance = new Scraper();

                    scrapers[scraperInstance.name] = scraperInstance;
                }
            });

            resolve(scrapers);
        });
    });

    return RSVP.hash({
        actions: actionsPromise,
        scrapers: scrapersPromise
    });
}


initialize().then(function(result) {
    // holds all scrapers that have a listener attached to it
    // to avoid starting scrapers that have no actions
    var scraperHash = {};

    // bind the actions to the scrapers
    result.actions.forEach(function(wrapper) {
        var name = wrapper.name,
            binding = settings.binding[name],
            action = wrapper.action;

        if(binding && binding.length) {
            binding.forEach(function(scraper) {
                console.log('Registering', name, 'to', scraper);

                var scraperInstance = result.scrapers[scraper];

                // enumerates over every action on the handler's actions object
                // and binds to the scrapers event emittter with that action name
                Object.keys(action.actions).forEach(function(actionName) {
                    scraperInstance.on(actionName, action.actions[actionName].bind(action));
                });

                scraperHash[scraper] = scraperInstance;
            });
        }
    });

    Object.keys(scraperHash).forEach(function(key) {
        scraperHash[key].init(); // schedules the parsers
    });
});
