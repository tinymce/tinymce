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
import { LayeredState } from '../../menu/layered/LayeredState';
import * as ItemEvents from '../../menu/util/ItemEvents';
import * as MenuEvents from '../../menu/util/MenuEvents';

import { EventFormat, CustomEvent, NativeSimulatedEvent, CustomSimulatedEvent } from '../../events/SimulatedEvent';
import { TieredMenuDetail, TieredMenuSpec, PartialMenuSpec } from '../../ui/types/TieredMenuTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { LooseSpec } from '../../api/component/SpecTypes';

const make: SingleSketchFactory<TieredMenuDetail, TieredMenuSpec> = function (detail, rawUiSpec) {
  const buildMenus = function (container: AlloyComponent, menus: Record<string, PartialMenuSpec>): Record<string, AlloyComponent> {
    return Obj.map(menus, function (spec: PartialMenuSpec, name: string) {
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

  const layeredState = LayeredState.init();

  const setup = (container: AlloyComponent): Option<AlloyComponent> => {
    const componentMap = buildMenus(container, detail.data().menus());
    const directory = toDirectory(container);
    layeredState.setContents(detail.data().primary(), componentMap, detail.data().expansions(), directory);
    return layeredState.getPrimary();
  };

  const getItemValue = (item: AlloyComponent): string => {
    return Representing.getValue(item).value;
  };

  const toDirectory = (container: AlloyComponent): Record<string, string[]> => {
    return Obj.map(detail.data().menus(), function (data, menuName) {
      return Arr.bind(data.items, function (item) {
        return item.type === 'separator' ? [ ] : [ item.data.value ];
      });
    });
  };

  const setActiveMenu = function (container: AlloyComponent, menu: AlloyComponent): void {
    Highlighting.highlight(container, menu);
    Highlighting.getHighlighted(menu).orThunk(function () {
      return Highlighting.getFirst(menu);
    }).each(function (item) {
      AlloyTriggers.dispatch(container, item.element(), SystemEvents.focusItem());
    });
  };

  const getMenus = function (state: LayeredState, menuValues: string[]): AlloyComponent[] {
    return Options.cat(
      Arr.map(menuValues, state.lookupMenu)
    );
  };

  const updateMenuPath = (container: AlloyComponent, state: LayeredState, path: string[]): Option<AlloyComponent> => {
    return Option.from(path[0]).bind(state.lookupMenu).map((activeMenu: AlloyComponent) => {
      const rest = getMenus(state, path.slice(1));
      Arr.each(rest, (r) => {
        Class.add(r.element(), detail.markers().backgroundMenu());
      });

      if (! Body.inBody(activeMenu.element())) {
        Replacing.append(container, GuiFactory.premade(activeMenu));
      }

      // Remove the background-menu class from the active menu
      Classes.remove(activeMenu.element(), [ detail.markers().backgroundMenu() ]);
      setActiveMenu(container, activeMenu);
      const others = getMenus(state, state.otherMenus(path));
      Arr.each(others, (o) => {
        // May not need to do the active menu thing.
        Classes.remove(o.element(), [ detail.markers().backgroundMenu() ]);
        if (! detail.stayInDom()) { Replacing.remove(container, o); }
      });

      return activeMenu;
    });

  };

  const expandRight = function (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> {
    const value = getItemValue(item);
    return layeredState.expand(value).bind((path) => {
      // When expanding, always select the first.
      Option.from(path[0]).bind(layeredState.lookupMenu).each((activeMenu) => {
        // DUPE with above. Fix later.
        if (! Body.inBody(activeMenu.element())) {
          Replacing.append(container, GuiFactory.premade(activeMenu));
        }

        detail.onOpenSubmenu()(container, item, activeMenu);
        Highlighting.highlightFirst(activeMenu);
      });

      return updateMenuPath(container, layeredState, path);
    });
  };

  const collapseLeft = function (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> {
    const value = getItemValue(item);
    return layeredState.collapse(value).bind((path) => {
      return updateMenuPath(container, layeredState, path).map((activeMenu) => {
        detail.onCollapseMenu()(container, item, activeMenu);
        return activeMenu;
      });
    });
  };

  const updateView = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    const value = getItemValue(item);
    return layeredState.refresh(value).bind(function (path) {
      return updateMenuPath(container, layeredState, path);
    });
  };

  const onRight = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    return EditableFields.inside(item.element()) ? Option.none() : expandRight(container, item);
  };

  const onLeft = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    // Exclude inputs, textareas etc.
    return EditableFields.inside(item.element()) ? Option.none() : collapseLeft(container, item);
  };

  const onEscape = (container: AlloyComponent, item: AlloyComponent): Option<AlloyComponent> => {
    return collapseLeft(container, item).orThunk(() => {
      // This should only fire when the user presses ESC ... not any other close.
      return detail.onEscape()(container, item).map(() => container);
    });
  };

  type KeyHandler = (container: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>
  const keyOnItem = function (f: (container: AlloyComponent, item: AlloyComponent) => Option<AlloyComponent>): KeyHandler {
    return function (container: AlloyComponent, simulatedEvent: NativeSimulatedEvent): Option<boolean> {
      return SelectorFind.closest(simulatedEvent.getSource(), '.' + detail.markers().item()).bind(function (target) {
        return container.getSystem().getByDom(target).toOption().bind((item: AlloyComponent) => {
          return f(container, item).map(() => true);
        });
      });
    };
  };

  const events = AlloyEvents.derive([
    // Set "active-menu" for the menu with focus
    AlloyEvents.run<CustomEvent>(MenuEvents.focus(), function (sandbox, simulatedEvent) {
      const menu = simulatedEvent.event().menu();
      Highlighting.highlight(sandbox, menu);
    }),

    AlloyEvents.runOnExecute(function (component, simulatedEvent) {
      // Trigger on execute on the targeted element
      // I.e. clicking on menu item
      const target = simulatedEvent.event().target();
      component.getSystem().getByDom(target).each(function (item) {
        const itemValue = getItemValue(item);

        // FIX: I don't know if this is doing anything any more. Check.
        if (itemValue.indexOf('collapse-item') === 0) {
          collapseLeft(component, item);
        }

        expandRight(component, item).fold(
          () => {
            detail.onExecute()(component, item);
          },
          () => { }
        );
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
    AlloyEvents.run<CustomEvent>(ItemEvents.hover(), function (sandbox, simulatedEvent) {
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
            layeredState.getPrimary().each(function (primary) {
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