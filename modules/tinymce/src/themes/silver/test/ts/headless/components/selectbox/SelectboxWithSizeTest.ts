import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderSelectBox } from 'tinymce/themes/silver/ui/dialog/SelectBox';

import * as DomUtils from '../../../module/DomUtils';
import * as RepresentingUtils from '../../../module/RepresentingUtils';
import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.selectbox.SelectboxWithSizeTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderSelectBox({
      name: 'selector',
      size: 5,
      label: Optional.some('selector'),
      enabled: true,
      items: [
        { value: 'one', text: 'One' },
        { value: 'two', text: 'Two' },
        { value: 'three', text: 'Three' },
        { value: 'four', text: 'Four' },
        { value: 'five', text: 'Five' }
      ]
    }, TestProviders, Optional.none())
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', {
            classes: [ arr.has('tox-label') ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-selectfield') ],
            children: [
              s.element('select', {
                attrs: {
                  size: str.is('5')
                },
                children: [
                  s.element('option', { value: str.is('one'), html: str.is('One') }),
                  s.element('option', { value: str.is('two'), html: str.is('Two') }),
                  s.element('option', { value: str.is('three'), html: str.is('Three') }),
                  s.element('option', { value: str.is('four'), html: str.is('Four') }),
                  s.element('option', { value: str.is('five'), html: str.is('Five') })
                ]
              })
            ]
          })
        ]
      })),
      hook.component().element
    );
  });

  it('Representing state', () => {
    const component = hook.component();
    Representing.setValue(component, 'three');
    DomUtils.assertValue('After setting "three"', component, 'select', 'three');
    RepresentingUtils.assertComposedValue(component, 'three');
  });
});
