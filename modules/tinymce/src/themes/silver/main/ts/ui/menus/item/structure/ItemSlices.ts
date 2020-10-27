/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, GuiFactory } from '@ephox/alloy';
import I18n from 'tinymce/core/api/util/I18n';
import { get as getIcon, IconProvider } from '../../../icons/Icons';
import * as ConvertShortcut from '../alien/ConvertShortcut';
import * as ItemClasses from '../ItemClasses';

const renderIcon = (iconHtml: string): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.iconClass ],
    innerHtml: iconHtml
  }
});

const renderText = (text: string): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.textClass ]
  },
  components: [ GuiFactory.text(I18n.translate(text)) ]
});

const renderHtml = (html: string): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.textClass ],
    innerHtml: html
  }
});

interface StyleProps {
  tag: string;
  styles: Record<string, string>;
}

const renderStyledText = (style: StyleProps, text: string): AlloySpec => ({
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

const renderShortcut = (shortcut: string): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.accessoryClass ],
    innerHtml: ConvertShortcut.convertText(shortcut)
  }
});

const renderCheckmark = (icons: IconProvider): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.checkmarkClass ],
    innerHtml: getIcon('checkmark', icons)
  }
});

const renderSubmenuCaret = (icons: IconProvider): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.caretClass ],
    innerHtml: getIcon('chevron-right', icons)
  }
});

const renderDownwardsCaret = (icons: IconProvider): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.caretClass ],
    innerHtml: getIcon('chevron-down', icons)
  }
});

const renderContainer = (components: Array<AlloySpec>, direction: string): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ direction === 'vertical' ? ItemClasses.containerColumnClass : ItemClasses.containerRowClass ]
  },
  components
});

const renderImage = (src: string): AlloySpec => ({
  dom: {
    tag: 'img',
    classes: [ ItemClasses.imageClass ],
    attributes: {
      src
    }
  }
});

const renderDescription = (text: string): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ ItemClasses.textDescriptionClass ]
  },
  components: [ GuiFactory.text(I18n.translate(text)) ]
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
  renderContainer,
  renderDescription
};
