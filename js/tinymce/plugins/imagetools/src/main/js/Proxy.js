/**
 * Proxy.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles loading images though a proxy for working around cors.
 */
define("tinymce/imagetoolsplugin/Proxy", [
	"global!tinymce.util.Promise",
	"global!tinymce.util.Tools",
	"tinymce/imagetoolsplugin/Utils"
], function(Promise, Tools, Utils) {
	var isServiceErrorCode = function (code) {
		return code === 400 || code === 403 || code === 500;
	};

	var handleHttpError = function (status) {
		return Promise.reject("ImageProxy HTTP error: " + status);
	};

	var proxyServiceError = function (error) {
		Promise.reject("ImageProxy Service error: " + error);
	};

	var handleServiceError = function (status, blob) {
		return Utils.readBlob(blob).then(function(text) {
			var serviceError = Utils.parseJson(text);
			var errorType = Utils.traverse(serviceError, ['error', 'type']);
			return errorType ? proxyServiceError(errorType) : proxyServiceError('Invalid JSON');
		});
	};

	var handleServiceErrorResponse = function (status, blob) {
		return isServiceErrorCode(status) ? handleServiceError(status, blob) : handleHttpError(status);
	};

	var requestServiceBlob = function (url, apiKey) {
		return Utils.requestUrlAsBlob(url, {
			'Content-Type': 'application/json;charset=UTF-8',
			'tiny-api-key': apiKey
		}).then(function (result) {
			return result.status >= 400 ? handleServiceErrorResponse(result.status, result.blob) : Promise.resolve(result.blob);
		});
	};

	function requestBlob(url) {
		return Utils.requestUrlAsBlob(url, {}).then(function (result) {
			return result.status >= 400 ? handleHttpError(result.status) : Promise.resolve(result.blob);
		});
	}

	var getUrl = function (url, apiKey) {
		return apiKey ? requestServiceBlob(url, apiKey) : requestBlob(url);
	};

	return {
		getUrl: getUrl
	};
});
