import { Arr, Fun, Obj, Option, Options, Cell } from '@ephox/katamari';
import { Body, Class, Classes, SelectorFind, SelectorFilter, Attr } from '@ephox/sugar';

import * as EditableFields from '../../alien/EditableFields';
import { Composing } from '../../api/behaviour/Composing';
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
import { CustomEvent, NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { LayeredState } from '../../menu/layered/LayeredState';
import * as ItemEvents from '../../menu/util/ItemEvents';
import * as MenuEvents from '../../menu/util/MenuEvents';
import { PartialMenuSpec, TieredMenuApis, TieredMenuDetail, TieredMenuSpec } from '../types/TieredMenuTypes';

export type MenuPreparation = MenuPrepared | MenuNotBuilt;

export interface MenuPrepared {
  type: 'prepared';
  menu: AlloyComponent;
}

export interface MenuNotBuilt {
  type: 'notbuilt';
  nbMenu: () => AlloySpec;
}

const make: SingleSketchFactory<TieredMenuDetail, TieredMenuSpec> = (detail, rawUiSpec) => {
  const submenuParentItems: Cell<Option<Record<string, AlloyComponent>>> = Cell(Option.none());

  const buildMenus = (container: AlloyComponent, primaryName: string, menus: Record<string, PartialMenuSpec>): Record<string, MenuPreparation> => {
    return Obj.map(menus, (spec: PartialMenuSpec, name: string) => {

      const makeSketch = () => {
        return Menu.sketch({
          dom: spec.dom,
          ...spec,
          value: name,
          items: spec.items,
          markers: detail.markers,

          // Fake focus.
          fakeFocus: detail.fakeFocus,
          onHighlight: detail.onHighlight,

          focusManager: detail.fakeFocus ? FocusManagers.highlights() : FocusManagers.dom()
        });
      };

      // Only build the primary at first. Build the others as needed.
      return name === primaryName ? {
        type: 'prepared',
        menu: container.getSystem().build(makeSketch())
      } as MenuPrepared : {
        type: 'notbuilt',
        nbMenu: makeSketch
      } as MenuNotBuilt;
    });
  };

  const layeredState: LayeredState = LayeredState.init();

  const setup = (container: AlloyComponent): Option<AlloyComponent> => {
    const componentMap = buildMenus(container, detail.data.primary, detail.data.menus);
    const directory = toDirectory(container);
    layeredState.setContents(detail.data.primary, componentMap, detail.data.expansions, directory);
    return layeredState.getPrimary();
  };

  const getItemValue = (item: AlloyComponent): string => {
    return Representing.getValue(item).value;
  };

  const toDirectory = (container: AlloyComponent): Record<string, string[]> => {
    return Obj.map(detail.data.menus, (data, menuName) => {
      return Arr.bind(data.items, (item) => {
        return item.type === 'separator' ? [ ] : [ item.data.value ];
      });
    });
  };

  const setActiveMenu = (container: AlloyComponent, menu: AlloyComponent): void => {
    Highlighting.highlight(container, menu);
    Highlighting.getHighlighted(menu).orThunk(() => {
      return Highlighting.getFirst(menu);
    }).each((item) => {
      AlloyTriggers.dispatch(container, item.element(), SystemEvents.focusItem());
    });
  };

  const getMenus = (state: LayeredState, menuValues: string[]): AlloyComponent[] => {
    return Options.cat(
      Arr.map(menuValues, (mv) => {
        return state.lookupMenu(mv).bind((prep) => {
          return prep.type === 'prepared' ? Option.some(prep.menu) : Option.none();
        });
      })
    );
  };

  const closeOthers = (container: AlloyComponent, state: LayeredState, path: string[]): void => {
    const others = getMenus(state, state.otherMenus(path));
    Arr.each(others, (o) => {

      // May not need to do the active menu thing.
      Classes.remove(o.element(), [ detail.markers.backgroundMenu ]);
      if (! detail.stayInDom) { Replacing.remove(container, o); }
    });
  };

  const getSubmenuParents = (container: AlloyComponent): Record<string, AlloyComponent> => {
    return submenuParentItems.get().getOrThunk(() => {
      const r = { };
      const items = SelectorFilter.descendants(container.element(), `.${detail.markers.item}`);
      const parentItems = Arr.filter(items, (i) => Attr.get(i, 'aria-haspopup') === 'true');
      Arr.each(parentItems, (i) => {
        container.getSystem().getByDom(i).each((itemComp) => {
          const key = getItemValue(itemComp);
          r[key] = itemComp;
        });
      });
      submenuParentItems.set(Option.some(r));
      return r;
    });
  };

  // Not ideal. Ideally, we would like a map of item keys to components.
  const updateAriaExpansions = (container: AlloyComponent, path: string[]) => {
    const parentItems = getSubmenuParents(container);
    Obj.each(parentItems, (v, k) => {
      // Really should turn path into a Set
      const expanded = Arr.contains(path, k);
      Attr.set(v.element(), 'aria-expanded', expanded);
    });
  };

  const updateMenuPath = (container: AlloyComponent, state: LayeredState, path: string[]): Option<AlloyComponent> => {
    return Option.from(path[0]).bind((latestMenuName) => {
      return state.lookupMenu(latestMenuName).bind((menuPrep: MenuPreparation) => {
        if (menuPrep.type === 'notbuilt') {
          return Option.none();
        } else {
          const activeMenu = menuPrep.menu;
          const rest = getMenus(state, path.slice(1));
          Arr.each(rest, (r) => {
            Class.add(r.element(), detail.markers.backgroundMenu);
          });

          if (! Body.inBody(activeMenu.element())) {
            Replacing.append(container, GuiFactory.premade(activeMenu));
          }

          // Remove the background-menu class from the active menu
          Classes.remove(activeMenu.element(), [ detail.markers.backgroundMenu ]);
          setActiveMenu(container, activeMenu);
          closeOthers(container, state, path);
          return Option.some(activeMenu);
        }
      });
    });

  };

  enum ExpandHighlightDecision { HighlightSubmenu, HighlightParent }

  const buildIfRequired = (container: AlloyComponent, menuName: string, menuPrep: MenuPreparation) => {
    if (menuPrep.type === 'notbuilt') {
      const menu = container.getSystem().build(menuPrep.nbMenu());
      layeredState.setMenuBuilt(menuName, menu);
      return menu;
    } else {
      return menuPrep.menu;
    }
  };

  const expandRight = (container: AlloyComponent, item: AlloyComponent, decision: ExpandHighlightDecision  = ExpandHighlightDecision.HighlightSubmenu): Option<AlloyComponent> => {
    const value = getItemValue(item);
    return layeredState.expand(value).bind((path) => {
      // Called when submenus are opened by keyboard AND hovering navigation
      updateAriaExpansions(container, path);
      // When expanding, always select the first.
      return Option.from(path[0]).bind((menuName) => {
          return layeredState.lookupMenu(menuName).bind((activeMenuPrep) => {
          const activeMenu = buildIfRequired(container, menuName, activeMenuPrep);

          // DUPE with above. Fix later.
          if (! Body.inBody(activeMenu.element())) {
            Replacing.append(container, GuiFactory.premade(activeMenu));
          }

          // updateMenuPath is the code which changes the active menu. We don't always
          // want to change the active menu. Sometimes, we just want to show it (e.g. hover)
          detail.onOpenSubmenu(container, item, activeMenu);
          if (decision === ExpandHighlightDecision.HighlightSubmenu) {
            Highlighting.highlightFirst(activeMenu);
            return updateMenuPath(container, layeredState, path);
          } else {
            Highlighting.dehighlightAll(activeMenu);
            return Option.some(item);
          }
        });
      });
    });
  };

  const collapseLeft = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
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

  const updateView = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    const value = getItemValue(item);
    return layeredState.refresh(value).bind((path) => {
      // Only this function collapses irrelevant submenus when navigating by HOVERING.
      // Does mean this is called twice when navigating by hovering, since both
      // updateView and expandRight are called by the ItemEvents.hover() handler
      updateAriaExpansions(container, path);
      return updateMenuPath(container, layeredState, path);
    });
  };

  const onRight = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    return EditableFields.inside(item.element()) ? Option.none() : expandRight(container, item, ExpandHighlightDecision.HighlightSubmenu);
  };

  const onLeft = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    // Exclude inputs, textareas etc.
    return EditableFields.inside(item.element()) ? Option.none() : collapseLeft(container, item);
  };

  const onEscape = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    return collapseLeft(container, item).orThunk(() => {
      // This should only fire when the user presses ESC ... not any other close.
      return detail.onEscape(container, item).map(() => container);
    });
  };

  type KeyHandler = (container: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  const keyOnItem = (f: (container: AlloyComponent, item: AlloyComponent) => Option<AlloyComponent>): KeyHandler => {
    return (container: AlloyComponent, simulatedEvent: NativeSimulatedEvent): Option<boolean> => {
      return SelectorFind.closest(simulatedEvent.getSource(), '.' + detail.markers.item).bind((target) => {
        return container.getSystem().getByDom(target).toOption().bind((item: AlloyComponent) => {
          return f(container, item).map(() => true);
        });
      });
    };
  };

  const events = AlloyEvents.derive([
    // Set "active-menu" for the menu with focus
    AlloyEvents.run<CustomEvent>(MenuEvents.focus(), (sandbox, simulatedEvent) => {
      const menu = simulatedEvent.event().menu();
      Highlighting.highlight(sandbox, menu);

      const value = getItemValue(simulatedEvent.event().item());
      layeredState.refresh(value).each((path) => {
        return closeOthers(sandbox, layeredState, path);
      });
    }),

    AlloyEvents.runOnExecute((component, simulatedEvent) => {
      // Trigger on execute on the targeted element
      // I.e. clicking on menu item
      const target = simulatedEvent.event().target();
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
          () => { }
        );
      });
    }),

    // Open the menu as soon as it is added to the DOM
    AlloyEvents.runOnAttached((container, simulatedEvent) => {
      setup(container).each((primary) => {
        Replacing.append(container, GuiFactory.premade(primary));
        detail.onOpenMenu(container, primary);
        if (detail.highlightImmediately) {
          setActiveMenu(container, primary);
        }
      });
    })
  ].concat(detail.navigateOnHover ? [
    // Hide any irrelevant submenus and expand any submenus based
    // on hovered item
    AlloyEvents.run<CustomEvent>(ItemEvents.hover(), (sandbox, simulatedEvent) => {
      const item = simulatedEvent.event().item();
      updateView(sandbox, item);
      expandRight(sandbox, item, ExpandHighlightDecision.HighlightParent);
      detail.onHover(sandbox, item);
    })
  ] : [ ]));

  const collapseMenuApi = (container: AlloyComponent) => {
    Highlighting.getHighlighted(container).each((currentMenu) => {
      Highlighting.getHighlighted(currentMenu).each((currentItem) => {
        collapseLeft(container, currentItem);
      });
    });
  };

  const highlightPrimary = (container: AlloyComponent) => {
    layeredState.getPrimary().each((primary) => {
      setActiveMenu(container, primary);
    });
  };

  const apis: TieredMenuApis = {
    collapseMenu: collapseMenuApi,
    highlightPrimary
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
          focusIn (container, keyInfo) {
            layeredState.getPrimary().each((primary) => {
              AlloyTriggers.dispatch(container, primary.element(), SystemEvents.focusItem());
            });
          }
        }),
        // Highlighting is used for highlighting the active menu
        Highlighting.config({
          highlightClass: detail.markers.selectedMenu,
          itemClass: detail.markers.menu
        }),
        Composing.config({
          find (container) {
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
