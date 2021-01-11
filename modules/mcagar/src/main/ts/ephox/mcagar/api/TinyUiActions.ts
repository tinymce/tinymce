import { Mouse, UiFinder } from '@ephox/agar';
import { SugarElement, SugarShadowDom } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';
import { getThemeSelectors } from './ThemeSelectors';

const getUiRoot = (editor: Editor) =>
  SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement())));

const getToolbarRoot = (editor: Editor) => {
  const editorContainerRoot = SugarElement.fromDom(editor.getContainer());
  const elem = UiFinder.findIn(editorContainerRoot, getThemeSelectors().toolBarSelector(editor));
  return elem.getOrDie();
};

const getMenuRoot = (editor: Editor) => {
  const editorContainerRoot = SugarElement.fromDom(editor.getContainer());
  const elem = UiFinder.findIn(editorContainerRoot, getThemeSelectors().menuBarSelector);
  return elem.getOrDie();
};

const clickOnToolbar = <T extends Element>(editor: Editor, selector: string): SugarElement<T> => {
  const container = getToolbarRoot(editor);
  const elem = UiFinder.findIn(container, selector).getOrDie();
  Mouse.click(elem);
  return elem;
};

const clickOnMenu = <T extends Element>(editor: Editor, selector: string): SugarElement<T> => {
  const container = getMenuRoot(editor);
  const elem = UiFinder.findIn(container, selector).getOrDie();
  Mouse.click(elem);
  return elem;
};

const clickOnUi = <T extends Element>(editor: Editor, selector: string): SugarElement<T> => {
  const elem = UiFinder.findIn(getUiRoot(editor), selector).getOrDie();
  Mouse.click(elem);
  return elem;
};

const clickDialogButton = (editor: Editor, selector: string, buttonSelector: string) => {
  const dialog = UiFinder.findIn(getUiRoot(editor), selector).getOrDie();
  const button = UiFinder.findIn(dialog, buttonSelector).getOrDie();
  Mouse.click(button);
};

const submitDialog = (editor: Editor, selector: string): void =>
  clickDialogButton(editor, selector, getThemeSelectors().dialogSubmitSelector);

const closeDialog = (editor: Editor, selector: string): void =>
  clickDialogButton(editor, selector, getThemeSelectors().dialogCloseSelector);

const pWaitForUi = (editor: Editor, selector: string): Promise<SugarElement<Element>> =>
  UiFinder.pWaitFor(`Waiting for a UI element matching '${selector}' to exist`, getUiRoot(editor), selector);

const pWaitForPopup = (editor: Editor, selector: string): Promise<SugarElement<Element>> =>
  UiFinder.pWaitForVisible(`Waiting for a popup matching '${selector}' to be visible`, getUiRoot(editor), selector);

export {
  clickOnToolbar,
  clickOnMenu,
  clickOnUi,
  submitDialog,
  closeDialog,

  pWaitForPopup,
  pWaitForUi
};
