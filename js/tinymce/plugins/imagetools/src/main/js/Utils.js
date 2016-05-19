/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/imagetoolsplugin/Utils", [
	"global!tinymce.util.Promise",
	"global!tinymce.util.Tools"
], function(Promise, Tools) {
	var isObject = function (obj) {
		return typeof obj === 'object' && obj !== null;
	};

	var traverse = function (json, path) {
		var result;

		if (!isObject(json)) {
			return null;
		}

		result = path.reduce(function(result, item) {
			var obj = result[0][item];
			return obj !== undefined ? [obj, obj] : [obj, null];
		}, [json, null]);

		return result[1];
	};

	var requestUrlAsBlob = function (url, headers) {
		return new Promise(function(resolve) {
			var xhr;

			xhr = new XMLHttpRequest();

			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					resolve({
						status: xhr.status,
						blob: this.response
					});
				}
			};

			xhr.open('GET', url, true);

			Tools.each(headers, function (value, key) {
				xhr.setRequestHeader(key, value);
			});

			xhr.responseType = 'blob';
			xhr.send();
		});
	};

	var readBlob = function (blob) {
		return new Promise(function(resolve) {
			var fr = new FileReader();

			fr.onload = function (e) {
				var data = e.target;
				resolve(data.result);
			};

			fr.readAsText(blob);
		});
	};

	var parseJson = function (text) {
		var json;

		try {
			json = JSON.parse(text);
		} catch (ex) {
			// Ignore
		}

		return json;
	};

	return {
		traverse: traverse,
		readBlob: readBlob,
		requestUrlAsBlob: requestUrlAsBlob,
		parseJson: parseJson
	};
});
