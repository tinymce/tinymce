import { ApproxStructure, Assertions, Logger, Mouse, Step } from '@ephox/agar';
import { ComponentApi, GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Toolbar } from '@ephox/bridge';
import { Arr, Cell, Option } from '@ephox/katamari';
import { Attr, Class, SelectorFind } from '@ephox/sugar';

import { renderToolbarButton, renderToolbarToggleButton } from '../../../../main/ts/ui/toolbar/button/ToolbarButtons';
import { GuiSetup } from '../../module/AlloyTestUtils';
import { setupDemo } from '../../../../demo/ts/components/DemoHelpers';

UnitTest.asynctest('Toolbar Buttons Test', (success, failure) => {
  const helpers = setupDemo();
  const providers = helpers.extras.backstage.shared.providers;

  const shouldDisable = Cell(false);
  const shouldActivate = Cell(false);

  GuiSetup.setup(
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
                }, providers)
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
                }, providers)
              ]
            },

          ]
        }
      );
    },
    (doc, body, gui, component: ComponentApi.AlloyComponent, store) => {
      const getButton = (selector: string) => {
        return component.getSystem().getByDom(
          SelectorFind.descendant(component.element(), selector).getOrDie(
            `Could not find button defined by: ${selector}`
          )
        ).getOrDie();
      };

      const sAssertButtonDisabledState = (label: string, expected: boolean, button: ComponentApi.AlloyComponent) => {
        return Step.sync(() => {
          Assertions.assertEq('Checking if disabled attr is present: ' + label, expected, Attr.has(button.element(), 'disabled'));
        });
      };

      const sAssertButtonActiveState = (label: string, expected: boolean, button: ComponentApi.AlloyComponent) => {
        return Step.sync(() => {
          Assertions.assertEq(label, expected, Class.has(button.element(), 'tox-tbtn--enabled'));
        });
      };

      return Arr.flatten([
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
              store.sAssertEq('Store should have setups only', [ 'onSetup.1', 'onSetup.2' ]),
              store.sClear,
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

        // TODO: Split Button test
      ]);
    },
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});