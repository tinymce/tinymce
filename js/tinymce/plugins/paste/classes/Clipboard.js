/**
 * Clipboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
	"tinymce/dom/RangeUtils",
	"tinymce/util/VK",
	"tinymce/pasteplugin/Utils",
	"tinymce/pasteplugin/SmartPaste",
	"tinymce/util/Delay"
], function(Env, RangeUtils, VK, Utils, SmartPaste, Delay) {
	return function(editor) {
		var self = this, pasteBinElm, lastRng, keyboardPasteTimeStamp = 0, draggingInternally = false;
		var pasteBinDefaultContent = '%MCEPASTEBIN%', keyboardPastePlainTextState;
		var mceInternalUrlPrefix = 'data:text/mce-internal,';
		var uniqueId = Utils.createIdGenerator("mceclip");

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
					SmartPaste.insertContent(editor, html);
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

			/**
			 * Returns the rect of the current caret if the caret is in an empty block before a
			 * BR we insert a temporary invisible character that we get the rect this way we always get a proper rect.
			 *
			 * TODO: This might be useful in core.
			 */
			function getCaretRect(rng) {
				var rects, textNode, node, container = rng.startContainer;

				rects = rng.getClientRects();
				if (rects.length) {
					return rects[0];
				}

				if (!rng.collapsed || container.nodeType != 1) {
					return;
				}

				node = container.childNodes[lastRng.startOffset];

				// Skip empty whitespace nodes
				while (node && node.nodeType == 3 && !node.data.length) {
					node = node.nextSibling;
				}

				if (!node) {
					return;
				}

				// Check if the location is |<br>
				// TODO: Might need to expand this to say |<table>
				if (node.tagName == 'BR') {
					textNode = dom.doc.createTextNode('\uFEFF');
					node.parentNode.insertBefore(textNode, node);

					rng = dom.createRng();
					rng.setStartBefore(textNode);
					rng.setEndAfter(textNode);

					rects = rng.getClientRects();
					dom.remove(textNode);
				}

				if (rects.length) {
					return rects[0];
				}
			}

			// Calculate top cordinate this is needed to avoid scrolling to top of document
			// We want the paste bin to be as close to the caret as possible to avoid scrolling
			if (lastRng.getClientRects) {
				var rect = getCaretRect(lastRng);

				if (rect) {
					// Client rects gets us closes to the actual
					// caret location in for example a wrapped paragraph block
					top = scrollTop + (rect.top - dom.getPos(body).y);
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
			var items = {};

			if (dataTransfer) {
				// Use old WebKit/IE API
				if (dataTransfer.getData) {
					var legacyText = dataTransfer.getData('Text');
					if (legacyText && legacyText.length > 0) {
						if (legacyText.indexOf(mceInternalUrlPrefix) == -1) {
							items['text/plain'] = legacyText;
						}
					}
				}

				if (dataTransfer.types) {
					for (var i = 0; i < dataTransfer.types.length; i++) {
						var contentType = dataTransfer.types[i];
						items[contentType] = dataTransfer.getData(contentType);
					}
				}
			}

			return items;
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

		function hasHtmlOrText(content) {
			return hasContentType(content, 'text/html') || hasContentType(content, 'text/plain');
		}

		function getBase64FromUri(uri) {
			var idx;

			idx = uri.indexOf(',');
			if (idx !== -1) {
				return uri.substr(idx + 1);
			}

			return null;
		}

		function isValidDataUriImage(settings, imgElm) {
			return settings.images_dataimg_filter ? settings.images_dataimg_filter(imgElm) : true;
		}

		function pasteImage(rng, reader, blob) {
			if (rng) {
				editor.selection.setRng(rng);
				rng = null;
			}

			var dataUri = reader.result;
			var base64 = getBase64FromUri(dataUri);

			var img = new Image();
			img.src = dataUri;

			// TODO: Move the bulk of the cache logic to EditorUpload
			if (isValidDataUriImage(editor.settings, img)) {
				var blobCache = editor.editorUpload.blobCache;
				var blobInfo, existingBlobInfo;

				existingBlobInfo = blobCache.findFirst(function(cachedBlobInfo) {
					return cachedBlobInfo.base64() === base64;
				});

				if (!existingBlobInfo) {
					blobInfo = blobCache.create(uniqueId(), blob, base64);
					blobCache.add(blobInfo);
				} else {
					blobInfo = existingBlobInfo;
				}

				pasteHtml('<img src="' + blobInfo.blobUri() + '">');
			} else {
				pasteHtml('<img src="' + dataUri + '">');
			}
		}

		/**
		 * Checks if the clipboard contains image data if it does it will take that data
		 * and convert it into a data url image and paste that image at the caret location.
		 *
		 * @param  {ClipboardEvent} e Paste/drop event object.
		 * @param  {DOMRange} rng Rng object to move selection to.
		 * @return {Boolean} true/false if the image data was found or not.
		 */
		function pasteImageData(e, rng) {
			var dataTransfer = e.clipboardData || e.dataTransfer;

			function processItems(items) {
				var i, item, reader, hadImage = false;

				if (items) {
					for (i = 0; i < items.length; i++) {
						item = items[i];

						if (/^image\/(jpeg|png|gif|bmp)$/.test(item.type)) {
							var blob = item.getAsFile ? item.getAsFile() : item;

							reader = new FileReader();
							reader.onload = pasteImage.bind(null, rng, reader, blob);
							reader.readAsDataURL(blob);

							e.preventDefault();
							hadImage = true;
						}
					}
				}

				return hadImage;
			}

			if (editor.settings.paste_data_images && dataTransfer) {
				return processItems(dataTransfer.items) || processItems(dataTransfer.files);
			}
		}

		/**
		 * Chrome on Android doesn't support proper clipboard access so we have no choice but to allow the browser default behavior.
		 *
		 * @param {Event} e Paste event object to check if it contains any data.
		 * @return {Boolean} true/false if the clipboard is empty or not.
		 */
		function isBrokenAndroidClipboardEvent(e) {
			var clipboardData = e.clipboardData;

			return navigator.userAgent.indexOf('Android') != -1 && clipboardData && clipboardData.items && clipboardData.items.length === 0;
		}

		function getCaretRangeFromEvent(e) {
			return RangeUtils.getCaretRangeFromPoint(e.clientX, e.clientY, editor.getDoc());
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

			function insertClipboardContent(clipboardContent, isKeyBoardPaste, plainTextMode) {
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

				// If we got nothing from clipboard API and pastebin then we could try the last resort: plain/text
				if (!content.length) {
					plainTextMode = true;
				}

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
			}

			var getLastRng = function() {
				return lastRng || editor.selection.getRng();
			};

			editor.on('paste', function(e) {
				// Getting content from the Clipboard can take some time
				var clipboardTimer = new Date().getTime();
				var clipboardContent = getClipboardContent(e);
				var clipboardDelay = new Date().getTime() - clipboardTimer;

				var isKeyBoardPaste = (new Date().getTime() - keyboardPasteTimeStamp - clipboardDelay) < 1000;
				var plainTextMode = self.pasteFormat == "text" || keyboardPastePlainTextState;

				keyboardPastePlainTextState = false;

				if (e.isDefaultPrevented() || isBrokenAndroidClipboardEvent(e)) {
					removePasteBin();
					return;
				}

				if (!hasHtmlOrText(clipboardContent) && pasteImageData(e, getLastRng())) {
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

				// If clipboard API has HTML then use that directly
				if (hasContentType(clipboardContent, 'text/html')) {
					e.preventDefault();
					insertClipboardContent(clipboardContent, isKeyBoardPaste, plainTextMode);
				} else {
					Delay.setEditorTimeout(editor, function() {
						insertClipboardContent(clipboardContent, isKeyBoardPaste, plainTextMode);
					}, 0);
				}
			});

			editor.on('dragstart dragend', function(e) {
				draggingInternally = e.type == 'dragstart';
			});

			function isPlainTextFileUrl(content) {
				return content['text/plain'].indexOf('file://') === 0;
			}

			editor.on('drop', function(e) {
				var dropContent, rng;

				rng = getCaretRangeFromEvent(e);

				if (e.isDefaultPrevented() || draggingInternally) {
					return;
				}

				dropContent = getDataTransferItems(e.dataTransfer);

				if ((!hasHtmlOrText(dropContent) || isPlainTextFileUrl(dropContent)) && pasteImageData(e, rng)) {
					return;
				}

				if (rng && editor.settings.paste_filter_drop !== false) {
					var content = dropContent['mce-internal'] || dropContent['text/html'] || dropContent['text/plain'];

					if (content) {
						e.preventDefault();

						// FF 45 doesn't paint a caret when dragging in text in due to focus call by execCommand
						Delay.setEditorTimeout(editor, function() {
							editor.undoManager.transact(function() {
								if (dropContent['mce-internal']) {
									editor.execCommand('Delete');
								}

								editor.selection.setRng(rng);

								content = Utils.trimHtml(content);

								if (!dropContent['text/html']) {
									pasteText(content);
								} else {
									pasteHtml(content);
								}
							});
						});
					}
				}
			});

			editor.on('dragover dragend', function(e) {
				if (editor.settings.paste_data_images) {
					e.preventDefault();
				}
			});
		}

		self.pasteHtml = pasteHtml;
		self.pasteText = pasteText;
		self.pasteImageData = pasteImageData;

		editor.on('preInit', function() {
			registerEventHandlers();

			// Remove all data images from paste for example from Gecko
			// except internal images like video elements
			editor.parser.addNodeFilter('img', function(nodes, name, args) {
				function isPasteInsert(args) {
					return args.data && args.data.paste === true;
				}

				function remove(node) {
					if (!node.attr('data-mce-object') && src !== Env.transparentSrc) {
						node.remove();
					}
				}

				function isWebKitFakeUrl(src) {
					return src.indexOf("webkit-fake-url") === 0;
				}

				function isDataUri(src) {
					return src.indexOf("data:") === 0;
				}

				if (!editor.settings.paste_data_images && isPasteInsert(args)) {
					var i = nodes.length;

					while (i--) {
						var src = nodes[i].attributes.map.src;

						if (!src) {
							continue;
						}

						// Safari on Mac produces webkit-fake-url see: https://bugs.webkit.org/show_bug.cgi?id=49141
						if (isWebKitFakeUrl(src)) {
							remove(nodes[i]);
						} else if (!editor.settings.allow_html_data_urls && isDataUri(src)) {
							remove(nodes[i]);
						}
					}
				}
			});
		});
	};
});
