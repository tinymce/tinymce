import { AlloyComponent, Disabling, ItemTypes, Toggling } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Merger, Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderCheckmark } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

const renderToggleMenuItem = (
  spec: Menu.ToggleMenuItem,
  itemResponse: ItemResponse,
  providersBackstage: UiFactoryBackstageProviders,
  renderIcons: boolean = true
): ItemTypes.ItemSpec => {
  const getApi = (component: AlloyComponent): Menu.ToggleMenuItemInstanceApi => ({
    setActive: (state) => {
      Toggling.set(component, state);
    },
    isActive: () => Toggling.isOn(component),
    isEnabled: () => !Disabling.isDisabled(component),
    setEnabled: (state: boolean) => Disabling.set(component, !state)
  });

  // BespokeSelects use meta to pass through styling information. Bespokes should only
  // be togglemenuitems hence meta is only passed through in this MenuItem.
  const structure = renderItemStructure({
    iconContent: spec.icon,
    textContent: spec.text,
    htmlContent: Optional.none(),
    ariaLabel: spec.text,
    checkMark: Optional.some(renderCheckmark(providersBackstage.icons)),
    caret: Optional.none(),
    shortcutContent: spec.shortcut,
    presets: 'normal',
    meta: spec.meta
  }, providersBackstage, renderIcons);

  return Merger.deepMerge(
    renderCommonItem({
      data: buildData(spec),
      enabled: spec.enabled,
      getApi,
      onAction: spec.onAction,
      onSetup: spec.onSetup,
      triggersSubmenu: false,
      itemBehaviours: [ ]
    }, structure, itemResponse, providersBackstage),
    {
      toggling: {
        toggleClass: ItemClasses.tickedClass,
        toggleOnExecute: false,
        selected: spec.active
      }
    }
  );
};

export { renderToggleMenuItem };
