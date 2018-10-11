import { Behaviour, Replacing } from '@ephox/alloy';
import { IconProvider, getOr } from '../icons/Icons';
import { Fun } from '@ephox/katamari';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

const renderIcon = (iconHtml) =>
  ({
    dom: {
      tag: 'span',
      innerHtml: iconHtml,
      classes: [ ToolbarButtonClasses.IconWrap ]
    }
  });

const renderIconFromPack = (iconName, iconsProvider: IconProvider) => {
  return renderIcon(
    getOr('icon-' + iconName, iconsProvider, Fun.constant(iconName))
  );
};

const renderLabel = (text: string, prefix: string) => ({
  dom: {
    tag: 'span',
    innerHtml: text,
    classes: [ `${prefix}__select-label` ]
  },
  behaviours: Behaviour.derive([
    Replacing.config({ })
  ])
});

export {
  renderIconFromPack,
  renderLabel
};