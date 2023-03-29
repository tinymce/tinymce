import { Keyboard, Mouse, Touch, UiFinder } from '@ephox/agar';
import { Type } from '@ephox/katamari';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';

import { Editor } from '../../alien/EditorTypes';
import { getThemeSelectors } from '../ThemeSelectors';
import { TinyDom } from '../TinyDom';

const getUiDoc = (editor: Editor) =>
  SugarShadowDom.getRootNode(TinyDom.targetElement(editor));

const getUiRoot = (editor: Editor): SugarElement<HTMLElement | ShadowRoot> =>
  SugarShadowDom.getContentContainer(getUiDoc(editor));

const getToolbarRoot = (editor: Editor) => {
  const editorContainerRoot = TinyDom.container(editor);
  const elem = UiFinder.findIn(editorContainerRoot, getThemeSelectors().toolBarSelector(editor));
  return elem.getOrDie();
};

const getMenuRoot = (editor: Editor) => {
  const editorContainerRoot = TinyDom.container(editor);
  const elem = UiFinder.findIn(editorContainerRoot, getThemeSelectors().menuBarSelector);
  return elem.getOrDie();
};

const clickOnToolbar = <T extends Element>(editor: Editor, selector: string): SugarElement<T> => {
  const container = getToolbarRoot(editor);
  const elem = UiFinder.findIn<T>(container, selector).getOrDie();
  Mouse.click(elem);
  return elem;
};

const tapOnToolbar = <T extends Element>(editor: Editor, selector: string): SugarElement<T> => {
  const container = getToolbarRoot(editor);
  const elem = UiFinder.findIn<T>(container, selector).getOrDie();
  Touch.touchStart(elem);
  Touch.touchEnd(elem);
  return elem;
};

const clickOnMenu = <T extends Element>(editor: Editor, selector: string): SugarElement<T> => {
  const container = getMenuRoot(editor);
  const elem = UiFinder.findIn<T>(container, selector).getOrDie();
  Mouse.click(elem);
  return elem;
};

const clickOnUi = <T extends Element>(editor: Editor, selector: string): SugarElement<T> => {
  const elem = UiFinder.findIn<T>(getUiRoot(editor), selector).getOrDie();
  Mouse.click(elem);
  return elem;
};

const clickDialogButton = (editor: Editor, selector: string, buttonSelector: string) => {
  const dialog = UiFinder.findIn(getUiRoot(editor), selector).getOrDie();
  const button = UiFinder.findIn(dialog, buttonSelector).getOrDie();
  Mouse.click(button);
};

const submitDialog = (editor: Editor, selector?: string): void => {
  const dialogSelector = Type.isUndefined(selector) ? getThemeSelectors().dialogSelector : selector;
  clickDialogButton(editor, dialogSelector, getThemeSelectors().dialogSubmitSelector);
};

const cancelDialog = (editor: Editor, selector?: string): void => {
  const dialogSelector = Type.isUndefined(selector) ? getThemeSelectors().dialogSelector : selector;
  clickDialogButton(editor, dialogSelector, getThemeSelectors().dialogCancelSelector);
};

const closeDialog = (editor: Editor, selector?: string): void => {
  const dialogSelector = Type.isUndefined(selector) ? getThemeSelectors().dialogSelector : selector;
  clickDialogButton(editor, dialogSelector, getThemeSelectors().dialogCloseSelector);
};

const pWaitForUi = (editor: Editor, selector: string): Promise<SugarElement<Element>> =>
  UiFinder.pWaitFor(`Waiting for a UI element matching '${selector}' to exist`, getUiRoot(editor), selector);

const pWaitForPopup = (editor: Editor, selector: string): Promise<SugarElement<HTMLElement>> =>
  UiFinder.pWaitForVisible(`Waiting for a popup matching '${selector}' to be visible`, getUiRoot(editor), selector);

const pWaitForDialog = (editor: Editor, selector?: string): Promise<SugarElement<Element>> => {
  const dialogSelector = Type.isUndefined(selector) ? getThemeSelectors().dialogSelector : selector;
  return UiFinder.pWaitForVisible(`Waiting for a dialog matching '${dialogSelector}' to be visible`, getUiRoot(editor), dialogSelector);
};

const pTriggerContextMenu = async (editor: Editor, target: string, menu: string): Promise<void> => {
  Mouse.contextMenuOn(TinyDom.body(editor), target);
  await pWaitForPopup(editor, menu);
};

const keydown = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeydown(getUiDoc(editor), keyvalue, modifiers);

const keyup = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeyup(getUiDoc(editor), keyvalue, modifiers);

const keypress = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeypress(getUiDoc(editor), keyvalue, modifiers);

const keystroke = (editor: Editor, keyvalue: number, modifiers: Keyboard.KeyModifiers = {}): void =>
  Keyboard.activeKeystroke(getUiDoc(editor), keyvalue, modifiers);

export {
  clickOnToolbar,
  clickOnMenu,
  clickOnUi,

  tapOnToolbar,

  submitDialog,
  cancelDialog,
  closeDialog,

  keydown,
  keypress,
  keystroke,
  keyup,

  pWaitForDialog,
  pWaitForPopup,
  pWaitForUi,
  pTriggerContextMenu,

  getUiRoot
};
