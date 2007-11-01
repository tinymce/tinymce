/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.plugins.Save', {
		Save : function(ed, url) {
			var t = this;

			t.editor = ed;

			// Register commands
			ed.addCommand('mceSave', t._save, t);
			ed.addCommand('mceCancel', t._cancel, t);

			// Register buttons
			ed.addButton('save', 'save.save_desc', 'mceSave');
			ed.addButton('cancel', 'save.cancel_desc', 'mceCancel');

			ed.onNodeChange.add(t._nodeChange, t);
			ed.addShortcut('ctrl+s', ed.getLang('save.save_desc'), 'mceSave');
		},

		getInfo : function() {
			return {
				longname : 'Save',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/save',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		// Private methods

		_nodeChange : function(cm, n) {
			var ed = this.editor;

			if (ed.getParam('save_enablewhendirty')) {
				cm.setDisabled('save', !ed.isDirty());
				cm.setDisabled('cancel', !ed.isDirty());
			}
		},

		// Private methods

		_save : function() {
			var ed = this.editor, formObj, os, i, elementId;

			if (ed.getParam("fullscreen_is_enabled"))
				return true;

			formObj = tinymce.DOM.get(ed.id).form;

			if (ed.getParam("save_enablewhendirty") && !ed.isDirty())
				return true;

			if (formObj) {
				tinyMCE.triggerSave();

				// Use callback instead
				if (os = ed.getParam("save_onsavecallback")) {
					if (ed.execCallback('save_onsavecallback', ed)) {
						ed.startContent = tinymce.trim(ed.getContent({format : 'raw'}));
						ed.nodeChanged();
					}

					return;
				}

				ed.isNotDirty = true;

				if (formObj.onsubmit == null || formObj.onsubmit() != false)
					tinymce.DOM.get(ed.id).form.submit();

				ed.nodeChanged();
			} else
				ed.windowManager.alert("Error: No form element found.");

			return true;
		},

		_cancel : function() {
			var ed = this.editor, os, h = tinymce.trim(ed.startContent);

			// Use callback instead
			if (os = ed.getParam("save_oncancelcallback")) {
				ed.execCallback('save_oncancelcallback', ed);
				return;
			}

			ed.setContent(h);
			ed.undoManager.clear();
			ed.nodeChanged();
		}
	});

	// Register plugin
	tinymce.PluginManager.add('save', tinymce.plugins.Save);
})();