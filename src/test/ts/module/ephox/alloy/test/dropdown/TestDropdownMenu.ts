import { Step, Waiter } from '@ephox/agar';
import { Fun, Merger } from '@ephox/katamari';
import { Attr, SelectorFind } from '@ephox/sugar';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as ItemWidget from 'ephox/alloy/api/ui/ItemWidget';
import { Menu } from 'ephox/alloy/api/ui/Menu';
import { ItemSpec } from 'ephox/alloy/ui/types/ItemTypes';
import { MenuSpec } from 'ephox/alloy/ui/types/MenuTypes';
import * as Tagger from 'ephox/alloy/registry/Tagger';

const renderMenu = (spec): Partial<MenuSpec> => {
  return {
    dom: {
      tag: 'ol',
      classes: [ 'menu' ],
      attributes: spec.text !== undefined ? {
        'aria-label': spec.text
      } : { }
    },
    items: spec.items,
    components: [
      Menu.parts().items({ })
    ]
  };
};

const renderItem = (spec: { type: any, widget?: any, data: { value: string, meta: any }}): ItemSpec => {
  return spec.type === 'widget' ? {
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
      ItemWidget.parts().widget(spec.widget)
    ]
  } : {
    type: spec.type,
    data: spec.data,
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
};

const part = (store) => {
  return {
    dom: {
      tag: 'div'
    },
    markers: itemMarkers,
    onExecute (dropdown, item) {
      const v = Representing.getValue(item);
      return store.adderH('dropdown.menu.execute: ' + v.value)();
    }
  };
};

const mStoreMenuUid = (component) => {
  return Step.stateful((value, next, die) => {
    const menu = SelectorFind.descendant(component.element(), '.menu').getOrDie('Could not find menu');
    const uid = Tagger.readOrDie(menu);
    next(
      Merger.deepMerge(value, { menuUid: uid })
    );
  });
};

const mWaitForNewMenu = (component) => {
  return Step.raw((value: any, next, die, logs) => {
    Waiter.sTryUntil(
      'Waiting for a new menu (different uid)',
      Step.sync(() => {
        SelectorFind.descendant(component.element(), '.menu').filter((menu) => {
          const uid = Tagger.readOrDie(menu);
          return value.menuUid !== uid;
        }).getOrDie('New menu has not appeared');
      }),
      100,
      3000
    )(value, next, die, logs);
  });
};

const itemMarkers = {
  item: 'item',
  selectedItem: 'selected-item',
  menu: 'menu',
  selectedMenu: 'selected-menu',
  backgroundMenu: 'background-menu'
};

const markers = () => itemMarkers;

export {
  renderItem,
  renderMenu,
  part,
  markers,
  mWaitForNewMenu,
  mStoreMenuUid
};