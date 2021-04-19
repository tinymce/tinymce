import { UiFinder, Waiter } from '@ephox/agar';
import { TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const insertDefaultTemplate = async (editor: Editor) => {
  const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';
  const dialogSelector = 'div.tox-dialog';

  TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
  await TinyUiActions.pWaitForDialog(editor);
  TinyUiActions.submitDialog(editor);
  await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
};

export { insertDefaultTemplate };
