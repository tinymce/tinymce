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
 * We need to make a lot of ugly hacks to get the contents out of the clipboard since
 * the W3C Clipboard API is broken in all browsers: Gecko/WebKit/Blink. We might rewrite
 * this the way those API:s stabilize.
 *
 * Current implementation steps:
 *  1. On keydown with paste keys Ctrl+V or Shift+Insert create
 *     a paste bin element and move focus to that element.
 *  2. Wait for the browser to fire a "paste" event and get the contents out of the paste bin.
 *  3. Check if the paste was successful if true, process the HTML.
 *  (4). If the paste was unsuccessful use IE execCommand, Clipboard API, document.dataTransfer old WebKit API etc.
 * 
 * @class tinymce.pasteplugin.Clipboard
 * @private
 */
define("tinymce/pasteplugin/Clipboard", [
	"tinymce/Env",
	"tinymce/util/VK",
	"tinymce/pasteplugin/Utils"
], function(Env, VK, Utils) {
	return function(editor) {
		var self = this, pasteBinElm, lastRng, keyboardPasteTimeStamp = 0;
		var pasteBinDefaultContent = '%MCEPASTEBIN%', keyboardPastePlainTextState;

		/**
		 * Pastes the specified HTML. This means that the HTML is filtered and then
		 * inserted at the current selection in the editor. It will also fire paste events
		 * for custom user filtering.
		 *
		 * @param {String} html HTML code to paste into the current selection.
		 */
		function pasteHtml(html) {
			var args, dom = editor.dom;

			args = editor.fire('BeforePastePreProcess', {content: html}); // Internal event used by Quirks
			args = editor.fire('PastePreProcess', args);
			html = args.content;

			if (!args.isDefaultPrevented()) {
				// User has bound PastePostProcess events then we need to pass it through a DOM node
				// This is not ideal but we don't want to let the browser mess up the HTML for example
				// some browsers add &nbsp; to P tags etc
				if (editor.hasEventListeners('PastePostProcess') && !args.isDefaultPrevented()) {
					// We need to attach the element to the DOM so Sizzle selectors work on the contents
					var tempBody = dom.add(editor.getBody(), 'div', {style: 'display:none'}, html);
					args = editor.fire('PastePostProcess', {node: tempBody});
					dom.remove(tempBody);
					html = args.node.innerHTML;
				}

				if (!args.isDefaultPrevented()) {
					editor.insertContent(html);
				}
			}
		}

		/**
		 * Pastes the specified text. This means that the plain text is processed
		 * and converted into BR and P elements. It will fire paste events for custom filtering.
		 *
		 * @param {String} text Text to paste as the current selection location.
		 */
		function pasteText(text) {
			text = editor.dom.encode(text).replace(/\r\n/g, '\n');

			var startBlock = editor.dom.getParent(editor.selection.getStart(), editor.dom.isBlock);

			// Create start block html for example <p attr="value">
			var forcedRootBlockName = editor.settings.forced_root_block;
			var forcedRootBlockStartHtml;
			if (forcedRootBlockName) {
				forcedRootBlockStartHtml = editor.dom.createHTML(forcedRootBlockName, editor.settings.forced_root_block_attrs);
				forcedRootBlockStartHtml = forcedRootBlockStartHtml.substr(0, forcedRootBlockStartHtml.length - 3) + '>';
			}

			if ((startBlock && /^(PRE|DIV)$/.test(startBlock.nodeName)) || !forcedRootBlockName) {
				text = Utils.filter(text, [
					[/\n/g, "<br>"]
				]);
			} else {
				text = Utils.filter(text, [
					[/\n\n/g, "</p>" + forcedRootBlockStartHtml],
					[/^(.*<\/p>)(<p>)$/, forcedRootBlockStartHtml + '$1'],
					[/\n/g, "<br />"]
				]);

				if (text.indexOf('<p>') != -1) {
					text = forcedRootBlockStartHtml + text;
				}
			}

			pasteHtml(text);
		}

		/**
		 * Creates a paste bin element and moves the selection into that element. It will also move the element offscreen
		 * so that resize handles doesn't get produced on IE or Drag handles or Firefox.
		 */
		function createPasteBin() {
			var dom = editor.dom, body = editor.getBody(), viewport = editor.dom.getViewPort(editor.getWin());
			var height = editor.inline ? body.clientHeight : viewport.h;

			removePasteBin();

			// Create a pastebin
			pasteBinElm = dom.add(editor.getBody(), 'div', {
				id: "mcepastebin",
				contentEditable: true,
				"data-mce-bogus": "1",
				style: 'position: fixed; top: 20px;' +
					'width: 10px; height: ' + (height - 40) + 'px; overflow: hidden; opacity: 0'
			}, pasteBinDefaultContent);

			// Move paste bin out of sight since the controlSelection rect gets displayed otherwise
			dom.setStyle(pasteBinElm, 'left', dom.getStyle(body, 'direction', true) == 'rtl' ? 0xFFFF : -0xFFFF);

			// Prevent focus events from bubbeling fixed FocusManager issues
			dom.bind(pasteBinElm, 'beforedeactivate focusin focusout', function(e) {
				e.stopPropagation();
			});

			lastRng = editor.selection.getRng();
			pasteBinElm.focus();
			editor.selection.select(pasteBinElm, true);
		}

		/**
		 * Removes the paste bin if it exists.
		 */
		function removePasteBin() {
			if (pasteBinElm) {
				editor.dom.unbind(pasteBinElm);
				editor.dom.remove(pasteBinElm);

				if (lastRng) {
					editor.selection.setRng(lastRng);
				}
			}

			keyboardPastePlainTextState = false;
			pasteBinElm = lastRng = null;
		}

		/**
		 * Returns the contents of the paste bin as a HTML string.
		 *
		 * @return {String} Get the contents of the paste bin.
		 */
		function getPasteBinHtml() {
			return pasteBinElm ? pasteBinElm.innerHTML : pasteBinDefaultContent;
		}

		/**
		 * Gets various content types out of a datatransfer object.
		 *
		 * @param {DataTransfer} dataTransfer Event fired on paste.
		 * @return {Object} Object with mime types and data for those mime types.
		 */
		function getDataTransferItems(dataTransfer) {
			var data = {};

			if (dataTransfer && dataTransfer.types) {
				data['text/plain'] = dataTransfer.getData('Text');

				for (var i = 0; i < dataTransfer.types.length; i++) {
					var contentType = dataTransfer.types[i];
					data[contentType] = dataTransfer.getData(contentType);
				}
			}

			return data;
		}

		/**
		 * Gets various content types out of the Clipboard API. It will also get the
		 * plain text using older IE and WebKit API:s.
		 *
		 * @param {ClipboardEvent} clipboardEvent Event fired on paste.
		 * @return {Object} Object with mime types and data for those mime types.
		 */
		function getClipboardContent(clipboardEvent) {
			return getDataTransferItems(clipboardEvent.clipboardData || editor.getDoc().dataTransfer);
		}

		function getCaretRangeFromEvent(e) {
			var doc = editor.getDoc(), rng;

			if (doc.caretPositionFromPoint) {
				var point = doc.caretPositionFromPoint(e.pageX, e.pageY);
				rng = doc.createRange();
				rng.setStart(point.offsetNode, point.offset);
				rng.collapse(true);
			} else if (doc.caretRangeFromPoint) {
				rng = doc.caretRangeFromPoint(e.pageX, e.pageY);
			}

			return rng;
		}

		editor.on('keydown', function(e) {
			if (e.isDefaultPrevented()) {
				return;
			}

			// Ctrl+V or Shift+Insert
			if ((VK.metaKeyPressed(e) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45)) {
				keyboardPastePlainTextState = e.shiftKey && e.keyCode == 86;

				// Prevent undoManager keydown handler from making an undo level with the pastebin in it
				e.stopImmediatePropagation();

				keyboardPasteTimeStamp = new Date().getTime();

				// IE doesn't support Ctrl+Shift+V and it doesn't even produce a paste event
				// so lets fake a paste event and let IE use the execCommand/dataTransfer methods
				if (Env.ie && keyboardPastePlainTextState) {
					e.preventDefault();
					editor.fire('paste', {ieFake: true});
					return;
				}

				createPasteBin();
			}
		});

		editor.on('paste', function(e) {
			var clipboardContent = getClipboardContent(e);
			var isKeyBoardPaste = new Date().getTime() - keyboardPasteTimeStamp < 1000;
			var plainTextMode = self.pasteFormat == "text" || keyboardPastePlainTextState;

			// Not a keyboard paste prevent default paste and try to grab the clipboard contents using different APIs
			if (!isKeyBoardPaste) {
				e.preventDefault();
			}

			// Try IE only method if paste isn't a keyboard paste
			if (Env.ie && (!isKeyBoardPaste || e.ieFake)) {
				createPasteBin();

				editor.dom.bind(pasteBinElm, 'paste', function(e) {
					e.stopPropagation();
				});

				editor.getDoc().execCommand('Paste', false, null);
				clipboardContent["text/html"] = getPasteBinHtml();
			}

			setTimeout(function() {
				var html = getPasteBinHtml();

				// WebKit has a nice bug where it clones the paste bin if you paste from for example notepad
				if (pasteBinElm && pasteBinElm.firstChild && pasteBinElm.firstChild.id === 'mcepastebin') {
					plainTextMode = true;
				}

				removePasteBin();

				if (html == pasteBinDefaultContent || !isKeyBoardPaste) {
					html = clipboardContent['text/html'] || clipboardContent['text/plain'] || pasteBinDefaultContent;

					if (html == pasteBinDefaultContent) {
						if (!isKeyBoardPaste) {
							editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
						}

						return;
					}
				}

				if (plainTextMode) {
					pasteText(clipboardContent['text/plain'] || Utils.innerText(html));
				} else {
					pasteHtml(html);
				}
			}, 0);
		});

		editor.on('dragstart', function(e) {
			if (e.dataTransfer.types) {
				e.dataTransfer.setData('mce-internal', editor.selection.getContent());
			}
		});

		editor.on('drop', function(e) {
			var rng = getCaretRangeFromEvent(e);

			if (rng) {
				var dropContent = getDataTransferItems(e.dataTransfer);
				var content = dropContent['mce-internal'] || dropContent['text/html'] || dropContent['text/plain'];

				if (content) {
					e.preventDefault();

					editor.undoManager.transact(function() {
						if (dropContent['mce-internal']) {
							editor.execCommand('Delete');
						}

						editor.selection.setRng(rng);

						if (!dropContent['text/html']) {
							pasteText(content);
						} else {
							pasteHtml(content);
						}
					});
				}
			}
		});

		self.pasteHtml = pasteHtml;
		self.pasteText = pasteText;

		// Remove all data images from paste for example from Gecko
		// except internal images like video elements
		editor.on('preInit', function() {
			editor.parser.addNodeFilter('img', function(nodes) {
				if (!editor.settings.paste_data_images) {
					var i = nodes.length;

					while (i--) {
						var src = nodes[i].attributes.map.src;
						if (src && src.indexOf('data:image') === 0) {
							if (!nodes[i].attr('data-mce-object') && src !== Env.transparentSrc) {
								nodes[i].remove();
							}
						}
					}
				}
			});
		});

		// Fix for #6504 we need to remove the paste bin on IE if the user paste in a file
		editor.on('PreProcess', function() {
			editor.dom.remove(editor.dom.get('mcepastebin'));
		});
	};
});
