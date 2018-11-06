import { Chain, NamedChain, UiFinder, Assertions, Mouse, Guard } from '@ephox/agar';
import { Result } from '@ephox/katamari';
import { document, HTMLLabelElement } from '@ephox/dom-globals';
import { Element, Body } from '@ephox/sugar';
import { Editor } from '../../../../../core/main/ts/api/Editor';
import { TinyUi } from '@ephox/mcagar';

// dupe: Should be in mcagar
const cGetTopmostWindowApi = Chain.control(
  Chain.binder((editor: Editor) => {
    const wins: any[] = editor.windowManager.getWindows();
    if (wins.length > 0) {
      const topWin = wins[wins.length - 1];
      return Result.value(topWin);
    } else {
      return Result.error('No open dialog');
    }
  }),
  Guard.addLogging('Get top most window API')
);

// dupe: Should be in mcagar
const cFillActiveDialog = function (data) {
  return Chain.control(
      NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cGetTopmostWindowApi, 'dialogApi'),
      NamedChain.direct('dialogApi', Chain.op((dialogApi) => {
        dialogApi.setData(data);
      }), '_'),
      NamedChain.outputInput
    ]),
    Guard.addLogging('Fill active dialog')
  );
};

const cActiveDialogData = () => Chain.control(
  NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
    NamedChain.direct('editor', cGetTopmostWindowApi, 'dialogApi'),
    NamedChain.direct('dialogApi', Chain.binder((dialogApi) => {
      return Result.value(dialogApi.getData());
    }), 'data'),
    NamedChain.output('data')
  ]),
  Guard.addLogging('Active dialog data')
);

const cAssertActiveDialogData = (message, data) => Chain.control(
  Chain.fromParent(Chain.identity, [
    Chain.fromChains([
      cActiveDialogData(),
      Assertions.cAssertEq(message, data)
    ])
  ]),
  Guard.addLogging('Assert active dialog data')
);

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
  cGetTopmostWindowApi,
  cFillActiveDialog,
  cActiveDialogData,
  cAssertActiveDialogData,
  cFakeEvent,
  cExecCommand,
  cInputForLabel,
  cSizeInputForLabel,
  cWaitForDialog,
  cSubmitDialog,
  cAssertCleanHtml,
  cOpFromChains
};