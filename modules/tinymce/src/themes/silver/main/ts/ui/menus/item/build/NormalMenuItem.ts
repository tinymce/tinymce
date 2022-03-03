import { AlloyComponent, Disabling, ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';

import ItemResponse from '../ItemResponse';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';

// Note, this does not create a valid SketchSpec.
const renderNormalItem = (spec: Menu.MenuItem, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean = true): ItemTypes.ItemSpec => {
  const getApi = (component: AlloyComponent): Menu.MenuItemInstanceApi => ({
    isEnabled: () => !Disabling.isDisabled(component),
    setEnabled: (state: boolean) => Disabling.set(component, !state)
  });

  const structure = renderItemStructure({
    presets: 'normal',
    iconContent: spec.icon,
    textContent: spec.text,
    htmlContent: Optional.none(),
    ariaLabel: spec.text,
    caret: Optional.none(),
    checkMark: Optional.none(),
    shortcutContent: spec.shortcut
  }, providersBackstage, renderIcons);

  return renderCommonItem({
    data: buildData(spec),
    getApi,
    enabled: spec.enabled,
    onAction: spec.onAction,
    onSetup: spec.onSetup,
    triggersSubmenu: false,
    itemBehaviours: [ ]
  }, structure, itemResponse, providersBackstage);
};

export { renderNormalItem };
