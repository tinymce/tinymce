import { Waiter } from '@ephox/agar';
import { SugarElement, Value } from '@ephox/sugar';
import { TinyAssertions, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const pAddAnchor = async (editor: Editor, id: string, useCommand: boolean = false): Promise<void> => {
  useCommand ? editor.execCommand('mceAnchor') : TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Anchor"]');
  const input = await TinyUiActions.pWaitForPopup(editor, 'div[role="dialog"].tox-dialog input') as SugarElement<HTMLInputElement>;
  Value.set(input, id);
  TinyUiActions.submitDialog(editor);
};

const pAssertAnchorPresence = (editor: Editor, numAnchors: number, selector: string = 'a.mce-item-anchor'): Promise<void> => {
  return Waiter.pTryUntil('wait for anchor', () => TinyAssertions.assertContentPresence(editor, { [selector]: numAnchors }));
};

export {
  pAddAnchor,
  pAssertAnchorPresence
};
