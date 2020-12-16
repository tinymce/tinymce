/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyEvents, Behaviour, Button, GuiFactory, Memento, Menu, Representing, TieredMenu, Toggling, Transitioning
} from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Arr, Merger, Obj, Optional } from '@ephox/katamari';
import { Css, SelectorFind, Width } from '@ephox/sugar';

import * as Receivers from '../channels/Receivers';
import * as Styles from '../style/Styles';
import * as Scrollable from '../touch/scroll/Scrollable';

const getValue = (item): string => {
  return Obj.get(item, 'format').getOr(item.title);
};

const convert = (formats, memMenuThunk) => {
  const mainMenu = makeMenu('Styles', [
  ].concat(
    Arr.map(formats.items, (k) => {
      return makeItem(getValue(k), k.title, k.isSelected(), k.getPreview(), Obj.hasNonNullableKey(formats.expansions, getValue(k)));
    })
  ), memMenuThunk, false);

  const submenus = Obj.map(formats.menus, (menuItems, menuName) => {
    const items = Arr.map(menuItems, (item) => {
      return makeItem(
        getValue(item),
        item.title,
        item.isSelected !== undefined ? item.isSelected() : false,
        item.getPreview !== undefined ? item.getPreview() : '',
        Obj.hasNonNullableKey(formats.expansions, getValue(item))
      );
    });
    return makeMenu(menuName, items, memMenuThunk, true);
  });

  const menus = Merger.deepMerge(submenus, Objects.wrap('styles', mainMenu));

  const tmenu = TieredMenu.tieredData('styles', menus, formats.expansions);

  return {
    tmenu
  };
};

const makeItem = (value, text, selected, preview, isMenu) => {
  return {
    data: {
      value,
      text
    },
    type: 'item',
    dom: {
      tag: 'div',
      classes: isMenu ? [ Styles.resolve('styles-item-is-menu') ] : [ ]
    },
    toggling: {
      toggleOnExecute: false,
      toggleClass: Styles.resolve('format-matches'),
      selected
    },
    itemBehaviours: Behaviour.derive(isMenu ? [ ] : [
      Receivers.format(value, (comp, status) => {
        const toggle = status ? Toggling.on : Toggling.off;
        toggle(comp);
      })
    ]),
    components: [
      {
        dom: {
          tag: 'div',
          attributes: {
            style: preview
          },
          innerHtml: text
        }
      }
    ]
  };
};

const makeMenu = (value, items, memMenuThunk, collapsable) => {
  return {
    value,
    dom: {
      tag: 'div'
    },
    components: [
      Button.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('styles-collapser') ]
        },
        components: collapsable ? [
          {
            dom: {
              tag: 'span',
              classes: [ Styles.resolve('styles-collapse-icon') ]
            }
          },
          GuiFactory.text(value)
        ] : [ GuiFactory.text(value) ],
        action: (item) => {
          if (collapsable) {
            const comp = memMenuThunk().get(item);
            TieredMenu.collapseMenu(comp);
          }
        }
      }),
      {
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('styles-menu-items-container') ]
        },
        components: [
          Menu.parts.items({ })
        ],

        behaviours: Behaviour.derive([
          AddEventsBehaviour.config('adhoc-scrollable-menu', [
            AlloyEvents.runOnAttached((component, _simulatedEvent) => {
              Css.set(component.element, 'overflow-y', 'auto');
              Css.set(component.element, '-webkit-overflow-scrolling', 'touch');
              Scrollable.register(component.element);
            }),

            AlloyEvents.runOnDetached((component) => {
              Css.remove(component.element, 'overflow-y');
              Css.remove(component.element, '-webkit-overflow-scrolling');
              Scrollable.deregister(component.element);
            })
          ])
        ])
      }
    ],
    items,
    menuBehaviours: Behaviour.derive([
      Transitioning.config({
        initialState: 'after',
        routes: Transitioning.createTristate('before', 'current', 'after', {
          transition: {
            property: 'transform',
            transitionClass: 'transitioning'
          }
        })
      })
    ])
  };
};

const sketch = (settings) => {
  const dataset = convert(settings.formats, () => {
    return memMenu;
  });
  // Turn settings into a tiered menu data.

  const memMenu = Memento.record(TieredMenu.sketch({
    dom: {
      tag: 'div',
      classes: [ Styles.resolve('styles-menu') ]
    },
    components: [ ],

    // Focus causes issues when the things being focused are offscreen.
    fakeFocus: true,
    // For animations, need things to stay around in the DOM (at least until animation is done)
    stayInDom: true,

    onExecute: (_tmenu, item) => {
      const v = Representing.getValue(item);
      settings.handle(item, v.value);
      return Optional.none();
    },
    onEscape: () => {
      return Optional.none();
    },
    onOpenMenu: (container, menu) => {
      const w = Width.get(container.element);
      Width.set(menu.element, w);
      Transitioning.jumpTo(menu, 'current');
    },
    onOpenSubmenu: (container, item, submenu) => {
      const w = Width.get(container.element);
      const menu = SelectorFind.ancestor(item.element, '[role="menu"]').getOrDie('hacky');
      const menuComp = container.getSystem().getByDom(menu).getOrDie();

      Width.set(submenu.element, w);

      Transitioning.progressTo(menuComp, 'before');
      Transitioning.jumpTo(submenu, 'after');
      Transitioning.progressTo(submenu, 'current');
    },

    onCollapseMenu: (container, item, menu) => {
      const submenu = SelectorFind.ancestor(item.element, '[role="menu"]').getOrDie('hacky');
      const submenuComp = container.getSystem().getByDom(submenu).getOrDie();
      Transitioning.progressTo(submenuComp, 'after');
      Transitioning.progressTo(menu, 'current');
    },

    navigateOnHover: false,

    highlightImmediately: true,
    data: dataset.tmenu,

    markers: {
      backgroundMenu: Styles.resolve('styles-background-menu'),
      menu: Styles.resolve('styles-menu'),
      selectedMenu: Styles.resolve('styles-selected-menu'),
      item: Styles.resolve('styles-item'),
      selectedItem: Styles.resolve('styles-selected-item')
    }
  }));

  return memMenu.asSpec();
};

export {
  sketch
};
