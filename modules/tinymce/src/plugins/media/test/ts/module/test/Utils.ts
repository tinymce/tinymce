import { Assertions, Chain, GeneralSteps, Step, UiControls, UiFinder, Waiter, Mouse, Logger, Guard, RawAssertions } from '@ephox/agar';
import { Event, HTMLElement, document } from '@ephox/dom-globals';
import { Body, Element, Focus } from '@ephox/sugar';
import { Arr, Type } from '@ephox/katamari';

export const selectors = {
  source: 'label:contains(Source) + div.tox-form__controls-h-stack input.tox-textfield',
  width: '.tox-form__controls-h-stack label:contains(Width) + input.tox-textfield',
  height: '.tox-form__controls-h-stack label:contains(Height) + input.tox-textfield',
  embed: 'label:contains(Paste your embed code below:) + textarea.tox-textarea',
  saveButton: 'button.tox-button:contains(Save)',
  xClose: 'button[aria-label=Close]',
  lockIcon: 'button.tox-lock',
  embedButton: 'div.tox-tab:contains(Embed)'
};

const sOpenDialog = function (ui) {
  return Logger.t('Open dialog', GeneralSteps.sequence([
    ui.sClickOnToolbar('Click on media button, there should be only 1 button in the toolbar', 'div.tox-toolbar__group > button'),
    ui.sWaitForPopup('wait for popup', 'div.tox-dialog-wrap')
  ]));
};

const cFindInDialog = (selector: string) => (ui) => {
  return Chain.control(
    Chain.fromChains([
      ui.cWaitForPopup('Wait for popup', 'div[role="dialog"]'),
      UiFinder.cFindIn(selector)
    ]),
    Guard.addLogging(`Find ${selector} in dialog`)
  );
};

const cGetValueOn = (selector: string) => (ui) => {
  return Chain.control(
    Chain.fromChains([
      cFindInDialog(selector)(ui),
      UiControls.cGetValue
    ]),
    Guard.addLogging('Get value')
  );
};

const cSetValueOn = (selector: string, newValue: any) => (ui) => {
  return Chain.control(
    Chain.fromChains([
      cFindInDialog(selector)(ui),
      UiControls.cSetValue(newValue)
    ]),
    Guard.addLogging('Set value')
  );
};

const sAssertFieldValue = (selector) => (ui, value) => {
  return Waiter.sTryUntil(`Wait for new ${selector} value`,
    Chain.asStep({}, [
      cGetValueOn(selector)(ui),
      Assertions.cAssertEq(`Assert ${value} value`, value)
    ]), 20, 3000
  );
};

const sAssertWidthValue = sAssertFieldValue(selectors.width);
const sAssertHeightValue = sAssertFieldValue(selectors.height);
const sAssertSourceValue = sAssertFieldValue(selectors.source);

const sSetValueAndTrigger = (selector, value, events: string[]) => (ui) => {
  return Logger.t(`Set ${value} and trigger ${events.join(',')}`, Chain.asStep({}, [
    Chain.fromChains([
      cFindInDialog(selector)(ui),      // get the element
      Chain.op(Focus.focus),            // fire focusin, required by sizeinput to recalc ratios
      cSetValueOn(selector, value)(ui), // change the value
      ...Arr.map(events, (event) => cFakeEvent(event)),                 // fire [change, input etc],
      Chain.wait(0) // Wait needed as paste event is triggered async
    ])
  ]));
};

const sPasteSourceValue = function (ui, value: string) {
  return sSetValueAndTrigger(selectors.source, value, [ 'paste' ])(ui);
};

const sChangeWidthValue = function (ui, value: string) {
  return sSetValueAndTrigger(selectors.width, value, [ 'input', 'change' ])(ui);
};

const sChangeHeightValue = function (ui, value: string) {
  return sSetValueAndTrigger(selectors.height, value, [ 'input', 'change' ])(ui);
};

const sAssertSizeRecalcConstrained = function (ui) {
  return Logger.t('Asset constrained size recalculation', GeneralSteps.sequence([
    sOpenDialog(ui),
    sPasteSourceValue(ui, 'http://test.se'),
    sAssertHeightAndWidth(ui, '150', '300'),
    sChangeWidthValue(ui, '350'),
    sAssertHeightAndWidth(ui, '175', '350'),
    sChangeHeightValue(ui, '100'),
    sAssertHeightAndWidth(ui, '100', '200'),
    sCloseDialog(ui)
  ]));
};

const sAssertSizeRecalcConstrainedReopen = function (ui) {
  return Logger.t('Assert constrained size recalculation on dialog reopen', GeneralSteps.sequence([
    sOpenDialog(ui),
    sPasteSourceValue(ui, 'http://test.se'),
    sAssertHeightAndWidth(ui, '150', '300'),
    sChangeWidthValue(ui, '350'),
    sAssertHeightAndWidth(ui, '175', '350'),
    sChangeHeightValue(ui, '100'),
    sAssertHeightAndWidth(ui, '100', '200'),
    sSubmitAndReopen(ui),
    sAssertHeightAndWidth(ui, '100', '200'),
    sChangeWidthValue(ui, '350'),
    sAssertHeightAndWidth(ui, '175', '350'),
    sCloseDialog(ui)
  ]));
};

