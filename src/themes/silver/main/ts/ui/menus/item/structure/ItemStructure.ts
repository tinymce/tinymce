/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { AlloySpec, RawDomSchema, DomFactory } from '@ephox/alloy';
import { Fun, Option, Merger } from '@ephox/katamari';

import { StyleStructureMeta } from './StyleStructure';
import * as ItemClasses from '../ItemClasses';
import { renderText, renderShortcut, renderIcon } from './ItemSlices';
import * as Icons from '../../../icons/Icons';
import { Types } from '@ephox/bridge';
import I18n from 'tinymce/core/api/util/I18n';

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
  meta?: StyleStructureMeta;
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
const renderNormalItemStructure = (info: NormalItemSpec, icon: Option<string>): ItemStructure => {
  // checkmark has priority, otherwise render icon if we have one, otherwise empty icon for spacing
  const leftIcon = info.checkMark.orThunk(() => icon.or(Option.some('')).map(renderIcon));
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
      info.textContent.map(renderText),
      info.shortcutContent.map(renderShortcut),
      info.caret
    ]
  };
  return menuItem;
};

// TODO: Maybe need aria-label
const renderItemStructure = <T>(info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders, fallbackIcon: Option<string> = Option.none()): { dom: RawDomSchema, optComponents: Array<Option<AlloySpec>> } => {
  // TODO: TINY-3029 Work out a better way of dealing with custom icons
  const icon = info.iconContent.map((iconName) => fallbackIcon.fold(
    () => Icons.get(iconName, providersBackstage.icons),
    (fallback) => Icons.getOr(iconName, providersBackstage.icons, Fun.constant(fallback))
  ));
  if (info.presets === 'color') {
    return renderColorStructure(info.ariaLabel, info.value, icon);
  } else {
    return renderNormalItemStructure(info, icon);
  }
};

export {
  renderItemStructure
};