/**
 * URI.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles parsing, modification and serialization of URI/URL strings.
 * @class tinymce.util.URI
 */
define("tinymce/util/URI", [
	"tinymce/util/Tools"
], function(Tools) {
	var each = Tools.each, trim = Tools.trim;

	/**
	 * Constructs a new URI instance.
	 *
	 * @constructor
	 * @method URI
	 * @param {String} url URI string to parse.
	 * @param {Object} settings Optional settings object.
	 */
	function URI(url, settings) {
		var self = this, baseUri, base_url;

		// Trim whitespace
		url = trim(url);

		// Default settings
		settings = self.settings = settings || {};

		// Strange app protocol that isn't http/https or local anchor
		// For example: mailto,skype,tel etc.
		if (/^([\w\-]+):([^\/]{2})/i.test(url) || /^\s*#/.test(url)) {
			self.source = url;
			return;
		}

		var isProtocolRelative = url.indexOf('//') === 0;

		// Absolute path with no host, fake host and protocol
		if (url.indexOf('/') === 0 && !isProtocolRelative) {
			url = (settings.base_uri ? settings.base_uri.protocol || 'http' : 'http') + '://mce_host' + url;
		}

		// Relative path http:// or protocol relative //path
		if (!/^[\w\-]*:?\/\//.test(url)) {
			base_url = settings.base_uri ? settings.base_uri.path : new URI(location.href).directory;
			if (settings.base_uri.protocol === "") {
				url = '//mce_host' + self.toAbsPath(base_url, url);
			} else {
				url = ((settings.base_uri && settings.base_uri.protocol) || 'http') + '://mce_host' + self.toAbsPath(base_url, url);
			}
		}

		// Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
		url = url.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something

		/*jshint maxlen: 255 */
		/*eslint max-len: 0 */
		url = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url);

		each(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"], function(v, i) {
			var part = url[i];

			// Zope 3 workaround, they use @@something
			if (part) {
				part = part.replace(/\(mce_at\)/g, '@@');
			}

			self[v] = part;
		});

		baseUri = settings.base_uri;
		if (baseUri) {
			if (!self.protocol) {
				self.protocol = baseUri.protocol;
			}

			if (!self.userInfo) {
				self.userInfo = baseUri.userInfo;
			}

			if (!self.port && self.host === 'mce_host') {
				self.port = baseUri.port;
			}

			if (!self.host || self.host === 'mce_host') {
				self.host = baseUri.host;
			}

			self.source = '';
		}

		if (isProtocolRelative) {
			self.protocol = '';
		}

		//t.path = t.path || '/';
	}

	URI.prototype = {
		/**
		 * Sets the internal path part of the URI.
		 *
		 * @method setPath
		 * @param {string} path Path string to set.
		 */
		setPath: function(path) {
			var self = this;

			path = /^(.*?)\/?(\w+)?$/.exec(path);

			// Update path parts
			self.path = path[0];
			self.directory = path[1];
			self.file = path[2];

			// Rebuild source
			self.source = '';
			self.getURI();
		},

		/**
		 * Converts the specified URI into a relative URI based on the current URI instance location.
		 *
		 * @method toRelative
		 * @param {String} uri URI to convert into a relative path/URI.
		 * @return {String} Relative URI from the point specified in the current URI instance.
		 * @example
		 * // Converts an absolute URL to an relative URL url will be somedir/somefile.htm
		 * var url = new tinymce.util.URI('http://www.site.com/dir/').toRelative('http://www.site.com/dir/somedir/somefile.htm');
		 */
		toRelative: function(uri) {
			var self = this, output;

			if (uri === "./") {
				return uri;
			}

			uri = new URI(uri, {base_uri: self});

			// Not on same domain/port or protocol
			if ((uri.host != 'mce_host' && self.host != uri.host && uri.host) || self.port != uri.port ||
				(self.protocol != uri.protocol && uri.protocol !== "")) {
				return uri.getURI();
			}

			var tu = self.getURI(), uu = uri.getURI();

			// Allow usage of the base_uri when relative_urls = true
			if (tu == uu || (tu.charAt(tu.length - 1) == "/" && tu.substr(0, tu.length - 1) == uu)) {
				return tu;
			}

			output = self.toRelPath(self.path, uri.path);

			// Add query
			if (uri.query) {
				output += '?' + uri.query;
			}

			// Add anchor
			if (uri.anchor) {
				output += '#' + uri.anchor;
			}

			return output;
		},

		/**
		 * Converts the specified URI into a absolute URI based on the current URI instance location.
		 *
		 * @method toAbsolute
		 * @param {String} uri URI to convert into a relative path/URI.
		 * @param {Boolean} noHost No host and protocol prefix.
		 * @return {String} Absolute URI from the point specified in the current URI instance.
		 * @example
		 * // Converts an relative URL to an absolute URL url will be http://www.site.com/dir/somedir/somefile.htm
		 * var url = new tinymce.util.URI('http://www.site.com/dir/').toAbsolute('somedir/somefile.htm');
		 */
		toAbsolute: function(uri, noHost) {
			uri = new URI(uri, {base_uri: this});

			return uri.getURI(this.host == uri.host && this.protocol == uri.protocol ? noHost : 0);
		},

		/**
		 * Converts a absolute path into a relative path.
		 *
		 * @method toRelPath
		 * @param {String} base Base point to convert the path from.
		 * @param {String} path Absolute path to convert into a relative path.
		 */
		toRelPath: function(base, path) {
			var items, breakPoint = 0, out = '', i, l;

			// Split the paths
			base = base.substring(0, base.lastIndexOf('/'));
			base = base.split('/');
			items = path.split('/');

			if (base.length >= items.length) {
				for (i = 0, l = base.length; i < l; i++) {
					if (i >= items.length || base[i] != items[i]) {
						breakPoint = i + 1;
						break;
					}
				}
			}

			if (base.length < items.length) {
				for (i = 0, l = items.length; i < l; i++) {
					if (i >= base.length || base[i] != items[i]) {
						breakPoint = i + 1;
						break;
					}
				}
			}

			if (breakPoint === 1) {
				return path;
			}

			for (i = 0, l = base.length - (breakPoint - 1); i < l; i++) {
				out += "../";
			}

			for (i = breakPoint - 1, l = items.length; i < l; i++) {
				if (i != breakPoint - 1) {
					out += "/" + items[i];
				} else {
					out += items[i];
				}
			}

			return out;
		},

		/**
		 * Converts a relative path into a absolute path.
		 *
		 * @method toAbsPath
		 * @param {String} base Base point to convert the path from.
		 * @param {String} path Relative path to convert into an absolute path.
		 */
		toAbsPath: function(base, path) {
			var i, nb = 0, o = [], tr, outPath;

			// Split paths
			tr = /\/$/.test(path) ? '/' : '';
			base = base.split('/');
			path = path.split('/');

			// Remove empty chunks
			each(base, function(k) {
				if (k) {
					o.push(k);
				}
			});

			base = o;

			// Merge relURLParts chunks
			for (i = path.length - 1, o = []; i >= 0; i--) {
				// Ignore empty or .
				if (path[i].length === 0 || path[i] === ".") {
					continue;
				}

				// Is parent
				if (path[i] === '..') {
					nb++;
					continue;
				}

				// Move up
				if (nb > 0) {
					nb--;
					continue;
				}

				o.push(path[i]);
			}

			i = base.length - nb;

			// If /a/b/c or /
			if (i <= 0) {
				outPath = o.reverse().join('/');
			} else {
				outPath = base.slice(0, i).join('/') + '/' + o.reverse().join('/');
			}

			// Add front / if it's needed
			if (outPath.indexOf('/') !== 0) {
				outPath = '/' + outPath;
			}

			// Add traling / if it's needed
			if (tr && outPath.lastIndexOf('/') !== outPath.length - 1) {
				outPath += tr;
			}

			return outPath;
		},

		/**
		 * Returns the full URI of the internal structure.
		 *
		 * @method getURI
		 * @param {Boolean} noProtoHost Optional no host and protocol part. Defaults to false.
		 */
		getURI: function(noProtoHost) {
			var s, self = this;

			// Rebuild source
			if (!self.source || noProtoHost) {
				s = '';

				if (!noProtoHost) {
					if (self.protocol) {
						s += self.protocol + '://';
					} else {
						s += '//';
					}

					if (self.userInfo) {
						s += self.userInfo + '@';
					}

					if (self.host) {
						s += self.host;
					}

					if (self.port) {
						s += ':' + self.port;
					}
				}

				if (self.path) {
					s += self.path;
				}

				if (self.query) {
					s += '?' + self.query;
				}

				if (self.anchor) {
					s += '#' + self.anchor;
				}

				self.source = s;
			}

			return self.source;
		}
	};

	return URI;
});
