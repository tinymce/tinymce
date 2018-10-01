import { ApproxStructure, Assertions, Mouse } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';

import { renderButton } from '../../../../../main/ts/ui/general/Button';
import { GuiSetup } from '../../../module/AlloyTestUtils';

UnitTest.asynctest('DialogButton component Test', (success, failure) => {
  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderButton({
          name: 'test-button',
          text: 'ButtonText',
          disabled: false,
          primary: true
        }, store.adder('button.action'))
      );
    },
    (_doc, _body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('button', {
              classes: [ arr.has('tox-button'), arr.not('tox-button--secondary') ],
              children: [
                s.text( str.is('ButtonText') )
              ]
            });
          }),
          component.element()
        ),

        store.sAssertEq('No button action should have fired yet', [ ]),
        Mouse.sClickOn(gui.element(), '.tox-button'),
        store.sAssertEq('Button action should have fired', [ 'button.action' ])
      ];
    },
    success,
    failure
  );
});