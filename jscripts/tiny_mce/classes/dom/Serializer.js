/**
 * Serializer.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class is used to serialize DOM trees into a string. Consult the TinyMCE Wiki API for more details and examples on how to use this class. 
	 *
	 * @class tinymce.dom.Serializer
	 */

	/**
	 * Constucts a new DOM serializer class.
	 *
	 * @constructor
	 * @method Serializer
	 * @param {Object} settings Serializer settings object.
	 * @param {tinymce.dom.DOMUtils} dom DOMUtils instance reference.
	 * @param {tinymce.html.Schema} schema Optional schema reference.
	 */
	tinymce.dom.Serializer = function(settings, dom, schema) {
		var onPreProcess, onPostProcess, isIE = tinymce.isIE, each = tinymce.each, htmlParser;

		// Support the old apply_source_formatting option
		if (!settings.apply_source_formatting)
			settings.indent = false;

		// Default DOM and Schema if they are undefined
		dom = dom || tinymce.DOM;
		schema = schema || new tinymce.html.Schema(settings);
		settings.entity_encoding = settings.entity_encoding || 'named';
		settings.remove_trailing_brs = "remove_trailing_brs" in settings ? settings.remove_trailing_brs : true;

		/**
		 * This event gets executed before a HTML fragment gets serialized into a HTML string. This event enables you to do modifications to the DOM before the serialization occurs. It's important to know that the element that is getting serialized is cloned so it's not inside a document.
		 *
		 * @event onPreProcess
		 * @param {tinymce.dom.Serializer} sender object/Serializer instance that is serializing an element.
		 * @param {Object} args Object containing things like the current node.
		 * @example
		 * // Adds an observer to the onPreProcess event
		 * serializer.onPreProcess.add(function(se, o) {
		 *     // Add a class to each paragraph
		 *     se.dom.addClass(se.dom.select('p', o.node), 'myclass');
		 * });
		 */
		onPreProcess = new tinymce.util.Dispatcher(self);

		/**
		 * This event gets executed after a HTML fragment has been serialized into a HTML string. This event enables you to do modifications to the HTML string like regexp replaces etc. 
		 *
		 * @event onPreProcess
		 * @param {tinymce.dom.Serializer} sender object/Serializer instance that is serializing an element.
		 * @param {Object} args Object containing things like the current contents. 
		 * @example
		 * // Adds an observer to the onPostProcess event
		 * serializer.onPostProcess.add(function(se, o) {
		 *    // Remove all paragraphs and replace with BR
		 *    o.content = o.content.replace(/<p[^>]+>|<p>/g, '');
		 *    o.content = o.content.replace(/<\/p>/g, '<br />');
		 * });
		 */
		onPostProcess = new tinymce.util.Dispatcher(self);

		htmlParser = new tinymce.html.DomParser(settings, schema);

		// Convert move data-mce-src, data-mce-href and data-mce-style into nodes or process them if needed
		htmlParser.addAttributeFilter('src,href,style', function(nodes, name) {
			var i = nodes.length, node, value, internalName = 'data-mce-' + name, urlConverter = settings.url_converter, urlConverterScope = settings.url_converter_scope, undef;

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

					if (name === "style")
						value = dom.serializeStyle(dom.parseStyle(value), node.name);
					else if (urlConverter)
						value = urlConverter.call(urlConverterScope, value, name, node.name);

					node.attr(name, value.length > 0 ? value : null);
				}
			}
		});

		// Remove internal classes mceItem<..>
		htmlParser.addAttributeFilter('class', function(nodes, name) {
			var i = nodes.length, node, value;

			while (i--) {
				node = nodes[i];
				value = node.attr('class').replace(/\s*mce(Item\w+|Selected)\s*/g, '');
				node.attr('class', value.length > 0 ? value : null);
			}
		});

		// Remove bookmark elements
		htmlParser.addAttributeFilter('data-mce-type', function(nodes, name, args) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.attributes.map['data-mce-type'] === 'bookmark' && !args.cleanup)
					node.remove();
			}
		});

		// Force script into CDATA sections and remove the mce- prefix also add comments around styles
		htmlParser.addNodeFilter('script,style', function(nodes, name) {
			var i = nodes.length, node, value;

			function trim(value) {
				return value.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n')
						.replace(/^[\r\n]*|[\r\n]*$/g, '')
						.replace(/^\s*((<!--)?(\s*\/\/)?\s*<!\[CDATA\[|(<!--\s*)?\/\*\s*<!\[CDATA\[\s*\*\/|(\/\/)?\s*<!--|\/\*\s*<!--\s*\*\/)\s*[\r\n]*/gi, '')
						.replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, '');
			};

			while (i--) {
				node = nodes[i];
				value = node.firstChild ? node.firstChild.value : '';

				if (name === "script") {
					// Remove mce- prefix from script elements
					node.attr('type', (node.attr('type') || 'text/javascript').replace(/^mce\-/, ''));

					if (value.length > 0)
						node.firstChild.value = '// <![CDATA[\n' + trim(value) + '\n// ]]>';
				} else {
					if (value.length > 0)
						node.firstChild.value = '<!--\n' + trim(value) + '\n-->';
				}
			}
		});

		// Convert comments to cdata and handle protected comments
		htmlParser.addNodeFilter('#comment', function(nodes, name) {
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
				if (node.type === 7)
					node.remove();
				else if (node.type === 1) {
					if (name === "input" && !("type" in node.attributes.map))
						node.attr('type', 'text');
				}
			}
		});

		// Fix list elements, TODO: Replace this later
		if (settings.fix_list_elements) {
			htmlParser.addNodeFilter('ul,ol', function(nodes, name) {
				var i = nodes.length, node, parentNode;

				while (i--) {
					node = nodes[i];
					parentNode = node.parent;

					if (parentNode.name === 'ul' || parentNode.name === 'ol') {
						if (node.prev && node.prev.name === 'li') {
							node.prev.append(node);
						}
					}
				}
			});
		}

		// Remove internal data attributes
		htmlParser.addAttributeFilter('data-mce-src,data-mce-href,data-mce-style', function(nodes, name) {
			var i = nodes.length;

			while (i--) {
				nodes[i].attr(name, null);
			}
		});

		// Return public methods
		return {
			/**
			 * Schema instance that was used to when the Serializer was constructed.
			 *
			 * @field {tinymce.html.Schema} schema
			 */
			schema : schema,

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
			addNodeFilter : htmlParser.addNodeFilter,

			/**
			 * Adds a attribute filter function to the parser used by the serializer, the parser will collect nodes that has the specified attributes
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
			addAttributeFilter : htmlParser.addAttributeFilter,

			/**
			 * Fires when the Serializer does a preProcess on the contents.
			 *
			 * @event onPreProcess
			 * @param {tinymce.Editor} sender Editor instance.
			 * @param {Object} obj PreProcess object.
			 * @option {Node} node DOM node for the item being serialized.
			 * @option {String} format The specified output format normally "html".
			 * @option {Boolean} get Is true if the process is on a getContent operation.
			 * @option {Boolean} set Is true if the process is on a setContent operation.
			 * @option {Boolean} cleanup Is true if the process is on a cleanup operation.
			 */
			onPreProcess : onPreProcess,

			/**
			 * Fires when the Serializer does a postProcess on the contents.
			 *
			 * @event onPostProcess
			 * @param {tinymce.Editor} sender Editor instance.
			 * @param {Object} obj PreProcess object.
			 */
			onPostProcess : onPostProcess,

			/**
			 * Serializes the specified browser DOM node into a HTML string.
			 *
			 * @method serialize
			 * @param {DOMNode} node DOM node to serialize.
			 * @param {Object} args Arguments option that gets passed to event handlers.
			 */
			serialize : function(node, args) {
				var impl, doc, oldDoc, htmlSerializer, content;

				// Explorer won't clone contents of script and style and the
				// selected index of select elements are cleared on a clone operation.
				if (isIE && dom.select('script,style,select,map').length > 0) {
					content = node.innerHTML;
					node = node.cloneNode(false);
					dom.setHTML(node, content);
				} else
					node = node.cloneNode(true);

				// Nodes needs to be attached to something in WebKit/Opera
				// Older builds of Opera crashes if you attach the node to an document created dynamically
				// and since we can't feature detect a crash we need to sniff the acutal build number
				// This fix will make DOM ranges and make Sizzle happy!
				impl = node.ownerDocument.implementation;
				if (impl.createHTMLDocument) {
					// Create an empty HTML document
					doc = impl.createHTMLDocument("");

					// Add the element or it's children if it's a body element to the new document
					each(node.nodeName == 'BODY' ? node.childNodes : [node], function(node) {
						doc.body.appendChild(doc.importNode(node, true));
					});

					// Grab first child or body element for serialization
					if (node.nodeName != 'BODY')
						node = doc.body.firstChild;
					else
						node = doc.body;

					// set the new document in DOMUtils so createElement etc works
					oldDoc = dom.doc;
					dom.doc = doc;
				}

				args = args || {};
				args.format = args.format || 'html';

				// Pre process
				if (!args.no_events) {
					args.node = node;
					onPreProcess.dispatch(self, args);
				}

				// Setup serializer
				htmlSerializer = new tinymce.html.Serializer(settings, schema);

				// Parse and serialize HTML
				args.content = htmlSerializer.serialize(
					htmlParser.parse(args.getInner ? node.innerHTML : tinymce.trim(dom.getOuterHTML(node), args), args)
				);

				// Replace all BOM characters for now until we can find a better solution
				if (!args.cleanup)
					args.content = args.content.replace(/\uFEFF|\u200B/g, '');

				// Post process
				if (!args.no_events)
					onPostProcess.dispatch(self, args);

				// Restore the old document if it was changed
				if (oldDoc)
					dom.doc = oldDoc;

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
			addRules : function(rules) {
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
			setRules : function(rules) {
				schema.setValidElements(rules);
			}
		};
	};
})(tinymce);