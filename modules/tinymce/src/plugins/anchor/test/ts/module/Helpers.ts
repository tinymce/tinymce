import { Log, Step, Waiter } from '@ephox/agar';
import { TinyUi, TinyApis } from '@ephox/mcagar';

const sType = (text: string) =>
  Log.step('TBA', 'Add anchor id', Step.sync(() => {
    const elm: any = document.querySelector('div[role="dialog"].tox-dialog  input');
    elm.value = text;
  }));

const sAddAnchor = (tinyApis: TinyApis, tinyUi: TinyUi, id: string, useCommand: boolean = false) =>
  Log.stepsAsStep('TBA', 'Add anchor', [
    useCommand ? tinyApis.sExecCommand('mceAnchor') : tinyUi.sClickOnToolbar('click anchor button', 'button[aria-label="Anchor"]'),
    tinyUi.sWaitForPopup('wait for window', 'div[role="dialog"].tox-dialog  input'),
    sType(id),
    tinyUi.sClickOnUi('click on Save btn', 'div.tox-dialog__footer button.tox-button:not(.tox-button--secondary)')
  ]);

const sAssertAnchorPresence = (tinyApis: TinyApis, numAnchors: number, selector: string = 'a.mce-item-anchor') => {
  const expected = {};
  expected[selector] = numAnchors;
  return Waiter.sTryUntil('wait for anchor',
    tinyApis.sAssertContentPresence(expected)
  );
};

export {
  sType,
  sAddAnchor,
  sAssertAnchorPresence
};
