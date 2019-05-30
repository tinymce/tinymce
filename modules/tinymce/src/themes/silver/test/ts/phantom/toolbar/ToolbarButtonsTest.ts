import { ApproxStructure, Assertions, Logger, Mouse, Step, Waiter } from '@ephox/agar';
import { GuiFactory, AlloyComponent, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Menu, Toolbar } from '@ephox/bridge';
import { Arr, Cell, Option } from '@ephox/katamari';
import { Attr, Class, SelectorFind } from '@ephox/sugar';

import { renderMenuButton, renderToolbarButton, renderToolbarToggleButton, renderSplitButton } from 'tinymce/themes/silver/ui/toolbar/button/ToolbarButtons';
import TestExtras from '../../module/TestExtras';
import TestProviders from '../../module/TestProviders';

UnitTest.asynctest('Toolbar Buttons Test', (success, failure) => {

  const helpers = TestExtras();

  const shouldDisable = Cell(false);
  const shouldActivate = Cell(false);

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        {
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
                  disabled: false,
                  tooltip: Option.some('tooltip'),
                  icon: Option.none(),
                  text: Option.some('button1'),
                  onSetup: (api: Toolbar.ToolbarButtonInstanceApi) => {
                    store.adder('onSetup.1')();
                    return () => { };
                  },
                  onAction: (api: Toolbar.ToolbarButtonInstanceApi) => {
                    store.adder('onAction.1')();
                    api.setDisabled(shouldDisable.get());
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
                  disabled: false,
                  active: false,
                  tooltip: Option.some('tooltip'),
                  icon: Option.none(),
                  text: Option.some('button2'),
                  onSetup: (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
                    store.adder('onSetup.2')();
                    return () => { };
                  },
                  onAction: (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
                    store.adder('onToggleAction.2')();
                    api.setDisabled(shouldDisable.get());
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
                  tooltip: Option.some('tooltip'),
                  icon: Option.none(),
                  text: Option.some('button3'),
                  columns: 1,
                  presets: 'normal',
                  select: Option.none(),
                  fetch: (callback) => {
                    callback([
                      {
                        type: 'choiceitem',
                        text: 'Item 1'
                      }
                    ]);
                  },
                  onSetup: (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
                    store.adder('onSetup.3')();
                    return () => { };
                  },
                  onAction: (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
                    store.adder('onToggleAction.3')();
                    api.setDisabled(shouldDisable.get());
                    api.setActive(shouldActivate.get());
                  },
                  onItemAction: (api: Toolbar.ToolbarToggleButtonInstanceApi, value: string) => {
                    store.adder('onItemAction.3')();
                    api.setActive(true);
                  }
                }, helpers.shared)
              ]
            },

            {
              dom: {
                tag: 'div',
                classes: [ 'button4-container' ]
              },
              components: [
                renderMenuButton({
                  type: 'menubutton',
                  tooltip: Option.some('tooltip'),
                  icon: Option.none(),
                  text: Option.some('button4'),
                  fetch: (callback) => {
                    callback([
                      {
                        type: 'menuitem',
                        text: 'Item 1',
                        onAction: (api: Menu.MenuItemInstanceApi) => {
                          store.adder('onAction.4')();
                        },
                      }
                    ]);
                  },
                  onSetup: (api: Toolbar.ToolbarMenuButtonInstanceApi) => {
                    store.adder('onSetup.4')();
                    return () => { };
                  },
                }, 'tox-mbtn', helpers.backstage, Option.none())
              ]
            },
          ]
        }
      );
    },
    (doc, body, gui, component: AlloyComponent, store) => {
      const getButton = (selector: string) => {
        return component.getSystem().getByDom(
          SelectorFind.descendant(component.element(), selector).getOrDie(
            `Could not find button defined by: ${selector}`
          )
        ).getOrDie();
      };

      const sAssertButtonDisabledState = (label: string, expected: boolean, button: AlloyComponent) => {
        return Step.sync(() => {
          Assertions.assertEq('Checking if disabled attr is present: ' + label, expected, Attr.has(button.element(), 'disabled'));
        });
      };

      const sAssertButtonActiveState = (label: string, expected: boolean, button: AlloyComponent) => {
        return Step.sync(() => {
          Assertions.assertEq(label, expected, Class.has(button.element(), 'tox-tbtn--enabled'));
        });
      };

      const sAssertSplitButtonDisabledState = (label: string, expected: boolean, button: AlloyComponent) => {
        return Step.sync(() => {
          Assertions.assertEq('Checking if aria-disabled attr is present: ' + label, expected, Attr.get(button.element(), 'aria-disabled') === 'true');
          Assertions.assertEq('Checking if disabled class is present: ' + label, expected, Class.has(button.element(), 'tox-tbtn--disabled'));
        });
      };

      const sAssertSplitButtonActiveState = (label: string, expected: boolean, button: AlloyComponent) => {
        return Step.sync(() => {
          Assertions.assertEq(label, expected, Attr.get(button.element(), 'aria-pressed') === 'true');
        });
      };

      return Arr.flatten([
        (() => {
          return [
            store.sAssertEq('Store should have setups only', ['onSetup.1', 'onSetup.2', 'onSetup.3', 'onSetup.4']),
            store.sClear
          ];
        })(),

        (() => {
          const button1 = getButton('.button1-container .tox-tbtn');
          return Logger.ts(
            'First button (button1): normal button',
            [
              Assertions.sAssertStructure(
                'Checking initial structure',
                ApproxStructure.build((s, str, arr) => {
                  return s.element('button', {
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
                  });
                }),
                button1.element()
              ),
              Mouse.sClickOn(component.element(), '.button1-container .tox-tbtn'),
              store.sAssertEq('Store should now have action1', [ 'onAction.1' ]),
              sAssertButtonDisabledState('Enabled', false, button1),
              store.sClear,

              Step.sync(() => {
                shouldDisable.set(true);
              }),
              Mouse.sClickOn(component.element(), '.button1-container .tox-tbtn'),
              store.sAssertEq('Store have action', [ 'onAction.1' ]),
              sAssertButtonDisabledState('Disabled', true, button1),
              store.sClear,
              Mouse.sClickOn(component.element(), '.button1-container .tox-tbtn'),
              store.sAssertEq('No actions should come through a disabled button', [ ])
            ]
          );
        })(),

        (() => {
          const button2 = getButton('.button2-container .tox-tbtn');

          return Logger.ts('Second button (button2): toggle button', [
            Step.sync(() => {
              shouldDisable.set(false);
              shouldActivate.set(false);
            }),
            Mouse.sClickOn(component.element(), '.button2-container .tox-tbtn'),
            store.sAssertEq('Store should have action2', [ 'onToggleAction.2' ]),
            store.sClear,
            sAssertButtonDisabledState('Enabled', false, button2),
            sAssertButtonActiveState('Off', false, button2),

            Step.sync(() => {
              shouldActivate.set(true);
            }),
            Mouse.sClickOn(component.element(), '.button2-container .tox-tbtn'),
            store.sAssertEq('Store should have action2', [ 'onToggleAction.2' ]),
            store.sClear,
            sAssertButtonDisabledState('Disabled', false, button2),
            sAssertButtonActiveState('Off', true, button2),

            Step.sync(() => {
              shouldActivate.set(false);
            }),
            Mouse.sClickOn(component.element(), '.button2-container .tox-tbtn'),
            store.sAssertEq('Store should have action2', [ 'onToggleAction.2' ]),
            store.sClear,
            sAssertButtonDisabledState('Disabled', false, button2),
            sAssertButtonActiveState('Off', false, button2),

            Step.sync(() => {
              shouldDisable.set(true);
            }),
            Mouse.sClickOn(component.element(), '.button2-container .tox-tbtn'),
            store.sAssertEq('Store should now have action2', [ 'onToggleAction.2' ]),
            store.sClear,
            sAssertButtonDisabledState('Disabled', true, button2),
            sAssertButtonActiveState('Off still', false, button2)
          ]);
        })(),

        (() => {
          const button3 = getButton('.button3-container .tox-split-button');

          return Logger.ts('Third button (button3): split button', [
            Assertions.sAssertStructure(
              'Checking initial structure',
              ApproxStructure.build((s, str, arr) => {
                return s.element('div', {
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
                });
              }),
              button3.element()
            ),

            Step.sync(() => {
              shouldDisable.set(false);
              shouldActivate.set(false);
            }),
            // Toggle button
            Mouse.sClickOn(component.element(), '.button3-container .tox-split-button .tox-tbtn'),
            store.sAssertEq('Store should have action3', [ 'onToggleAction.3' ]),
            store.sClear,
            sAssertSplitButtonDisabledState('Enabled', false, button3),
            sAssertSplitButtonActiveState('Off', false, button3),

            // Menu item selected
            Mouse.sClickOn(component.element(), '.button3-container .tox-split-button .tox-split-button__chevron'),
            Waiter.sTryUntil('Wait for split button menu item to show',
              Mouse.sClickOn(body, '.tox-collection .tox-collection__item'),
              100, 1000
            ),
            store.sAssertEq('Store should have item action3', [ 'onItemAction.3' ]),
            store.sClear,
            sAssertSplitButtonDisabledState('Enabled', false, button3),
            sAssertSplitButtonActiveState('Off', true, button3),

            Step.sync(() => {
              shouldActivate.set(true);
            }),
            Mouse.sClickOn(component.element(), '.button3-container .tox-split-button .tox-tbtn'),
            store.sAssertEq('Store should have action3', [ 'onToggleAction.3' ]),
            store.sClear,
            sAssertSplitButtonDisabledState('Disabled', false, button3),
            sAssertSplitButtonActiveState('Off', true, button3),

            Step.sync(() => {
              shouldActivate.set(false);
            }),
            Mouse.sClickOn(component.element(), '.button3-container .tox-split-button .tox-tbtn'),
            store.sAssertEq('Store should have action3', [ 'onToggleAction.3' ]),
            store.sClear,
            sAssertSplitButtonDisabledState('Disabled', false, button3),
            sAssertSplitButtonActiveState('Off', false, button3),

            Step.sync(() => {
              shouldDisable.set(true);
            }),
            Mouse.sClickOn(component.element(), '.button3-container .tox-split-button .tox-tbtn'),
            store.sAssertEq('Store should now have action3', [ 'onToggleAction.3' ]),
            store.sClear,
            sAssertSplitButtonDisabledState('Disabled', true, button3),
            sAssertSplitButtonActiveState('Off still', false, button3)
          ]);
        })(),

        (() => {
          const button4 = getButton('.button4-container .tox-mbtn');

          return Logger.ts('Fourth button (button4): menu button', [
            Assertions.sAssertStructure(
              'Checking initial structure',
              ApproxStructure.build((s, str, arr) => {
                return s.element('button', {
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
                });
              }),
              button4.element()
            ),

            // Select menu item
            Mouse.sClickOn(component.element(), '.button4-container .tox-mbtn'),
            Waiter.sTryUntil('Wait for button menu to show',
              Mouse.sClickOn(body, '.tox-collection .tox-collection__item'),
              100, 1000
            ),
            store.sAssertEq('Store should have item action4', [ 'onAction.4' ]),
            store.sClear
          ]);
        })()
      ]);
    },
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});