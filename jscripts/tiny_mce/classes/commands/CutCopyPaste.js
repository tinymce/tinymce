/**
 * CutCopyPaste.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	tinymce.each(['Cut', 'Copy', 'Paste'], function(cmd) {
		tinymce.GlobalCommands.add(cmd, function() {
			var ed = this, doc = ed.getDoc();

			try {
				doc.execCommand(cmd, false, null);

				// On WebKit the command will just be ignored if it's not enabled
				if (!doc.queryCommandEnabled(cmd))
					throw 'Error';
			} catch (ex) {
				if (tinymce.isGecko) {
					ed.windowManager.confirm(ed.getLang('clipboard_msg'), function(s) {
						if (s)
							open('http://www.mozilla.org/editor/midasdemo/securityprefs.html', '_blank');
					});
				} else
					ed.windowManager.alert(ed.getLang('clipboard_no_support'));
			}
		});
	});
})(tinymce);
