import { UiControls, UiFinder, Waiter } from '@ephox/agar';
import { AlloyComponent, GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { renderColorPicker } from 'tinymce/themes/silver/ui/dialog/ColorPicker';
import * as RepresentingUtils from '../../../module/RepresentingUtils';

describe('phantom.tinymce.themes.silver.components.colorpicker.ColorPickerTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderColorPicker({
      label: Optional.some('ColorPicker label'),
      name: 'col1'
    })
  ));

  const pAssertColour = (component: AlloyComponent, expected: string, labelText: string) =>
    Waiter.pTryUntil(
      'Waiting until hex updates the other fields',
      () => {
        const input = UiFinder.findIn(component.element, `label:contains("${labelText}") + input`).getOrDie();
        const value = UiControls.getValue(input);
        assert.equal(value, expected, 'Checking value in input');
      }
    );

  it('Representing state', async () => {
    const component = hook.component();
    RepresentingUtils.setComposedValue(
      component,
      '#ccaa33'
    );

    await pAssertColour(component, '204', 'R');
    await pAssertColour(component, '170', 'G');
    await pAssertColour(component, '51', 'B');

    RepresentingUtils.assertComposedValue(
      component,
      '#ccaa33'
    );
  });
});
