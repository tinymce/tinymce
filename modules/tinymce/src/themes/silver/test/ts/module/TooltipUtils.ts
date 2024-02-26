import { FocusTools, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { SelectorFilter, SugarBody, SugarElement, TextContent } from '@ephox/sugar';
import { TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const tooltipSelector = '.tox-silver-sink .tox-tooltip__body';

const pAssertTooltip = async (editor: Editor, pTriggerTooltip: () => Promise<void>, text: string): Promise<void> => {
  await pTriggerTooltip();
  const tooltip = await TinyUiActions.pWaitForUi(editor, tooltipSelector) as SugarElement<HTMLElement>;
  assert.equal(TextContent.get(tooltip), text);
  assert.equal(SelectorFilter.all(tooltipSelector).length, 1);
};

const pAssertNoTooltip = async (_: Editor, pTriggerTooltip: () => Promise<void>, _text: string): Promise<void> => {
  await pTriggerTooltip();
  await Waiter.pWait(300);
  UiFinder.notExists(SugarBody.body(), tooltipSelector);
};

const pTriggerTooltipWithMouse = async (editor: Editor, selector: string): Promise<void> => {
  const button = await TinyUiActions.pWaitForUi(editor, selector) as SugarElement<HTMLElement>;
  Mouse.mouseOver(button);
};

const pTriggerTooltipWithKeyboard = (_: Editor, selector: string): Promise<void> => {
  FocusTools.setFocus(SugarBody.body(), selector);
  return Promise.resolve();
};

const pCloseTooltip = async (editor: Editor, selector: string): Promise<void> => {
  const button = await TinyUiActions.pWaitForUi(editor, selector) as SugarElement<HTMLElement>;
  Mouse.mouseOut(button);
  editor.focus();
  await Waiter.pTryUntil(
    'Waiting for tooltip to NO LONGER be in DOM',
    () => UiFinder.notExists(SugarBody.body(), tooltipSelector));
};

const pCloseMenu = (selector: string): Promise<void> => {
  Mouse.clickOn(SugarBody.body(), selector);
  return Waiter.pTryUntil('Waiting for menu', () =>
    UiFinder.notExists(SugarBody.body(), '[role="menu"]')
  );
};

const pOpenMenu = (editor: Editor, buttonSelector: string): Promise<SugarElement<HTMLElement>> => {
  TinyUiActions.clickOnToolbar(editor, buttonSelector);
  return TinyUiActions.pWaitForPopup(editor, '[role="menu"]');
};

export {
  pAssertTooltip,
  pAssertNoTooltip,
  pTriggerTooltipWithMouse,
  pTriggerTooltipWithKeyboard,
  pCloseTooltip,
  pCloseMenu,
  pOpenMenu
};
