/**
 * Forms.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlight/ui/Forms', [
		'global!tinymce.util.Tools',
	'global!tinymce.ui.Factory'
], function (Tools, Factory) {
	var focusFirstTextBox = function (form) {
		form.find('textbox').eq(0).each(function (ctrl) {
			ctrl.focus();
		});
	};

	var createForm = function (name, spec) {
		var form = Factory.create(
			Tools.extend({
				type: 'form',
				layout: 'flex',
				direction: 'row',
				padding: 5,
				name: name,
				spacing: 3
			}, spec)
		);

		form.on('show', function () {
			focusFirstTextBox(form);
		});

		return form;
	};

	var toggleVisibility = function (ctrl, state) {
		return state ? ctrl.show() : ctrl.hide();
	};

	var createQuickLinkForm = function (editor) {
		var unlink = function () {
			editor.execCommand('unlink');
		};

		return createForm('quicklink', {
			items: [
				{type: 'button', name: 'unlink', icon: 'unlink', onclick: unlink, tooltip: 'Remove link'},
				{type: 'textbox', name: 'linkurl', placeholder: 'Paste or type a link'},
				{type: 'button', icon: 'checkmark', subtype: 'primary', tooltip: 'Ok', onclick: 'submit'}
			],
			onshow: function () {
				var elm, linkurl = '';

				elm = editor.selection.getStart();
				if (elm.nodeName === 'A') {
					linkurl = editor.dom.getAttrib(elm, 'href');
				}

				this.fromJSON({
					linkurl: linkurl
				});

				toggleVisibility(this.find('#unlink'), elm.nodeName === 'A');
			},
			onsubmit: function (e) {
				var elm, linkurl;

				linkurl = e.data.linkurl;
				if (linkurl.trim().length === 0) {
					unlink();
					return;
				}

				elm = editor.selection.getStart();
				if (elm.nodeName === 'A') {
					editor.dom.setAttrib(elm, 'href', linkurl);
					editor.focus();
				} else {
					editor.execCommand('mceInsertLink', false, {href: linkurl});
				}
			}
		});
	};

	var createQuickImageForm = function (editor) {
		return createForm('quickimage', {
			items: [
				{type: 'textbox', name: 'imageurl', placeholder: 'Image url'},
				{type: 'button', icon: 'checkmark', subtype: 'primary', tooltip: 'Ok', onclick: 'submit'}
			],
			onshow: function () {
				this.fromJSON({
					imageurl: ''
				});
			},
			onsubmit: function (e) {
				editor.execCommand('mceInsertContent', false, editor.dom.createHTML('img', {src: e.data.imageurl}));
				editor.selection.collapse(false);
			}
		});
	};

	return {
		createQuickLinkForm: createQuickLinkForm,
		createQuickImageForm: createQuickImageForm
	};
});
