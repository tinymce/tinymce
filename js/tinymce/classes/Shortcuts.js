/**
 * Shortcuts.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains all logic for handling of keyboard shortcuts.
 */
define("tinymce/Shortcuts", [
	"tinymce/util/Tools",
	"tinymce/Env"
], function(Tools, Env) {
	var each = Tools.each, explode = Tools.explode;

	var keyCodeLookup = {
		"f9": 120,
		"f10": 121,
		"f11": 122
	};

	return function(editor) {
		var self = this, shortcuts = {};

		editor.on('keyup keypress keydown', function(e) {
			if (e.altKey || e.ctrlKey || e.metaKey) {
				each(shortcuts, function(shortcut) {
					var ctrlState = Env.isMac ? e.metaKey : e.ctrlKey;

					if (shortcut.ctrl != ctrlState || shortcut.alt != e.altKey || shortcut.shift != e.shiftKey) {
						return;
					}

					if (e.keyCode == shortcut.keyCode || (e.charCode && e.charCode == shortcut.charCode)) {
						e.preventDefault();

						if (e.type == "keydown") {
							shortcut.func.call(shortcut.scope);
						}

						return true;
					}
				});
			}
		});

		/**
		 * Adds a keyboard shortcut for some command or function.
		 *
		 * @method addShortcut
		 * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
		 * @param {String} desc Text description for the command.
		 * @param {String/Function} cmdFunc Command name string or function to execute when the key is pressed.
		 * @param {Object} sc Optional scope to execute the function in.
		 * @return {Boolean} true/false state if the shortcut was added or not.
		 */
		self.add = function(pattern, desc, cmdFunc, scope) {
			var cmd;

			cmd = cmdFunc;

			if (typeof(cmdFunc) === 'string') {
				cmdFunc = function() {
					editor.execCommand(cmd, false, null);
				};
			} else if (cmdFunc.length) {
				cmdFunc = function() {
					editor.execCommand(cmd[0], cmd[1], cmd[2]);
				};
			}

			each(explode(pattern.toLowerCase()), function(pattern) {
				var shortcut = {
					func: cmdFunc,
					scope: scope || editor,
					desc: editor.translate(desc),
					alt: false,
					ctrl: false,
					shift: false
				};

				each(explode(pattern, '+'), function(value) {
					switch (value) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							shortcut[value] = true;
							break;

						default:
							shortcut.charCode = value.charCodeAt(0);
							shortcut.keyCode = keyCodeLookup[value] || value.toUpperCase().charCodeAt(0);
					}
				});

				shortcuts[
					(shortcut.ctrl ? 'ctrl' : '') + ',' +
					(shortcut.alt ? 'alt' : '') + ',' +
					(shortcut.shift ? 'shift' : '') + ',' +
					shortcut.keyCode
				] = shortcut;
			});

			return true;
		};
	};
});