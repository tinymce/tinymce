import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { AlloySpec, RawDomSchema, DomFactory } from '@ephox/alloy';
import { Option, Fun } from '@ephox/katamari';

import { StyleStructureMeta } from './StyleStructure';
import * as ItemClasses from '../ItemClasses';
import { renderText, renderShortcut, renderIcon } from './ItemSlices';
import * as Icons from '../../../icons/Icons';
import { Types } from '@ephox/bridge';

export interface ItemStructure {
  dom: RawDomSchema;
  optComponents: Array<Option<AlloySpec>>;
}

export interface ItemStructureSpec {
  presets: Types.PresetItemTypes;
  iconContent: Option<string>;
  textContent: Option<string>;
  shortcutContent: Option<string>;
  checkMark: Option<AlloySpec>;
  caret: Option<AlloySpec>;
  value?: string;
  meta?: StyleStructureMeta;
}

interface NormalItemSpec {
  iconContent: Option<string>;
  textContent: Option<string>;
  shortcutContent: Option<string>;
  checkMark: Option<AlloySpec>;
  caret: Option<AlloySpec>;
}

const renderColorStructure = (itemValue: string, iconSvg: Option<string>): ItemStructure => {
  const colorPickerCommand = 'custom';
  const removeColorCommand = 'remove';

  const getDom = () => {
    const common = ItemClasses.colorClass;
    const icon = iconSvg.getOr('');

    if (itemValue === colorPickerCommand) {
      return DomFactory.fromHtml(`<button class="${common} tox-swatches__picker-btn">${icon}</button>`);
    } else if (itemValue === removeColorCommand) {
      return DomFactory.fromHtml(`<div class="${common} tox-swatch--remove">${icon}</div>`);
    } else {
      return DomFactory.fromHtml(`<div class="${common}" style="background-color: ${itemValue}" data-mce-color="${itemValue}"></div>`);
    }
  };

  return {
    dom: getDom(),
    optComponents: [ ]
  };
};

// TODO: Maybe need aria-label
const renderNormalItemStructure = (info: NormalItemSpec, icon: Option<string>): ItemStructure => {
  // checkmark has priority, otherwise render icon if we have one, otherwise empty icon for spacing
  const leftIcon = info.checkMark.orThunk(() => icon.or(Option.some('')).map(renderIcon));

  return {
    dom: {
      tag: 'div',
      classes: [ ItemClasses.navClass, ItemClasses.selectableClass ]
    },
    optComponents: [
      leftIcon,
      info.textContent.map(renderText),
      info.shortcutContent.map(renderShortcut),
      info.caret
    ]
  };
};

// TODO: Maybe need aria-label
const renderItemStructure = <T>(info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders): { dom: RawDomSchema, optComponents: Array<Option<AlloySpec>> } => {
  // Convert the icon to a SVG string, if we have one
  const icon = info.iconContent.map((iconName) => Icons.getOr('icon-' + iconName, providersBackstage.icons, Fun.constant(iconName)));
  if (info.presets === 'color') {
    return renderColorStructure(info.value, icon);
  } else {
    return renderNormalItemStructure(info, icon);
  }
};

export {
  renderItemStructure
};