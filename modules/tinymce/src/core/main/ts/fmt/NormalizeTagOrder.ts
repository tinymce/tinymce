import { Arr, Optional, Type } from '@ephox/katamari';
import { Compare, Insert, PredicateFilter, Remove, Replication, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import type DOMUtils from '../api/dom/DOMUtils';
import type Editor from '../api/Editor';
import type Formatter from '../api/Formatter';
import * as NodeStructureBookmark from '../bookmark/NodeStructureBookmark';

import * as ApplyElementFormat from './ApplyElementFormat';
import * as FormatTypes from './FormatTypes';
import * as MatchFormat from './MatchFormat';
import * as RemoveFormat from './RemoveFormat';

interface WrapperData {
  readonly container: SugarElement<Element>;
  readonly innerWrapper: SugarElement<Element>;
  readonly outerWrappers: SugarElement<Element>[];
}

const fontSizeAlteringFormats = [ 'fontsize', 'subscript', 'superscript' ] as const;
const formatsToActOn = [ 'strikethrough', ...fontSizeAlteringFormats ] as const;

const hasFormat = (formatter: Formatter, el: SugarElement<Node>, format: string): el is SugarElement<Element> =>
  Type.isNonNullable(formatter.matchNode(el.dom, format, {}, format === 'fontsize'));

const isFontSizeAlteringElement = (formatter: Formatter, el: SugarElement<Node>): el is SugarElement<Element> =>
  Arr.exists(fontSizeAlteringFormats, (format) => hasFormat(formatter, el, format));

const isNormalizingFormat = (format: string) => Arr.contains(formatsToActOn, format);

const gatherWrapperData = (
  isRoot: (node: SugarElement<Node>) => boolean,
  scope: SugarElement<Element>,
  hasFormat: (el: SugarElement<Element>) => boolean,
  createFormatElement: (el: SugarElement<Element>) => SugarElement<Element>,
  removeFormatFromElement: (el: SugarElement<Element>) => Optional<SugarElement<Element>>
): Optional<WrapperData> => {
  const parents = Traverse.parents(scope, isRoot).filter(SugarNode.isElement);

  return Arr.findLastIndex(parents, hasFormat).map((index) => {
    const container = parents[index];
    const innerWrapper = createFormatElement(container);
    const outerWrappers = [
      ...removeFormatFromElement(Replication.shallow(container)).toArray(),
      ...Arr.bind(parents.slice(0, index), (wrapper) => {
        if (hasFormat(wrapper)) {
          return removeFormatFromElement(wrapper).toArray();
        } else {
          return [ Replication.shallow(wrapper) ];
        }
      })
    ];

    return { container, innerWrapper, outerWrappers };
  });
};

const wrapChildrenInInnerWrapper = (
  target: SugarElement<Element>,
  wrapper: SugarElement<Element>,
  hasFormat: (el: SugarElement<Node>) => boolean,
  removeFormatFromElement: (el: SugarElement<Element>) => Optional<SugarElement<Element>>
) => {
  Arr.each(Traverse.children(target), (child) => {
    if (SugarNode.isElement(child) && hasFormat(child)) {
      if (removeFormatFromElement(child).isNone()) {
        Remove.unwrap(child);
      }
    }
  });

  Arr.each(Traverse.children(target), (child) => Insert.append(wrapper, child));

  Insert.prepend(target, wrapper);
};

const wrapInOuterWrappers = (target: SugarElement<Element>, wrappers: SugarElement<Element>[]) => {
  if (wrappers.length > 0) {
    const outermost = wrappers[wrappers.length - 1];
    Insert.before(target, outermost);

    const innerMost = Arr.foldl(wrappers.slice(0, wrappers.length - 1), (acc, wrapper) => {
      Insert.append(acc, wrapper);
      return wrapper;
    }, outermost);

    Insert.append(innerMost, target);
  }
};

const normalizeFontSizeElementsInternal = (
  domUtils: DOMUtils,
  fontSizeElements: SugarElement<Element>[],
  hasFormat: (el: SugarElement<Node>) => boolean,
  createFormatElement: (el: SugarElement<Element>) => SugarElement<Element>,
  removeFormatFromElement: (el: SugarElement<Element>) => Optional<SugarElement<Element>>
): void => {
  const isRoot = (el: SugarElement<Node>) => Compare.eq(SugarElement.fromDom(domUtils.getRoot()), el) || domUtils.isBlock(el.dom);

  Arr.each(fontSizeElements, (fontSizeElement) => {
    gatherWrapperData(
      isRoot,
      fontSizeElement,
      hasFormat,
      createFormatElement,
      removeFormatFromElement
    ).each(({ container, innerWrapper, outerWrappers }) => {
      domUtils.split(container.dom, fontSizeElement.dom);
      wrapChildrenInInnerWrapper(fontSizeElement, innerWrapper, hasFormat, removeFormatFromElement);
      wrapInOuterWrappers(fontSizeElement, outerWrappers);
    });
  });
};

const normalizeFontSizeElementsWithFormat = (
  editor: Editor,
  formatName: string,
  fontSizeElements: SugarElement<Element>[]
): void => {
  const hasFormat = (el: SugarElement<Node>) => Type.isNonNullable(MatchFormat.matchNode(editor, el.dom, formatName));

  const createFormatElement = (el: SugarElement<Element>) => {
    const newEl = SugarElement.fromTag(SugarNode.name(el));
    const format = MatchFormat.matchNode(editor, el.dom, formatName, {});

    if (Type.isNonNullable(format) && FormatTypes.isApplyFormat(format)) {
      ApplyElementFormat.setElementFormat(editor, newEl.dom, format);
    }

    return newEl;
  };

  const removeFormatFromElement = (el: SugarElement<Element>) => {
    const format = MatchFormat.matchNode(editor, el.dom, formatName, {});

    if (Type.isNonNullable(format)) {
      return RemoveFormat.removeFormatOnElement(editor, format, {}, el.dom).map(SugarElement.fromDom);
    } else {
      return Optional.some(el);
    }
  };

  const bookmark = NodeStructureBookmark.createBookmark(editor.selection.getRng());
  normalizeFontSizeElementsInternal(editor.dom, fontSizeElements, hasFormat, createFormatElement, removeFormatFromElement);
  editor.selection.setRng(NodeStructureBookmark.resolveBookmark(bookmark));
};

const collectFontSizeElements = (formatter: Formatter, wrappers: SugarElement<Element>[]) =>
  Arr.bind(wrappers, (wrapper) => {
    const fontSizeDescendants = PredicateFilter.descendants(wrapper, (el) => isFontSizeAlteringElement(formatter, el));
    return isFontSizeAlteringElement(formatter, wrapper) ? [ wrapper, ...fontSizeDescendants ] : fontSizeDescendants;
  });

export const normalizeFontSizeElementsAfterApply = (editor: Editor, appliedFormat: string, wrappers: SugarElement<Element>[]): void => {
  if (isNormalizingFormat(appliedFormat)) {
    const fontSizeElements = collectFontSizeElements(editor.formatter, wrappers);
    normalizeFontSizeElementsWithFormat(editor, 'strikethrough', fontSizeElements);
  }
};

export const normalizeElements = (editor: Editor, elements: SugarElement<Element>[]): void => {
  const fontSizeElements = Arr.filter(elements, (el) => isFontSizeAlteringElement(editor.formatter, el));
  normalizeFontSizeElementsWithFormat(editor, 'strikethrough', fontSizeElements);
};

