import { Arr, Obj, Type } from '@ephox/katamari';
import { PredicateExists, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Events from '../api/Events';
import { getTextRootBlockElements } from '../api/html/Schema';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import { RangeLikeObject } from '../selection/RangeTypes';
import * as RangeWalk from '../selection/RangeWalk';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as TableCellSelection from '../selection/TableCellSelection';
import * as Zwsp from '../text/Zwsp';
import * as CaretFormat from './CaretFormat';
import * as ExpandRange from './ExpandRange';
import { isCaretNode } from './FormatContainer';
import { ApplyFormat, BlockFormat, FormatVars, InlineFormat } from './FormatTypes';
import * as FormatUtils from './FormatUtils';
import * as Hooks from './Hooks';
import * as MatchFormat from './MatchFormat';
import * as MergeFormats from './MergeFormats';

const each = Tools.each;

const canFormatBR = (editor: Editor, format: ApplyFormat, node: HTMLBRElement, parentName: string) => {
  // TINY-6483: Can format 'br' if it is contained in a valid empty block and an inline format is being applied
  if (Options.canFormatEmptyLines(editor) && FormatUtils.isInlineFormat(format) && node.parentNode) {
    const validBRParentElements = getTextRootBlockElements(editor.schema);
    // If a caret node is present, the format should apply to that, not the br (applicable to collapsed selections)
    const hasCaretNodeSibling = PredicateExists.sibling(SugarElement.fromDom(node), (sibling) => isCaretNode(sibling.dom));
    return Obj.hasNonNullableKey(validBRParentElements, parentName) && Empty.isEmpty(SugarElement.fromDom(node.parentNode), false) && !hasCaretNodeSibling;
  } else {
    return false;
  }
};

const applyFormat = (ed: Editor, name: string, vars?: FormatVars, node?: Node | RangeLikeObject | null): void => {
  const formatList = ed.formatter.get(name) as ApplyFormat[];
  const format = formatList[0];
  const isCollapsed = !node && ed.selection.isCollapsed();
  const dom = ed.dom;
  const selection = ed.selection;

  const setElementFormat = (elm: Element, fmt: ApplyFormat = format) => {
    if (Type.isFunction(fmt.onformat)) {
      fmt.onformat(elm, fmt as any, vars, node);
    }

    each(fmt.styles, (value, name) => {
      dom.setStyle(elm, name, FormatUtils.replaceVars(value, vars));
    });

    // Needed for the WebKit span spam bug
    // TODO: Remove this once WebKit/Blink fixes this
    if (fmt.styles) {
      const styleVal = dom.getAttrib(elm, 'style');

      if (styleVal) {
        dom.setAttrib(elm, 'data-mce-style', styleVal);
      }
    }

    each(fmt.attributes, (value, name) => {
      dom.setAttrib(elm, name, FormatUtils.replaceVars(value, vars));
    });

    each(fmt.classes, (value) => {
      const newValue = FormatUtils.replaceVars(value, vars);

      if (!dom.hasClass(elm, newValue)) {
        dom.addClass(elm, newValue);
      }
    });
  };

  const applyNodeStyle = (formatList: ApplyFormat[], node: Node) => {
    let found = false;

    // Look for matching formats
    each(formatList, (format) => {
      if (!FormatUtils.isSelectorFormat(format)) {
        return false;
      }

      // Check collapsed state if it exists
      if (Type.isNonNullable(format.collapsed) && format.collapsed !== isCollapsed) {
        return true;
      }

      if (dom.is(node, format.selector) && !isCaretNode(node)) {
        setElementFormat(node as Element, format);
        found = true;
        return false;
      }

      return true;
    });

    return found;
  };

  const createWrapElement = (wrapName: string | undefined): HTMLElement | null => {
    if (Type.isString(wrapName)) {
      const wrapElm = dom.create(wrapName);
      setElementFormat(wrapElm);
      return wrapElm;
    } else {
      return null;
    }
  };

  const applyRngStyle = (dom: DOMUtils, rng: RangeLikeObject, nodeSpecific: boolean) => {
    const newWrappers: Element[] = [];
    let contentEditable = true;

    const isWrappingBlockFormat = FormatUtils.isBlockFormat(format) && format.wrapper;
    const isNonWrappingBlockFormat = FormatUtils.isBlockFormat(format) && !format.wrapper;
    const isWrapNameFormat = FormatUtils.isInlineFormat(format) || FormatUtils.isBlockFormat(format);

    // Setup wrapper element
    const wrapName: string | undefined = (format as InlineFormat).inline || (format as BlockFormat).block;
    const wrapElm = createWrapElement(wrapName);

    RangeWalk.walk(dom, rng, (nodes) => {
      let currentWrapElm: Element | null;
      /**
       * Process a list of nodes wrap them.
       */
      const process = (node: Node) => {
        let hasContentEditableState = false;
        let lastContentEditable = contentEditable;
        let isWrappableNoneditableElm = false;
        const nodeName = node.nodeName.toLowerCase();
        const parentNode = node.parentNode as Node;
        const parentName = parentNode.nodeName.toLowerCase();

        // Node has a contentEditable value
        const contentEditableValue = dom.getContentEditable(node);
        if (Type.isNonNullable(contentEditableValue)) {
          lastContentEditable = contentEditable;
          contentEditable = contentEditableValue === 'true';
          // Unless the noneditable element is wrappable, we don't want to wrap the container, only it's editable children
          hasContentEditableState = true;
          isWrappableNoneditableElm = FormatUtils.isWrappableNoneditable(dom, node);
        }

        const isMatchingWrappingBlock = isWrappingBlockFormat && MatchFormat.matchNode(ed, node, name, vars);

        const isEditableDescendant = contentEditable && !hasContentEditableState;
        const isValidBlockFormatForNode = isNonWrappingBlockFormat && FormatUtils.isTextBlock(ed, nodeName) && FormatUtils.isValid(ed, parentName, wrapName);
        const canRenameBlock = isEditableDescendant && isValidBlockFormatForNode;

        const isValidWrapNode = isWrapNameFormat && FormatUtils.isValid(ed, wrapName, nodeName) && FormatUtils.isValid(ed, parentName, wrapName);
        // If it is not node specific, it means that it was not passed into 'formatter.apply` and is withiin the editor selection
        const isZwsp = !nodeSpecific && NodeType.isText(node) && Zwsp.isZwsp(node.data);
        const isCaret = isCaretNode(node);
        const isCorrectFormatForNode = !FormatUtils.isInlineFormat(format) || !dom.isBlock(node);
        const canWrapNode = (isEditableDescendant || isWrappableNoneditableElm) && isValidWrapNode && !isZwsp && !isCaret && isCorrectFormatForNode;

        // Stop wrapping on br elements except when valid
        if (NodeType.isBr(node) && !canFormatBR(ed, format, node, parentName)) {
          currentWrapElm = null;
          // Remove any br elements when we wrap things
          if (FormatUtils.isBlockFormat(format)) {
            dom.remove(node);
          }
          return;
        }

        if (isMatchingWrappingBlock) {
          currentWrapElm = null;
          return;
        }

        if (canRenameBlock) {
          const elm = dom.rename(node as Element, wrapName);
          setElementFormat(elm);
          newWrappers.push(elm);
          currentWrapElm = null;
          return;
        }

        if (FormatUtils.isSelectorFormat(format)) {
          let found = applyNodeStyle(formatList, node);

          // TINY-6567/TINY-7393: Include the parent if using an expanded selector format and no match was found for the current node
          if (!found && Type.isNonNullable(parentNode) && FormatUtils.shouldExpandToSelector(format)) {
            found = applyNodeStyle(formatList, parentNode);
          }

          // Continue processing if a selector match wasn't found and a inline element is defined
          if (!FormatUtils.isInlineFormat(format) || found) {
            currentWrapElm = null;
            return;
          }
        }

        if (canWrapNode) {
          // Start wrapping
          if (!currentWrapElm) {
            // Wrap the node
            currentWrapElm = dom.clone(wrapElm, false) as Element;
            parentNode.insertBefore(currentWrapElm, node);
            newWrappers.push(currentWrapElm);
          }
          // Wrappable noneditable element has been handled so go back to previous state
          if (isWrappableNoneditableElm && hasContentEditableState) {
            contentEditable = lastContentEditable;
          }

          currentWrapElm.appendChild(node);
        } else {
          // Start a new wrapper for possible children
          currentWrapElm = null;

          Arr.each(Arr.from(node.childNodes), process);

          if (hasContentEditableState) {
            contentEditable = lastContentEditable; // Restore last contentEditable state from stack
          }

          // End the last wrapper
          currentWrapElm = null;
        }
      };

      Arr.each(nodes, process);
    });

    // Apply formats to links as well to get the color of the underline to change as well
    if (format.links === true) {
      Arr.each(newWrappers, (node) => {
        const process = (node: Node) => {
          if (node.nodeName === 'A') {
            setElementFormat(node as HTMLAnchorElement, format);
          }

          Arr.each(Arr.from(node.childNodes), process);
        };

        process(node);
      });
    }

    // Cleanup
    Arr.each(newWrappers, (node) => {
      const getChildCount = (node: Node) => {
        let count = 0;

        Arr.each(node.childNodes, (node) => {
          if (!FormatUtils.isEmptyTextNode(node) && !Bookmarks.isBookmarkNode(node)) {
            count++;
          }
        });

        return count;
      };

      const mergeStyles = (node: Element): Element => {
        // Check if a child was found and of the same type as the current node
        const childElement = Arr.find(node.childNodes, FormatUtils.isElementNode)
          .filter((child) => dom.getContentEditable(child) !== 'false' && MatchFormat.matchName(dom, child, format));
        return childElement.map((child) => {
          const clone = dom.clone(child, false) as Element;
          setElementFormat(clone);

          dom.replace(clone, node, true);
          dom.remove(child, true);
          return clone;
        }).getOr(node);
      };

      const childCount = getChildCount(node);

      // Remove empty nodes but only if there is multiple wrappers and they are not block
      // elements so never remove single <h1></h1> since that would remove the
      // current empty block element where the caret is at
      if ((newWrappers.length > 1 || !dom.isBlock(node)) && childCount === 0) {
        dom.remove(node, true);
        return;
      }

      if (FormatUtils.isInlineFormat(format) || FormatUtils.isBlockFormat(format) && format.wrapper) {
        // Merges the current node with it's children of similar type to reduce the number of elements
        if (!format.exact && childCount === 1) {
          node = mergeStyles(node);
        }

        // TODO: Make sure all of the below handle noneditable elements correctly
        MergeFormats.mergeWithChildren(ed, formatList, vars, node);
        MergeFormats.mergeWithParents(ed, format, name, vars, node);
        MergeFormats.mergeBackgroundColorAndFontSize(dom, format, vars, node);
        MergeFormats.mergeTextDecorationsAndColor(dom, format, vars, node);
        MergeFormats.mergeSubSup(dom, format, vars, node);
        MergeFormats.mergeSiblings(dom, format, vars, node);
      }
    });
  };

  const selectedNode = selection.getNode();
  if (dom.getContentEditable(selectedNode) === 'false') {
    node = selectedNode;
    let formatApplied = false;
    for (let i = 0, l = formatList.length; i < l; i++) {
      const formatItem = formatList[i];
      if (formatItem.ceFalseOverride && FormatUtils.isSelectorFormat(formatItem) && dom.is(node, formatItem.selector)) {
        setElementFormat(node as Element, formatItem);
        formatApplied = true;
        break;
      }
    }

    if (formatApplied || !FormatUtils.isWrappableNoneditable(dom, node)) {
      Events.fireFormatApply(ed, name, selectedNode, vars);
      return;
    }
  }

  if (format) {
    if (node) {
      if (FormatUtils.isNode(node)) {
        if (!applyNodeStyle(formatList, node)) {
          const rng = dom.createRng();
          rng.setStartBefore(node);
          rng.setEndAfter(node);
          applyRngStyle(dom, ExpandRange.expandRng(ed, rng, formatList), true);
        }
      } else {
        applyRngStyle(dom, node, true);
      }
    } else {
      if (!isCollapsed || !FormatUtils.isInlineFormat(format) || TableCellSelection.getCellsFromEditor(ed).length) {
        // Apply formatting to selection
        selection.setRng(RangeNormalizer.normalize(selection.getRng()));
        SelectionUtils.preserve(selection, true, () => {
          SelectionUtils.runOnRanges(ed, (selectionRng, fake) => {
            const expandedRng = fake ? selectionRng : ExpandRange.expandRng(ed, selectionRng, formatList);
            applyRngStyle(dom, expandedRng, false);
          });
        });

        FormatUtils.moveStart(dom, selection, selection.getRng());
        ed.nodeChanged();
      } else {
        CaretFormat.applyCaretFormat(ed, name, vars);
      }
    }

    Hooks.postProcess(name, ed);
  }
  Events.fireFormatApply(ed, name, node, vars);
};

export {
  applyFormat
};
