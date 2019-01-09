import { ApproxStructure, Assertions, Chain, FocusTools, Logger, RealKeys, UiFinder } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

import { renderSizeInput } from '../../../../main/ts/ui/dialog/SizeInput';
import { GuiSetup } from '../../module/AlloyTestUtils';
import { setupDemo } from 'src/themes/silver/demo/ts/components/DemoHelpers';

UnitTest.asynctest('SizeInput <space> webdriver Test', (success, failure) => {
  const helpers = setupDemo();
  const providers = helpers.extras.backstage.shared.providers;

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderSizeInput({
          type: 'sizeinput',
          name: 'dimensions',
          label: Option.some('size'),
          constrain: true
        }, providers)
      );
    },
    (doc, body, gui, component, store) => {
      const sAssertLockedStatus = (label: string, expected: boolean) => Logger.t(
        label,
        Chain.asStep(component.element(), [
          UiFinder.cFindIn('.tox-lock'),
          Assertions.cAssertStructure(
            'Checking the state of the lock button. Should be: ' + expected,
            ApproxStructure.build((s, str, arr) => {
              return s.element('button', {
                classes: [ arr.has('tox-lock') ],
                attrs: {
                  'aria-pressed': str.is(expected ? 'true' : 'false')
                }
              });
            })
          )
        ])
      );

      const sSendRealSpace = RealKeys.sSendKeysOn('.tox-lock', [
        // Space key
        RealKeys.text('\uE00D')
      ]);

      return [
        FocusTools.sSetFocus('Focus the constrain button', component.element(), '.tox-lock'),
        sAssertLockedStatus('Initially: ', true),
        sSendRealSpace,
        sAssertLockedStatus('Firing space on a pressed button', false),
        sSendRealSpace,
        sAssertLockedStatus('Firing space on a non-pressed button', true)
      ];
    },
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});