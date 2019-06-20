import { Assertions, Chain, Logger, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

import { renderColorPicker } from 'tinymce/themes/silver/ui/dialog/ColorPicker';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';

UnitTest.asynctest('ColorPicker component Test', (success, failure) => {
  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderColorPicker({
          label: Option.some('ColorPicker label'),
          name: 'col1'
        })
      );
    },
    (doc, body, gui, component, store) => {

      const sAssertColour = (label: string, expected: string, labelText: string) =>
        Logger.t(
          label,
          Waiter.sTryUntil(
            'Waiting until hex updates the other fields',
            Chain.asStep(component.element(), [
              UiFinder.cFindIn(`label:contains("${labelText}") + input`),
              UiControls.cGetValue,
              Assertions.cAssertEq('Checking value in input', expected)
            ]),
            100,
            1000
          )
        );

      return [
        RepresentingSteps.sSetComposedValue(
          'Let us set the colour picker!',
          component,
          '#ccaa33'
        ),

        sAssertColour('Red', '204', 'R'),
        sAssertColour('Green', '170', 'G'),
        sAssertColour('Blue', '51', 'B'),

        RepresentingSteps.sAssertComposedValue(
          'Checking composed value worked',
          '#ccaa33',
          component
        )
      ];
    },
    success,
    failure
  );
});