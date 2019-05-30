/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Objects } from '@ephox/boulder';
import { Types } from '@ephox/bridge';

const navClass = 'tox-menu-nav__js';
const selectableClass = 'tox-collection__item';
const colorClass = 'tox-swatch';

const presetClasses = {
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

const classForPreset = (presets: Types.PresetTypes): string => {
  return Objects.readOptFrom<string>(presetClasses, presets).getOr(navClass);
};

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
  iconClassRtl
};