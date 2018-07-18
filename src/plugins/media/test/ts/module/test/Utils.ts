import { Assertions, Chain, GeneralSteps, Step, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { TinyDom } from '@ephox/mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { document } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

const sOpenDialog = function (ui) {
  return GeneralSteps.sequence([
    ui.sClickOnToolbar('Click on media button', 'div[aria-label="Insert/edit media"] > button'),
    ui.sWaitForPopup('wait for popup', 'div[role="dialog"]')
  ]);
};

const cFindInDialog = function (mapper) {
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

const cFindWidthInput = cFindInDialog(function (value) {
  return document.getElementById(value.dom().htmlFor).querySelector('input[aria-label="Width"]');
});

const cFindHeightInput = cFindInDialog(function (value) {
  return document.getElementById(value.dom().htmlFor).querySelector('input[aria-label="Height"]');
});

const cGetWidthValue = function (ui) {
  return Chain.fromChains([
    cFindWidthInput(ui, 'Dimensions'),
    UiControls.cGetValue
  ]);
};

const cSetWidthValue = function (ui, value) {
  return Chain.fromChains([
    cFindWidthInput(ui, 'Dimensions'),
    UiControls.cSetValue(value)
  ]);
};

const cGetHeightValue = function (ui) {
  return Chain.fromChains([
    cFindHeightInput(ui, 'Dimensions'),
    UiControls.cGetValue
  ]);
};

const cSetHeightValue = function (ui, value) {
  return Chain.fromChains([
    cFindHeightInput(ui, 'Dimensions'),
    UiControls.cSetValue(value)
  ]);
};

const sAssertWidthValue = function (ui, value) {
  return Waiter.sTryUntil('Wait for new width value',
    Chain.asStep({}, [
      cGetWidthValue(ui),
      Assertions.cAssertEq('Assert size value', value)
    ]), 1, 3000
  );
};

const sAssertHeightValue = function (ui, value) {
  return Waiter.sTryUntil('Wait for new height value',
    Chain.asStep({}, [
      cGetHeightValue(ui),
      Assertions.cAssertEq('Assert size value', value)
    ]), 1, 3000
  );
};

const sAssertSourceValue = function (ui, value) {
  return Waiter.sTryUntil('Wait for source value',
    Chain.asStep({}, [
      cFindFilepickerInput(ui, 'Source'),
      UiControls.cGetValue,
      Assertions.cAssertEq('Assert source value', value)
    ]), 1, 3000
  );
};

const sPasteSourceValue = function (ui, value) {
  return Chain.asStep({}, [
    cFindFilepickerInput(ui, 'Source'),
    UiControls.cSetValue(value),
    cFakeEvent('paste')
  ]);
};

const sChangeWidthValue = function (ui, value) {
  return Chain.asStep({}, [
    cSetWidthValue(ui, value),
    cFakeEvent('change')
  ]);
};

const sChangeHeightValue = function (ui, value) {
  return Chain.asStep({}, [
    cSetHeightValue(ui, value),
    cFakeEvent('change')
  ]);
};

const sAssertSizeRecalcConstrained = function (ui) {
  return GeneralSteps.sequence([
    sOpenDialog(ui),
    sPasteSourceValue(ui, 'http://test.se'),
    sAssertWidthValue(ui, '300'),
    sAssertHeightValue(ui, '150'),
    sChangeWidthValue(ui, '350'),
    sAssertWidthValue(ui, '350'),
    sAssertHeightValue(ui, '175'),
    sChangeHeightValue(ui, '100'),
    sAssertHeightValue(ui, '100'),
    sAssertWidthValue(ui, '200'),
    sCloseDialog(ui)
  ]);
};

const sAssertSizeRecalcConstrainedReopen = function (ui) {
  return GeneralSteps.sequence([
    sOpenDialog(ui),
    sPasteSourceValue(ui, 'http://test.se'),
    sAssertWidthValue(ui, '300'),
    sAssertHeightValue(ui, '150'),
    sChangeWidthValue(ui, '350'),
    sAssertWidthValue(ui, '350'),
    sAssertHeightValue(ui, '175'),
    sChangeHeightValue(ui, '100'),
    sAssertHeightValue(ui, '100'),
    sAssertWidthValue(ui, '200'),
    sSubmitAndReopen(ui),
    sAssertHeightValue(ui, '100'),
    sAssertWidthValue(ui, '200'),
    sChangeWidthValue(ui, '350'),
    sAssertWidthValue(ui, '350'),
    sAssertHeightValue(ui, '175')
  ]);
};

const sAssertSizeRecalcUnconstrained = function (ui) {
  return GeneralSteps.sequence([
    sOpenDialog(ui),
    sPasteSourceValue(ui, 'http://test.se'),
    ui.sClickOnUi('click checkbox', '.mce-checkbox'),
    sAssertWidthValue(ui, '300'),
    sAssertHeightValue(ui, '150'),
    sChangeWidthValue(ui, '350'),
    sAssertWidthValue(ui, '350'),
    sAssertHeightValue(ui, '150'),
    sChangeHeightValue(ui, '100'),
    sAssertHeightValue(ui, '100'),
    sAssertWidthValue(ui, '350'),
    sCloseDialog(ui)
  ]);
};

const sCloseDialog = function (ui) {
  return ui.sClickOnUi('Click cancel button', '.mce-i-remove');
};

const cFakeEvent = function (name) {
  return Chain.op(function (elm: Element) {
    DOMUtils.DOM.fire(elm.dom(), name);
  });
};

const cFindFilepickerInput = cFindInDialog(function (value) {
  return document.getElementById(value.dom().htmlFor).querySelector('input');
});

const cFindTextarea = cFindInDialog(function (value) {
  return document.getElementById(value.dom().htmlFor);
});

const cSetSourceInput = function (ui, value) {
  return Chain.fromChains([
    cFindFilepickerInput(ui, 'Source'),
    UiControls.cSetValue(value)
  ]);
};

const cGetTextareaContent = function (ui) {
  return Chain.fromChains([
    cFindTextarea(ui, 'Paste your embed code below:'),
    UiControls.cGetValue
  ]);
};

const sPasteTextareaValue = function (ui, value) {
  return Chain.asStep({}, [
    cFindTextarea(ui, 'Paste your embed code below:'),
    UiControls.cSetValue(value),
    cFakeEvent('paste')
  ]);
};

const sAssertEmbedContent = function (ui, content) {
  return Waiter.sTryUntil('Textarea should have a proper value',
    Chain.asStep({}, [
      cGetTextareaContent(ui),
      Assertions.cAssertEq('Content same as embed', content)
    ]), 1, 3000
  );
};

const sTestEmbedContentFromUrl = function (ui, url, content) {
  return GeneralSteps.sequence([
    sOpenDialog(ui),
    sPasteSourceValue(ui, url),
    sAssertEmbedContent(ui, content),
    sCloseDialog(ui)
  ]);
};

const sSetFormItemNoEvent = function (ui, value) {
  return Chain.asStep({}, [
    cSetSourceInput(ui, value)
  ]);
};

const sAssertEditorContent = function (apis, editor, expected) {
  return Waiter.sTryUntil('Wait for editor value',
    Chain.asStep({}, [
      apis.cGetContent,
      Assertions.cAssertHtml('Assert body content', expected)
    ]), 10, 3000
  );
};

const sSubmitDialog = function (ui) {
  return ui.sClickOnUi('Click submit button', 'div.mce-primary > button');
};

const sSubmitAndReopen = function (ui) {
  return GeneralSteps.sequence([
    sSubmitDialog(ui),
    sOpenDialog(ui)
  ]);
};

const sSetSetting = function (editorSetting, key, value) {
  return Step.sync(function () {
    editorSetting[key] = value;
  });
};

export default {
  cSetSourceInput,
  cFindTextare: cFindTextarea,
  cFakeEvent,
  cFindInDialog,
  sOpenDialog,
  sCloseDialog,
  sSubmitDialog,
  sTestEmbedContentFromUrl,
  sSetFormItemNoEvent,
  sAssertEditorContent,
  sSetSetting,
  sSubmitAndReopen,
  sAssertWidthValue,
  sAssertHeightValue,
  sPasteSourceValue,
  sAssertSizeRecalcConstrained,
  sAssertSizeRecalcConstrainedReopen,
  sAssertSizeRecalcUnconstrained,
  sAssertEmbedContent,
  sAssertSourceValue,
  sChangeWidthValue,
  sPasteTextareaValue
};