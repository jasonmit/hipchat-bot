var Hipchat = require('hipchatter'),
    previous = null;


module.exports = {
    name: 'hipbot',

    // this is set by the application initializer
    settings: {},

    actions: {
        change: function (notice) {
            // prevents a case where the scrapers go ape-shit
            if(previous === notice) {
                console.warn('Ignoring.  Previous msg was the same ' + previous);
                return false;
            }

            var chat  = new Hipchat(this.settings.key),
                rooms = this.settings.rooms;

            console.log('[' + this.name + '] Change in the force.', notice);

            previous = notice;

            rooms.forEach(function(room) {
                chat.notify(room, {
                        message:        '[' + this.name + '] ' + notice,
                        message_format: 'html',
                        color:          'green',
                        token:          this.settings.key
                    },
                    function(err) {
                        if (err) {
                            console.error('[' + this.name + '] ' + err);
                            return;
                        }

                        console.log('Successfully notified ' + room + '.');
                    }
                );
            }, this);
        }
    }
};
