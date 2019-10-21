import { Assertions, Chain, GeneralSteps, Guard, Logger, Mouse, Step, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { Event, HTMLElement, document } from '@ephox/dom-globals';
import { Arr, Type } from '@ephox/katamari';
import { TinyApis, TinyUi } from '@ephox/mcagar';
import { Body, Element, Focus } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

export const selectors = {
  source: 'label:contains(Source) + div.tox-form__controls-h-stack input.tox-textfield',
  width: '.tox-form__controls-h-stack label:contains(Width) + input.tox-textfield',
  height: '.tox-form__controls-h-stack label:contains(Height) + input.tox-textfield',
  embed: 'label:contains(Paste your embed code below:) + textarea.tox-textarea',
  saveButton: 'button.tox-button:contains(Save)',
  xClose: 'button[aria-label=Close]',
  lockIcon: 'button.tox-lock',
  embedButton: 'div.tox-tab:contains(Embed)',
  poster: 'label:contains(Media poster (Image URL)) + div.tox-form__controls-h-stack input.tox-textfield'
};

const sOpenDialog = function (ui: TinyUi) {
  return Logger.t('Open dialog', GeneralSteps.sequence([
    ui.sClickOnToolbar('Click on media button, there should be only 1 button in the toolbar', 'div.tox-toolbar__group > button'),
    ui.sWaitForPopup('wait for popup', 'div.tox-dialog-wrap')
  ]));
};

const cFindInDialog = (selector: string) => (ui: TinyUi) => {
  return Chain.control(
    Chain.fromChains([
      ui.cWaitForPopup('Wait for popup', 'div[role="dialog"]'),
      UiFinder.cFindIn(selector)
    ]),
    Guard.addLogging(`Find ${selector} in dialog`)
  );
};

const cGetValueOn = (selector: string) => (ui: TinyUi) => {
  return Chain.control(
    Chain.fromChains([
      cFindInDialog(selector)(ui),
      UiControls.cGetValue
    ]),
    Guard.addLogging('Get value')
  );
};

const cSetValueOn = (selector: string, newValue: string) => (ui: TinyUi) => {
  return Chain.control(
    Chain.fromChains([
      cFindInDialog(selector)(ui),
      UiControls.cSetValue(newValue)
    ]),
    Guard.addLogging('Set value')
  );
};

const sAssertFieldValue = (selector: string) => (ui: TinyUi, value: string) => {
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

const sSetValueAndTrigger = (selector: string, value: string, events: string[]) => (ui: TinyUi) => {
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

const sPasteSourceValue = function (ui: TinyUi, value: string) {
  return sSetValueAndTrigger(selectors.source, value, [ 'paste' ])(ui);
};

const sPastePosterValue = (ui: TinyUi, value: string) => {
  return sSetValueAndTrigger(selectors.poster, value, [ 'paste' ])(ui);
};

const sChangeWidthValue = function (ui: TinyUi, value: string) {
  return sSetValueAndTrigger(selectors.width, value, [ 'input', 'change' ])(ui);
};

const sChangeHeightValue = function (ui: TinyUi, value: string) {
  return sSetValueAndTrigger(selectors.height, value, [ 'input', 'change' ])(ui);
};

const sAssertSizeRecalcConstrained = function (ui: TinyUi) {
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

const sAssertSizeRecalcConstrainedReopen = function (ui: TinyUi) {
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

const sAssertSizeRecalcUnconstrained = function (ui: TinyUi) {
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

const sCloseDialog = function (ui: TinyUi) {
  return Logger.t('Close dialog', ui.sClickOnUi('Click cancel button', selectors.xClose));
};

const cFakeEvent = function (name: string) {
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

const cSetSourceInput = function (ui: TinyUi, value: string) {
  return Chain.control(
    Chain.fromChains([
      cFindFilepickerInput(ui),
      UiControls.cSetValue(value)
    ]),
    Guard.addLogging(`Set source input ${value}`)
  );
};

const sPasteTextareaValue = function (ui: TinyUi, value: string) {
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

const sAssertEmbedData = function (ui: TinyUi, content: string) {
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

const sTestEmbedContentFromUrl = function (apis: TinyApis, ui: TinyUi, url: string, content: string) {
  return Logger.t(`Assert embed ${content} from ${url}`, GeneralSteps.sequence([
    apis.sSetContent(''),
    sOpenDialog(ui),
    sPasteSourceValue(ui, url),
    sAssertEmbedData(ui, content),
    sCloseDialog(ui)
  ]));
};

const sSetFormItemNoEvent = function (ui: TinyUi, value: string) {
  return Logger.t(`Set form item ${value}`, Chain.asStep({}, [
    cSetSourceInput(ui, value)
  ]));
};

const sAssertEditorContent = function (apis: TinyApis, editor: Editor, expected: string) {
  return Waiter.sTryUntil('Wait for editor value',
    Chain.asStep({}, [
      apis.cGetContent(),
      Assertions.cAssertHtml('Assert body content', expected)
    ]), 10, 3000
  );
};

const sSubmitDialog = function (ui: TinyUi) {
  return Logger.t('Submit dialog', ui.sClickOnUi('Click submit button', selectors.saveButton));
};

const sSubmitAndReopen = function (ui: TinyUi) {
  return Logger.t('Submit and reopen dialog', GeneralSteps.sequence([
    sSubmitDialog(ui),
    sOpenDialog(ui)
  ]));
};

const sSetSetting = function (editorSetting: Record<string, any>, key: string, value: any) {
  return Logger.t(`Set setting ${key}: ${value}`, Step.sync(function () {
    editorSetting[key] = value;
  }));
};

const cNotExists = (selector: string) => {
  return Chain.control(
    Chain.op((container: Element) => {
      UiFinder.findIn(container, selector).fold(
        () => Assert.eq('should not find anything', true, true),
        () => Assert.eq('Expected ' + selector + ' not to exist.', true, false)
      );
    }),
    Guard.addLogging(`Assert ${selector} does not exist`)
  );
};

const cExists = (selector: string) => {
  return Chain.control(
    Chain.op((container: Element) => {
      UiFinder.findIn(container, selector).fold(
        () => Assert.eq('Expected ' + selector + ' to exist.', true, false),
        () => Assert.eq('found element', true, true)
      );
    }),
    Guard.addLogging(`Assert ${selector} exists`)
  );
};

const sSetHeightAndWidth = (ui: TinyUi, height: string, width: string) => {
  return Logger.t(`Set height and width to ${height}x${width}`, GeneralSteps.sequence([
    sChangeWidthValue(ui, width),
    sChangeHeightValue(ui, height)
  ]));
};

const sAssertHeightAndWidth = (ui: TinyUi, height: string, width: string) => {
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
  sPastePosterValue,
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
