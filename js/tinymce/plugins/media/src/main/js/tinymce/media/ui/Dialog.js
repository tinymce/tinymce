define('tinymce.media.ui.Dialog', [
	'global!tinymce.util.Delay',
	'tinymce.media.core.HtmlToData',
	'tinymce.media.core.UpdateHtml',
	'tinymce.media.core.Service',
	'global!tinymce.util.Tools',
	'global!tinymce.Env'
], function (Delay, HtmlToData, UpdateHtml, Service, Tools, Env) {
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
			return {source1: dataEmbed, 'data-ephox-embed-iri': dataEmbed};
		}
		return element.getAttribute('data-mce-object') ?
			HtmlToData.htmlToData(editor.settings.media_scripts, editor.serializer.serialize(element, {selection: true})) :
			{};
	};
	var getSource = function (editor) {
		var elm = editor.selection.getNode();

		if (elm.getAttribute('data-mce-object')) {
			return editor.selection.getContent();
		}
	};

	var addEmbedHtml = function (ctx, editor) {
		return function (response) {
			var html = response.html;
			ctx.find('#embed').value(html);
			var data = Tools.extend(HtmlToData.htmlToData(editor.settings.media_scripts, html), {source1: response.url});
			ctx.fromJSON(data);
			updateSize(ctx);
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

	var submitForm = function (editor) {
		return function () {
			var data = this.toJSON();

			Service.getEmbedHtml(editor, data)
				.then(function (response) {
					var beforeObjects = editor.dom.select('img[data-mce-object]');
					var html = data.embed ? data.embed : response.html;

					editor.insertContent(html);

					selectPlaceholder(editor, beforeObjects);
					editor.nodeChanged();
				})
				.catch(handleError(editor)); // eslint-disable-line
		};
	};

	var updateSize = function (window) {
		var widthCtrl = window.find('#width')[0];
		var heightCtrl = window.find('#height')[0];
		if (widthCtrl && heightCtrl) {
			widthCtrl.state.set('oldVal', widthCtrl.value());
			heightCtrl.state.set('oldVal', heightCtrl.value());
		}
	};

	var populateMeta = function (win, meta) {
		Tools.each(meta, function (value, key) {
			win.find('#' + key).value(value);
		});
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
							.then(addEmbedHtml(win, editor))
							.catch(handleError(editor)); // eslint-disable-line
					}, 1);
				},
				onchange: function (e) {
					Service.getEmbedHtml(editor, win.toJSON())
						.then(addEmbedHtml(win, editor))
						.catch(handleError(editor)); // eslint-disable-line

					populateMeta(win, e.meta);
				},
				onbeforecall: function (e) {
					e.meta = win.toJSON();
				}
			}
		];

		var recalcSize = function (e) {
			var widthCtrl = win.find('#width')[0];
			var heightCtrl = win.find('#height')[0];
			var width = widthCtrl.state.get('oldVal');
			var height = heightCtrl.state.get('oldVal');

			var newWidth = widthCtrl.value();
			var newHeight = heightCtrl.value();

			if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
				if (e.control.name() === widthCtrl.name()) {
					newHeight = Math.round((newWidth / width) * newHeight);

					if (!isNaN(newHeight)) {
						heightCtrl.value(newHeight);
					}
				} else {
					newWidth = Math.round((newHeight / height) * newWidth);

					if (!isNaN(newWidth)) {
						widthCtrl.value(newWidth);
					}
				}
			}
			data = win.toJSON();
			win.find('#embed').value(UpdateHtml.updateHtml(data.embed, data));
			updateSize(win);
		};

		if (editor.settings.media_alt_source !== false) {
			generalFormItems.push({name: 'source2', type: 'filepicker', filetype: 'media', size: 40, label: 'Alternative source'});
		}

		if (editor.settings.media_poster !== false) {
			generalFormItems.push({name: 'poster', type: 'filepicker', filetype: 'image', size: 40, label: 'Poster'});
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
						name: 'width', type: 'textbox', maxLength: 5, size: 3,
						onchange: recalcSize, ariaLabel: 'Width'
					},
					{type: 'label', text: 'x'},
					{
						name: 'height', type: 'textbox', maxLength: 5, size: 3,
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
			label: 'Source'
		};

		var updateValueOnChange = function () {
			data = Tools.extend({}, HtmlToData.htmlToData(editor.settings.media_scripts, this.value()));
			this.parent().parent().fromJSON(data);
		};

		embedTextBox[embedChange] = updateValueOnChange;

		win = editor.windowManager.open({
			title: 'Insert/edit video',
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
				}
			],
			onSubmit: submitForm(editor)
		});

		updateSize(win);
	};

	return {
		showDialog: showDialog
	};
});