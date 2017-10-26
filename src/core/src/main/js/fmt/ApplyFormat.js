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
    'tinymce.core.dom.NodeType',
    'tinymce.core.fmt.CaretFormat',
    'tinymce.core.fmt.ExpandRange',
    'tinymce.core.fmt.FormatUtils',
    'tinymce.core.fmt.Hooks',
    'tinymce.core.fmt.MatchFormat',
    'tinymce.core.fmt.MergeFormats',
    'tinymce.core.selection.RangeNormalizer',
    'tinymce.core.selection.RangeWalk',
    'tinymce.core.util.Tools'
  ],
  function (BookmarkManager, NodeType, CaretFormat, ExpandRange, FormatUtils, Hooks, MatchFormat, MergeFormats, RangeNormalizer, RangeWalk, Tools) {
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

        RangeWalk.walk(dom, rng, function (nodes) {
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

            MergeFormats.mergeWithChildren(ed, formatList, vars, node);
            MergeFormats.mergeWithParents(ed, format, name, vars, node);
            MergeFormats.mergeBackgroundColorAndFontSize(dom, format, vars, node);
            MergeFormats.mergeSubSup(dom, format, vars, node);
            MergeFormats.mergeSiblings(dom, format, vars, node);
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
            ed.selection.setRng(RangeNormalizer.normalize(ed.selection.getRng()));
            bookmark = selection.getBookmark();
            applyRngStyle(dom, ExpandRange.expandRng(ed, selection.getRng(true), formatList), bookmark);

            if (format.styles) {
              MergeFormats.mergeUnderlineAndColor(dom, format, vars, curSelNode);
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