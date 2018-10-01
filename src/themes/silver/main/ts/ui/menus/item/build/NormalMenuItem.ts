import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { Disabling } from '@ephox/alloy';
import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';
import { Option } from '@ephox/katamari';

import { ItemResponse } from '../MenuItems';
import { renderSubmenuCaret } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// Note, this does not create a valid SketchSpec.
const renderNormalItem = (spec: Menu.MenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
  const caret = spec.hasSubmenu ? Option.some(renderSubmenuCaret(providersBackstage.icons)) : Option.none();
  const getApi = (component): Menu.MenuItemInstanceApi => {
    return {
      isDisabled: () => Disabling.isDisabled(component),
      setDisabled: (state) => state ? Disabling.disable(component) : Disabling.enable(component)
    };
  };

  const structure = renderItemStructure({
    presets: 'normal',
    iconContent: spec.icon,
    textContent: spec.text,
    caret,
    checkMark: Option.none(),
    shortcutContent: spec.shortcut
  }, providersBackstage);

  return renderCommonItem({
    data: buildData(spec),
    getApi,
    disabled: spec.disabled,
    onAction: spec.onAction,
    onSetup: spec.onSetup,
    triggersSubmenu: spec.hasSubmenu,
    itemBehaviours: [ ]
  }, structure, itemResponse);
};

export { renderNormalItem };
