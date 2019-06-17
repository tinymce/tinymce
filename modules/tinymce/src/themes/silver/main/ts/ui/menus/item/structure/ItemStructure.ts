/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, DomFactory, RawDomSchema } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Fun, Merger, Obj, Option, Arr } from '@ephox/katamari';
import I18n from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstageProviders } from 'tinymce/themes/silver/backstage/Backstage';
import * as Icons from '../../../icons/Icons';
import * as ItemClasses from '../ItemClasses';
import { renderIcon, renderShortcut, renderStyledText, renderText, renderHtml } from './ItemSlices';

export interface ItemStructure {
  dom: RawDomSchema;
  optComponents: Array<Option<AlloySpec>>;
}

export interface ItemStructureSpec {
  presets: Types.PresetItemTypes;
  iconContent: Option<string>;
  textContent: Option<string>;
  htmlContent: Option<string>;
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
  htmlContent: Option<string>;
  shortcutContent: Option<string>;
  checkMark: Option<AlloySpec>;
  caret: Option<AlloySpec>;
  ariaLabel: Option<string>;
}

const renderColorStructure = (itemText: Option<string>, itemValue: string, iconSvg: Option<string>, providerBackstage: UiFactoryBackstageProviders): ItemStructure => {
  const colorPickerCommand = 'custom';
  const removeColorCommand = 'remove';

  const getDom = () => {
    const common = ItemClasses.colorClass;
    const icon = iconSvg.getOr('');
    const title = itemText.map((text) => ` title="${providerBackstage.translate(text)}"`).getOr('');

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
const renderNormalItemStructure = (info: NormalItemSpec, icon: Option<string>, renderIcons: boolean, textRender: (text: string) => AlloySpec, rtlClass: boolean): ItemStructure => {
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
    classes: [ ItemClasses.navClass, ItemClasses.selectableClass ].concat(rtlClass ? [ ItemClasses.iconClassRtl ] : []),
  }, domTitle);

  const content = info.htmlContent.fold(() => info.textContent.map(textRender),
    (html) => Option.some(renderHtml(html))
  );

  const menuItem = {
    dom,
    optComponents: [
      leftIcon,
      content,
      info.shortcutContent.map(renderShortcut),
      info.caret
    ]
  };
  return menuItem;
};

// TODO TINY-3598: Implement a permanent solution to render rtl icons
// Icons that have `-rtl` equivalents
const rtlIcon = [
  'list-num-default',
  'list-num-lower-alpha',
  'list-num-lower-greek',
  'list-num-lower-roman',
  'list-num-upper-alpha',
  'list-num-upper-roman'
];

// Icons that need to be transformed in RTL
const rtlTransform = [
  'list-bull-circle',
  'list-bull-default',
  'list-bull-square'
];

// TODO: Maybe need aria-label
const renderItemStructure = <T>(info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean, fallbackIcon: Option<string> = Option.none()): { dom: RawDomSchema, optComponents: Array<Option<AlloySpec>> } => {
  // If RTL and icon is in whitelist, add RTL icon class for icons that don't have a `-rtl` icon available.
  // Use `-rtl` icon suffix for icons that do.
  const getIconName = (iconName: Option<string>): Option<string> => {
    return iconName.map((name) => I18n.isRtl() && Arr.contains(rtlIcon, name) ? name + '-rtl' : name);
  };

  const needRtlClass = I18n.isRtl() && info.iconContent.exists((name) => Arr.contains(rtlTransform, name));

  // TODO: TINY-3036 Work out a better way of dealing with custom icons
  const icon = getIconName(info.iconContent).map((iconName) => Icons.getOr(iconName, providersBackstage.icons, fallbackIcon));

  // Style items and autocompleter both have meta. Need to branch on style
  // This could probably be more stable...
  const textRender: (text: string) => AlloySpec = Option.from(info.meta).fold(
    () => renderText,
    (meta) => {
      return Obj.has(meta, 'style') ? Fun.curry(renderStyledText, meta.style) : renderText;
    }
  );

  if (info.presets === 'color') {
    return renderColorStructure(info.ariaLabel, info.value, icon, providersBackstage);
  } else {
    return renderNormalItemStructure(info, icon, renderIcons, textRender, needRtlClass);
  }
};

export { renderItemStructure };
