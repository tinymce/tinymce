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
	tinymce.dom.Serializer = function(settings, dom, schema) {
		var onPreProcess, onPostProcess, isIE = tinymce.isIE, each = tinymce.each, htmlParser;

		// Default DOM and Schema if they are undefined
		dom = dom || tinymce.DOM;
		schema = schema || new tinymce.html.Schema(settings);
		settings.entity_encoding = settings.entity_encoding || 'named';

		onPreProcess = new tinymce.util.Dispatcher(self);
		onPostProcess = new tinymce.util.Dispatcher(self);
		htmlParser = new tinymce.html.DomParser(settings, schema);

		// Convert move _mce_src, _mce_href and _mce_style into nodes or process them if needed
		htmlParser.addAttributeFilter('src,href,style', function(nodes, name) {
			var i = nodes.length, node, value, internalName = '_mce_' + name, urlConverter = settings.url_converter, urlConverterScope = settings.url_converter_scope;

			while (i--) {
				node = nodes[i];

				value = node.attributes.map[internalName];
				if (value) {
					// Set external name to internal value and remove internal
					node.attr(name, value);
					node.attr(internalName, null);
				} else {
					// No internal attribute found then convert the value we have in the DOM
					value = node.attributes.map[name];

					if (name === "style")
						value = dom.serializeStyle(dom.parseStyle(value), node.name);
					else if (urlConverter)
						value = urlConverter.call(urlConverterScope, value, name, node.name);

					node.attr(name, value);
				}
			}
		});

		// Remove internal classes mceItem<..>
		htmlParser.addAttributeFilter('class', function(nodes, name) {
			var i = nodes.length, node, value;

			while (i--) {
				node = nodes[i];
				value = node.attr('class').replace(/\s*mceItem\w+\s*/g, '');
				node.attr('class', value.length > 0 ? value : null);
			}
		});

		// Force script into CDATA sections and remove the mce- prefix also add comments around styles
		htmlParser.addNodeFilter('script,style', function(nodes, name) {
			var i = nodes.length, node, value;

			function trim(value) {
				return value.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n')
						.replace(/^[\r\n]*|[\r\n]*$/g, '')
						.replace(/^\s*(\/\/\s*<!--|\/\/\s*<!\[CDATA\[|<!--|<!\[CDATA\[)[\r\n]*/g, '')
						.replace(/\s*(\/\/\s*\]\]>|\/\/\s*-->|\]\]>|-->|\]\]-->)\s*$/g, '');
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

		// Remove <br> at end of li elements
		htmlParser.addNodeFilter('li', function(nodes, name) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i].lastChild;

				if (node && node.name === 'br')
					node.remove();
			}
		});

		// Convert comments to cdata
		htmlParser.addNodeFilter('#comment', function(nodes, name) {
			var i = nodes.length, node;

			while (i--) {
				node = nodes[i];

				if (node.value.indexOf('[CDATA[') === 0) {
					node.name = '#cdata';
					node.type = 4;
					node.value = node.value.replace(/^\[CDATA\[|\]\]$/g, '');
				}
			}
		});

		// Return public methods
		return {
			addNodeFilter : htmlParser.addNodeFilter,

			addAttributeFilter : htmlParser.addAttributeFilter,

			onPreProcess : onPreProcess,

			onPostProcess : onPostProcess,

			serialize : function(node, args) {
				var impl, selected, doc, oldDoc, htmlSerializer;

				// IE looses the selected attribute on option elements so we need to store it
				// See: http://support.microsoft.com/kb/829907
				if (isIE) {
					selected = [];
					each(node.getElementsByTagName('option'), function(node) {
						var value = dom.getAttrib(node, 'selected');

						selected.push(value ? value : null);
					});
				}

				node = node.cloneNode(true);

				// IE looses the selected attribute on option elements so we need to restore it
				if (isIE) {
					each(node.getElementsByTagName('option'), function(node, i) {
						dom.setAttrib(node, 'selected', selected[i]);
					});
				}

				// Nodes needs to be attached to something in WebKit/Opera
				// Older builds of Opera crashes if you attach the node to an document created dynamically
				// and since we can't feature detect a crash we need to sniff the acutal build number
				// This fix will make DOM ranges and make Sizzle happy!
				impl = node.ownerDocument.implementation;
				if (impl.createHTMLDocument && (tinymce.isOpera && opera.buildNumber() >= 1767)) {
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
					orgDoc = dom.doc;
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
					htmlParser.parse(args.getInner ? node.innerHTML : dom.getOuterHTML(node), args)
				);

				// Post process
				if (!args.no_events)
					onPostProcess.dispatch(self, args);

				// Restore the old document if it was changed
				if (oldDoc)
					dom.doc = oldDoc;

				args.node = null;

				return args.content;
			},

			addRules : function(rules) {
				schema.addValidElements(rules);
			},

			/**
			 * Sets the valid elements rules of the serializer this enables you to specify things like what elements should be
			 * outputted and what attributes specific elements might have.
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