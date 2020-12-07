import { ApproxStructure, Assertions, Step, Waiter } from '@ephox/agar';
import { Merger } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { TestStore } from 'ephox/alloy/api/testhelpers/TestStore';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import * as Tagger from 'ephox/alloy/registry/Tagger';
import { ItemSpec } from 'ephox/alloy/ui/types/ItemTypes';
import { PartialMenuSpec, TieredMenuSpec } from 'ephox/alloy/ui/types/TieredMenuTypes';

interface MenuState {
  readonly menuUid: string;
}

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

const renderItem = (spec: { type: any; widget?: any; data: { value: string; meta: any }; hasSubmenu?: boolean}): ItemSpec => spec.type === 'widget' ? {
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
} : {
  type: spec.type,
  data: spec.data,
  hasSubmenu: spec.hasSubmenu,
  dom: {
    tag: 'li',
    attributes: {
      'data-value': spec.data.value,
      'data-test-id': 'item-' + spec.data.value
    },
    classes: [ ],
    innerHtml: spec.data.meta.text
  },
  components: [ ]
};

const part = (store: TestStore): Partial<TieredMenuSpec> => ({
  dom: {
    tag: 'div'
  },
  markers: itemMarkers,
  onExecute(_dropdown: AlloyComponent, item: AlloyComponent) {
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
    'Lazy sink should get passed the split button',
    ApproxStructure.build((s, _str, arr) => s.element(expectedTag, {
      classes: [ arr.has(expectedClass) ]
    })),
    comp.element
  );
};

const itemMarkers = {
  item: 'item',
  selectedItem: 'selected-item',
  menu: 'menu',
  selectedMenu: 'selected-menu',
  backgroundMenu: 'background-menu'
};

const markers = (): TieredMenuSpec['markers'] => itemMarkers;

export {
  assertLazySinkArgs,
  renderItem,
  renderMenu,
  part,
  markers,
  mWaitForNewMenu,
  mStoreMenuUid
};
