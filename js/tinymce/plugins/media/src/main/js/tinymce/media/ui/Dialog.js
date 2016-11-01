define('tinymce.media.ui.Dialog', [
	'global!tinymce',
	'global!tinymce.util.Delay',
	'tinymce.media.core.Data',
	'global!tinymce.util.Promise'
], function (tinymce, Delay, Data, Promise) {
	var embedChange = (tinymce.Env.ie && tinymce.Env.ie <= 8) ? 'onChange' : 'onInput';

	var checkEmbedHandler = function (editor, data) {
		return new Promise(function (resolve) {
			if ('media_embed_handler' in editor.settings) {
				editor.settings.media_embed_handler(data.source1, resolve);
			} else {
				resolve({html: Data.dataToHtml(editor, data), src: data.source1});
			}
		});
	};

	var addEmbedHtml = function (ctx, editor) {
		return function (response) {
			ctx.find('#embed').value(response.html);
			var data = tinymce.extend({}, Data.htmlToData(editor, response.html), {source1: response.src});
			ctx.fromJSON(data);
			updateSize(ctx);
		};
	};

	var submitForm = function (editor) {
		return function () {
			var i;
			var y;
			var data = this.toJSON();
			var beforeObjects = editor.dom.select('img[data-mce-object]');

			checkEmbedHandler(editor, data)
				.then(addEmbedHtml(this, editor));

			editor.insertContent(Data.dataToHtml(editor, data));

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
			editor.nodeChanged();
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
						checkEmbedHandler(editor, win.toJSON())
							.then(addEmbedHtml(win, editor));
					}, 50);
				},
				onchange: function (e) {
					checkEmbedHandler(editor, win.toJSON())
							.then(addEmbedHtml(win, editor));
					tinymce.each(e.meta, function (value, key) {
						win.find('#' + key).value(value);
					});
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
			data = tinymce.extend({}, data, {width: newWidth, height: newHeight});
			win.find('#embed').value(Data.updateHtml(data.embed, data));
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
						name: 'width', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize,
						onkeydown: Delay.debounce(recalcSize, 500), ariaLabel: 'Width'
					},
					{type: 'label', text: 'x'},
					{
						name: 'height', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize,
						onkeydown: Delay.debounce(recalcSize, 500), ariaLabel: 'Height'
					},
					{name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions'}
				]
			});
		}

		data = Data.getData(editor);

		var embedTextBox = {
			id: 'mcemediasource',
			type: 'textbox',
			flex: 1,
			name: 'embed',
			value: Data.getSource(editor),
			multiline: true,
			label: 'Source'
		};

		var updateValueOnChange = function () {
			data = tinymce.extend({}, Data.htmlToData(editor, this.value()));
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
	};

	return {
		showDialog: showDialog
	};
});