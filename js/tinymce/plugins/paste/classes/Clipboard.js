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
 * the W3C Clipboard API is broken in all browsers that have it: Gecko/WebKit/Blink.
 * We might rewrite this the way those API:s stabilize. Browsers doesn't handle pasting
 * from applications like Word the same way as it does when pasting into a contentEditable area
 * so we need to do lots of extra work to try to get to this clipboard data.
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
					editor.insertContent(html, {merge: editor.settings.paste_merge_formats !== false});
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
		 * Creates a paste bin element as close as possible to the current caret location and places the focus inside that element
		 * so that when the real paste event occurs the contents gets inserted into this element
		 * instead of the current editor selection element.
		 */
		function createPasteBin() {
			var dom = editor.dom, body = editor.getBody();
			var viewport = editor.dom.getViewPort(editor.getWin()), scrollTop = viewport.y, top = 20;
			var scrollContainer;

			lastRng = editor.selection.getRng();

			if (editor.inline) {
				scrollContainer = editor.selection.getScrollContainer();

				// Can't always rely on scrollTop returning a useful value.
				// It returns 0 if the browser doesn't support scrollTop for the element or is non-scrollable
				if (scrollContainer && scrollContainer.scrollTop > 0) {
					scrollTop = scrollContainer.scrollTop;
				}
			}

			// Calculate top cordinate this is needed to avoid scrolling to top of document
			// We want the paste bin to be as close to the caret as possible to avoid scrolling
			if (lastRng.getClientRects) {
				var rects = lastRng.getClientRects();

				if (rects.length) {
					// Client rects gets us closes to the actual
					// caret location in for example a wrapped paragraph block
					top = scrollTop + (rects[0].top - dom.getPos(body).y);
				} else {
					top = scrollTop;

					// Check if we can find a closer location by checking the range element
					var container = lastRng.startContainer;
					if (container) {
						if (container.nodeType == 3 && container.parentNode != body) {
							container = container.parentNode;
						}

						if (container.nodeType == 1) {
							top = dom.getPos(container, scrollContainer || body).y;
						}
					}
				}
			}

			// Create a pastebin
			pasteBinElm = dom.add(editor.getBody(), 'div', {
				id: "mcepastebin",
				contentEditable: true,
				"data-mce-bogus": "all",
				style: 'position: absolute; top: ' + top + 'px;' +
					'width: 10px; height: 10px; overflow: hidden; opacity: 0'
			}, pasteBinDefaultContent);

			// Move paste bin out of sight since the controlSelection rect gets displayed otherwise on IE and Gecko
			if (Env.ie || Env.gecko) {
				dom.setStyle(pasteBinElm, 'left', dom.getStyle(body, 'direction', true) == 'rtl' ? 0xFFFF : -0xFFFF);
			}

			// Prevent focus events from bubbeling fixed FocusManager issues
			dom.bind(pasteBinElm, 'beforedeactivate focusin focusout', function(e) {
				e.stopPropagation();
			});

			pasteBinElm.focus();
			editor.selection.select(pasteBinElm, true);
		}

		/**
		 * Removes the paste bin if it exists.
		 */
		function removePasteBin() {
			if (pasteBinElm) {
				var pasteBinClone;

				// WebKit/Blink might clone the div so
				// lets make sure we remove all clones
				// TODO: Man o man is this ugly. WebKit is the new IE! Remove this if they ever fix it!
				while ((pasteBinClone = editor.dom.get('mcepastebin'))) {
					editor.dom.remove(pasteBinClone);
					editor.dom.unbind(pasteBinClone);
				}

				if (lastRng) {
					editor.selection.setRng(lastRng);
				}
			}

			pasteBinElm = lastRng = null;
		}

		/**
		 * Returns the contents of the paste bin as a HTML string.
		 *
		 * @return {String} Get the contents of the paste bin.
		 */
		function getPasteBinHtml() {
			var html = '', pasteBinClones, i, clone, cloneHtml;

			// Since WebKit/Chrome might clone the paste bin when pasting
			// for example: <img style="float: right"> we need to check if any of them contains some useful html.
			// TODO: Man o man is this ugly. WebKit is the new IE! Remove this if they ever fix it!
			pasteBinClones = editor.dom.select('div[id=mcepastebin]');
			for (i = 0; i < pasteBinClones.length; i++) {
				clone = pasteBinClones[i];

				// Pasting plain text produces pastebins in pastebinds makes sence right!?
				if (clone.firstChild && clone.firstChild.id == 'mcepastebin') {
					clone = clone.firstChild;
				}

				cloneHtml = clone.innerHTML;
				if (html != pasteBinDefaultContent) {
					html += cloneHtml;
				}
			}

			return html;
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
				// Use old WebKit API
				var legacyText = dataTransfer.getData('Text');
				if (legacyText && legacyText.length > 0) {
					data['text/plain'] = legacyText;
				}

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

		/**
		 * Checks if the clipboard contains image data if it does it will take that data
		 * and convert it into a data url image and paste that image at the caret location.
		 *
		 * @param  {ClipboardEvent} e Paste/drop event object.
		 * @param  {DOMRange} rng Optional rng object to move selection to.
		 * @return {Boolean} true/false if the image data was found or not.
		 */
		function pasteImageData(e, rng) {
			var dataTransfer = e.clipboardData || e.dataTransfer;

			function processItems(items) {
				var i, item, reader;

				function pasteImage() {
					if (rng) {
						editor.selection.setRng(rng);
						rng = null;
					}

					pasteHtml('<img src="' + reader.result + '">');
				}

				if (items) {
					for (i = 0; i < items.length; i++) {
						item = items[i];

						if (/^image\/(jpeg|png|gif)$/.test(item.type)) {
							reader = new FileReader();
							reader.onload = pasteImage;
							reader.readAsDataURL(item.getAsFile ? item.getAsFile() : item);

							e.preventDefault();
							return true;
						}
					}
				}
			}

			if (editor.settings.paste_data_images && dataTransfer) {
				return processItems(dataTransfer.items) || processItems(dataTransfer.files);
			}
		}

		/**
		 * Chrome on Andoid doesn't support proper clipboard access so we have no choice but to allow the browser default behavior.
		 *
		 * @param {Event} e Paste event object to check if it contains any data.
		 * @return {Boolean} true/false if the clipboard is empty or not.
		 */
		function isBrokenAndoidClipboardEvent(e) {
			var clipboardData = e.clipboardData;

			return navigator.userAgent.indexOf('Android') != -1 && clipboardData && clipboardData.items && clipboardData.items.length === 0;
		}

		function getCaretRangeFromEvent(e) {
			var doc = editor.getDoc(), rng, point;

			if (doc.caretPositionFromPoint) {
				point = doc.caretPositionFromPoint(e.clientX, e.clientY);
				rng = doc.createRange();
				rng.setStart(point.offsetNode, point.offset);
				rng.collapse(true);
			} else if (doc.caretRangeFromPoint) {
				rng = doc.caretRangeFromPoint(e.clientX, e.clientY);
			} else if (doc.body.createTextRange) {
				rng = doc.body.createTextRange();

				try {
					rng.moveToPoint(e.clientX, e.clientY);
					rng.collapse(true);
				} catch (ex) {
					// Append to top or bottom depending on drop location
					rng.collapse(e.clientY < doc.body.clientHeight);
				}
			}

			return rng;
		}

		function hasContentType(clipboardContent, mimeType) {
			return mimeType in clipboardContent && clipboardContent[mimeType].length > 0;
		}

		function isKeyboardPasteEvent(e) {
			return (VK.metaKeyPressed(e) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45);
		}

		function registerEventHandlers() {
			editor.on('keydown', function(e) {
				function removePasteBinOnKeyUp(e) {
					// Ctrl+V or Shift+Insert
					if (isKeyboardPasteEvent(e) && !e.isDefaultPrevented()) {
						removePasteBin();
					}
				}

				// Ctrl+V or Shift+Insert
				if (isKeyboardPasteEvent(e) && !e.isDefaultPrevented()) {
					keyboardPastePlainTextState = e.shiftKey && e.keyCode == 86;

					// Edge case on Safari on Mac where it doesn't handle Cmd+Shift+V correctly
					// it fires the keydown but no paste or keyup so we are left with a paste bin
					if (keyboardPastePlainTextState && Env.webkit && navigator.userAgent.indexOf('Version/') != -1) {
						return;
					}

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

					removePasteBin();
					createPasteBin();

					// Remove pastebin if we get a keyup and no paste event
					// For example pasting a file in IE 11 will not produce a paste event
					editor.once('keyup', removePasteBinOnKeyUp);
					editor.once('paste', function() {
						editor.off('keyup', removePasteBinOnKeyUp);
					});
				}
			});

			editor.on('paste', function(e) {
				var clipboardContent = getClipboardContent(e);
				var isKeyBoardPaste = new Date().getTime() - keyboardPasteTimeStamp < 1000;
				var plainTextMode = self.pasteFormat == "text" || keyboardPastePlainTextState;

				keyboardPastePlainTextState = false;

				if (e.isDefaultPrevented() || isBrokenAndoidClipboardEvent(e)) {
					removePasteBin();
					return;
				}

				if (pasteImageData(e)) {
					removePasteBin();
					return;
				}

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
					var content;

					// Grab HTML from Clipboard API or paste bin as a fallback
					if (hasContentType(clipboardContent, 'text/html')) {
						content = clipboardContent['text/html'];
					} else {
						content = getPasteBinHtml();

						// If paste bin is empty try using plain text mode
						// since that is better than nothing right
						if (content == pasteBinDefaultContent) {
							plainTextMode = true;
						}
					}

					content = Utils.trimHtml(content);

					// WebKit has a nice bug where it clones the paste bin if you paste from for example notepad
					// so we need to force plain text mode in this case
					if (pasteBinElm && pasteBinElm.firstChild && pasteBinElm.firstChild.id === 'mcepastebin') {
						plainTextMode = true;
					}

					removePasteBin();

					// Grab plain text from Clipboard API or convert existing HTML to plain text
					if (plainTextMode) {
						// Use plain text contents from Clipboard API unless the HTML contains paragraphs then
						// we should convert the HTML to plain text since works better when pasting HTML/Word contents as plain text
						if (hasContentType(clipboardContent, 'text/plain') && content.indexOf('</p>') == -1) {
							content = clipboardContent['text/plain'];
						} else {
							content = Utils.innerText(content);
						}
					}

					// If the content is the paste bin default HTML then it was
					// impossible to get the cliboard data out.
					if (content == pasteBinDefaultContent) {
						if (!isKeyBoardPaste) {
							editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
						}

						return;
					}

					if (plainTextMode) {
						pasteText(content);
					} else {
						pasteHtml(content);
					}
				}, 0);
			});

			editor.on('dragstart', function(e) {
				if (e.dataTransfer.types) {
					try {
						e.dataTransfer.setData('mce-internal', editor.selection.getContent());
					} catch (ex) {
						// IE 10 throws an error since it doesn't support custom data items
					}
				}
			});

			editor.on('drop', function(e) {
				var rng = getCaretRangeFromEvent(e);

				if (e.isDefaultPrevented()) {
					return;
				}

				if (pasteImageData(e, rng)) {
					return;
				}

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

			editor.on('dragover dragend', function(e) {
				var i, dataTransfer = e.dataTransfer;

				if (editor.settings.paste_data_images && dataTransfer) {
					for (i = 0; i < dataTransfer.types.length; i++) {
						// Prevent default if we have files dragged into the editor since the pasteImageData handles that
						if (dataTransfer.types[i] == "Files") {
							e.preventDefault();
							return false;
						}
					}
				}
			});
		}

		self.pasteHtml = pasteHtml;
		self.pasteText = pasteText;

		editor.on('preInit', function() {
			registerEventHandlers();

			// Remove all data images from paste for example from Gecko
			// except internal images like video elements
			editor.parser.addNodeFilter('img', function(nodes) {
				if (!editor.settings.paste_data_images) {
					var i = nodes.length;

					while (i--) {
						var src = nodes[i].attributes.map.src;

						// Some browsers automatically produce data uris on paste
						// Safari on Mac produces webkit-fake-url see: https://bugs.webkit.org/show_bug.cgi?id=49141
						if (src && /^(data:image|webkit\-fake\-url)/.test(src)) {
							if (!nodes[i].attr('data-mce-object') && src !== Env.transparentSrc) {
								nodes[i].remove();
							}
						}
					}
				}
			});
		});
	};
});
