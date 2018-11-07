import { AlloySpec, GuiFactory } from '@ephox/alloy';
import I18n from 'tinymce/core/api/util/I18n';
import { convertShortcutText } from '../../../../../../../../core/main/ts/api/Shortcuts';
import { get as getIcon, IconProvider } from '../../../icons/Icons';
import * as ItemClasses from '../ItemClasses';

const renderIcon = (iconHtml: string): AlloySpec => ({
  dom: {
    tag: 'span',
    classes: [ ItemClasses.iconClass ],
    innerHtml: iconHtml
  }
});

const renderText = (text: string): AlloySpec => ({
  dom: {
    tag: 'span',
    classes: [ ItemClasses.textClass ]
  },
  components: [ GuiFactory.text(I18n.translate(text)) ]
});

const renderShortcut = (shortcut: string): AlloySpec => ({
  dom: {
    tag: 'span',
    classes: [ ItemClasses.accessoryClass ],
    innerHtml: convertShortcutText(shortcut)
  }
});

const renderCheckmark = (icons: IconProvider): AlloySpec => ({
  dom: {
    tag: 'span',
    classes: [ ItemClasses.iconClass, ItemClasses.checkmarkClass ],
    innerHtml: getIcon('icon-checkmark', icons)
  }
});

const renderSubmenuCaret = (icons: IconProvider): AlloySpec => ({
  dom: {
    tag: 'span',
    classes: [ ItemClasses.caretClass ],
    innerHtml: getIcon('icon-chevron-right', icons)
  }
});

export {
  renderIcon,
  renderText,
  renderShortcut,
  renderCheckmark,
  renderSubmenuCaret
};