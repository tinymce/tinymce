import { Chain, NamedChain, UiFinder, Assertions, Mouse, Guard } from '@ephox/agar';
import { Result, Arr } from '@ephox/katamari';
import { document, HTMLLabelElement } from '@ephox/dom-globals';
import { Element, Body, Value, Checked, SelectTag } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
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
  classIndex: number, // because the DOM api is setSelectedIndex

  border: string,
  hspace: string,
  style: string,
  vspace: string,
  borderstyle: string,
};

export const dialogSelectors = {
  sourceInput: 'label.tox-label:contains("Source") + div.tox-form__controls-h-stack div.tox-input-wrap input.tox-textfield',
  descriptionInput: 'label.tox-label:contains("Image description") + input.tox-textfield',
  widthInput: 'label.tox-label:contains("Dimensions") + div.tox-form__controls-h-stack div span:contains("Dimension width") + input.tox-textfield',
  heightInput: 'label.tox-label:contains("Dimensions") + div.tox-form__controls-h-stack div span:contains("Dimension height") + input.tox-textfield',
  captionRadio: 'label.tox-label:contains("Caption") + label input.tox-checkbox__input',
  classSelect: 'label.tox-label:contains("Class") + div.tox-selectfield select',
};

const cGetTopmostDialog = Chain.control(
  Chain.fromChains([
    Chain.inject(Body.body()),
    UiFinder.cFindIn('[role=dialog]')
  ]),
  Guard.addLogging('Get top most dialog')
);

// TODO: Consider de-duping, but it might be harder to understand
const cUpdateSource = (data: Partial<ImageDialogData>) => (!data.src || !data.src.value) ? [] : [
  Chain.control(
    Chain.fromChains([
      UiFinder.cFindIn(dialogSelectors.sourceInput),
      Chain.op((component: Element) => Value.set(component, data.src.value))
    ]),
    Guard.addLogging('Update source input')
  )
];

const cUpdateAlt = (data: Partial<ImageDialogData>) => (!data.alt) ? [] : [
  Chain.control(
    Chain.fromChains([
      UiFinder.cFindIn(dialogSelectors.descriptionInput),
      Chain.op((component: Element) => Value.set(component, data.alt))
    ]),
    Guard.addLogging('Update description (alt text) input')
  )
];

const cUpdateWidth = (data: Partial<ImageDialogData>) => (!data.dimensions || !data.dimensions.width) ? [] : [
  Chain.control(
    Chain.fromChains([
      UiFinder.cFindIn(dialogSelectors.widthInput),
      Chain.op((source: Element) => Value.set(source, data.dimensions.width)),
    ]),
    Guard.addLogging('Update width input')
  )
];

const cUpdateHeight = (data: Partial<ImageDialogData>) => (!data.dimensions || !data.dimensions.height) ? [] : [
  Chain.control(
    Chain.fromChains([
      UiFinder.cFindIn(dialogSelectors.heightInput),
      Chain.op((source: Element) => Value.set(source, data.dimensions.height)),
    ]),
    Guard.addLogging('Update width input')
  )
];

const cUpdateClass = (data: Partial<ImageDialogData>) => (!data.classIndex) ? [] : [
  Chain.control(
    Chain.fromChains([
      UiFinder.cFindIn(dialogSelectors.classSelect),
      Chain.op((source: Element) => SelectTag.setSelected(source, data.classIndex)),
    ]),
    Guard.addLogging('Update width input')
  )
];

const cUpdateChecked = (data: Partial<ImageDialogData>) => (!data.caption) ? [] : [
  Chain.control(
    Chain.fromChains([
      UiFinder.cFindIn(dialogSelectors.captionRadio),
      Chain.op((source: Element) => Checked.set(source, data.caption === 'checked' ? true : false)),
    ]),
    Guard.addLogging('Update width input')
  )
];

const cFillActiveDialog = function (data: Partial<ImageDialogData>) {
  const updateDialogFields = Arr.flatten([
    cUpdateSource(data),
    cUpdateAlt(data),
    cUpdateWidth(data),
    cUpdateHeight(data),
    cUpdateClass(data),
    cUpdateChecked(data),
  ]);

  const cUpdateDialogFields = Arr.map(updateDialogFields, (chain) => NamedChain.direct('parent', chain, '_'));

  return Chain.control(
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cGetTopmostDialog, 'parent'),
    ].concat(cUpdateDialogFields).concat([
      NamedChain.outputInput
    ])
    ),
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
    NamedChain.direct('pair', Chain.binder((pair: { dialog: Element, id: string }) => UiFinder.findIn(pair.dialog, '#' + pair.id)), 'field'),
    NamedChain.output('field')
  ]),
  Guard.addLogging('Input for label')
);

const cSizeInput = (selector: string) => Chain.control(
  NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'dialog'),
    NamedChain.direct('dialog', UiFinder.cFindIn(selector), 'field'),
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
  cSizeInput,
  cWaitForDialog,
  cSubmitDialog,
  cAssertCleanHtml,
  cOpFromChains
};