import { AlloyComponent, Disabling, ItemTypes, Toggling, Tooltipping } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Merger, Optional } from '@ephox/katamari';
import { Class, Html, Insert, SelectorFind, SugarElement } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

const renderImgItem = (
  spec: Menu.ImageMenuItem,
  onItemValueHandler: (itemValue: string) => void,
  isSelected: boolean,
  itemResponse: ItemResponse,
  providersBackstage: UiFactoryBackstageProviders
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
    presets: 'img',
    textContent: Optional.none(),
    htmlContent: Optional.none(),
    ariaLabel: spec.tooltip,
    iconContent: Optional.some(spec.url),
    labelContent: spec.label,
    shortcutContent: Optional.none(),
    checkMark: Optional.none(),
    caret: Optional.none(),
    value: spec.value
  }, providersBackstage, true);

  const optTooltipping = spec.tooltip
    .map((t) => Tooltipping.config(
      providersBackstage.tooltips.getConfig({
        tooltipText: providersBackstage.translate(t)
      })
    ));

  return Merger.deepMerge(
    renderCommonItem({
      context: spec.context,
      data: buildData(spec),
      enabled: spec.enabled,
      getApi,
      onAction: (api) => {
        onItemValueHandler(spec.value);
        api.setActive(true);
      },
      onSetup: (api) => {
        api.setActive(isSelected);
        return Fun.noop;
      },
      triggersSubmenu: false,
      itemBehaviours: [
        ...optTooltipping.toArray()
      ]
    }, structure, itemResponse, providersBackstage),
    {
      toggling: {
        toggleClass: ItemClasses.tickedClass,
        toggleOnExecute: false,
        exclusive: true,
        onToggled: (comp: AlloyComponent) => {
          SelectorFind.descendant(comp.element, '.tox-collection__item-image').each((imgContainer) => {
            const checkmarkIcon = providersBackstage.icons().checkmark;
            const iconElement = SugarElement.fromTag('div');
            Class.add(iconElement, 'tox-collection__item-image-check');
            Html.set(iconElement, checkmarkIcon);
            Insert.append(imgContainer, iconElement);
          });
        }
      }
    }
  );
};

export { renderImgItem };

