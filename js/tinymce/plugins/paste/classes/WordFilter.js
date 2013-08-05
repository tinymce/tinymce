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

					// Append list to previous list if it exists
					if (level > lastLevel && prevListNode) {
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
								'-tr,-td[colspan|rowspan],-th,-thead,-tfoot,-tbody,-a[!href],sub,sup,strike'
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