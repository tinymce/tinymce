/**
 * $Id: TinyMCE_Array.class.js 224 2007-02-23 20:06:27Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

(function() {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.ui.Button:tinymce.ui.Control', {
		Button : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceButton';
		},

		renderHTML : function() {
			var s = this.settings;

			if (s.image)
				return '<a id="' + this.id + '" href="javascript:;" class="mceButton mceButtonEnabled ' + s['class'] + '" onmousedown="return false;" title="' + DOM.encode(s.title) + '"><img class="icon" src="' + s.image + '" /></a>';

			return '<a id="' + this.id + '" href="javascript:;" class="mceButton mceButtonEnabled ' + s['class'] + '" onmousedown="return false;" title="' + DOM.encode(s.title) + '"><span class="icon ' + s['class'] + '"></span></a>';
		},

		postRender : function() {
			var t = this, s = t.settings;

			tinymce.dom.Event.add(t.id, 'click', function(e) {
				if (!t.isDisabled())
					return s.func.call(s.scope, e);
			});
		},

		execCallback : function() {
			var s = this.settings;

			return s.func.apply(s.scope, arguments);
		}
	});
})();
