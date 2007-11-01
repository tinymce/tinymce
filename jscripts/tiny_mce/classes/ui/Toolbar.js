/**
 * $Id: TinyMCE_Array.class.js 224 2007-02-23 20:06:27Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

(function() {
	var each = tinymce.each, DOM = tinymce.DOM;

	tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
		renderHTML : function() {
			var h = '', c = 'mceToolbarEnd', co;

			h += DOM.createHTML('td', {'class' : 'mceToolbarStart'}, DOM.createHTML('span', null, '<!-- IE -->'));

			each(this.controls, function(c) {
				h += '<td>' + c.renderHTML() + '</td>';
			});

			co = this.controls[this.controls.length - 1].constructor;

			if (co === tinymce.ui.Button)
				c += ' mceToolbarEndButton';
			else if (co === tinymce.ui.SplitButton)
				c += ' mceToolbarEndSplitButton';
			else if (co === tinymce.ui.ListBox)
				c += ' mceToolbarEndListBox';

			h += DOM.createHTML('td', {'class' : c}, DOM.createHTML('span', null, '<!-- IE -->'));

			return DOM.createHTML('table', {'class' : 'mceToolbar', cellpadding : '0', cellspacing : '0', align : this.settings.align}, '<tbody><tr>' + h + '</tr></tbody>');
		}
	});
})();
