/**
 * JSONP.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/util/JSONP", [
	"tinymce/dom/DOMUtils"
], function(DOMUtils) {
	return {
		callbacks: {},
		count: 0,

		send: function(settings) {
			var self = this, dom = DOMUtils.DOM, count = settings.count !== undefined ? settings.count : self.count;
			var id = 'tinymce_jsonp_' + count;

			self.callbacks[count] = function(json) {
				dom.remove(id);
				delete self.callbacks[count];

				settings.callback(json);
			};

			dom.add(dom.doc.body, 'script', {
				id: id,
				src: settings.url,
				type: 'text/javascript'
			});

			self.count++;
		}
	};
});