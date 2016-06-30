/**
 * Forms.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define('tinymce/inlite/ui/Forms', [
	'global!tinymce.util.Tools',
	'global!tinymce.ui.Factory',
	'global!tinymce.util.Promise',
	'tinymce/inlite/core/Actions',
	'tinymce/inlite/core/UrlType'
], function (Tools, Factory, Promise, Actions, UrlType) {
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

	var askAboutPrefix = function (editor, href) {
		return new Promise(function (resolve) {
			editor.windowManager.confirm(
				'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?',
				function (result) {
					var output = result === true ? 'http://' + href : href;
					resolve(output);
				}
			);
		});
	};

	var convertLinkToAbsolute = function (editor, href) {
		return !UrlType.isAbsolute(href) && UrlType.isDomainLike(href) ? askAboutPrefix(editor, href) : Promise.resolve(href);
	};

	var createQuickLinkForm = function (editor, hide) {
		var unlink = function () {
			editor.focus();
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

				elm = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
				if (elm) {
					linkurl = editor.dom.getAttrib(elm, 'href');
				}

				this.fromJSON({
					linkurl: linkurl
				});

				toggleVisibility(this.find('#unlink'), elm);
			},
			onsubmit: function (e) {
				convertLinkToAbsolute(editor, e.data.linkurl).then(function (url) {
					Actions.createLink(editor, url);
					hide();
				});
			}
		});
	};

	return {
		createQuickLinkForm: createQuickLinkForm
	};
});
