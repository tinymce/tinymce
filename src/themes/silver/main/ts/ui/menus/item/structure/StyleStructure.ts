import { DomFactory, GuiFactory, AlloySpec } from '@ephox/alloy';
import { Option } from '@ephox/katamari';

import * as ItemClasses from '../ItemClasses';
import { ItemStructure } from './ItemStructure';

export interface StyleStructureMeta {
  styleAttr: string;
  tag: string;
}

const renderStyledText = (tag: string, styleAttr: string, text: string): AlloySpec => {
  return DomFactory.simple('span', [ ItemClasses.textClass ], [
    {
      dom: {
        tag,
        attributes: {
          style: styleAttr
        }
      },
      components: [ GuiFactory.text(text) ]
    }
  ]);
};

const renderStyleStructure = (optTextContent: Option<string>, meta: StyleStructureMeta, checkMark: AlloySpec): ItemStructure => {
  return {
    dom: {
      tag: 'div',
      classes: [ ItemClasses.navClass, ItemClasses.selectableClass ]
    },
    optComponents: [
      Option.some(checkMark),
      optTextContent.map((text) => renderStyledText(meta.tag, meta.styleAttr, text)),
    ]
  };
};

export {
  renderStyleStructure
};