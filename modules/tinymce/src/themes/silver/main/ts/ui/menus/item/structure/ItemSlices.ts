import { AlloySpec, GuiFactory, SimpleSpec } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';

import I18n from 'tinymce/core/api/util/I18n';

import * as ConvertShortcut from '../../../alien/ConvertShortcut';
import * as Icons from '../../../icons/Icons';
import * as ItemClasses from '../ItemClasses';

const renderIcon = (name: string, icons: Icons.IconProvider, classes: string[] = [ ItemClasses.iconClass ]): SimpleSpec =>
  Icons.render(name, { tag: 'div', classes }, icons);

const renderText = (text: string): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.textClass ]
  },
  components: [ GuiFactory.text(I18n.translate(text)) ]
});

const renderHtml = (html: string, classes: string[]): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes,
    innerHtml: html
  }
});

interface StyleProps {
  tag: string;
  styles: Record<string, string>;
}

const renderStyledText = (style: StyleProps, text: string): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.textClass ]
  },
  components: [
    {
      dom: {
        tag: style.tag,
        styles: style.styles
      },
      components: [ GuiFactory.text(I18n.translate(text)) ]
    }
  ]
});

const renderShortcut = (shortcut: string): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.accessoryClass ]
  },
  components: [
    GuiFactory.text(ConvertShortcut.convertText(shortcut))
  ]
});

const renderCheckmark = (icons: Icons.IconProvider): SimpleSpec =>
  renderIcon('checkmark', icons, [ ItemClasses.checkmarkClass ]);

const renderSubmenuCaret = (icons: Icons.IconProvider): SimpleSpec =>
  renderIcon('chevron-right', icons, [ ItemClasses.caretClass ]);

const renderDownwardsCaret = (icons: Icons.IconProvider): SimpleSpec =>
  renderIcon('chevron-down', icons, [ ItemClasses.caretClass ]);

const renderContainer = (container: Menu.CardContainer, components: AlloySpec[]): SimpleSpec => {
  const directionClass = container.direction === 'vertical' ? ItemClasses.containerColumnClass : ItemClasses.containerRowClass;
  const alignClass = container.align === 'left' ? ItemClasses.containerAlignLeftClass : ItemClasses.containerAlignRightClass;

  const getValignClass = () => {
    switch (container.valign) {
      case 'top':
        return ItemClasses.containerValignTopClass;
      case 'middle':
        return ItemClasses.containerValignMiddleClass;
      case 'bottom':
        return ItemClasses.containerValignBottomClass;
    }
  };

  return {
    dom: {
      tag: 'div',
      classes: [
        ItemClasses.containerClass,
        directionClass,
        alignClass,
        getValignClass()
      ]
    },
    components
  };
};

const renderImage = (src: string, classes: string[], alt: Optional<string>): SimpleSpec => ({
  dom: {
    tag: 'img',
    classes,
    attributes: {
      src,
      alt: alt.getOr('')
    }
  }
});

export {
  renderIcon,
  renderText,
  renderHtml,
  renderStyledText,
  renderShortcut,
  renderCheckmark,
  renderSubmenuCaret,
  renderDownwardsCaret,
  renderImage,
  renderContainer
};
