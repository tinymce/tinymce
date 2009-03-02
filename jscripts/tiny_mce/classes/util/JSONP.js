/**
 * $Id: JSON.js 920 2008-09-09 14:05:33Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

tinymce.create('static tinymce.util.JSONP', {
	callbacks : {},
	count : 0,

	send : function(o) {
		var t = this, dom = tinymce.DOM, count = o.count !== undefined ? o.count : t.count, id = 'tinymce_jsonp_' + count;

		t.callbacks[count] = function(json) {
			dom.remove(id);
			delete t.callbacks[count];

			o.callback(json);
		};

		dom.add(dom.doc.body, 'script', {id : id , src : o.url, type : 'text/javascript'});
		t.count++;
	}
});
