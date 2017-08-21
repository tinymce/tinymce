/**
 * ApplyFormat.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.fmt.ApplyFormat',
  [
    'tinymce.core.dom.BookmarkManager',
    'tinymce.core.dom.ElementUtils',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangeNormalizer',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.fmt.CaretFormat',
    'tinymce.core.fmt.ExpandRange',
    'tinymce.core.fmt.FormatUtils',
    'tinymce.core.fmt.Hooks',
    'tinymce.core.fmt.MatchFormat',
    'tinymce.core.fmt.RemoveFormat',
    'tinymce.core.util.Fun',
    'tinymce.core.util.Tools'
  ],
  function (
    BookmarkManager, ElementUtils, NodeType, RangeNormalizer, RangeUtils, TreeWalker, CaretFormat, ExpandRange, FormatUtils, Hooks, MatchFormat, RemoveFormat,
    Fun, Tools
  ) {
    var each = Tools.each;

    var isElementNode = function (node) {
      return node && node.nodeType === 1 && !BookmarkManager.isBookmarkNode(node) && !CaretFormat.isCaretNode(node) && !NodeType.isBogus(node);
    };

    var processChildElements = function (node, filter, process) {
      each(node.childNodes, function (node) {
        if (isElementNode(node)) {
          if (filter(node)) {
            process(node);
          }
          if (node.hasChildNodes()) {
            processChildElements(node, filter, process);
          }
        }
      });
    };

    var clearChildStyles = function (dom, format, node) {
      if (format.clear_child_styles) {
        var selector = format.links ? '*:not(a)' : '*';
        each(dom.select(selector, node), function (node) {
          if (isElementNode(node)) {
            each(format.styles, function (value, name) {
              dom.setStyle(node, name, '');
            });
          }
        });
      }
    };

    var processUnderlineAndColor = function (dom, node) {
      var textDecoration;
      if (node.nodeType === 1 && node.parentNode && node.parentNode.nodeType === 1) {
        textDecoration = FormatUtils.getTextDecoration(dom, node.parentNode);
        if (dom.getStyle(node, 'color') && textDecoration) {
          dom.setStyle(node, 'text-decoration', textDecoration);
        } else if (dom.getStyle(node, 'text-decoration') === textDecoration) {
          dom.setStyle(node, 'text-decoration', null);
        }
      }
    };

    var hasStyle = function (dom, name) {
      return Fun.curry(function (name, node) {
        return !!(node && FormatUtils.getStyle(dom, node, name));
      }, name);
    };

    var applyStyle = function (dom, name, value) {
      return Fun.curry(function (name, value, node) {
        dom.setStyle(node, name, value);
      }, name, value);
    };

    var findElementSibling = function (node, siblingName) {
      var sibling;

      for (sibling = node; sibling; sibling = sibling[siblingName]) {
        if (sibling.nodeType === 3 && sibling.nodeValue.length !== 0) {
          return node;
        }

        if (sibling.nodeType === 1 && !BookmarkManager.isBookmarkNode(sibling)) {
          return sibling;
        }
      }

      return node;
    };

    /**
     * Merges the next/previous sibling element if they match.
     *
     * @private
     * @param {Node} prev Previous node to compare/merge.
     * @param {Node} next Next node to compare/merge.
     * @return {Node} Next node if we didn't merge and prev node if we did.
     */
    var mergeSiblings = function (dom, prev, next) {
      var sibling, tmpSibling, elementUtils = new ElementUtils(dom);

      // Check if next/prev exists and that they are elements
      if (prev && next) {
        // If previous sibling is empty then jump over it
        prev = findElementSibling(prev, 'previousSibling');
        next = findElementSibling(next, 'nextSibling');

        // Compare next and previous nodes
        if (elementUtils.compare(prev, next)) {
          // Append nodes between
          for (sibling = prev.nextSibling; sibling && sibling !== next;) {
            tmpSibling = sibling;
            sibling = sibling.nextSibling;
            prev.appendChild(tmpSibling);
          }

          dom.remove(next);

          each(Tools.grep(next.childNodes), function (node) {
            prev.appendChild(node);
          });

          return prev;
        }
      }

      return next;
    };

    var findSelectionEnd = function (start, end) {
      var walker = new TreeWalker(end), node;

      for (node = walker.prev2(); node; node = walker.prev2()) {
        if (node.nodeType === 3 && node.data.length > 0) {
          return node;
        }

        if (node.childNodes.length > 1 || node === start || node.tagName === 'BR') {
          return node;
        }
      }
    };

    // This converts: <p>[a</p><p>]b</p> -> <p>[a]</p><p>b</p>
    var adjustSelectionToVisibleSelection = function (ed) {
      // Adjust selection so that a end container with a end offset of zero is not included in the selection
      // as this isn't visible to the user.
      var rng = RangeNormalizer.normalize(ed.selection.getRng());
      var start = rng.startContainer;
      var end = rng.endContainer;

      if (start !== end && rng.endOffset === 0) {
        var newEnd = findSelectionEnd(start, end);
        var endOffset = newEnd.nodeType === 3 ? newEnd.data.length : newEnd.childNodes.length;

        rng.setEnd(newEnd, endOffset);
      }

      return rng;
    };

    var applyFormat = function (ed, name, vars, node) {
      var formatList = ed.formatter.get(name), format = formatList[0], bookmark, rng, isCollapsed = !node && ed.selection.isCollapsed();
      var dom = ed.dom, selection = ed.selection;

      var setElementFormat = function (elm, fmt) {
        fmt = fmt || format;

        if (elm) {
          if (fmt.onformat) {
            fmt.onformat(elm, fmt, vars, node);
          }

          each(fmt.styles, function (value, name) {
            dom.setStyle(elm, name, FormatUtils.replaceVars(value, vars));
          });

          // Needed for the WebKit span spam bug
          // TODO: Remove this once WebKit/Blink fixes this
          if (fmt.styles) {
            var styleVal = dom.getAttrib(elm, 'style');

            if (styleVal) {
              elm.setAttribute('data-mce-style', styleVal);
            }
          }

          each(fmt.attributes, function (value, name) {
            dom.setAttrib(elm, name, FormatUtils.replaceVars(value, vars));
          });

          each(fmt.classes, function (value) {
            value = FormatUtils.replaceVars(value, vars);

            if (!dom.hasClass(elm, value)) {
              dom.addClass(elm, value);
            }
          });
        }
      };

      var applyNodeStyle = function (formatList, node) {
        var found = false;

        if (!format.selector) {
          return false;
        }

        // Look for matching formats
        each(formatList, function (format) {
          // Check collapsed state if it exists
          if ('collapsed' in format && format.collapsed !== isCollapsed) {
            return;
          }

          if (dom.is(node, format.selector) && !CaretFormat.isCaretNode(node)) {
            setElementFormat(node, format);
            found = true;
            return false;
          }
        });

        return found;
      };

      var applyRngStyle = function (dom, rng, bookmark, nodeSpecific) {
        var newWrappers = [], wrapName, wrapElm, contentEditable = true;

        // Setup wrapper element
        wrapName = format.inline || format.block;
        wrapElm = dom.create(wrapName);
        setElementFormat(wrapElm);

        new RangeUtils(dom).walk(rng, function (nodes) {
          var currentWrapElm;

          /**
           * Process a list of nodes wrap them.
           */
          var process = function (node) {
            var nodeName, parentName, hasContentEditableState, lastContentEditable;

            lastContentEditable = contentEditable;
            nodeName = node.nodeName.toLowerCase();
            parentName = node.parentNode.nodeName.toLowerCase();

            // Node has a contentEditable value
            if (node.nodeType === 1 && dom.getContentEditable(node)) {
              lastContentEditable = contentEditable;
              contentEditable = dom.getContentEditable(node) === "true";
              hasContentEditableState = true; // We don't want to wrap the container only it's children
            }

            // Stop wrapping on br elements
            if (FormatUtils.isEq(nodeName, 'br')) {
              currentWrapElm = 0;

              // Remove any br elements when we wrap things
              if (format.block) {
                dom.remove(node);
              }

              return;
            }

            // If node is wrapper type
            if (format.wrapper && MatchFormat.matchNode(ed, node, name, vars)) {
              currentWrapElm = 0;
              return;
            }

            // Can we rename the block
            // TODO: Break this if up, too complex
            if (contentEditable && !hasContentEditableState && format.block &&
              !format.wrapper && FormatUtils.isTextBlock(ed, nodeName) && FormatUtils.isValid(ed, parentName, wrapName)) {
              node = dom.rename(node, wrapName);
              setElementFormat(node);
              newWrappers.push(node);
              currentWrapElm = 0;
              return;
            }

            // Handle selector patterns
            if (format.selector) {
              var found = applyNodeStyle(formatList, node);

              // Continue processing if a selector match wasn't found and a inline element is defined
              if (!format.inline || found) {
                currentWrapElm = 0;
                return;
              }
            }

            // Is it valid to wrap this item
            // TODO: Break this if up, too complex
            if (contentEditable && !hasContentEditableState && FormatUtils.isValid(ed, wrapName, nodeName) && FormatUtils.isValid(ed, parentName, wrapName) &&
              !(!nodeSpecific && node.nodeType === 3 &&
                node.nodeValue.length === 1 &&
                node.nodeValue.charCodeAt(0) === 65279) &&
              !CaretFormat.isCaretNode(node) &&
              (!format.inline || !dom.isBlock(node))) {
              // Start wrapping
              if (!currentWrapElm) {
                // Wrap the node
                currentWrapElm = dom.clone(wrapElm, false);
                node.parentNode.insertBefore(currentWrapElm, node);
                newWrappers.push(currentWrapElm);
              }

              currentWrapElm.appendChild(node);
            } else {
              // Start a new wrapper for possible children
              currentWrapElm = 0;

              each(Tools.grep(node.childNodes), process);

              if (hasContentEditableState) {
                contentEditable = lastContentEditable; // Restore last contentEditable state from stack
              }

              // End the last wrapper
              currentWrapElm = 0;
            }
          };

          // Process siblings from range
          each(nodes, process);
        });

        // Apply formats to links as well to get the color of the underline to change as well
        if (format.links === true) {
          each(newWrappers, function (node) {
            var process = function (node) {
              if (node.nodeName === 'A') {
                setElementFormat(node, format);
              }

              each(Tools.grep(node.childNodes), process);
            };

            process(node);
          });
        }

        // Cleanup
        each(newWrappers, function (node) {
          var childCount;

          var getChildCount = function (node) {
            var count = 0;

            each(node.childNodes, function (node) {
              if (!FormatUtils.isWhiteSpaceNode(node) && !BookmarkManager.isBookmarkNode(node)) {
                count++;
              }
            });

            return count;
          };

          var getChildElementNode = function (root) {
            var child = false;
            each(root.childNodes, function (node) {
              if (isElementNode(node)) {
                child = node;
                return false; // break loop
              }
            });
            return child;
          };

          var matchNestedWrapper = function (node, filter) {
            do {
              if (getChildCount(node) !== 1) {
                break;
              }

              node = getChildElementNode(node);
              if (!node) {
                break;
              } else if (filter(node)) {
                return node;
              }
            } while (node);

            return null;
          };

          var mergeStyles = function (node) {
            var child, clone;

            child = getChildElementNode(node);

            // If child was found and of the same type as the current node
            if (child && !BookmarkManager.isBookmarkNode(child) && MatchFormat.matchName(dom, child, format)) {
              clone = dom.clone(child, false);
              setElementFormat(clone);

              dom.replace(clone, node, true);
              dom.remove(child, 1);
            }

            return clone || node;
          };

          childCount = getChildCount(node);

          // Remove empty nodes but only if there is multiple wrappers and they are not block
          // elements so never remove single <h1></h1> since that would remove the
          // current empty block element where the caret is at
          if ((newWrappers.length > 1 || !dom.isBlock(node)) && childCount === 0) {
            dom.remove(node, 1);
            return;
          }

          if (format.inline || format.wrapper) {
            // Merges the current node with it's children of similar type to reduce the number of elements
            if (!format.exact && childCount === 1) {
              node = mergeStyles(node);
            }

            // Remove/merge children
            each(formatList, function (format) {
              // Merge all children of similar type will move styles from child to parent
              // this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
              // will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
              each(dom.select(format.inline, node), function (child) {
                if (!isElementNode(child)) {
                  return;
                }

                RemoveFormat.removeFormat(ed, format, vars, child, format.exact ? child : null);
              });

              clearChildStyles(dom, format, node);
            });

            // Remove format if direct parent already has the same format
            if (MatchFormat.matchNode(ed, node.parentNode, name, vars)) {
              if (RemoveFormat.removeFormat(ed, format, vars, node)) {
                node = 0;
              }
            }

            // Remove format if any ancestor already has the same format
            if (format.merge_with_parents) {
              dom.getParent(node.parentNode, function (parent) {
                if (MatchFormat.matchNode(ed, parent, name, vars)) {
                  if (RemoveFormat.removeFormat(ed, format, vars, node)) {
                    node = 0;
                  }
                  return true;
                }
              });
            }

            // fontSize defines the line height for the whole branch of nested style wrappers,
            // therefore it should be set on the outermost wrapper
            if (node && !dom.isBlock(node) && !FormatUtils.getStyle(dom, node, 'fontSize')) {
              var styleNode = matchNestedWrapper(node, hasStyle(dom, 'fontSize'));
              if (styleNode) {
                applyFormat(ed, 'fontsize', { value: FormatUtils.getStyle(dom, styleNode, 'fontSize') }, node);
              }
            }

            // Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
            if (node && format.merge_siblings !== false) {
              node = mergeSiblings(dom, FormatUtils.getNonWhiteSpaceSibling(node), node);
              node = mergeSiblings(dom, node, FormatUtils.getNonWhiteSpaceSibling(node, true));
            }
          }
        });
      };

      if (dom.getContentEditable(selection.getNode()) === "false") {
        node = selection.getNode();
        for (var i = 0, l = formatList.length; i < l; i++) {
          if (formatList[i].ceFalseOverride && dom.is(node, formatList[i].selector)) {
            setElementFormat(node, formatList[i]);
            return;
          }
        }

        return;
      }

      if (format) {
        if (node) {
          if (node.nodeType) {
            if (!applyNodeStyle(formatList, node)) {
              rng = dom.createRng();
              rng.setStartBefore(node);
              rng.setEndAfter(node);
              applyRngStyle(dom, ExpandRange.expandRng(ed, rng, formatList), null, true);
            }
          } else {
            applyRngStyle(dom, node, null, true);
          }
        } else {
          if (!isCollapsed || !format.inline || dom.select('td[data-mce-selected],th[data-mce-selected]').length) {
            // Obtain selection node before selection is unselected by applyRngStyle
            var curSelNode = ed.selection.getNode();

            // If the formats have a default block and we can't find a parent block then
            // start wrapping it with a DIV this is for forced_root_blocks: false
            // It's kind of a hack but people should be using the default block type P since all desktop editors work that way
            if (!ed.settings.forced_root_block && formatList[0].defaultBlock && !dom.getParent(curSelNode, dom.isBlock)) {
              applyFormat(ed, formatList[0].defaultBlock);
            }

            // Apply formatting to selection
            ed.selection.setRng(adjustSelectionToVisibleSelection(ed));
            bookmark = selection.getBookmark();
            applyRngStyle(dom, ExpandRange.expandRng(ed, selection.getRng(true), formatList), bookmark);

            if (format.styles) {
              // Colored nodes should be underlined so that the color of the underline matches the text color.
              if (format.styles.color || format.styles.textDecoration) {
                Tools.walk(curSelNode, Fun.curry(processUnderlineAndColor, dom), 'childNodes');
                processUnderlineAndColor(dom, curSelNode);
              }

              // nodes with font-size should have their own background color as well to fit the line-height (see TINY-882)
              if (format.styles.backgroundColor) {
                processChildElements(curSelNode,
                  hasStyle(dom, 'fontSize'),
                  applyStyle(dom, 'backgroundColor', FormatUtils.replaceVars(format.styles.backgroundColor, vars))
                );
              }
            }

            selection.moveToBookmark(bookmark);
            FormatUtils.moveStart(dom, selection, selection.getRng(true));
            ed.nodeChanged();
          } else {
            CaretFormat.applyCaretFormat(ed, name, vars);
          }
        }

        Hooks.postProcess(name, ed);
      }
    };

    return {
      applyFormat: applyFormat
    };
  }
);