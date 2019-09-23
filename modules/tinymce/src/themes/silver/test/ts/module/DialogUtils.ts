import { Chain, Mouse, UiFinder } from '@ephox/agar';
import { Types } from '@ephox/bridge';
import { Body } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const cOpen = <T>(editor: Editor, spec: Types.Dialog.DialogApi<T>, params: Record<string, any>) => Chain.mapper((_) => {
  return editor.windowManager.open(spec, params);
});

const cOpenWithStore = <T>(editor: Editor, spec: Types.Dialog.DialogApi<T>, params: Record<string, any>, store: any) => {
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

const sOpen = <T>(editor: Editor, spec: Types.Dialog.DialogApi<T>, params: Record<string, any>) =>
  Chain.asStep({}, [ cOpen(editor, spec, params) ]);

const cClose = Chain.fromChainsWith(Body.body(), [
  Mouse.cClickOn('[aria-label="Close"]'),
  UiFinder.cNotExists('[role="dialog"]')
]);

const sClose = Chain.asStep({}, [ cClose ]);

export {
  sOpen,
  sClose,

  cOpen,
  cOpenWithStore,
  cClose
};
