/**
 * $Id: TinyMCE_URL.class.js 5 2006-06-05 19:51:22Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

/**
 * Parses a URL in to its diffrent components.
 *
 * @param {string} url_str URL string to parse into a URL object.
 * @return URL object based on input string.
 * @type TinyMCE_URL_Item
 */
TinyMCE_Engine.prototype.parseURL = function(url_str) {
	var urlParts = new Array();

	if (url_str) {
		var pos, lastPos;

		// Parse protocol part
		pos = url_str.indexOf('://');
		if (pos != -1) {
			urlParts['protocol'] = url_str.substring(0, pos);
			lastPos = pos + 3;
		}

		// Find port or path start
		for (var i=lastPos; i<url_str.length; i++) {
			var chr = url_str.charAt(i);

			if (chr == ':')
				break;

			if (chr == '/')
				break;
		}
		pos = i;

		// Get host
		urlParts['host'] = url_str.substring(lastPos, pos);

		// Get port
		urlParts['port'] = "";
		lastPos = pos;
		if (url_str.charAt(pos) == ':') {
			pos = url_str.indexOf('/', lastPos);
			urlParts['port'] = url_str.substring(lastPos+1, pos);
		}

		// Get path
		lastPos = pos;
		pos = url_str.indexOf('?', lastPos);

		if (pos == -1)
			pos = url_str.indexOf('#', lastPos);

		if (pos == -1)
			pos = url_str.length;

		urlParts['path'] = url_str.substring(lastPos, pos);

		// Get query
		lastPos = pos;
		if (url_str.charAt(pos) == '?') {
			pos = url_str.indexOf('#');
			pos = (pos == -1) ? url_str.length : pos;
			urlParts['query'] = url_str.substring(lastPos+1, pos);
		}

		// Get anchor
		lastPos = pos;
		if (url_str.charAt(pos) == '#') {
			pos = url_str.length;
			urlParts['anchor'] = url_str.substring(lastPos+1, pos);
		}
	}

	return urlParts;
};

/**
 * Serializes the specified URL object into a string.
 *
 * @param {TinyMCE_URL_Item} up URL object to serialize.
 * @return Serialized URL object.
 * @type string
 */
TinyMCE_Engine.prototype.serializeURL = function(up) {
	var o = "";

	if (up['protocol'])
		o += up['protocol'] + "://";

	if (up['host'])
		o += up['host'];

	if (up['port'])
		o += ":" + up['port'];

	if (up['path'])
		o += up['path'];

	if (up['query'])
		o += "?" + up['query'];

	if (up['anchor'])
		o += "#" + up['anchor'];

	return o;
};

/**
 * Converts an absolute path to relative path.
 *
 * @param {string} base_url URL to make as a base path, URLs will be converted relative from this point.
 * @param {string} url_to_relative URL to convert into a relative URL.
 * @return Relative URL based in input.
 * @type string
 */
TinyMCE_Engine.prototype.convertAbsoluteURLToRelativeURL = function(base_url, url_to_relative) {
	var baseURL = this.parseURL(base_url);
	var targetURL = this.parseURL(url_to_relative);
	var strTok1;
	var strTok2;
	var breakPoint = 0;
	var outPath = "";
	var forceSlash = false;

	if (targetURL.path == "")
		targetURL.path = "/";
	else
		forceSlash = true;

	// Crop away last path part
	base_url = baseURL.path.substring(0, baseURL.path.lastIndexOf('/'));
	strTok1 = base_url.split('/');
	strTok2 = targetURL.path.split('/');

	if (strTok1.length >= strTok2.length) {
		for (var i=0; i<strTok1.length; i++) {
			if (i >= strTok2.length || strTok1[i] != strTok2[i]) {
				breakPoint = i + 1;
				break;
			}
		}
	}

	if (strTok1.length < strTok2.length) {
		for (var i=0; i<strTok2.length; i++) {
			if (i >= strTok1.length || strTok1[i] != strTok2[i]) {
				breakPoint = i + 1;
				break;
			}
		}
	}

	if (breakPoint == 1)
		return targetURL.path;

	for (var i=0; i<(strTok1.length-(breakPoint-1)); i++)
		outPath += "../";

	for (var i=breakPoint-1; i<strTok2.length; i++) {
		if (i != (breakPoint-1))
			outPath += "/" + strTok2[i];
		else
			outPath += strTok2[i];
	}

	targetURL.protocol = null;
	targetURL.host = null;
	targetURL.port = null;
	targetURL.path = outPath == "" && forceSlash ? "/" : outPath;

	// Remove document prefix from local anchors
	var fileName = baseURL.path;
	var pos;

	if ((pos = fileName.lastIndexOf('/')) != -1)
		fileName = fileName.substring(pos + 1);

	// Is local anchor
	if (fileName == targetURL.path && targetURL.anchor != "")
		targetURL.path = "";

	// If empty and not local anchor force filename or slash
	if (targetURL.path == "" && !targetURL.anchor)
		targetURL.path = fileName != "" ? fileName : "/";

	return this.serializeURL(targetURL);
};

/**
 * Converts an relative path to absolute path.
 *
 * @param {string} base_url URL to make as a base path, URLs will be converted absolute from this point.
 * @param {string} relative_url URL to convert into a absolute URL.
 * @return Absolute URL based in input.
 * @type string
 */
