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
		var self = this, plainTextPasteTime;

		function now() {
			return new Date().getTime();
		}

		function isPasteKeyEvent(e) {
			// Ctrl+V or Shift+Insert
			return (VK.metaKeyPressed(e) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45);
		}

		function innerText(elm) {
			return elm.innerText || elm.textContent;
		}

		function shouldPasteAsPlainText() {
			return now() - plainTextPasteTime < 100 || self.pasteFormat == "text";
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
			text = editor.dom.encode(text).replace(/\r\n/g, '\n');

			var startBlock = editor.dom.getParent(editor.selection.getStart(), editor.dom.isBlock);

			if ((startBlock && /^(PRE|DIV)$/.test(startBlock.nodeName)) || !editor.settings.forced_root_block) {
				text = process(text, [
					[/\n/g, "<br>"]
				]);
			} else {
				text = process(text, [
					[/\n\n/g, "</p><p>"],
					[/^(.*<\/p>)(<p>)$/, '<p>$1'],
					[/\n/g, "<br />"]
				]);
			}

			var args = editor.fire('PastePreProcess', {content: text});

			if (!args.isDefaultPrevented()) {
				editor.insertContent(args.content);
			}
		}

		function createPasteBin() {
			var scrollTop = editor.dom.getViewPort().y;

			// Create a pastebin and move the selection into the bin
			var pastebinElm = editor.dom.add(editor.getBody(), 'div', {
				contentEditable: false,
				"data-mce-bogus": "1",
				style: 'position: absolute; top: ' + scrollTop + 'px; left: 0; width: 1px; height: 1px; overflow: hidden'
			}, '<div contentEditable="true" data-mce-bogus="1">X</div>');

			editor.dom.bind(pastebinElm, 'beforedeactivate focusin focusout', function(e) {
				e.stopPropagation();
			});

			return pastebinElm;
		}

		function removePasteBin(pastebinElm) {
			editor.dom.unbind(pastebinElm);
			editor.dom.remove(pastebinElm);
		}

		editor.on('keydown', function(e) {
			// Shift+Ctrl+V
			if (VK.metaKeyPressed(e) && e.shiftKey && e.keyCode == 86) {
				plainTextPasteTime = now();
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
				var keyPasteTime = 0;

				editor.on('keydown', function(e) {
					if (isPasteKeyEvent(e) && !e.isDefaultPrevented()) {
						// Prevent undoManager keydown handler from making an undo level with the pastebin in it
						e.stopImmediatePropagation();

						var pastebinElm = createPasteBin();
						keyPasteTime = now();

						editor.dom.bind(pastebinElm, 'paste', function() {
							setTimeout(function() {
								editor.selection.setRng(lastRng);
								removePasteBin(pastebinElm);

								if (shouldPasteAsPlainText()) {
									processText(innerText(pastebinElm.firstChild));
								} else {
									processHtml(pastebinElm.firstChild.innerHTML);
								}
							}, 0);
						});

						var lastRng = editor.selection.getRng();
						pastebinElm.firstChild.focus();
						pastebinElm.firstChild.innerText = '';
					}
				});

				// Explorer fallback
				editor.on('init', function() {
					var dom = editor.dom;

					// Use a different method if the paste was made without using the keyboard
					// for example using the browser menu items
					editor.dom.bind(editor.getBody(), 'paste', function(e) {
						if (now() - keyPasteTime > 100) {
							var gotPasteEvent, pastebinElm = createPasteBin();

							e.preventDefault();

							dom.bind(pastebinElm, 'paste', function(e) {
								e.stopPropagation();
								gotPasteEvent = true;
							});

							var lastRng = editor.selection.getRng();

							// Select the container
							var rng = dom.doc.body.createTextRange();
							rng.moveToElementText(pastebinElm.firstChild);
							rng.execCommand('Paste');
							removePasteBin(pastebinElm);

							if (!gotPasteEvent) {
								editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
								return;
							}

							editor.selection.setRng(lastRng);

							if (shouldPasteAsPlainText()) {
								processText(innerText(pastebinElm.firstChild));
							} else {
								processHtml(pastebinElm.firstChild.innerHTML);
							}
						}
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
					if (isPasteKeyEvent(e) && !e.isDefaultPrevented()) {
						// Prevent undoManager keydown handler from making an undo level with the pastebin in it
						e.stopImmediatePropagation();

						var pastebinElm = createPasteBin();
						var lastRng = editor.selection.getRng();

						editor.selection.select(pastebinElm, true);

						editor.dom.bind(pastebinElm, 'paste', function(e) {
							e.stopPropagation();

							setTimeout(function() {
								removePasteBin(pastebinElm);
								editor.lastRng = lastRng;
								editor.selection.setRng(lastRng);

								var pastebinContents = pastebinElm.firstChild;

								// Remove last BR Safari on Mac adds trailing BR
								if (pastebinContents.lastChild && pastebinContents.lastChild.nodeName == 'BR') {
									pastebinContents.removeChild(pastebinContents.lastChild);
								}

								if (shouldPasteAsPlainText()) {
									processText(innerText(pastebinContents));
								} else {
									processHtml(pastebinContents.innerHTML);
								}
							}, 0);
						});
					}
				});
			}

			// Prevent users from dropping data images on Gecko
			if (!editor.settings.paste_data_images) {
				editor.on('drop', function(e) {
					var dataTransfer = e.dataTransfer;

					if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
						e.preventDefault();
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