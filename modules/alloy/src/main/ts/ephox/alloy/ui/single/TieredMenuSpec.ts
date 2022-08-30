import { Arr, Fun, Obj, Optional, Optionals, Singleton } from '@ephox/katamari';
import { Attribute, Class, Classes, SelectorFilter, SelectorFind, SugarBody } from '@ephox/sugar';

import * as EditableFields from '../../alien/EditableFields';
import { Composing } from '../../api/behaviour/Composing';
import { Disabling } from '../../api/behaviour/Disabling';
import { Highlighting } from '../../api/behaviour/Highlighting';
import { Keying } from '../../api/behaviour/Keying';
import { Replacing } from '../../api/behaviour/Replacing';
import { Representing } from '../../api/behaviour/Representing';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as GuiFactory from '../../api/component/GuiFactory';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as FocusManagers from '../../api/focus/FocusManagers';
import { Menu } from '../../api/ui/Menu';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { LayeredState } from '../../menu/layered/LayeredState';
import * as ItemEvents from '../../menu/util/ItemEvents';
import * as MenuEvents from '../../menu/util/MenuEvents';
import { OnMenuItemDehighlightedEvent, onMenuItemDehighlightedEvent, OnMenuItemDehighlightedEventData, OnMenuItemHighlightedEvent, onMenuItemHighlightedEvent, OnMenuItemHighlightedEventData } from '../../menu/util/TieredMenuEvents';
import { MenuFocusEvent, MenuItemHoverEvent } from '../types/MenuTypes';
import { HighlightOnOpen, PartialMenuSpec, TieredMenuApis, TieredMenuDetail, TieredMenuSpec } from '../types/TieredMenuTypes';

export type MenuPreparation = MenuPrepared | MenuNotBuilt;

export interface MenuPrepared {
  type: 'prepared';
  menu: AlloyComponent;
}

export interface MenuNotBuilt {
  type: 'notbuilt';
  nbMenu: () => AlloySpec;
}

