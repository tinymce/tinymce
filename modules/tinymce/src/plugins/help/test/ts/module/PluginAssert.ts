import { Assertions, Chain, Guard, Logger, Mouse, UiFinder } from '@ephox/agar';
import { TinyDom } from '@ephox/mcagar';

export const sAssert = function (errString, objStruc, waitOn, clickOn) {
  return Logger.t('Assert structure in dialog', Chain.asStep(TinyDom.fromDom(document.body), [
    UiFinder.cWaitFor('Could not find notification', waitOn),
    Mouse.cClickOn(clickOn),
    Chain.control(
      Chain.op((panel) => {
        Assertions.assertPresence(errString, objStruc, panel);
      }),
      Guard.tryUntil('Keep waiting', 100, 4000)
    )
  ]));
};
