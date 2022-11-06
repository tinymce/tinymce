import { Arr, Type, Unicode } from '@ephox/katamari';

import Env from '../api/Env';
import DomParser, { DomParserSettings } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Tools from '../api/util/Tools';
import * as TransparentElements from '../content/TransparentElements';
import { dataUriToBlobInfo } from '../file/BlobCacheUtils';
import { isEmpty, paddEmptyNode } from './ParserUtils';

const isBogusImage = (img: AstNode): boolean =>
  Type.isNonNullable(img.attr('data-mce-bogus'));

const isInternalImageSource = (img: AstNode): boolean =>
  img.attr('src') === Env.transparentSrc || Type.isNonNullable(img.attr('data-mce-placeholder'));

const registerBase64ImageFilter = (parser: DomParser, settings: DomParserSettings): void => {
  const { blob_cache: blobCache } = settings;
  if (blobCache) {
    const processImage = (img: AstNode): void => {
      const inputSrc = img.attr('src');

      if (isInternalImageSource(img) || isBogusImage(img) || Type.isNullable(inputSrc)) {
        return;
      }

      dataUriToBlobInfo(blobCache, inputSrc, true).each((blobInfo) => {
        img.attr('src', blobInfo.blobUri());
      });
    };

    parser.addAttributeFilter('src', (nodes) => Arr.each(nodes, processImage));
  }
};

const register = (parser: DomParser, settings: DomParserSettings): void => {
  const schema = parser.schema;

  // Remove <br> at end of block elements Gecko and WebKit injects BR elements to
  // make it possible to place the caret inside empty blocks. This logic tries to remove
  // these elements and keep br elements that where intended to be there intact
  if (settings.remove_trailing_brs) {
    parser.addNodeFilter('br', (nodes, _, args) => {
      const blockElements = Tools.extend({}, schema.getBlockElements());
      const nonEmptyElements = schema.getNonEmptyElements();
      const whitespaceElements = schema.getWhitespaceElements();

      // Remove brs from body element as well
      blockElements.body = 1;

      const isBlock = (node: AstNode) => node.name in blockElements && TransparentElements.isTransparentAstInline(schema, node);

      // Must loop forwards since it will otherwise remove all brs in <p>a<br><br><br></p>
      for (let i = 0, l = nodes.length; i < l; i++) {
        let node: AstNode | null = nodes[i];
        let parent = node.parent;

        if (parent && blockElements[parent.name] && node === parent.lastChild) {
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
                  paddEmptyNode(args, isBlock, parent);
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
  }

  parser.addAttributeFilter('href', (nodes) => {
    let i = nodes.length;

    const appendRel = (rel: string) => {
      const parts = rel.split(' ').filter((p) => p.length > 0);
      return parts.concat([ 'noopener' ]).sort().join(' ');
    };

    const addNoOpener = (rel: string | undefined) => {
      const newRel = rel ? Tools.trim(rel) : '';
      if (!/\b(noopener)\b/g.test(newRel)) {
        return appendRel(newRel);
      } else {
        return newRel;
      }
    };

    if (!settings.allow_unsafe_link_target) {
      while (i--) {
        const node = nodes[i];
        if (node.name === 'a' && node.attr('target') === '_blank') {
          node.attr('rel', addNoOpener(node.attr('rel')));
        }
      }
    }
  });

  // Force anchor names closed, unless the setting "allow_html_in_named_anchor" is explicitly included.
  if (!settings.allow_html_in_named_anchor) {
    parser.addAttributeFilter('id,name', (nodes) => {
      let i = nodes.length, sibling, prevSibling, parent, node;

      while (i--) {
        node = nodes[i];
        if (node.name === 'a' && node.firstChild && !node.attr('href')) {
          parent = node.parent;

          // Move children after current node
          sibling = node.lastChild;
          while (sibling && parent) {
            prevSibling = sibling.prev;
            parent.insert(sibling, node);
            sibling = prevSibling;
          }
        }
      }
    });
  }

  if (settings.fix_list_elements) {
    parser.addNodeFilter('ul,ol', (nodes) => {
      let i = nodes.length, node, parentNode;

      while (i--) {
        node = nodes[i];
        parentNode = node.parent;

        if (parentNode && (parentNode.name === 'ul' || parentNode.name === 'ol')) {
          if (node.prev && node.prev.name === 'li') {
            node.prev.append(node);
          } else {
            const li = new AstNode('li', 1);
            li.attr('style', 'list-style-type: none');
            node.wrap(li);
          }
        }
      }
    });
  }

  const validClasses = schema.getValidClasses();
  if (settings.validate && validClasses) {
    parser.addAttributeFilter('class', (nodes) => {

      let i = nodes.length;
      while (i--) {
        const node = nodes[i];
        const clazz = node.attr('class') ?? '';
        const classList = Tools.explode(clazz, ' ');
        let classValue: string | null = '';

        for (let ci = 0; ci < classList.length; ci++) {
          const className = classList[ci];
          let valid = false;

          let validClassesMap = validClasses['*'];
          if (validClassesMap && validClassesMap[className]) {
            valid = true;
          }

          validClassesMap = validClasses[node.name];
          if (!valid && validClassesMap && validClassesMap[className]) {
            valid = true;
          }

          if (valid) {
            if (classValue) {
              classValue += ' ';
            }

            classValue += className;
          }
        }

        if (!classValue.length) {
          classValue = null;
        }

        node.attr('class', classValue);
      }
    });
  }

  registerBase64ImageFilter(parser, settings);
};

export {
  register
};
