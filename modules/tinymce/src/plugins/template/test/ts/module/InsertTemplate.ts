import { UiFinder, Waiter } from '@ephox/agar';
import { Type } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';
const dialogSelector = 'div.tox-dialog';

const pInsertTemplate = async (editor: Editor, assertFn?: (elm: SugarElement<Node>) => Promise<void>) => {
  TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
  const dialogEl = await TinyUiActions.pWaitForDialog(editor);
  if (Type.isFunction(assertFn)) {
    await assertFn(dialogEl);
  }
  TinyUiActions.submitDialog(editor);
  await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
};

export {
  pInsertTemplate
};
