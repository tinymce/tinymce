define('tinymce.media.test.Utils', [
	'global!tinymce',
	'ephox.mcagar.api.TinyDom',
	'ephox.agar.api.UiFinder',
	'ephox.agar.api.Chain',
	'ephox.agar.api.UiControls',
	'ephox.agar.api.Waiter',
	'ephox.agar.api.Step',
	'ephox.agar.api.Assertions',
	'ephox.agar.api.GeneralSteps'
], function (tinymce, TinyDom, UiFinder, Chain, UiControls, Waiter, Step, Assertions, GeneralSteps) {
	var sOpenDialog = function (ui) {
		return ui.sClickOnToolbar('Click on media button', 'div[aria-label="Insert/edit video"] > button');
	};

	var sCloseDialog = function (ui) {
		return ui.sClickOnUi('Click cancel button', '.mce-i-remove');
	};

	var cFakeEvent = function (name) {
		return Chain.op(function (elm) {
			tinymce.DOM.fire(elm.dom(), name);
		});
	};

	var cFindInDialog = function (mapper) {
		return function (ui, text) {
			return Chain.fromChains([
				ui.cWaitForPopup('Wait for popup', 'div[role="dialog"]'),
				UiFinder.cFindIn('label:contains(' + text + ')'),
				Chain.mapper(function (val) {
					return TinyDom.fromDom(mapper(val));
				})
			]);
		};
	};

	var cFindFilepickerInput = cFindInDialog(function (value) {
		return document.getElementById(value.dom().htmlFor).querySelector('input');
	});
	var cFindTextarea = cFindInDialog(function (value) {
		return document.getElementById(value.dom().htmlFor);
	});


	var cSetFormItem = function (ui, value) {
		return Chain.fromChains([
			cFindFilepickerInput(ui, 'Source'),
			UiControls.cSetValue(value)
		]);
	};

	var cGetTextareaContent = function (ui) {
		return Chain.fromChains([
			cFindTextarea(ui, 'Paste your embed code below:'),
			UiControls.cGetValue
		]);
	};

	var sAssertEmbedContent = function (ui, content) {
		return Waiter.sTryUntil('',
			Chain.asStep({}, [
				cGetTextareaContent(ui),
				Assertions.cAssertEq('Content same as embed', content)
			]), 1, 3000
		);
	};

	var sSetFormItemPaste = function (ui, value) {
		return Chain.asStep({}, [
			cSetFormItem(ui, value),
			cFakeEvent('paste')
		]);
	};

	var sTestEmbedContentFromUrl = function (ui, url, content) {
		return GeneralSteps.sequence([
			sOpenDialog(ui),
			sSetFormItemPaste(ui, url),
			sAssertEmbedContent(ui, content),
			sCloseDialog(ui)
		]);
	};

	var sSetFormItemNoEvent = function (ui, value) {
		return Chain.asStep({}, [
			cSetFormItem(ui, value)
		]);
	};

	var sAssertEditorContent = function (apis, editor, expected) {
		return Waiter.sTryUntil('Wait for editor value',
			Chain.asStep({}, [
				apis.cGetContent,
				Assertions.cAssertHtml('Assert body content', expected)
			]), 10, 3000
		);
	};

	var sSetSetting = function (editorSetting, key, value) {
		return Step.sync(function () {
			editorSetting[key] = value;
		});
	};

	return {
		cSetFormItem: cSetFormItem,
		cFakeEvent: cFakeEvent,
		cFindInDialog: cFindInDialog,
		sOpenDialog: sOpenDialog,
		sCloseDialog: sCloseDialog,
		sTestEmbedContentFromUrl: sTestEmbedContentFromUrl,
		sSetFormItemNoEvent: sSetFormItemNoEvent,
		sAssertEditorContent: sAssertEditorContent,
		sSetSetting: sSetSetting
	};
});