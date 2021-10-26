import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { Attribute, SugarBody, SugarElement, SugarLocation, SugarShadowDom, Traverse } from '@ephox/sugar';
import { TinyDom, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

export interface ImageOps {
  readonly pExecToolbar: (editor: Editor, label: string) => Promise<void>;
  readonly pExecDialog: (editor: Editor, label: string) => Promise<void>;
  readonly pClickContextToolbarButton: (editor: Editor, label: string) => Promise<void>;
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

const doSliderDragDrop = (dialog: SugarElement<Node>) => {
  const handle = UiFinder.findIn(dialog, '.tox-slider__handle').getOrDie();
  Mouse.mouseDown(handle);
  Mouse.mouseMoveTo(handle, 5, 0);
  Mouse.mouseUpTo(handle, 5, 0);
};

const doCropDragDrop = (dialog: SugarElement<Node>, handleSelector: string, dx: number, dy: number) => {
  const handle = UiFinder.findIn(dialog, handleSelector).getOrDie();
  Mouse.mouseDown(handle);
  const overlay = Traverse.lastChild(SugarBody.body()).getOrDie('Cannot find drag overlay');
  const handlePos = SugarLocation.absolute(handle);
  Mouse.mouseMoveTo(overlay, handlePos.left + dx, handlePos.top + dy);
  Mouse.mouseUpTo(overlay, handlePos.left + dx, handlePos.top + dy);
};

const pAction = async (editor: Editor, dialog: SugarElement<Node>, action: string): Promise<void> => {
  if (isOrientationAction(action)) {
    return pClickDialogToolbarButton(editor, action);
  } else if (isAdjustmentAction(action)) {
    doSliderDragDrop(dialog);
  } else if (action === 'Crop') {
    doCropDragDrop(dialog, '.tox-croprect-handle-ne', -10, 10);
    doCropDragDrop(dialog, '.tox-croprect-handle-sw', 10, -10);
  } else {
    return Waiter.pWait(1);
  }
};

const pExecCommandFromDialog = async (editor: Editor, action: string) => {
  await pClickContextToolbarButton(editor, 'Edit image');
  const dialog = await TinyUiActions.pWaitForDialog(editor);
  await Waiter.pWait(200);
  const buttonLabel = isOrientationAction(action) ? 'Orientation' : action;
  await pClickDialogToolbarButton(editor, buttonLabel);
  await pAction(editor, dialog, action);
  await Waiter.pWait(200);
  await pClickButton(dialog, 'Apply');
  await pClickButton(dialog, 'Save');
  await pWaitForDialogClose(editor);
};

const pWaitForDialogClose = async (editor: Editor) => {
  const rootNode = SugarShadowDom.getRootNode(TinyDom.container(editor));
  const container = SugarShadowDom.getContentContainer(rootNode);
  await Waiter.pTryUntil('Waiting for dialog to go away', () => UiFinder.notExists(container, '[role="dialog"]'));
};

const pClickButton = async (dialog: SugarElement<Node>, text: string) => {
  const button = await UiFinder.pWaitFor('Wait for dialog button to be enabled', dialog, 'button:contains(' + text + '):not(:disabled)');
  Mouse.click(button);
};

const pClickContextToolbarButton = async (editor: Editor, label: string) => {
  const toolbar = await TinyUiActions.pWaitForPopup(editor, '.tox-pop__dialog .tox-toolbar');
  Mouse.clickOn(toolbar, `button[aria-label="${label}"]:not(:disabled)`);
};

const pClickDialogToolbarButton = async (editor: Editor, label: string) => {
  const toolbar = await TinyUiActions.pWaitForPopup(editor, '.tox-dialog .tox-image-tools__toolbar');
  Mouse.clickOn(toolbar, `button[aria-label="${label}"]:not(:disabled)`);
};

const pWaitForUrlChange = (imgEl: SugarElement<Element>, origUrl: string | undefined) =>
  Waiter.pTryUntilPredicate('Wait for url change', () => Attribute.get(imgEl, 'src') !== origUrl);

const pExec = async (execFromToolbar: boolean, editor: Editor, label: string) => {
  const imgEl = SugarElement.fromDom(editor.selection.getNode());
  const origUrl = Attribute.get(imgEl, 'src');

  Mouse.click(imgEl);
  await TinyUiActions.pWaitForPopup(editor, '.tox-pop__dialog div');

  if (execFromToolbar) {
    await pClickContextToolbarButton(editor, label);
  } else {
    await pExecCommandFromDialog(editor, label);
  }

  await pWaitForUrlChange(imgEl, origUrl);
};

export const ImageOps: ImageOps = {
  pExecToolbar: Fun.curry(pExec, true),
  pExecDialog: Fun.curry(pExec, false),
  pClickContextToolbarButton
};
