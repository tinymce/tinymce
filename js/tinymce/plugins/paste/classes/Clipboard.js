/**
 * Clipboard.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains logic for getting HTML contents out of the clipboard.
 *
 * @class tinymce.pasteplugin.Clipboard
 * @private
 */
define("tinymce/pasteplugin/Clipboard", [
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/util/VK"
], function(Env, Tools, VK) {
	function hasClipboardData() {
		// Gecko is excluded until the fix: https://bugzilla.mozilla.org/show_bug.cgi?id=850663
		return !Env.gecko && (("ClipboardEvent" in window) || (Env.webkit && "FocusEvent" in window));
	}

	return function(editor) {
		var plainTextPasteTime;

		function shouldPasteAsPlainText() {
			return new Date().getTime() - plainTextPasteTime < 100;
		}

		// TODO: Move this to a class?
		function process(content, items) {
			Tools.each(items, function(v) {
				if (v.constructor == RegExp) {
					content = content.replace(v, '');
				} else {
					content = content.replace(v[0], v[1]);
				}
			});

			return content;
		}

		function processHtml(html) {
			var args = editor.fire('PastePreProcess', {content: html});

			html = args.content;

			// Remove all data images from paste for example from Gecko
			if (!editor.settings.paste_data_images) {
				html = html.replace(/<img src=\"data:image[^>]+>/g, '');
			}

			if (editor.settings.paste_remove_styles || (editor.settings.paste_remove_styles_if_webkit !== false && Env.webkit)) {
				html = html.replace(/ style=\"[^\"]+\"/g, '');
			}

			if (!args.isDefaultPrevented()) {
				editor.insertContent(html);
			}
		}

		function processText(text) {
			text = editor.dom.encode(text);

			text = process(text, [
				[/\n\n/g, "</p><p>"],
				[/^(.*<\/p>)(<p>)$/, '<p>$1'],
				[/\n/g, "<br />"]
			]);

			var args = editor.fire('PastePreProcess', {content: text});

			if (!args.isDefaultPrevented()) {
				editor.insertContent(args.content);
			}
		}

		function createPasteBin() {
			var scrollTop = (editor.inline ? editor.getBody() : editor.getDoc().documentElement).scrollTop;

			// Create a pastebin and move the selection into the bin
			var pastebinElm = editor.dom.add(editor.getBody(), 'div', {
				id: 'mcePasteBin',
				contentEditable: false,
				style: 'position: absolute; top: ' + scrollTop + 'px; left: 0; background: red; width: 1px; height: 1px; overflow: hidden'
			}, '<div contentEditable="true">X</div>');

			return pastebinElm;
		}

		function removePasteBin() {
			var pastebinElm = editor.dom.get('mcePasteBin');

			editor.dom.unbind(pastebinElm);
			editor.dom.remove(pastebinElm);
		}

		editor.on('keydown', function(e) {
			// Shift+Ctrl+V
			if (VK.metaKeyPressed(e) && e.shiftKey && e.keyCode == 86) {
				plainTextPasteTime = new Date().getTime();
			}
		});

		// Use Clipboard API if it's available
		if (hasClipboardData()) {
			editor.on('paste', function(e) {
				var clipboardData = e.clipboardData;

				function processByContentType(contentType, processFunc) {
					for (var ti = 0; ti < clipboardData.types.length; ti++) {
						if (clipboardData.types[ti] == contentType) {
							processFunc(clipboardData.getData(contentType));
							//clipboardData.items[ti].getAsString(processFunc);
							return true;
						}
					}
				}

				if (clipboardData) {
					e.preventDefault();

					if (shouldPasteAsPlainText()) {
						// First look for HTML then look for plain text
						if (!processByContentType('text/plain', processText)) {
							processByContentType('text/html', processHtml);
						}
					} else {
						// First look for HTML then look for plain text
						if (!processByContentType('text/html', processHtml)) {
							processByContentType('text/plain', processText);
						}
					}
				}
			});
		} else {
			if (Env.ie) {
				// Explorer fallback
				editor.on('init', function() {
					var dom = editor.dom;

					editor.dom.bind(editor.getBody(), 'paste', function(e) {
						var gotPasteEvent;

						e.preventDefault();

						if (shouldPasteAsPlainText() && dom.doc.dataTransfer) {
							processText(dom.doc.dataTransfer.getData('Text'));
							return;
						}

						var pastebinElm = createPasteBin();

						dom.bind(pastebinElm, 'paste', function(e) {
							e.stopPropagation();
							gotPasteEvent = true;
						});

						var lastRng = editor.selection.getRng();

						// Select the container
						var rng = dom.doc.body.createTextRange();
						rng.moveToElementText(pastebinElm.firstChild);
						rng.execCommand('Paste');
						removePasteBin();

						if (!gotPasteEvent) {
							editor.windowManager.alert('Clipboard access not possible.');
							return;
						}

						var html = pastebinElm.firstChild.innerHTML;
						editor.selection.setRng(lastRng);
						processHtml(html);
					});
				});
			} else {
				editor.on('init', function() {
					editor.dom.bind(editor.getBody(), 'paste', function(e) {
						e.preventDefault();
						editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
					});
				});

				// Old Gecko/WebKit/Opera fallback
				editor.on('keydown', function(e) {
					if (VK.metaKeyPressed(e) && e.keyCode == 86 && !e.isDefaultPrevented()) {
						var pastebinElm = createPasteBin();
						var lastRng = editor.selection.getRng();

						editor.selection.select(pastebinElm, true);

						editor.dom.bind(pastebinElm, 'paste', function(e) {
							e.stopPropagation();

							setTimeout(function() {
								removePasteBin();
								editor.lastRng = lastRng;
								editor.selection.setRng(lastRng);
								processHtml(pastebinElm.firstChild.innerHTML);
							}, 0);
						});
					}
				});
			}
		}

		// Block all drag/drop events
		if (editor.paste_block_drop) {
			editor.on('dragend dragover draggesture dragdrop drop drag', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
		}

		this.paste = processHtml;
		this.pasteText = processText;
	};
});