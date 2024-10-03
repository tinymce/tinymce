import { ApproxStructure, Assertions, Mouse, UiFinder } from '@ephox/agar';
import { GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderListBox } from 'tinymce/themes/silver/ui/dialog/ListBox';

import * as TestExtras from '../../../module/TestExtras';

describe('headless.tinymce.themes.silver.components.listbox.ListBoxAriaTest', () => {
  const extrasHook = TestExtras.bddSetup();

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderListBox({
      context: 'any',
      name: 'selector',
      label: Optional.some('selector'),
      enabled: true,
      items: [
        { value: 'one', text: 'One' },
        { value: 'two', text: 'Two' },
        { value: 'three', text: 'Three' },
      ]
    }, extrasHook.access().extras.backstages.popup, Optional.none())
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        children: [
          s.element('label', {
            classes: [ arr.has('tox-label') ]
          }),
          s.element('div', {
            children: [
              s.element('button', {
                attrs: {
                  'role': str.is('combobox'),
                  'aria-haspopup': str.is('listbox'),
                },
              })
            ]
          })
        ]
      })),
      hook.component().element
    );
  });

  it('Open menu and check children structure', async () => {
    const component = hook.component();
    const gui = hook.gui();
    const sink = extrasHook.access().getPopupSink();
    Representing.setValue(component, 'three');

    Mouse.clickOn(gui.element, '.tox-listbox');
    await UiFinder.pWaitFor('Waiting for menu to appear', sink, '.tox-menu .tox-collection__item');

    const menu = UiFinder.findIn(sink, '.tox-menu').getOrDie();
    Assertions.assertStructure(
      'Checking for aria attributes on menu and items',
      ApproxStructure.build((s, str) => s.element('div', {
        attrs: {
          role: str.is('listbox'),
        },
        children: [
          s.element('div', {
            children: [
              s.element('div', {
                attrs: {
                  'aria-selected': str.is('false'),
                  'role': str.is('option'),
                },
              }),
              s.element('div', {
                attrs: {
                  'aria-selected': str.is('false'),
                  'role': str.is('option'),
                },
              }),
              s.element('div', {
                attrs: {
                  'aria-selected': str.is('true'),
                  'role': str.is('option'),
                },
              }),
            ]
          })
        ]
      })),
      menu
    );
  });
});
