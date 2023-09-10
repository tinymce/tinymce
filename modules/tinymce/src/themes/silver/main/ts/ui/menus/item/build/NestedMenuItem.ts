import { AlloyComponent, Disabling, ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';
import { Attribute, SelectorFind } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

import ItemResponse from '../ItemResponse';
import { renderDownwardsCaret, renderSubmenuCaret } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// Note, this does not create a valid SketchSpec.
const renderNestedItem = (spec: Menu.NestedMenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean = true, downwardsCaret: boolean = false): ItemTypes.ItemSpec => {
  const caret = downwardsCaret ? renderDownwardsCaret(providersBackstage.icons) : renderSubmenuCaret(providersBackstage.icons);
  const getApi = (component: AlloyComponent): Menu.NestedMenuItemInstanceApi => ({
    isEnabled: () => !Disabling.isDisabled(component),
    setEnabled: (state: boolean) => Disabling.set(component, !state),
    setIconFill: (id, value) => {
      SelectorFind.descendant(component.element, `svg path[class="${id}"], rect[class="${id}"]`).each((underlinePath) => {
        Attribute.set(underlinePath, 'fill', value);
      });
    },
    setTooltip: (tooltip: string) => {
      const translatedTooltip = providersBackstage.translate(tooltip);
      Attribute.setAll(component.element, { 'aria-label': translatedTooltip, 'title': translatedTooltip });
    }
  });

  const structure = renderItemStructure({
    presets: 'normal',
    iconContent: spec.icon,
    textContent: spec.text,
    htmlContent: Optional.none(),
    ariaLabel: spec.text,
    caret: Optional.some(caret),
    checkMark: Optional.none(),
    shortcutContent: spec.shortcut
  }, providersBackstage, renderIcons);
  return renderCommonItem({
    data: buildData(spec),
    getApi,
    enabled: spec.enabled,
    onAction: Fun.noop,
    onSetup: spec.onSetup,
    triggersSubmenu: true,
    itemBehaviours: [ ]
  }, structure, itemResponse, providersBackstage);
};

export { renderNestedItem };
