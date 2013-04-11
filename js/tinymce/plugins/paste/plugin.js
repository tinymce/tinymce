/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
	"use strict";

	var modules = {};

	function require(ids, callback) {
		var module, defs = [];

		for (var i = 0; i < ids.length; ++i) {
			module = modules[ids[i]] || resolve(ids[i]);
			if (!module) {
				throw 'module definition dependecy not found: ' + ids[i];
			}

			defs.push(module);
		}

		callback.apply(null, defs);
	}

	function define(id, dependencies, definition) {
		if (typeof id !== 'string') {
			throw 'invalid module definition, module id must be defined and be a string';
		}

		if (dependencies === undefined) {
			throw 'invalid module definition, dependencies must be specified';
		}

		if (definition === undefined) {
			throw 'invalid module definition, definition function must be specified';
		}

		require(dependencies, function() {
			modules[id] = definition.apply(null, arguments);
		});
	}

	function defined(id) {
		return !!modules[id];
	}

	function resolve(id) {
		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length; ++fi) {
			if (!target[fragments[fi]]) {
				return;
			}

			target = target[fragments[fi]];
		}

		return target;
	}

	function expose(ids) {
		for (var i = 0; i < ids.length; i++) {
			var target = exports;
			var id = ids[i];
			var fragments = id.split(/[.\/]/);

			for (var fi = 0; fi < fragments.length - 1; ++fi) {
				if (target[fragments[fi]] === undefined) {
					target[fragments[fi]] = {};
				}

				target = target[fragments[fi]];
			}

			target[fragments[fragments.length - 1]] = modules[id];
		}
	}

