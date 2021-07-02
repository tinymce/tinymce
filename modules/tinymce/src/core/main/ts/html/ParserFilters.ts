/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional, Type, Unicode } from '@ephox/katamari';

import Env from '../api/Env';
import DomParser, { DomParserSettings } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Tools from '../api/util/Tools';
import * as Conversions from '../file/Conversions';
import { uniqueId } from '../file/ImageScanner';
import { parseDataUri } from './Base64Uris';
import { isEmpty, paddEmptyNode } from './ParserUtils';

const isBogusImage = (img: AstNode): boolean =>
  Type.isNonNullable(img.attr('data-mce-bogus'));

const isInternalImageSource = (img: AstNode): boolean =>
  img.attr('src') === Env.transparentSrc || Type.isNonNullable(img.attr('data-mce-placeholder'));

const isValidDataImg = (img: AstNode, settings: DomParserSettings): boolean => {
  if (settings.images_dataimg_filter) {
    // Construct an image element
    const imgElem = new Image();
    imgElem.src = img.attr('src');
    Obj.each(img.attributes.map, (value, key) => {
      imgElem.setAttribute(key, value);
    });

    // Check if it should be excluded from being converted to a blob
    return settings.images_dataimg_filter(imgElem);
  } else {
    return true;
  }
};

const registerBase64ImageFilter = (parser: DomParser, settings: DomParserSettings): void => {
  const { blob_cache: blobCache } = settings;
  const processImage = (img: AstNode): void => {
    const inputSrc = img.attr('src');

    if (isInternalImageSource(img) || isBogusImage(img)) {
      return;
    }

    parseDataUri(inputSrc).filter(() => isValidDataImg(img, settings)).bind(({ type, data }) =>
      Optional.from(blobCache.getByData(data, type)).orThunk(() =>
        Conversions.buildBlob(type, data).map((blob) => {
          const blobInfo = blobCache.create(uniqueId(), blob, data);
          blobCache.add(blobInfo);
          return blobInfo;
        })
      )
    ).each((blobInfo) => {
      img.attr('src', blobInfo.blobUri());
    });
  };

  if (blobCache) {
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
      let i;
      const l = nodes.length;
      let node;
      const blockElements = Tools.extend({}, schema.getBlockElements());
      const nonEmptyElements = schema.getNonEmptyElements();
      let parent, lastParent, prev, prevName;
      const whiteSpaceElements = schema.getWhiteSpaceElements();
      let elementRule, textNode;

      // Remove brs from body element as well
      blockElements.body = 1;

      // Must loop forwards since it will otherwise remove all brs in <p>a<br><br><br></p>
      for (i = 0; i < l; i++) {
        node = nodes[i];
        parent = node.parent;

        if (blockElements[node.parent.name] && node === parent.lastChild) {
          // Loop all nodes to the left of the current node and check for other BR elements
          // excluding bookmarks since they are invisible
          prev = node.prev;
          while (prev) {
            prevName = prev.name;

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
            if (isEmpty(schema, nonEmptyElements, whiteSpaceElements, parent)) {
              elementRule = schema.getElementRule(parent.name);

              // Remove or padd the element depending on schema rule
              if (elementRule) {
                if (elementRule.removeEmpty) {
                  parent.remove();
                } else if (elementRule.paddEmpty) {
                  paddEmptyNode(settings, args, blockElements, parent);
                }
              }
            }
          }
        } else {
          // Replaces BR elements inside inline elements like <p><b><i><br></i></b></p>
          // so they become <p><b><i>&nbsp;</i></b></p>
          lastParent = node;
          while (parent && parent.firstChild === lastParent && parent.lastChild === lastParent) {
            lastParent = parent;

            if (blockElements[parent.name]) {
              break;
            }

            parent = parent.parent;
          }

          if (lastParent === parent && settings.padd_empty_with_br !== true) {
            textNode = new AstNode('#text', 3);
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

    const addNoOpener = (rel: string) => {
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
          do {
            prevSibling = sibling.prev;
            parent.insert(sibling, node);
            sibling = prevSibling;
          } while (sibling);
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

        if (parentNode.name === 'ul' || parentNode.name === 'ol') {
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

  if (settings.validate && schema.getValidClasses()) {
    parser.addAttributeFilter('class', (nodes) => {
      const validClasses = schema.getValidClasses();

      let i = nodes.length;
      while (i--) {
        const node = nodes[i];
        const classList = node.attr('class').split(' ');
        let classValue = '';

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
