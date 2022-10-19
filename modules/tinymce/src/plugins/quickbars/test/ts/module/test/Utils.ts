import { UiFinder, Waiter } from "@ephox/agar";
import { SugarBody } from "@ephox/sugar";

const pAssertToolbarNotVisible = async () => {
  await Waiter.pWait(50);
  UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog .tox-toolbar');
};

export {
  pAssertToolbarNotVisible
};
