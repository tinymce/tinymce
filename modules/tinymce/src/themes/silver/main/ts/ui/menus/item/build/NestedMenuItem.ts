import { AlloyComponent, Disabling, ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Option } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import ItemResponse from '../ItemResponse';
import { renderSubmenuCaret, renderDownwardsCaret } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// Note, this does not create a valid SketchSpec.
const renderNestedItem = (spec: Menu.NestedMenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean = true, isHorizontalMenu: boolean): ItemTypes.ItemSpec => {
  const caret = isHorizontalMenu ? renderDownwardsCaret(providersBackstage.icons) : renderSubmenuCaret(providersBackstage.icons);
  const getApi = (component: AlloyComponent): Menu.NestedMenuItemInstanceApi => {
    return {
      isDisabled: () => Disabling.isDisabled(component),
      setDisabled: (state: boolean) => Disabling.set(component, state)
    };
  };

  // If we're making a horizontal menu (mobile context menu) we want text OR icons
  // to simplify the UI. We also don't want shortcut text.
  const structure = renderItemStructure({
    presets: 'normal',
    iconContent: isHorizontalMenu && spec.text.isSome() ? Option.none() : spec.icon,
    textContent: spec.text,
    htmlContent: Option.none(),
    ariaLabel: spec.text,
    caret: Option.some(caret),
    checkMark: Option.none(),
    shortcutContent: isHorizontalMenu ? Option.none() : spec.shortcut
  }, providersBackstage, renderIcons);

  return renderCommonItem({
    data: buildData(spec),
    getApi,
    disabled: spec.disabled,
    onAction: Fun.noop,
    onSetup: spec.onSetup,
    triggersSubmenu: true,
    itemBehaviours: [ ]
  }, structure, itemResponse);
};

export { renderNestedItem };
