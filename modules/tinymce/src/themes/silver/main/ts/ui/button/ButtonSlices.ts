import { Behaviour, GuiFactory, Replacing, SimpleSpec } from '@ephox/alloy';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

const renderIcon = (iconName: string, iconsProvider: Icons.IconProvider, behaviours: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>): SimpleSpec =>
  Icons.render(iconName, {
    tag: 'span',
    classes: [ ToolbarButtonClasses.Icon, ToolbarButtonClasses.IconWrap ],
    behaviours
  }, iconsProvider);

const renderIconFromPack = (iconName: string, iconsProvider: Icons.IconProvider): SimpleSpec =>
  renderIcon(iconName, iconsProvider, []);

const renderReplaceableIconFromPack = (iconName: string, iconsProvider: Icons.IconProvider): SimpleSpec =>
  renderIcon(iconName, iconsProvider, [ Replacing.config({ }) ]);

const renderLabel = (text: string, prefix: string, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => ({
  dom: {
    tag: 'span',
    classes: [ `${prefix}__select-label` ]
  },
  components: [
    GuiFactory.text(providersBackstage.translate(text))
  ],
  behaviours: Behaviour.derive([
    Replacing.config({ })
  ])
});

export {
  renderIconFromPack,
  renderReplaceableIconFromPack,
  renderLabel
};
