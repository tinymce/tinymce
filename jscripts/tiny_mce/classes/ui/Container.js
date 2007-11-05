/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.ui.Container:tinymce.ui.Control', {
		Container : function(id, s) {
			this.parent(id, s);
			this.controls = [];
			this.lookup = {};
		},

		add : function(c) {
			this.lookup[c.id] = c;
			this.controls.push(c);
		},

		remove : function(c) {
		},

		getControls : function() {
			return this.controls;
		},

		get : function(n) {
			return this.lookup[n];
		}
	});
})();