const make: SingleSketchFactory<TieredMenuDetail, TieredMenuSpec> = (detail, _rawUiSpec) => {
  const submenuParentItems = Singleton.value<Record<string, AlloyComponent>>();

  // So the way to provide extra configuration for the menus that tiered menus create is just
  // to provide different menu specs when building up the TieredData. The TieredMenu itself
  // does not control it, except to set: markers, fakeFocus, onHighlight, and focusManager
  const buildMenus = (container: AlloyComponent, primaryName: string, menus: Record<string, PartialMenuSpec>): Record<string, MenuPreparation> => Obj.map(menus, (spec, name) => {

    const makeSketch = () => Menu.sketch({
      ...spec,
      value: name,
      // The TieredMenu markers should be inherited by the Menu. "Markers" are things like
      // what is the class for the currently selected item
      markers: detail.markers,

      // If the TieredMenu has been configured with FakeFocus, it needs the menus that it generates
      // to preserve that configuration. Generally, FakeFocus is used for situations where the user
      // wants to keep focus inside some editable element (like an input, or editor content)
      fakeFocus: detail.fakeFocus,

      // The TieredMenu detail.onHighlight function only relates to selecting an item,
      // not a menu, and the menuComp it is passed is the menu, not the tiered menu.
      // This makes it a difficult handler to use for a tieredmenu, so we are
      // deprecating it.
      onHighlight: (menuComp: AlloyComponent, itemComp: AlloyComponent) => {
        // Trigger an internal event so that we can listen to it at the tieredmenu
        // level, and call detail.onHighlightItem handler with tmenu, menu, and item.
        const highlightData: OnMenuItemHighlightedEventData = {
          menuComp,
          itemComp
        };
        AlloyTriggers.emitWith(menuComp, onMenuItemHighlightedEvent, highlightData);
      },

      onDehighlight: (menuComp: AlloyComponent, itemComp: AlloyComponent) => {
        const dehighlightData: OnMenuItemDehighlightedEventData = {
          menuComp,
          itemComp
        };

        // Trigger an internal event so that we can listen to it at the tieredmenu
        // level, and call detail.onDehighlightItem handler with tmenu, menu, and item.
        AlloyTriggers.emitWith(menuComp, onMenuItemDehighlightedEvent, dehighlightData);
      },

      // The Menu itself doesn't set the focusManager based on the value of fakeFocus. It only uses
      // its fakeFocus configuration for creating items that ignore focus, but it still needs to be
      // told which focusManager to use. Perhaps we should change this, though it does allow for more
      // complex focusManagers in single menus.
      focusManager: detail.fakeFocus ? FocusManagers.highlights() : FocusManagers.dom()
    });

    // Only build the primary at first. Build the others as needed.
    return name === primaryName ? {
      type: 'prepared',
      menu: container.getSystem().build(makeSketch())
    } as MenuPrepared : {
      type: 'notbuilt',
      nbMenu: makeSketch
    } as MenuNotBuilt;
  });

  const layeredState: LayeredState = LayeredState.init();

  const setup = (container: AlloyComponent): Optional<AlloyComponent> => {
    const componentMap = buildMenus(container, detail.data.primary, detail.data.menus);
    const directory = toDirectory(container);
    layeredState.setContents(detail.data.primary, componentMap, detail.data.expansions, directory);
    return layeredState.getPrimary();
  };

  const getItemValue = (item: AlloyComponent): string => Representing.getValue(item).value;

  // Find the first item with value `itemValue` in any of the menus inside this tiered menu structure
  const getItemByValue = (_container: AlloyComponent, menus: AlloyComponent[], itemValue: string): Optional<AlloyComponent> =>
    // Can *greatly* improve the performance of this by calculating things up front.
    Arr.findMap(menus, (menu) => {
      if (!menu.getSystem().isConnected()) {
        return Optional.none();
      }
      const candidates = Highlighting.getCandidates(menu);
      return Arr.find(candidates, (c) => getItemValue(c) === itemValue);
    });

  const toDirectory = (_container: AlloyComponent): Record<string, string[]> => Obj.map(detail.data.menus, (data, _menuName) => Arr.bind(data.items, (item) => item.type === 'separator' ? [ ] : [ item.data.value ]));

  // This just sets the active menu. It will not set any active items.
  const setActiveMenu = Highlighting.highlight;

  // The item highlighted as active is either the currently active item in the menu,
  // or the first one.
  const setActiveMenuAndItem = (container: AlloyComponent, menu: AlloyComponent): void => {
    // Firstly, choose the active menu
    setActiveMenu(container, menu);
    // Then, choose the active item inside the active menu
    Highlighting.getHighlighted(menu).orThunk(() => Highlighting.getFirst(menu)).each((item) => {
      if (detail.fakeFocus) {
        // When using fakeFocus, the items won't have a tab-index, so calling focusItem on them
        // won't do anything. So we need to manually call highlighting, which is what fakeFocus
        // uses. It would probably be better to use the focusManager specified.
        Highlighting.highlight(menu, item);
      } else {
        // We don't just use Focusing.focus here, because some items can have slightly different
        // handling when they respond to a focusItem event. Widgets with autofocus, for example,
        // will trigger a Keying.focusIn instead of Focusing.focus call, because they want to move
        // the focus _inside_ the widget, not just to its outer level. The focusItem event
        // performs a similar purpose to SystemEvents.focus() and potentially, could be consolidated.
        AlloyTriggers.dispatch(container, item.element, SystemEvents.focusItem());
      }
    });
  };

  const getMenus = (state: LayeredState, menuValues: string[]): AlloyComponent[] => Optionals.cat(
    Arr.map(menuValues, (mv) => state.lookupMenu(mv).bind((prep) => prep.type === 'prepared' ? Optional.some(prep.menu) : Optional.none()))
  );

  const closeOthers = (container: AlloyComponent, state: LayeredState, path: string[]): void => {
    const others = getMenus(state, state.otherMenus(path));
    Arr.each(others, (o) => {

      // May not need to do the active menu thing.
      Classes.remove(o.element, [ detail.markers.backgroundMenu ]);
      if (!detail.stayInDom) {
        Replacing.remove(container, o);
      }
    });
  };

  const getSubmenuParents = (container: AlloyComponent): Record<string, AlloyComponent> => submenuParentItems.get().getOrThunk(() => {
    const r: Record<string, AlloyComponent> = { };
    const items = SelectorFilter.descendants(container.element, `.${detail.markers.item}`);
    const parentItems = Arr.filter(items, (i) => Attribute.get(i, 'aria-haspopup') === 'true');
    Arr.each(parentItems, (i) => {
      container.getSystem().getByDom(i).each((itemComp) => {
        const key = getItemValue(itemComp);
        r[key] = itemComp;
      });
    });
    submenuParentItems.set(r);
    return r;
  });

  // Not ideal. Ideally, we would like a map of item keys to components.
  const updateAriaExpansions = (container: AlloyComponent, path: string[]) => {
    const parentItems = getSubmenuParents(container);
    Obj.each(parentItems, (v, k) => {
      // Really should turn path into a Set
      const expanded = Arr.contains(path, k);
      Attribute.set(v.element, 'aria-expanded', expanded);
    });
  };

  const updateMenuPath = (container: AlloyComponent, state: LayeredState, path: string[]): Optional<AlloyComponent> =>
    Optional.from(path[0]).bind((latestMenuName) => state.lookupMenu(latestMenuName).bind((menuPrep: MenuPreparation) => {
      if (menuPrep.type === 'notbuilt') {
        return Optional.none();
      } else {
        const activeMenu = menuPrep.menu;
        const rest = getMenus(state, path.slice(1));
        Arr.each(rest, (r) => {
          Class.add(r.element, detail.markers.backgroundMenu);
        });

        if (!SugarBody.inBody(activeMenu.element)) {
          Replacing.append(container, GuiFactory.premade(activeMenu));
        }

        // Remove the background-menu class from the active menu
        Classes.remove(activeMenu.element, [ detail.markers.backgroundMenu ]);
        setActiveMenuAndItem(container, activeMenu);
        closeOthers(container, state, path);
        return Optional.some(activeMenu);
      }
    }));

  enum ExpandHighlightDecision {
    HighlightSubmenu,
    HighlightParent
  }

  const buildIfRequired = (container: AlloyComponent, menuName: string, menuPrep: MenuPreparation) => {
    if (menuPrep.type === 'notbuilt') {
      const menu = container.getSystem().build(menuPrep.nbMenu());
      layeredState.setMenuBuilt(menuName, menu);
      return menu;
    } else {
      return menuPrep.menu;
    }
  };

  const expandRight = (container: AlloyComponent, item: AlloyComponent, decision: ExpandHighlightDecision = ExpandHighlightDecision.HighlightSubmenu): Optional<AlloyComponent> => {
    if (item.hasConfigured(Disabling) && Disabling.isDisabled(item)) {
      return Optional.some(item);
    } else {
      const value = getItemValue(item);
      return layeredState.expand(value).bind((path) => {
        // Called when submenus are opened by keyboard AND hovering navigation
        updateAriaExpansions(container, path);
        // When expanding, always select the first.
        return Optional.from(path[0]).bind((menuName) => layeredState.lookupMenu(menuName).bind((activeMenuPrep) => {
          const activeMenu = buildIfRequired(container, menuName, activeMenuPrep);

          // DUPE with above. Fix later.
          if (!SugarBody.inBody(activeMenu.element)) {
            Replacing.append(container, GuiFactory.premade(activeMenu));
          }

          // updateMenuPath is the code which changes the active menu. We don't always
          // want to change the active menu. Sometimes, we just want to show it (e.g. hover)
          detail.onOpenSubmenu(container, item, activeMenu, Arr.reverse(path));
          if (decision === ExpandHighlightDecision.HighlightSubmenu) {
            Highlighting.highlightFirst(activeMenu);
            return updateMenuPath(container, layeredState, path);
          } else {
            Highlighting.dehighlightAll(activeMenu);
            return Optional.some(item);
          }
        }));
      });
    }
  };

  const collapseLeft = (container: AlloyComponent, item: AlloyComponent): Optional<AlloyComponent> => {
    const value = getItemValue(item);
    return layeredState.collapse(value).bind((path) => {
      // Called when submenus are closed because of KEYBOARD navigation
      updateAriaExpansions(container, path);
      return updateMenuPath(container, layeredState, path).map((activeMenu) => {
        detail.onCollapseMenu(container, item, activeMenu);
        return activeMenu;
      });
    });
  };

  const updateView = (container: AlloyComponent, item: AlloyComponent): Optional<AlloyComponent> => {
    const value = getItemValue(item);
    return layeredState.refresh(value).bind((path) => {
      // Only this function collapses irrelevant submenus when navigating by HOVERING.
      // Does mean this is called twice when navigating by hovering, since both
      // updateView and expandRight are called by the ItemEvents.hover() handler
      updateAriaExpansions(container, path);
      return updateMenuPath(container, layeredState, path);
    });
  };

  const onRight = (container: AlloyComponent, item: AlloyComponent): Optional<AlloyComponent> =>
    EditableFields.inside(item.element) ? Optional.none() : expandRight(container, item, ExpandHighlightDecision.HighlightSubmenu);

  const onLeft = (container: AlloyComponent, item: AlloyComponent): Optional<AlloyComponent> =>
    // Exclude inputs, textareas etc.
    EditableFields.inside(item.element) ? Optional.none() : collapseLeft(container, item);

  const onEscape = (container: AlloyComponent, item: AlloyComponent): Optional<AlloyComponent> =>
    collapseLeft(container, item).orThunk(() =>
      detail.onEscape(container, item).map(() => container) // This should only fire when the user presses ESC ... not any other close.
    );

  type KeyHandler = (container: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Optional<boolean>;
  const keyOnItem = (f: (container: AlloyComponent, item: AlloyComponent) => Optional<AlloyComponent>): KeyHandler =>
    (container: AlloyComponent, simulatedEvent: NativeSimulatedEvent): Optional<boolean> => {
      // 2022-08-16 This seems to be the only code in alloy that actually uses
      // the getSource aspect of an event. Remember, that this code is firing
      // when an event bubbles up the tiered menu, e.g. left arrow key.
      // The only current code that sets the source manually is in the Widget item
      // type, and it only sets the source when it is using autofocus. Autofocus
      // is used to essentially treat the widget like it is the top-level item, so
      // when events originate from *within* the widget, their source is changed to
      // the top-level item. Consider removing EventSource from alloy altogether.
      return SelectorFind.closest(simulatedEvent.getSource(), `.${detail.markers.item}`)
        .bind((target) => container.getSystem().getByDom(target).toOptional().bind(
          (item: AlloyComponent) => f(container, item).map<boolean>(Fun.always)
        ));
    };

  // NOTE: Many of these events rely on identifying the current item by information
  // sent with the event. However, in situations where you are using fakeFocus, but
  // the real focus is still somewhere in the menu (e.g. search bar), this will lead to
  // an incorrect identification of the active item. Ideally, instead of pulling the
  // item from the event, we should just use Highlighting to identify the active item,
  // and operate on it. However, not all events will necessarily have to happen on the
  // active item, so we need to consider all the cases before making this change. For now,
  // there will be a known limitation that if the real focus is still inside the TieredMenu,
  // but the menu is using fakeFocus, then the actions will operate on the wrong targets.
  // A workaround for that is to stop or cut or redispatch the events in whichever
  // component has the real focus.
  // TODO: TINY-9011 Introduce proper handling of fakeFocus in TieredMenu
  const events = AlloyEvents.derive<any>([
    // Set "active-menu" for the menu with focus
    AlloyEvents.run<MenuFocusEvent>(MenuEvents.focus(), (tmenu, simulatedEvent) => {
      // Ensure the item is actually part of this menu structure, and not part of another menu structure that's bubbling.
      const item = simulatedEvent.event.item;
      layeredState.lookupItem(getItemValue(item)).each(() => {
        const menu = simulatedEvent.event.menu;
        Highlighting.highlight(tmenu, menu);

        const value = getItemValue(simulatedEvent.event.item);
        layeredState.refresh(value).each((path) => closeOthers(tmenu, layeredState, path));
      });
    }),

    AlloyEvents.runOnExecute((component, simulatedEvent) => {
      // Trigger on execute on the targeted element
      // I.e. clicking on menu item
      const target = simulatedEvent.event.target;
      component.getSystem().getByDom(target).each((item) => {
        const itemValue = getItemValue(item);

        // INVESTIGATE: I don't know if this is doing anything any more. Check.
        if (itemValue.indexOf('collapse-item') === 0) {
          collapseLeft(component, item);
        }

        expandRight(component, item, ExpandHighlightDecision.HighlightSubmenu).fold(
          () => {
            detail.onExecute(component, item);
          },
          Fun.noop
        );
      });
    }),

    // Open the menu as soon as it is added to the DOM
    AlloyEvents.runOnAttached((container, _simulatedEvent) => {
      setup(container).each((primary) => {
        Replacing.append(container, GuiFactory.premade(primary));
        detail.onOpenMenu(container, primary);
        if (detail.highlightOnOpen === HighlightOnOpen.HighlightMenuAndItem) {
          setActiveMenuAndItem(container, primary);
        } else if (detail.highlightOnOpen === HighlightOnOpen.HighlightJustMenu) {
          setActiveMenu(container, primary);
        }
      });
    }),

    // Listen to the events bubbling up from menu about highlighting, and trigger
    // our handlers with tmenu, menu and item
    AlloyEvents.run<OnMenuItemHighlightedEvent>(onMenuItemHighlightedEvent, (tmenuComp, se) => {
      detail.onHighlightItem(tmenuComp, se.event.menuComp, se.event.itemComp);
    }),
    AlloyEvents.run<OnMenuItemDehighlightedEvent>(onMenuItemDehighlightedEvent, (tmenuComp, se) => {
      detail.onDehighlightItem(tmenuComp, se.event.menuComp, se.event.itemComp);
    }),

    ...(
      detail.navigateOnHover ? [
        // Hide any irrelevant submenus and expand any submenus based
        // on hovered item
        AlloyEvents.run<MenuItemHoverEvent>(ItemEvents.hover(), (tmenu, simulatedEvent) => {
          const item = simulatedEvent.event.item;
          updateView(tmenu, item);
          expandRight(tmenu, item, ExpandHighlightDecision.HighlightParent);
          detail.onHover(tmenu, item);
        })
      ] : [ ]
    )
  ]);

  const getActiveItem = (container: AlloyComponent): Optional<AlloyComponent> => Highlighting.getHighlighted(container).bind(Highlighting.getHighlighted);

  const collapseMenuApi = (container: AlloyComponent) => {
    getActiveItem(container).each((currentItem) => {
      collapseLeft(container, currentItem);
    });
  };

  const highlightPrimary = (container: AlloyComponent) => {
    layeredState.getPrimary().each((primary) => {
      setActiveMenuAndItem(container, primary);
    });
  };

  const extractMenuFromContainer = (container: AlloyComponent) =>
    Optional.from(container.components()[0]).filter((comp) => Attribute.get(comp.element, 'role') === 'menu');

  const repositionMenus = (container: AlloyComponent): void => {
    // Get the primary menu
    const maybeActivePrimary = layeredState.getPrimary().bind((primary) =>
      // Get the triggering path (item, menu) up to the active item
      getActiveItem(container).bind((currentItem) => {
        const itemValue = getItemValue(currentItem);
        const allMenus: MenuPreparation[] = Obj.values(layeredState.getMenus());
        const preparedMenus: AlloyComponent[] = Optionals.cat(
          Arr.map(allMenus, LayeredState.extractPreparedMenu)
        );
        return layeredState.getTriggeringPath(itemValue, (v) => getItemByValue(container, preparedMenus, v));
      }).map((triggeringPath) => ({ primary, triggeringPath }))
    );

    maybeActivePrimary.fold(() => {
      // When a menu is open but there is no activeItem, we get the menu from the container.
      extractMenuFromContainer(container).each((primaryMenu) => {
        detail.onRepositionMenu(container, primaryMenu, []);
      });
    },
    ({ primary, triggeringPath }) => {
      // Refresh all the menus up to the active item
      detail.onRepositionMenu(container, primary, triggeringPath);
    });
  };

  const apis: TieredMenuApis = {
    collapseMenu: collapseMenuApi,
    highlightPrimary,
    repositionMenus
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    markers: detail.markers,
    behaviours: SketchBehaviours.augment(
      detail.tmenuBehaviours,
      [
        Keying.config({
          mode: 'special',
          onRight: keyOnItem(onRight),
          onLeft: keyOnItem(onLeft),
          onEscape: keyOnItem(onEscape),
          focusIn: (container, _keyInfo) => {
            layeredState.getPrimary().each((primary) => {
              AlloyTriggers.dispatch(container, primary.element, SystemEvents.focusItem());
            });
          }
        }),
        // Highlighting is used for highlighting the active menu
        Highlighting.config({
          highlightClass: detail.markers.selectedMenu,
          itemClass: detail.markers.menu
        }),
        Composing.config({
          find: (container) => {
            return Highlighting.getHighlighted(container);
          }
        }),
        Replacing.config({ })
      ]
    ),
    eventOrder: detail.eventOrder,
    apis,
    events
  };
};

const collapseItem = Fun.constant('collapse-item');
export {
  make,
  collapseItem
};