const sAssertSizeRecalcUnconstrained = function (ui) {
  return Logger.t('Assert unconstrained size recalculation', GeneralSteps.sequence([
    sOpenDialog(ui),
    sPasteSourceValue(ui, 'http://test.se'),
    ui.sClickOnUi('click checkbox', selectors.lockIcon),
    sAssertHeightAndWidth(ui, '150', '300'),
    sChangeWidthValue(ui, '350'),
    sAssertHeightAndWidth(ui, '150', '350'),
    sChangeHeightValue(ui, '100'),
    sAssertHeightAndWidth(ui, '100', '350'),
    sCloseDialog(ui)
  ]));
};

const sCloseDialog = function (ui) {
  return Logger.t('Close dialog', ui.sClickOnUi('Click cancel button', selectors.xClose));
};

const cFakeEvent = function (name) {
  return Chain.control(
    Chain.op(function (elm: Element) {
      const element: HTMLElement = elm.dom();
      // NOTE we can't fake a paste event here.
      let event;
      if (Type.isFunction(Event)) {
        event = new Event(name, {
          bubbles: true,
          cancelable: true
        });
      } else { // support IE
        event = document.createEvent('Event');
        event.initEvent(name, true, true);
      }
      element.dispatchEvent(event);
    }),
    Guard.addLogging(`Fake event ${name}`)
  );
};

const cFindFilepickerInput = cFindInDialog(selectors.source);

const cFindTextarea = cFindInDialog(selectors.embed);

const cSetSourceInput = function (ui, value) {
  return Chain.control(
    Chain.fromChains([
      cFindFilepickerInput(ui),
      UiControls.cSetValue(value)
    ]),
    Guard.addLogging(`Set source input ${value}`)
  );
};

const sPasteTextareaValue = function (ui, value) {
  return Logger.t(`Paste text area ${value}`, Chain.asStep({}, [
    Chain.fromChains([
      cFindInDialog(selectors.embedButton)(ui),
      Mouse.cClick,
      cFindInDialog(selectors.embed)(ui),
      UiControls.cSetValue(value),
    ]),
    cFakeEvent('paste')
  ]));
};

const sAssertEmbedData = function (ui, content) {
  return GeneralSteps.sequence([
    ui.sClickOnUi('Switch to Embed tab', '.tox-tab:contains("Embed")'),
    Waiter.sTryUntil('Textarea should have a proper value',
    Chain.asStep(Body.body(), [
      cFindInDialog(selectors.embed)(ui),
      UiControls.cGetValue,
      Assertions.cAssertEq('embed content', content)
    ]), 1, 3000),
    ui.sClickOnUi('Switch to General tab', '.tox-tab:contains("General")')
  ]);
};

const sTestEmbedContentFromUrl = function (apis, ui, url, content) {
  return Logger.t(`Assert embed ${content} from ${url}`, GeneralSteps.sequence([
    apis.sSetContent(''),
    sOpenDialog(ui),
    sPasteSourceValue(ui, url),
    sAssertEmbedData(ui, content),
    sCloseDialog(ui)
  ]));
};

const sSetFormItemNoEvent = function (ui, value) {
  return Logger.t(`Set form item ${value}`, Chain.asStep({}, [
    cSetSourceInput(ui, value)
  ]));
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
  return Logger.t('Submit dialog', ui.sClickOnUi('Click submit button', selectors.saveButton));
};

const sSubmitAndReopen = function (ui) {
  return Logger.t('Submit and reopen dialog', GeneralSteps.sequence([
    sSubmitDialog(ui),
    sOpenDialog(ui)
  ]));
};

const sSetSetting = function (editorSetting, key, value) {
  return Logger.t(`Set setting ${key}: ${value}`, Step.sync(function () {
    editorSetting[key] = value;
  }));
};

const cNotExists = (selector) => {
  return Chain.control(
    Chain.op((container: Element) => {
      UiFinder.findIn(container, selector).fold(
        () => RawAssertions.assertEq('should not find anything', true, true),
        () => RawAssertions.assertEq('Expected ' + selector + ' not to exist.', true, false)
      );
    }),
    Guard.addLogging(`Assert ${selector} does not exist`)
  );
};

const cExists = (selector) => {
  return Chain.control(
    Chain.op((container: Element) => {
      UiFinder.findIn(container, selector).fold(
        () => RawAssertions.assertEq('Expected ' + selector + ' to exist.', true, false),
        () => RawAssertions.assertEq('found element', true, true)
      );
    }),
    Guard.addLogging(`Assert ${selector} exists`)
  );
};

const sSetHeightAndWidth = (ui, height: string, width: string) => {
  return Logger.t(`Set height and width to ${height}x${width}`, GeneralSteps.sequence([
    sChangeWidthValue(ui, width),
    sChangeHeightValue(ui, height)
  ]));
};

const sAssertHeightAndWidth = (ui, height: string, width: string) => {
  return Logger.t('Check height and width updated', GeneralSteps.sequence([
    sAssertWidthValue(ui, width),
    sAssertHeightValue(ui, height)
  ]));
};

export default {
  cSetSourceInput,
  cFindTextarea,
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
  sAssertEmbedData,
  sAssertSourceValue,
  sChangeWidthValue,
  sChangeHeightValue,
  sPasteTextareaValue,
  sSetHeightAndWidth,
  sAssertHeightAndWidth,
  selectors,
  cExists,
  cNotExists
};
