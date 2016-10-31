define('tinymce.media.ui.Dialog', [
	'global!tinymce',
	'tinymce.media.core.Data'
], function (tinymce, Data) {
	var embedChange = (tinymce.Env.ie && tinymce.Env.ie <= 8) ? 'onChange' : 'onInput';

	var showDialog = 	function (editor) {
		var win;
		var width;
		var height;
		var data;

		var generalFormItems = [
			{
				name: 'source1',
				type: 'filepicker',
				filetype: 'media',
				size: 40,
				autofocus: true,
				label: 'Source',
				onchange: function (e) {
					tinymce.each(e.meta, function (value, key) {
						win.find('#' + key).value(value);
					});
				}
			}
		];

		var recalcSize = function (e) {
			var widthCtrl;
			var heightCtrl;
			var newWidth;
			var newHeight;

			widthCtrl = win.find('#width')[0];
			heightCtrl = win.find('#height')[0];

			newWidth = widthCtrl.value();
			newHeight = heightCtrl.value();

			if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
				if (e.control === widthCtrl) {
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

			width = newWidth;
			height = newHeight;
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
					{name: 'width', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Width'},
					{type: 'label', text: 'x'},
					{name: 'height', type: 'textbox', maxLength: 5, size: 3, onchange: recalcSize, ariaLabel: 'Height'},
					{name: 'constrain', type: 'checkbox', checked: true, text: 'Constrain proportions'}
				]
			});
		}

		data = Data.getData(editor);
		width = data.width;
		height = data.height;

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
			data = Data.htmlToData(editor, this.value());
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
					onShowTab: function () {
						data = Data.htmlToData(editor, this.next().find('#embed').value());
						this.fromJSON(data);
					},
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
					onShowTab: function () {
						this.find('#embed').value(Data.dataToHtml(editor, this.parent().toJSON()));
					},
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
			onSubmit: function () {
				var i;
				var y;
				var beforeObjects = editor.dom.select('img[data-mce-object]');

				editor.insertContent(Data.dataToHtml(editor, this.toJSON()));

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
			}
		});
	};

	return {
		showDialog: showDialog
	};
});