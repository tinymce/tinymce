import { UiFinder, Waiter } from '@ephox/agar';
import { SugarBody } from '@ephox/sugar';

const pAssertToolbarNotVisible = async (): Promise<void> => {
  await Waiter.pWait(50);
  UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog .tox-toolbar');
};

const pAssertToolbarVisible = (): Promise<void> =>
  Waiter.pTryUntil('toolbar should exist', () => UiFinder.exists(SugarBody.body(), '.tox-pop__dialog .tox-toolbar'));

export {
  pAssertToolbarNotVisible,
  pAssertToolbarVisible
};
