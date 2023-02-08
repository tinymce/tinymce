import { UiFinder, Waiter } from '@ephox/agar';
import { Type } from '@ephox/katamari';
import { SugarBody, SugarElement } from '@ephox/sugar';
import { TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Insert template"]';
const dialogSelector = 'div.tox-dialog';

const waitUntilIframeLoaded = async (dialogEl: SugarElement<Node>): Promise<void> => {
  await UiFinder.pWaitForState<HTMLIFrameElement>('iframe is loaded', dialogEl, 'iframe', (elm) => {
    // fallback for pre-IE 8 using contentWindow.document
    const iframeDoc = elm.dom.contentDocument || elm.dom.contentWindow?.document;
    return Type.isNonNullable(iframeDoc?.body.firstChild);
  });
};

const pUseTemplateDialog = async (editor: Editor, submit: boolean, assertFn?: (elm: SugarElement<Node>) => void): Promise<void> => {
  TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
  const dialogEl = await TinyUiActions.pWaitForDialog(editor);
  if (Type.isFunction(assertFn)) {
    await waitUntilIframeLoaded(dialogEl);
    assertFn(dialogEl);
  }
  if (submit) {
    TinyUiActions.submitDialog(editor);
  } else {
    TinyUiActions.closeDialog(editor);
  }
  await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
};

const pInsertTemplate = async (editor: Editor, assertFn?: (elm: SugarElement<Node>) => void): Promise<void> => {
  await pUseTemplateDialog(editor, true, assertFn);
};

const pPreviewTemplate = async (editor: Editor, assertFn?: (elm: SugarElement<Node>) => void): Promise<void> => {
  await pUseTemplateDialog(editor, false, assertFn);
};

export {
  pInsertTemplate,
  pPreviewTemplate
};
