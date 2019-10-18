/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, Disabling, SketchSpec, Tabstopping, AlloyTriggers, MementoRecord } from '@ephox/alloy';
import { Toolbar, Types } from '@ephox/bridge';
import { Option, Arr, Cell } from '@ephox/katamari';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderCommonDropdown } from '../dropdown/CommonDropdown';
import * as NestedMenus from '../menus/menu/NestedMenus';
import ItemResponse from '../menus/item/ItemResponse';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';
import { Attr, Class, Focus } from '@ephox/sugar';
import { Omit } from '../Omit';
import { formActionEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

export type MenuButtonSpec = Omit<Toolbar.ToolbarMenuButton, 'type'>;

const getMenuButtonApi = (component: AlloyComponent): Toolbar.ToolbarMenuButtonInstanceApi => {
  return {
    isDisabled: () => Disabling.isDisabled(component),
    setDisabled: (state: boolean) => Disabling.set(component, state),
    setActive: (state: boolean) => {
      // Note: We can't use the toggling behaviour here, as the dropdown for the menu also relies on it.
      // As such, we'll need to do this manually
      const elm = component.element();
      if (state) {
        Class.add(elm, ToolbarButtonClasses.Ticked);
        Attr.set(elm, 'aria-pressed', true);
      } else {
        Class.remove(elm, ToolbarButtonClasses.Ticked);
        Attr.remove(elm, 'aria-pressed');
      }
    },
    isActive: () => Class.has(component.element(), ToolbarButtonClasses.Ticked)
  };
};

const renderMenuButton = (spec: MenuButtonSpec, prefix: string, backstage: UiFactoryBackstage, role: Option<string>): SketchSpec => {
  return renderCommonDropdown({
      text: spec.text,
      icon: spec.icon,
      tooltip: spec.tooltip,
      // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
      role,
      fetch: (callback) => {
        spec.fetch((items) => {
          callback(
            NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage, false)
          );
        });
      },
      onSetup: spec.onSetup,
      getApi: getMenuButtonApi,
      columns: 1,
      presets: 'normal',
      classes: [],
      dropdownBehaviours: [
        Tabstopping.config({ })
      ]
    },
    prefix,
    backstage.shared);
};

interface StoragedMenuItem extends Types.Dialog.DialogToggleMenuItem {
  storage: Cell<Boolean>;
}

interface StoragedMenuButton extends Omit<Types.Dialog.DialogMenuButton, 'items'> {
  items: StoragedMenuItem[];
}

const getFetch = (items: StoragedMenuItem[], getButton: () => MementoRecord, backstage: UiFactoryBackstage) => {
  const getMenuItemAction = (item) => {
    return (api) => {
      backstage.shared.getSink().each((sink) => {
        getButton().getOpt(sink).each((orig) => {
          Focus.focus(orig.element());
          AlloyTriggers.emitWith(orig, formActionEvent, {
            name: item.name,
            value: item.storage.get()
          });
        });
      });
      const newValue = !api.isActive();
      api.setActive(newValue);
      item.storage.set(newValue);
    };
  };

  const getMenuItemSetup = (item) => {
    return (api) => {
      api.setActive(item.storage.get());
    };
  };

  return (success) => {
    success(Arr.map(items, (item) => {
      const text = item.text.fold(() => {
        return {};
      }, (text) => {
        return {
          text
        };
      });
      return {
        type: item.type,
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
  StoragedMenuItem,
  StoragedMenuButton
};
