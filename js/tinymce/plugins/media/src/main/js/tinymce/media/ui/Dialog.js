define('tinymce.media.ui.Dialog', [
	'global!tinymce.util.Delay',
	'tinymce.media.core.HtmlToData',
	'tinymce.media.core.UpdateHtml',
	'tinymce.media.core.Service',
	'tinymce.media.core.Size',
	'global!tinymce.util.Tools',
	'global!tinymce.Env'
], function (Delay, HtmlToData, UpdateHtml, Service, Size, Tools, Env) {
	var embedChange = (Env.ie && Env.ie <= 8) ? 'onChange' : 'onInput';

	var handleError = function (editor) {
		return function (error) {
			var errorMessage = error && error.msg ?
				'Media embed handler error: ' + error.msg :
				'Media embed handler threw unknown error.';
			editor.notificationManager.open({type: 'error', text: errorMessage});
		};
	};

	var getData = function (editor) {
		var element = editor.selection.getNode();
		var dataEmbed = element.getAttribute('data-ephox-embed-iri');

		if (dataEmbed) {
			return {
				source1: dataEmbed,
				'data-ephox-embed-iri': dataEmbed,
				width: Size.getMaxWidth(element),
				height: Size.getMaxHeight(element)
			};
		}

		return element.getAttribute('data-mce-object') ?
			HtmlToData.htmlToData(editor.settings.media_scripts, editor.serializer.serialize(element, {selection: true})) :
			{};
	};

	var getSource = function (editor) {
		var elm = editor.selection.getNode();

		if (elm.getAttribute('data-mce-object') || elm.getAttribute('data-ephox-embed-iri')) {
			return editor.selection.getContent();
		}
	};

	var addEmbedHtml = function (win, editor) {
		return function (response) {
			var html = response.html;
			var embed = win.find('#embed')[0];
			var data = Tools.extend(HtmlToData.htmlToData(editor.settings.media_scripts, html), {source1: response.url});
			win.fromJSON(data);

			if (embed) {
				embed.value(html);
				updateSize(win);
			}
		};
	};

	var selectPlaceholder = function (editor, beforeObjects) {
		var i;
		var y;
		var afterObjects = editor.dom.select('img[data-mce-object]');

		// Find new image placeholder so we can select it
		for (i = 0; i < beforeObjects.length; i++) {
			for (y = afterObjects.length - 1; y >= 0; y--) {
				if (beforeObjects[i] === afterObjects[y]) {
					afterObjects.splice(y, 1);
				}
			}
		}

		editor.selection.select(afterObjects[0]);
	};

	var handleInsert = function (editor, html) {
		var beforeObjects = editor.dom.select('img[data-mce-object]');

		editor.insertContent(html);
		selectPlaceholder(editor, beforeObjects);
		editor.nodeChanged();
	};

	var submitForm = function (win, editor) {
		var data = win.toJSON();

		data.embed = UpdateHtml.updateHtml(data.embed, data);

		if (data.embed) {
			handleInsert(editor, data.embed);
		} else {
			Service.getEmbedHtml(editor, data)
				.then(function (response) {
					handleInsert(editor, response.html);
				})["catch"](handleError(editor));
		}
	};

	var populateMeta = function (win, meta) {
		Tools.each(meta, function (value, key) {
			win.find('#' + key).value(value);
		});
	};

	var syncSize = function (window) {
		var widthCtrl = window.find('#width')[0];
		var heightCtrl = window.find('#height')[0];
		if (widthCtrl && heightCtrl) {
			widthCtrl.state.set('oldVal', widthCtrl.value());
			heightCtrl.state.set('oldVal', heightCtrl.value());
		}
	};

	var updateSize = function (win) {
		var widthCtrl = win.find('#width')[0];
		var heightCtrl = win.find('#height')[0];
		var oldWidth = widthCtrl.state.get('oldVal');
		var oldHeight = heightCtrl.state.get('oldVal');
		var newWidth = widthCtrl.value();
		var newHeight = heightCtrl.value();

		if (win.find('#constrain')[0].checked() && oldWidth && oldHeight && newWidth && newHeight) {
			if (newWidth !== oldWidth) {
				newHeight = Math.round((newWidth / oldWidth) * newHeight);

				if (!isNaN(newHeight)) {
					heightCtrl.value(newHeight);
				}
			} else {
				newWidth = Math.round((newHeight / oldHeight) * newWidth);

				if (!isNaN(newWidth)) {
					widthCtrl.value(newWidth);
				}
			}
		}

		syncSize(win);
	};

	var showDialog = function (editor) {
		var win;
		var data;

		var generalFormItems = [
			{
				name: 'source1',
				type: 'filepicker',
				filetype: 'media',
				size: 40,
				autofocus: true,
				label: 'Source',
				onpaste: function () {
					setTimeout(function () {
						Service.getEmbedHtml(editor, win.toJSON())
							.then(
								addEmbedHtml(win, editor)
							)["catch"](handleError(editor));
					}, 1);
				},
				onchange: function (e) {
					Service.getEmbedHtml(editor, win.toJSON())
						.then(
							addEmbedHtml(win, editor)
						)["catch"](handleError(editor));

					populateMeta(win, e.meta);
				},
				onbeforecall: function (e) {
					e.meta = win.toJSON();
				}
			}
		];

		var advancedFormItems = [];

		var recalcSize = function () {
			updateSize(win);
			data = win.toJSON();
			win.find('#embed').value(UpdateHtml.updateHtml(data.embed, data));
		};

		if (editor.settings.media_alt_source !== false) {
			advancedFormItems.push({name: 'source2', type: 'filepicker', filetype: 'media', size: 40, label: 'Alternative source'});
		}

		if (editor.settings.media_poster !== false) {
			advancedFormItems.push({name: 'poster', type: 'filepicker', filetype: 'image', size: 40, label: 'Poster'});
		}

		if (editor.settings.media_dimensions !== false) {
			generalFormItems.push({
				type: 'container',
				label: 'Dimensions',
				layout: 'flex',
				align: 'center',
				spacing: 5,
				items: [
					{
						name: 'width', type: 'textbox', maxLength: 5, size: 5,
						onchange: recalcSize, ariaLabel: 'Width'
					},
					{type: 'label', text: 'x'},
					{
						name: 'height', type: 'textbox', maxLength: 5, size: 5,
						onchange: recalcSize, ariaLabel: 'Height'
					},
					{name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions'}
				]
			});
		}

		data = getData(editor);

		var embedTextBox = {
			id: 'mcemediasource',
			type: 'textbox',
			flex: 1,
			name: 'embed',
			value: getSource(editor),
			multiline: true,
			rows: 5,
			label: 'Source'
		};

		var updateValueOnChange = function () {
			data = Tools.extend({}, HtmlToData.htmlToData(editor.settings.media_scripts, this.value()));
			this.parent().parent().fromJSON(data);
		};

		embedTextBox[embedChange] = updateValueOnChange;

		win = editor.windowManager.open({
			title: 'Insert/edit media',
			data: data,
			bodyType: 'tabpanel',
			body: [
				{
					title: 'General',
					type: "form",
					items: generalFormItems
				},

				{
					title: 'Embed',
					type: "container",
					layout: 'flex',
					direction: 'column',
					align: 'stretch',
					padding: 10,
					spacing: 10,
					items: [
						{
							type: 'label',
							text: 'Paste your embed code below:',
							forId: 'mcemediasource'
						},
						embedTextBox
					]
				},

				{
					title: 'Advanced',
					type: "form",
					items: advancedFormItems
				}
			],
			onSubmit: function () {
				updateSize(win);
				submitForm(win, editor);
			}
		});

		syncSize(win);
	};

	return {
		showDialog: showDialog
	};
});