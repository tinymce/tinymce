import { Chain, NamedChain, UiFinder, Assertions, Mouse, Guard } from '@ephox/agar';
import { Result } from '@ephox/katamari';
import { document, HTMLLabelElement } from '@ephox/dom-globals';
import { Element, Body, Value } from '@ephox/sugar';
import { Editor } from '../../../../../core/main/ts/api/Editor';
import { TinyUi } from '@ephox/mcagar';

export type ImageDialogData = {
  src: {
    value: string
  },
  alt: string,
  dimensions: {
    width: string,
    height: string
  },
  caption: string,
  class: string
}

export const dialogSelectors = {
  sourceInput : 'label.tox-label:contains("Source") + div.tox-form__controls-h-stack div.tox-input-wrap input.tox-textfield',
  descriptionInput : 'label.tox-label:contains("Image description") + input.tox-textfield',
  widthInput : 'label.tox-label:contains("Dimensions") + div.tox-form__controls-h-stack div span:contains("Width") + input.tox-textfield',
  heightInput : 'label.tox-label:contains("Dimensions") + div.tox-form__controls-h-stack div span:contains("Height") + input.tox-textfield',
  captionRadio : 'label.tox-label:contains("Caption") + label input.tox-checkbox__input',
};

const cGetTopmostDialog = Chain.control(
  Chain.fromChains([
    Chain.inject(Body.body()),
    UiFinder.cFindIn('[role=dialog]')
  ]),
  Guard.addLogging('Get top most dialog')
);


const cUpdateTitle = (data: Partial<ImageDialogData>) => Chain.control(
  Chain.fromChains([
    Chain.inject(Body.body()),
    UiFinder.cFindIn(dialogSelectors.sourceInput),
    Chain.op((title: Element) => Value.set(title, data.src.value))
  ]),
  Guard.addLogging('Get input')
);

const cFillActiveDialog = function (data: Partial<ImageDialogData>) {
  return Chain.control(
      NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cGetTopmostDialog, 'parent'),
      NamedChain.direct('parent', cUpdateTitle(data), '_'),
      NamedChain.outputInput
    ]),
    Guard.addLogging('Fill active dialog')
  );
};

const cFakeEvent = function (name) {
  return Chain.control(
    Chain.op(function (elm: Element) {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      elm.dom().dispatchEvent(evt);
    }),
    Guard.addLogging('Fake event')
  );
};

const cExecCommand = function (command: string, value?: any, args?: any) {
  return Chain.control(
    Chain.op(function (editor: Editor) {
      editor.execCommand(command, value, args);
    }),
    Guard.addLogging('Execute command')
  );
};

const cInputForLabel = (labelText: string) => Chain.control(
  NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'dialog'),
    NamedChain.direct('dialog', UiFinder.cFindIn('label:contains("' + labelText + '")'), 'label'),
    NamedChain.direct('label', Chain.mapper((elem: Element) => (<HTMLLabelElement> elem.dom()).htmlFor), 'id'),
    NamedChain.merge(['dialog', 'id'], 'pair'),
    NamedChain.direct('pair', Chain.binder((pair: {dialog: Element, id: string}) => UiFinder.findIn(pair.dialog, '#' + pair.id)), 'field'),
    NamedChain.output('field')
  ]),
  Guard.addLogging('Input for label')
);

const cSizeInputForLabel = (labelText: string) => Chain.control(
  NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'dialog'),
    NamedChain.direct('dialog', UiFinder.cFindIn('.tox-form__controls-h-stack span:contains("' + labelText + '")'), 'label'),
    NamedChain.direct('label', Chain.mapper((elem: Element) => elem.dom().id), 'id'),
    NamedChain.merge(['dialog', 'id'], 'pair'),
    NamedChain.direct('pair', Chain.binder((pair: {dialog: Element, id: string}) => UiFinder.findIn(pair.dialog, `[aria-labelledby=${pair.id}]`)), 'field'),
    NamedChain.output('field')
  ]),
  Guard.addLogging('Input for label')
);

const cTinyUI = Chain.control(
  Chain.binder(
    (editor: Editor) => Result.value(TinyUi(editor))
  ),
  Guard.addLogging('Bind UI elements to selectors')
);

const cWaitForDialog = () => Chain.control(
  NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
    NamedChain.direct('editor', cTinyUI, 'tinyUi'),
    // Hmm. We might need an API to handle the case where you need to pass logs through a subchain.
    NamedChain.direct('tinyUi', Chain.on((tinyUi, next, die, logs) => {
      const subchain = tinyUi.cWaitForPopup('wait for dialog', 'div[role="dialog"]');
      Chain.pipeline([subchain], (value, newLogs) => next(Chain.wrap(value), newLogs), die, logs);
    }), '_'),
    NamedChain.outputInput
  ]),
  Guard.addLogging('Wait for dialog')
);

const cSubmitDialog = () => Chain.control(
  NamedChain.asChain([
    NamedChain.writeValue('body', Body.body()),
    NamedChain.read('body', Mouse.cClickOn('.tox-button:contains("Save")')),
    NamedChain.outputInput
  ]),
  Guard.addLogging('Submit dialog')
);

const cleanHtml = (html: string) => html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

const cAssertCleanHtml = (label: string, expected: string) => Chain.control(
  NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
    NamedChain.direct('editor', Chain.mapper((editor: Editor) => cleanHtml(editor.getContent() as string)), 'content'),
    NamedChain.direct('content', Assertions.cAssertHtml(label, expected), 'result'),
    NamedChain.outputInput
  ]),
  Guard.addLogging('Assert clean html')
);

const cOpFromChains = (chains: Chain<any, any>[]) => Chain.control(
  // TODO: Another API case.
  Chain.on((value, next, die, logs) => {
    Chain.pipeline([Chain.inject(value)].concat(chains), (_, newLogs) => next(Chain.wrap(value), newLogs), die, logs);
  }),
  Guard.addLogging('Chain operations')
);

const silverSettings = {
  theme: 'silver',
  plugins: 'image',
  indent: false,
  skin_url: '/project/js/tinymce/skins/oxide/',
  content_css: '/project/js/tinymce/skins/oxide/content.min.css'
};

export {
  silverSettings,
  cFillActiveDialog,
  cFakeEvent,
  cExecCommand,
  cInputForLabel,
  cSizeInputForLabel,
  cWaitForDialog,
  cSubmitDialog,
  cAssertCleanHtml,
  cOpFromChains
};