import { AlloyComponent, Disabling, ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Fun, Option } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import ItemResponse from '../ItemResponse';
import { renderSubmenuCaret, renderDownwardsCaret } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// Note, this does not create a valid SketchSpec.
const renderNestedItem = (spec: Menu.NestedMenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean = true, downwardsCaret: boolean = false): ItemTypes.ItemSpec => {
  const caret = downwardsCaret ? renderDownwardsCaret(providersBackstage.icons) : renderSubmenuCaret(providersBackstage.icons);
  const getApi = (component: AlloyComponent): Menu.NestedMenuItemInstanceApi => {
    return {
      isDisabled: () => Disabling.isDisabled(component),
      setDisabled: (state: boolean) => Disabling.set(component, state)
    };
  };

  const structure = renderItemStructure({
    presets: 'normal',
    iconContent: spec.icon,
    textContent: spec.text,
    htmlContent: Option.none(),
    ariaLabel: spec.text,
    caret: Option.some(caret),
    checkMark: Option.none(),
    shortcutContent: spec.shortcut
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
