/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.plugins.PastePlugin', {
		init : function(ed, url) {
			var t = this, cb;

			t.editor = ed;
			t.url = url;

			// Setup plugin events
			t.onPreProcess = new tinymce.util.Dispatcher(t);
			t.onPostProcess = new tinymce.util.Dispatcher(t);

			// Register default handlers
			t.onPreProcess.add(t._preProcess);
			t.onPostProcess.add(t._postProcess);

			// Register optional preprocess handler
			t.onPreProcess.add(function(pl, o) {
				ed.execCallback('paste_preprocess', pl, o);
			});

			// Register optional postprocess
			t.onPostProcess.add(function(pl, o) {
				ed.execCallback('paste_postprocess', pl, o);
			});

			// This function executes the process handlers and inserts the contents
			function process(h) {
				var dom = ed.dom, o = {content : h};

				// Execute pre process handlers
				t.onPreProcess.dispatch(t, o);

				// Create DOM structure
				o.node = dom.create('div', 0, o.content);

				// Execute post process handlers
				t.onPostProcess.dispatch(t, o);

				// Serialize content
				o.content = ed.serializer.serialize(o.node, {getInner : 1});

				// Insert cleaned content. We need to handle insertion of contents containing block elements separatly
				if (/<(p|h[1-6]|ul|ol)/.test(o.content))
					t._insertBlockContent(ed, dom, o.content);
				else
					t._insert(o.content);
			};

			// Add command for external usage
			ed.addCommand('mceInsertClipboardContent', function(u, v) {
				process(v);
			});

			// This function grabs the contents from the clipboard by adding a
			// hidden div and placing the caret inside it and after the browser paste
			// is done it grabs that contents and processes that
			function grabContent(e) {
				var n, or, rng, sel = ed.selection, dom = ed.dom, body = ed.getBody(), posY;

				if (dom.get('_mcePaste'))
					return;

				// Create container to paste into
				n = dom.add(body, 'div', {id : '_mcePaste'}, '&nbsp;');

				// If contentEditable mode we need to find out the position of the closest element
				if (body != ed.getDoc().body)
					posY = dom.getPos(ed.selection.getStart(), body).y;
				else
					posY = body.scrollTop;

				// Styles needs to be applied after the element is added to the document since WebKit will otherwise remove all styles
				dom.setStyles(n, {
					position : 'absolute',
					left : -10000,
					top : posY,
					width : 1,
					height : 1,
					overflow : 'hidden'
				});

				if (tinymce.isIE) {
					// Select the container
					rng = dom.doc.body.createTextRange();
					rng.moveToElementText(n);
					rng.execCommand('Paste');

					// Remove container
					dom.remove(n);

					// Process contents
					process(n.innerHTML);

					return tinymce.dom.Event.cancel(e);
				} else {
					or = ed.selection.getRng();

					// Move caret into hidden div
					n = n.firstChild;
					rng = ed.getDoc().createRange();
					rng.setStart(n, 0);
					rng.setEnd(n, 1);
					sel.setRng(rng);

					// Wait a while and grab the pasted contents
					window.setTimeout(function() {
						var n = dom.get('_mcePaste'), h;

						// Webkit clones the _mcePaste div for some odd reason so this will ensure that we get the real new div not the old empty one
						n.id = '_mceRemoved';
						dom.remove(n);
						n = dom.get('_mcePaste') || n;

						// Grab the HTML contents
						// We need to look for a apple style wrapper on webkit it also adds a div wrapper if you copy/paste the body of the editor
						// It's amazing how strange the contentEditable mode works in WebKit
						h = (dom.select('> span.Apple-style-span div', n)[0] || dom.select('> span.Apple-style-span', n)[0] || n).innerHTML;

						// Remove hidden div and restore selection
						dom.remove(n);

						// Restore the old selection
						if (or)
							sel.setRng(or);

						process(h);
					}, 0);
				}
			};

			// Check if we should use the new auto process method			
			if (ed.getParam('paste_auto_cleanup_on_paste', true)) {
				// Is it's Opera or older FF use key handler
				if (tinymce.isOpera || /Firefox\/2/.test(navigator.userAgent)) {
					ed.onKeyDown.add(function(ed, e) {
						if (((tinymce.isMac ? e.metaKey : e.ctrlKey) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45))
							grabContent(e);
					});
				} else {
					// Grab contents on paste event on Gecko and WebKit
					ed.onPaste.addToTop(function(ed, e) {
						return grabContent(e);
					});
				}
			}

			// Add legacy support
			t._legacySupport();
		},

		getInfo : function() {
			return {
				longname : 'Paste text/word',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/paste',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

		_preProcess : function(pl, o) {
			var h = o.content, process;

			//console.log('Before preprocess:' + o.content);

			function process(items) {
				each(items, function(v) {
					// Remove or replace
					if (v.constructor == RegExp)
						h = h.replace(v, '');
					else
						h = h.replace(v[0], v[1]);
				});
			};

			// Process away some basic content
			process([
				/^\s*(&nbsp;)+/g,											// nbsp entities at the start of contents
				/(&nbsp;|<br[^>]*>)+\s*$/g									// nbsp entities at the end of contents
			]);

			// Detect Word content and process it more agressive
			if (/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test(h)) {
				o.wordContent = true; // Mark the pasted contents as word specific content
				//console.log('Word contents detected.');

				process([
					/<!--[\s\S]+?-->/gi,												// Word comments
					/<\/?(img|font|meta|link|style|span|div|v:\w+)[^>]*>/gi,			// Remove some tags including VML content
					/<\\?\?xml[^>]*>/gi,												// XML namespace declarations
					/<\/?o:[^>]*>/gi,													// MS namespaced elements <o:tag>
					/ (id|name|class|language|type|on\w+|v:\w+)=\"([^\"]*)\"/gi,	// on.., class, style and language attributes with quotes
					/ (id|name|class|language|type|on\w+|v:\w+)=(\w+)/gi,			// on.., class, style and language attributes without quotes (IE)
					[/<(\/?)s>/gi, '<$1strike>'],										// Convert <s> into <strike> for line-though
					/<script[^>]+>[\s\S]*?<\/script>/gi,								// All scripts elements for msoShowComment for example
					[/&nbsp;/g, '\u00a0']												// Replace nsbp entites to char since it's easier to handle
				]);
			}

			//console.log('After preprocess:' + h);

			o.content = h;
		},

		/**
		 * Various post process items.
		 */
		_postProcess : function(pl, o) {
			var t = this, dom = t.editor.dom;

			if (o.wordContent) {
				// Remove named anchors or TOC links
				each(dom.select('a', o.node), function(a) {
					if (!a.href || a.href.indexOf('#_Toc') != -1)
						dom.remove(a, 1);
				});

				if (t.editor.getParam('paste_convert_middot_lists', true))
					t._convertLists(pl, o);

				// Remove all styles
				each(dom.select('*', o.node), function(el) {
					dom.setAttrib(el, 'style', '');
				});
			}

			if (tinymce.isWebKit) {
				// We need to compress the styles on WebKit since if you paste <img border="0" /> it will become <img border="0" style="... lots of junk ..." />
				// Removing the mce_style that contains the real value will force the Serializer engine to compress the styles
				each(dom.select('*', o.node), function(el) {
					el.removeAttribute('mce_style');
				});
			}
		},

		/**
		 * Converts the most common bullet and number formats in Office into a real semantic UL/LI list.
		 */
		_convertLists : function(pl, o) {
			var dom = pl.editor.dom, listElm, li, lastMargin = -1, margin, levels = [], lastType;

			// Convert middot lists into real scemantic lists
			each(dom.select('p', o.node), function(p) {
				var sib, val = '', type, html, idx, parents;

				// Get text node value at beginning of paragraph
				for (sib = p.firstChild; sib && sib.nodeType == 3; sib = sib.nextSibling)
					val += sib.nodeValue;

				// Detect unordered lists look for bullets
				if (/^[\u2022\u00b7\u00a7\u00d8o]\s*\u00a0\u00a0*/.test(val))
					type = 'ul';

				// Detect ordered lists 1., a. or ixv.
				if (/^[\s\S]*\w+\.[\s\S]*\u00a0{2,}/.test(val))
					type = 'ol';

				// Check if node value matches the list pattern: o&nbsp;&nbsp;
				if (type) {
					margin = parseFloat(p.style.marginLeft || 0);

					if (margin > lastMargin)
						levels.push(margin);

					if (!listElm || type != lastType) {
						listElm = dom.create(type);
						dom.insertAfter(listElm, p);
					} else {
						// Nested list element
						if (margin > lastMargin) {
							listElm = li.appendChild(dom.create(type));
						} else if (margin < lastMargin) {
							// Find parent level based on margin value
							idx = tinymce.inArray(levels, margin);
							parents = dom.getParents(listElm.parentNode, type);
							listElm = parents[parents.length - 1 - idx] || listElm;
						}
					}

					if (type == 'ul')
						html = p.innerHTML.replace(/^[\u2022\u00b7\u00a7\u00d8o]\s*(&nbsp;|\u00a0)+\s*/, '');
					else
						html = p.innerHTML.replace(/^[\s\S]*\w+\.(&nbsp;|\u00a0)+\s*/, '');

					li = listElm.appendChild(dom.create('li', 0, html));
					dom.remove(p);

					lastMargin = margin;
					lastType = type;
				} else
					listElm = lastMargin = 0; // End list element
			});
		},

		/**
		 * This method will split the current block parent and insert the contents inside the split position.
		 * This logic can be improved so text nodes at the start/end remain in the start/end block elements
		 */
		_insertBlockContent : function(ed, dom, content) {
			var parentBlock, marker, sel = ed.selection, last, elm, vp, y, elmHeight;

			function select(n) {
				var r;

				if (tinymce.isIE) {
					r = ed.getDoc().body.createTextRange();
					r.moveToElementText(n);
					r.collapse(false);
					r.select();
				} else {
					sel.select(n, 1);
					sel.collapse(false);
				}
			};

			// Insert a marker for the caret position
			this._insert('<span id="_marker">&nbsp;</span>', 1);
			marker = dom.get('_marker');
			parentBlock = dom.getParent(marker, 'p,h1,h2,h3,h4,h5,h6,ul,ol');

			if (parentBlock) {
				// Split parent block
				marker = dom.split(parentBlock, marker);

				// Insert nodes before the marker
				each(dom.create('div', 0, content).childNodes, function(n) {
					last = marker.parentNode.insertBefore(n.cloneNode(true), marker);
				});

				// Move caret after marker
				select(last);
			} else {
				dom.setOuterHTML(marker, content);
				sel.select(ed.getBody(), 1);
				sel.collapse(0);
			}

			dom.remove('_marker'); // Remove marker if it's left

			// Get element, position and height
			elm = sel.getStart();
			vp = dom.getViewPort(ed.getWin());
			y = ed.dom.getPos(elm).y;
			elmHeight = elm.clientHeight;

			// Is element within viewport if not then scroll it into view
			if (y < vp.y || y + elmHeight > vp.y + vp.h)
				ed.getDoc().body.scrollTop = y < vp.y ? y : y - vp.h + 25;
		},

		/**
		 * Inserts the specified contents at the caret position.
		 */
		_insert : function(h, skip_undo) {
			var ed = this.editor;

			// First delete the contents seems to work better on WebKit
			ed.execCommand('Delete');

			// It's better to use the insertHTML method on Gecko since it will combine paragraphs correctly before inserting the contents
			ed.execCommand(tinymce.isGecko ? 'insertHTML' : 'mceInsertContent', false, h, {skip_undo : skip_undo});
		},

		/**
		 * This method will open the old style paste dialogs. Some users might want the old behavior but still use the new cleanup engine.
		 */
		_legacySupport : function() {
			var t = this, ed = t.editor;

			// Register commands for backwards compatibility
			each(['mcePasteText', 'mcePasteWord'], function(cmd) {
				ed.addCommand(cmd, function() {
					ed.windowManager.open({
						file : t.url + (cmd == 'mcePasteText' ? '/pastetext.htm' : '/pasteword.htm'),
						width : 450,
						height : 400,
						inline : 1
					});
				});
			});

			// Register buttons for backwards compatibility
			ed.addButton('pastetext', {title : 'paste.paste_text_desc', cmd : 'mcePasteText'});
			ed.addButton('pasteword', {title : 'paste.paste_word_desc', cmd : 'mcePasteWord'});
			ed.addButton('selectall', {title : 'paste.selectall_desc', cmd : 'selectall'});
		}
	});

	// Register plugin
	tinymce.PluginManager.add('paste', tinymce.plugins.PastePlugin);
})();