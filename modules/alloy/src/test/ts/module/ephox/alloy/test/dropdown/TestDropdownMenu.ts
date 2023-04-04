import { ApproxStructure, Assertions, Step, StructAssert, TestStore, Waiter } from '@ephox/agar';
import { Arr, Fun, Merger, Obj } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Disabling } from 'ephox/alloy/api/behaviour/Disabling';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { TogglingConfigSpec } from 'ephox/alloy/behaviour/toggling/TogglingTypes';
import * as Tagger from 'ephox/alloy/registry/Tagger';
import { ItemSpec } from 'ephox/alloy/ui/types/ItemTypes';
import { PartialMenuSpec, TieredData, TieredMenuSpec } from 'ephox/alloy/ui/types/TieredMenuTypes';

interface MenuState {
  readonly menuUid: string;
}

interface ItemData {
  value: string;
  meta: any;
}

interface WidgetItem {
  type: 'widget';
  widget: SketchSpec;
  data: ItemData;
}

interface NormalItem {
  type: 'item';
  data: ItemData;
  hasSubmenu?: boolean;
  toggling?: Partial<TogglingConfigSpec> & { exclusive?: boolean };
}

interface SeparatorItem {
  type: 'separator';
  text: string;
}

export type TestItem = WidgetItem | NormalItem | SeparatorItem;

const renderMenu = (spec: { value: string; text?: string; items: ItemSpec[] }): PartialMenuSpec => ({
  dom: {
    tag: 'ol',
    classes: [ 'menu' ],
    attributes: spec.text !== undefined ? {
      'aria-label': spec.text
    } : { }
  },
  items: spec.items,
  components: [
    Menu.parts.items({ })
  ]
});

const renderItem = (spec: TestItem): ItemSpec => {
  switch (spec.type) {
    case 'widget':
      return {
        type: 'widget',
        data: spec.data,
        dom: {
          tag: 'li',
          attributes: {
            'data-value': spec.data.value
          },
          classes: [ 'item-widget' ]
        },
        components: [
          ItemWidget.parts.widget(spec.widget)
        ]
      };

    case 'separator':
      return {
        type: spec.type,
        dom: {
          tag: 'li',
          classes: [ ],
          innerHtml: spec.text
        },
        components: []
      };

    case 'item':
      return {
        type: spec.type,
        data: spec.data,
        hasSubmenu: spec.hasSubmenu,
        dom: {
          tag: 'li',
          attributes: {
            'data-value': spec.data.value,
            'data-test-id': 'item-' + spec.data.value,
            'aria-disabled': spec.data.meta.disabled === true ? true : false,
            'id': spec.data.value
          },
          classes: [ ],
          innerHtml: spec.data.meta.text
        },
        components: [ ],
        toggling: spec.toggling,
        itemBehaviours: Behaviour.derive([
          Disabling.config({
            disabled: () => spec.data.meta.disabled
          })
        ])
      };
  }
};

const part = (store: TestStore): Partial<TieredMenuSpec> => ({
  dom: {
    tag: 'div'
  },
  markers: itemMarkers,
  onExecute: (_dropdown: AlloyComponent, item: AlloyComponent) => {
    const v = Representing.getValue(item);
    return store.adderH('dropdown.menu.execute: ' + v.value)();
  }
});

const mStoreMenuUid = <T>(component: AlloyComponent): Step<T, T & MenuState> =>
  Step.stateful((value: any, next, _die) => {
    const menu = SelectorFind.descendant(component.element, '.menu').getOrDie('Could not find menu');
    const uid = Tagger.readOrDie(menu);
    next(
      Merger.deepMerge(value, { menuUid: uid })
    );
  });

const mWaitForNewMenu = (component: AlloyComponent): Step<MenuState, unknown> =>
  // TODO: Create an API to hide this detail
  Step.raw((value, next, die, logs) => {
    Waiter.sTryUntil(
      'Waiting for a new menu (different uid)',
      Step.sync(() => {
        SelectorFind.descendant(component.element, '.menu').filter((menu) => {
          const uid = Tagger.readOrDie(menu);
          return value.menuUid !== uid;
        }).getOrDie('New menu has not appeared');
      }),
      100,
      3000
    ).runStep(value, next, die, logs);
  });

const assertLazySinkArgs = (expectedTag: string, expectedClass: string, comp: AlloyComponent): void => {
  Assertions.assertStructure(
    'Lazy sink should get passed the right button',
    ApproxStructure.build((s, _str, arr) => s.element(expectedTag, {
      classes: [ arr.has(expectedClass) ]
    })),
    comp.element
  );
};

const getSampleTieredData = (): TieredData => {
  /* Menu structure

  all-menus/
  ├─ menu-a/
  │  ├─ a-alpha
  │  ├─ a-beta/
  │  │  ├─ b-alpha
  │  ├─ a-gamma
*/
  return {
    primary: 'menu-a',
    menus: Obj.map({
      'menu-a': {
        value: 'menu-a',
        items: Arr.map([
          { type: 'item', data: { value: 'a-alpha', meta: { text: 'a-Alpha' }}, hasSubmenu: false },
          { type: 'item', data: { value: 'a-beta', meta: { text: 'a-Beta' }}, hasSubmenu: true },
          { type: 'item', data: { value: 'a-gamma', meta: { text: 'a-Gamma' }}, hasSubmenu: false }
        ], renderItem)
      },
      'a-beta': { // menu name should be triggering parent item so TieredMenuSpec path works
        value: 'menu-b',
        items: Arr.map([
          { type: 'item', data: { value: 'b-alpha', meta: { text: 'b-Alpha' }}, hasSubmenu: false }
        ], renderItem)
      }
    }, renderMenu),
    expansions: {
      'a-beta': 'a-beta'
    }
  };
};

// ASSUMPTION: the ApproxStructure.build arguments s, str, arr are always the same
// so we don't need to pass the originals through to functions.
const structNotActiveItem = ApproxStructure.build((s, str, arr) => s.element('li', {
  classes: [ arr.has('item'), arr.not('selected-item') ]
}));

const structActiveItem = ApproxStructure.build((s, str, arr) => s.element('li', {
  classes: [ arr.has('item'), arr.has('selected-item') ]
}));

const itemsHaveActiveStates = (states: boolean[]): StructAssert[] => Arr.map(states, (s) => {
  return s ? structActiveItem : structNotActiveItem;
});

const itemMarkers: TieredMenuSpec['markers'] = {
  item: 'item',
  selectedItem: 'selected-item',
  menu: 'menu',
  selectedMenu: 'selected-menu',
  backgroundMenu: 'background-menu'
};

const markers = Fun.constant(itemMarkers);

export {
  assertLazySinkArgs,
  renderItem,
  renderMenu,
  part,
  markers,
  mWaitForNewMenu,
  mStoreMenuUid,
  getSampleTieredData,
  structNotActiveItem,
  structActiveItem,
  itemsHaveActiveStates
};
