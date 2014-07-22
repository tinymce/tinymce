var mime = require('mime');
var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

function WebServer(settings) {
	var server;

	settings = settings || {};

	this.start = function(callback) {
		server = http.createServer(function(req, res) {
			var uri = url.parse(req.url).pathname;

			if (uri === '/') {
				uri = "index.html";
			}

			var filename = path.join(process.cwd(), uri);
			fs.exists(filename, function(exists) {
					if (!exists) {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.end('404 Not Found\n');
						return;
				}

				res.writeHead(200, {'Content-Type': mime.lookup(filename)});
				fs.createReadStream(filename).pipe(res);
			});
		});

		server.listen(settings.port || 9999, settings.host || '0.0.0.0', function() {
			if (settings.verbose) {
				log('Webserver started:', host, 'port', port);
			}

			callback();
		});
	};

	this.stop = function() {
		server.close();
	};
}

module.exports = WebServer;
