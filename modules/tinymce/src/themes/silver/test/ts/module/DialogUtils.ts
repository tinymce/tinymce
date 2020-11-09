import { Chain, Mouse, UiFinder } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowParams } from 'tinymce/core/api/WindowManager';

const cOpen = <T>(editor: Editor, spec: Dialog.DialogSpec<T>, params: WindowParams): Chain<unknown, Dialog.DialogInstanceApi<T>> =>
  Chain.injectThunked(() => editor.windowManager.open(spec, params));

const cOpenWithStore = <T>(editor: Editor, spec: Dialog.DialogSpec<T>, params: WindowParams, store: TestHelpers.TestStore) => {
  const dialogSpec = {
    onSubmit: store.adder('onSubmit'),
    onClose: store.adder('onClose'),
    onCancel: store.adder('onCancel'),
    onChange: store.adder('onChange'),
    onAction: store.adder('onAction'),
    ...spec
  };
  return cOpen(editor, dialogSpec, params);
};

const sOpen = <T>(editor: Editor, spec: Dialog.DialogSpec<T>, params: WindowParams) =>
  Chain.asStep({}, [ cOpen(editor, spec, params) ]);

const cClose = Chain.fromChainsWith(SugarBody.body(), [
  Mouse.cClickOn('[aria-label="Close"]'),
  UiFinder.cNotExists('[role="dialog"]')
]);

const sClose = Chain.asStep({}, [ cClose ]);

const sWaitForOpen = (selector: string = '[role=dialog]') => UiFinder.sWaitForVisible('Wait for the dialog to open', SugarBody.body(), selector);

export {
  sOpen,
  sClose,

  cOpen,
  cOpenWithStore,
  cClose,

  sWaitForOpen
};
