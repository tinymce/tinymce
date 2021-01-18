import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { TinyUiActions } from '@ephox/mcagar';
import { Attribute, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import PromisePolyfill from 'tinymce/core/api/util/Promise';

export interface ImageOps {
  readonly pExecToolbar: (editor: Editor, label: string) => Promise<void>;
  readonly pExecDialog: (editor: Editor, label: string) => Promise<void>;
  readonly pClickContextToolbarButton: (toolbar: SugarElement<Node>, label: string) => Promise<void>;
}

const orientationActions = [
  'Rotate counterclockwise',
  'Rotate clockwise',
  'Flip vertically',
  'Flip horizontally'
];

const adjustmentActions = [
  'Brightness',
  'Contrast',
  'Color levels',
  'Gamma'
];

const isOrientationAction = (action: string) => Arr.contains(orientationActions, action);
const isAdjustmentAction = (action: string) => Arr.contains(adjustmentActions, action);

const doDragDrop = (dialog: SugarElement<Node>) => {
  const handle = UiFinder.findIn(dialog, '.tox-slider__handle').getOrDie();
  Mouse.mouseDown(handle);
  Mouse.mouseMoveTo(handle, 5, 0);
  Mouse.mouseUpTo(handle, 5, 0);
};

const pAction = (dialog: SugarElement<Node>, action: string): Promise<void> => {
  if (isOrientationAction(action)) {
    return pClickContextToolbarButton(dialog, action);
  } else if (isAdjustmentAction(action)) {
    return new PromisePolyfill((resolve) => {
      doDragDrop(dialog);
      resolve();
    });
  } else {
    return Waiter.pWait(1);
  }
};

const pExecCommandFromDialog = async (editor: Editor, toolbar: SugarElement<Node>, action: string) => {
  await pClickContextToolbarButton(toolbar, 'Edit image');
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pWait(200);
  const buttonLabel = isOrientationAction(action) ? 'Orientation' : action;
  await pClickContextToolbarButton(dialog, buttonLabel);
  await pAction(dialog, action);
  await Waiter.pWait(200);
  await pClickButton(dialog, 'Apply');
  await pClickButton(dialog, 'Save');
  await pWaitForDialogClose();
};

const pWaitForDialogClose = () =>
  Waiter.pTryUntil('Waiting for dialog to go away', () => UiFinder.notExists(SugarBody.body(), '[role="dialog"]'));

const pClickButton = async (dialog: SugarElement<Node>, text: string) => {
  const button = await UiFinder.pWaitFor('Wait for dialog button to be enabled', dialog, 'button:contains(' + text + '):not(:disabled)');
  Mouse.click(button);
};

const pClickContextToolbarButton = async (toolbar: SugarElement<Node>, label: string) => {
  const button = await UiFinder.pWaitFor('Wait for toolbar button to be enabled', toolbar, 'button[aria-label="' + label + '"]:not(:disabled)');
  Mouse.click(button);
};

const pWaitForUrlChange = (imgEl: SugarElement<Element>, origUrl: string | undefined) =>
  Waiter.pTryUntilPredicate('Wait for url change', () => Attribute.get(imgEl, 'src') !== origUrl);

const pExec = async (execFromToolbar: boolean, editor: Editor, label: string) => {
  const imgEl = SugarElement.fromDom(editor.selection.getNode());
  const origUrl = Attribute.get(imgEl, 'src');

  Mouse.click(imgEl);
  const toolbar = await TinyUiActions.pWaitForPopup(editor, '.tox-pop__dialog div');

  if (execFromToolbar) {
    await pClickContextToolbarButton(toolbar, label);
  } else {
    await pExecCommandFromDialog(editor, toolbar, label);
  }

  await pWaitForUrlChange(imgEl, origUrl);
};

export const ImageOps: ImageOps = {
  pExecToolbar: Fun.curry(pExec, true),
  pExecDialog: Fun.curry(pExec, false),
  pClickContextToolbarButton
};
