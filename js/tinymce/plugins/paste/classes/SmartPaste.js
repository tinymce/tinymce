/**
 * SmartPaste.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Tries to be smart depending on what the user pastes if it looks like an url
 * it will make a link out of the current selection. If it's an image url that looks
 * like an image it will check if it's an image and insert it as an image.
 *
 * @class tinymce.pasteplugin.SmartPaste
 * @private
 */
define("tinymce/pasteplugin/SmartPaste", [
	"tinymce/util/Promise",
	"tinymce/pasteplugin/ImageLoader",
	"tinymce/pasteplugin/PromiseUtils"
], function (Promise, ImageLoader, PromiseUtils) {
	var resolve = PromiseUtils.resolve, reject = PromiseUtils.reject;

	var isAbsoluteUrl = function (url) {
		return /^https?:\/\/[\w\?\-\/+=.&%]+$/i.test(url);
	};

	var isImageUrl = function (url) {
		return /.(gif|jpe?g|jpng)$/.test(url);
	};

	var createImage = function (editor, url, pasteHtml) {
			return ImageLoader.load(url).then(function () {
				editor.undoManager.append(function () {
					pasteHtml(url);
				});

				editor.insertContent('<img src="' + url + '">');
				return resolve();
			});
	};

	var createLink = function (editor, url, pasteHtml) {
		return new Promise(function (resolve) {
			editor.undoManager.append(function () {
				pasteHtml(url);
			});

			editor.execCommand('mceInsertLink', false, url);
			resolve();
		});
	};

	var linkSelection = function (editor, html, pasteHtml) {
		return editor.selection.isCollapsed() === false && isAbsoluteUrl(html) ? createLink(editor, html, pasteHtml) : reject(html);
	};

	var insertImage = function (editor, html, pasteHtml) {
		return isAbsoluteUrl(html) && isImageUrl(html) ? createImage(editor, html, pasteHtml) : reject(html);
	};

	var pasteHtml = function (editor, html, pasteHtml) {
		var fallback = function (editor, html) {
			pasteHtml(html);
			return resolve();
		};

		return PromiseUtils.until([editor, html, pasteHtml], [
			linkSelection,
			insertImage,
			fallback
		]);
	};

	return {
		isAbsoluteUrl: isAbsoluteUrl,
		pasteHtml: pasteHtml
	};
});
