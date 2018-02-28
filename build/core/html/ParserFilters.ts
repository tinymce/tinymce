import Tools from '../api/util/Tools';
import { isEmpty, paddEmptyNode } from './ParserUtils';
import Node from '../api/html/Node';

const register = (parser, settings: any): void => {
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
      const whiteSpaceElements = schema.getNonEmptyElements();
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
              // Found a non BR element
              if (prevName !== 'br') {
                break;
              }

              // Found another br it's a <br><br> structure then don't remove anything
              if (prevName === 'br') {
                node = null;
                break;
              }
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
            textNode = new Node('#text', 3);
            textNode.value = '\u00a0';
            node.replace(textNode);
          }
        }
      }
    });
  }

  parser.addAttributeFilter('href', function (nodes) {
    let i = nodes.length, node;

    const appendRel = function (rel) {
      const parts = rel.split(' ').filter(function (p) {
        return p.length > 0;
      });
      return parts.concat(['noopener']).sort().join(' ');
    };

    const addNoOpener = function (rel) {
      const newRel = rel ? Tools.trim(rel) : '';
      if (!/\b(noopener)\b/g.test(newRel)) {
        return appendRel(newRel);
      } else {
        return newRel;
      }
    };

    if (!settings.allow_unsafe_link_target) {
      while (i--) {
        node = nodes[i];
        if (node.name === 'a' && node.attr('target') === '_blank') {
          node.attr('rel', addNoOpener(node.attr('rel')));
        }
      }
    }
  });

  // Force anchor names closed, unless the setting "allow_html_in_named_anchor" is explicitly included.
  if (!settings.allow_html_in_named_anchor) {
    parser.addAttributeFilter('id,name', function (nodes) {
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
    parser.addNodeFilter('ul,ol', function (nodes) {
      let i = nodes.length, node, parentNode;

      while (i--) {
        node = nodes[i];
        parentNode = node.parent;

        if (parentNode.name === 'ul' || parentNode.name === 'ol') {
          if (node.prev && node.prev.name === 'li') {
            node.prev.append(node);
          } else {
            const li = new Node('li', 1);
            li.attr('style', 'list-style-type: none');
            node.wrap(li);
          }
        }
      }
    });
  }

  if (settings.validate && schema.getValidClasses()) {
    parser.addAttributeFilter('class', function (nodes) {
      let i = nodes.length, node, classList, ci, className, classValue;
      const validClasses = schema.getValidClasses();
      let validClassesMap, valid;

      while (i--) {
        node = nodes[i];
        classList = node.attr('class').split(' ');
        classValue = '';

        for (ci = 0; ci < classList.length; ci++) {
          className = classList[ci];
          valid = false;

          validClassesMap = validClasses['*'];
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
};

export {
  register
};
