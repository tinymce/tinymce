/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, DomFactory, RawDomSchema } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Fun, Merger, Obj, Option } from '@ephox/katamari';
import I18n from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import * as Icons from '../../../icons/Icons';
import * as ItemClasses from '../ItemClasses';
import { renderIcon, renderShortcut, renderStyledText, renderText } from './ItemSlices';

export interface ItemStructure {
  dom: RawDomSchema;
  optComponents: Array<Option<AlloySpec>>;
}

export interface ItemStructureSpec {
  presets: Types.PresetItemTypes;
  iconContent: Option<string>;
  textContent: Option<string>;
  ariaLabel: Option<string>;
  shortcutContent: Option<string>;
  checkMark: Option<AlloySpec>;
  caret: Option<AlloySpec>;
  value?: string;
  meta?: Record<string, any>;
}

interface NormalItemSpec {
  iconContent: Option<string>;
  textContent: Option<string>;
  shortcutContent: Option<string>;
  checkMark: Option<AlloySpec>;
  caret: Option<AlloySpec>;
  ariaLabel: Option<string>;
}

const renderColorStructure = (itemText: Option<string>, itemValue: string, iconSvg: Option<string>): ItemStructure => {
  const colorPickerCommand = 'custom';
  const removeColorCommand = 'remove';

  const getDom = () => {
    const common = ItemClasses.colorClass;
    const icon = iconSvg.getOr('');
    const title = itemText.map((text) => ` title="${text}"`).getOr('');

    if (itemValue === colorPickerCommand) {
      return DomFactory.fromHtml(`<button class="${common} tox-swatches__picker-btn"${title}>${icon}</button>`);
    } else if (itemValue === removeColorCommand) {
      return DomFactory.fromHtml(`<div class="${common} tox-swatch--remove"${title}>${icon}</div>`);
    } else {
      return DomFactory.fromHtml(`<div class="${common}" style="background-color: ${itemValue}" data-mce-color="${itemValue}"${title}></div>`);
    }
  };

  return {
    dom: getDom(),
    optComponents: [ ]
  };
};

// TODO: Maybe need aria-label
const renderNormalItemStructure = (info: NormalItemSpec, icon: Option<string>, renderIcons: boolean, textRender: (text: string) => AlloySpec): ItemStructure => {
  // checkmark has priority, otherwise render icon if we have one, otherwise empty icon for spacing
  const leftIcon = renderIcons ? info.checkMark.orThunk(() => icon.or(Option.some('')).map(renderIcon)) : Option.none();
  const domTitle = info.ariaLabel.map((label): {attributes?: {title: string}} => {
    return {
      attributes: {
        // TODO: AP-213 change this temporary solution to use tooltips, ensure its aria readable still.
        // for icon only implementations we need either a title or aria label to satisfy aria requirements.
        title: I18n.translate(label)
      }
    };
  }).getOr({});

  const dom = Merger.merge({
    tag: 'div',
    classes: [ ItemClasses.navClass, ItemClasses.selectableClass ],
  }, domTitle);

  const menuItem = {
    dom,
    optComponents: [
      leftIcon,
      info.textContent.map(textRender),
      info.shortcutContent.map(renderShortcut),
      info.caret
    ]
  };
  return menuItem;
};

// TODO: Maybe need aria-label
const renderItemStructure = <T>(info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean, fallbackIcon: Option<string> = Option.none()): { dom: RawDomSchema, optComponents: Array<Option<AlloySpec>> } => {
  // TODO: TINY-3036 Work out a better way of dealing with custom icons
  const icon = info.iconContent.map((iconName) => Icons.getOr(iconName, providersBackstage.icons, fallbackIcon));

  // Style items and autocompleter both have meta. Need to branch on style
  // This could probably be more stable...
  const textRender: (text: string) => AlloySpec = Option.from(info.meta).fold(
    () => renderText,
    (meta) => {
      return Obj.has(meta, 'style') ? Fun.curry(renderStyledText, meta.style) : renderText;
    }
  );

  if (info.presets === 'color') {
    return renderColorStructure(info.ariaLabel, info.value, icon);
  } else {
    return renderNormalItemStructure(info, icon, renderIcons, textRender);
  }
};

export { renderItemStructure };
