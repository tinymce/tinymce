import { ApproxStructure, Assertions, Mouse, Waiter } from '@ephox/agar';
import { AlloyComponent, GuiFactory, TestHelpers } from '@ephox/alloy';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Menu, Toolbar } from '@ephox/bridge';
import { Cell, Fun, Optional } from '@ephox/katamari';
import { Attribute, Class, SelectorFind } from '@ephox/sugar';
import { assert } from 'chai';

import { renderMenuButton } from 'tinymce/themes/silver/ui/button/MenuButton';
import { renderSplitButton, renderToolbarButton, renderToolbarToggleButton } from 'tinymce/themes/silver/ui/toolbar/button/ToolbarButtons';

import * as TestExtras from '../../module/TestExtras';
import TestProviders from '../../module/TestProviders';

describe('headless.tinymce.themes.silver.toolbar.ToolbarButtonsTest', () => {
  const shouldDisable = Cell(false);
  const shouldActivate = Cell(false);
  const extrasHook = TestExtras.bddSetup();

  const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'div'
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'button1-container' ]
        },
        components: [
          renderToolbarButton({
            type: 'button',
            enabled: true,
            tooltip: Optional.some('tooltip'),
            icon: Optional.none(),
            text: Optional.some('button1'),
            onSetup: (_api: Toolbar.ToolbarButtonInstanceApi) => {
              store.adder('onSetup.1')();
              return Fun.noop;
            },
            onAction: (api: Toolbar.ToolbarButtonInstanceApi) => {
              store.adder('onAction.1')();
              api.setEnabled(!shouldDisable.get());
            }
          }, TestProviders)
        ]
      },

      {
        dom: {
          tag: 'div',
          classes: [ 'button2-container' ]
        },
        components: [
          renderToolbarToggleButton({
            type: 'togglebutton',
            enabled: true,
            active: false,
            tooltip: Optional.some('tooltip'),
            icon: Optional.none(),
            text: Optional.some('button2'),
            onSetup: (_api: Toolbar.ToolbarToggleButtonInstanceApi) => {
              store.adder('onSetup.2')();
              return Fun.noop;
            },
            onAction: (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
              store.adder('onToggleAction.2')();
              api.setEnabled(!shouldDisable.get());
              api.setActive(shouldActivate.get());
            }
          }, TestProviders)
        ]
      },

      {
        dom: {
          tag: 'div',
          classes: [ 'button3-container' ]
        },
        components: [
          renderSplitButton({
            type: 'splitbutton',
            tooltip: Optional.some('tooltip'),
            icon: Optional.none(),
            text: Optional.some('button3'),
            columns: 1,
            presets: 'normal',
            select: Optional.none(),
            fetch: (callback) => {
              callback([
                {
                  type: 'choiceitem',
                  text: 'Item 1',
                  value: 'item1'
                }
              ]);
            },
            onSetup: (_api: Toolbar.ToolbarSplitButtonInstanceApi) => {
              store.adder('onSetup.3')();
              return Fun.noop;
            },
            onAction: (api: Toolbar.ToolbarSplitButtonInstanceApi) => {
              store.adder('onToggleAction.3')();
              api.setEnabled(!shouldDisable.get());
              api.setActive(shouldActivate.get());
            },
            onItemAction: (api: Toolbar.ToolbarSplitButtonInstanceApi, _value: string) => {
              store.adder('onItemAction.3')();
              api.setActive(true);
            }
          }, extrasHook.access().extras.backstages.popup.shared)
        ]
      },

      {
        dom: {
          tag: 'div',
          classes: [ 'button4-container' ]
        },
        components: [
          renderMenuButton({
            tooltip: Optional.some('tooltip'),
            icon: Optional.none(),
            text: Optional.some('button4'),
            search: Optional.none(),
            fetch: (callback) => {
              callback([
                {
                  type: 'menuitem',
                  text: 'Item 1',
                  onAction: (_api: Menu.MenuItemInstanceApi) => {
                    store.adder('onAction.4')();
                  }
                }
              ]);
            },
            onSetup: (_api: Toolbar.ToolbarMenuButtonInstanceApi) => {
              store.adder('onSetup.4')();
              return Fun.noop;
            }
          }, 'tox-mbtn', extrasHook.access().extras.backstages.popup, Optional.none())
        ]
      }
    ]
  }));

  const getButton = (selector: string) => {
    const component = hook.component();
    return component.getSystem().getByDom(
      SelectorFind.descendant(component.element, selector).getOrDie(
        `Could not find button defined by: ${selector}`
      )
    ).getOrDie();
  };

  const assertButtonDisabledState = (label: string, expected: boolean, button: AlloyComponent) => {
    assert.equal(Class.has(button.element, 'tox-tbtn--disabled'), expected, 'Checking if disabled class is present: ' + label);
  };

  const assertButtonActiveState = (label: string, expected: boolean, button: AlloyComponent) => {
    assert.equal(Class.has(button.element, 'tox-tbtn--enabled'), expected, label);
  };

  const assertSplitButtonDisabledState = (label: string, expected: boolean, button: AlloyComponent) => {
    assert.equal(Attribute.get(button.element, 'aria-disabled') === 'true', expected, 'Checking if aria-disabled attr is present: ' + label);
    assert.equal(Class.has(button.element, 'tox-tbtn--disabled'), expected, 'Checking if disabled class is present: ' + label);
  };

  const assertSplitButtonActiveState = (label: string, expected: boolean, button: AlloyComponent) => {
    assert.equal(Attribute.get(button.element, 'aria-pressed') === 'true', expected, label);
  };

  afterEach(() => {
    shouldDisable.set(false);
    shouldActivate.set(false);
  });

  it('Check initial event state', () => {
    const store = hook.store();
    store.assertEq('Store should have setups only', [ 'onSetup.1', 'onSetup.2', 'onSetup.3', 'onSetup.4' ]);
  });

  it('First button (button1): normal button', () => {
    const component = hook.component();
    const store = hook.store();
    store.clear();

    const button1 = getButton('.button1-container .tox-tbtn');
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('button', {
        classes: [ arr.has('tox-tbtn') ],
        attrs: {
          'type': str.is('button'),
          'title': str.is('tooltip'),
          'aria-label': str.is('tooltip')
        },
        children: [
          s.element('span', {
            classes: [ arr.has('tox-tbtn__select-label') ]
          })
        ]
      })),
      button1.element
    );
    Mouse.clickOn(component.element, '.button1-container .tox-tbtn');
    store.assertEq('Store should now have action1', [ 'onAction.1' ]);
    assertButtonDisabledState('Enabled', false, button1);
    store.clear();

    shouldDisable.set(true);
    Mouse.clickOn(component.element, '.button1-container .tox-tbtn');
    store.assertEq('Store have action', [ 'onAction.1' ]);
    assertButtonDisabledState('Disabled', true, button1);
    store.clear();
    Mouse.clickOn(component.element, '.button1-container .tox-tbtn');
    store.assertEq('No actions should come through a disabled button', [ ]);
  });

  it('Second button (button2): toggle button', () => {
    const component = hook.component();
    const store = hook.store();
    store.clear();

    const button2 = getButton('.button2-container .tox-tbtn');
    Mouse.clickOn(component.element, '.button2-container .tox-tbtn');
    store.assertEq('Store should have action2', [ 'onToggleAction.2' ]);
    store.clear();
    assertButtonDisabledState('Enabled', false, button2);
    assertButtonActiveState('Off', false, button2);

    shouldActivate.set(true);
    Mouse.clickOn(component.element, '.button2-container .tox-tbtn');
    store.assertEq('Store should have action2', [ 'onToggleAction.2' ]);
    store.clear();
    assertButtonDisabledState('Disabled', false, button2);
    assertButtonActiveState('Off', true, button2);

    shouldActivate.set(false);
    Mouse.clickOn(component.element, '.button2-container .tox-tbtn');
    store.assertEq('Store should have action2', [ 'onToggleAction.2' ]);
    store.clear();
    assertButtonDisabledState('Disabled', false, button2);
    assertButtonActiveState('Off', false, button2);

    shouldDisable.set(true);
    Mouse.clickOn(component.element, '.button2-container .tox-tbtn');
    store.assertEq('Store should now have action2', [ 'onToggleAction.2' ]);
    store.clear();
    assertButtonDisabledState('Disabled', true, button2);
    assertButtonActiveState('Off still', false, button2);
  });

  it('Third button (button3): split button', async () => {
    const body = hook.body();
    const component = hook.component();
    const store = hook.store();
    store.clear();

    const button3 = getButton('.button3-container .tox-split-button');
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-split-button') ],
        attrs: {
          'role': str.is('button'),
          'title': str.is('tooltip'),
          'aria-label': str.is('tooltip'),
          'aria-expanded': str.is('false'),
          'aria-haspopup': str.is('true'),
          'aria-pressed': str.is('false')
        },
        children: [
          s.element('span', {
            attrs: {
              role: str.is('presentation')
            },
            classes: [ arr.has('tox-tbtn'), arr.has('tox-tbtn--select') ]
          }),
          s.element('span', {
            attrs: {
              role: str.is('presentation')
            },
            classes: [ arr.has('tox-tbtn'), arr.has('tox-split-button__chevron') ]
          }),
          s.element('span', {
            attrs: {
              'aria-hidden': str.is('true'),
              'style': str.contains('display: none;')
            },
            children: [
              s.text(str.is('To open the popup, press Shift+Enter'))
            ]
          })
        ]
      })),
      button3.element
    );

    // Toggle button
    Mouse.clickOn(component.element, '.button3-container .tox-split-button .tox-tbtn');
    store.assertEq('Store should have action3', [ 'onToggleAction.3' ]);
    store.clear();
    assertSplitButtonDisabledState('Enabled', false, button3);
    assertSplitButtonActiveState('Off', false, button3);

    // Menu item selected
    Mouse.clickOn(component.element, '.button3-container .tox-split-button .tox-split-button__chevron');
    await Waiter.pTryUntil('Wait for split button menu item to show',
      () => Mouse.clickOn(body, '.tox-collection .tox-collection__item')
    );
    store.assertEq('Store should have item action3', [ 'onItemAction.3' ]);
    store.clear();
    assertSplitButtonDisabledState('Enabled', false, button3);
    assertSplitButtonActiveState('Off', true, button3);

    shouldActivate.set(true);
    Mouse.clickOn(component.element, '.button3-container .tox-split-button .tox-tbtn');
    store.assertEq('Store should have action3', [ 'onToggleAction.3' ]);
    store.clear();
    assertSplitButtonDisabledState('Disabled', false, button3);
    assertSplitButtonActiveState('Off', true, button3);

    shouldActivate.set(false);
    Mouse.clickOn(component.element, '.button3-container .tox-split-button .tox-tbtn');
    store.assertEq('Store should have action3', [ 'onToggleAction.3' ]);
    store.clear();
    assertSplitButtonDisabledState('Disabled', false, button3);
    assertSplitButtonActiveState('Off', false, button3);

    shouldDisable.set(true);
    Mouse.clickOn(component.element, '.button3-container .tox-split-button .tox-tbtn');
    store.assertEq('Store should now have action3', [ 'onToggleAction.3' ]);
    store.clear();
    assertSplitButtonDisabledState('Disabled', true, button3);
    assertSplitButtonActiveState('Off still', false, button3);

    // TINY-9504: The button is disabled now. Clicking on it should not call onAction callback.
    Mouse.clickOn(component.element, '.button3-container .tox-split-button .tox-tbtn');
    store.assertEq('Store should not have action3', [ ]);
    assertSplitButtonDisabledState('Disabled', true, button3);
    assertSplitButtonActiveState('Off still', false, button3);
  });

  it('Fourth button (button4): menu button', async () => {
    const body = hook.body();
    const component = hook.component();
    const store = hook.store();
    store.clear();

    const button4 = getButton('.button4-container .tox-mbtn');
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('button', {
        classes: [
          arr.has('tox-mbtn'),
          arr.has('tox-mbtn--select')
        ],
        attrs: {
          'type': str.is('button'),
          'title': str.is('tooltip'),
          'aria-label': str.is('tooltip'),
          'aria-expanded': str.is('false'),
          'aria-haspopup': str.is('true')
        },
        children: [
          s.element('span', {
            classes: [ arr.has('tox-mbtn__select-label') ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-mbtn__select-chevron') ]
          })
        ]
      })),
      button4.element
    );

    // Select menu item
    Mouse.clickOn(component.element, '.button4-container .tox-mbtn');
    await Waiter.pTryUntil('Wait for button menu to show',
      () => Mouse.clickOn(body, '.tox-collection .tox-collection__item')
    );
    store.assertEq('Store should have item action4', [ 'onAction.4' ]);
  });
});
