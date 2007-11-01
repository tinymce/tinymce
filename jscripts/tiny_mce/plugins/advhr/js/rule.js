var AdvHRDialog = {
	init : function(ed) {
		var dom = ed.dom, f = document.forms[0], n = ed.selection.getNode(), w;

		w = dom.getAttrib(n, 'width');
		f.width.value = w ? parseInt(w) : '';
		f.size.value = dom.getAttrib(n, 'size');
		f.noshade.checked = !!dom.getAttrib(n, 'noshade');
		selectByValue(f, 'width2', w.indexOf('%') != -1 ? '%' : 'px');
	},

	update : function() {
		var ed = tinyMCEPopup.editor, h, f = document.forms[0];

		h = '<hr';

		if (f.size.value)
			h += ' size="' + f.size.value + '"';

		if (f.width.value)
			h += ' width="' + f.width.value + (f.width2.value == '%' ? '%' : '') + '"';

		if (f.noshade.checked)
			h += ' noshade="noshade"';

		h += ' />';

		ed.execCommand("mceInsertContent", false, h);
		tinyMCEPopup.close();
	}
};

tinyMCEPopup.requireLangPack();
tinyMCEPopup.onInit.add(AdvHRDialog.init, AdvHRDialog);
