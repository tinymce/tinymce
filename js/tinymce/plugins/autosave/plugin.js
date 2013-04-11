/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('autosave', function(editor) {
	var settings = editor.settings, LocalStorage = tinymce.util.LocalStorage, prefix = editor.id, started;

	function parseTime(time, defaultTime) {
		var multipels = {
			s: 1000,
			m: 60000
		};

		time = /^(\d+)([ms]?)$/.exec('' + (time || defaultTime));

		return (time[2] ? multipels[time[2]] : 1) * parseInt(time, 10);
	}

	function hasDraft() {
		var time = parseInt(LocalStorage.getItem(prefix + "autosave.time"), 10) || 0;

		if (new Date().getTime() - time > settings.autosave_retention) {
			removeDraft();
			return false;
		}

		return true;
	}

	function removeDraft() {
		LocalStorage.removeItem(prefix + "autosave.draft");
		LocalStorage.removeItem(prefix + "autosave.time");
	}

	function storeDraft() {
		if (started && editor.isDirty()) {
			LocalStorage.setItem(prefix + "autosave.draft", editor.getContent({format: 'raw', no_events: true}));
			LocalStorage.setItem(prefix + "autosave.time", new Date().getTime());
			editor.fire('StoreDraft');
		}
	}

	function restoreDraft() {
		if (hasDraft()) {
			editor.setContent(LocalStorage.getItem(prefix + "autosave.draft"), {format: 'raw'});
			removeDraft();
			editor.fire('RestoreDraft');
		}
	}

	function startStoreDraft() {
		if (!started) {
			setInterval(function() {
				if (!editor.removed) {
					storeDraft();
				}
			}, settings.autosave_interval);

			started = true;
		}
	}

	settings.autosave_interval = parseTime(settings.autosave_interval, '30s');
	settings.autosave_retention = parseTime(settings.autosave_retention, '20m');

	function postRender() {
		var self = this;

		self.disabled(!hasDraft());

		editor.on('StoreDraft RestoreDraft', function() {
			self.disabled(!hasDraft());
		});

		startStoreDraft();
	}

	function restoreLastDraft() {
		editor.undoManager.beforeChange();
		restoreDraft();
		editor.undoManager.add();
	}

	editor.addButton('restoredraft', {
		title: 'Restore draft',
		onclick: restoreLastDraft,
		onPostRender: postRender
	});

	editor.addMenuItem('restoredraft', {
		text: 'Restore last draft',
		onclick: restoreLastDraft,
		onPostRender: postRender,
		context: 'file'
	});

	this.storeDraft = storeDraft;

	// Internal unload handler will be called before the page is unloaded
	function beforeUnloadHandler() {
		var msg;

		tinymce.each(tinymce.editors, function(editor) {
			// Store a draft for each editor instance
			if (editor.plugins.autosave) {
				editor.plugins.autosave.storeDraft();
			}

			// Setup a return message if the editor is dirty
			if (!msg && editor.isDirty() && editor.getParam("autosave_ask_before_unload", true)) {
				msg = editor.translate("You have unsaved changes are you sure you want to navigate away?");
			}
		});

		return msg;
	}

	window.onbeforeunload = beforeUnloadHandler;
});