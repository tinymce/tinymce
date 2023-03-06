import { AlloyComponent, AlloyTriggers, Disabling, MementoRecord, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Dialog, Menu, Toolbar } from '@ephox/bridge';
import { Arr, Cell, Optional } from '@ephox/katamari';
import { Attribute, Class, Focus } from '@ephox/sugar';

import { formActionEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderCommonDropdown, updateMenuIcon, updateMenuText } from '../dropdown/CommonDropdown';
import ItemResponse from '../menus/item/ItemResponse';
import * as NestedMenus from '../menus/menu/NestedMenus';
import { getSearchPattern } from '../menus/menu/searchable/SearchableMenu';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

export type MenuButtonSpec = Omit<Toolbar.ToolbarMenuButton, 'type'>;

type FetchCallback = (success: (items: Menu.NestedMenuItemContents[]) => void) => void;

interface StoredMenuItem extends Dialog.DialogFooterToggleMenuItem {
  readonly storage: Cell<boolean>;
}

interface StoredMenuButton extends Omit<Dialog.DialogFooterMenuButton, 'items'> {
  readonly items: StoredMenuItem[];
}

const getMenuButtonApi = (component: AlloyComponent): Toolbar.ToolbarMenuButtonInstanceApi => ({
  isEnabled: () => !Disabling.isDisabled(component),
  setEnabled: (state: boolean) => Disabling.set(component, !state),
  setActive: (state: boolean) => {
    // Note: We can't use the toggling behaviour here, as the dropdown for the menu also relies on it.
    // As such, we'll need to do this manually
    const elm = component.element;
    if (state) {
      Class.add(elm, ToolbarButtonClasses.Ticked);
      Attribute.set(elm, 'aria-pressed', true);
    } else {
      Class.remove(elm, ToolbarButtonClasses.Ticked);
      Attribute.remove(elm, 'aria-pressed');
    }
  },
  isActive: () => Class.has(component.element, ToolbarButtonClasses.Ticked),
  setText: (text: string) => {
    AlloyTriggers.emitWith(component, updateMenuText, {
      text
    });
  },
  setIcon: (icon: string) => AlloyTriggers.emitWith(component, updateMenuIcon, {
    icon
  })
});

const renderMenuButton = (spec: MenuButtonSpec, prefix: string, backstage: UiFactoryBackstage, role: Optional<string>, tabstopping = true): SketchSpec => {
  return renderCommonDropdown({
    text: spec.text,
    icon: spec.icon,
    tooltip: spec.tooltip,
    searchable: spec.search.isSome(),
    // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
    role,
    fetch: (dropdownComp, callback) => {
      const fetchContext: Toolbar.MenuButtonFetchContext = {
        pattern: spec.search.isSome() ? getSearchPattern(dropdownComp) : ''
      };

      spec.fetch(
        (items) => {
          callback(
            NestedMenus.build(
              items,
              ItemResponse.CLOSE_ON_EXECUTE,
              backstage,
              {
                isHorizontalMenu: false,
                // MenuButtons are the only dropdowns that support searchable (2022-08-16)
                search: spec.search
              }
            )
          );
        },
        fetchContext,
        getMenuButtonApi(dropdownComp)
      );
    },
    onSetup: spec.onSetup,
    getApi: getMenuButtonApi,
    columns: 1,
    presets: 'normal',
    classes: [],
    dropdownBehaviours: [
      ...(tabstopping ? [ Tabstopping.config({ }) ] : [])
    ]
  },
  prefix,
  backstage.shared);
};

const getFetch = (items: StoredMenuItem[], getButton: () => MementoRecord, backstage: UiFactoryBackstage): FetchCallback => {
  const getMenuItemAction = (item: StoredMenuItem) => (api: Menu.ToggleMenuItemInstanceApi) => {
    // Update the menu item state
    const newValue = !api.isActive();
    api.setActive(newValue);
    item.storage.set(newValue);

    // Fire the form action event
    backstage.shared.getSink().each((sink) => {
      getButton().getOpt(sink).each((orig) => {
        Focus.focus(orig.element);
        AlloyTriggers.emitWith(orig, formActionEvent, {
          name: item.name,
          value: item.storage.get()
        });
      });
    });
  };

  const getMenuItemSetup = (item: StoredMenuItem) => (api: Menu.ToggleMenuItemInstanceApi) => {
    api.setActive(item.storage.get());
  };

  return (success: (items: Menu.NestedMenuItemContents[]) => void) => {
    success(Arr.map(items, (item) => {
      const text = item.text.fold(() => ({}), (text) => ({
        text
      }));
      return {
        type: item.type,
        active: false,
        ...text,
        onAction: getMenuItemAction(item),
        onSetup: getMenuItemSetup(item)
      };
    }));
  };
};

export {
  renderMenuButton,
  getFetch,
  StoredMenuItem,
  StoredMenuButton
};
