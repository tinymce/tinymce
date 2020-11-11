/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toolbar } from '@ephox/bridge';
import { Obj } from '@ephox/katamari';

const navClass = 'tox-menu-nav__js';
const selectableClass = 'tox-collection__item';
const colorClass = 'tox-swatch';

const presetClasses: { [K in Toolbar.PresetTypes]?: string } = {
  normal: navClass,
  color: colorClass
};

const tickedClass = 'tox-collection__item--enabled';
const separatorClass = 'tox-collection__separator';
const groupHeadingClass = 'tox-collection__group-heading';
const iconClass = 'tox-collection__item-icon';
const textClass = 'tox-collection__item-label';
const accessoryClass = 'tox-collection__item-accessory';
const caretClass = 'tox-collection__item-caret';
const checkmarkClass = 'tox-collection__item-checkmark';
const activeClass = 'tox-collection__item--active';
const iconClassRtl = 'tox-collection__item-icon-rtl';

const containerClass = 'tox-collection__item-container';
const containerColumnClass = 'tox-collection__item-container--column';
const containerRowClass = 'tox-collection__item-container--row';
const containerAlignRightClass = 'tox-collection__item-container--align-right';
const containerAlignLeftClass = 'tox-collection__item-container--align-left';
const containerValignTopClass = 'tox-collection__item-container--valign-top';
const containerValignMiddleClass = 'tox-collection__item-container--valign-middle';
const containerValignBottomClass = 'tox-collection__item-container--valign-bottom';

const classForPreset = (presets: Toolbar.PresetTypes): string => Obj.get(presetClasses, presets).getOr(navClass);

export {
  classForPreset,
  navClass,
  colorClass,

  activeClass,
  selectableClass,
  textClass,
  tickedClass,
  separatorClass,
  groupHeadingClass,
  iconClass,
  accessoryClass,
  caretClass,
  checkmarkClass,
  iconClassRtl,
  containerClass,
  containerColumnClass,
  containerRowClass,
  containerAlignRightClass,
  containerAlignLeftClass,
  containerValignTopClass,
  containerValignMiddleClass,
  containerValignBottomClass
};
