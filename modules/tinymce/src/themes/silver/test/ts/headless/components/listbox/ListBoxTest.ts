import { ApproxStructure, Assertions, Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { AlloyComponent, Disabling, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';
import { assert } from 'chai';

import { renderListBox } from 'tinymce/themes/silver/ui/dialog/ListBox';

import * as RepresentingUtils from '../../../module/RepresentingUtils';
import * as TestExtras from '../../../module/TestExtras';

describe('headless.tinymce.themes.silver.components.listbox.ListBoxTest', () => {
  const extrasHook = TestExtras.bddSetup();

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderListBox({
      name: 'selector',
      label: Optional.some('selector'),
      enabled: true,
      items: [
        { value: 'one', text: 'One' },
        { value: 'two', text: 'Two' },
        { text: 'Other', items: [
          { value: 'three', text: 'Three' }
        ] }
      ]
    }, extrasHook.access().extras.backstages.popup, Optional.none())
  ));

  const assertValue = (component: AlloyComponent, expected: string) => {
    const elem = UiFinder.findIn(component.element, '.tox-listbox').getOrDie();
    assert.equal(Attribute.get(elem, 'data-value'), expected, 'Checking value of .tox-listbox');
  };

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
            classes: [ arr.has('tox-listboxfield') ],
            children: [
              s.element('button', {
                classes: [ arr.has('tox-listbox'), arr.has('tox-listbox--select') ],
                attrs: {
                  'data-value': str.is('one')
                },
                children: [
                  s.element('span', {
                    classes: [ arr.has('tox-listbox__select-label') ],
                    children: [ s.text(str.is('One')) ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-listbox__select-chevron') ]
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

  it('Representing state', () => {
    const component = hook.component();
    Representing.setValue(component, 'three');
    assertValue(component, 'three');
    RepresentingUtils.assertComposedValue(component, 'three');

    // Invalid value
    Representing.setValue(component, 'invalid');
    assertValue(component, 'three');
  });

  it('Disabling state', () => {
    const component = hook.component();
    assert.isFalse(Disabling.isDisabled(component), 'Initial disabled state');
    Disabling.set(component, true);
    assert.isTrue(Disabling.isDisabled(component), 'enabled > disabled');
    Disabling.set(component, false);
    assert.isFalse(Disabling.isDisabled(component), 'disabled > enabled');
  });

  it('Open menu and select value via keyboard', async () => {
    const component = hook.component();
    const doc = hook.root();
    const gui = hook.gui();
    const sink = extrasHook.access().getPopupSink();
    Representing.setValue(component, 'three');

    Mouse.clickOn(gui.element, '.tox-listbox');
    await UiFinder.pWaitFor('Waiting for menu to appear', sink, '.tox-menu .tox-collection__item');

    const menu = UiFinder.findIn(sink, '[role="menu"]').getOrDie();
    Assertions.assertStructure(
      'Checking structure of menu (especially text)',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-menu'), arr.has('tox-collection--list'), arr.has('tox-collection') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__group') ],
            children: [
              s.element('div', {
                attrs: {
                  'aria-checked': str.is('false')
                },
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    html: str.is('One')
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-checkmark') ]
                  })
                ]
              }),
              s.element('div', {
                attrs: {
                  'aria-checked': str.is('false')
                },
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    html: str.is('Two')
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-checkmark') ]
                  })
                ]
              }),
              s.element('div', {
                attrs: {
                  'aria-expanded': str.is('false')
                },
                classes: [ arr.has('tox-collection__item') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-label') ],
                    html: str.is('Other')
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-collection__item-caret') ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      menu
    );

    Keyboard.activeKeystroke(doc, Keys.down());
    Keyboard.activeKeystroke(doc, Keys.enter());
    assertValue(component, 'two');
  });
});
