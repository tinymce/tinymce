import { ApproxStructure, Assertions, Keyboard, Keys, UiFinder } from '@ephox/agar';
import { AlloyComponent, Disabling, Form, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.checkbox.Checkbox component Test', () => {
  const providers = {
    ...TestProviders,
    icons: (): Record<string, string> => ({
      selected: '<svg></svg>',
      unselected: '<svg></svg>'
    })
  };

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderCheckbox({
      label: 'TestCheckbox',
      name: 'test-check-box',
      enabled: true,
    }, providers, Optional.none())
  ));

  const assertCheckboxState = (label: string, component: AlloyComponent, expChecked: boolean) => {
    const input = UiFinder.findIn(component.element, 'input').getOrDie();
    const node = input.dom as HTMLInputElement;
    assert.equal(node.checked, expChecked, label + ' - checking "checked" flag');
    assert.isFalse(node.indeterminate, label + ' - checking "indeterminate" flag');
  };

  const setCheckboxState = (component: AlloyComponent, state: boolean) => {
    Representing.setValue(component, state);
  };

  const pressKeyOnCheckbox = (component: AlloyComponent, keyCode: number, modifiers: Record<string, boolean> = {}) => {
    const input = UiFinder.findIn(component.element, 'input').getOrDie();
    Keyboard.keydown(keyCode, modifiers, input);
  };

  const getCompByName = (access: AlloyComponent, name: string) => {
    return Form.getField(access, name).getOrDie();
  };

  it('TBA: Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('label', {
        classes: [ arr.has('tox-checkbox') ],
        children: [
          s.element('input', {
            classes: [ arr.has('tox-checkbox__input') ],
            attrs: {
              type: str.is('checkbox')
            }
          }),
          s.element('div', {
            classes: [ arr.has('tox-checkbox__icons') ],
            children: [
              s.element('span', {
                classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__checked') ],
                html: str.startsWith('<svg')
              }),
              s.element('span', {
                classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__unchecked') ],
                html: str.startsWith('<svg')
              })
            ]
          }),
          s.element('span', {
            classes: [ arr.has('tox-checkbox__label') ],
            html: str.is('TestCheckbox')
          })
        ]
      })),
      hook.component().element
    );
  });

  it('TBA: Representing state updates', () => {
    const component = hook.component();
    assertCheckboxState('Initial checkbox state', component, false);
    assert.isFalse(Disabling.isDisabled(component), 'Initial disabled state');
    setCheckboxState(component, true);
    assertCheckboxState('initial > checked', component, true);
    setCheckboxState(component, false);
    assertCheckboxState('checked > unchecked', component, false);
    setCheckboxState(component, true);
    assertCheckboxState('unchecked > checked', component, true);
  });

  it('TBA: Disabling state', () => {
    const component = hook.component();
    Disabling.set(component, true);
    assert.isTrue(Disabling.isDisabled(component), 'enabled > disabled');
    Disabling.set(component, false);
    assert.isFalse(Disabling.isDisabled(component), 'disabled > enabled');
  });

  it('TINY-4189:Disabling state', () => {
    const component = hook.component();
    Disabling.set(getCompByName(component, 'test-check-box'), true);
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('label', {
        classes: [
          arr.has('tox-checkbox'),
          arr.has('tox-checkbox--disabled')
        ],
        children: [
          s.element('input', {
            classes: [ arr.has('tox-checkbox__input') ],
            attrs: {
              type: str.is('checkbox'),
              disabled: str.is('disabled')
            }
          }),
          s.element('div', {
            classes: [ arr.has('tox-checkbox__icons') ],
            children: [
              s.element('span', {
                classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__checked') ],
                html: str.startsWith('<svg')
              }),
              s.element('span', {
                classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__unchecked') ],
                html: str.startsWith('<svg')
              })
            ]
          }),
          s.element('span', {
            classes: [ arr.has('tox-checkbox__label') ],
            html: str.is('TestCheckbox')
          })
        ]
      })),
      hook.component().element
    );
    Disabling.set(getCompByName(component, 'test-check-box'), false);
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('label', {
        classes: [
          arr.has('tox-checkbox'),
          arr.not('tox-checkbox--disabled')
        ],
        children: [
          s.element('input', {
            classes: [ arr.has('tox-checkbox__input') ],
            attrs: {
              type: str.is('checkbox'),
              disabled: str.none()
            }
          }),
          s.element('div', {
            classes: [ arr.has('tox-checkbox__icons') ],
            children: [
              s.element('span', {
                classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__checked') ],
                html: str.startsWith('<svg')
              }),
              s.element('span', {
                classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__unchecked') ],
                html: str.startsWith('<svg')
              })
            ]
          }),
          s.element('span', {
            classes: [ arr.has('tox-checkbox__label') ],
            html: str.is('TestCheckbox')
          })
        ]
      })),
      hook.component().element
    );
  });

  it('TBA: Keyboard events', () => {
    const component = hook.component();
    setCheckboxState(component, true);
    pressKeyOnCheckbox(component, Keys.space());
    assertCheckboxState('checked > unchecked', component, false);
    pressKeyOnCheckbox(component, Keys.space());
    assertCheckboxState('unchecked > checked', component, true);
    pressKeyOnCheckbox(component, Keys.enter());
    assertCheckboxState('checked > unchecked', component, false);
    pressKeyOnCheckbox(component, Keys.enter());
    assertCheckboxState('unchecked > checked', component, true);
  });
});
