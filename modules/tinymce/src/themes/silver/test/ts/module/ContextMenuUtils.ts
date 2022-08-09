import { UiFinder, Waiter } from '@ephox/agar';
import { Css, SugarBody } from '@ephox/sugar';
import { TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const pOpenContextMenu = async (editor: Editor, selector: string): Promise<void> => {
  await TinyUiActions.pTriggerContextMenu(editor, selector, '.tox-silver-sink .tox-menu.tox-collection [role="menuitem"]');
  await Waiter.pWait(0);
};

const assertContentMenuPosition = (left: number, top: number, diff: number = 3): void => {
  const menu = UiFinder.findIn(SugarBody.body(), '.tox-silver-sink .tox-menu.tox-collection').getOrDie();
  const topStyle = parseInt(Css.getRaw(menu, 'top').getOr('0').replace('px', ''), 10);
  const leftStyle = parseInt(Css.getRaw(menu, 'left').getOr('0').replace('px', ''), 10);
  assert.approximately(topStyle, top, diff, `Assert context menu top position - ${topStyle}px ~= ${top}px`);
  assert.approximately(leftStyle, left, diff, `Assert context menu left position - ${leftStyle}px ~= ${left}px`);
};

// Wait for dialog to open and close dialog
const pWaitForAndCloseDialog = async (editor: Editor): Promise<void> => {
  await TinyUiActions.pWaitForDialog(editor);
  TinyUiActions.cancelDialog(editor);
  await Waiter.pTryUntil(
    'Wait for dialog to close',
    () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]')
  );
};

export {
  pOpenContextMenu,
  pWaitForAndCloseDialog,
  assertContentMenuPosition
};
