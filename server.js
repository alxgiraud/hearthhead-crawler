var fs = require('fs'),
    prompt = require('prompt'),
    crawler = require('./crawler'),
    scraper = require('./scraper'),
    config = require('./config');

var methods = {
    /**
     *  Launch a prompt asking for action
     *  Available actions:
     *   - init
     *   - refresh
     *   - reset
     *   - exit
     */
    prompt: function () {
        prompt.get('action', function (err, result) {
            if (typeof result !== 'undefined') {
                switch (result.action) {
                case 'init':
                    methods.init();
                    break;
                case 'refresh':
                    var schema = {
                        properties: {
                            start: {
                                type: 'integer',
                                message: 'Must be an integer',
                                required: true
                            },
                            end: {
                                type: 'integer',
                                message: 'Must be an integer',
                                required: true,
                            }
                        }
                    };
                    prompt.get(schema, function (err, result) {
                        if (typeof result !== 'undefined') {
                            methods.refresh(parseInt(result.start), parseInt(result.end));
                        }
                    });
                    break;
                case 'reset':
                    methods.reset();
                    break;
                case 'exit':
                    console.log('Bye bye!');
                    process.exit();
                default:
                    methods.prompt();
                }
            }
        });
    },

    /**
     *  Create or replace the file data.json with array of objects 
     *  Each object refer to the ID and the IMAGE_ID of a minion
     *  Example: { id: 123, image: 'ABC' }
     */
    init: function () {
        console.log('Initialization in progress...');
        config.path = '/cards';
        config.setSubdomain('www');

        crawler.getHtml(config, function (statusCode, result) {
            console.log('Call completed (status: ' + statusCode + ')');
            if (statusCode !== 200) {
                console.error(result);
                methods.prompt();
            } else {
                scraper.getMinions(result, function (minions) {
                    fs.writeFile('data.json', JSON.stringify(minions), function (err) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Data initialized (' + minions.length + ' minions)');
                            methods.prompt();
                        }
                    });
                });
            }
        });
    },

    /**
     *  Retrieved ID of minions from data.json between start and end parameters 
     *  then add all sounds information from each hearthead's subdomains to them
     *  @params {int} start
     *  @params {int} end
     */
    refresh: function (start, end) {
        var data;

        function getMinion(i, data) {
            var minion = data[i],
                subdomains = ['www', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'ko', 'cn'],
                completedRequests = 0;

            if (i >= end || typeof minion === 'undefined') {
                fs.writeFile('data.json', JSON.stringify(data));
                console.log('Refresh completed: ' + (i - start) + ' minions refreshed');

                methods.prompt();

            } else {
                console.log('Refresh in progress for minion: ' + minion.id);

                minion.values = [];
                config.path = '/card=' + minion.id;

                for (var j = 0; j < subdomains.length; j += 1) {
                    config.setSubdomain(subdomains[j]);
                    crawler.getHtml(config, function (statusCode, result, subdomain) {

                        if (statusCode !== 200) {
                            console.error('Error function: getMinion (' + i + ') (status: ' + statusCode + ')');
                            methods.prompt();
                        } else {
                            scraper.getSounds(result, function (soundsObject) {
                                data[i].values.push({
                                    sub: subdomain,
                                    name: soundsObject.name,
                                    sounds: soundsObject.sounds
                                });

                                completedRequests += 1;
                                if (completedRequests >= subdomains.length) {
                                    console.log('All sounds retrieved for minion: ' + data[i].id);

                                    i += 1;
                                    getMinion(i, data);
                                }
                            });
                        }
                    }, subdomains[j]);
                }
            }
        }

        try {
            data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
            getMinion(start, data);
        } catch (e) {
            console.error('No data found! Please use action \'init\' before perform any refresh');
            methods.prompt();
        }
    },

    /**
     *  Remove all information from data.json
     */
    reset: function () {
        fs.truncate('data.json', 0, function () {
            console.log('Data file reset');
            methods.prompt();
        })
    }
};

prompt.start();
methods.prompt();
