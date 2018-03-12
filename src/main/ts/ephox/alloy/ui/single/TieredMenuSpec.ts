import { Objects } from '@ephox/boulder';
import { Arr, Fun, Merger, Obj, Option, Options } from '@ephox/katamari';
import { Body, Class, Classes, SelectorFind } from '@ephox/sugar';

import * as EditableFields from '../../alien/EditableFields';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Composing } from '../../api/behaviour/Composing';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Replacing } from '../../api/behaviour/Replacing';
import { Representing } from '../../api/behaviour/Representing';
import * as GuiFactory from '../../api/component/GuiFactory';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as FocusManagers from '../../api/focus/FocusManagers';
import { Menu } from '../../api/ui/Menu';
import LayeredState from '../../menu/layered/LayeredState';
import * as ItemEvents from '../../menu/util/ItemEvents';
import * as MenuEvents from '../../menu/util/MenuEvents';

const make = function (detail, rawUiSpec) {
  const buildMenus = function (container, menus) {
    return Obj.map(menus, function (spec, name) {
      const data = Menu.sketch(
        Merger.deepMerge(
          spec,
          {
            value: name,
            items: spec.items,
            markers: Objects.narrow(rawUiSpec.markers, [ 'item', 'selectedItem' ]),

            // Fake focus.
            fakeFocus: detail.fakeFocus(),
            onHighlight: detail.onHighlight(),

            focusManager: detail.fakeFocus() ? FocusManagers.highlights() : FocusManagers.dom()
          }
        )
      );

      return container.getSystem().build(data);
    });
  };

  const state = LayeredState();

  const setup = function (container) {
    const componentMap = buildMenus(container, detail.data().menus());
    state.setContents(detail.data().primary(), componentMap, detail.data().expansions(), function (sMenus) {
      return toMenuValues(container, sMenus);
    });

    return state.getPrimary();
  };

  const getItemValue = function (item) {
    return Representing.getValue(item).value;
  };

  const toMenuValues = function (container, sMenus) {
    return Obj.map(detail.data().menus(), function (data, menuName) {
      return Arr.bind(data.items, function (item) {
        return item.type === 'separator' ? [ ] : [ item.data.value ];
      });
    });
  };

  const setActiveMenu = function (container, menu) {
    Highlighting.highlight(container, menu);
    Highlighting.getHighlighted(menu).orThunk(function () {
      return Highlighting.getFirst(menu);
    }).each(function (item) {
      AlloyTriggers.dispatch(container, item.element(), SystemEvents.focusItem());
    });
  };

  const getMenus = function (state, menuValues) {
    return Options.cat(
      Arr.map(menuValues, state.lookupMenu)
    );
  };

  const updateMenuPath = function (container, state, path) {
    return Option.from(path[0]).bind(state.lookupMenu).map(function (activeMenu: any) {
      const rest = getMenus(state, path.slice(1));
      Arr.each(rest, function (r) {
        Class.add(r.element(), detail.markers().backgroundMenu());
      });

      if (! Body.inBody(activeMenu.element())) {
        Replacing.append(container, GuiFactory.premade(activeMenu));
      }

      // Remove the background-menu class from the active menu
      Classes.remove(activeMenu.element(), [ detail.markers().backgroundMenu() ]);
      setActiveMenu(container, activeMenu);
      const others = getMenus(state, state.otherMenus(path));
      Arr.each(others, function (o) {
        // May not need to do the active menu thing.
        Classes.remove(o.element(), [ detail.markers().backgroundMenu() ]);
        if (! detail.stayInDom()) { Replacing.remove(container, o); }
      });

      return activeMenu;
    });

  };

  const expandRight = function (container, item) {
    const value = getItemValue(item);
    return state.expand(value).bind(function (path) {
      // When expanding, always select the first.
      Option.from(path[0]).bind(state.lookupMenu).each(function (activeMenu: any) {
        // DUPE with above. Fix later.
        if (! Body.inBody(activeMenu.element())) {
          Replacing.append(container, GuiFactory.premade(activeMenu));
        }

        detail.onOpenSubmenu()(container, item, activeMenu);
        Highlighting.highlightFirst(activeMenu);
      });

      return updateMenuPath(container, state, path);
    });
  };

  const collapseLeft = function (container, item) {
    const value = getItemValue(item);
    return state.collapse(value).bind(function (path) {
      return updateMenuPath(container, state, path).map(function (activeMenu) {
        detail.onCollapseMenu()(container, item, activeMenu);
        return activeMenu;
      });
    });
  };

  const updateView = function (container, item) {
    const value = getItemValue(item);
    return state.refresh(value).bind(function (path) {
      return updateMenuPath(container, state, path);
    });
  };

  const onRight = function (container, item) {
    return EditableFields.inside(item.element()) ? Option.none() : expandRight(container, item);
  };

  const onLeft = function (container, item) {
    // Exclude inputs, textareas etc.
    return EditableFields.inside(item.element()) ? Option.none() : collapseLeft(container, item);
  };

  const onEscape = function (container, item) {
    return collapseLeft(container, item).orThunk(function () {
      return detail.onEscape()(container, item);
    // This should only fire when the user presses ESC ... not any other close.
      // return HotspotViews.onEscape(detail.lazyAnchor()(), container);
    });
  };

  const keyOnItem = function (f) {
    return function (container, simulatedEvent) {
      return SelectorFind.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
        return container.getSystem().getByDom(target).bind(function (item) {
          return f(container, item);
        });
      });
    };
  };

  const events = AlloyEvents.derive([
    // Set "active-menu" for the menu with focus
    AlloyEvents.run(MenuEvents.focus(), function (sandbox, simulatedEvent) {
      const menu = simulatedEvent.event().menu();
      Highlighting.highlight(sandbox, menu);
    }),

    AlloyEvents.runOnExecute(function (sandbox, simulatedEvent) {
      // Trigger on execute on the targeted element
      // I.e. clicking on menu item
      const target = simulatedEvent.event().target();
      return sandbox.getSystem().getByDom(target).bind(function (item) {
        const itemValue = getItemValue(item);
        if (itemValue.indexOf('collapse-item') === 0) {
          return collapseLeft(sandbox, item);
        }

        return expandRight(sandbox, item).orThunk(function () {
          return detail.onExecute()(sandbox, item);
        });
      });
    }),

    // Open the menu as soon as it is added to the DOM
    AlloyEvents.runOnAttached(function (container, simulatedEvent) {
      setup(container).each(function (primary) {
        Replacing.append(container, GuiFactory.premade(primary));

        if (detail.openImmediately()) {
          setActiveMenu(container, primary);
          detail.onOpenMenu()(container, primary);
        }
      });
    })
  ].concat(detail.navigateOnHover() ? [
    // Hide any irrelevant submenus and expand any submenus based
    // on hovered item
    AlloyEvents.run(ItemEvents.hover(), function (sandbox, simulatedEvent) {
      const item = simulatedEvent.event().item();
      updateView(sandbox, item);
      expandRight(sandbox, item);
      detail.onHover()(sandbox, item);
    })
  ] : [ ]));

  const collapseMenuApi = function (container) {
    Highlighting.getHighlighted(container).each(function (currentMenu) {
      Highlighting.getHighlighted(currentMenu).each(function (currentItem) {
        collapseLeft(container, currentItem);
      });
    });
  };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn (container, keyInfo) {
            state.getPrimary().each(function (primary) {
              AlloyTriggers.dispatch(container, primary.element(), SystemEvents.focusItem());
            });
          }
        }),
        // Highlighting is used for highlighting the active menu
        Highlighting.config({
          highlightClass: detail.markers().selectedMenu(),
          itemClass: detail.markers().menu()
        }),
        Composing.config({
          find (container) {
            return Highlighting.getHighlighted(container);
          }
        }),
        Replacing.config({ })
      ]),
      SketchBehaviours.get(detail.tmenuBehaviours())
    ),
    eventOrder: detail.eventOrder(),
    apis: {
      collapseMenu: collapseMenuApi
    },
    events
  };
};

const collapseItem = Fun.constant('collapse-item');
export {
  make,
  collapseItem
};