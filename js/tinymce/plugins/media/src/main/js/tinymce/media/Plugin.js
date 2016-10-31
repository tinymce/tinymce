/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint maxlen:255 */
/*eslint max-len:0 */
/*global tinymce:true */

define('tinymce.media.Plugin', [
	'global!tinymce.PluginManager',
	'tinymce.media.ui.Dialog',
	'tinymce.media.core.Data'
], function (PluginManager, Dialog, Data) {
	PluginManager.add('media', function(editor) {

		function sanitize(html) {
			if (editor.settings.media_filter_html === false) {
				return html;
			}

			var writer = new tinymce.html.Writer(), blocked;

			new tinymce.html.SaxParser({
				validate: false,
				allow_conditional_comments: false,
				special: 'script,noscript',

				comment: function(text) {
					writer.comment(text);
				},

				cdata: function(text) {
					writer.cdata(text);
				},

				text: function(text, raw) {
					writer.text(text, raw);
				},

				start: function(name, attrs, empty) {
					blocked = true;

					if (name == 'script' || name == 'noscript') {
						return;
					}

					for (var i = 0; i < attrs.length; i++) {
						if (attrs[i].name.indexOf('on') === 0) {
							return;
						}

						if (attrs[i].name == 'style') {
							attrs[i].value = editor.dom.serializeStyle(editor.dom.parseStyle(attrs[i].value), name);
						}
					}

					writer.start(name, attrs, empty);
					blocked = false;
				},

				end: function(name) {
					if (blocked) {
						return;
					}

					writer.end(name);
				}
			}, new tinymce.html.Schema({})).parse(html);

			return writer.getContent();
		}

		editor.on('ResolveName', function(e) {
			var name;

			if (e.target.nodeType == 1 && (name = e.target.getAttribute("data-mce-object"))) {
				e.name = name;
			}
		});

		function retainAttributesAndInnerHtml(sourceNode, targetNode) {
			var attrName, attrValue, attribs, ai, innerHtml;

			// Prefix all attributes except width, height and style since we
			// will add these to the placeholder
			attribs = sourceNode.attributes;
			ai = attribs.length;
			while (ai--) {
				attrName = attribs[ai].name;
				attrValue = attribs[ai].value;

				if (attrName !== "width" && attrName !== "height" && attrName !== "style") {
					if (attrName == "data" || attrName == "src") {
						attrValue = editor.convertURL(attrValue, attrName);
					}

					targetNode.attr('data-mce-p-' + attrName, attrValue);
				}
			}

			// Place the inner HTML contents inside an escaped attribute
			// This enables us to copy/paste the fake object
			innerHtml = sourceNode.firstChild && sourceNode.firstChild.value;
			if (innerHtml) {
				targetNode.attr("data-mce-html", escape(sanitize(innerHtml)));
				targetNode.firstChild = null;
			}
		}

		function createPlaceholderNode(node) {
			var placeHolder, name = node.name;

			placeHolder = new tinymce.html.Node('img', 1);
			placeHolder.shortEnded = true;

			retainAttributesAndInnerHtml(node, placeHolder);

			placeHolder.attr({
				width: node.attr('width') || "300",
				height: node.attr('height') || (name == "audio" ? "30" : "150"),
				style: node.attr('style'),
				src: tinymce.Env.transparentSrc,
				"data-mce-object": name,
				"class": "mce-object mce-object-" + name
			});

			return placeHolder;
		}

		function createPreviewNode(node) {
			var previewWrapper, previewNode, shimNode, name = node.name;

			previewWrapper = new tinymce.html.Node('span', 1);
			previewWrapper.attr({
				contentEditable: 'false',
				style: node.attr('style'),
				"data-mce-object": name,
				"class": "mce-preview-object mce-object-" + name
			});

			retainAttributesAndInnerHtml(node, previewWrapper);

			previewNode = new tinymce.html.Node(name, 1);
			previewNode.attr({
				src: node.attr('src'),
				allowfullscreen: node.attr('allowfullscreen'),
				width: node.attr('width') || "300",
				height: node.attr('height') || (name == "audio" ? "30" : "150"),
				frameborder: '0'
			});

			shimNode = new tinymce.html.Node('span', 1);
			shimNode.attr('class', 'mce-shim');

			previewWrapper.append(previewNode);
			previewWrapper.append(shimNode);

			return previewWrapper;
		}

		editor.on('preInit', function() {
			// Make sure that any messy HTML is retained inside these
			var specialElements = editor.schema.getSpecialElements();
			tinymce.each('video audio iframe object'.split(' '), function(name) {
				specialElements[name] = new RegExp('<\/' + name + '[^>]*>', 'gi');
			});

			// Allow elements
			//editor.schema.addValidElements('object[id|style|width|height|classid|codebase|*],embed[id|style|width|height|type|src|*],video[*],audio[*]');

			// Set allowFullscreen attribs as boolean
			var boolAttrs = editor.schema.getBoolAttrs();
			tinymce.each('webkitallowfullscreen mozallowfullscreen allowfullscreen'.split(' '), function(name) {
				boolAttrs[name] = {};
			});

			// Converts iframe, video etc into placeholder images
			editor.parser.addNodeFilter('iframe,video,audio,object,embed,script', function(nodes) {
				var i = nodes.length, node, placeHolder, videoScript;

				while (i--) {
					node = nodes[i];
					if (!node.parent) {
						continue;
					}

					if (node.parent.attr('data-mce-object')) {
						continue;
					}

					if (node.name == 'script') {
						videoScript = Data.getVideoScriptMatch(editor, node.attr('src'));
						if (!videoScript) {
							continue;
						}
					}

					if (videoScript) {
						if (videoScript.width) {
							node.attr('width', videoScript.width.toString());
						}

						if (videoScript.height) {
							node.attr('height', videoScript.height.toString());
						}
					}

					if (node.name == 'iframe' && editor.settings.media_live_embeds !== false && tinymce.Env.ceFalse) {
						placeHolder = createPreviewNode(node);
					} else {
						placeHolder = createPlaceholderNode(node);
					}

					node.replace(placeHolder);
				}
			});

			// Replaces placeholder images with real elements for video, object, iframe etc
			editor.serializer.addAttributeFilter('data-mce-object', function(nodes, name) {
				var i = nodes.length, node, realElm, ai, attribs, innerHtml, innerNode, realElmName, className;

				while (i--) {
					node = nodes[i];
					if (!node.parent) {
						continue;
					}

					realElmName = node.attr(name);
					realElm = new tinymce.html.Node(realElmName, 1);

					// Add width/height to everything but audio
					if (realElmName != "audio" && realElmName != "script") {
						className = node.attr('class');
						if (className && className.indexOf('mce-preview-object') !== -1) {
							realElm.attr({
								width: node.firstChild.attr('width'),
								height: node.firstChild.attr('height')
							});
						} else {
							realElm.attr({
								width: node.attr('width'),
								height: node.attr('height')
							});
						}
					}

					realElm.attr({
						style: node.attr('style')
					});

					// Unprefix all placeholder attributes
					attribs = node.attributes;
					ai = attribs.length;
					while (ai--) {
						var attrName = attribs[ai].name;

						if (attrName.indexOf('data-mce-p-') === 0) {
							realElm.attr(attrName.substr(11), attribs[ai].value);
						}
					}

					if (realElmName == "script") {
						realElm.attr('type', 'text/javascript');
					}

					// Inject innerhtml
					innerHtml = node.attr('data-mce-html');
					if (innerHtml) {
						innerNode = new tinymce.html.Node('#text', 3);
						innerNode.raw = true;
						innerNode.value = sanitize(unescape(innerHtml));
						realElm.append(innerNode);
					}

					node.replace(realElm);
				}
			});
		});

		editor.on('click keyup', function() {
			var selectedNode = editor.selection.getNode();

			if (selectedNode && editor.dom.hasClass(selectedNode, 'mce-preview-object')) {
				if (editor.dom.getAttrib(selectedNode, 'data-mce-selected')) {
					selectedNode.setAttribute('data-mce-selected', '2');
				}
			}
		});

		editor.on('ObjectSelected', function(e) {
			var objectType = e.target.getAttribute('data-mce-object');

			if (objectType == "audio" || objectType == "script") {
				e.preventDefault();
			}
		});

		editor.on('objectResized', function(e) {
			var target = e.target, html;

			if (target.getAttribute('data-mce-object')) {
				html = target.getAttribute('data-mce-html');
				if (html) {
					html = unescape(html);
					target.setAttribute('data-mce-html', escape(
						Data.updateHtml(html, {
							width: e.width,
							height: e.height
						})
					));
				}
			}
		});

		this.showDialog = Dialog.showDialog.bind(null, editor);

		editor.addButton('media', {
			tooltip: 'Insert/edit video',
			onclick: this.showDialog,
			stateSelector: ['img[data-mce-object]', 'span[data-mce-object]']
		});

		editor.addMenuItem('media', {
			icon: 'media',
			text: 'Media',
			onclick: this.showDialog,
			context: 'insert',
			prependToContext: true
		});

		editor.on('setContent', function() {
			// TODO: This shouldn't be needed there should be a way to mark bogus
			// elements so they are never removed except external save
			editor.$('span.mce-preview-object').each(function(index, elm) {
				var $elm = editor.$(elm);

				if ($elm.find('span.mce-shim', elm).length === 0) {
					$elm.append('<span class="mce-shim"></span>');
				}
			});
		});

		editor.addCommand('mceMedia', this.showDialog);
	});

	return function () {};
});

