/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional, Fun } from '@ephox/katamari';
import { Attribute, Css, SugarElement, SugarNode } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';
import * as NodeType from '../dom/NodeType';
import * as RangeWalk from '../selection/RangeWalk';
import { isNode } from './FormatUtils';

export type FontProp = 'font-size' | 'font-family';

const legacyPropNames: Record<FontProp, string> = {
  'font-size': 'size',
  'font-family': 'face'
};

const collect = (dom: DOMUtils, rngOrNode: Range | Node, rootNode: Element, propName: FontProp): string[] => {
  const collector: Record<string, boolean> = {};

  const process = (nodes: ArrayLike<Node>, root: Node, getComputed: boolean) => {
    Arr.each(nodes, (node) => {
      const matches = dom.getParents(node, '*[style],font', root);
      Arr.findMap(matches, (match) => getSpecifiedFontProp(propName, SugarElement.fromDom(match)))
        .orThunk(() => {
          // Cannot find computed style on text node so have to get parent node if required
          const elm = NodeType.isText(node) ? dom.getParent(node, '*', rootNode) : node as Element;
          return getComputed ? getComputedFontProp(propName, elm) : Optional.none();
        })
        .filter((value) => !Obj.has(collector, value))
        .each((value) => {
          collector[value] = true;
        });

      // Don't need to worry about potentially getting the computed value for children as if no fonts are found on the child,
      // it will inherit the 'node' font value which may be computed
      process(node.childNodes, node, false);
    });
  };

  if (isNode(rngOrNode)) {
    process([ rngOrNode ], rootNode, true);
  } else {
    RangeWalk.walk(dom, rngOrNode, (nodes) => {
      process(nodes, rootNode, true);
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

const getComputedFontProp = (propName: FontProp, elm: Element): Optional<string> =>
  Optional.from(DOMUtils.DOM.getStyle(elm, propName, true));

const getFontInfo = (propName: FontProp, normalize: (str: string) => string) => (rootNode: Element, rngOrNode: Range | Node) => {
  const fontProps = Arr.map(collect(DOMUtils.DOM, rngOrNode, rootNode, propName), normalize);
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
