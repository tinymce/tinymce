import { UiFinder, Waiter } from '@ephox/agar';
import { SugarBody } from '@ephox/sugar';

const toolbarSelector = '.tox-pop__dialog .tox-toolbar';

const pAssertToolbarNotVisible = (): Promise<void> =>
  Waiter.pTryUntil('toolbar should not exist', () => UiFinder.notExists(SugarBody.body(), toolbarSelector));

const describeFocus = (): string => {
  const active = document.activeElement;
  return active === null ? 'nothing' : `<${active.nodeName.toLowerCase()} class="${active.className}">`;
};

const pAssertToolbarVisible = (): Promise<void> =>
  Waiter.pTryUntil('toolbar should exist', () => {
    if (UiFinder.findIn(SugarBody.body(), toolbarSelector).isError()) {
      throw new Error(`Expected ${toolbarSelector} to exist. Focus is on ${describeFocus()}, document has focus: ${document.hasFocus()}`);
    }
  });

export {
  pAssertToolbarNotVisible,
  pAssertToolbarVisible
};
