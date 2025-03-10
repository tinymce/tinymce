import { AlloyComponent, Disabling, ItemTypes, Toggling, Tooltipping } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Merger, Optional } from '@ephox/katamari';
import { Insert, SelectorFind, SugarElement } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderCheckmark } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

const renderImgItem = (
  spec: Menu.ImageMenuItem,
  useText: boolean,
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
    textContent: useText ? spec.text : Optional.none(),
    htmlContent: Optional.none(),
    ariaLabel: spec.text,
    iconContent: spec.url,
    labelContent: spec.label,
    shortcutContent: useText ? spec.shortcut : Optional.none(),

    // useText essentially says that we have one column. In one column lists, we should show a tick
    // The tick is controlled by the tickedClass (via css). It is always present
    // but is hidden unless the tickedClass is present.
    checkMark: useText ? Optional.some(renderCheckmark(providersBackstage.icons)) : Optional.none(),
    caret: Optional.none(),
    value: spec.value
  }, providersBackstage, true);

  const optTooltipping = spec.text
    .filter(Fun.constant(!useText))
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
      onAction: (_api) => onItemValueHandler(spec.value),
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
        selected: spec.active,
        exclusive: true,
        onToggled: (comp: AlloyComponent) => {
          SelectorFind.descendant(comp.element, '.tox-collection__item-image').each((imgContainer) => {
            const checkmarkIcon = providersBackstage.icons().checkmark;
            const iconElement = SugarElement.fromHtml(`<div class="tox-collection__item-image-check">${checkmarkIcon}</div>`);
            Insert.append(imgContainer, iconElement);
          });
        }
      }
    }
  );
};

export { renderImgItem };
