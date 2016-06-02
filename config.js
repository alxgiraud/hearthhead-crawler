var config = {};

var hasProxy = false; //Set to true if you're behind a proxy

config.host = (hasProxy) ? 'proxy.foobar.com' : ''; // update if needed with your proxy address
config.port = 80;
config.path = '';
config.method = 'GET';

if (hasProxy) {
    config.headers = { Host: '' };
}

config.setSubdomain = function (sub) {
    var subdomain = (
        sub === 'fr' || sub === 'de' || sub === 'es' ||
        sub === 'it' || sub === 'pt' || sub === 'ru' ||
        sub === 'ko' || sub === 'cn') ? sub : 'www';

    if (hasProxy) {
        config.headers.Host = subdomain + '.hearthhead.com';
    } else {
        config.host = subdomain + '.hearthhead.com';
    }
};


module.exports = config;
