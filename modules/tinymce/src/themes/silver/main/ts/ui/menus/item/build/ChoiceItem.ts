import { AlloyComponent, Disabling, ItemTypes, Toggling } from '@ephox/alloy';
import { Menu, Toolbar } from '@ephox/bridge';
import { Fun, Merger, Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderCheckmark } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

const renderChoiceItem = (
  spec: Menu.ChoiceMenuItem,
  useText: boolean,
  presets: Toolbar.PresetItemTypes,
  onItemValueHandler: (itemValue: string) => void,
  isSelected: boolean,
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
    setEnabled: (state) => Disabling.set(component, !state)
  });

  const structure = renderItemStructure({
    presets,
    textContent: useText ? spec.text : Optional.none(),
    htmlContent: Optional.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: useText ? spec.shortcut : Optional.none(),

    // useText essentially says that we have one column. In one column lists, we should show a tick
    // The tick is controlled by the tickedClass (via css). It is always present
    // but is hidden unless the tickedClass is present.
    checkMark: useText ? Optional.some(renderCheckmark(providersBackstage.icons)) : Optional.none(),
    caret: Optional.none(),
    value: spec.value
  }, providersBackstage, renderIcons);

  return Merger.deepMerge(
    renderCommonItem({
      data: buildData(spec),
      enabled: spec.enabled,
      getApi,
      onAction: (_api) => onItemValueHandler(spec.value),
      onSetup: (api) => {
        api.setActive(isSelected);
        return Fun.noop;
      },
      triggersSubmenu: false,
      itemBehaviours: [ ]
    }, structure, itemResponse, providersBackstage),
    {
      toggling: {
        toggleClass: ItemClasses.tickedClass,
        toggleOnExecute: false,
        selected: spec.active,
        exclusive: true
      }
    }
  );
};

export { renderChoiceItem };
