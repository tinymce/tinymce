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
	'tinymce.media.core.Sanitize',
	'tinymce.media.core.UpdateHtml',
	'tinymce.media.core.Nodes'
], function (PluginManager, Dialog, Sanitize, UpdateHtml, Nodes) {
	var Plugin = function (editor) {
		editor.on('ResolveName', function (e) {
			var name;

			if (e.target.nodeType === 1 && (name = e.target.getAttribute("data-mce-object"))) {
				e.name = name;
			}
		});

		editor.on('preInit', function () {
			// Make sure that any messy HTML is retained inside these
			var specialElements = editor.schema.getSpecialElements();
			tinymce.each('video audio iframe object'.split(' '), function (name) {
				specialElements[name] = new RegExp('<\/' + name + '[^>]*>', 'gi');
			});

			// Allow elements
			//editor.schema.addValidElements('object[id|style|width|height|classid|codebase|*],embed[id|style|width|height|type|src|*],video[*],audio[*]');

			// Set allowFullscreen attribs as boolean
			var boolAttrs = editor.schema.getBoolAttrs();
			tinymce.each('webkitallowfullscreen mozallowfullscreen allowfullscreen'.split(' '), function (name) {
				boolAttrs[name] = {};
			});

			// Converts iframe, video etc into placeholder images
			editor.parser.addNodeFilter('iframe,video,audio,object,embed,script',
				Nodes.placeHolderConverter(editor));

			// Replaces placeholder images with real elements for video, object, iframe etc
			editor.serializer.addAttributeFilter('data-mce-object', function (nodes, name) {
				var i = nodes.length;
				var node;
				var realElm;
				var ai;
				var attribs;
				var innerHtml;
				var innerNode;
				var realElmName;
				var className;

				while (i--) {
					node = nodes[i];
					if (!node.parent) {
						continue;
					}

					realElmName = node.attr(name);
					realElm = new tinymce.html.Node(realElmName, 1);

					// Add width/height to everything but audio
					if (realElmName !== "audio" && realElmName !== "script") {
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

					if (realElmName === "script") {
						realElm.attr('type', 'text/javascript');
					}

					// Inject innerhtml
					innerHtml = node.attr('data-mce-html');
					if (innerHtml) {
						innerNode = new tinymce.html.Node('#text', 3);
						innerNode.raw = true;
						innerNode.value = Sanitize.sanitize(editor, unescape(innerHtml));
						realElm.append(innerNode);
					}

					node.replace(realElm);
				}
			});
		});

		editor.on('click keyup', function () {
			var selectedNode = editor.selection.getNode();

			if (selectedNode && editor.dom.hasClass(selectedNode, 'mce-preview-object')) {
				if (editor.dom.getAttrib(selectedNode, 'data-mce-selected')) {
					selectedNode.setAttribute('data-mce-selected', '2');
				}
			}
		});

		editor.on('ObjectSelected', function (e) {
			var objectType = e.target.getAttribute('data-mce-object');

			if (objectType === "audio" || objectType === "script") {
				e.preventDefault();
			}
		});

		editor.on('objectResized', function (e) {
			var target = e.target;
			var html;

			if (target.getAttribute('data-mce-object')) {
				html = target.getAttribute('data-mce-html');
				if (html) {
					html = unescape(html);
					target.setAttribute('data-mce-html', escape(
						UpdateHtml.updateHtml(html, {
							width: e.width,
							height: e.height
						})
					));
				}
			}
		});

		this.showDialog = function () {
			Dialog.showDialog(editor);
		};

		editor.addButton('media', {
			tooltip: 'Insert/edit video',
			onclick: this.showDialog,
			stateSelector: ['img[data-mce-object]', 'span[data-mce-object]', 'div[data-ephox-embed-iri]']
		});

		editor.addMenuItem('media', {
			icon: 'media',
			text: 'Media',
			onclick: this.showDialog,
			context: 'insert',
			prependToContext: true
		});

		editor.on('setContent', function () {
			// TODO: This shouldn't be needed there should be a way to mark bogus
			// elements so they are never removed except external save
			editor.$('span.mce-preview-object').each(function (index, elm) {
				var $elm = editor.$(elm);

				if ($elm.find('span.mce-shim', elm).length === 0) {
					$elm.append('<span class="mce-shim"></span>');
				}
			});
		});

		editor.addCommand('mceMedia', this.showDialog);
	};

	PluginManager.add('media', Plugin);

	return function () {};
});

