import { GuiFactory, AlloySpec } from '@ephox/alloy';
import { get as getIcon, IconProvider } from '../../../icons/Icons';
import * as ItemClasses from '../ItemClasses';
import Env from 'tinymce/core/api/Env';
import { Arr, Obj } from '@ephox/katamari';
import I18n from 'tinymce/core/api/util/I18n';

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

// Converts shortcut format to Mac/PC variants
const convertShortcut = (source: string) => {
  const mac = {
    alt: '&#x2325;',
    ctrl: '&#x2318;',
    shift: '&#x21E7;',
    meta: '&#x2318;'
  };
  const other = {
    meta: 'Ctrl'
  };
  const replace: Record<string, string> = Env.mac ? mac : other;

  const shortcut = source.split('+');

  const updated = Arr.map(shortcut, (segment: string) => {
    // search lowercase, but if not found use the original
    const search = segment.toLowerCase();
    return Obj.has(replace, search) ? replace[search] : segment;
  });

  return updated.join('+');
};

const renderShortcut = (shortcut: string): AlloySpec => ({
  dom: {
    tag: 'span',
    classes: [ ItemClasses.accessoryClass ],
    innerHtml: convertShortcut(shortcut)
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