TinyMCE_Engine.prototype.convertRelativeToAbsoluteURL = function(base_url, relative_url) {
	var baseURL = this.parseURL(base_url);
	var relURL = this.parseURL(relative_url);

	if (relative_url == "" || relative_url.charAt(0) == '/' || relative_url.indexOf('://') != -1 || relative_url.indexOf('mailto:') != -1 || relative_url.indexOf('javascript:') != -1)
		return relative_url;

	// Split parts
	baseURLParts = baseURL['path'].split('/');
	relURLParts = relURL['path'].split('/');

	// Remove empty chunks
	var newBaseURLParts = new Array();
	for (var i=baseURLParts.length-1; i>=0; i--) {
		if (baseURLParts[i].length == 0)
			continue;

		newBaseURLParts[newBaseURLParts.length] = baseURLParts[i];
	}
	baseURLParts = newBaseURLParts.reverse();

	// Merge relURLParts chunks
	var newRelURLParts = new Array();
	var numBack = 0;
	for (var i=relURLParts.length-1; i>=0; i--) {
		if (relURLParts[i].length == 0 || relURLParts[i] == ".")
			continue;

		if (relURLParts[i] == '..') {
			numBack++;
			continue;
		}

		if (numBack > 0) {
			numBack--;
			continue;
		}

		newRelURLParts[newRelURLParts.length] = relURLParts[i];
	}

	relURLParts = newRelURLParts.reverse();

	// Remove end from absolute path
	var len = baseURLParts.length-numBack;
	var absPath = (len <= 0 ? "" : "/") + baseURLParts.slice(0, len).join('/') + "/" + relURLParts.join('/');
	var start = "", end = "";

	// Build output URL
	relURL.protocol = baseURL.protocol;
	relURL.host = baseURL.host;
	relURL.port = baseURL.port;

	// Re-add trailing slash if it's removed
	if (relURL.path.charAt(relURL.path.length-1) == "/")
		absPath += "/";

	relURL.path = absPath;

	return this.serializeURL(relURL);
};

/**
 * Converts the specified URL based in TinyMCE configuration settings.
 *
 * @param {string} url URL to convert based on config.
 * @param {HTMLElement} node HTML element that holds the URL.
 * @param {boolean} on_save Is this convertion the final output URL.
 * @return Converted URL string.
 * @type string
 */
TinyMCE_Engine.prototype.convertURL = function(url, node, on_save) {
	var prot = document.location.protocol;
	var host = document.location.hostname;
	var port = document.location.port;

	// Pass through file protocol
	if (prot == "file:")
		return url;

	// Something is wrong, remove weirdness
	url = tinyMCE.regexpReplace(url, '(http|https):///', '/');

	// Mailto link or anchor (Pass through)
	if (url.indexOf('mailto:') != -1 || url.indexOf('javascript:') != -1 || tinyMCE.regexpReplace(url,'[ \t\r\n\+]|%20','').charAt(0) == "#")
		return url;

	// Fix relative/Mozilla
	if (!tinyMCE.isMSIE && !on_save && url.indexOf("://") == -1 && url.charAt(0) != '/')
		return tinyMCE.settings['base_href'] + url;

	// Handle relative URLs
	if (on_save && tinyMCE.getParam('relative_urls')) {
		var curl = tinyMCE.convertRelativeToAbsoluteURL(tinyMCE.settings['base_href'], url);
		if (curl.charAt(0) == '/')
			curl = tinyMCE.settings['document_base_prefix'] + curl;

		var urlParts = tinyMCE.parseURL(curl);
		var tmpUrlParts = tinyMCE.parseURL(tinyMCE.settings['document_base_url']);

		// Force relative
		if (urlParts['host'] == tmpUrlParts['host'] && (urlParts['port'] == tmpUrlParts['port']))
			return tinyMCE.convertAbsoluteURLToRelativeURL(tinyMCE.settings['document_base_url'], curl);
	}

	// Handle absolute URLs
	if (!tinyMCE.getParam('relative_urls')) {
		var urlParts = tinyMCE.parseURL(url);
		var baseUrlParts = tinyMCE.parseURL(tinyMCE.settings['base_href']);

		// Force absolute URLs from relative URLs
		url = tinyMCE.convertRelativeToAbsoluteURL(tinyMCE.settings['base_href'], url);

		// If anchor and path is the same page
		if (urlParts['anchor'] && urlParts['path'] == baseUrlParts['path'])
			return "#" + urlParts['anchor'];
	}

	// Remove current domain
	if (tinyMCE.getParam('remove_script_host')) {
		var start = "", portPart = "";

		if (port != "")
			portPart = ":" + port;

		start = prot + "//" + host + portPart + "/";

		if (url.indexOf(start) == 0)
			url = url.substring(start.length-1);
	}

	return url;
};

/**
 * Converts all img and a element URLs to absolute URLs. This will use the mce_src or mce_href attribute values
 * if they are provided. This function is used when the editor is initialized.
 *
 * @param {HTMLElement} body HTML element to convert all URLs in.
 */
TinyMCE_Engine.prototype.convertAllRelativeURLs = function(body) {
	// Convert all image URL:s to absolute URL
	var elms = body.getElementsByTagName("img");
	for (var i=0; i<elms.length; i++) {
		var src = tinyMCE.getAttrib(elms[i], 'src');

		var msrc = tinyMCE.getAttrib(elms[i], 'mce_src');
		if (msrc != "")
			src = msrc;

		if (src != "") {
			src = tinyMCE.convertRelativeToAbsoluteURL(tinyMCE.settings['base_href'], src);
			elms[i].setAttribute("src", src);
		}
	}

	// Convert all link URL:s to absolute URL
	var elms = body.getElementsByTagName("a");
	for (var i=0; i<elms.length; i++) {
		var href = tinyMCE.getAttrib(elms[i], 'href');

		var mhref = tinyMCE.getAttrib(elms[i], 'mce_href');
		if (mhref != "")
			href = mhref;

		if (href && href != "") {
			href = tinyMCE.convertRelativeToAbsoluteURL(tinyMCE.settings['base_href'], href);
			elms[i].setAttribute("href", href);
		}
	}
};
