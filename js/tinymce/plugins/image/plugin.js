/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('image', function(editor) {
	function createImageList(callback) {
		return function() {
			var imageList = editor.settings.image_list;

			if (typeof(imageList) == "string") {
				tinymce.util.XHR.send({
					url: imageList,
					success: function(text) {
						callback(tinymce.util.JSON.parse(text));
					}
				});
			} else {
				callback(imageList);
			}
		};
	}

	function showDialog(imageList) {
		var win, data, dom = editor.dom, imgElm = editor.selection.getNode();
		var width, height, imageListCtrl;

		function buildImageList() {
			var linkImageItems = [{text: 'None', value: ''}];

			tinymce.each(imageList, function(link) {
				linkImageItems.push({
					text: link.text || link.title,
					value: link.value || link.url,
					menu: link.menu
				});
			});

			return linkImageItems;
		}

		function recalcSize(e) {
			var widthCtrl, heightCtrl, newWidth, newHeight;

			widthCtrl = win.find('#width')[0];
			heightCtrl = win.find('#height')[0];

			newWidth = widthCtrl.value();
			newHeight = heightCtrl.value();

			if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
				if (e.control == widthCtrl) {
					newHeight = Math.round((newWidth / width) * newHeight);
					heightCtrl.value(newHeight);
				} else {
					newWidth = Math.round((newHeight / height) * newWidth);
					widthCtrl.value(newWidth);
				}
			}

			width = newWidth;
			height = newHeight;
		}

		function onSubmitForm() {
			function waitLoad(imgElm) {
				imgElm.onload = imgElm.onerror = function() {
					imgElm.onload = imgElm.onerror = null;
					editor.selection.select(imgElm);
					editor.nodeChanged();
				};
			}

			var data = win.toJSON();

			if (data.width === '') {
				data.width = null;
			}

			if (data.height === '') {
				data.height = null;
			}

			if (data.style === '') {
				data.style = null;
			}

			data = {
				src: data.src,
				alt: data.alt,
				width: data.width,
				height: data.height,
				style: data.style
			};

			if (!imgElm) {
				data.id = '__mcenew';
				editor.insertContent(dom.createHTML('img', data));
				imgElm = dom.get('__mcenew');
				dom.setAttrib(imgElm, 'id', null);
			} else {
				dom.setAttribs(imgElm, data);
			}

			waitLoad(imgElm);
		}

		function removePixelSuffix(value) {
			if (value) {
				value = value.replace(/px$/, '');
			}

			return value;
		}

		width = dom.getAttrib(imgElm, 'width');
		height = dom.getAttrib(imgElm, 'height');

		if (imgElm.nodeName == 'IMG' && !imgElm.getAttribute('data-mce-object')) {
			data = {
				src: dom.getAttrib(imgElm, 'src'),
				alt: dom.getAttrib(imgElm, 'alt'),
				width: width,
				height: height
			};
		} else {
			imgElm = null;
		}

		if (imageList) {
			imageListCtrl = {
				name: 'target',
				type: 'listbox',
				label: 'Image list',
				values: buildImageList(),
				onselect: function(e) {
					var altCtrl = win.find('#alt');

					if (!altCtrl.value() || (e.lastControl && altCtrl.value() == e.lastControl.text())) {
						altCtrl.value(e.control.text());
					}

					win.find('#src').value(e.control.value());
				}
			};
		}

		// General settings shared between simple and advanced dialogs
		var generalFormItems = [
			{name: 'src', type: 'filepicker', filetype: 'image', label: 'Source', autofocus: true},
			imageListCtrl,
			{name: 'alt', type: 'textbox', label: 'Image description'},
			{
				type: 'container',
				label: 'Dimensions',
				layout: 'flex',
				direction: 'row',
				align: 'center',
				spacing: 5,
				items: [
					{name: 'width', type: 'textbox', maxLength: 3, size: 3, onchange: recalcSize},
					{type: 'label', text: 'x'},
					{name: 'height', type: 'textbox', maxLength: 3, size: 3, onchange: recalcSize},
					{name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions'}
				]
			}
		];

		function updateStyle() {
			function addPixelSuffix(value) {
				if (value.length > 0 && /^[0-9]+$/.test(value)) {
					value += 'px';
				}

				return value;
			}

			var data = win.toJSON();
			var css = dom.parseStyle(data.style);

			delete css.margin;
			css['margin-top'] = css['margin-bottom'] = addPixelSuffix(data.vspace);
			css['margin-left'] = css['margin-right'] = addPixelSuffix(data.hspace);
			css['border-width'] = addPixelSuffix(data.border);

			win.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
		}

		if (editor.settings.image_advtab) {
			// Parse styles from img
			if (imgElm) {
				data.hspace = removePixelSuffix(imgElm.style.marginLeft || imgElm.style.marginRight);
				data.vspace = removePixelSuffix(imgElm.style.marginTop || imgElm.style.marginBottom);
				data.border = removePixelSuffix(imgElm.style.borderWidth);
				data.style = editor.dom.serializeStyle(editor.dom.parseStyle(editor.dom.getAttrib(imgElm, 'style')));
			}

			// Advanced dialog shows general+advanced tabs
			win = editor.windowManager.open({
				title: 'Edit image',
				data: data,
				bodyType: 'tabpanel',
				body: [
					{
						title: 'General',
						type: 'form',
						items: generalFormItems
					},

					{
						title: 'Advanced',
						type: 'form',
						pack: 'start',
						items: [
							{
								label: 'Style',
								name: 'style',
								type: 'textbox'
							},
							{
								type: 'form',
								layout: 'grid',
								packV: 'start',
								columns: 2,
								padding: 0,
								alignH: ['left', 'right'],
								defaults: {
									type: 'textbox',
									maxWidth: 50,
									onchange: updateStyle
								},
								items: [
									{label: 'Vertical space', name: 'vspace'},
									{label: 'Horizontal space', name: 'hspace'},
									{label: 'Border', name: 'border'}
								]
							}
						]
					}
				],
				onSubmit: onSubmitForm
			});
		} else {
			// Simple default dialog
			win = editor.windowManager.open({
				title: 'Edit image',
				data: data,
				body: generalFormItems,
				onSubmit: onSubmitForm
			});
		}
	}

	editor.addButton('image', {
		icon: 'image',
		tooltip: 'Insert/edit image',
		onclick: createImageList(showDialog),
		stateSelector: 'img:not([data-mce-object])'
	});

	editor.addMenuItem('image', {
		icon: 'image',
		text: 'Insert image',
		onclick: createImageList(showDialog),
		context: 'insert',
		prependToContext: true
	});
});