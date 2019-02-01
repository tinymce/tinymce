import { ApproxStructure, Assertions, Mouse } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { setupDemo } from 'tinymce/themes/silver/demo/components/DemoHelpers';

import { renderButton } from '../../../../../main/ts/ui/general/Button';
import { Option } from '@ephox/katamari';

UnitTest.asynctest('DialogButton component Test', (success, failure) => {

  const helpers = setupDemo();

  const providers = helpers.extras.backstage.shared.providers;

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderButton({
          name: 'test-button',
          text: 'ButtonText',
          disabled: false,
          primary: true,
          icon: Option.none()
        }, store.adder('button.action'), providers)
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
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});