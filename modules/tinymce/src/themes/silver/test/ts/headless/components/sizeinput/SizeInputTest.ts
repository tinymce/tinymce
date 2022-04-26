import { ApproxStructure, Assertions, FocusTools, Mouse, UiFinder } from '@ephox/agar';
import { AlloyComponent, GuiFactory, NativeEvents, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderSizeInput } from 'tinymce/themes/silver/ui/dialog/SizeInput';

import * as DomUtils from '../../../module/DomUtils';
import * as RepresentingUtils from '../../../module/RepresentingUtils';
import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.sizeinput.SizeInputTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderSizeInput({
      name: 'dimensions',
      label: Optional.some('size'),
      constrain: true,
      enabled: true
    }, TestProviders)
  ));

  const triggerInput = (component: AlloyComponent) =>
    DomUtils.triggerEventOnFocused(component, NativeEvents.input());

  const setDimensions = (component: AlloyComponent, width: string, height: string) =>
    Representing.setValue(component, { width, height });

  const assertDimensions = (component: AlloyComponent, width: string, height: string) =>
    RepresentingUtils.assertValue(component, { width, height });

  const assertLocked = (component: AlloyComponent, locked: boolean) => {
    const lock = UiFinder.findIn(component.element, '.tox-lock').getOrDie();
    Assertions.assertStructure(
      'Checking lock has toggled',
      ApproxStructure.build((s, _str, arr) => s.element('button', {
        classes: [
          arr.has('tox-lock'),
          arr.has('tox-button'),
          (locked ? arr.has : arr.not)('tox-locked') ]
      })),
      lock
    );
  };

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-form__controls-h-stack') ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-form__group') ],
                children: [
                  s.element('label', {
                    classes: [ arr.has('tox-label') ],
                    html: str.is('Width')
                  }),
                  s.element('input', {
                    classes: [ arr.has('tox-textfield') ],
                    attrs: {
                      'data-alloy-tabstop': str.is('true')
                    }
                  })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-form__group') ],
                children: [
                  s.element('label', {
                    classes: [ arr.has('tox-label') ],
                    html: str.is('Height')
                  }),
                  s.element('input', {
                    classes: [ arr.has('tox-textfield') ],
                    attrs: {
                      'data-alloy-tabstop': str.is('true')
                    }
                  })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-form__group') ],
                children: [
                  s.element('label', {
                    classes: [ arr.has('tox-label') ],
                    html: str.is('&nbsp;')
                  }),
                  s.element('button', {
                    classes: [ arr.has('tox-lock'), arr.has('tox-button'), arr.has('tox-locked') ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      hook.component().element
    );
  });

  it('Check adjusting sizes when constraining proportions ', () => {
    const doc = hook.root();
    const component = hook.component();
    assertLocked(component, true);
    setDimensions(component, '100px', '200px');
    FocusTools.setFocus(component.element, 'input:first');
    FocusTools.setActiveValue(doc, '50');
    triggerInput(component);
    assertDimensions(component, '50', '100px');
  });

  it('Check adjusting sizes when not constraining proportions ', () => {
    const doc = hook.root();
    const component = hook.component();
    assertLocked(component, true);
    setDimensions(component, '100px', '100px');
    // toggle off the lock
    Mouse.clickOn(component.element, 'button.tox-lock');
    assertLocked(component, false);
    // now when we update the first field it will not update the second field
    FocusTools.setFocus(component.element, 'input:first');
    FocusTools.setActiveValue(doc, '300px');
    triggerInput(component);
    assertDimensions(component, '300px', '100px');
  });
});
