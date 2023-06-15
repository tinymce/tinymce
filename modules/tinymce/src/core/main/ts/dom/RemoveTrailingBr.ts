import { Unicode } from '@ephox/katamari';

import DomParser from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema from '../api/html/Schema';
import Tools from '../api/util/Tools';
import * as TransparentElements from '../content/TransparentElements';
import { isEmpty, paddEmptyNode } from '../html/ParserUtils';
import { DomSerializerSettings } from './DomSerializerImpl';

export const addNodeFilter = (settings: DomSerializerSettings, htmlParser: DomParser, schema: Schema): void => {
  htmlParser.addNodeFilter('br', (nodes, _, args) => {
    const blockElements = Tools.extend({}, schema.getBlockElements());
    const nonEmptyElements = schema.getNonEmptyElements();
    const whitespaceElements = schema.getWhitespaceElements();

    // Remove brs from body element as well
    blockElements.body = 1;

    const isBlock = (node: AstNode) => node.name in blockElements || TransparentElements.isTransparentAstBlock(schema, node);

    // Must loop forwards since it will otherwise remove all brs in <p>a<br><br><br></p>
    for (let i = 0, l = nodes.length; i < l; i++) {
      let node: AstNode | null = nodes[i];
      let parent = node.parent;

      if (parent && isBlock(parent) && node === parent.lastChild) {
        // Loop all nodes to the left of the current node and check for other BR elements
        // excluding bookmarks since they are invisible
        let prev = node.prev;
        while (prev) {
          const prevName = prev.name;

          // Ignore bookmarks
          if (prevName !== 'span' || prev.attr('data-mce-type') !== 'bookmark') {
            // Found another br it's a <br><br> structure then don't remove anything
            if (prevName === 'br') {
              node = null;
            }
            break;
          }

          prev = prev.prev;
        }

        if (node) {
          node.remove();

          // Is the parent to be considered empty after we removed the BR
          if (isEmpty(schema, nonEmptyElements, whitespaceElements, parent)) {
            const elementRule = schema.getElementRule(parent.name);

            // Remove or padd the element depending on schema rule
            if (elementRule) {
              if (elementRule.removeEmpty) {
                parent.remove();
              } else if (elementRule.paddEmpty) {
                paddEmptyNode(settings, args, isBlock, parent);
              }
            }
          }
        }
      } else {
        // Replaces BR elements inside inline elements like <p><b><i><br></i></b></p>
        // so they become <p><b><i>&nbsp;</i></b></p>
        let lastParent = node;
        while (parent && parent.firstChild === lastParent && parent.lastChild === lastParent) {
          lastParent = parent;

          if (blockElements[parent.name]) {
            break;
          }

          parent = parent.parent;
        }

        if (lastParent === parent) {
          const textNode = new AstNode('#text', 3);
          textNode.value = Unicode.nbsp;
          node.replace(textNode);
        }
      }
    }
  });
};
