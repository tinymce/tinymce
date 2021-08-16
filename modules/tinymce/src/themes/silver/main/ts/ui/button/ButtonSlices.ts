/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Replacing, SimpleOrSketchSpec } from '@ephox/alloy';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

const renderIcon = (iconName: string, iconsProvider: Icons.IconProvider, behaviours: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>): SimpleOrSketchSpec =>
  Icons.render(iconName, {
    tag: 'span',
    classes: [ ToolbarButtonClasses.Icon, ToolbarButtonClasses.IconWrap ],
    behaviours
  }, iconsProvider);

const renderIconFromPack = (iconName: string, iconsProvider: Icons.IconProvider): SimpleOrSketchSpec =>
  renderIcon(iconName, iconsProvider, []);

const renderReplacableIconFromPack = (iconName: string, iconsProvider: Icons.IconProvider): SimpleOrSketchSpec =>
  renderIcon(iconName, iconsProvider, [ Replacing.config({ }) ]);

const renderLabel = (text: string, prefix: string, providersBackstage: UiFactoryBackstageProviders) => ({
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
