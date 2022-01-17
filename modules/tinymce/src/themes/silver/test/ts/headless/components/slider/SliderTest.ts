import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderSlider } from 'tinymce/themes/silver/ui/dialog/Slider';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.slider.SliderTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderSlider({
      name: 'some name',
      label: 'test label',
      min: 0,
      max: 100,
    }, TestProviders, Optional.none())
  ));

  it('TINY-8304: Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-slider') ],
        children: [
          s.element('label', {
            classes: [ arr.has('tox-label') ],
            children: [
              s.text(str.is('test label'))
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-slider__rail') ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-slider__handle') ]
          }),
        ]
      })),
      hook.component().element
    );
  });
});
