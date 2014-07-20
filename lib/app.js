var fs   = require('fs'),
    util = require('util'),
    RSVP = require('rsvp');


RSVP.on('error', function() {
  console.error.apply(this, arguments);
});


try { var settings = require(process.cwd() + '/settings.json'); }
catch (err) { console.error('Missing settings.json or invalid format.'.red); }


function getSettings(name) {
    var path = util.format('%s/conf/%s.json', process.cwd(), name);
    return fs.existsSync(path) ? require(path) : {};
}

function initialize() {
    console.log('Initializing service has started!');

    var actionsPromise = new RSVP.Promise(function(resolve, reject) {
        fs.readdir(__dirname + '/actions', function(err, files) {
            if(err) {
                reject(err);
                return;
            }

            resolve(files.map(function(fn) {
                var action = require(__dirname + '/actions/' + fn),
                    name   = action.name || fn.substring(0, fn.indexOf('.'));

                action.settings = getSettings(name);

                return {
                    name: name,
                    action: action
                };
            }));

        });
    });

    var scrapersPromise = new RSVP.Promise(function(resolve, reject) {
        fs.readdir(__dirname + '/scrapers', function(err, files) {
            if(err) {
                reject(err);
                return;
            }

            var scraperHash = {};

            files.forEach(function(name) {
                /* base class is prefxed with _ */
                if(name.indexOf('_') !== 0) {
                    var Scraper         = require(__dirname + '/scrapers/' + name),
                        scraperInstance = new Scraper();

                    scraperHash[scraperInstance.name] = scraperInstance;
                }
            });

            resolve(scraperHash);
        });
    });

    return RSVP.hash({
        actions: actionsPromise,
        scrapers: scrapersPromise
    });
}


initialize().then(function(result) {
    /* holds all scrapers that have a listener attached to it
       to avoid starting scrapers that have no actions */
    var activeScrapers = {};

    /* bind the actions to the scrapers */
    result.actions.forEach(function(wrapper) {
        var name    = wrapper.name,
            binding = settings.binding[name],
            actions = wrapper.action.actions;

        if(binding && binding.length) {
            binding.forEach(function(scraper) {
                console.log('Registering', name, 'to', scraper);

                var scraperInstance = result.scrapers[scraper];

                /* enumerates over every action on the handler's actions object
                   and binds to the scrapers event emittter with that action name */
                Object.keys(actions).forEach(function(actionName) {
                    scraperInstance.on(actionName, actions[actionName].bind(wrapper.action));
                });

                activeScrapers[scraper] = scraperInstance;
            });
        }
    });

    Object.keys(activeScrapers).forEach(function(key) {
        /* initialize all of the scrappers */
        activeScrapers[key].init();
    });
});
