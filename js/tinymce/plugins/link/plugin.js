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

tinymce.PluginManager.add('link', function(editor) {
	function showDialog() {
		var data = {}, selection = editor.selection, dom = editor.dom, selectedElm, anchorElm, initialText;
		var win, linkListCtrl = null;

		function buildLinkList() {
			var linkListItems = [{text: 'None', value: ''}];

			tinymce.each(editor.settings.link_list, function(link) {
				linkListItems.push({
					text: link.text || link.title,
					value: link.value || link.url,
					menu: link.menu
				});
			});

			return linkListItems;
		}

		function updateText() {
			if (!initialText && data.text.length === 0) {
				this.parent().parent().find('#text')[0].value(this.value());
			}
		}

		selectedElm = selection.getNode();
		anchorElm = dom.getParent(selectedElm, 'a[href]');
		if (anchorElm) {
			selection.select(anchorElm);
		}

		data.text = initialText = selection.getContent({format: 'text'});
		data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';
		data.target = anchorElm ? dom.getAttrib(anchorElm, 'target') : '';

		if (selectedElm.nodeName == "IMG") {
			data.text = initialText = " ";
		}

		if (editor.settings.link_list) {
			linkListCtrl = {
				name: 'target',
				type: 'listbox',
				label: 'Link list',
				values: buildLinkList(),
				onselect: function(e) {
					var textCtrl = win.find('#text');

					if (!textCtrl.value() || (e.lastControl && textCtrl.value() == e.lastControl.text())) {
						textCtrl.value(e.control.text());
					}

					win.find('#href').value(e.control.value());
				}
			};
		}

		win = editor.windowManager.open({
			title: 'Insert link',
			data: data,
			body: [
				{name: 'text', type: 'textbox', size: 40, label: 'Text to display', onchange: function() {
					data.text = this.value();
				}},
				{
					name: 'href',
					type: 'filepicker',
					filetype: 'file',
					size: 40,
					autofocus: true,
					label: 'Url',
					onchange: updateText,
					onkeyup: updateText
				},
				linkListCtrl,
				{name: 'target', type: 'listbox', label: 'Target', values: [
					{text: 'None', value: ''},
					{text: 'New window', value: '_blank'}
				]}
			],
			onSubmit: function(e) {
				var data = e.data;

				if (!data.href) {
					editor.execCommand('unlink');
					return;
				}

				if (data.text != initialText) {
					if (anchorElm) {
						editor.focus();
						anchorElm.innerHTML = data.text;

						dom.setAttribs(anchorElm, {
							href: data.href,
							target: data.target ? data.target : null
						});

						selection.select(anchorElm);
					} else {
						editor.insertContent(dom.createHTML('a', {
							href: data.href,
							target: data.target ? data.target : null
						}, data.text));
					}
				} else {
					editor.execCommand('mceInsertLink', false, {
						href: data.href,
						target: data.target
					});
				}
			}
		});
	}

	editor.addButton('link', {
		icon: 'link',
		tooltip: 'Insert/edit link',
		shortcut: 'Ctrl+K',
		onclick: showDialog,
		stateSelector: 'a[href]'
	});

	editor.addButton('unlink', {
		icon: 'unlink',
		tooltip: 'Remove link(s)',
		cmd: 'unlink',
		stateSelector: 'a[href]'
	});

	editor.addShortcut('Ctrl+K', '', showDialog);

	this.showDialog = showDialog;

	editor.addMenuItem('link', {
		icon: 'link',
		text: 'Insert link',
		shortcut: 'Ctrl+K',
		onclick: showDialog,
		stateSelector: 'a[href]',
		context: 'insert',
		prependToContext: true
	});
});