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
	'global!tinymce.ui.Factory',
	'tinymce/inlight/core/Actions'
], function (Tools, Factory, Actions) {
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

	var createQuickLinkForm = function (editor, hide) {
		var unlink = function () {
			Actions.unlink(editor);
			hide();
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
				Actions.createLink(editor, e.data.linkurl);
				hide();
			}
		});
	};

	return {
		createQuickLinkForm: createQuickLinkForm
	};
});
