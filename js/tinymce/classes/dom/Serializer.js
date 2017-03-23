/**
 * Serializer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to serialize DOM trees into a string. Consult the TinyMCE Wiki API for
 * more details and examples on how to use this class.
 *
 * @class tinymce.dom.Serializer
 */
define("tinymce/dom/Serializer", [
	"tinymce/dom/DOMUtils",
	"tinymce/html/DomParser",
	"tinymce/html/SaxParser",
	"tinymce/html/Entities",
	"tinymce/html/Serializer",
	"tinymce/html/Node",
	"tinymce/html/Schema",
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/text/Zwsp"
], function(DOMUtils, DomParser, SaxParser, Entities, Serializer, Node, Schema, Env, Tools, Zwsp) {
	var each = Tools.each, trim = Tools.trim;
	var DOM = DOMUtils.DOM;

	/**
	 * IE 11 has a fantastic bug where it will produce two trailing BR elements to iframe bodies when
	 * the iframe is hidden by display: none on a parent container. The DOM is actually out of sync
	 * with innerHTML in this case. It's like IE adds shadow DOM BR elements that appears on innerHTML
	 * but not as the lastChild of the body. So this fix simply removes the last two
	 * BR elements at the end of the document.
	 *
	 * Example of what happens: <body>text</body> becomes <body>text<br><br></body>
	 */
	function trimTrailingBr(rootNode) {
		var brNode1, brNode2;

		function isBr(node) {
			return node && node.name === 'br';
		}

		brNode1 = rootNode.lastChild;
		if (isBr(brNode1)) {
			brNode2 = brNode1.prev;

			if (isBr(brNode2)) {
				brNode1.remove();
				brNode2.remove();
			}
		}
	}

	/**
	 * Constructs a new DOM serializer class.
	 *
	 * @constructor
	 * @method Serializer
	 * @param {Object} settings Serializer settings object.
	 * @param {tinymce.Editor} editor Optional editor to bind events to and get schema/dom from.
	 */
	return function(settings, editor) {
		var dom, schema, htmlParser, tempAttrs = ["data-mce-selected"];

		if (editor) {
			dom = editor.dom;
			schema = editor.schema;
		}

		function trimHtml(html) {
			var trimContentRegExp = new RegExp([
				'<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\\/span>', // Trim bogus spans like caret containers
				'\\s?(' + tempAttrs.join('|') + ')="[^"]+"' // Trim temporaty data-mce prefixed attributes like data-mce-selected
			].join('|'), 'gi');

			html = Zwsp.trim(html.replace(trimContentRegExp, ''));

			return html;
		}

		function trimContent(html) {
			var content = html;
			var bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
			var endTagIndex, index, matchLength, matches, shortEndedElements, schema = editor.schema;

			content = trimHtml(content);
			shortEndedElements = schema.getShortEndedElements();

			// Remove all bogus elements marked with "all"
			while ((matches = bogusAllRegExp.exec(content))) {
				index = bogusAllRegExp.lastIndex;
				matchLength = matches[0].length;

				if (shortEndedElements[matches[1]]) {
					endTagIndex = index;
				} else {
					endTagIndex = SaxParser.findEndTag(schema, content, index);
				}

				content = content.substring(0, index - matchLength) + content.substring(endTagIndex);
				bogusAllRegExp.lastIndex = index - matchLength;
			}

			return content;
		}

		/**
		 * Returns a trimmed version of the editor contents to be used for the undo level. This
		 * will remove any data-mce-bogus="all" marked elements since these are used for UI it will also
		 * remove the data-mce-selected attributes used for selection of objects and caret containers.
		 * It will keep all data-mce-bogus="1" elements since these can be used to place the caret etc and will
		 * be removed by the serialization logic when you save.
		 *
		 * @private
		 * @return {String} HTML contents of the editor excluding some internal bogus elements.
		 */
		function getTrimmedContent() {
			return trimContent(editor.getBody().innerHTML);
		}

		function addTempAttr(name) {
			if (Tools.inArray(tempAttrs, name) === -1) {
				htmlParser.addAttributeFilter(name, function(nodes, name) {
					var i = nodes.length;

					while (i--) {
						nodes[i].attr(name, null);
					}
				});

				tempAttrs.push(name);
			}
		}

		// Default DOM and Schema if they are undefined
		dom = dom || DOM;
		schema = schema || new Schema(settings);
		settings.entity_encoding = settings.entity_encoding || 'named';
		settings.remove_trailing_brs = "remove_trailing_brs" in settings ? settings.remove_trailing_brs : true;

		htmlParser = new DomParser(settings, schema);

		// Convert tabindex back to elements when serializing contents
		htmlParser.addAttributeFilter('data-mce-tabindex', function(nodes, name) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];
				node.attr('tabindex', node.attributes.map['data-mce-tabindex']);
				node.attr(name, null);
			}
		});

		// Convert move data-mce-src, data-mce-href and data-mce-style into nodes or process them if needed
		htmlParser.addAttributeFilter('src,href,style', function(nodes, name) {
			var i = nodes.length, node, value, internalName = 'data-mce-' + name;
			var urlConverter = settings.url_converter, urlConverterScope = settings.url_converter_scope, undef;

			while (i--) {
				node = nodes[i];

				value = node.attributes.map[internalName];
				if (value !== undef) {
					// Set external name to internal value and remove internal
					node.attr(name, value.length > 0 ? value : null);
					node.attr(internalName, null);
				} else {
					// No internal attribute found then convert the value we have in the DOM
					value = node.attributes.map[name];

					if (name === "style") {
						value = dom.serializeStyle(dom.parseStyle(value), node.name);
					} else if (urlConverter) {
						value = urlConverter.call(urlConverterScope, value, name, node.name);
					}

					node.attr(name, value.length > 0 ? value : null);
				}
			}
		});

		// Remove internal classes mceItem<..> or mceSelected
		htmlParser.addAttributeFilter('class', function(nodes) {
			var i = nodes.length, node, value;

			while (i--) {
				node = nodes[i];
				value = node.attr('class');

				if (value) {
					value = node.attr('class').replace(/(?:^|\s)mce-item-\w+(?!\S)/g, '');
					node.attr('class', value.length > 0 ? value : null);
				}
			}
		});

		// Remove bookmark elements
		htmlParser.addAttributeFilter('data-mce-type', function(nodes, name, args) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.attributes.map['data-mce-type'] === 'bookmark' && !args.cleanup) {
					node.remove();
				}
			}
		});

		htmlParser.addNodeFilter('noscript', function(nodes) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i].firstChild;

				if (node) {
					node.value = Entities.decode(node.value);
				}
			}
		});

		// Force script into CDATA sections and remove the mce- prefix also add comments around styles
		htmlParser.addNodeFilter('script,style', function(nodes, name) {
			var i = nodes.length, node, value, type;

			function trim(value) {
				/*jshint maxlen:255 */
				/*eslint max-len:0 */
				return value.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n')
						.replace(/^[\r\n]*|[\r\n]*$/g, '')
						.replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi, '')
						.replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, '');
			}

			while (i--) {
				node = nodes[i];
				value = node.firstChild ? node.firstChild.value : '';

				if (name === "script") {
					// Remove mce- prefix from script elements and remove default type since the user specified
					// a script element without type attribute
					type = node.attr('type');
					if (type) {
						node.attr('type', type == 'mce-no/type' ? null : type.replace(/^mce\-/, ''));
					}

					if (value.length > 0) {
						node.firstChild.value = '// <![CDATA[\n' + trim(value) + '\n// ]]>';
					}
				} else {
					if (value.length > 0) {
						node.firstChild.value = '<!--\n' + trim(value) + '\n-->';
					}
				}
			}
		});

		// Convert comments to cdata and handle protected comments
		htmlParser.addNodeFilter('#comment', function(nodes) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.value.indexOf('[CDATA[') === 0) {
					node.name = '#cdata';
					node.type = 4;
					node.value = node.value.replace(/^\[CDATA\[|\]\]$/g, '');
				} else if (node.value.indexOf('mce:protected ') === 0) {
					node.name = "#text";
					node.type = 3;
					node.raw = true;
					node.value = unescape(node.value).substr(14);
				}
			}
		});

		htmlParser.addNodeFilter('xml:namespace,input', function(nodes, name) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];
				if (node.type === 7) {
					node.remove();
				} else if (node.type === 1) {
					if (name === "input" && !("type" in node.attributes.map)) {
						node.attr('type', 'text');
					}
				}
			}
		});

		// Remove internal data attributes
		htmlParser.addAttributeFilter(
			'data-mce-src,data-mce-href,data-mce-style,' +
			'data-mce-selected,data-mce-expando,' +
			'data-mce-type,data-mce-resize',

			function(nodes, name) {
				var i = nodes.length;

				while (i--) {
					nodes[i].attr(name, null);
				}
			}
		);

		// Return public methods
		return {
			/**
			 * Schema instance that was used to when the Serializer was constructed.
			 *
			 * @field {tinymce.html.Schema} schema
			 */
			schema: schema,

			/**
			 * Adds a node filter function to the parser used by the serializer, the parser will collect the specified nodes by name
			 * and then execute the callback ones it has finished parsing the document.
			 *
			 * @example
			 * parser.addNodeFilter('p,h1', function(nodes, name) {
			 *		for (var i = 0; i < nodes.length; i++) {
			 *			console.log(nodes[i].name);
			 *		}
			 * });
			 * @method addNodeFilter
			 * @method {String} name Comma separated list of nodes to collect.
			 * @param {function} callback Callback function to execute once it has collected nodes.
			 */
			addNodeFilter: htmlParser.addNodeFilter,

			/**
			 * Adds a attribute filter function to the parser used by the serializer, the parser will
			 * collect nodes that has the specified attributes
			 * and then execute the callback ones it has finished parsing the document.
			 *
			 * @example
			 * parser.addAttributeFilter('src,href', function(nodes, name) {
			 *		for (var i = 0; i < nodes.length; i++) {
			 *			console.log(nodes[i].name);
			 *		}
			 * });
			 * @method addAttributeFilter
			 * @method {String} name Comma separated list of nodes to collect.
			 * @param {function} callback Callback function to execute once it has collected nodes.
			 */
			addAttributeFilter: htmlParser.addAttributeFilter,

			/**
			 * Serializes the specified browser DOM node into a HTML string.
			 *
			 * @method serialize
			 * @param {DOMNode} node DOM node to serialize.
			 * @param {Object} args Arguments option that gets passed to event handlers.
			 */
			serialize: function(node, args) {
				var self = this, impl, doc, oldDoc, htmlSerializer, content, rootNode;

				// Explorer won't clone contents of script and style and the
				// selected index of select elements are cleared on a clone operation.
				if (Env.ie && dom.select('script,style,select,map').length > 0) {
					content = node.innerHTML;
					node = node.cloneNode(false);
					dom.setHTML(node, content);
				} else {
					node = node.cloneNode(true);
				}

				// Nodes needs to be attached to something in WebKit/Opera
				// This fix will make DOM ranges and make Sizzle happy!
				impl = document.implementation;
				if (impl.createHTMLDocument) {
					// Create an empty HTML document
					doc = impl.createHTMLDocument("");

					// Add the element or it's children if it's a body element to the new document
					each(node.nodeName == 'BODY' ? node.childNodes : [node], function(node) {
						doc.body.appendChild(doc.importNode(node, true));
					});

					// Grab first child or body element for serialization
					if (node.nodeName != 'BODY') {
						node = doc.body.firstChild;
					} else {
						node = doc.body;
					}

					// set the new document in DOMUtils so createElement etc works
					oldDoc = dom.doc;
					dom.doc = doc;
				}

				args = args || {};
				args.format = args.format || 'html';

				// Don't wrap content if we want selected html
				if (args.selection) {
					args.forced_root_block = '';
				}

				// Pre process
				if (!args.no_events) {
					args.node = node;
					self.onPreProcess(args);
				}

				// Parse HTML
				rootNode = htmlParser.parse(trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node)), args);
				trimTrailingBr(rootNode);

				// Serialize HTML
				htmlSerializer = new Serializer(settings, schema);
				args.content = htmlSerializer.serialize(rootNode);

				// Replace all BOM characters for now until we can find a better solution
				if (!args.cleanup) {
					args.content = Zwsp.trim(args.content);
					args.content = args.content.replace(/\uFEFF/g, '');
				}

				// Post process
				if (!args.no_events) {
					self.onPostProcess(args);
				}

				// Restore the old document if it was changed
				if (oldDoc) {
					dom.doc = oldDoc;
				}

				args.node = null;

				return args.content;
			},

			/**
			 * Adds valid elements rules to the serializers schema instance this enables you to specify things
			 * like what elements should be outputted and what attributes specific elements might have.
			 * Consult the Wiki for more details on this format.
			 *
			 * @method addRules
			 * @param {String} rules Valid elements rules string to add to schema.
			 */
			addRules: function(rules) {
				schema.addValidElements(rules);
			},

			/**
			 * Sets the valid elements rules to the serializers schema instance this enables you to specify things
			 * like what elements should be outputted and what attributes specific elements might have.
			 * Consult the Wiki for more details on this format.
			 *
			 * @method setRules
			 * @param {String} rules Valid elements rules string.
			 */
			setRules: function(rules) {
				schema.setValidElements(rules);
			},

			onPreProcess: function(args) {
				if (editor) {
					editor.fire('PreProcess', args);
				}
			},

			onPostProcess: function(args) {
				if (editor) {
					editor.fire('PostProcess', args);
				}
			},

			/**
			 * Adds a temporary internal attribute these attributes will get removed on undo and
			 * when getting contents out of the editor.
			 *
			 * @method addTempAttr
			 * @param {String} name string
			 */
			addTempAttr: addTempAttr,

			// Internal
			trimHtml: trimHtml,
			getTrimmedContent: getTrimmedContent,
			trimContent: trimContent
		};
	};
});
