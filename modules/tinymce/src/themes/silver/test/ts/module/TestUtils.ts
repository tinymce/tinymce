import { UiFinder, Waiter } from '@ephox/agar';
import { SugarBody } from '@ephox/sugar';

const pWaitForEditorToRender = () =>
  Waiter.pTryUntil('Editor has rendered', () => UiFinder.exists(SugarBody.body(), '.tox-editor-header'));

export {
  pWaitForEditorToRender
};
