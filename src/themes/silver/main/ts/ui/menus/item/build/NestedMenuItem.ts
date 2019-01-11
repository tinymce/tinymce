import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { Disabling } from '@ephox/alloy';
import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { Menu } from '@ephox/bridge';
import { Fun, Option, Obj } from '@ephox/katamari';

import { renderSubmenuCaret } from '../structure/ItemSlices';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';
import ItemResponse from '../ItemResponse';

// Note, this does not create a valid SketchSpec.
const renderNestedItem = (spec: Menu.NestedMenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
  const caret = renderSubmenuCaret(providersBackstage.icons);
  const getApi = (component): Menu.NestedMenuItemInstanceApi => {
    return {
      isDisabled: () => Disabling.isDisabled(component),
      setDisabled: (state) => state ? Disabling.disable(component) : Disabling.enable(component)
    };
  };

  const structure = renderItemStructure({
    presets: 'normal',
    iconContent: spec.icon,
    textContent: spec.text,
    ariaLabel: spec.text,
    caret: Option.some(caret),
    checkMark: Option.none(),
    shortcutContent: spec.shortcut,
    ...spec.meta && Obj.keys(spec.meta).length > 0 ? { meta: spec.meta } : {}
  }, providersBackstage);

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