// Included from: js/tinymce/plugins/paste/classes/Clipboard.js

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

			if (editor.settings.paste_remove_styles || (editor.settings.paste_remove_styles_if_webkit !== false && Env.webkit)) {
				args.content = args.content.replace(/ style=\"[^\"]+\"/g, '');
			}

			if (!args.isDefaultPrevented()) {
				editor.insertContent(args.content);
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
			if (e.shiftKey && e.keyCode == 86) {
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

// Included from: js/tinymce/plugins/paste/classes/WordFilter.js

/**
 * WordFilter.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class parses word HTML into proper TinyMCE markup.
 *
 * @class tinymce.pasteplugin.Quirks
 * @private
 */
define("tinymce/pasteplugin/WordFilter", [
	"tinymce/util/Tools",
	"tinymce/html/DomParser",
	"tinymce/html/Schema",
	"tinymce/html/Serializer",
	"tinymce/html/Node"
], function(Tools, DomParser, Schema, Serializer, Node) {
	return function(editor) {
		var each = Tools.each;

		editor.on('PastePreProcess', function(e) {
			var content = e.content, retainStyleProperties, validStyles;

			retainStyleProperties = editor.settings.paste_retain_style_properties;
			if (retainStyleProperties) {
				validStyles = Tools.makeMap(retainStyleProperties);
			}

			function process(items) {
				each(items, function(v) {
					if (v.constructor == RegExp) {
						content = content.replace(v, '');
					} else {
						content = content.replace(v[0], v[1]);
					}
				});
			}

			/**
			 * Converts fake bullet and numbered lists to real semantic OL/UL.
			 *
			 * @param {tinymce.html.Node} node Root node to convert children of.
			 */
			function convertFakeListsToProperLists(node) {
				var currentListNode, prevListNode, lastLevel = 1;

				function convertParagraphToLi(paragraphNode, listStartTextNode, listName, start) {
					var level = paragraphNode._listLevel || lastLevel;

					// Handle list nesting
					if (level != lastLevel) {
						if (level < lastLevel) {
							// Move to parent list
							if (currentListNode) {
								currentListNode = currentListNode.parent.parent;
							}
						} else {
							// Create new list
							prevListNode = currentListNode;
							currentListNode = null;
						}
					}

					if (!currentListNode || currentListNode.name != listName) {
						prevListNode = prevListNode || currentListNode;
						currentListNode = new Node(listName, 1);

						if (start > 1) {
							currentListNode.attr('start', '' + start);
						}

						paragraphNode.wrap(currentListNode);
					} else {
						currentListNode.append(paragraphNode);
					}

					paragraphNode.name = 'li';
					listStartTextNode.value = '';

					var nextNode = listStartTextNode.next;
					if (nextNode && nextNode.type == 3) {
						nextNode.value = nextNode.value.replace(/^\u00a0+/, '');
					}

					// Append list to previous list
					if (level > lastLevel) {
						prevListNode.lastChild.append(currentListNode);
					}

					lastLevel = level;
				}

				var paragraphs = node.getAll('p');

				for (var i = 0; i < paragraphs.length; i++) {
					node = paragraphs[i];

					if (node.name == 'p' && node.firstChild) {
						// Find first text node in paragraph
						var nodeText = '';
						var listStartTextNode = node.firstChild;

						while (listStartTextNode) {
							nodeText = listStartTextNode.value;
							if (nodeText) {
								break;
							}

							listStartTextNode = listStartTextNode.firstChild;
						}

						// Detect unordered lists look for bullets
						if (/^\s*[\u2022\u00b7\u00a7\u00d8o\u25CF]\s*$/.test(nodeText)) {
							convertParagraphToLi(node, listStartTextNode, 'ul');
							continue;
						}

						// Detect ordered lists 1., a. or ixv.
						if (/^\s*\w+\./.test(nodeText)) {
							// Parse OL start number
							var matches = /([0-9])\./.exec(nodeText);
							var start = 1;
							if (matches) {
								start = parseInt(matches[1], 10);
							}

							convertParagraphToLi(node, listStartTextNode, 'ol', start);
							continue;
						}

						currentListNode = null;
					}
				}
			}

			function filterStyles(node, styleValue) {
				// Parse out list indent level for lists
				if (node.name === 'p') {
					var matches = /mso-list:\w+ \w+([0-9]+)/.exec(styleValue);

					if (matches) {
						node._listLevel = parseInt(matches[1], 10);
					}
				}

				if (editor.getParam("paste_retain_style_properties", "none")) {
					var outputStyle = "";

					Tools.each(editor.dom.parseStyle(styleValue), function(value, name) {
						// Convert various MS styles to W3C styles
						switch (name) {
							case "horiz-align":
								name = "text-align";
								return;

							case "vert-align":
								name = "vertical-align";
								return;

							case "font-color":
							case "mso-foreground":
								name = "color";
								return;

							case "mso-background":
							case "mso-highlight":
								name = "background";
								break;
						}

						// Output only valid styles
						if (retainStyleProperties == "all" || (validStyles && validStyles[name])) {
							outputStyle += name + ':' + value + ';';
						}
					});

					if (outputStyle) {
						return outputStyle;
					}
				}

				return null;
			}

			if (editor.settings.paste_enable_default_filters === false) {
				return;
			}

			// Detect is the contents is Word junk HTML
			if (/class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i.test(e.content)) {
				e.wordContent = true; // Mark it for other processors

				// Remove basic Word junk
				process([
					// Word comments like conditional comments etc
					/<!--[\s\S]+?-->/gi,

					// Remove comments, scripts (e.g., msoShowComment), XML tag, VML content,
					// MS Office namespaced tags, and a few other tags
					/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi,

					// Convert <s> into <strike> for line-though
					[/<(\/?)s>/gi, "<$1strike>"],

					// Replace nsbp entites to char since it's easier to handle
					[/&nbsp;/gi, "\u00a0"],

					// Convert <span style="mso-spacerun:yes">___</span> to string of alternating
					// breaking/non-breaking spaces of same length
					[/<span\s+style\s*=\s*"\s*mso-spacerun\s*:\s*yes\s*;?\s*"\s*>([\s\u00a0]*)<\/span>/gi,
						function(str, spaces) {
							return (spaces.length > 0) ?
								spaces.replace(/./, " ").slice(Math.floor(spaces.length/2)).split("").join("\u00a0") : "";
						}
					]
				]);

				// Setup strict schema
				var schema = new Schema({
					valid_elements: '@[style],-strong/b,-em/i,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,-table,' +
								'-tr,-td[colspan|rowspan],-th,-thead,-tfoot,-tbody,-a[!href]'
				});

				// Parse HTML into DOM structure
				var domParser = new DomParser({}, schema);

				// Filte element style attributes
				domParser.addAttributeFilter('style', function(nodes) {
					var i = nodes.length, node;

					while (i--) {
						node = nodes[i];
						node.attr('style', filterStyles(node, node.attr('style')));

						// Remove pointess spans
						if (node.name == 'span' && !node.attributes.length) {
							node.unwrap();
						}
					}
				});

				// Parse into DOM structure
				var rootNode = domParser.parse(content);

				// Process DOM
				convertFakeListsToProperLists(rootNode);

				// Serialize DOM back to HTML
				e.content = new Serializer({}, schema).serialize(rootNode);
			}
		});
	};
});

// Included from: js/tinymce/plugins/paste/classes/Quirks.js

/**
 * Quirks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various fixes for browsers. These issues can not be feature
 * detected since we have no direct control over the clipboard. However we might be able
 * to remove some of these fixes once the browsers gets updated/fixed.
 *
 * @class tinymce.pasteplugin.Quirks
 * @private
 */
define("tinymce/pasteplugin/Quirks", [
	"tinymce/Env",
	"tinymce/util/Tools"
], function(Env, Tools) {
	return function(editor) {
		function addPreProcessFilter(filterFunc) {
			editor.on('PastePreProcess', function(e) {
				e.content = filterFunc(e.content);
			});
		}

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

		/**
		 * Removes WebKit fragment comments and converted-space spans.
		 *
		 * This:
		 *   <!--StartFragment-->a<span class="Apple-converted-space">&nbsp;</span>b<!--EndFragment-->
		 *
		 * Becomes:
		 *   a&nbsp;b
		 */
		function removeWebKitFragments(html) {
			html = process(html, [
				/^[\s\S]*<!--StartFragment-->|<!--EndFragment-->[\s\S]*$/g,        // WebKit fragment
				[/<span class="Apple-converted-space">\u00a0<\/span>/g, '\u00a0'], // WebKit &nbsp;
				/<br>$/															   // Traling BR elements
			]);

			return html;
		}

		/**
		 * Removes BR elements after block elements. IE9 has a nasty bug where it puts a BR element after each
		 * block element when pasting from word. This removes those elements.
		 *
		 * This:
		 *  <p>a</p><br><p>b</p>
		 *
		 * Becomes:
		 *  <p>a</p><p>b</p>
		 */
		function removeExplorerBrElementsAfterBlocks(html) {
			// Produce block regexp based on the block elements in schema
			if (!this.explorerBlocksRegExp) {
				var blockElements = [];

				Tools.each(editor.schema.getBlockElements(), function(block, blockName) {
					blockElements.push(blockName);
				});

				this.explorerBlocksRegExp = new RegExp(
					'(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*(<\/?(' + blockElements.join('|') + ')[^>]*>)(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*',
					'g'
				);
			}

			// Remove BR:s from: <BLOCK>X</BLOCK><BR>
			html = process(html, [
				[this.explorerBlocksRegExp, '$1']
			]);

			// IE9 also adds an extra BR element for each soft-linefeed and it also adds a BR for each word wrap break
			html = process(html, [
				[/<br><br>/g, '<BR><BR>'], // Replace multiple BR elements with uppercase BR to keep them intact
				[/<br>/g, ' '],            // Replace single br elements with space since they are word wrap BR:s
				[/<BR><BR>/g, '<br>']      // Replace back the double brs but into a single BR
			]);

			return html;
		}

		// Sniff browsers and apply fixes since we can't feature detect
		if (Env.webkit) {
			addPreProcessFilter(removeWebKitFragments);
		}

		if (Env.ie) {
			addPreProcessFilter(removeExplorerBrElementsAfterBlocks);
		}
	};
});

// Included from: js/tinymce/plugins/paste/classes/Plugin.js

/**
 * Plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains the tinymce plugin logic for the paste plugin.
 *
 * @class tinymce.pasteplugin.Plugin
 * @private
 */
define("tinymce/pasteplugin/Plugin", [
	"tinymce/PluginManager",
	"tinymce/pasteplugin/Clipboard",
	"tinymce/pasteplugin/WordFilter",
	"tinymce/pasteplugin/Quirks"
], function(PluginManager, Clipboard, WordFilter, Quirks) {
	PluginManager.add('paste', function(editor) {
		var self = this;

		self.clipboard = new Clipboard(editor);
		self.quirks = new Quirks(editor);
		self.wordFilter = new WordFilter(editor);

		editor.addCommand('mceInsertClipboardContent', function(ui, value) {
			if (value.content) {
				self.clipboard.paste(value.content);
			}

			if (value.text) {
				self.clipboard.pasteText(value.text);
			}
		});
	});
});

expose(["tinymce/pasteplugin/Clipboard","tinymce/pasteplugin/WordFilter","tinymce/pasteplugin/Quirks","tinymce/pasteplugin/Plugin"]);
})(this);