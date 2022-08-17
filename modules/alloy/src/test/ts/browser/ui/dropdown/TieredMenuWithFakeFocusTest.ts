import { ApproxStructure, Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { TestStore } from 'ephox/alloy/api/testhelpers/TestHelpers';
import { TieredData, tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';

/* Menu structure

  all-menus/
  ├─ menu-a/
  │  ├─ a-alpha
  │  ├─ a-beta/
  │  │  ├─ b-alpha
  │  ├─ a-gamma
*/
const testTieredData: TieredData = {
  primary: 'menu-a',
  menus: Obj.map({
    'menu-a': {
      value: 'menu-a',
      items: Arr.map([
        { type: 'item', data: { value: 'a-alpha', meta: { text: 'a-Alpha' }}, hasSubmenu: false },
        { type: 'item', data: { value: 'a-beta', meta: { text: 'a-Beta' }}, hasSubmenu: true },
        { type: 'item', data: { value: 'a-gamma', meta: { text: 'a-Gamma' }}, hasSubmenu: false }
      ], TestDropdownMenu.renderItem)
    },
    'a-beta': { // menu name should be triggering parent item so TieredMenuSpec path works
      value: 'menu-b',
      items: Arr.map([
        { type: 'item', data: { value: 'b-alpha', meta: { text: 'b-Alpha' }}, hasSubmenu: false }
      ], TestDropdownMenu.renderItem)
    }
  }, TestDropdownMenu.renderMenu),
  expansions: {
    'a-beta': 'a-beta'
  }
};

const makeComponent = () => (_store: TestStore, _doc: SugarElement<Document>, _body: SugarElement<Node>) => {
  return GuiFactory.build(
    TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [ 'this-test-tiered-menu' ]
      },

      components: [ ],
      data: testTieredData,
      fakeFocus: true,
      onEscape: Optional.none,
      onExecute: Optional.none,
      onOpenSubmenu: Fun.noop,
      onOpenMenu: Fun.noop,
      markers: TestDropdownMenu.markers()
    })
  );
};

describe('browser.alloy.ui.dropdown.TieredMenuWithFakeFocusTest', () => {
  const hook = GuiSetup.bddSetup(makeComponent());

  it('Check highlights on menu items still occur when using fakeFocus', () => {
    const tmenuComp = hook.component();
    const gui = hook.gui();

    const otherFocus = GuiFactory.build({
      dom: {
        tag: 'input'
      }
    });
    gui.add(otherFocus);

    // Firstly, focus something else.
    Focus.focus(otherFocus.element);

    // Now, highlight an item in the TieredMenu, and check that we did get
    // a highlighted item.
    TieredMenu.highlightPrimary(tmenuComp);

    Assertions.assertStructure(
      'Things',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('this-test-tiered-menu') ],
          children: [
            s.element('ol', {
              classes: [ arr.has('menu') ],
              children: [
                s.element('li', {
                  classes: [ arr.has('selected-item') ]
                }),
                s.element('li', {
                  classes: [ arr.not('selected-item') ]
                }),
                s.element('li', {
                  classes: [ arr.not('selected-item') ]
                })
              ]
            })
          ]
        });
      }),
      tmenuComp.element
    );
  });
});