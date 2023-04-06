import { AlloySpec, RawDomSchema } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Fun, Id, Obj, Optional, Type } from '@ephox/katamari';

import I18n from 'tinymce/core/api/util/I18n';

import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import * as Icons from '../../../icons/Icons';
import * as ItemClasses from '../ItemClasses';
import { renderHtml, renderShortcut, renderStyledText, renderText } from './ItemSlices';

export interface ItemStructure {
  readonly dom: RawDomSchema;
  readonly optComponents: Array<Optional<AlloySpec>>;
}

export interface ItemStructureSpec {
  readonly presets: Toolbar.PresetItemTypes;
  readonly iconContent: Optional<string>;
  readonly textContent: Optional<string>;
  readonly htmlContent: Optional<string>;
  readonly ariaLabel: Optional<string>;
  readonly shortcutContent: Optional<string>;
  readonly checkMark: Optional<AlloySpec>;
  readonly caret: Optional<AlloySpec>;
  readonly value?: string;
  readonly meta?: Record<string, any>;
}

const renderColorStructure = (item: ItemStructureSpec, providerBackstage: UiFactoryBackstageProviders, fallbackIcon: Optional<string>): ItemStructure => {
  const colorPickerCommand = 'custom';
  const removeColorCommand = 'remove';

  const itemText = item.ariaLabel;
  const itemValue = item.value;
  const iconSvg = item.iconContent.map((name) => Icons.getOr(name, providerBackstage.icons, fallbackIcon));

  const getDom = (): RawDomSchema => {
    const common = ItemClasses.colorClass;
    const icon = iconSvg.getOr('');
    const attributes = itemText.map((text) => ({ title: providerBackstage.translate(text) } as Record<string, string>)).getOr({ });

    const baseDom = {
      tag: 'div',
      attributes,
      classes: [ common ]
    };

    if (itemValue === colorPickerCommand) {
      return {
        ...baseDom,
        tag: 'button',
        classes: [ ...baseDom.classes, 'tox-swatches__picker-btn' ],
        innerHtml: icon
      };
    } else if (itemValue === removeColorCommand) {
      return {
        ...baseDom,
        classes: [ ...baseDom.classes, 'tox-swatch--remove' ],
        innerHtml: icon
      };
    } else if (Type.isNonNullable(itemValue)) {
      return {
        ...baseDom,
        attributes: {
          ...baseDom.attributes,
          'data-mce-color': itemValue
        },
        styles: {
          'background-color': itemValue
        },
        innerHtml: icon
      };
    } else {
      return baseDom;
    }
  };

  return {
    dom: getDom(),
    optComponents: [ ]
  };
};

const renderItemDomStructure = (ariaLabel: Optional<string>): RawDomSchema => {
  const domTitle = ariaLabel.map((label): { attributes?: { title: string; id?: string }} => ({
    attributes: {
      // TODO: AP-213 change this temporary solution to use tooltips, ensure its aria readable still.
      // for icon only implementations we need either a title or aria label to satisfy aria requirements.
      title: I18n.translate(label),
      id: Id.generate('menu-item')
    }
  })).getOr({});

  return {
    tag: 'div',
    classes: [ ItemClasses.navClass, ItemClasses.selectableClass ],
    ...domTitle
  };
};

const renderNormalItemStructure = (info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean, fallbackIcon: Optional<string>): ItemStructure => {
  // TODO: TINY-3036 Work out a better way of dealing with custom icons
  const iconSpec = { tag: 'div', classes: [ ItemClasses.iconClass ] };
  const renderIcon = (iconName: string) => Icons.render(iconName, iconSpec, providersBackstage.icons, fallbackIcon);
  const renderEmptyIcon = () => Optional.some({ dom: iconSpec });
  // Note: renderIcons indicates if any icons are present in the menu - if false then the icon column will not be present for the whole menu
  const leftIcon = renderIcons ? info.iconContent.map(renderIcon).orThunk(renderEmptyIcon) : Optional.none();
  // TINY-3345: Dedicated columns for icon and checkmark if applicable
  const checkmark = info.checkMark;

  // Style items and autocompleter both have meta. Need to branch on style
  // This could probably be more stable...
  const textRender = Optional.from(info.meta).fold(
    () => renderText,
    (meta) => Obj.has(meta, 'style') ? Fun.curry(renderStyledText, meta.style) : renderText
  );

  const content = info.htmlContent.fold(
    () => info.textContent.map(textRender),
    (html) => Optional.some(renderHtml(html, [ ItemClasses.textClass ]))
  );

  const menuItem = {
    dom: renderItemDomStructure(info.ariaLabel),
    optComponents: [
      leftIcon,
      content,
      info.shortcutContent.map(renderShortcut),
      checkmark,
      info.caret
    ]
  };
  return menuItem;
};

// TODO: Maybe need aria-label
const renderItemStructure = (info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean, fallbackIcon: Optional<string> = Optional.none()): ItemStructure => {
  if (info.presets === 'color') {
    return renderColorStructure(info, providersBackstage, fallbackIcon);
  } else {
    return renderNormalItemStructure(info, providersBackstage, renderIcons, fallbackIcon);
  }
};

export { renderItemStructure, renderItemDomStructure };
