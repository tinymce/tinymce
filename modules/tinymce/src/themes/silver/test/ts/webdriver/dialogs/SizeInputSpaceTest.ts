import { ApproxStructure, Assertions, FocusTools, RealKeys, UiFinder } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { renderSizeInput } from 'tinymce/themes/silver/ui/dialog/SizeInput';

import TestProviders from '../../module/TestProviders';

describe('webdriver.tinymce.themes.silver.dialogs.SizeInputSpaceTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderSizeInput({
      name: 'dimensions',
      label: Optional.some('size'),
      constrain: true,
      enabled: true
    }, TestProviders)
  ));

  const assertLockedStatus = (label: string, element: SugarElement<Node>, expected: boolean) => {
    const lock = UiFinder.findIn(element, '.tox-lock').getOrDie();
    Assertions.assertStructure(
      `Checking the state of the lock button. ${label} should be: ${expected}`,
      ApproxStructure.build((s, str, arr) => s.element('button', {
        classes: [ arr.has('tox-lock') ],
        attrs: {
          'aria-pressed': str.is(expected ? 'true' : 'false')
        }
      })),
      lock
    );
  };

  const pSendRealSpace = () => RealKeys.pSendKeysOn('.tox-lock', [
    // Space key
    RealKeys.text('\uE00D')
  ]);

  it('Pressing space should toggle the lock button', async () => {
    const element = hook.component().element;
    FocusTools.setFocus(element, '.tox-lock');
    assertLockedStatus('Initially', element, true);
    await pSendRealSpace();
    assertLockedStatus('Firing space on a pressed button', element, false);
    await pSendRealSpace();
    assertLockedStatus('Firing space on a non-pressed button', element, true);
  });
});
