import { ApproxStructure, Assertions, TestStore } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { Focus, SugarElement } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';

/* Menu structure

  all-menus/
  ├─ menu-a/
  │  ├─ a-alpha
  │  ├─ a-beta/
  │  │  ├─ b-alpha
  │  ├─ a-gamma
*/
const makeComponent = () => (_store: TestStore, _doc: SugarElement<Document>, _body: SugarElement<Node>) => {
  return GuiFactory.build(
    TieredMenu.sketch({
      dom: {
        tag: 'div',
        classes: [ 'this-test-tiered-menu' ]
      },

      components: [ ],
      data: TestDropdownMenu.getSampleTieredData(),
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

  it('TINY-8952: Check highlights on menu items still occur when using fakeFocus', () => {
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
