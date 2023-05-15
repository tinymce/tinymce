import { UiFinder, Waiter } from '@ephox/agar';
import { SugarBody, SugarElement } from '@ephox/sugar';

const toolbarSelector = '.tox-pop__dialog .tox-toolbar';

const pAssertToolbarNotVisible = (): Promise<void> =>
  Waiter.pTryUntil('toolbar should not exist', () => UiFinder.notExists(SugarBody.body(), toolbarSelector));

const pAssertToolbarVisible = (): Promise<void> =>
  Waiter.pTryUntil('toolbar should exist', () => UiFinder.exists(SugarBody.body(), toolbarSelector));

const pGetToolBar = async (): Promise<SugarElement<Element>> => {
  return Waiter.pTryUntil('get toolbar',
    () => UiFinder.findIn(SugarBody.body(), toolbarSelector).getOrDie()
  );
};

export {
  pAssertToolbarNotVisible,
  pAssertToolbarVisible,
  pGetToolBar
};
