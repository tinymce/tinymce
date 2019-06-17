import { Assertions, Chain, Guard, Mouse, NamedChain, UiControls, UiFinder } from '@ephox/agar';
import { Arr, Obj, Result } from '@ephox/katamari';
import { document } from '@ephox/dom-globals';
import { Body, Checked, Element, Focus, Node, SelectTag, Value } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
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
  caption: boolean,
  classIndex: number, // because the DOM api is setSelectedIndex

  border: string,
  hspace: string,
  style: string,
  vspace: string,
  borderstyle: string,
};

export const generalTabSelectors = {
  src: 'label.tox-label:contains("Source") + div.tox-form__controls-h-stack div.tox-control-wrap input.tox-textfield',
  alt: 'label.tox-label:contains("Image description") + input.tox-textfield',
  width: 'div.tox-form__controls-h-stack div label:contains("Width") + input.tox-textfield',
  height: 'div.tox-form__controls-h-stack div label:contains("Height") + input.tox-textfield',
  caption: 'label.tox-label:contains("Caption") + label input.tox-checkbox__input',
  classIndex: 'label.tox-label:contains("Class") + div.tox-selectfield select',
  images: 'label.tox-label:contains("Image list") + div.tox-selectfield select'
};

export const advancedTabSelectors = {
  border: 'label.tox-label:contains("Border width") + input.tox-textfield',
  style: 'label.tox-label:contains("Style") + input.tox-textfield',
  hspace: 'label.tox-label:contains("Horizontal space") + input.tox-textfield',
  vspace: 'label.tox-label:contains("Vertical space") + input.tox-textfield',
  borderstyle: 'label.tox-label:contains("Border style") + div.tox-selectfield select',
};

const cGetTopmostDialog = Chain.control(
  Chain.fromChains([
    Chain.inject(Body.body()),
    UiFinder.cFindIn('[role=dialog]')
  ]),
  Guard.addLogging('Get top most dialog')
);

const cGotoAdvancedTab = Chain.fromChains([
  Chain.inject(Body.body()),
  UiFinder.cFindIn('div.tox-tab:contains(Advanced)'),
  Mouse.cClick
]);

const cSetFieldValue = (selector, value) => {
  return Chain.fromChains([
    Chain.inject(Body.body()),
    UiFinder.cFindIn(selector),
    Chain.op(Focus.focus),
    Chain.op((element) => {
      if (element.dom().type === 'checkbox') {
        Checked.set(element, value);
      } else if (Node.name(element) === 'select' && typeof value === 'number') {
        SelectTag.setSelected(element, value);
      } else {
        Value.set(element, value);
      }
    })
  ]);
};

const cSetTabFieldValues = (data, tabSelectors) => {
  const chains = Arr.flatten(Obj.mapToArray(tabSelectors, (value, key): Chain<any, any>[] => {
    if (Obj.has(data, key)) {
      const newValue = typeof data[key] === 'object' ? data[key].value : data[key];
      return [ cSetFieldValue(tabSelectors[key], newValue) ];
    } else if (Obj.has(data, 'dimensions') && Obj.has(data.dimensions, key)) {
      return [ cSetFieldValue(tabSelectors[key], data.dimensions[key]) ];
    } else {
      return [];
    }
  }));
  return Chain.fromChains(chains);
};

const cFillActiveDialog = (data: Partial<ImageDialogData>, hasAdvanced = false) => {
  const updateAdvTabFields = [
    cGotoAdvancedTab,
    cSetTabFieldValues(data, advancedTabSelectors)
  ];

  const updateDialogFields = [
    cSetTabFieldValues(data, generalTabSelectors),
    ...hasAdvanced ? updateAdvTabFields : []
  ];

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

const cFakeEvent = (name: string) => {
  return Chain.control(
    Chain.op(function (elm: Element) {
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      elm.dom().dispatchEvent(evt);
    }),
    Guard.addLogging('Fake event')
  );
};

const cSetInputValue = (selector: string, value: string) => Chain.fromChains([
  cSetFieldValue(selector, value),
  cFakeEvent('input')
]);

const cSetSelectValue = (selector: string, value: string) => Chain.fromChains([
  cSetFieldValue(selector, value),
  cFakeEvent('change')
]);

const cExecCommand = (command: string, value?: any, args?: any) => {
  return Chain.control(
    Chain.op((editor: Editor) => {
      editor.execCommand(command, value, args);
    }),
    Guard.addLogging('Execute command')
  );
};

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
    NamedChain.direct('editor', Chain.mapper((editor: Editor) => cleanHtml(editor.getContent())), 'content'),
    NamedChain.direct('content', Assertions.cAssertHtml(label, expected), 'result'),
    NamedChain.outputInput
  ]),
  Guard.addLogging('Assert clean html')
);

const cAssertInputValue = (selector: string, value: string) => {
  return Chain.fromChainsWith(Body.body(), [
    UiFinder.cFindIn(selector),
    UiControls.cGetValue,
    Assertions.cAssertEq(`input value should be ${value}`, value)
  ]);
};

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
  base_url: '/project/tinymce/js/tinymce'
};

export {
  silverSettings,
  cFillActiveDialog,
  cFakeEvent,
  cExecCommand,
  cSetInputValue,
  cSetSelectValue,
  cWaitForDialog,
  cSubmitDialog,
  cAssertCleanHtml,
  cAssertInputValue,
  cOpFromChains
};