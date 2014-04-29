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
				"data-mce-bogus": "1",
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

			keyboardPastePlainTextState = false;
			pasteBinElm = lastRng = null;
		}

		/**
		 * Returns the contents of the paste bin as a HTML string.
		 *
		 * @return {String} Get the contents of the paste bin.
		 */
		function getPasteBinHtml() {
			var html = pasteBinDefaultContent, pasteBinClones, i;

			// Since WebKit/Chrome might clone the paste bin when pasting
			// for example: <img style="float: right"> we need to check if any of them contains some useful html.
			// TODO: Man o man is this ugly. WebKit is the new IE! Remove this if they ever fix it!
			pasteBinClones = editor.dom.select('div[id=mcepastebin]');
			i = pasteBinClones.length;
			while (i--) {
				var cloneHtml = pasteBinClones[i].innerHTML;

				if (html == pasteBinDefaultContent) {
					html = '';
				}

				if (cloneHtml.length > html.length) {
					html = cloneHtml;
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
		 * @param  {ClipboardEvent} e Paste event object.
		 * @param  {Object} clipboardContent Collection of clipboard contents.
		 * @return {Boolean} true/false if the image data was found or not.
		 */
		function pasteImageData(e, clipboardContent) {
			function pasteImage(item) {
				if (items[i].type == 'image/png') {
					var reader = new FileReader();

					reader.onload = function() {
						pasteHtml('<img src="' + reader.result + '">');
					};

					reader.readAsDataURL(item.getAsFile());

					return true;
				}
			}

			// If paste data images are disabled or there is HTML or plain text
			// contents then proceed with the normal paste process
			if (!editor.settings.paste_data_images || "text/html" in clipboardContent || "text/plain" in clipboardContent) {
				return;
			}

			if (e.clipboardData) {
				var items = e.clipboardData.items;

				if (items) {
					for (var i = 0; i < items.length; i++) {
						if (pasteImage(items[i])) {
							return true;
						}
					}
				}
			}
		}

		function getCaretRangeFromEvent(e) {
			var doc = editor.getDoc(), rng;

			if (doc.caretPositionFromPoint) {
				var point = doc.caretPositionFromPoint(e.clientX, e.clientY);
				rng = doc.createRange();
				rng.setStart(point.offsetNode, point.offset);
				rng.collapse(true);
			} else if (doc.caretRangeFromPoint) {
				rng = doc.caretRangeFromPoint(e.clientX, e.clientY);
			}

			return rng;
		}

		function hasContentType(clipboardContent, mimeType) {
			return mimeType in clipboardContent && clipboardContent[mimeType].length > 0;
		}

		function registerEventHandlers() {
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

					removePasteBin();
					createPasteBin();
				}
			});

			editor.on('paste', function(e) {
				var clipboardContent = getClipboardContent(e);
				var isKeyBoardPaste = new Date().getTime() - keyboardPasteTimeStamp < 1000;
				var plainTextMode = self.pasteFormat == "text" || keyboardPastePlainTextState;

				if (e.isDefaultPrevented()) {
					removePasteBin();
					return;
				}

				if (pasteImageData(e, clipboardContent)) {
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
					var html = getPasteBinHtml();

					// WebKit has a nice bug where it clones the paste bin if you paste from for example notepad
					if (pasteBinElm && pasteBinElm.firstChild && pasteBinElm.firstChild.id === 'mcepastebin') {
						plainTextMode = true;
					}

					removePasteBin();

					// Always use pastebin HTML if it's available since it contains Word contents
					if (!plainTextMode && isKeyBoardPaste && html && html != pasteBinDefaultContent) {
						clipboardContent['text/html'] = html;
					}

					if (html == pasteBinDefaultContent || !isKeyBoardPaste) {
						html = clipboardContent['text/html'] || clipboardContent['text/plain'] || pasteBinDefaultContent;

						if (html == pasteBinDefaultContent) {
							if (!isKeyBoardPaste) {
								editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
							}

							return;
						}
					}

					// Force plain text mode if we only got a text/plain content type
					if (!hasContentType(clipboardContent, 'text/html') && hasContentType(clipboardContent, 'text/plain')) {
						plainTextMode = true;
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
					try {
						e.dataTransfer.setData('mce-internal', editor.selection.getContent());
					} catch (ex) {
						// IE 10 throws an error since it doesn't support custom data items
					}
				}
			});

			editor.on('drop', function(e) {
				var rng = getCaretRangeFromEvent(e);

				if (rng && !e.isDefaultPrevented()) {
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
