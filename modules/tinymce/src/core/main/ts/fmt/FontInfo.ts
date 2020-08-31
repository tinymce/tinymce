/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional, Fun, Optionals } from '@ephox/katamari';
import { Attribute, Css, SugarElement, SugarNode, Traverse, TransformFind, Compare, PredicateFilter } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import * as RangeWalk from '../selection/RangeWalk';
import { isNode } from './FormatUtils';

export type FontProp = 'font-size' | 'font-family';

const legacyPropNames: Record<FontProp, string> = {
  'font-size': 'size',
  'font-family': 'face'
};

// Problem: Need a solution that handles detecting a style on a node whether that be a specified or computed style
// One of the challenges is figuring out whether an elment is being styled from a specified style either on the element itself or a parent or whether
// it is coming from a computed style specified in content_css
// Strategy: The strategy for below is to get the computed style for the element in question and then attempt to find the closest specified style
// The specified style may not be in the same format (e.g. px) that the computed style is in.
// Therefore, can get the computed style on the element for which the specifed style was found to make sure the specified style is represented in the same format as the computed style
// If the the specified style and the computed style are the same, it can be confirmed with reasonable certainty that the style is coming from specified style
// and not from a computed style. There are exceptions to this which are noted below
// Limitations:
// - If a font size was specified as 1em in content_css there is no way to retrieve it as 1em i.e. the computed style will be in px
// - It is possible that a specified style has an 'em' value that equals the same in px as the computed px for the element being looked at
//   As a result, the 'em' value will be retrieved when it should be a px value
// - These are unavoidable issues though until a better CSS model is available on all browsers - https://developers.google.com/web/updates/2018/03/cssom
const getFontProp = (dom: DOMUtils, propName: FontProp, isRoot: (elm: SugarElement) => boolean) => (elm: SugarElement): Optional<string> => {
  const elmOpt = Optional.from(elm)
    .bind((el) => SugarNode.isText(el) ? Traverse.parent(el) : Optional.some(el))
    .filter(SugarNode.isElement);

  const computedOpt = elmOpt.bind((el) => getComputedFontProp(dom, propName, el.dom));

  const specifiedOpt = elmOpt.bind((el) => TransformFind.closest(el, (e) => getSpecifiedFontProp(propName, e)
    .bind((specifiedFont) => getComputedFontProp(dom, propName, e.dom as Element).map((computedSpecifedFont) => ({
      specifiedFont,
      computedSpecifedFont
    }))), isRoot)
  );

  return Optionals.lift2(computedOpt, specifiedOpt, (computed, specified) =>
    computed === specified.computedSpecifedFont ? specified.specifiedFont : computed
  ).or(computedOpt);
};

const collect = (dom: DOMUtils, rngOrNode: Range | Node, rootNode: Element, propName: FontProp): string[] => {
  const collector: Record<string, boolean> = {};

  const isRoot = (elm: SugarElement) => Compare.eq(SugarElement.fromDom(rootNode), elm);
  const getFont = getFontProp(dom, propName, isRoot);

  const process = (nodes: ArrayLike<Node>) => {
    Arr.each(nodes, (node) => {
      const sugarNode = SugarElement.fromDom(node);
      const descendants = PredicateFilter.descendants(sugarNode, Fun.always);

      Arr.each([ sugarNode, ...descendants ], (el) => {
        getFont(el)
          .filter((value) => !Obj.has(collector, value))
          .each((value) => {
            collector[value] = true;
          });
      });
    });
  };

  if (isNode(rngOrNode)) {
    process([ rngOrNode ]);
  } else {
    RangeWalk.walk(dom, rngOrNode, (nodes) => {
      process(nodes);
    });
  }

  return Obj.keys(collector);
};

const round = (number: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = (fontSize: string, precision?: number) => {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  }
  return fontSize;
};

const normalizeFontFamily = (fontFamily: string) =>
  // 'Font name', Font -> Font name,Font
  fontFamily.replace(/[\'\"\\]/g, '').replace(/,\s+/g, ',');

const getSpecifiedFontProp = (propName: FontProp, elm: SugarElement): Optional<string> =>
  Css.getRaw(elm, propName).orThunk(() => {
    if (SugarNode.name(elm) === 'font') {
      return Obj.get(legacyPropNames, propName).bind((legacyPropName) => Attribute.getOpt(elm, legacyPropName));
    } else {
      return Optional.none();
    }
  });

const getComputedFontProp = (dom: DOMUtils, propName: FontProp, elm: Element): Optional<string> =>
  Optional.from(dom.getStyle(elm, propName, true));

const getFontInfo = (propName: FontProp, normalize: (str: string) => string) => (dom: DOMUtils, rootNode: Element, rngOrNode: Range | Node) => {
  const fontProps = Arr.map(collect(dom, rngOrNode, rootNode, propName), normalize);
  // If there is more than one font prop found, cannot declare that there is a single font
  return fontProps.length === 1 ? fontProps[0] : '';
};

const getFontSize = getFontInfo('font-size', Fun.identity);

const getFontFamily = getFontInfo('font-family', normalizeFontFamily);

export {
  getFontSize,
  getFontFamily,
  toPt
};
