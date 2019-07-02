import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Objects } from '@ephox/boulder';
import { Arr, Obj } from '@ephox/katamari';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as MenuEvents from 'ephox/alloy/menu/util/MenuEvents';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('TieredMenuWithoutImmediateHighlightTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      TieredMenu.sketch({
        uid: 'uid-test-menu-1',
        dom: {
          tag: 'div',
          classes: [ 'test-menu' ]
        },
        components: [
          Menu.parts().items({ })
        ],

        markers: TestDropdownMenu.markers(),
        highlightImmediately: false,

        data: {
          primary: 'menu-a',
          menus: Obj.map({
            'menu-a': {
              value: 'menu-a',
              items: Arr.map([
                { type: 'item', data: { value: 'a-alpha', meta: { text: 'a-Alpha' } }, hasSubmenu: false },
                { type: 'item', data: { value: 'a-beta', meta: { text: 'a-Beta' } }, hasSubmenu: true },
                { type: 'item', data: { value: 'a-gamma', meta: { text: 'a-Gamma' } }, hasSubmenu: false }
              ], TestDropdownMenu.renderItem)
            },
            'a-beta': { // menu name should be triggering parent item so TieredMenuSpec path works
              value: 'menu-b',
              items: Arr.map([
                { type: 'item', data: { value: 'b-alpha', meta: { text: 'b-Alpha' } }, hasSubmenu: false }
              ], TestDropdownMenu.renderItem)
            }
          }, TestDropdownMenu.renderMenu),
          expansions: {
            'a-beta': 'a-beta'
          }
        },

        tmenuBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('tiered-menu-test', [
            AlloyEvents.run(MenuEvents.focus(), store.adder('menu.events.focus'))
          ])
        ]),

        eventOrder: Objects.wrapAll([
          {
            key: MenuEvents.focus(),
            value: [ 'alloy.base.behaviour', 'tiered-menu-test' ]
          }
        ]),

        onExecute: store.adderH('onExecute'),
        onEscape: store.adderH('onEscape'),
        onOpenMenu: store.adderH('onOpenMenu'),
        onOpenSubmenu: store.adderH('onOpenSubmenu')
      })
    );
  }, (doc, body, gui, component, store) => {
    return [
      Assertions.sAssertStructure(
        'Original structure test',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('test-menu') ],
            children: [
              s.element('ol', {
                classes: [ arr.has('menu'), arr.not('selected-menu') ],
                children: [
                  s.element('li', {
                    classes: [ arr.has('item'), arr.not('selected-item') ],
                    attrs: {
                      'aria-haspopup': str.is('false')
                    }
                  }),
                  s.element('li', {
                    classes: [ arr.has('item'), arr.not('selected-item') ],
                    attrs: {
                      'aria-haspopup': str.is('true'),
                      'aria-expanded': str.is('false')
                    }
                  }),
                  s.element('li', {
                    classes: [ arr.has('item'), arr.not('selected-item') ],
                    attrs: {
                      'aria-haspopup': str.is('false')
                    }
                  })
                ]
              })
            ]
          });
        }),
        component.element()
      ),

      store.sAssertEq('Focus is fired as soon as the tiered menu is active', [
        'onOpenMenu'
      ]),

      Step.sync(() => {
        TieredMenu.highlightPrimary(component);
      }),
      store.sAssertEq('Focus is fired as soon as the tiered menu is highlighted by API', [
        'onOpenMenu',
        'menu.events.focus',
      ]),

      Assertions.sAssertStructure(
        'Checking after TieredMenu.highlightPrimary, menu is active (item and menu selected)',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('test-menu') ],
            children: [
              s.element('ol', {
                classes: [ arr.has('menu'), arr.has('selected-menu') ],
                children: [
                  s.element('li', {
                    classes: [ arr.has('item'), arr.has('selected-item') ],
                    attrs: {
                      'aria-haspopup': str.is('false')
                    }
                  }),
                  s.element('li', {
                    classes: [ arr.has('item'), arr.not('selected-item') ],
                    attrs: {
                      'aria-haspopup': str.is('true'),
                      'aria-expanded': str.is('false')
                    }
                  }),
                  s.element('li', {
                    classes: [ arr.has('item'), arr.not('selected-item') ],
                    attrs: {
                      'aria-haspopup': str.is('false')
                    }
                  })
                ]
              })
            ]
          });
        }),
        component.element()
      )
    ];
  }, () => { success(); }, failure);
});
