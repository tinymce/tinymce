/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Replacing, SimpleOrSketchSpec } from '@ephox/alloy';
import { TranslateIfNeeded } from 'tinymce/core/api/util/I18n';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { get as getIcon, IconProvider } from '../icons/Icons';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

const renderIcon = (iconHtml, behaviours): SimpleOrSketchSpec =>
  ({
    dom: {
      tag: 'span',
      innerHtml: iconHtml,
      classes: [ ToolbarButtonClasses.Icon, ToolbarButtonClasses.IconWrap ]
    },
    ...behaviours
  });

const renderIconFromPack = (iconName: string, iconsProvider: IconProvider): SimpleOrSketchSpec => renderIcon(getIcon(iconName, iconsProvider), { });

const renderReplacableIconFromPack = (iconName: string, iconsProvider: IconProvider): SimpleOrSketchSpec => renderIcon(getIcon(iconName, iconsProvider), {
  behaviours: Behaviour.derive([
    Replacing.config({ })
  ])
});

const renderLabel = (text: TranslateIfNeeded, prefix: string, providersBackstage: UiFactoryBackstageProviders) => ({
  dom: {
    tag: 'span',
    innerHtml: providersBackstage.translate(text),
    classes: [ `${prefix}__select-label` ]
  },
  behaviours: Behaviour.derive([
    Replacing.config({ })
  ])
});

export {
  renderIconFromPack,
  renderReplacableIconFromPack,
  renderLabel
};