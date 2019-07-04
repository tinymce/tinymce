import { ApproxStructure, Assertions, Chain, FocusTools, Logger, RealKeys, UiFinder } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

import { renderSizeInput } from 'tinymce/themes/silver/ui/dialog/SizeInput';
import TestProviders from '../../module/TestProviders';

UnitTest.asynctest('SizeInput <space> webdriver Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderSizeInput({
          name: 'dimensions',
          label: Option.some('size'),
          constrain: true
        }, TestProviders)
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
    success,
    failure
  );
});