(function() {
	var queryString = parseQuery(document.location.search.substr(1)), pending = [], sending;

	// Don't collect data if there is nowhere to report it
	if (!queryString.reporturl) {
		return;
	}

	function sendRequest(data) {
		var script = document.createElement('script'), query = '?';

		for (var name in data) {
			if (data.hasOwnProperty(name)) {
				if (typeof(data[name]) !== "undefined") {
					if (query.length > 1) {
						query += "&";
					}

					query += name + '=' + encodeURIComponent(data[name]);
				}
			}
		}

		script.src = queryString.reporturl + query;

		document.body.appendChild(script);
	};
	
	function sendDone() {
		sending = false;

		if (pending.length) {
			sending = true;
			sendRequest(pending.shift());
		}
	};

	function send(event, data) {
		var script;

		data.event = event;

		// Add it to send queue if it's sending
		if (sending) {
			pending.push(data);
			return;
		} else {
			sending = true;
			sendRequest(data);
		}
	};

	function parseQuery(query) {
		var li, it, i;

		// Parse query string
		li = query.split('&');
		query = {};
		for (i = 0; i < li.length; i++) {
			it = li[i].split('=');
			query[unescape(it[0])] = unescape(it[1]);
		}

		return query;
	};

	QUnit.begin = function(data) {
		data.name = document.title;
		send("begin", data);
	};

	QUnit.log = function(data) {
		if (data.actual) {
			data.actual = ('' + data.actual).substr(0, 512);
		}

		if (data.expected) {
			data.expected = ('' + data.expected).substr(0, 512);
		}

		send("log", data);
	};

	QUnit.testStart = function(data) {
		send("testStart", data);
	};

	QUnit.testDone = function(data) {
		send("testDone", data);
	};

	QUnit.moduleStart = function(data) {
		send("moduleStart", data);
	};

	QUnit.moduleDone = function(data) {
		send("moduleDone", data);
	};

	QUnit.done = function(data) {
		send("done", data);
	};

	window.QUnitConnector = {
		response: function(data) {
			sendDone();

			if (data.url) {
				window.location = data.url;
			}
		}
	};
})();