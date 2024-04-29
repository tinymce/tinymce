import { FocusTools, Waiter } from '@ephox/agar';
import { TinyUiActions } from '@ephox/mcagar';
import { SugarDocument, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const pOpenContextMenu = async (editor: Editor, target: string): Promise<void> => {
  // Not sure why this is needed, but without the browser deselects the contextmenu target
  await Waiter.pWait(0);
  await TinyUiActions.pTriggerContextMenu(editor, target, '.tox-silver-sink [role="menuitem"]');
};

const pAssertFocusOnItem = (label: string, selector: string): Promise<SugarElement<HTMLElement>> =>
  FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

export {
  pOpenContextMenu,
  pAssertFocusOnItem
};
