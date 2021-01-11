import { Waiter } from '@ephox/agar';
import { TinyAssertions, TinyUiActions } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';

const type = (text: string): void => {
  const elm: HTMLInputElement = document.querySelector('div[role="dialog"].tox-dialog  input');
  elm.value = text;
};

const pAddAnchor = async (editor: Editor, id: string, useCommand: boolean = false): Promise<void> => {
  useCommand ? editor.execCommand('mceAnchor') : TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Anchor"]');
  await TinyUiActions.pWaitForPopup(editor, 'div[role="dialog"].tox-dialog  input');
  type(id);
  TinyUiActions.clickOnUi(editor, 'div.tox-dialog__footer button.tox-button:not(.tox-button--secondary)');
};

const pAssertAnchorPresence = (editor: Editor, numAnchors: number, selector: string = 'a.mce-item-anchor'): Promise<void> => {
  const expected = {};
  expected[selector] = numAnchors;
  return Waiter.pTryUntil('wait for anchor',
    () => TinyAssertions.assertContentPresence(editor, expected)
  );
};

export {
  pAddAnchor,
  pAssertAnchorPresence
};
